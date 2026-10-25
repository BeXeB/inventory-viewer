export type CosmeticSlot =
  | 'border'
  | 'chat-theme'
  | 'entry-effect'
  | 'message-font'
  | 'username-color';

export const CHAT_BORDER_STYLES = ['neon', 'ornate', 'starlight'] as const;
export type ChatBorderStyle = (typeof CHAT_BORDER_STYLES)[number];
export type ChatBorderValue = ChatBorderStyle | `#${string}`;

export const CHAT_THEMES = [
  'ivory',
  'cloud-blue',
  'soft-sage',
  'blush',
  'midnight',
  'deep-ocean',
  'forest',
  'amethyst',
  'warm-ember',
  'aurora',
  'sakura-sunset',
  'glacier',
  'neon-night',
  'solar-flare',
  'cosmic-current',
] as const;
export type ChatTheme = (typeof CHAT_THEMES)[number];

export const CHAT_ENTRY_EFFECTS = ['bounce-in', 'drift-up', 'fade-in', 'slide-in'] as const;
export type ChatEntryEffect = (typeof CHAT_ENTRY_EFFECTS)[number];

export const CHAT_MESSAGE_FONTS = ['jetbrains-mono'] as const;
export type ChatMessageFont = (typeof CHAT_MESSAGE_FONTS)[number];

export const CHAT_USERNAME_COLOR_PRESETS = [
  'gradient-sunset',
  'gradient-ocean',
  'gradient-cosmic',
  'gradient-nebula',
  'glow-aurora',
  'glow-inferno',
  'glow-emerald',
] as const;
export type ChatUsernameColorPreset = (typeof CHAT_USERNAME_COLOR_PRESETS)[number];
export type ChatUsernameColor = ChatUsernameColorPreset | `#${string}`;

export type ChatCosmeticsByUserId = Record<string, Partial<CosmeticValuesBySlot>>;

export const LOOTBOX_RARITIES = ['common', 'uncommon', 'rare', 'epic', 'legendary'] as const;
export type LootboxRarity = (typeof LOOTBOX_RARITIES)[number];

export type LootboxCosmetic = {
  [Slot in CosmeticSlot]: { slot: Slot; value: CosmeticValueBySlot[Slot] };
}[CosmeticSlot];

type CosmeticValueBySlot = {
  border: ChatBorderValue;
  'chat-theme': ChatTheme;
  'entry-effect': ChatEntryEffect;
  'message-font': ChatMessageFont;
  'username-color': ChatUsernameColor;
};

export type CosmeticValuesBySlot = CosmeticValueBySlot;

export interface LootboxItemDefinition {
  cosmetic: LootboxCosmetic;
  id: string;
  name: string;
  rarity: LootboxRarity;
}

export interface LootboxDefinition {
  id: string;
  itemIds: string[];
  name: string;
  rarityWeights: Partial<Record<LootboxRarity, number>>;
}

export interface LootboxCatalogDocument {
  items: LootboxItemDefinition[];
  lootboxes: LootboxDefinition[];
  version: 1;
}

export function isChatBorderStyle(value: unknown): value is ChatBorderStyle {
  return typeof value === 'string' && CHAT_BORDER_STYLES.some((style) => style === value);
}

export function isChatBorderColor(value: unknown): value is `#${string}` {
  return typeof value === 'string' && /^#[\da-fA-F]{6}$/.test(value);
}

export function isChatTheme(value: unknown): value is ChatTheme {
  return typeof value === 'string' && CHAT_THEMES.some((theme) => theme === value);
}

export function isChatEntryEffect(value: unknown): value is ChatEntryEffect {
  return typeof value === 'string' && CHAT_ENTRY_EFFECTS.some((effect) => effect === value);
}

export function isChatMessageFont(value: unknown): value is ChatMessageFont {
  return typeof value === 'string' && CHAT_MESSAGE_FONTS.some((font) => font === value);
}

export function isChatUsernameColor(value: unknown): value is ChatUsernameColor {
  return isChatBorderColor(value) || isChatUsernameColorPreset(value);
}

export function isChatUsernameColorPreset(value: unknown): value is ChatUsernameColorPreset {
  return (
    typeof value === 'string' && CHAT_USERNAME_COLOR_PRESETS.some((preset) => preset === value)
  );
}
