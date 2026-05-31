"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
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
        redirectIfAuthenticated(session);
      }
    });

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router]);

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const { data, error: signInError } =
        await supabase.auth.signInWithPassword({
          email,
          password,
        });

      if (signInError) throw signInError;
      if (!data?.session) throw new Error("ไม่สามารถสร้าง session ได้");

      router.replace("/dashboard");
    } catch (err) {
      const message = err instanceof Error ? err.message : String(err);
      setError(message || "เกิดข้อผิดพลาด");
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleLogin}
      className="w-full max-w-[420px] rounded-2xl border border-[#E5E7EB] bg-white p-7 shadow-[0_24px_80px_rgba(15,23,42,0.10)]"
    >
      <div className="mb-7 flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-xl border border-[#E5E7EB] bg-[#F8FAFC]">
          <Image
            src="/zort-logo.svg"
            alt="Zort Stock"
            width={44}
            height={34}
            priority
          />
        </div>
        <div className="min-w-0">
          <h1 className="text-xl font-bold text-[#111827]">เข้าสู่ระบบ</h1>
          <p className="text-sm text-[#6B7280]">จัดการสต็อกสินค้าได้ทันที</p>
        </div>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="mb-2 block text-sm font-semibold text-[#111827]">
            อีเมล
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="user@example.com"
            required
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#E0F2FE]"
          />
        </div>

        <div>
          <label className="mb-2 block text-sm font-semibold text-[#111827]">
            รหัสผ่าน
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="กรอกรหัสผ่าน"
            required
            className="h-11 w-full rounded-xl border border-[#D1D5DB] bg-white px-4 text-sm text-[#111827] outline-none transition-colors placeholder:text-[#9CA3AF] focus:border-[#0EA5E9] focus:ring-4 focus:ring-[#E0F2FE]"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-[#0F766E] px-4 text-sm font-semibold text-white transition-colors hover:bg-[#115E59] disabled:cursor-not-allowed disabled:opacity-60"
      >
        {loading && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
        )}
        <span>{loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}</span>
      </button>

      <p className="mt-5 text-center text-sm text-[#6B7280]">
        ยังไม่มีบัญชี?{" "}
        <Link href="/signup" className="font-semibold text-[#0F766E] hover:underline">
          สมัครใช้งาน
        </Link>
      </p>
    </form>
  );
}
