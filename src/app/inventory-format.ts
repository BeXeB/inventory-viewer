import {
  INVENTORY_CATALOG_ITEMS,
  INVENTORY_CATALOG_VERSION,
  INVENTORY_EQUIPMENT_COMMAND_FORMAT_VERSION,
  INVENTORY_EQUIPMENT_SLOT_ORDER,
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

const INVENTORY_ITEMS_BY_SLOT = new Map<
  InventoryCosmeticSlot,
  readonly InventoryCatalogItem[]
>(
  INVENTORY_EQUIPMENT_SLOT_ORDER.map((slot) => [
    slot,
    INVENTORY_CATALOG_ITEMS.filter((item) => item.cosmetic.slot === slot),
  ]),
);

const INVENTORY_EQUIPMENT_STATE_COUNT = INVENTORY_EQUIPMENT_SLOT_ORDER.reduce(
  (count, slot) => count * BigInt(getInventoryItemsForSlot(slot).length + 1),
  1n,
);
const INVENTORY_EQUIPMENT_CODE_BYTE_LENGTH = getUnsignedIntegerByteLength(
  INVENTORY_EQUIPMENT_STATE_COUNT - 1n,
);

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
  const equippedCodeOffset = 1 + bitmapLength;
  if (
    payload.length !==
    equippedCodeOffset + INVENTORY_EQUIPMENT_CODE_BYTE_LENGTH
  ) {
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
  validateUnusedBits(payload, ownershipOffset, bitmapLength);

  const ownedItemIds: string[] = [];
  INVENTORY_CATALOG_ITEMS.forEach((item, itemIndex) => {
    const owned = hasBit(payload, ownershipOffset, itemIndex);
    if (owned) {
      ownedItemIds.push(item.id);
    }
  });

  const equipmentCode = readUnsignedIntegerLE(
    payload,
    equippedCodeOffset,
    INVENTORY_EQUIPMENT_CODE_BYTE_LENGTH,
  );
  const equippedItemIds = decodeInventoryEquipmentCode(equipmentCode);
  if (equippedItemIds === null) {
    throw new InventoryPayloadError(
      'This inventory link contains an invalid equipment selection.',
    );
  }
  const ownedItemIdSet = new Set(ownedItemIds);
  if (equippedItemIds.some((itemId) => !ownedItemIdSet.has(itemId))) {
    throw new InventoryPayloadError(
      'This inventory link marks a skin equipped but not owned.',
    );
  }

  return { equippedItemIds, ownedItemIds };
}

export function createSetEquipmentCommand(
  selectedItemIds: Iterable<string>,
): string {
  const payload = new Uint8Array(2 + INVENTORY_EQUIPMENT_CODE_BYTE_LENGTH);
  payload[0] = INVENTORY_EQUIPMENT_COMMAND_FORMAT_VERSION;
  payload[1] = INVENTORY_CATALOG_VERSION;

  const itemsById = new Map<string, InventoryCatalogItem>(
    INVENTORY_CATALOG_ITEMS.map((item) => [item.id, item]),
  );
  const selectedItemsBySlot = new Map<InventoryCosmeticSlot, string>();
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
    selectedItemsBySlot.set(item.cosmetic.slot, item.id);
  }

  writeUnsignedIntegerLE(
    payload,
    2,
    encodeInventoryEquipmentCode(selectedItemsBySlot),
    INVENTORY_EQUIPMENT_CODE_BYTE_LENGTH,
  );

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
  return (byte & (1 << itemIndex % 8)) !== 0;
}

function encodeInventoryEquipmentCode(
  selectedItemsBySlot: ReadonlyMap<InventoryCosmeticSlot, string>,
): bigint {
  let code = 0n;
  for (const slot of INVENTORY_EQUIPMENT_SLOT_ORDER) {
    const items = getInventoryItemsForSlot(slot);
    const selectedItemId = selectedItemsBySlot.get(slot);
    const itemIndex =
      selectedItemId === undefined
        ? -1
        : items.findIndex((item) => item.id === selectedItemId);
    if (selectedItemId !== undefined && itemIndex < 0) {
      throw new Error(`Unknown inventory skin for the ${slot} slot.`);
    }

    code = code * BigInt(items.length + 1) + BigInt(itemIndex + 1);
  }
  return code;
}

function decodeInventoryEquipmentCode(code: bigint): string[] | null {
  if (code >= INVENTORY_EQUIPMENT_STATE_COUNT) {
    return null;
  }

  let remainingCode = code;
  const selectedItems = new Map<InventoryCosmeticSlot, InventoryCatalogItem>();
  for (
    let slotIndex = INVENTORY_EQUIPMENT_SLOT_ORDER.length - 1;
    slotIndex >= 0;
    slotIndex--
  ) {
    const slot = INVENTORY_EQUIPMENT_SLOT_ORDER[slotIndex];
    if (!slot) {
      return null;
    }

    const items = getInventoryItemsForSlot(slot);
    const radix = BigInt(items.length + 1);
    const itemIndex = Number(remainingCode % radix) - 1;
    remainingCode /= radix;
    if (itemIndex >= 0) {
      const item = items[itemIndex];
      if (!item) {
        return null;
      }
      selectedItems.set(slot, item);
    }
  }

  if (remainingCode !== 0n) {
    return null;
  }
  return INVENTORY_EQUIPMENT_SLOT_ORDER.flatMap((slot) => {
    const item = selectedItems.get(slot);
    return item ? [item.id] : [];
  });
}

function getInventoryItemsForSlot(
  slot: InventoryCosmeticSlot,
): readonly InventoryCatalogItem[] {
  const items = INVENTORY_ITEMS_BY_SLOT.get(slot);
  if (!items) {
    throw new Error(`Inventory equipment slot "${slot}" is not configured.`);
  }
  return items;
}

function getUnsignedIntegerByteLength(value: bigint): number {
  let byteLength = 0;
  while (value > 0n) {
    value >>= 8n;
    byteLength++;
  }
  return Math.max(byteLength, 1);
}

function writeUnsignedIntegerLE(
  payload: Uint8Array,
  offset: number,
  value: bigint,
  byteLength: number,
): void {
  let remainingValue = value;
  for (let byteIndex = 0; byteIndex < byteLength; byteIndex++) {
    payload[offset + byteIndex] = Number(remainingValue & 0xffn);
    remainingValue >>= 8n;
  }
  if (remainingValue !== 0n) {
    throw new Error(
      'Inventory equipment selection does not fit its encoded field.',
    );
  }
}

function readUnsignedIntegerLE(
  payload: Uint8Array,
  offset: number,
  byteLength: number,
): bigint {
  let value = 0n;
  for (let byteIndex = byteLength - 1; byteIndex >= 0; byteIndex--) {
    value = (value << 8n) | BigInt(payload[offset + byteIndex] ?? 0);
  }
  return value;
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
