// Generated from shared/contracts/inventory-link.ts. Do not edit manually.
export const INVENTORY_CATALOG_VERSION = 3 as const;
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

export const INVENTORY_CATALOG_ITEMS = [
  {
    cosmetic: {
      slot: 'message-color',
      value: '#FF735C',
    },
    id: 'ember-text',
    name: 'Parázsvörös Szöveg',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'message-font',
      value: 'jetbrains-mono',
    },
    id: 'jetbrains-mono-font',
    name: 'JetBrains Mono Betűtípus',
    rarity: 'common',
  },
  {
    cosmetic: {
      slot: 'border',
      value: '#F0C56E',
    },
    id: 'gilded-edge',
    name: 'Aranyszínű Szegély',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'border',
      value: 'starlight',
    },
    id: 'starlight-frame',
    name: 'Csillagfényes Keret',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'background-color',
      value: 'split-contrast-blue',
    },
    id: 'split-contrast-background',
    name: 'Kétszínű, kék vonalas háttér',
    rarity: 'epic',
  },
  {
    cosmetic: {
      slot: 'background-color',
      value: '#24303B',
    },
    id: 'midnight-background',
    name: 'Éjféli Háttér',
    rarity: 'rare',
  },
  {
    cosmetic: {
      slot: 'entry-effect',
      value: 'slide-in',
    },
    id: 'slide-entry',
    name: 'Becsúszás',
    rarity: 'legendary',
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
] as const;
