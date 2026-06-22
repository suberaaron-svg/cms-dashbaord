import { Briefcase, Camera, Music2, ThumbsUp, Video } from "lucide-react";

import type { Platform } from "@/types/analytics";

export const PLATFORM_META: Record<
  Platform,
  { label: string; color: string; icon: typeof Camera }
> = {
  instagram: { label: "Instagram", color: "#ec4899", icon: Camera },
  youtube: { label: "YouTube", color: "#ef4444", icon: Video },
  tiktok: { label: "TikTok", color: "#22d3ee", icon: Music2 },
  facebook: { label: "Facebook", color: "#3b82f6", icon: ThumbsUp },
  linkedin: { label: "LinkedIn", color: "#6366f1", icon: Briefcase },
};

export const PLATFORM_ORDER: Platform[] = [
  "instagram",
  "youtube",
  "tiktok",
  "facebook",
  "linkedin",
];
