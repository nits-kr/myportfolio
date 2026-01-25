import jwt from "jsonwebtoken";
import User from "../models/User.js";

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

    req.user = await User.findById(decoded.id).select("-password");

    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authorized, user not found" });
    }

    next();
  } catch (err) {
    console.error(err);
    return res
      .status(401)
      .json({ success: false, message: "Not authorized, token failed" });
  }
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
