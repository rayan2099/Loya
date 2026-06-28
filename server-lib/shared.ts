import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { Business, Owner } from "../src/types";

const SESSION_SECRET = process.env.SESSION_SECRET || "local-dev-change-me";
export const DEFAULT_CASHIER_PIN = process.env.DEFAULT_CASHIER_PIN || "1234";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error("Missing Supabase environment variables.");
}

export const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

export const supabaseAnon = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

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

export function createOwnerSession(owner: Owner): string {
  return signToken({
    ownerId: owner.id,
    email: owner.email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  });
}

export async function getLoggedInOwner(req: any): Promise<Owner | null> {
  const authHeader = req.headers?.authorization || req.headers?.Authorization;
  if (!authHeader || !String(authHeader).startsWith("Bearer ")) return null;

  const payload = verifyToken(String(authHeader).substring(7));
  if (!payload) return null;

  const { data: business, error } = await supabaseAdmin
    .from("businesses")
    .select("id")
    .eq("owner_id", payload.ownerId)
    .maybeSingle();

  if (error || !business) return null;

  return {
    id: payload.ownerId,
    email: payload.email,
    business_id: business.id,
  };
}

export function hashSecret(secret: string, salt = crypto.randomBytes(16).toString("hex")): string {
  const hash = crypto.scryptSync(secret, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

export function verifySecret(secret: string, storedHash?: string): boolean {
  if (!storedHash) return false;
  const [salt, hash] = storedHash.split(":");
  if (!salt || !hash) return false;
  const candidate = crypto.scryptSync(secret, salt, 64).toString("hex");
  return crypto.timingSafeEqual(Buffer.from(hash, "hex"), Buffer.from(candidate, "hex"));
}

export function normalizePhone(phone: string): string {
  return phone.replace(/[^\d+]/g, "").trim();
}

export function sanitizeSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 64);
}

export function publicBusiness(business: Business): Omit<Business, "cashier_pin_hash"> {
  const { cashier_pin_hash, ...safeBusiness } = business;
  return safeBusiness;
}

export function publicOwner(owner: Owner): Omit<Owner, "password_hash"> {
  const { password_hash, ...safeOwner } = owner;
  return safeOwner;
}

function generateClaimCode(prefix: "W" | "S"): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
  let code = prefix;
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(crypto.randomInt(0, chars.length));
  }
  return code;
}

export async function generateUniqueClaimCode(prefix: "W" | "S"): Promise<string> {
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

const buckets = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now();
  const current = buckets.get(key);
  if (!current || current.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  current.count += 1;
  return current.count <= maxRequests;
}

export function getClientIp(req: any): string {
  const forwarded = req.headers?.["x-forwarded-for"];
  if (typeof forwarded === "string") return forwarded.split(",")[0].trim();
  return req.socket?.remoteAddress || "unknown";
}

export function methodNotAllowed(res: any) {
  return res.status(405).json({ error: "Method not allowed" });
}

export function sendError(res: any, error: unknown, status = 500, fallback = "Server error") {
  console.error(error);
  const message = error instanceof Error ? error.message : fallback;
  return res.status(status).json({ error: message || fallback });
}
