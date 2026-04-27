"use client";

import { useEffect } from "react";
import { Workbox } from "workbox-window";

export function RegisterServiceWorker() {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) {
      return;
    }

    const workbox = new Workbox("/sw.js");
    void workbox.register();
  }, []);

  return null;
}
