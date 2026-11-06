import type { FolderColor, FolderIcon } from "./types";

export function cn(...values: Array<string | false | null | undefined>): string {
  return values.filter(Boolean).join(" ");
}

export function initials(name: string | null, email: string): string {
  const source = name?.trim();
  if (source) {
    const parts = source.split(/\s+/).filter(Boolean);
    if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
    return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
  }
  return email.slice(0, 2).toUpperCase();
}

export function relativeTime(dateString: string): string {
  const date = new Date(dateString);
  const seconds = Math.round((date.getTime() - Date.now()) / 1000);
  const formatter = new Intl.RelativeTimeFormat("en", { numeric: "auto" });

  const ranges: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 60 * 60 * 24 * 365],
    ["month", 60 * 60 * 24 * 30],
    ["week", 60 * 60 * 24 * 7],
    ["day", 60 * 60 * 24],
    ["hour", 60 * 60],
    ["minute", 60],
    ["second", 1]
  ];

  for (const [unit, secondsInUnit] of ranges) {
    if (Math.abs(seconds) >= secondsInUnit || unit === "second") {
      return formatter.format(Math.round(seconds / secondsInUnit), unit);
    }
  }
  return "just now";
}

export function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat("en", {
    day: "numeric",
    month: "short",
    year: "numeric"
  }).format(new Date(dateString));
}

export function greeting(): string {
  const hour = new Date().getHours();
  if (hour < 5) return "Still up";
  if (hour < 12) return "Good morning";
  if (hour < 18) return "Good afternoon";
  return "Good evening";
}

export function hostnameFromUrl(value: string): string {
  try {
    return new URL(value).hostname.replace(/^www\./, "");
  } catch {
    return value;
  }
}

export const FOLDER_COLORS: FolderColor[] = ["olive", "sage", "clay", "sand", "slate", "plum"];

export const FOLDER_COLOR_LABELS: Record<FolderColor, string> = {
  olive: "Olive",
  sage: "Sage",
  clay: "Clay",
  sand: "Sand",
  slate: "Slate",
  plum: "Plum"
};

export const FOLDER_COLOR_STYLES: Record<
  FolderColor,
  { tile: string; swatch: string; soft: string }
> = {
  olive: {
    tile: "bg-[#E6E8D6] text-[#4A5340]",
    swatch: "bg-[#D7DCC3]",
    soft: "bg-[#EFF0E5]"
  },
  sage: {
    tile: "bg-[#DCE3D1] text-[#4F5F43]",
    swatch: "bg-[#C7D4B6]",
    soft: "bg-[#E9EEE1]"
  },
  clay: {
    tile: "bg-[#F0DCD2] text-[#8A4F38]",
    swatch: "bg-[#E0BBA9]",
    soft: "bg-[#F6E8E1]"
  },
  sand: {
    tile: "bg-[#EFE5CB] text-[#7A6432]",
    swatch: "bg-[#E2D2A9]",
    soft: "bg-[#F5EEDC]"
  },
  slate: {
    tile: "bg-[#DDE2E2] text-[#485658]",
    swatch: "bg-[#C4CFCF]",
    soft: "bg-[#E9EDED]"
  },
  plum: {
    tile: "bg-[#E8DCE1] text-[#6C4D5A]",
    swatch: "bg-[#D6BFC7]",
    soft: "bg-[#F1E8EC]"
  }
};

export const FOLDER_ICONS: FolderIcon[] = [
  "folder",
  "key",
  "globe",
  "bank",
  "briefcase",
  "user",
  "cloud",
  "gamepad",
  "mail",
  "lock",
  "code",
  "camera"
];

export const FOLDER_ICON_LABELS: Record<FolderIcon, string> = {
  folder: "Folder",
  key: "Key",
  globe: "Globe",
  bank: "Bank",
  briefcase: "Work",
  user: "Person",
  cloud: "Cloud",
  gamepad: "Games",
  mail: "Email",
  lock: "Lock",
  code: "Code",
  camera: "Camera"
};
