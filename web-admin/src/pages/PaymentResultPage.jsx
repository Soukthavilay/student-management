import { useSearchParams, Link } from "react-router-dom";

function formatCurrency(amount) {
  if (!amount || amount === 0) return "0";
  return Number(amount).toLocaleString("vi-VN");
}

export default function PaymentResultPage() {
  const [searchParams] = useSearchParams();

  const status = searchParams.get("status");
  const txnRef = searchParams.get("txnRef");
  const amount = searchParams.get("amount");
  const vnpTxnNo = searchParams.get("vnpTxnNo");
  const message = searchParams.get("message");

  const isSuccess = status === "success";
  const isError = status === "error";

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-8 shadow-lg text-center">
        {isSuccess ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
              <svg className="h-8 w-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-green-700">Thanh toán thành công!</h1>
            <p className="mb-6 text-slate-500">Giao dịch của bạn đã được xử lý thành công.</p>
          </>
        ) : isError ? (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
              <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-red-700">Lỗi thanh toán</h1>
            <p className="mb-6 text-slate-500">
              {message === "invalid_checksum"
                ? "Chữ ký không hợp lệ. Vui lòng thử lại."
                : message === "transaction_not_found"
                ? "Không tìm thấy giao dịch."
                : "Đã có lỗi xảy ra trong quá trình thanh toán."}
            </p>
          </>
        ) : (
          <>
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100">
              <svg className="h-8 w-8 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <h1 className="mb-2 text-2xl font-bold text-yellow-700">Thanh toán thất bại</h1>
            <p className="mb-6 text-slate-500">Giao dịch không thành công hoặc đã bị huỷ.</p>
          </>
        )}

        {/* Transaction details */}
        <div className="mb-6 rounded-lg bg-slate-50 p-4 text-left text-sm">
          {txnRef && (
            <div className="flex justify-between border-b border-slate-200 py-2">
              <span className="text-slate-500">Mã giao dịch</span>
              <span className="font-mono text-xs font-medium text-slate-700">{txnRef}</span>
            </div>
          )}
          {amount && (
            <div className="flex justify-between border-b border-slate-200 py-2">
              <span className="text-slate-500">Số tiền</span>
              <span className="font-medium text-slate-700">{formatCurrency(amount)} đ</span>
            </div>
          )}
          {vnpTxnNo && (
            <div className="flex justify-between py-2">
              <span className="text-slate-500">Mã VNPay</span>
              <span className="font-mono text-xs font-medium text-slate-700">{vnpTxnNo}</span>
            </div>
          )}
        </div>

        <Link
          to="/dashboard"
          className="inline-block rounded-lg bg-slate-900 px-6 py-3 text-sm font-medium text-white hover:bg-slate-700"
        >
          Về trang chủ
        </Link>
      </div>
    </div>
  );
}
