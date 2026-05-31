import { SignUpForm } from "@/components/SignUpForm";

export default function SignUpPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#0B1220] p-4 text-[#111827]">
      <div className="w-full max-w-[420px]">
        <SignUpForm />
      </div>
    </main>
  );
}
