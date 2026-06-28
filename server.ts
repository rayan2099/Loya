import express from "express";
import path from "path";
import fs from "fs";
import crypto from "crypto";
import "dotenv/config";
import { createServer as createViteServer } from "vite";
import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { Business, Customer, Scan, Reward, Owner, DashboardStats } from "./src/types";

const app = express();
const PORT = Number(process.env.PORT || 3000);
const SESSION_SECRET = process.env.SESSION_SECRET || "local-dev-change-me";
const DEFAULT_CASHIER_PIN = process.env.DEFAULT_CASHIER_PIN || "1234";
const IS_PRODUCTION = process.env.NODE_ENV === "production";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const USE_SUPABASE = Boolean(SUPABASE_URL && SUPABASE_ANON_KEY && SUPABASE_SERVICE_ROLE_KEY);

if (IS_PRODUCTION && SESSION_SECRET === "local-dev-change-me") {
  throw new Error("SESSION_SECRET must be set in production.");
}

app.use(express.json());

const supabaseAdmin: SupabaseClient | null = USE_SUPABASE
  ? createClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

const supabaseAnon: SupabaseClient | null = USE_SUPABASE
  ? createClient(SUPABASE_URL!, SUPABASE_ANON_KEY!, {
      auth: { autoRefreshToken: false, persistSession: false }
    })
  : null;

// Path to data file
const DATA_DIR = path.join(process.cwd(), "data");
const DB_FILE = path.join(DATA_DIR, "db.json");

// Define DB Schema structure
interface DBState {
  owners: Owner[];
  businesses: Business[];
  customers: Customer[];
  scans: Scan[];
  rewards: Reward[];
}

type TokenPayload = {
  ownerId: string;
  email: string;
  exp: number;
};

function base64Url(input: string | Buffer): string {
  return Buffer.from(input).toString("base64url");
}

function signToken(payload: TokenPayload): string {
  const encodedPayload = base64Url(JSON.stringify(payload));
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  return `${encodedPayload}.${signature}`;
}

