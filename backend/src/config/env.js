import dotenv from "dotenv";

dotenv.config();

const requiredKeys = ["DATABASE_URL", "JWT_ACCESS_SECRET", "JWT_REFRESH_SECRET"];

for (const key of requiredKeys) {
  if (!process.env[key]) {
    throw new Error(`Missing required env var: ${key}`);
  }
}

export const env = {
  port: Number(process.env.PORT || 4000),
  databaseUrl: process.env.DATABASE_URL,
  jwtAccessSecret: process.env.JWT_ACCESS_SECRET,
  jwtRefreshSecret: process.env.JWT_REFRESH_SECRET,
  jwtAccessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN || "15m",
  jwtRefreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "7d",
  corsOrigin: process.env.CORS_ORIGIN || "http://localhost:5173",
  expoAccessToken: process.env.EXPO_ACCESS_TOKEN || "",
  // VNPay Sandbox
  vnpTmnCode: process.env.VNP_TMN_CODE || "CGXZLS0Z",
  vnpHashSecret: process.env.VNP_HASH_SECRET || "XNBCJFAKAZQSGTARRLGCHVZWCIOIGSHN",
  vnpPaymentUrl: process.env.VNP_PAYMENT_URL || "https://sandbox.vnpayment.vn/paymentv2/vpcpay.html",
  vnpReturnUrl: process.env.VNP_RETURN_URL || "http://localhost:4000/api/vnpay/return",
};
