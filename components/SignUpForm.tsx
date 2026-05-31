"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export function SignUpForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("รหัสผ่านไม่ตรงกัน");
      return;
    }

    if (password.length < 6) {
      setError("รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร");
      return;
    }

    setLoading(true);

    try {
      // Sign up
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) throw signUpError;
      if (!data?.user) throw new Error("Failed to create user");

      const userId = data.user.id;

      // Create sync settings for new user
      const { error: syncError } = await supabase.from("sync_settings").insert({
        user_id: userId,
        auto_sync_enabled: false,
        sync_interval_minutes: 60,
      });

      if (syncError) {
        console.error("Sync settings error:", syncError);
        // Continue anyway - sync settings can be created later
      }

      alert("บัญชีถูกสร้างสำเร็จ! กรุณาเข้าสู่ระบบ");
      router.push("/login");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "เกิดข้อผิดพลาด");
      console.error("SignUp error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSignUp}
      className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-2 text-[#111827]">สมัครสมาชิก</h1>
      <p className="text-sm text-[#6B7280] mb-6">
        สร้างบัญชีเพื่อจัดการสต็อกสินค้า
      </p>

      {error && (
        <div className="bg-red-100 border border-red-300 text-red-700 text-xs rounded-lg p-3 mb-4">
          {error}
        </div>
      )}

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#111827] mb-2">
          อีเมล
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="user@example.com"
          required
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#10B981]"
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-semibold text-[#111827] mb-2">
          รหัสผ่าน
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#10B981]"
        />
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-[#111827] mb-2">
          ยืนยันรหัสผ่าน
        </label>
        <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="••••••••"
          required
          className="w-full px-4 py-2 border border-[#E5E7EB] rounded-lg text-sm outline-none focus:border-[#10B981]"
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50"
      >
        {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
      </button>

      <p className="text-xs text-[#6B7280] text-center mt-4">
        มีบัญชีแล้ว?{" "}
        <a
          href="/login"
          className="text-[#10B981] font-semibold hover:underline"
        >
          เข้าสู่ระบบ
        </a>
      </p>
    </form>
  );
}
