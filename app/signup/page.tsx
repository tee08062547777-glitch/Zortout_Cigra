import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1220] px-3 py-6 text-[#111827] sm:p-4">
      <div className="w-full max-w-[420px]">
        <SignUpForm />
      </div>
    </main>
  );
}
