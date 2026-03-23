import { prisma } from "../lib/prisma.js";
import { notFound, badRequest } from "../utils/http-error.js";
import { createAuditLog } from "../services/audit.service.js";
import { createPaymentUrl, verifyReturnUrl } from "../lib/vnpay.js";
import { env } from "../config/env.js";

async function getStudentOrThrow(userId) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw notFound("Student profile not found");
  return student;
}

/**
 * Student creates a VNPay payment for a tuition fee
 * POST /student/payments/create
 */
export async function createPayment(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);
    const { tuitionFeeId, amount } = req.body;

    if (!tuitionFeeId || !amount || amount <= 0) {
      throw badRequest("Vui lòng cung cấp tuitionFeeId và số tiền hợp lệ");
    }

    const tuitionFee = await prisma.tuitionFee.findFirst({
      where: { id: tuitionFeeId, studentId: student.id },
      include: {
        semester: true,
        items: true,
      },
    });

    if (!tuitionFee) throw notFound("Không tìm thấy học phí");

    // Calculate remaining debt
    const totalDebt = tuitionFee.items.reduce((sum, item) => sum + item.debt, 0);
    if (totalDebt <= 0) {
      throw badRequest("Học phí đã được thanh toán đầy đủ");
    }

    if (amount > totalDebt) {
      throw badRequest(`Số tiền thanh toán (${amount}) vượt quá số nợ còn lại (${totalDebt})`);
    }

    // Generate unique txnRef
    const txnRef = `TF${tuitionFeeId}_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    // Create pending transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        studentId: student.id,
        tuitionFeeId,
        txnRef,
        amount,
        orderInfo: `Thanh toan hoc phi ${tuitionFee.semester.name} - ${tuitionFee.semester.academicYear}`,
        status: "PENDING",
      },
    });

    // Get client IP
    const ipAddr =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      "127.0.0.1";

    // Create VNPay payment URL
    const paymentUrl = createPaymentUrl({
      txnRef,
      amount,
      orderInfo: transaction.orderInfo,
      ipAddr: typeof ipAddr === "string" ? ipAddr.split(",")[0].trim() : "127.0.0.1",
    });

    await createAuditLog({
      userId: req.user.id,
      action: "CREATE_PAYMENT",
      entity: "PaymentTransaction",
      entityId: String(transaction.id),
      metadata: { tuitionFeeId, amount, txnRef },
    });

    return res.json({
      data: {
        transactionId: transaction.id,
        paymentUrl,
        txnRef,
        amount,
      },
      message: "Đã tạo link thanh toán VNPay",
    });
  } catch (error) {
    return next(error);
  }
}

/**
 * VNPay redirect return URL (user browser redirected here after payment)
 * GET /api/vnpay/return
 */
export async function vnpayReturn(req, res) {
  try {
    console.log("[VNPay Return] Query params:", JSON.stringify(req.query));

    const result = verifyReturnUrl(req.query);
    console.log("[VNPay Return] Verify result:", JSON.stringify({ isValid: result.isValid, responseCode: result.responseCode, txnRef: result.txnRef }));

    if (!result.isValid) {
      return res.send(renderPaymentResultHtml({ status: "error", message: "Chữ ký không hợp lệ" }));
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { txnRef: result.txnRef },
    });

    if (!transaction) {
      return res.send(renderPaymentResultHtml({ status: "error", message: "Không tìm thấy giao dịch" }));
    }

    const isSuccess = result.responseCode === "00";

    // Update transaction status
    await prisma.paymentTransaction.update({
      where: { txnRef: result.txnRef },
      data: {
        status: isSuccess ? "SUCCESS" : "FAILED",
        vnpTxnNo: result.vnpTxnNo || null,
        bankCode: result.bankCode || null,
        payDate: result.payDate || null,
        vnpResponseCode: result.responseCode,
      },
    });

    // If success, update tuition fee items
    if (isSuccess) {
      await applyPaymentToTuitionFee(transaction.tuitionFeeId, transaction.amount);
    }

    return res.send(renderPaymentResultHtml({
      status: isSuccess ? "success" : "failed",
      txnRef: result.txnRef,
      amount: transaction.amount,
      vnpTxnNo: result.vnpTxnNo,
    }));
  } catch (error) {
    console.error("[VNPay Return] Error:", error);
    return res.send(renderPaymentResultHtml({ status: "error", message: "Lỗi hệ thống" }));
  }
}

function renderPaymentResultHtml({ status, txnRef, amount, vnpTxnNo, message }) {
  const isSuccess = status === "success";
  const isError = status === "error";
  const title = isSuccess ? "Thanh toán thành công!" : isError ? "Lỗi thanh toán" : "Thanh toán thất bại";
  const color = isSuccess ? "#16a34a" : isError ? "#dc2626" : "#ca8a04";
  const icon = isSuccess ? "&#10004;" : isError ? "&#10008;" : "&#9888;";
  const desc = isSuccess
    ? "Giao dịch của bạn đã được xử lý thành công."
    : message || "Giao dịch không thành công hoặc đã bị huỷ.";

  const formatCurrency = (v) => v ? Number(v).toLocaleString("vi-VN") + " đ" : "";

  return `<!DOCTYPE html>
