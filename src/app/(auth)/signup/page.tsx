import Link from "next/link";
import { SignupForm } from "@/components/auth/signup-form";
import { SectionCard } from "@/components/layout/section-card";

export default function SignupPage() {
  return (
    <main className="min-h-screen bg-slate-950 px-6 py-12 text-slate-100 sm:px-10">
      <div className="mx-auto grid w-full max-w-5xl gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <SectionCard
          eyebrow="Onboarding"
          title="Create your inventory workspace"
          description="Signup will create the authenticated user, user profile row, starter workspace metadata, and default inventory preferences."
        >
          <SignupForm />
        </SectionCard>
        <SectionCard
          eyebrow="Navigation"
          title="Already have an account?"
          description="Use the login route once auth callbacks and session persistence are wired."
        >
          <Link href="/login" className="text-sm font-medium text-emerald-300 transition hover:text-emerald-200">
            Go to login
          </Link>
        </SectionCard>
      </div>
    </main>
  );
}
