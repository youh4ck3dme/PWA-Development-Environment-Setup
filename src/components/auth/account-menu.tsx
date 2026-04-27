"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { signOut } from "@/components/auth/client-auth";

interface ProfileState {
  displayName: string;
  email: string;
  isPro: boolean;
  initials: string;
}

export function AccountMenu() {
  const [profile, setProfile] = useState<ProfileState | null>(null);
  const [open, setOpen] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;

      const { data } = await supabase
        .from("profiles")
        .select("full_name, is_pro")
        .eq("id", user.id)
        .single();

      const displayName = data?.full_name ?? user.email ?? "Account";
      const initials = displayName.slice(0, 2).toUpperCase();

      setProfile({
        displayName,
        email: user.email ?? "",
        isPro: data?.is_pro ?? false,
        initials,
      });
    }
    load();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  async function handleSignOut() {
    setSigningOut(true);
    await signOut();
    router.push("/");
  }

  if (!profile) {
    return (
      <div className="h-8 w-8 animate-pulse rounded-full bg-white/10" aria-hidden="true" />
    );
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open ? "true" : "false"}
        aria-haspopup="menu"
        className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-slate-300 transition hover:bg-white/5 hover:text-white"
      >
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-xs font-semibold text-white">
          {profile.initials}
        </span>
        <span className="hidden max-w-[110px] truncate sm:block">{profile.displayName}</span>
        {profile.isPro && (
          <span className="rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
            Pro
          </span>
        )}
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-20 mt-1 w-52 overflow-hidden rounded-xl border border-white/10 bg-slate-900 shadow-xl"
        >
          <div className="border-b border-white/10 px-3 py-2.5">
            <p className="truncate text-xs text-slate-400">{profile.email}</p>
          </div>

          <div className="flex items-center justify-between px-3 py-2">
            <span className="text-xs text-slate-500">Plan</span>
            {profile.isPro ? (
              <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-emerald-300">
                Pro
              </span>
            ) : (
              <span className="rounded-full bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-widest text-slate-400">
                Free
              </span>
            )}
          </div>

          <div className="border-t border-white/10 p-1">
            <button
              role="menuitem"
              onClick={handleSignOut}
              disabled={signingOut}
              className="w-full rounded-lg px-3 py-1.5 text-left text-sm text-slate-300 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              {signingOut ? "Signing out…" : "Sign out"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
