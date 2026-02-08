import crypto from "crypto";
import AnalyticsSession from "../models/AnalyticsSession.js";
import PageView from "../models/PageView.js";

const ANALYTICS_SALT =
  process.env.ANALYTICS_SALT || "dev_analytics_salt_change_me";

const normalizeIp = (ip) => {
  if (!ip) return "";
  if (ip.startsWith("::ffff:")) return ip.replace("::ffff:", "");
  return ip;
};

const getClientIp = (req) => {
  const header = req.headers["x-forwarded-for"];
  if (header) {
    return normalizeIp(header.split(",")[0].trim());
  }
  return normalizeIp(
    req.ip ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    "",
  );
};

const hashIp = (ip) => {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(ip + ANALYTICS_SALT).digest("hex");
};

const isLocalhostIp = (ip) => {
  if (!ip) return false;
  if (ip === "::1") return true;
  if (ip.startsWith("127.")) return true;
  if (ip.startsWith("10.")) return true;
  if (ip.startsWith("192.168.")) return true;
  if (ip.startsWith("172.")) {
    const parts = ip.split(".");
    const second = Number(parts[1] || 0);
    return second >= 16 && second <= 31;
  }
  return false;
};

const shouldSkipTracking = (req) => {
  if (req.headers["x-auth-token-admin"]) return true;
  const ip = getClientIp(req);
  return isLocalhostIp(ip);
};

const touchSession = async ({ sessionId, ipHash, userAgent, referrer, path }) => {
  const now = new Date();
  await AnalyticsSession.findOneAndUpdate(
    { sessionId },
    {
      $setOnInsert: {
        sessionId,
        ipHash,
        userAgent,
        referrer,
        firstSeenAt: now,
      },
      $set: {
        lastSeenAt: now,
        lastPath: path || "",
      },
    },
    { upsert: true, new: true },
  );
};

export const trackPageView = async (req, res) => {
  try {
    if (shouldSkipTracking(req)) {
      return res.status(204).send();
    }

    const { sessionId, path, title, referrer } = req.body || {};
    if (!sessionId || !path) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId and path are required" });
    }

    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const userAgent = req.headers["user-agent"] || "";

    await PageView.create({
      sessionId,
      ipHash,
      path,
      title: title || "",
      referrer: referrer || "",
      userAgent,
    });

    await touchSession({ sessionId, ipHash, userAgent, referrer, path });

    return res.status(201).json({ success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

export const heartbeat = async (req, res) => {
  try {
    if (shouldSkipTracking(req)) {
      return res.status(204).send();
    }

    const { sessionId, path } = req.body || {};
    if (!sessionId) {
      return res
        .status(400)
        .json({ success: false, message: "sessionId is required" });
    }

    const now = new Date();
    const ip = getClientIp(req);
    const ipHash = hashIp(ip);
    const userAgent = req.headers["user-agent"] || "";

    const session = await AnalyticsSession.findOne({ sessionId });
    if (!session) {
      await touchSession({
        sessionId,
        ipHash,
        userAgent,
        referrer: "",
        path,
      });
      return res.status(201).json({ success: true });
    }

    const lastSeen = session.lastSeenAt || session.firstSeenAt || now;
    const deltaSeconds = Math.max(
      0,
      Math.round((now.getTime() - lastSeen.getTime()) / 1000),
    );
    const cappedSeconds = Math.min(deltaSeconds, 60);

    session.totalTimeSeconds += cappedSeconds;
    session.lastSeenAt = now;
    if (path) session.lastPath = path;
    await session.save();

    return res.status(200).json({ success: true });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

export const getAnalyticsStats = async (req, res) => {
  try {
    const [totalViews, totalSessions] = await Promise.all([
      PageView.countDocuments(),
      AnalyticsSession.countDocuments(),
    ]);

    const timeAgg = await AnalyticsSession.aggregate([
      {
        $group: {
          _id: null,
          avgTimeSeconds: { $avg: "$totalTimeSeconds" },
          totalTimeSeconds: { $sum: "$totalTimeSeconds" },
        },
      },
    ]);

    const avgTimeSeconds = timeAgg[0]?.avgTimeSeconds || 0;

    return res.status(200).json({
      success: true,
      data: {
        totalViews,
        totalSessions,
        avgTimeSeconds: Math.round(avgTimeSeconds),
      },
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};

export const getAnalyticsSessions = async (req, res) => {
  try {
    const page = Math.max(1, Number(req.query.page || 1));
    const limit = Math.min(100, Math.max(1, Number(req.query.limit || 20)));
    const skip = (page - 1) * limit;

    const [sessions, total] = await Promise.all([
      AnalyticsSession.find()
        .sort({ lastSeenAt: -1 })
        .skip(skip)
        .limit(limit),
      AnalyticsSession.countDocuments(),
    ]);

    return res.status(200).json({
      success: true,
      data: sessions,
      page,
      total,
      totalPages: Math.ceil(total / limit) || 1,
    });
  } catch (err) {
    return res
      .status(500)
      .json({ success: false, message: "Server Error" });
  }
};
