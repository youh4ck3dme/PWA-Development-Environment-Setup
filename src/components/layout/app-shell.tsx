import Link from "next/link";
import { navigation, siteConfig } from "@/lib/constants/site";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineBanner } from "@/components/pwa/offline-banner";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { AccountMenu } from "@/components/auth/account-menu";

interface AppShellProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export function AppShell({ title, description, children }: AppShellProps) {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="border-b border-white/10 bg-slate-950/80 backdrop-blur">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4 sm:px-10">
          <div>
            <p className="text-xs uppercase tracking-[0.24em] text-emerald-300">
              {siteConfig.name}
            </p>
            <p className="mt-1 text-sm text-slate-400">{description}</p>
          </div>
          <div className="flex items-center gap-3">
            <InstallPrompt />
            <ThemeToggle />
            <AccountMenu />
          </div>
          <nav className="flex items-center gap-5 text-sm text-slate-300">
            {navigation.primary.map((item) => (
              <Link key={item.href} href={item.href} className="transition hover:text-white">
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 py-10 sm:px-10">
        <div className="mb-6">
          <OfflineBanner />
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-tight text-white">{title}</h1>
          <p className="mt-3 max-w-2xl text-sm leading-7 text-slate-400">{description}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
