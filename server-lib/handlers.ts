import * as crypto from "crypto";
import type { Customer, DashboardStats, Reward, Scan } from "../src/types";
import {
  DEFAULT_CASHIER_PIN,
  createOwnerSession,
  ensureSupabaseConfigured,
  generateUniqueClaimCode,
  getClientIp,
  getLoggedInOwner,
  hashSecret,
  methodNotAllowed,
  normalizePhone,
  publicBusiness,
  publicOwner,
  rateLimit,
  sanitizeSlug,
  sendError,
  getSupabaseAdmin,
  getSupabaseAnon,
  verifySecret,
} from "./shared.js";

export async function registerOwner(req: any, res: any) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { email, password, name_ar, name_en, business_type, phone } = req.body || {};
  if (!email || !password || !name_en || !name_ar) {
    return res.status(400).json({ error: "Missing required register fields" });
  }
  if (!rateLimit(`register:${getClientIp(req)}`, 10, 60 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many registration attempts. Please try again later." });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ error: "Password must be at least 8 characters." });
  }

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const normalizedEmail = String(email).toLowerCase().trim();
    const { data: userData, error: userError } = await supabaseAdmin.auth.admin.createUser({
      email: normalizedEmail,
      password,
      email_confirm: true,
      user_metadata: { phone: phone ? normalizePhone(phone) : null },
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
        is_active: true,
      })
      .select("*")
      .single();

    if (businessError) {
      await supabaseAdmin.auth.admin.deleteUser(userData.user.id);
      throw businessError;
    }

    const owner = {
      id: userData.user.id,
      email: normalizedEmail,
      business_id: business.id,
      phone: phone ? normalizePhone(phone) : undefined,
    };

    return res.json({
      token: createOwnerSession(owner),
      owner: publicOwner(owner),
      business: publicBusiness(business),
    });
  } catch (error) {
    return sendError(res, error, 400, "Could not create account.");
  }
}

