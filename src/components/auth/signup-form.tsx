"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bootstrapProfile, getAuthCallbackUrl } from "@/components/auth/client-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { signupSchema, type SignupInput } from "@/lib/forms/schemas";
import { createClient } from "@/lib/supabase/client";

type SignupFormValues = {
  email: string;
  password: string;
  fullName: string;
};

export function SignupForm() {
  const router = useRouter();
  const [authError, setAuthError] = useState<string | null>(null);
  const [authNotice, setAuthNotice] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignupFormValues, unknown, SignupInput>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      email: "",
      password: "",
      fullName: "",
    },
  });

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        const supabase = createClient();
        setAuthError(null);
        setAuthNotice(null);

        const { data, error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: {
            data: {
              full_name: values.fullName,
            },
            emailRedirectTo: getAuthCallbackUrl(),
          },
        });

        if (error) {
          setAuthError(error.message);
          return;
        }

        if (data.session && data.user) {
          try {
            await bootstrapProfile({ fullName: values.fullName });
          } catch {
            setAuthError("Account created, but the profile could not be initialized. Retry after refresh.");
            return;
          }

          router.push("/dashboard");
          router.refresh();
          return;
        }

        setAuthNotice(
          "Account created. If email confirmation is enabled in Supabase, confirm the message in your inbox and then continue to login."
        );
      })}
    >
      <Input placeholder="Full name" autoComplete="name" {...register("fullName")} />
      {errors.fullName ? <p className="text-sm text-rose-300">{errors.fullName.message}</p> : null}
      <Input placeholder="Email" type="email" autoComplete="email" {...register("email")} />
      {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      <Input placeholder="Password" type="password" autoComplete="new-password" {...register("password")} />
      {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
      {authError ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {authError}
        </p>
      ) : null}
      {authNotice ? (
        <p className="rounded-2xl border border-emerald-400/30 bg-emerald-400/10 px-4 py-3 text-sm text-emerald-100">
          {authNotice}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit" size="lg" className="w-full rounded-2xl">
        {isSubmitting ? "Creating account..." : "Create account"}
      </Button>
      <Button
        disabled={isGoogleLoading || isSubmitting}
        type="button"
        variant="secondary"
        size="lg"
        className="w-full rounded-2xl"
        onClick={async () => {
          const supabase = createClient();
          setAuthError(null);
          setAuthNotice(null);
          setIsGoogleLoading(true);

          const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
              redirectTo: getAuthCallbackUrl(),
            },
          });

          if (error) {
            setAuthError(error.message);
            setIsGoogleLoading(false);
          }
        }}
      >
        {isGoogleLoading ? "Redirecting to Google..." : "Continue with Google"}
      </Button>
      <p className="text-sm text-slate-400">
        Already have an account?{" "}
        <Link href="/login" className="font-medium text-emerald-300 transition hover:text-emerald-200">
          Sign in
        </Link>
      </p>
    </form>
  );
}