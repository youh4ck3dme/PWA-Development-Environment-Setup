import Link from "next/link";
import { Suspense } from "react";
import { LoginForm } from "@/components/auth/login-form";
import { SectionCard } from "@/components/layout/section-card";

export default function LoginPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="Authentication"
          title="Secure sign-in flow"
          description="Email/password and Google OAuth will be wired through Supabase with RLS-protected inventory data and guarded dashboard routes."
        >
          <Suspense fallback={<div className="text-sm text-slate-400">Loading sign-in form...</div>}>
            <LoginForm />
          </Suspense>
        </SectionCard>
        <SectionCard
          eyebrow="Navigation"
          title="No account yet?"
          description="The signup flow will provision the user profile and bootstrap an initial personal workspace."
        >
          <Link href="/signup" className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
            Create account
          </Link>
        </SectionCard>
      </div>
    </main>
  );
}
