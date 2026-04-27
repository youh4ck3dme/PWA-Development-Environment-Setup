"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";

interface DeferredPrompt extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed" }>;
}

export function InstallPrompt() {
  const [promptEvent, setPromptEvent] = useState<DeferredPrompt | null>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      setPromptEvent(event as DeferredPrompt);
    };

    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  if (!promptEvent) {
    return null;
  }

  return (
    <Button
      variant="secondary"
      onClick={async () => {
        await promptEvent.prompt();
        await promptEvent.userChoice;
        setPromptEvent(null);
      }}
    >
      Install app
    </Button>
  );
}
