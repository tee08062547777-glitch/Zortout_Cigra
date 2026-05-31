"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";
import { Sidebar } from "@/components/Sidebar";
import { Header } from "@/components/Header";

interface SyncSettings {
  auto_sync_enabled: boolean;
  sync_interval_minutes: number;
  last_sync_at: string | null;
}

interface ApiCredentials {
  zort_cookie: string;
  zort_mid: string;
  zort_cs: string;
}

const intervalOptions = [
  { value: 15, label: "15 นาที" },
  { value: 30, label: "30 นาที" },
  { value: 60, label: "1 ชั่วโมง" },
  { value: 240, label: "4 ชั่วโมง" },
  { value: 1440, label: "1 วัน" },
];

export default function SettingsPage() {
  const router = useRouter();
  const initialized = useRef(false);
  const [user, setUser] = useState<{ id: string; email?: string } | null>(null);
  const [settings, setSettings] = useState<SyncSettings>({
    auto_sync_enabled: false,
    sync_interval_minutes: 60,
    last_sync_at: null,
  });
  const [credentials, setCredentials] = useState<ApiCredentials>({
    zort_cookie: "",
    zort_mid: "212548",
    zort_cs: "n21g8113",
  });
  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [savingCredentials, setSavingCredentials] = useState(false);
  const [settingsMessage, setSettingsMessage] = useState("");
  const [credentialMessage, setCredentialMessage] = useState("");

  const loadSettings = async (userId: string) => {
    const { data, error } = await supabase
      .from("sync_settings")
      .select("auto_sync_enabled, sync_interval_minutes, last_sync_at")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data) {
      setSettings({
        auto_sync_enabled: data.auto_sync_enabled,
        sync_interval_minutes: data.sync_interval_minutes || 60,
        last_sync_at: data.last_sync_at,
      });
    }
  };

  const loadCredentials = async (userId: string) => {
    const { data, error } = await supabase
      .from("api_credentials")
      .select("zort_cookie, zort_mid, zort_cs")
      .eq("user_id", userId)
      .single();

    if (error && error.code !== "PGRST116") throw error;

    if (data) {
      setCredentials({
        zort_cookie: data.zort_cookie || "",
        zort_mid: data.zort_mid || "212548",
        zort_cs: data.zort_cs || "n21g8113",
      });
    }
  };

  const checkAuth = useCallback(async () => {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      router.push("/login");
      return;
    }

    setUser(user);

    try {
      await Promise.all([loadSettings(user.id), loadCredentials(user.id)]);
    } catch (error) {
      console.error("Failed to load settings:", error);
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    if (!initialized.current) {
      initialized.current = true;
      checkAuth();
    }
  }, [checkAuth]);

  const saveSettings = async () => {
    if (!user) return;

    setSavingSettings(true);
    setSettingsMessage("");

    try {
      const { data: existing, error: existingError } = await supabase
        .from("sync_settings")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (existingError && existingError.code !== "PGRST116") {
        throw existingError;
      }

      if (existing?.id) {
        const { error } = await supabase
          .from("sync_settings")
          .update({
            auto_sync_enabled: settings.auto_sync_enabled,
            sync_interval_minutes: settings.sync_interval_minutes,
            updated_at: new Date().toISOString(),
          })
          .eq("user_id", user.id);

        if (error) throw error;
      } else {
        const { error } = await supabase.from("sync_settings").insert({
          user_id: user.id,
          auto_sync_enabled: settings.auto_sync_enabled,
          sync_interval_minutes: settings.sync_interval_minutes,
        });

        if (error) throw error;
      }

      setSettingsMessage("บันทึกการตั้งค่าซิงค์แล้ว");
      setTimeout(() => setSettingsMessage(""), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setSettingsMessage("บันทึกไม่สำเร็จ: " + message);
      console.error("Failed to save settings:", error);
    } finally {
      setSavingSettings(false);
    }
  };

  const saveCredentials = async () => {
    if (!user) return;

    setSavingCredentials(true);
    setCredentialMessage("");

    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      const response = await fetch("/api/credentials", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session?.access_token}`,
        },
        body: JSON.stringify(credentials),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to save credentials");
      }

      setCredentialMessage("บันทึก Zortout credentials แล้ว");
      setTimeout(() => setCredentialMessage(""), 3000);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setCredentialMessage("บันทึกไม่สำเร็จ: " + message);
      console.error("Failed to save credentials:", error);
    } finally {
      setSavingCredentials(false);
    }
  };

  const lastSyncText = settings.last_sync_at
    ? new Date(settings.last_sync_at).toLocaleString("th-TH")
    : "ยังไม่เคยซิงค์";

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F8FAFC]">
        <div className="text-sm text-[#6B7280]">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-[#F8FAFC]">
      <Sidebar />

      <div className="flex min-h-screen flex-1 flex-col pb-16 transition-[margin] duration-200 md:ml-[var(--sidebar-offset,210px)] md:pb-0">
        <Header
          title="ตั้งค่า"
          subtitle="จัดการการซิงค์สต็อกและข้อมูลเชื่อมต่อ Zortout"
        />

        <main className="flex-1 overflow-auto px-3 py-3 sm:px-[22px] sm:py-[18px]">
          <div className="grid max-w-6xl grid-cols-1 gap-5 xl:grid-cols-[minmax(0,1fr)_320px]">
            <div className="space-y-5">
              <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold text-[#111827]">
                      การซิงค์อัตโนมัติ
                    </h2>
                    <p className="mt-1 text-sm text-[#6B7280]">
                      ให้ระบบดึงข้อมูลจาก Zortout ตามช่วงเวลาที่กำหนด
                    </p>
                  </div>
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold ${
                      settings.auto_sync_enabled
                        ? "bg-[#D1FAE5] text-[#047857]"
                        : "bg-[#F3F4F6] text-[#6B7280]"
                    }`}
                  >
                    {settings.auto_sync_enabled ? "เปิดใช้งาน" : "ปิดอยู่"}
                  </span>
                </div>

                {settingsMessage && (
                  <div
                    className={`mb-4 rounded-lg border p-3 text-sm ${
                      settingsMessage.includes("ไม่สำเร็จ")
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {settingsMessage}
                  </div>
                )}

                <div className="space-y-5">
                  <label className="flex cursor-pointer flex-col gap-3 rounded-lg border border-[#E5E7EB] bg-[#F8FAFC] p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-[#111827]">
                        เปิดการซิงค์อัตโนมัติ
                      </div>
                      <div className="mt-1 text-xs text-[#6B7280]">
                        Cron จะตรวจทุก 5 นาที และซิงค์เมื่อถึงรอบเวลาที่ตั้งไว้
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={settings.auto_sync_enabled}
                      onChange={(e) =>
                        setSettings((current) => ({
                          ...current,
                          auto_sync_enabled: e.target.checked,
                        }))
                      }
                      className="h-5 w-5"
                    />
                  </label>

                  <div>
                    <div className="mb-2 flex items-center justify-between">
                      <label className="text-sm font-semibold text-[#111827]">
                        ช่วงเวลาซิงค์
                      </label>
                      <span className="text-sm font-semibold text-[#047857]">
                        {settings.sync_interval_minutes} นาที
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
                      {intervalOptions.map((option) => (
                        <button
                          key={option.value}
                          type="button"
                          onClick={() =>
                            setSettings((current) => ({
                              ...current,
                              sync_interval_minutes: option.value,
                            }))
                          }
                          className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                            settings.sync_interval_minutes === option.value
                              ? "border-[#10B981] bg-[#ECFDF5] text-[#047857]"
                              : "border-[#E5E7EB] bg-white text-[#6B7280] hover:border-[#10B981]"
                          }`}
                        >
                          {option.label}
                        </button>
                      ))}
                    </div>
                    <input
                      type="range"
                      min="5"
                      max="1440"
                      step="5"
                      value={settings.sync_interval_minutes}
                      onChange={(e) =>
                        setSettings((current) => ({
                          ...current,
                          sync_interval_minutes: Number(e.target.value),
                        }))
                      }
                      className="mt-4 w-full"
                    />
                  </div>

                  <div className="flex flex-col gap-3 rounded-lg border border-blue-200 bg-blue-50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-blue-900">
                        ซิงค์ล่าสุด
                      </div>
                      <div className="mt-1 text-xs text-blue-700">
                        {lastSyncText}
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={saveSettings}
                      disabled={savingSettings}
                      className="w-full rounded-lg bg-[#10B981] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-[#059669] disabled:opacity-50 sm:w-auto"
                    >
                      {savingSettings ? "กำลังบันทึก..." : "บันทึกการซิงค์"}
                    </button>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <div className="mb-5">
                  <h2 className="text-base font-semibold text-[#111827]">
                    Zortout Credentials
                  </h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    ใช้สำหรับดึงข้อมูลสินค้าและรูปภาพจาก Zortout
                  </p>
                </div>

                {credentialMessage && (
                  <div
                    className={`mb-4 rounded-lg border p-3 text-sm ${
                      credentialMessage.includes("ไม่สำเร็จ")
                        ? "border-red-200 bg-red-50 text-red-700"
                        : "border-green-200 bg-green-50 text-green-700"
                    }`}
                  >
                    {credentialMessage}
                  </div>
                )}

                <div className="space-y-4">
                  <div>
                    <label className="mb-2 block text-sm font-semibold text-[#111827]">
                      ZORT_COOKIE
                    </label>
                    <textarea
                      value={credentials.zort_cookie}
                      onChange={(e) =>
                        setCredentials((current) => ({
                          ...current,
                          zort_cookie: e.target.value,
                        }))
                      }
                      placeholder="วาง cookie จาก Zortout"
                      rows={4}
                      className="w-full resize-none rounded-lg border border-[#E5E7EB] px-4 py-3 font-mono text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#10B981]"
                    />
                  </div>

                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#111827]">
                        ZORT_MID
                      </label>
                      <input
                        type="text"
                        value={credentials.zort_mid}
                        onChange={(e) =>
                          setCredentials((current) => ({
                            ...current,
                            zort_mid: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#10B981]"
                      />
                    </div>
                    <div>
                      <label className="mb-2 block text-sm font-semibold text-[#111827]">
                        ZORT_CS
                      </label>
                      <input
                        type="text"
                        value={credentials.zort_cs}
                        onChange={(e) =>
                          setCredentials((current) => ({
                            ...current,
                            zort_cs: e.target.value,
                          }))
                        }
                        className="w-full rounded-lg border border-[#E5E7EB] px-4 py-2 text-sm text-[#111827] placeholder:text-[#9CA3AF] outline-none focus:border-[#10B981]"
                      />
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={saveCredentials}
                    disabled={savingCredentials || !credentials.zort_cookie.trim()}
                    className="w-full rounded-lg bg-[#3B82F6] px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-[#2563EB] disabled:opacity-50"
                  >
                    {savingCredentials ? "กำลังบันทึก..." : "บันทึก Credentials"}
                  </button>
                </div>
              </section>
            </div>

            <aside className="space-y-5">
              <section className="rounded-lg border border-[#E5E7EB] bg-white p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-[#111827]">
                  สถานะระบบ
                </h3>
                <div className="mt-4 space-y-3 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Cron schedule</span>
                    <span className="font-semibold text-[#111827]">ทุก 5 นาที</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Auto sync</span>
                    <span
                      className={
                        settings.auto_sync_enabled
                          ? "font-semibold text-[#047857]"
                          : "font-semibold text-[#6B7280]"
                      }
                    >
                      {settings.auto_sync_enabled ? "พร้อมทำงาน" : "ปิดอยู่"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-[#6B7280]">Cookie</span>
                    <span
                      className={
                        credentials.zort_cookie.trim()
                          ? "font-semibold text-[#047857]"
                          : "font-semibold text-red-600"
                      }
                    >
                      {credentials.zort_cookie.trim() ? "ตั้งค่าแล้ว" : "ยังไม่มี"}
                    </span>
                  </div>
                </div>
              </section>

              <section className="rounded-lg border border-orange-200 bg-orange-50 p-4 sm:p-5">
                <h3 className="text-sm font-semibold text-orange-900">
                  วิธีหา Cookie
                </h3>
                <ol className="mt-3 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-orange-800">
                  <li>เข้า share.zortout.com</li>
                  <li>กด F12 แล้วเปิดแท็บ Application</li>
                  <li>ไปที่ Cookies แล้วเลือก share.zortout.com</li>
                  <li>คัดลอกค่า cookie ที่ใช้เข้าสู่ระบบ</li>
                  <li>นำมาวางในช่อง ZORT_COOKIE แล้วบันทึก</li>
                </ol>
              </section>
            </aside>
          </div>
        </main>
      </div>
    </div>
  );
}
