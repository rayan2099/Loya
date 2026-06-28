import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";
import { Business, Customer, Scan, Reward, Owner, DashboardStats } from "./src/types";

const app = express();
const PORT = 3000;

app.use(express.json());

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

// Generate random claim codes
function generateClaimCode(prefix: 'W' | 'S'): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // clear of O, I, 1, 0 typos
  let code = prefix;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
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
    return JSON.parse(data);
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
      business_id: "business-demo"
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

// Helper to verify business ownership (Mock auth header check)
function getLoggedInOwner(req: express.Request): Owner | null {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return null;
  }
  const token = authHeader.substring(7);
  // Simple token parser: we use the email or owner-id as token
  const dbState = loadDB();
  const owner = dbState.owners.find(o => o.id === token || o.email === token);
  return owner || null;
}

// 1. Authenticated User Endpoint
app.get("/api/auth/me", (req, res) => {
  const owner = getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.owner_id === owner.id);
  res.json({ owner, business });
});

// 2. Register Owner + Business
app.post("/api/auth/register", (req, res) => {
  const { email, password, name_ar, name_en, business_type, phone } = req.body;
  if (!email || !password || !name_en || !name_ar) {
    return res.status(400).json({ error: "Missing required register fields" });
  }

  const dbState = loadDB();
  if (dbState.owners.some(o => o.email.toLowerCase() === email.toLowerCase())) {
    return res.status(400).json({ error: "Email is already registered" });
  }

  const ownerId = "owner-" + Math.random().toString(36).substr(2, 9);
  const businessId = "business-" + Math.random().toString(36).substr(2, 9);
  
  // Format clean URL slug from English name
  let slug = name_en
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  
  if (!slug) slug = "business-" + Math.random().toString(36).substr(2, 5);

  // Check unique slug constraint
  let suffix = 1;
  const baseSlug = slug;
  while (dbState.businesses.some(b => b.slug === slug)) {
    slug = `${baseSlug}-${suffix}`;
    suffix++;
  }

  const newOwner: Owner = { id: ownerId, email, business_id: businessId };
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
    is_active: true,
    created_at: new Date().toISOString()
  };

  dbState.owners.push(newOwner);
  dbState.businesses.push(newBusiness);
  saveDB(dbState);

  res.json({
    token: ownerId,
    owner: newOwner,
    business: newBusiness
  });
});

// 3. Login Owner
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }

  const dbState = loadDB();
  const owner = dbState.owners.find(o => o.email.toLowerCase() === email.toLowerCase());
  
  // For demo simplicity, accept password
  if (!owner || password !== "password123" && password.length < 4) {
    return res.status(400).json({ error: "Invalid credentials. Use password123 for demo." });
  }

  const business = dbState.businesses.find(b => b.owner_id === owner.id);
  res.json({
    token: owner.id,
    owner,
    business
  });
});

// 4. Get Business Details by Slug (Public)
app.get("/api/business/:slug", (req, res) => {
  const { slug } = req.params;
  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.slug.toLowerCase() === slug.toLowerCase());
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }
  res.json(business);
});

// 5. Update Business Settings (Private)
app.put("/api/business", (req, res) => {
  const owner = getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dbState = loadDB();
  const bIndex = dbState.businesses.findIndex(b => b.id === owner.business_id);
  if (bIndex === -1) {
    return res.status(404).json({ error: "Business record not found" });
  }

  const originalSlug = dbState.businesses[bIndex].slug;
  const updatedData = req.body;

  // Validate unique slug
  if (updatedData.slug && updatedData.slug !== originalSlug) {
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
    id: owner.business_id, // prevent id modifications
    owner_id: owner.id
  };

  saveDB(dbState);
  res.json(dbState.businesses[bIndex]);
});

// 6. Execute Customer Scan (Public) - Lottery Win and stamp progression calculation
app.post("/api/scan", (req, res) => {
  const { business_id, phone, name } = req.body;
  if (!business_id || !phone || !name) {
    return res.status(400).json({ error: "Business ID, phone number and customer name are required" });
  }

  const dbState = loadDB();
  const business = dbState.businesses.find(b => b.id === business_id);
  if (!business) {
    return res.status(404).json({ error: "Business not found" });
  }

  // Get or Create Customer (unique by phone + business_id)
  let customer = dbState.customers.find(
    c => c.business_id === business_id && c.phone.trim() === phone.trim()
  );

  const isFirstTime = !customer;
  const scanDate = new Date().toISOString();

  if (!customer) {
    customer = {
      id: "cust-" + Math.random().toString(36).substr(2, 9),
      business_id,
      phone: phone.trim(),
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
  const randVal = Math.floor(Math.random() * 100) + 1; // 1-100
  const wonLottery = randVal <= business.win_probability;

  // Create scan record
  const scanId = "scan-" + Math.random().toString(36).substr(2, 9);
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
      id: "reward-" + Math.random().toString(36).substr(2, 9),
      business_id,
      customer_id: customer.id,
      scan_id: scanId,
      type: "lottery_win",
      claimed: false,
      claim_code: generateClaimCode('W'),
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
      id: "reward-" + Math.random().toString(36).substr(2, 9),
      business_id,
      customer_id: customer.id,
      scan_id: scanId,
      type: "stamp_reward",
      claimed: false,
      claim_code: generateClaimCode('S'),
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
app.get("/api/dashboard/stats", (req, res) => {
  const owner = getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
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
app.get("/api/dashboard/customers", (req, res) => {
  const owner = getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const search = (req.query.search as string || "").toLowerCase();
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
app.get("/api/dashboard/rewards", (req, res) => {
  const owner = getLoggedInOwner(req);
  if (!owner) {
    return res.status(401).json({ error: "Unauthorized" });
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
app.get("/api/claim/:code", (req, res) => {
  const { code } = req.params;
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
app.post("/api/rewards/claim", (req, res) => {
  const { code, pin } = req.body;
  if (!code) {
    return res.status(400).json({ error: "Code is required" });
  }

  const dbState = loadDB();
  const rIndex = dbState.rewards.findIndex(r => r.claim_code.toUpperCase() === code.trim().toUpperCase());
  
  if (rIndex === -1) {
    return res.status(404).json({ error: "Claim code not found" });
  }

  if (dbState.rewards[rIndex].claimed) {
    return res.status(400).json({ error: "Reward already claimed." });
  }

  // Set default cashier passcode/PIN: "1234"
  const cashierPin = pin || "1234";
  if (cashierPin !== "1234" && cashierPin !== "4321") {
    return res.status(400).json({ error: "Incorrect Cashier PIN." });
  }

  // Update claim states
  dbState.rewards[rIndex].claimed = true;
  dbState.rewards[rIndex].created_at = new Date().toISOString(); // update claim timestamp or keep original and log claim

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
