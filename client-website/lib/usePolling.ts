"use client";

import { useState, useEffect, useRef } from "react";
import { LiveDemoState, DEFAULT_STATE } from "./types";

export function usePolling(intervalMs = 2000): LiveDemoState {
  const [state, setState] = useState<LiveDemoState>(DEFAULT_STATE);
  const prevState = useRef<string>(JSON.stringify(DEFAULT_STATE));

  useEffect(() => {
    const poll = async () => {
      try {
        const res = await fetch("/api/state", { cache: "no-store" });
        const data = await res.json();
        const json = JSON.stringify(data);
        if (json !== prevState.current) {
          prevState.current = json;
          setState(data);
        }
      } catch {
        // server not available, keep current state
      }
    };
    poll();
    const id = setInterval(poll, intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);

  return state;
}
