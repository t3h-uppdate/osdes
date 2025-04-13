// Defines the available social media platforms, their corresponding icon keys,
// and their base URLs for auto-population.
// The icon keys MUST match the keys used in the IconMap in src/components/common/IconRenderer.tsx

export interface SocialPlatform {
  name: string; // User-facing name (e.g., "GitHub")
  icon: string; // Key for IconRenderer (e.g., "Github")
  baseUrl: string; // Base URL for the platform (e.g., "https://github.com/")
}

export const socialPlatforms: SocialPlatform[] = [
  { name: "GitHub", icon: "Github", baseUrl: "https://github.com/" },
  { name: "X (Twitter)", icon: "X", baseUrl: "https://x.com/" },
  { name: "Facebook", icon: "Facebook", baseUrl: "https://facebook.com/" },
  { name: "Instagram", icon: "Instagram", baseUrl: "https://instagram.com/" },
  { name: "LinkedIn", icon: "Linkedin", baseUrl: "https://linkedin.com/in/" },
  { name: "YouTube", icon: "YouTube", baseUrl: "https://youtube.com/" },
  { name: "TikTok", icon: "TikTok", baseUrl: "https://tiktok.com/@" },
  { name: "WhatsApp", icon: "WhatsApp", baseUrl: "https://wa.me/" }, // Often requires phone number
  { name: "Telegram", icon: "Telegram", baseUrl: "https://t.me/" },
  { name: "Discord", icon: "Discord", baseUrl: "https://discord.gg/" }, // Often invite links
  { name: "Twitch", icon: "Twitch", baseUrl: "https://twitch.tv/" },
  { name: "Pinterest", icon: "Pinterest", baseUrl: "https://pinterest.com/" },
  { name: "Reddit", icon: "Reddit", baseUrl: "https://reddit.com/user/" },
  { name: "Spotify", icon: "Spotify", baseUrl: "https://open.spotify.com/user/" },
  { name: "Soundcloud", icon: "Soundcloud", baseUrl: "https://soundcloud.com/" },
  { name: "Patreon", icon: "Patreon", baseUrl: "https://patreon.com/" },
  { name: "Snapchat", icon: "Snapchat", baseUrl: "https://snapchat.com/add/" },
  { name: "Linktree", icon: "Linktree", baseUrl: "https://linktr.ee/" },
  { name: "Email", icon: "Mail", baseUrl: "mailto:" },
  // Add others as needed, ensure 'icon' matches IconRenderer keys
  // { name: "Other", icon: "HelpCircle", baseUrl: "" }, // Optional fallback for generic links
];

// Export just the icon names for convenience if still needed elsewhere, though less likely now.
export const availableIcons = socialPlatforms.map(p => p.icon);

// Helper function to find a platform by name or icon (case-insensitive)
export const findPlatform = (identifier: string): SocialPlatform | undefined => {
  const lowerIdentifier = identifier.toLowerCase();
  return socialPlatforms.find(
    p => p.name.toLowerCase() === lowerIdentifier || p.icon.toLowerCase() === lowerIdentifier
  );
};

// Helper function to get the default platform (e.g., the first one)
export const getDefaultPlatform = (): SocialPlatform => {
    return socialPlatforms[0] || { name: "Link", icon: "HelpCircle", baseUrl: "" }; // Fallback if array is empty
};
