import crypto from "node:crypto";

const activeTokens = new Set();

export const createAdminToken = () => {
  const token = crypto.randomBytes(32).toString("hex");
  activeTokens.add(token);
  return token;
};

export const revokeAdminToken = (token) => {
  if (token) activeTokens.delete(token);
};

export const requireAdmin = (request, response, next) => {
  const authorization = request.get("authorization") ?? "";
  const token = authorization.startsWith("Bearer ")
    ? authorization.slice("Bearer ".length)
    : "";

  if (!token || !activeTokens.has(token)) {
    return response.status(401).json({
      success: false,
      message: "Admin authentication is required.",
    });
  }

  request.adminToken = token;
  return next();
};
