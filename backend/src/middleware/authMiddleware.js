import jwt from "jsonwebtoken";
import User from "../models/User.js";
import SubUser from "../models/subUser.modal.js";
import { refreshSubscriptionState } from "../services/subscriptionService.js";

export const protect = async (req, res, next) => {
  let token;

  if (req.headers["x-auth-token-user"]) {
    token = req.headers["x-auth-token-user"];
  } else if (req.headers["x-auth-token-admin"]) {
    token = req.headers["x-auth-token-admin"];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (!token) {
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, no token" });
  }

  try {
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    let user = await User.findById(decoded.id).select("-password");
    let isSubUser = false;
    if (!user) {
      user = await SubUser.findById(decoded.id).select("-password");
      isSubUser = Boolean(user);

      // Sub-users inherit subscription entitlements from their parent (billing owner)
      if (isSubUser && user?.parentUser) {
        let owner = await User.findById(user.parentUser).select(
          "subscription subscriptionStatus subscriptionExpiresAt pendingSubscription pendingSubscriptionValidityDays",
        );
        if (owner) owner = await refreshSubscriptionState(owner);

        if (owner) {
          user.subscription = owner.subscription;
          user.subscriptionStatus = owner.subscriptionStatus;
          user.subscriptionExpiresAt = owner.subscriptionExpiresAt;
          user.pendingSubscription = owner.pendingSubscription;
          user.pendingSubscriptionValidityDays = owner.pendingSubscriptionValidityDays;
        }
      }
    }

    if (user && !isSubUser) {
      user = await refreshSubscriptionState(user);
    }

    req.user = user;

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
    }

    if (isSubUser && req.user.status === false) {
      return res.status(403).json({
        success: false,
        message: "Your account is inactive. Please contact admin.",
      });
    }

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
};

export const optionalProtect = async (req, res, next) => {
  let token;

  if (req.headers["x-auth-token-user"]) {
    token = req.headers["x-auth-token-user"];
  } else if (req.headers["x-auth-token-admin"]) {
    token = req.headers["x-auth-token-admin"];
  } else if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  } else if (req.cookies.token) {
    token = req.cookies.token;
  }

  if (token) {
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
    let user = await User.findById(decoded.id).select("-password");
    let isSubUser = false;
    if (!user) {
      user = await SubUser.findById(decoded.id).select("-password");
      isSubUser = Boolean(user);

      if (isSubUser && user?.parentUser) {
        let owner = await User.findById(user.parentUser).select(
          "subscription subscriptionStatus subscriptionExpiresAt pendingSubscription pendingSubscriptionValidityDays",
        );
        if (owner) owner = await refreshSubscriptionState(owner);

        if (owner) {
          user.subscription = owner.subscription;
          user.subscriptionStatus = owner.subscriptionStatus;
          user.subscriptionExpiresAt = owner.subscriptionExpiresAt;
          user.pendingSubscription = owner.pendingSubscription;
          user.pendingSubscriptionValidityDays = owner.pendingSubscriptionValidityDays;
        }
      }
    }

    if (user && !isSubUser) {
      user = await refreshSubscriptionState(user);
    }
      req.user = user;
    } catch (err) {
      console.error("Optional Auth Error:", err);
    }
  }

  next();
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `User role ${req.user.role} is not authorized to access this route`,
      });
    }
    next();
  };
};
