import crypto from "crypto";
import querystring from "qs";
import { env } from "../config/env.js";

/**
 * Sort object keys alphabetically (required by VNPay)
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = encodeURIComponent(obj[key]).replace(/%20/g, "+");
  }
  return sorted;
}

/**
 * Create VNPay payment URL
 * @param {Object} params
 * @param {string} params.txnRef - Unique transaction reference
 * @param {number} params.amount - Amount in VND (will be multiplied by 100 for VNPay)
 * @param {string} params.orderInfo - Order description
 * @param {string} params.ipAddr - Client IP address
 * @param {string} params.locale - Language (vn or en)
 * @returns {string} VNPay payment URL
 */
export function createPaymentUrl({ txnRef, amount, orderInfo, ipAddr, locale = "vn" }) {
  const vnpUrl = env.vnpPaymentUrl;
  const tmnCode = env.vnpTmnCode;
  const secretKey = env.vnpHashSecret;
  const returnUrl = env.vnpReturnUrl;

  const date = new Date();
  const createDate = formatDate(date);
  const expireDate = formatDate(new Date(date.getTime() + 15 * 60 * 1000));

  const vnpParams = {
    vnp_Version: "2.1.0",
    vnp_Command: "pay",
    vnp_TmnCode: tmnCode,
    vnp_Locale: locale,
    vnp_CurrCode: "VND",
    vnp_TxnRef: txnRef,
    vnp_OrderInfo: orderInfo,
    vnp_OrderType: "other",
    vnp_Amount: Math.round(amount * 100),
    vnp_ReturnUrl: returnUrl,
    vnp_IpAddr: ipAddr,
    vnp_CreateDate: createDate,
    vnp_ExpireDate: expireDate,
  };

  const sorted = sortObject(vnpParams);
  const signData = querystring.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  sorted.vnp_SecureHash = signed;

  return `${vnpUrl}?${querystring.stringify(sorted, { encode: false })}`;
}

/**
 * Verify VNPay return/IPN checksum
 * @param {Object} vnpParams - Query params from VNPay callback
 * @returns {{ isValid: boolean, responseCode: string }}
 */
export function verifyReturnUrl(vnpParams) {
  const secretKey = env.vnpHashSecret;
  const secureHash = vnpParams.vnp_SecureHash;

  // Remove hash fields before verification
  const params = { ...vnpParams };
  delete params.vnp_SecureHash;
  delete params.vnp_SecureHashType;

  const sorted = sortObject(params);
  const signData = querystring.stringify(sorted, { encode: false });
  const hmac = crypto.createHmac("sha512", secretKey);
  const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

  return {
    isValid: secureHash === signed,
    responseCode: vnpParams.vnp_ResponseCode,
    txnRef: vnpParams.vnp_TxnRef,
    amount: Number(vnpParams.vnp_Amount) / 100,
    vnpTxnNo: vnpParams.vnp_TransactionNo,
    bankCode: vnpParams.vnp_BankCode,
    payDate: vnpParams.vnp_PayDate,
  };
}

/**
 * Format date to VNPay format: yyyyMMddHHmmss
 */
function formatDate(date) {
  const pad = (n) => String(n).padStart(2, "0");
  return (
    date.getFullYear().toString() +
    pad(date.getMonth() + 1) +
    pad(date.getDate()) +
    pad(date.getHours()) +
    pad(date.getMinutes()) +
    pad(date.getSeconds())
  );
}
