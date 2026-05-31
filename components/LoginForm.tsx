"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase";

export function LoginForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  useEffect(() => {
    let mounted = true;

    const redirectIfAuthenticated = (session: Session | null) => {
      if (mounted && session) {
        router.replace("/dashboard");
      }
    };

    void supabase.auth.getSession().then(({ data: { session } }) => {
      redirectIfAuthenticated(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if ((event === "SIGNED_IN" || event === "INITIAL_SESSION") && session) {
        console.log("✅ Signed in, redirecting...", session.user.email);
        router.replace("/dashboard");
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      if (!data?.session) throw new Error("No session created");

      console.log("✅ Login successful:", data.session.user.email);

      // Redirect immediately without waiting
      window.location.href = "/dashboard";
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "เกิดข้อผิดพลาด");
      console.error("Login error:", err);
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-sm bg-white rounded-2xl p-8 shadow-lg"
    >
      <h1 className="text-2xl font-bold mb-2 text-[#111827]">ยินดีต้อนรับ</h1>
      <p className="text-sm text-[#6B7280] mb-6">
        เข้าสู่ระบบเพื่อจัดการสต็อกสินค้า
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

      <div className="mb-6">
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

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-[#10B981] text-white font-semibold py-2 rounded-lg hover:bg-[#059669] transition-colors disabled:opacity-50"
      >
        {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
      </button>

      <p className="text-xs text-[#6B7280] text-center mt-4">
        ยังไม่มีบัญชี?{" "}
        <a
          href="/signup"
          className="text-[#10B981] font-semibold hover:underline"
        >
          สมัครสมาชิก
        </a>
      </p>
    </form>
  );
}
