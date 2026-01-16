import jwt from "jsonwebtoken";
import { promisify } from "util";

export async function verifyToken(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith("Bearer ")
      ? authHeader.split(" ")[1]
      : authHeader;
    if (!token) {
      return res.status(401).json({ error: "Access token required" });
    }
    const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);
    req.userId = decoded.userId;
    next();
  } catch (err) {
    return res.status(403).json({ error: "Invalid or expired token" });
  }
}