export async function loginOwner(req: any, res: any) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: "Email and password are required" });
  }
  if (!rateLimit(`login:${getClientIp(req)}:${String(email).toLowerCase()}`, 12, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many login attempts. Please try again later." });
  }

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const supabaseAnon = getSupabaseAnon();
    const normalizedEmail = String(email).toLowerCase().trim();
    const { data: authData, error: authError } = await supabaseAnon.auth.signInWithPassword({
      email: normalizedEmail,
      password,
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

    const owner = {
      id: authData.user.id,
      email: authData.user.email || normalizedEmail,
      business_id: business.id,
      phone: authData.user.user_metadata?.phone,
    };

    return res.json({
      token: createOwnerSession(owner),
      owner: publicOwner(owner),
      business: publicBusiness(business),
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getMe(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const owner = await getLoggedInOwner(req);
    if (!owner) return res.status(401).json({ error: "Unauthorized" });

    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("owner_id", owner.id)
      .maybeSingle();

    if (error) throw error;
    return res.json({
      owner: publicOwner(owner),
      business: business ? publicBusiness(business) : null,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getBusinessBySlug(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  const slug = String(req.query.slug || "");
  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .select("*")
      .eq("slug", slug.toLowerCase())
      .eq("is_active", true)
      .maybeSingle();

    if (error) throw error;
    if (!business) return res.status(404).json({ error: "Business not found" });
    return res.json(publicBusiness(business));
  } catch (error) {
    return sendError(res, error);
  }
}

export async function updateBusiness(req: any, res: any) {
  if (req.method !== "PUT") return methodNotAllowed(res);

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const owner = await getLoggedInOwner(req);
    if (!owner) return res.status(401).json({ error: "Unauthorized" });

    const { cashier_pin, cashier_pin_hash, owner_id, id, created_at, ...updatedData } = req.body || {};

    if (updatedData.slug) {
      updatedData.slug = sanitizeSlug(updatedData.slug);
      if (!updatedData.slug) return res.status(400).json({ error: "Slug must contain letters or numbers." });

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
      stamps_required: Math.min(50, Math.max(1, Number(updatedData.stamps_required ?? 5))),
    };

    const { data: business, error } = await supabaseAdmin
      .from("businesses")
      .update(updatePayload)
      .eq("id", owner.business_id)
      .eq("owner_id", owner.id)
      .select("*")
      .single();

    if (error) throw error;
    return res.json(publicBusiness(business));
  } catch (error) {
    return sendError(res, error);
  }
}

export async function executeScan(req: any, res: any) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { business_id, phone, name } = req.body || {};
  if (!business_id || !phone || !name) {
    return res.status(400).json({ error: "Business ID, phone number and customer name are required" });
  }

  const cleanPhone = normalizePhone(phone);
  if (!rateLimit(`scan:${business_id}:${cleanPhone || getClientIp(req)}`, 8, 10 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many scans. Please wait before trying again." });
  }
  if (cleanPhone.length < 8 || cleanPhone.length > 16) {
    return res.status(400).json({ error: "Please enter a valid phone number." });
  }

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
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
          total_scans: 0,
        })
        .select("*")
        .single();

      if (insertCustomerError) throw insertCustomerError;
      customer = insertedCustomer as Customer;
    }

    const oldStamps = customer.stamps;
    const wonLottery = crypto.randomInt(1, 101) <= business.win_probability;

    const { data: scan, error: scanError } = await supabaseAdmin
      .from("scans")
      .insert({
        business_id,
        customer_id: customer.id,
        won: wonLottery,
        reward_claimed: false,
        created_at: scanDate,
      })
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
          claim_code: await generateUniqueClaimCode("W"),
          created_at: scanDate,
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
          claim_code: await generateUniqueClaimCode("S"),
          created_at: scanDate,
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
        total_scans: customer.total_scans + 1,
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
      stampsRequired: business.stamps_required,
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getDashboardStats(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const owner = await getLoggedInOwner(req);
    if (!owner) return res.status(401).json({ error: "Unauthorized" });

    const bid = owner.business_id;
    const [{ data: bScans, error: scansError }, { data: bCustomers, error: customersError }, { data: bRewards, error: rewardsError }] = await Promise.all([
      supabaseAdmin.from("scans").select("*").eq("business_id", bid),
      supabaseAdmin.from("customers").select("*").eq("business_id", bid),
      supabaseAdmin.from("rewards").select("*").eq("business_id", bid),
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
        wins: scans.filter(s => s.created_at.substring(0, 10) === dateStr && s.won).length,
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
      chartData,
    };

    return res.json(stats);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getDashboardCustomers(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  const search = String(req.query.search || "").toLowerCase();
  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const owner = await getLoggedInOwner(req);
    if (!owner) return res.status(401).json({ error: "Unauthorized" });

    let query = supabaseAdmin
      .from("customers")
      .select("*")
      .eq("business_id", owner.business_id)
      .order("created_at", { ascending: false });

    if (search) query = query.or(`name.ilike.%${search}%,phone.ilike.%${search}%`);

    const { data, error } = await query;
    if (error) throw error;
    return res.json(data || []);
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getDashboardRewards(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const owner = await getLoggedInOwner(req);
    if (!owner) return res.status(401).json({ error: "Unauthorized" });

    const { data, error } = await supabaseAdmin
      .from("rewards")
      .select("*, customers(name, phone)")
      .eq("business_id", owner.business_id)
      .order("created_at", { ascending: false });

    if (error) throw error;

    return res.json((data || []).map((reward: any) => ({
      ...reward,
      customer_name: reward.customers?.name || "Unknown Customer",
      customer_phone: reward.customers?.phone || "",
    })));
  } catch (error) {
    return sendError(res, error);
  }
}

export async function getClaim(req: any, res: any) {
  if (req.method !== "GET") return methodNotAllowed(res);

  const code = String(req.query.code || "");
  if (!rateLimit(`claim-check:${getClientIp(req)}:${code}`, 30, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many verification attempts. Please try again later." });
  }

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
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
        claimed_at: data.claimed_at,
      },
      customer_name: data.customers?.name || "Customer",
      business_name_ar: business?.name_ar || "Business",
      business_name_en: business?.name_en || "Business",
      reward_name_ar: business ? (data.type === "lottery_win" ? business.reward_ar : `هدية بطاقة الـ ${business.stamps_required} أختام الكبرى ☕`) : "Reward",
      reward_name_en: business ? (data.type === "lottery_win" ? business.reward_en : `Grand Loyalty Reward (${business.stamps_required} Stamps) ☕`) : "Reward",
    });
  } catch (error) {
    return sendError(res, error);
  }
}

export async function claimReward(req: any, res: any) {
  if (req.method !== "POST") return methodNotAllowed(res);

  const { code, pin } = req.body || {};
  if (!code) return res.status(400).json({ error: "Code is required" });
  if (!rateLimit(`claim:${getClientIp(req)}:${code}`, 10, 15 * 60 * 1000)) {
    return res.status(429).json({ error: "Too many claim attempts. Please try again later." });
  }

  try {
    ensureSupabaseConfigured();
    const supabaseAdmin = getSupabaseAdmin();
    const { data: reward, error: rewardError } = await supabaseAdmin
      .from("rewards")
      .select("*, businesses(*)")
      .eq("claim_code", String(code).trim().toUpperCase())
      .maybeSingle();

    if (rewardError) throw rewardError;
    if (!reward) return res.status(404).json({ error: "Claim code not found" });
    if (reward.claimed) return res.status(400).json({ error: "Reward already claimed." });

    const owner = await getLoggedInOwner(req);
    const business = reward.businesses;
    if (!business) return res.status(404).json({ error: "Business record not found." });

    const ownerCanClaim = owner?.business_id === business.id;
    const pinCanClaim = pin && verifySecret(String(pin), business.cashier_pin_hash);
    if (!ownerCanClaim && !pinCanClaim) {
      return res.status(400).json({ error: "Incorrect Cashier PIN." });
    }

    const { data: updatedReward, error: updateRewardError } = await supabaseAdmin
      .from("rewards")
      .update({ claimed: true, claimed_at: new Date().toISOString() })
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
    return sendError(res, error);
  }
}