function verifyToken(token: string): TokenPayload | null {
  const [encodedPayload, signature] = token.split(".");
  if (!encodedPayload || !signature) return null;

  const expectedSignature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(encodedPayload)
    .digest("base64url");

  const received = Buffer.from(signature);
  const expected = Buffer.from(expectedSignature);
  if (received.length !== expected.length || !crypto.timingSafeEqual(received, expected)) {
    return null;
  }

  try {
    const payload = JSON.parse(Buffer.from(encodedPayload, "base64url").toString("utf8")) as TokenPayload;
    if (!payload.ownerId || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

function hashSecret(secret: string, salt = crypto.randomBytes(16).toString("hex")): string {
  const hash = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifySecret(secret: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(secret, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

// Generate random claim codes
function generateClaimCode(prefix: 'W' | 'S'): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // clear of O, I, 1, 0 typos
  let code = prefix;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return code;
}

function generateUniqueClaimCode(dbState: DBState, prefix: "W" | "S"): string {
  let code = generateClaimCode(prefix);
  while (dbState.rewards.some(r => r.claim_code === code)) {
    code = generateClaimCode(prefix);
  }
  return code;
}

async function generateUniqueSupabaseClaimCode(prefix: "W" | "S"): Promise<string> {
  if (!supabaseAdmin) throw new Error("Supabase is not configured.");

  let code = generateClaimCode(prefix);
  for (let i = 0; i < 12; i++) {
    const { data, error } = await supabaseAdmin
      .from("rewards")
      .select("id")
      .eq("claim_code", code)
      .maybeSingle();

    if (error) throw error;
    if (!data) return code;
    code = generateClaimCode(prefix);
  }

  throw new Error("Could not generate a unique claim code.");
}

function requireSupabase() {
  if (!supabaseAdmin || !supabaseAnon) {
    throw new Error("Supabase is not configured.");
  }
  return { supabaseAdmin, supabaseAnon };
}

function sendServerError(res: express.Response, error: unknown, fallback = "Server error") {
  console.error(error);
  const message = error instanceof Error ? error.message : fallback;
  res.status(500).json({ error: message || fallback });
}

const rateLimitBuckets = new Map<string, { count: number; resetAt: number }>();

function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const current = rateLimitBuckets.get(key);
  if (!current || current.resetAt <= now) {
    rateLimitBuckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= maxRequests;
}

// Helper to load/save database state
function loadDB(): DBState {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }

  if (!fs.existsSync(DB_FILE)) {
    const initialState = getSeedData();
    fs.writeFileSync(DB_FILE, JSON.stringify(initialState, null, 2), "utf8");
    return initialState;
  }

  try {
    const data = fs.readFileSync(DB_FILE, "utf8");
    const parsed = JSON.parse(data) as DBState;
    let needsSave = false;

    parsed.owners = parsed.owners.map(owner => {
      if (owner.password_hash) return owner;
      needsSave = true;
      return {
        ...owner,
        password_hash: owner.email === "demo@loya.sa" ? hashSecret("password123") : hashSecret(crypto.randomBytes(24).toString("hex"))
      };
    });

    parsed.businesses = parsed.businesses.map(business => {
      if (business.cashier_pin_hash) return business;
      needsSave = true;
      return { ...business, cashier_pin_hash: hashSecret(DEFAULT_CASHIER_PIN) };
    });

    if (needsSave) saveDB(parsed);
    return parsed;
  } catch (error) {
    console.error("Error reading db.json, returning seed data", error);
    return getSeedData();
  }
}

function saveDB(state: DBState) {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    fs.writeFileSync(DB_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch (error) {
    console.error("Error saving db.json", error);
  }
}

// Full premium pre-seed data
function getSeedData(): DBState {
  const now = new Date();
  
  // Helper to get ISO date string relative to now
  const relativeDate = (daysAgo: number, hoursOffset: number = 0) => {
    const d = new Date(now);
    d.setDate(d.getDate() - daysAgo);
    d.setHours(d.getHours() - hoursOffset);
    return d.toISOString();
  };

  const seedOwners: Owner[] = [
    {
      id: "owner-demo",
      email: "demo@loya.sa",
      business_id: "business-demo",
      password_hash: hashSecret("password123"),
      phone: "0500000000"
    }
  ];

  const seedBusinesses: Business[] = [
    {
      id: "business-demo",
      owner_id: "owner-demo",
      name_ar: "بـويلر كافيه",
      name_en: "Boiler Cafe",
      slug: "boiler-coffee",
      logo_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80",
      primary_color: "#8b5cf6", // Purple-500
      secondary_color: "#f59e0b", // Amber-500
      business_type: "coffee",
      win_probability: 35, // 35% chance
      stamps_required: 5,
      reward_ar: "كوب قهوة مجاني فاخر ☕",
      reward_en: "Free Premium Latte ☕",
      cashier_pin_hash: hashSecret(DEFAULT_CASHIER_PIN),
      is_active: true,
      created_at: relativeDate(15)
    }
  ];

  const seedCustomers: Customer[] = [
    {
      id: "cust-1",
      business_id: "business-demo",
      name: "فهد العتيبي",
      phone: "0501234567",
      stamps: 3,
      total_scans: 13,
      created_at: relativeDate(12)
    },
    {
      id: "cust-2",
      business_id: "business-demo",
      name: "سارة أحمد",
      phone: "0559876543",
      stamps: 1,
      total_scans: 6,
      created_at: relativeDate(9)
    },
    {
      id: "cust-3",
      business_id: "business-demo",
      name: "خالد منصور",
      phone: "0542223334",
      stamps: 4,
      total_scans: 4,
      created_at: relativeDate(5)
    },
    {
      id: "cust-4",
      business_id: "business-demo",
      name: "ريم عبدالله",
      phone: "0563334445",
      stamps: 0,
      total_scans: 15,
      created_at: relativeDate(11)
    }
  ];

  const seedScans: Scan[] = [];
  const seedRewards: Reward[] = [];

  // Generate some premium historical data over the last 7 days
  const scanDistribution = [
    { daysAgo: 6, count: 8, wins: 3 },
    { daysAgo: 5, count: 12, wins: 4 },
    { daysAgo: 4, count: 9, wins: 2 },
    { daysAgo: 3, count: 15, wins: 5 },
    { daysAgo: 2, count: 7, wins: 2 },
    { daysAgo: 1, count: 11, wins: 4 },
    { daysAgo: 0, count: 4, wins: 1 }
  ];

  let scanIdCounter = 1;
  let rewardIdCounter = 1;

  scanDistribution.forEach(({ daysAgo, count, wins }) => {
    for (let i = 0; i < count; i++) {
      const isWin = i < wins;
      const custIndex = (scanIdCounter % seedCustomers.length);
      const customer = seedCustomers[custIndex];
      const scanDate = relativeDate(daysAgo, i * 2);

      const scan: Scan = {
        id: `scan-${scanIdCounter}`,
        business_id: "business-demo",
        customer_id: customer.id,
        won: isWin,
        reward_claimed: isWin ? (daysAgo > 1) : false, // older ones claimed
        created_at: scanDate
      };
      seedScans.push(scan);

      if (isWin) {
        const reward: Reward = {
          id: `reward-${rewardIdCounter}`,
          business_id: "business-demo",
          customer_id: customer.id,
          scan_id: scan.id,
          type: "lottery_win",
          claimed: daysAgo > 1, // older ones already marked as claimed by cashier
          claim_code: generateClaimCode('W'),
          created_at: scanDate
        };
        seedRewards.push(reward);
        rewardIdCounter++;
      }

      // Also simulate stamp reward once in a while
      if (scanIdCounter % 10 === 0) {
        const reward: Reward = {
          id: `reward-${rewardIdCounter}`,
          business_id: "business-demo",
          customer_id: customer.id,
          scan_id: scan.id,
          type: "stamp_reward",
          claimed: daysAgo > 2,
          claim_code: generateClaimCode('S'),
          created_at: scanDate
        };
        seedRewards.push(reward);
        rewardIdCounter++;
      }

      scanIdCounter++;
    }
  });

  return {
    owners: seedOwners,
    businesses: seedBusinesses,
    customers: seedCustomers,
    scans: seedScans,
    rewards: seedRewards
  };
}

// Initialize database
let db = loadDB();

// ---------------- API ENDPOINTS ----------------

// Helper to verify business ownership
async function getLoggedInOwner(req: express.Request): Promise<Owner | null> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  const tokenPayload = verifyToken(token);
  if (USE_SUPABASE && tokenPayload) {
    const { supabaseAdmin } = requireSupabase();
    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .select("id, owner_id")
      .eq("owner_id", tokenPayload.ownerId)
      .maybeSingle();

    if (error || !business) return null;
    return {
      id: tokenPayload.ownerId,
      email: tokenPayload.email,
      business_id: business.id
    };
  }

  const dbState = loadDB();
  const owner = tokenPayload
    ? dbState.owners.find(o => o.id === tokenPayload.ownerId)
    : dbState.owners.find(o => o.id === token || o.email === token);
  return owner || null;
}

function createOwnerSession(owner: Owner): string {
  return signToken({
    ownerId: owner.id,
    email: owner.email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14
  });
}

function publicOwner(owner: Owner): Omit<Owner, "password_hash"> {
  const { password_hash, ...safeOwner } = owner;
  return safeOwner;
}

function publicBusiness(business: Business): Omit<Business, "cashier_pin_hash"> {
  const { cashier_pin_hash, ...safeBusiness } = business;
  return safeBusiness;
}

// 1. Authenticated User Endpoint
app.get("/api/auth/me", async (req, res) => {
  const owner = await getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data: business, error } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .eq("owner_id", owner.id)
        .maybeSingle();

      if (error) throw error;
      return res.json({
        owner: publicOwner(owner),
        business: business ? publicBusiness(business as Business) : null
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.owner_id === owner.id);
  res.json({
    owner: publicOwner(owner),
    business: business ? publicBusiness(business) : null
  });
});

// 2. Register Owner + Business
app.post("/api/auth/register", async (req, res) => {
  const { email, password, name_ar, name_en, business_type, phone } = req.body;
  if (!email || !password || !name_en || !name_ar) {
    return res.status(400).json({ error: "Missing required register fields" });
  }
  if (!rateLimit(`register:${req.ip}`, 10, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many registration attempts. Please try again later." });
  }
  if (password.length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const normalizedEmail = String(email).toLowerCase().trim();

      const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
        email: normalizedEmail,
        password,
        email_confirm: true,
        user_metadata: { phone: phone ? normalizePhone(phone) : null }
      });

      if (userError) throw userError;
      if (!userData.user) throw new Error("Could not create owner account.");

      let slug = sanitizeSlug(name_en);
      if (!slug) slug = `business-${crypto.randomBytes(3).toString("hex")}`;

      let suffix = 1;
      const baseSlug = slug;
      while (true) {
        const { data: existing, error: slugError } = await supabaseAdmin
          .from("businesses")
          .select("id")
          .eq("slug", slug)
          .maybeSingle();

        if (slugError) throw slugError;
        if (!existing) break;
        slug = `${baseSlug}-${suffix}`;
        suffix++;
      }

      const { data: business, error: businessError } = await supabaseAdmin
        .from("businesses")
        .insert({
          owner_id: userData.user.id,
          name_ar,
          name_en,
          slug,
          logo_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80",
          primary_color: "#1a1a1a",
          secondary_color: "#D4AF37",
          business_type: business_type || "coffee",
          win_probability: 20,
          stamps_required: 5,
          reward_ar: "مكافأة مميزة مجانية 🎁",
          reward_en: "Free Special Reward 🎁",
          cashier_pin_hash: hashSecret(DEFAULT_CASHIER_PIN),
          is_active: true
        })
        .select("*")
        .single();

      if (businessError) {
        await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
        throw businessError;
      }

      const owner: Owner = {
        id: userData.user.id,
        email: normalizedEmail,
        business_id: business.id,
        phone: phone ? normalizePhone(phone) : undefined
      };

      return res.json({
        token: createOwnerSession(owner),
        owner: publicOwner(owner),
        business: publicBusiness(business as Business)
      });
    } catch (error: any) {
      return res.status(400).json({ error: error.message || "Could not create account." });
    }
  }

  const dbState = loadDB();
  if (dbState.owners.some(o => o.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  const ownerId = crypto.randomUUID();
  const businessId = crypto.randomUUID();
  
  // Format clean URL slug from English name
  let slug = sanitizeSlug(name_en);
  
  if (!slug) slug = `business-${crypto.randomBytes(3).toString("hex")}`;

  // Check unique slug constraint
  let suffix = 1;
  const baseSlug = slug;
  while (dbState.businesses.some(b => b.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const newOwner: Owner = {
    id: ownerId,
    email: email.toLowerCase().trim(),
    business_id: businessId,
    password_hash: hashSecret(password),
    phone: phone ? normalizePhone(phone) : undefined
  };
  const newBusiness: Business = {
    id: businessId,
    owner_id: ownerId,
    name_ar,
    name_en,
    slug,
    logo_url: "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=150&h=150&fit=crop&q=80",
    primary_color: "#1a1a1a",
    secondary_color: "#D4AF37",
    business_type: business_type || "coffee",
    win_probability: 20, // default 20
    stamps_required: 5,  // default 5
    reward_ar: "مكافأة مميزة مجانية 🎁",
    reward_en: "Free Special Reward 🎁",
    cashier_pin_hash: hashSecret(DEFAULT_CASHIER_PIN),
    is_active: true,
    created_at: new Date().toISOString()
  };

  dbState.owners.push(newOwner);
  dbState.businesses.push(newBusiness);
  saveDB(dbState);

  res.json({
    token: createOwnerSession(newOwner),
    owner: publicOwner(newOwner),
    business: publicBusiness(newBusiness)
  });
});

// 3. Login Owner
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!rateLimit(`login:${req.ip}:${String(email).toLowerCase()}`, 12, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAnon, supabaseAdmin } = requireSupabase();
      const normalizedEmail = String(email).toLowerCase().trim();
      const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
        email: normalizedEmail,
        password
      });

      if (authError || !authData.user) {
        return res.status(400).json({ error: "Invalid email or password." });
      }

      const { data: business, error: businessError } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .eq("owner_id", authData.user.id)
        .maybeSingle();

      if (businessError) throw businessError;
      if (!business) return res.status(404).json({ error: "Business record not found." });

      const owner: Owner = {
        id: authData.user.id,
        email: authData.user.email || normalizedEmail,
        business_id: business.id,
        phone: authData.user.user_metadata?.phone
      };

      return res.json({
        token: createOwnerSession(owner),
        owner: publicOwner(owner),
        business: publicBusiness(business as Business)
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const owner = dbState.owners.find(o => o.email.toLowerCase() === email.toLowerCase());
  
  if (!owner || !verifySecret(password, owner.password_hash)) {
    return res.status(400).json({ error: "Invalid email or password." });
  }

  const business = dbState.businesses.find(b => b.owner_id === owner.id);
  res.json({
    token: createOwnerSession(owner),
    owner: publicOwner(owner),
    business: business ? publicBusiness(business) : null
  });
});

// 4. Get Business Details by Slug (Public)
app.get("/api/business/:slug", async (req, res) => {
  const { slug } = req.params;
  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data: business, error } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .eq("slug", slug.toLowerCase())
        .eq("is_active", true)
        .maybeSingle();

      if (error) throw error;
      if (!business) return res.status(404).json({ error: "Business not found" });
      return res.json(publicBusiness(business as Business));
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.slug.toLowerCase() === slug.toLowerCase());
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }
  res.json(publicBusiness(business));
});

// 5. Update Business Settings (Private)
app.put("/api/business", async (req, res) => {
  const owner = await getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { cashier_pin, cashier_pin_hash, owner_id, id, created_at, ...updatedData } = req.body;

      if (updatedData.slug) {
        updatedData.slug = sanitizeSlug(updatedData.slug);
        if (!updatedData.slug) {
          return res.status(400).json({ error: "Slug must contain letters or numbers." });
        }

        const { data: slugOwner, error: slugError } = await supabaseAdmin
          .from("businesses")
          .select("id")
          .eq("slug", updatedData.slug)
          .neq("id", owner.business_id)
          .maybeSingle();

        if (slugError) throw slugError;
        if (slugOwner) return res.status(400).json({ error: "This URL slug is already taken." });
      }

      const updatePayload = {
        ...updatedData,
        ...(cashier_pin ? { cashier_pin_hash: hashSecret(String(cashier_pin)) } : {}),
        win_probability: Math.min(100, Math.max(1, Number(updatedData.win_probability ?? 20))),
        stamps_required: Math.min(50, Math.max(1, Number(updatedData.stamps_required ?? 5)))
      };

      const { data: business, error } = await supabaseAdmin
        .from("businesses")
        .update(updatePayload)
        .eq("id", owner.business_id)
        .eq("owner_id", owner.id)
        .select("*")
        .single();

      if (error) throw error;
      return res.json(publicBusiness(business as Business));
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const bIndex = dbState.businesses.findIndex(b => b.id === owner.business_id);
  if (bIndex === -1) {
    return res.status(404).json({ error: "Business record not found" });
  }

  const originalSlug = dbState.businesses[bIndex].slug;
  const { cashier_pin, cashier_pin_hash, owner_id, id, created_at, ...updatedData } = req.body;

  // Validate unique slug
  if (updatedData.slug && updatedData.slug !== originalSlug) {
    updatedData.slug = sanitizeSlug(updatedData.slug);
    if (!updatedData.slug) {
      return res.status(400).json({ error: "Slug must contain letters or numbers." });
    }
    const slugExists = dbState.businesses.some(
      b => b.id !== owner.business_id && b.slug.toLowerCase() === updatedData.slug.toLowerCase()
    );
    if (slugExists) {
      return res.status(400).json({ error: "This URL slug is already taken." });
    }
  }

  dbState.businesses[bIndex] = {
    ...dbState.businesses[bIndex],
    ...updatedData,
    ...(cashier_pin ? { cashier_pin_hash: hashSecret(String(cashier_pin)) } : {}),
    win_probability: Math.min(100, Math.max(1, Number(updatedData.win_probability ?? dbState.businesses[bIndex].win_probability))),
    stamps_required: Math.min(50, Math.max(1, Number(updatedData.stamps_required ?? dbState.businesses[bIndex].stamps_required))),
    id: owner.business_id, // prevent id modifications
    owner_id: owner.id
  };

  saveDB(dbState);
  res.json(publicBusiness(dbState.businesses[bIndex]));
});

// 6. Execute Customer Scan (Public) - Lottery Win and stamp progression calculation
app.post("/api/scan", async (req, res) => {
  const { business_id, phone, name } = req.body;
  if (!business_id || !phone || !name) {
    return res.status(400).json({ error: "Business ID, phone number and customer name are required" });
  }
  const cleanPhone = normalizePhone(phone);
  if (!rateLimit(`scan:${business_id}:${cleanPhone || req.ip}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many scans. Please wait before trying again." });
  }
  if (cleanPhone.length < 8 || cleanPhone.length > 16) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data: business, error: businessError } = await supabaseAdmin
        .from("businesses")
        .select("*")
        .eq("id", business_id)
        .maybeSingle();

      if (businessError) throw businessError;
      if (!business) return res.status(404).json({ error: "Business not found" });
      if (!business.is_active) {
        return res.status(403).json({ error: "This loyalty campaign is currently inactive." });
      }

      const scanDate = new Date().toISOString();
      const { data: existingCustomer, error: customerLookupError } = await supabaseAdmin
        .from("customers")
        .select("*")
        .eq("business_id", business_id)
        .eq("phone", cleanPhone)
        .maybeSingle();

      if (customerLookupError) throw customerLookupError;

      let customer = existingCustomer as Customer | null;
      if (!customer) {
        const { data: insertedCustomer, error: insertCustomerError } = await supabaseAdmin
          .from("customers")
          .insert({
            business_id,
            phone: cleanPhone,
            name: name.trim(),
            stamps: 0,
            total_scans: 0
          })
          .select("*")
          .single();

        if (insertCustomerError) throw insertCustomerError;
        customer = insertedCustomer as Customer;
      }

      const oldStamps = customer.stamps;
      const randVal = crypto.randomInt(1, 101);
      const wonLottery = randVal <= business.win_probability;
      const newScanPayload = {
        business_id,
        customer_id: customer.id,
        won: wonLottery,
        reward_claimed: false,
        created_at: scanDate
      };

      const { data: scan, error: scanError } = await supabaseAdmin
        .from("scans")
        .insert(newScanPayload)
        .select("*")
        .single();

      if (scanError) throw scanError;

      const rewardsEarned: Reward[] = [];
      if (wonLottery) {
        const { data: reward, error: rewardError } = await supabaseAdmin
          .from("rewards")
          .insert({
            business_id,
            customer_id: customer.id,
            scan_id: scan.id,
            type: "lottery_win",
            claimed: false,
            claim_code: await generateUniqueSupabaseClaimCode("W"),
            created_at: scanDate
          })
          .select("*")
          .single();

        if (rewardError) throw rewardError;
        rewardsEarned.push(reward as Reward);
      }

      let newStamps = oldStamps + 1;
      let wonStampReward = false;
      if (newStamps >= business.stamps_required) {
        wonStampReward = true;
        newStamps = 0;
        const { data: reward, error: rewardError } = await supabaseAdmin
          .from("rewards")
          .insert({
            business_id,
            customer_id: customer.id,
            scan_id: scan.id,
            type: "stamp_reward",
            claimed: false,
            claim_code: await generateUniqueSupabaseClaimCode("S"),
            created_at: scanDate
          })
          .select("*")
          .single();

        if (rewardError) throw rewardError;
        rewardsEarned.push(reward as Reward);
      }

      const { data: updatedCustomer, error: updateCustomerError } = await supabaseAdmin
        .from("customers")
        .update({
          name: name.trim(),
          stamps: newStamps,
          total_scans: customer.total_scans + 1
        })
        .eq("id", customer.id)
        .select("*")
        .single();

      if (updateCustomerError) throw updateCustomerError;

      return res.json({
        scan,
        customer: updatedCustomer,
        rewards: rewardsEarned,
        wonLottery,
        wonStampReward,
        stampsEarned: 1,
        oldStamps,
        currentStamps: updatedCustomer.stamps,
        stampsRequired: business.stamps_required
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.id === business_id);
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }
  if (!business.is_active) {
    return res.status(403).json({ error: "This loyalty campaign is currently inactive." });
  }

  // Get or Create Customer (unique by phone + business_id)
  let customer = dbState.customers.find(
    c => c.business_id === business_id && normalizePhone(c.phone) === cleanPhone
  );

  const isFirstTime = !customer;
  const scanDate = new Date().toISOString();

  if (!customer) {
    customer = {
      id: crypto.randomUUID(),
      business_id,
      phone: cleanPhone,
      name: name.trim(),
      stamps: 0,
      total_scans: 0,
      created_at: scanDate
    };
    dbState.customers.push(customer);
  }

  // Record scan actions
  customer.total_scans += 1;

  // Server-side win logic based on probability
  const randVal = crypto.randomInt(1, 101); // 1-100
  const wonLottery = randVal <= business.win_probability;

  // Create scan record
  const scanId = crypto.randomUUID();
  const newScan: Scan = {
    id: scanId,
    business_id,
    customer_id: customer.id,
    won: wonLottery,
    reward_claimed: false,
    created_at: scanDate
  };
  dbState.scans.push(newScan);

  const rewardsEarned: Reward[] = [];

  // Generate Lottery Win Reward
  if (wonLottery) {
    const lReward: Reward = {
      id: crypto.randomUUID(),
      business_id,
      customer_id: customer.id,
      scan_id: scanId,
      type: "lottery_win",
      claimed: false,
      claim_code: generateUniqueClaimCode(dbState, 'W'),
      created_at: scanDate
    };
    dbState.rewards.push(lReward);
    rewardsEarned.push(lReward);
  }

  // Stamp card calculation
  const oldStamps = customer.stamps;
  let newStamps = oldStamps + 1;
  let wonStampReward = false;

  if (newStamps >= business.stamps_required) {
    wonStampReward = true;
    newStamps = 0; // reset stamp count

    const sReward: Reward = {
      id: crypto.randomUUID(),
      business_id,
      customer_id: customer.id,
      scan_id: scanId,
      type: "stamp_reward",
      claimed: false,
      claim_code: generateUniqueClaimCode(dbState, 'S'),
      created_at: scanDate
    };
    dbState.rewards.push(sReward);
    rewardsEarned.push(sReward);
  }

  customer.stamps = newStamps;

  // Save DB with updated customer details
  const cIndex = dbState.customers.findIndex(c => c.id === customer!.id);
  if (cIndex !== -1) {
    dbState.customers[cIndex] = customer;
  }

  saveDB(dbState);

  res.json({
    scan: newScan,
    customer,
    rewards: rewardsEarned,
    wonLottery,
    wonStampReward,
    stampsEarned: 1,
    oldStamps,
    currentStamps: customer.stamps,
    stampsRequired: business.stamps_required
  });
});

// 7. Get Dashboard Stats (Private)
app.get("/api/dashboard/stats", async (req, res) => {
  const owner = await getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const bid = owner.business_id;
      const [{ data: bScans, error: scansError }, { data: bCustomers, error: customersError }, { data: bRewards, error: rewardsError }] = await Promise.all([
        supabaseAdmin.from("scans").select("*").eq("business_id", bid),
        supabaseAdmin.from("customers").select("*").eq("business_id", bid),
        supabaseAdmin.from("rewards").select("*").eq("business_id", bid)
      ]);

      if (scansError) throw scansError;
      if (customersError) throw customersError;
      if (rewardsError) throw rewardsError;

      const scans = (bScans || []) as Scan[];
      const customers = (bCustomers || []) as Customer[];
      const rewards = (bRewards || []) as Reward[];
      const todayStr = new Date().toISOString().substring(0, 10);
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

      const chartData = [];
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().substring(0, 10);
        chartData.push({
          date: d.toLocaleDateString("en-US", { day: "numeric", month: "short" }),
          scans: scans.filter(s => s.created_at.substring(0, 10) === dateStr).length,
          wins: scans.filter(s => s.created_at.substring(0, 10) === dateStr && s.won).length
        });
      }

      const stats: DashboardStats = {
        totalScansAllTime: scans.length,
        totalScansToday: scans.filter(s => s.created_at.substring(0, 10) === todayStr).length,
        totalScansThisWeek: scans.filter(s => new Date(s.created_at) >= oneWeekAgo).length,
        totalCustomers: customers.length,
        totalWins: scans.filter(s => s.won).length,
        claimedRewards: rewards.filter(r => r.claimed).length,
        unclaimedRewards: rewards.filter(r => !r.claimed).length,
        chartData
      };

      return res.json(stats);
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const bid = owner.business_id;

  // Filter relevant records
  const bScans = dbState.scans.filter(s => s.business_id === bid);
  const bCustomers = dbState.customers.filter(c => c.business_id === bid);
  const bRewards = dbState.rewards.filter(r => r.business_id === bid);

  const totalScansAllTime = bScans.length;
  const totalCustomers = bCustomers.length;
  const totalWins = bScans.filter(s => s.won).length;

  // Filter scans by dates
  const todayStr = new Date().toISOString().substring(0, 10);
  const totalScansToday = bScans.filter(s => s.created_at.substring(0, 10) === todayStr).length;

  // Last 7 days scans (week count)
  const oneWeekAgo = new Date();
  oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
  const totalScansThisWeek = bScans.filter(s => new Date(s.created_at) >= oneWeekAgo).length;

  const claimedRewards = bRewards.filter(r => r.claimed).length;
  const unclaimedRewards = bRewards.filter(r => !r.claimed).length;

  // Render last 7 days chart data
  const chartData = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().substring(0, 10);
    
    const dayScans = bScans.filter(s => s.created_at.substring(0, 10) === dateStr).length;
    const dayWins = bScans.filter(s => s.created_at.substring(0, 10) === dateStr && s.won).length;

    // formatted as "Jun 27" or "27 Jun"
    const displayDate = d.toLocaleDateString('en-US', { day: 'numeric', month: 'short' });

    chartData.push({
      date: displayDate,
      scans: dayScans,
      wins: dayWins
    });
  }

  const stats: DashboardStats = {
    totalScansAllTime,
    totalScansToday,
    totalScansThisWeek,
    totalCustomers,
    totalWins,
    claimedRewards,
    unclaimedRewards,
    chartData
  };

  res.json(stats);
});

// 8. Get Dashboard Customers list (Private)
app.get("/api/dashboard/customers", async (req, res) => {
  const owner = await getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const search = (req.query.search as string || "").toLowerCase();

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      let query = supabaseAdmin
        .from("customers")
        .select("*")
        .eq("business_id", owner.business_id)
        .order("created_at", { ascending: false });

      if (search) {
        query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return res.json(data || []);
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  let bCustomers = dbState.customers.filter(c => c.business_id === owner.business_id);

  if (search) {
    bCustomers = bCustomers.filter(
      c => c.name.toLowerCase().includes(search) || c.phone.includes(search)
    );
  }

  // Sort by created_at descending
  bCustomers.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(bCustomers);
});

// 9. Get Dashboard Rewards list (Private)
app.get("/api/dashboard/rewards", async (req, res) => {
  const owner = await getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data, error } = await supabaseAdmin
        .from("rewards")
        .select("*, customers(name, phone)")
        .eq("business_id", owner.business_id)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const detailedRewards = (data || []).map((reward: any) => ({
        ...reward,
        customer_name: reward.customers?.name || "Unknown Customer",
        customer_phone: reward.customers?.phone || ""
      }));

      return res.json(detailedRewards);
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const bRewards = dbState.rewards.filter(r => r.business_id === owner.business_id);

  // Map customer names into the rewards array
  const detailedRewards = bRewards.map(reward => {
    const customer = dbState.customers.find(c => c.id === reward.customer_id);
    return {
      ...reward,
      customer_name: customer ? customer.name : "Unknown Customer",
      customer_phone: customer ? customer.phone : ""
    };
  });

  // Sort by created_at descending
  detailedRewards.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  res.json(detailedRewards);
});

// 10. Verify Claim Code (Public or Cashier)
app.get("/api/claim/:code", async (req, res) => {
  const { code } = req.params;
  if (!rateLimit(`claim-check:${req.ip}:${code}`, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many verification attempts. Please try again later." });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data, error } = await supabaseAdmin
        .from("rewards")
        .select("*, customers(name), businesses(name_ar, name_en, reward_ar, reward_en, stamps_required)")
        .eq("claim_code", code.trim().toUpperCase())
        .maybeSingle();

      if (error) throw error;
      if (!data) return res.status(404).json({ error: "Invalid claim code. Verification failed." });

      const business = data.businesses;
      return res.json({
        reward: {
          id: data.id,
          business_id: data.business_id,
          customer_id: data.customer_id,
          scan_id: data.scan_id,
          type: data.type,
          claimed: data.claimed,
          claim_code: data.claim_code,
          created_at: data.created_at,
          claimed_at: data.claimed_at
        },
        customer_name: data.customers?.name || "Customer",
        business_name_ar: business?.name_ar || "Business",
        business_name_en: business?.name_en || "Business",
        reward_name_ar: business ? (data.type === "lottery_win" ? business.reward_ar : `هدية بطاقة الـ ${business.stamps_required} أختام الكبرى ☕`) : "Reward",
        reward_name_en: business ? (data.type === "lottery_win" ? business.reward_en : `Grand Loyalty Reward (${business.stamps_required} Stamps) ☕`) : "Reward"
      });
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();

  const reward = dbState.rewards.find(r => r.claim_code.toUpperCase() === code.trim().toUpperCase());
  if (!reward) {
    return res.status(404).json({ error: "Invalid claim code. Verification failed." });
  }

  const customer = dbState.customers.find(c => c.id === reward.customer_id);
  const business = dbState.businesses.find(b => b.id === reward.business_id);

  res.json({
    reward,
    customer_name: customer ? customer.name : "Customer",
    business_name_ar: business ? business.name_ar : "Business",
    business_name_en: business ? business.name_en : "Business",
    reward_name_ar: business ? (reward.type === 'lottery_win' ? business.reward_ar : `هدية بطاقة الـ ${business.stamps_required} أختام الكبرى ☕`) : "Reward",
    reward_name_en: business ? (reward.type === 'lottery_win' ? business.reward_en : `Grand Loyalty Reward (${business.stamps_required} Stamps) ☕`) : "Reward",
  });
});

// 11. Mark Reward as Claimed (Cashier Verified Action)
app.post("/api/rewards/claim", async (req, res) => {
  const { code, pin } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }
  if (!rateLimit(`claim:${req.ip}:${code}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many claim attempts. Please try again later." });
  }

  if (USE_SUPABASE) {
    try {
      const { supabaseAdmin } = requireSupabase();
      const { data: reward, error: rewardError } = await supabaseAdmin
        .from("rewards")
        .select("*, businesses(*)")
        .eq("claim_code", code.trim().toUpperCase())
        .maybeSingle();

      if (rewardError) throw rewardError;
      if (!reward) return res.status(404).json({ error: "Claim code not found" });
      if (reward.claimed) return res.status(400).json({ error: "Reward already claimed." });

      const owner = await getLoggedInOwner(req);
      const business = reward.businesses as Business | undefined;
      if (!business) return res.status(404).json({ error: "Business record not found." });

      const ownerCanClaim = owner?.business_id === business.id;
      const pinCanClaim = pin && verifySecret(String(pin), business.cashier_pin_hash);

      if (!ownerCanClaim && !pinCanClaim) {
        return res.status(400).json({ error: "Incorrect Cashier PIN." });
      }

      const claimedAt = new Date().toISOString();
      const { data: updatedReward, error: updateRewardError } = await supabaseAdmin
        .from("rewards")
        .update({ claimed: true, claimed_at: claimedAt })
        .eq("id", reward.id)
        .select("*")
        .single();

      if (updateRewardError) throw updateRewardError;

      const { error: scanUpdateError } = await supabaseAdmin
        .from("scans")
        .update({ reward_claimed: true })
        .eq("id", reward.scan_id);

      if (scanUpdateError) throw scanUpdateError;
      return res.json({ success: true, reward: updatedReward });
    } catch (error) {
      return sendServerError(res, error);
    }
  }

  const dbState = loadDB();
  const rIndex = dbState.rewards.findIndex(r => r.claim_code.toUpperCase() === code.trim().toUpperCase());
  
  if (rIndex === -1) {
    return res.status(404).json({ error: "Claim code not found" });
  }

  if (dbState.rewards[rIndex].claimed) {
    return res.status(400).json({ error: "Reward already claimed." });
  }

  const rewardBusiness = dbState.businesses.find(b => b.id === dbState.rewards[rIndex].business_id);
  if (!rewardBusiness) {
    return res.status(404).json({ error: "Business record not found." });
  }

  const owner = await getLoggedInOwner(req);
  const ownerCanClaim = owner?.business_id === rewardBusiness.id;
  const pinCanClaim = pin && verifySecret(String(pin), rewardBusiness.cashier_pin_hash);

  if (!ownerCanClaim && !pinCanClaim) {
    return res.status(400).json({ error: "Incorrect Cashier PIN." });
  }

  // Update claim states
  dbState.rewards[rIndex].claimed = true;
  dbState.rewards[rIndex].claimed_at = new Date().toISOString();

  // Also update corresponding scan if we find it
  const sIndex = dbState.scans.findIndex(s => s.id === dbState.rewards[rIndex].scan_id);
  if (sIndex !== -1) {
    dbState.scans[sIndex].reward_claimed = true;
  }

  saveDB(dbState);
  res.json({ success: true, reward: dbState.rewards[rIndex] });
});


// ---------------- VITE MIDDLEWARE SETUP ----------------

async function startServer() {
  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Loya Server running on port ${PORT}`);
  });
}

startServer();
