const asDate = (value) => {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date;
};

const addDays = (date, days) => {
  const next = new Date(date);
  next.setDate(next.getDate() + Number(days));
  return next;
};

const isUserWithSubscriptionFields = (user) =>
  Boolean(user && typeof user === "object" && "subscription" in user && "subscriptionStatus" in user);

export const refreshSubscriptionState = async (user) => {
  if (!isUserWithSubscriptionFields(user) || typeof user.save !== "function") return user;

  const now = new Date();
  const subscription = user.subscription || "free";
  const expiresAt = asDate(user.subscriptionExpiresAt);

  const hasPaidPlan = subscription !== "free";
  const isActive = hasPaidPlan && expiresAt && expiresAt > now;

  let changed = false;

  if (isActive) {
    if (user.subscriptionStatus !== "active") {
      user.subscriptionStatus = "active";
      changed = true;
    }

    if (changed) await user.save();
    return user;
  }

  const pendingPlan = user.pendingSubscription;
  const pendingDays = user.pendingSubscriptionValidityDays;

  if (pendingPlan && pendingDays) {
    const startAt = expiresAt && expiresAt < now ? expiresAt : now;
    const nextExpiry = addDays(startAt, pendingDays);

    if (nextExpiry > now) {
      user.subscription = pendingPlan;
      user.subscriptionStatus = "active";
      user.subscriptionExpiresAt = nextExpiry;
    } else {
      user.subscription = "free";
      user.subscriptionStatus = "inactive";
      user.subscriptionExpiresAt = null;
    }

    user.pendingSubscription = null;
    user.pendingSubscriptionValidityDays = null;
    await user.save();
    return user;
  }

  if (user.subscription !== "free") {
    user.subscription = "free";
    changed = true;
  }

  if (user.subscriptionStatus !== "inactive") {
    user.subscriptionStatus = "inactive";
    changed = true;
  }

  if (user.subscriptionExpiresAt !== null) {
    user.subscriptionExpiresAt = null;
    changed = true;
  }

  if (user.pendingSubscription !== null) {
    user.pendingSubscription = null;
    changed = true;
  }

  if (user.pendingSubscriptionValidityDays !== null) {
    user.pendingSubscriptionValidityDays = null;
    changed = true;
  }

  if (changed) await user.save();
  return user;
};

