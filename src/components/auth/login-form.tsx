"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { bootstrapProfile, getAuthCallbackUrl } from "@/components/auth/client-auth";
import { createClient } from "@/lib/supabase/client";
import { loginSchema, type LoginInput } from "@/lib/forms/schemas";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

type LoginFormValues = {
  email: string;
  password: string;
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues, unknown, LoginInput>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const callbackError = useMemo(() => {
    const error = searchParams.get("error");

    if (error === "oauth_callback_failed") {
      return "Google sign-in could not be completed. Retry the flow from this page.";
    }

    if (error === "profile_bootstrap_failed") {
      return "Authentication succeeded, but the profile could not be initialized. Retry the login flow.";
    }

    return null;
  }, [searchParams]);

  return (
    <form
      className="grid gap-4"
      onSubmit={handleSubmit(async (values) => {
        const supabase = createClient();
        setAuthError(null);

        const { error } = await supabase.auth.signInWithPassword(values);

        if (error) {
          setAuthError(error.message);
          return;
        }

        try {
          await bootstrapProfile();
        } catch {
          setAuthError("Signed in, but the profile could not be initialized. Retry after refresh.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      })}
    >
      <Input placeholder="Email" type="email" autoComplete="email" {...register("email")} />
      {errors.email ? <p className="text-sm text-rose-300">{errors.email.message}</p> : null}
      <Input
        placeholder="Password"
        type="password"
        autoComplete="current-password"
        {...register("password")}
      />
      {errors.password ? <p className="text-sm text-rose-300">{errors.password.message}</p> : null}
      {authError || callbackError ? (
        <p className="rounded-2xl border border-rose-400/30 bg-rose-400/10 px-4 py-3 text-sm text-rose-200">
          {authError ?? callbackError}
        </p>
      ) : null}
      <Button disabled={isSubmitting} type="submit" size="lg" className="w-full rounded-2xl">
        {isSubmitting ? "Signing in..." : "Sign in"}
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
        No account yet?{" "}
        <Link href="/signup" className="font-medium text-emerald-300 transition hover:text-emerald-200">
          Create one
        </Link>
      </p>
    </form>
  );
}