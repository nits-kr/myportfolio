import crypto from "crypto";
import User from "../models/User.js";
import Payment from "../models/Payment.js";

const PLAN_CATALOG = {
  pro_monthly: {
    amountPaise: 19900,
    currency: "INR",
    plan: "pro",
    validityDays: 30,
  },
  pro_yearly: {
    amountPaise: 191000,
    currency: "INR",
    plan: "pro",
    validityDays: 365,
  },
  enterprise_monthly: {
    amountPaise: 99900,
    currency: "INR",
    plan: "enterprise",
    validityDays: 30,
  },
  enterprise_yearly: {
    amountPaise: 959000,
    currency: "INR",
    plan: "enterprise",
    validityDays: 365,
  },
};

const getPlanConfig = (planId) => PLAN_CATALOG[planId] || null;
const PLAN_TIER = { free: 0, pro: 1, enterprise: 2 };

const getTier = (plan) => PLAN_TIER[plan] ?? 0;

const safeCompare = (a, b) => {
  const aBuf = Buffer.from(a || "", "utf8");
  const bBuf = Buffer.from(b || "", "utf8");
  if (aBuf.length !== bBuf.length) return false;
  return crypto.timingSafeEqual(aBuf, bBuf);
};

const ensureGatewayConfig = () => {
  if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay credentials are missing");
  }
};

