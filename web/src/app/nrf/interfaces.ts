export interface Shortcut {
  name: string;
  url: string;
  backgroundColor: StoredBackgroundColors;
}

export enum LightBackgroundColors {
  Red = "#FF6B6B",
  Blue = "#4ECDC4",
  Green = "#45B7A0",
  Yellow = "#FFD93D",
  Purple = "#9B59B6",
  Orange = "#FF8C42",
  Pink = "#FF69B4",
}

export enum DarkBackgroundColors {
  Red = "#8E2323",
  Blue = "#1A5F7A",
  Green = "#2D6E4E",
  Yellow = "#B8860B",
  Purple = "#5B3256",
  Orange = "#C25E00",
  Pink = "#B03060",
}

export enum StoredBackgroundColors {
  RED = "Red",
  BLUE = "Blue",
  GREEN = "Green",
  YELLOW = "Yellow",
  PURPLE = "Purple",
  ORANGE = "Orange",
  PINK = "Pink",
}
export type BackgroundColors = LightBackgroundColors | DarkBackgroundColors;

export interface Shortcut {
  name: string;
  url: string;
  backgroundColor: StoredBackgroundColors;
}

export const darkImages = [
  "https://images.unsplash.com/photo-1692520883599-d543cfe6d43d?q=80&w=2666&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1520330461350-508fab483d6a?q=80&w=2723&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

export const lightImages = [
  "https://images.unsplash.com/photo-1473830439578-14e9a9e61d55?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1500964757637-c85e8a162699?q=80&w=2703&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
  "https://images.unsplash.com/photo-1475924156734-496f6cac6ec1?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
];

// Local storage keys
export const SHORTCUTS_KEY = "shortCuts";
export const NEW_TAB_PAGE_VIEW_KEY = "newTabPageView";
export const USE_ONYX_AS_NEW_TAB_KEY = "useOnyxAsNewTab";

// Default values
export const DEFAULT_LIGHT_BACKGROUND_IMAGE = "onyxBackgroundLight";
export const DEFAULT_DARK_BACKGROUND_IMAGE = "onyxBackgroundDark";
export const DEFAULT_NEW_TAB_PAGE_VIEW = "chat";
