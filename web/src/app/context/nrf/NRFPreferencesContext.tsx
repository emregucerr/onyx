"use client";

import React, { createContext, useContext, useState } from "react";
import { Shortcut } from "../../nrf/interfaces";

interface NRFPreferencesContextValue {
  theme: string;
  setTheme: (t: string) => void;
  defaultLightBackgroundUrl: string;
  setDefaultLightBackgroundUrl: (val: string) => void;
  defaultDarkBackgroundUrl: string;
  setDefaultDarkBackgroundUrl: (val: string) => void;
  shortcuts: Shortcut[];
  setShortcuts: (s: Shortcut[]) => void;
  useOnyxAsNewTab: boolean;
  setUseOnyxAsNewTab: (v: boolean) => void;
  showShortcuts: boolean;
  setShowShortcuts: (v: boolean) => void;
}

const NRFPreferencesContext = createContext<
  NRFPreferencesContextValue | undefined
>(undefined);

function useLocalStorageState<T>(
  key: string,
  defaultValue: T
): [T, (value: T) => void] {
  const [state, setState] = useState<T>(() => {
    if (typeof window !== "undefined") {
      const storedValue = localStorage.getItem(key);
      return storedValue ? JSON.parse(storedValue) : defaultValue;
    }
    return defaultValue;
  });

  const setValue = (value: T) => {
    setState(value);
    if (typeof window !== "undefined") {
      localStorage.setItem(key, JSON.stringify(value));
    }
  };

  return [state, setValue];
}

export function NRFPreferencesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [theme, setTheme] = useLocalStorageState<string>("onyxTheme", "dark");
  const [defaultLightBackgroundUrl, setDefaultLightBackgroundUrl] =
    useLocalStorageState<string>("lightBgUrl", "");
  const [defaultDarkBackgroundUrl, setDefaultDarkBackgroundUrl] =
    useLocalStorageState<string>("darkBgUrl", "");
  const [shortcuts, setShortcuts] = useLocalStorageState<Shortcut[]>(
    "shortCuts",
    []
  );
  const [showShortcuts, setShowShortcuts] = useLocalStorageState<boolean>(
    "showShortcuts",
    true
  );
  const [useOnyxAsNewTab, setUseOnyxAsNewTab] = useLocalStorageState<boolean>(
    "useOnyxAsNewTab",
    true
  );

  return (
    <NRFPreferencesContext.Provider
      value={{
        theme,
        setTheme,
        defaultLightBackgroundUrl,
        setDefaultLightBackgroundUrl,
        defaultDarkBackgroundUrl,
        setDefaultDarkBackgroundUrl,
        shortcuts,
        setShortcuts,
        useOnyxAsNewTab,
        setUseOnyxAsNewTab,
        showShortcuts,
        setShowShortcuts,
      }}
    >
      {children}
    </NRFPreferencesContext.Provider>
  );
}

export function useNRFPreferences() {
  const context = useContext(NRFPreferencesContext);
  if (!context) {
    throw new Error(
      "useNRFPreferences must be used within an NRFPreferencesProvider"
    );
  }
  return context;
}