const createRazorpayOrder = async ({ amountPaise, currency, receipt }) => {
  ensureGatewayConfig();

  const auth = Buffer.from(
    `${process.env.RAZORPAY_KEY_ID}:${process.env.RAZORPAY_KEY_SECRET}`,
  ).toString("base64");

  const response = await fetch("https://api.razorpay.com/v1/orders", {
    method: "POST",
    headers: {
      Authorization: `Basic ${auth}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      amount: amountPaise,
      currency,
      receipt,
      payment_capture: 1,
    }),
  });

  const data = await response.json();
  if (!response.ok) {
    throw new Error(data?.error?.description || "Failed to create Razorpay order");
  }

  return data;
};

const applySubscription = async (userId, planConfig) => {
  const existingUser = await User.findById(userId);
  if (!existingUser) return null;

  const now = new Date();
  const isActive =
    existingUser.subscriptionStatus === "active" &&
    existingUser.subscriptionExpiresAt &&
    existingUser.subscriptionExpiresAt > now;
  const currentPlan = existingUser.subscription || "free";
  const currentTier = getTier(currentPlan);
  const newTier = getTier(planConfig.plan);

  // Same plan renews/extends from current expiry when active.
  if (isActive && currentPlan === planConfig.plan) {
    const nextExpiry = new Date(existingUser.subscriptionExpiresAt);
    nextExpiry.setDate(nextExpiry.getDate() + planConfig.validityDays);
    existingUser.subscriptionExpiresAt = nextExpiry;
    existingUser.subscriptionStatus = "active";
    existingUser.pendingSubscription = null;
    existingUser.pendingSubscriptionValidityDays = null;
    await existingUser.save();
    return { user: existingUser, action: "renewed" };
  }

  // Upgrade applies immediately; any scheduled downgrade is cleared.
  if (!isActive || newTier > currentTier) {
    const remainingDays =
      isActive && existingUser.subscriptionExpiresAt
        ? Math.ceil(
            (existingUser.subscriptionExpiresAt.getTime() - now.getTime()) /
              (1000 * 60 * 60 * 24),
          )
        : 0;
    const totalDays = planConfig.validityDays + Math.max(remainingDays, 0);
    const nextExpiry = new Date(now);
    nextExpiry.setDate(nextExpiry.getDate() + totalDays);

    existingUser.subscription = planConfig.plan;
    existingUser.subscriptionStatus = "active";
    existingUser.subscriptionExpiresAt = nextExpiry;
    existingUser.pendingSubscription = null;
    existingUser.pendingSubscriptionValidityDays = null;
    await existingUser.save();
    return { user: existingUser, action: currentTier < newTier ? "upgraded" : "activated" };
  }

  // Downgrade is scheduled after current paid period ends.
  existingUser.pendingSubscription = planConfig.plan;
  existingUser.pendingSubscriptionValidityDays = planConfig.validityDays;
  await existingUser.save();
  return { user: existingUser, action: "downgrade_scheduled" };
};

const refreshSubscriptionState = async (user) => {
  const now = new Date();
  const isActive =
    user.subscriptionStatus === "active" &&
    user.subscriptionExpiresAt &&
    user.subscriptionExpiresAt > now;

  if (isActive) return user;

  if (user.pendingSubscription && user.pendingSubscriptionValidityDays) {
    const nextExpiry = new Date(now);
    nextExpiry.setDate(
      nextExpiry.getDate() + Number(user.pendingSubscriptionValidityDays),
    );
    user.subscription = user.pendingSubscription;
    user.subscriptionStatus = "active";
    user.subscriptionExpiresAt = nextExpiry;
    user.pendingSubscription = null;
    user.pendingSubscriptionValidityDays = null;
    await user.save();
    return user;
  }

  if (user.subscriptionStatus !== "inactive") {
    user.subscriptionStatus = "inactive";
  }
  user.subscription = "free";
  user.subscriptionExpiresAt = null;
  await user.save();
  return user;
};

export const createOrder = async (req, res) => {
  try {
    const { planId } = req.body;
    const userId = req.user?._id;
    const planConfig = getPlanConfig(planId);

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!planConfig) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    const receipt = `rcpt_${Date.now()}_${crypto.randomBytes(6).toString("hex")}`;
    const order = await createRazorpayOrder({
      amountPaise: planConfig.amountPaise,
      currency: planConfig.currency,
      receipt,
    });

    await Payment.create({
      userId,
      planId,
      amountPaise: planConfig.amountPaise,
      currency: planConfig.currency,
      status: "created",
      razorpayOrderId: order.id,
    });

    return res.status(201).json({
      success: true,
      data: {
        orderId: order.id,
        amount: planConfig.amountPaise,
        currency: planConfig.currency,
        keyId: process.env.RAZORPAY_KEY_ID,
        planId,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const verifyPayment = async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, planId } =
      req.body;
    const userId = req.user?._id;
    const planConfig = getPlanConfig(planId);

    if (!userId) {
      return res.status(401).json({ success: false, error: "Unauthorized" });
    }

    if (!planConfig) {
      return res.status(400).json({ success: false, error: "Invalid plan" });
    }

    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: "Missing payment fields" });
    }

    if (!process.env.RAZORPAY_KEY_SECRET) {
      return res
        .status(500)
        .json({ success: false, error: "Payment verification is not configured" });
    }

    const expectedSignature = crypto
      .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
      .update(`${razorpay_order_id}|${razorpay_payment_id}`)
      .digest("hex");

    if (!safeCompare(expectedSignature, razorpay_signature)) {
      return res.status(400).json({ success: false, error: "Invalid signature" });
    }

    const existingCaptured = await Payment.findOne({
      razorpayPaymentId: razorpay_payment_id,
      status: "captured",
    });

    if (existingCaptured) {
      let user = await User.findById(userId).select(
        "subscription subscriptionStatus subscriptionExpiresAt pendingSubscription pendingSubscriptionValidityDays",
      );
      if (user) user = await refreshSubscriptionState(user);
      return res.json({ success: true, data: { subscription: user } });
    }

    const payment = await Payment.findOne({
      userId,
      razorpayOrderId: razorpay_order_id,
    });

    if (!payment) {
      return res.status(404).json({ success: false, error: "Order not found" });
    }

    payment.razorpayPaymentId = razorpay_payment_id;
    payment.razorpaySignature = razorpay_signature;
    payment.status = "captured";
    await payment.save();

    const result = await applySubscription(userId, planConfig);

    return res.json({
      success: true,
      data: {
        action: result?.action || "activated",
        subscription: result?.user
          ? {
              subscription: result.user.subscription,
              subscriptionStatus: result.user.subscriptionStatus,
              subscriptionExpiresAt: result.user.subscriptionExpiresAt,
              pendingSubscription: result.user.pendingSubscription,
              pendingSubscriptionValidityDays:
                result.user.pendingSubscriptionValidityDays,
            }
          : null,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const handleWebhook = async (req, res) => {
  try {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      return res.status(500).json({ success: false, error: "Webhook secret missing" });
    }

    const signature = req.headers["x-razorpay-signature"];
    const body = req.body instanceof Buffer ? req.body : Buffer.from("");

    const expectedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(body)
      .digest("hex");

    if (!safeCompare(expectedSignature, signature)) {
      return res.status(400).json({ success: false, error: "Invalid webhook signature" });
    }

    const payload = JSON.parse(body.toString("utf8"));
    const event = payload?.event;
    const entity = payload?.payload?.payment?.entity;

    if (event === "payment.captured" && entity?.order_id && entity?.id) {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        payment.razorpayPaymentId = payment.razorpayPaymentId || entity.id;
        payment.status = "captured";
        await payment.save();

        const planConfig = getPlanConfig(payment.planId);
        if (planConfig) {
          await applySubscription(payment.userId, planConfig);
        }
      }
    }

    if (event === "payment.failed" && entity?.order_id) {
      const payment = await Payment.findOne({ razorpayOrderId: entity.order_id });
      if (payment) {
        payment.status = "failed";
        await payment.save();
      }
    }

    return res.json({ success: true });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getSubscription = async (req, res) => {
  try {
    let user = await User.findById(req.user._id).select(
      "subscription subscriptionStatus subscriptionExpiresAt pendingSubscription pendingSubscriptionValidityDays",
    );
    if (!user) {
      return res.status(404).json({ success: false, error: "User not found" });
    }

    user = await refreshSubscriptionState(user);

    return res.json({
      success: true,
      data: {
        currentPlan: user.subscription || "free",
        subscriptionStatus: user.subscriptionStatus,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        pendingSubscription: user.pendingSubscription || null,
        pendingSubscriptionValidityDays: user.pendingSubscriptionValidityDays,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};

export const getRecentPaymentsAdmin = async (req, res) => {
  try {
    const limitParam = Number.parseInt(req.query.limit, 10);
    const limit =
      Number.isNaN(limitParam) || limitParam <= 0
        ? 20
        : Math.min(limitParam, 100);

    const payments = await Payment.find({})
      .sort({ createdAt: -1 })
      .limit(limit)
      .populate("userId", "name email role");

    return res.json({ success: true, data: payments });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
