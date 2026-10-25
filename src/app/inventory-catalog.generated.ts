// Generated from shared/contracts/inventory-link.ts. Do not edit manually.
export const INVENTORY_CATALOG_VERSION = 18 as const;
export const INVENTORY_EQUIPMENT_COMMAND_FORMAT_VERSION = 1 as const;
export const INVENTORY_CATALOG_RARITIES = [
  'common',
  'uncommon',
  'rare',
  'epic',
  'legendary',
] as const;
export type InventoryCatalogRarity =
  (typeof INVENTORY_CATALOG_RARITIES)[number];
export const INVENTORY_CATALOG_THEMES = [
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
export type InventoryCatalogTheme = (typeof INVENTORY_CATALOG_THEMES)[number];

export const INVENTORY_CATALOG_ITEMS = [
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'ivory',
    },
    id: 'ivory-theme',
    name: 'Elefántcsont Téma',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'oxanium',
    },
    id: 'oxanium-font',
    name: 'Oxanium Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'bungee',
    },
    id: 'bungee-font',
    name: 'Bungee Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'caveat',
    },
    id: 'caveat-font',
    name: 'Caveat Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'pixelify-sans',
    },
    id: 'pixelify-sans-font',
    name: 'Pixelify Sans Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'special-elite',
    },
    id: 'special-elite-font',
    name: 'Special Elite Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'metamorphous',
    },
    id: 'metamorphous-font',
    name: 'Metamorphous Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'coiny',
    },
    id: 'coiny-font',
    name: 'Coiny Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'baloo-2',
    },
    id: 'baloo-2-font',
    name: 'Baloo 2 Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'mint-thread',
    },
    id: 'mint-thread-border',
    name: 'Menta Fonál',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'skyline',
    },
    id: 'skyline-border',
    name: 'Égkék Csík',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'coral-stitch',
    },
    id: 'coral-stitch-border',
    name: 'Korallöltés',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'sunlit-edge',
    },
    id: 'sunlit-edge-border',
    name: 'Napfény Perem',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'copper-inlay',
    },
    id: 'copper-inlay-border',
    name: 'Rézberakás',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'ice-lattice',
    },
    id: 'ice-lattice-border',
    name: 'Jégkristály Rács',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'moonstone',
    },
    id: 'moonstone-border',
    name: 'Holdkő Keret',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'tide-glow',
    },
    id: 'tide-glow-border',
    name: 'Árapályfény',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'aurora-ribbon',
    },
    id: 'aurora-ribbon-border',
    name: 'Aurora Szalag',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'nebula-rim',
    },
    id: 'nebula-rim-border',
    name: 'Nebula Perem',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'prismatic-edge',
    },
    id: 'prismatic-edge-border',
    name: 'Prizmás Fényív',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'deep-current',
    },
    id: 'deep-current-border',
    name: 'Mélyáramlat',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'phoenix-flare',
    },
    id: 'phoenix-flare-border',
    name: 'Főnix Lángja',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'celestial-crown',
    },
    id: 'celestial-crown-border',
    name: 'Égi Korona',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'dragonwake',
    },
    id: 'dragonwake-border',
    name: 'Sárkányörvény',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'warm-ember',
    },
    id: 'split-contrast-theme',
    name: 'Meleg Parázs Téma',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'midnight',
    },
    id: 'midnight-theme',
    name: 'Éjféli Téma',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#74C0FC',
    },
    id: 'sky-username',
    name: 'Égkék Név',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#8CE99A',
    },
    id: 'lime-username',
    name: 'Limezöld Név',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#FFD43B',
    },
    id: 'sun-username',
    name: 'Napsárga Név',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#FF8787',
    },
    id: 'rose-username',
    name: 'Korallrózsaszín Név',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#22D3EE',
    },
    id: 'turquoise-username',
    name: 'Türkiz Név',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#A78BFA',
    },
    id: 'amethyst-username',
    name: 'Ametiszt Név',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#FBBF24',
    },
    id: 'gold-username',
    name: 'Arany Név',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: '#FB7185',
    },
    id: 'coral-username',
    name: 'Lángoló Korall Név',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'gradient-sunset',
    },
    id: 'sunset-gradient-username',
    name: 'Naplemente Átmenet',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'gradient-ocean',
    },
    id: 'ocean-gradient-username',
    name: 'Óceán Átmenet',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'gradient-cosmic',
    },
    id: 'cosmic-gradient-username',
    name: 'Kozmikus Átmenet',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'glow-aurora',
    },
    id: 'aurora-glow-username',
    name: 'Északi Fény Ragyogás',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'glow-inferno',
    },
    id: 'inferno-glow-username',
    name: 'Inferno Ragyogás',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'gradient-nebula',
    },
    id: 'nebula-gradient-username',
    name: 'Nebula Átmenet',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'username-color',
      value: 'glow-emerald',
    },
    id: 'emerald-glow-username',
    name: 'Smaragd Ragyogás',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'neon-night',
    },
    id: 'neon-night-theme',
    name: 'Neon Éjszaka Téma',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'cloud-blue',
    },
    id: 'cloud-blue-theme',
    name: 'Felhőkék Téma',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'soft-sage',
    },
    id: 'soft-sage-theme',
    name: 'Lágy Zsálya Téma',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'blush',
    },
    id: 'blush-theme',
    name: 'Púder Rózsaszín Téma',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'deep-ocean',
    },
    id: 'deep-ocean-theme',
    name: 'Mély Óceán Téma',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'forest',
    },
    id: 'forest-theme',
    name: 'Erdei Téma',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'amethyst',
    },
    id: 'amethyst-theme',
    name: 'Ametiszt Téma',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'aurora',
    },
    id: 'aurora-theme',
    name: 'Sarki Fény Téma',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'sakura-sunset',
    },
    id: 'sakura-sunset-theme',
    name: 'Sakura Naplemente Téma',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'glacier',
    },
    id: 'glacier-theme',
    name: 'Gleccser Téma',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'solar-flare',
    },
    id: 'solar-flare-theme',
    name: 'Napkitörés Téma',
    rarity: 'legendary',
  },
  {
    cosmetic: {
      slot: 'chat-theme',
      value: 'cosmic-current',
    },
    id: 'cosmic-current-theme',
    name: 'Kozmikus Áramlat Téma',
    rarity: 'legendary',
  },
] as const;