<html lang="vi"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;background:#f1f5f9;display:flex;align-items:center;justify-content:center;min-height:100vh;padding:16px}
.card{background:#fff;border-radius:16px;box-shadow:0 4px 24px rgba(0,0,0,.08);padding:40px 32px;max-width:420px;width:100%;text-align:center}
.icon{width:64px;height:64px;border-radius:50%;display:inline-flex;align-items:center;justify-content:center;font-size:28px;color:#fff;background:${color};margin-bottom:16px}
h1{font-size:22px;color:${color};margin-bottom:8px}
.desc{color:#64748b;font-size:14px;margin-bottom:24px}
.details{background:#f8fafc;border-radius:10px;padding:16px;text-align:left;font-size:13px;margin-bottom:24px}
.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #e2e8f0}
.row:last-child{border:none}
.label{color:#94a3b8}
.value{color:#1e293b;font-weight:600;font-family:monospace;font-size:12px}
.close-hint{color:#94a3b8;font-size:13px;margin-top:8px}
</style></head><body>
<div class="card">
  <div class="icon">${icon}</div>
  <h1>${title}</h1>
  <p class="desc">${desc}</p>
  ${txnRef || amount || vnpTxnNo ? `<div class="details">
    ${txnRef ? `<div class="row"><span class="label">Mã giao dịch</span><span class="value">${txnRef}</span></div>` : ""}
    ${amount ? `<div class="row"><span class="label">Số tiền</span><span class="value">${formatCurrency(amount)}</span></div>` : ""}
    ${vnpTxnNo ? `<div class="row"><span class="label">Mã VNPay</span><span class="value">${vnpTxnNo}</span></div>` : ""}
  </div>` : ""}
  <p class="close-hint">Bạn có thể đóng trang này.</p>
</div></body></html>`;
}

/**
 * VNPay IPN (Instant Payment Notification) - server-to-server callback
 * GET /api/vnpay/ipn
 */
export async function vnpayIpn(req, res) {
  try {
    const result = verifyReturnUrl(req.query);

    if (!result.isValid) {
      return res.json({ RspCode: "97", Message: "Invalid checksum" });
    }

    const transaction = await prisma.paymentTransaction.findUnique({
      where: { txnRef: result.txnRef },
    });

    if (!transaction) {
      return res.json({ RspCode: "01", Message: "Transaction not found" });
    }

    if (transaction.status !== "PENDING") {
      return res.json({ RspCode: "02", Message: "Transaction already processed" });
    }

    // Verify amount matches
    if (transaction.amount !== result.amount) {
      return res.json({ RspCode: "04", Message: "Amount mismatch" });
    }

    const isSuccess = result.responseCode === "00";

    await prisma.paymentTransaction.update({
      where: { txnRef: result.txnRef },
      data: {
        status: isSuccess ? "SUCCESS" : "FAILED",
        vnpTxnNo: result.vnpTxnNo || null,
        bankCode: result.bankCode || null,
        payDate: result.payDate || null,
        vnpResponseCode: result.responseCode,
      },
    });

    if (isSuccess) {
      await applyPaymentToTuitionFee(transaction.tuitionFeeId, transaction.amount);
    }

    return res.json({ RspCode: "00", Message: "Confirm Success" });
  } catch (error) {
    console.error("VNPay IPN error:", error);
    return res.json({ RspCode: "99", Message: "Unknown error" });
  }
}

/**
 * Student: list own payment transactions
 * GET /student/payments
 */
export async function listStudentPayments(req, res, next) {
  try {
    const student = await getStudentOrThrow(req.user.id);

    const transactions = await prisma.paymentTransaction.findMany({
      where: { studentId: student.id },
      include: {
        tuitionFee: {
          include: { semester: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: transactions });
  } catch (error) {
    return next(error);
  }
}

/**
 * Admin: list all payment transactions
 * GET /admin/payment-transactions
 */
export async function listPaymentTransactions(req, res, next) {
  try {
    const { status, studentId } = req.query;

    const where = {};
    if (status) where.status = status;
    if (studentId) where.studentId = Number(studentId);

    const transactions = await prisma.paymentTransaction.findMany({
      where,
      include: {
        student: {
          include: {
            user: { select: { fullName: true, email: true } },
          },
        },
        tuitionFee: {
          include: { semester: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return res.json({ data: transactions });
  } catch (error) {
    return next(error);
  }
}

/**
 * Apply payment amount to tuition fee items (oldest debt first)
 */
async function applyPaymentToTuitionFee(tuitionFeeId, amount) {
  const items = await prisma.tuitionFeeItem.findMany({
    where: { tuitionFeeId, debt: { gt: 0 } },
    orderBy: { id: "asc" },
  });

  let remaining = amount;

  for (const item of items) {
    if (remaining <= 0) break;

    const payAmount = Math.min(remaining, item.debt);
    remaining -= payAmount;

    await prisma.tuitionFeeItem.update({
      where: { id: item.id },
      data: {
        amountPaid: item.amountPaid + payAmount,
        debt: Math.max(0, item.debt - payAmount),
        paidAt: item.debt - payAmount <= 0 ? new Date() : item.paidAt,
      },
    });
  }
}
