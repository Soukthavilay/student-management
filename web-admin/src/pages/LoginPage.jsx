import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../state/auth-context";
import FormField from "../components/FormField";

const schema = z.object({
  email: z.string().email("Email không hợp lệ"),
  password: z.string().min(6, "Mật khẩu tối thiểu 6 ký tự"),
});

export default function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: {
      email: "admin@school.edu.vn",
      password: "Admin@123",
    },
  });

  const onSubmit = handleSubmit(async (values) => {
    try {
      setServerError("");
      const user = await login(values);

      if (user.role === "LECTURER") {
        navigate("/lecturer/grades", { replace: true });
        return;
      }

      navigate("/dashboard", { replace: true });
    } catch (error) {
      setServerError(error?.response?.data?.message || error?.message || "Đăng nhập thất bại");
    }
  });

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
      <form onSubmit={onSubmit} className="w-full max-w-md space-y-4 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h1 className="text-xl font-semibold text-slate-900">Đăng nhập hệ thống</h1>
        <p className="text-sm text-slate-500">Dùng tài khoản admin hoặc giảng viên để vào web quản trị.</p>

        <FormField label="Email" error={errors.email?.message}>
          <input
            className="rounded border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            type="email"
            {...register("email")}
          />
        </FormField>

        <FormField label="Mật khẩu" error={errors.password?.message}>
          <input
            className="rounded border border-slate-300 px-3 py-2 outline-none ring-slate-300 focus:ring"
            type="password"
            {...register("password")}
          />
        </FormField>

        {serverError ? <p className="text-sm text-rose-600">{serverError}</p> : null}

        <button
          type="submit"
          className="w-full rounded bg-slate-800 px-4 py-2 text-sm font-medium text-white"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Đang đăng nhập..." : "Đăng nhập"}
        </button>
      </form>
    </div>
  );
}
