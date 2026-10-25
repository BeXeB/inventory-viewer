import {
  INVENTORY_CATALOG_ITEMS,
  INVENTORY_CATALOG_VERSION,
  INVENTORY_EQUIPMENT_COMMAND_FORMAT_VERSION,
  type InventoryCatalogRarity,
} from './inventory-catalog.generated';

const base64UrlAlphabet =
  'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_';

export type InventoryCatalogItem = Omit<
  (typeof INVENTORY_CATALOG_ITEMS)[number],
  'rarity'
> & {
  rarity: InventoryCatalogRarity;
};
export type InventoryCosmeticSlot = InventoryCatalogItem['cosmetic']['slot'];
export type { InventoryCatalogRarity };

export interface InventorySnapshot {
  equippedItemIds: string[];
  ownedItemIds: string[];
}

export class InventoryPayloadError extends Error {}

export function readInventoryPayloadFromUrl(url: URL): string | null {
  if (url.searchParams.has('payload')) {
    return url.searchParams.get('payload') ?? '';
  }

  const segments = url.pathname.split('/').filter(Boolean);
  return segments.length === 1 ? (segments[0] ?? null) : null;
}

export function decodeInventoryLink(encoded: string): InventorySnapshot {
  const payload = decodeBase64Url(encoded);
  const bitmapLength = Math.ceil(INVENTORY_CATALOG_ITEMS.length / 8);
  if (payload.length !== 1 + bitmapLength * 2) {
    throw new InventoryPayloadError(
      'This inventory link has an invalid length.',
    );
  }
  if (payload[0] !== INVENTORY_CATALOG_VERSION) {
    throw new InventoryPayloadError(
      'This inventory link uses an unsupported skin catalog.',
    );
  }

  const ownershipOffset = 1;
  const equippedOffset = ownershipOffset + bitmapLength;
  validateUnusedBits(payload, ownershipOffset, bitmapLength);
  validateUnusedBits(payload, equippedOffset, bitmapLength);

  const ownedItemIds: string[] = [];
  const equippedItemIds: string[] = [];
  const equippedSlots = new Set<InventoryCosmeticSlot>();

  INVENTORY_CATALOG_ITEMS.forEach((item, itemIndex) => {
    const owned = hasBit(payload, ownershipOffset, itemIndex);
    const equipped = hasBit(payload, equippedOffset, itemIndex);
    if (equipped && !owned) {
      throw new InventoryPayloadError(
        'This inventory link marks a skin equipped but not owned.',
      );
    }
    if (owned) {
      ownedItemIds.push(item.id);
    }
    if (equipped) {
      if (equippedSlots.has(item.cosmetic.slot)) {
        throw new InventoryPayloadError(
          'This inventory link equips multiple skins in one slot.',
        );
      }
      equippedSlots.add(item.cosmetic.slot);
      equippedItemIds.push(item.id);
    }
  });

  return { equippedItemIds, ownedItemIds };
}

export function createSetEquipmentCommand(
  selectedItemIds: Iterable<string>,
): string {
  const bitmapLength = Math.ceil(INVENTORY_CATALOG_ITEMS.length / 8);
  const payload = new Uint8Array(2 + bitmapLength);
  payload[0] = INVENTORY_EQUIPMENT_COMMAND_FORMAT_VERSION;
  payload[1] = INVENTORY_CATALOG_VERSION;

  const itemsById = new Map<string, InventoryCatalogItem>(
    INVENTORY_CATALOG_ITEMS.map((item) => [item.id, item]),
  );
  const selectedSlots = new Set<InventoryCosmeticSlot>();

  for (const itemId of selectedItemIds) {
    const item = itemsById.get(itemId);
    if (!item) {
      throw new Error(`Unknown inventory skin: ${itemId}.`);
    }
    if (selectedSlots.has(item.cosmetic.slot)) {
      throw new Error(
        `Only one skin can be selected for the ${item.cosmetic.slot} slot.`,
      );
    }
    selectedSlots.add(item.cosmetic.slot);

    const itemIndex = INVENTORY_CATALOG_ITEMS.findIndex(
      (catalogItem) => catalogItem.id === itemId,
    );
    setBit(payload, 2, itemIndex);
  }

  return `!setequip ${encodeBase64Url(payload)}`;
}

function decodeBase64Url(encoded: string): Uint8Array {
  if (
    encoded.length === 0 ||
    encoded.length % 4 === 1 ||
    !/^[A-Za-z0-9_-]+$/.test(encoded)
  ) {
    throw new InventoryPayloadError(
      'This inventory link is not valid Base64url.',
    );
  }

  const decoded = new Uint8Array(Math.floor((encoded.length * 6) / 8));
  let accumulator = 0;
  let bits = 0;
  let outputIndex = 0;

  for (const character of encoded) {
    accumulator = (accumulator << 6) | base64UrlAlphabet.indexOf(character);
    bits += 6;
    if (bits >= 8) {
      bits -= 8;
      decoded[outputIndex++] = (accumulator >> bits) & 0xff;
      accumulator &= (1 << bits) - 1;
    }
  }

  if (accumulator !== 0 || encodeBase64Url(decoded) !== encoded) {
    throw new InventoryPayloadError(
      'This inventory link is not valid Base64url.',
    );
  }

  return decoded;
}

function encodeBase64Url(bytes: Uint8Array): string {
  let encoded = '';
  let accumulator = 0;
  let bits = 0;

  for (const byte of bytes) {
    accumulator = (accumulator << 8) | byte;
    bits += 8;
    while (bits >= 6) {
      bits -= 6;
      encoded += base64UrlAlphabet[(accumulator >> bits) & 0x3f];
      accumulator &= (1 << bits) - 1;
    }
  }

  if (bits > 0) {
    encoded += base64UrlAlphabet[(accumulator << (6 - bits)) & 0x3f];
  }

  return encoded;
}

function hasBit(
  payload: Uint8Array,
  offset: number,
  itemIndex: number,
): boolean {
  const byte = payload[offset + Math.floor(itemIndex / 8)] ?? 0;
  return (byte & (1 << (itemIndex % 8))) !== 0;
}

function setBit(payload: Uint8Array, offset: number, itemIndex: number): void {
  const byteIndex = offset + Math.floor(itemIndex / 8);
  payload[byteIndex] = (payload[byteIndex] ?? 0) | (1 << (itemIndex % 8));
}

function validateUnusedBits(
  payload: Uint8Array,
  offset: number,
  bitmapLength: number,
): void {
  const usedBitsInLastByte = INVENTORY_CATALOG_ITEMS.length % 8;
  if (usedBitsInLastByte === 0) {
    return;
  }

  const validBitsMask = (1 << usedBitsInLastByte) - 1;
  const lastByte = payload[offset + bitmapLength - 1] ?? 0;
  if ((lastByte & ~validBitsMask) !== 0) {
    throw new InventoryPayloadError(
      'This inventory link contains invalid skin bits.',
    );
  }
}
