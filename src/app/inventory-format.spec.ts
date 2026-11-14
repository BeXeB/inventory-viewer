import {
  createSetEquipmentCommand,
  decodeInventoryLink,
  readInventoryPayloadFromUrl,
} from './inventory-format';
import {
  INVENTORY_CATALOG_ITEMS,
  INVENTORY_CATALOG_VERSION,
  INVENTORY_EQUIPMENT_SLOT_ORDER,
} from './inventory-catalog.generated';

describe('inventory payload format', () => {
  it('decodes ownership and the compact equipped slot selection', () => {
    const encoded = inventoryLink(
      ['sky-username', 'mint-thread-border'],
      ['sky-username', 'mint-thread-border'],
    );

    expect(decodeInventoryLink(encoded)).toEqual({
      ownedItemIds: ['mint-thread-border', 'sky-username'],
      equippedItemIds: ['mint-thread-border', 'sky-username'],
    });
  });

  it('rejects malformed Base64url and invalid payload lengths', () => {
    expect(() => decodeInventoryLink('AQEM=')).toThrowError(
      'This inventory link is not valid Base64url.',
    );
    expect(() => decodeInventoryLink('AQE')).toThrowError(
      'This inventory link has an invalid length.',
    );
  });

  it('rejects an unsupported catalog version', () => {
    expect(() =>
      decodeInventoryLink(inventoryLink([], [], INVENTORY_CATALOG_VERSION + 1)),
    ).toThrowError('This inventory link uses an unsupported skin catalog.');
  });

  it('rejects equipped skins that are not owned and out-of-range selections', () => {
    expect(() =>
      decodeInventoryLink(inventoryLink([], ['sky-username'])),
    ).toThrowError('This inventory link marks a skin equipped but not owned.');
    expect(() =>
      decodeInventoryLink(
        inventoryLink([], [], INVENTORY_CATALOG_VERSION, equipmentStateCount()),
      ),
    ).toThrowError(
      'This inventory link contains an invalid equipment selection.',
    );
  });

  it('creates a versioned !setequip command and supports an empty selection', () => {
    expect(
      createSetEquipmentCommand(['sky-username', 'mint-thread-border']),
    ).toBe('!setequip AhQBCQ');
    expect(createSetEquipmentCommand([])).toBe('!setequip AhQAAA');
  });

  it('rejects unknown skins and multiple selections for one slot', () => {
    expect(() => createSetEquipmentCommand(['missing-skin'])).toThrowError(
      'Unknown inventory skin: missing-skin.',
    );
    expect(() =>
      createSetEquipmentCommand(['mint-thread-border', 'skyline-border']),
    ).toThrowError('Only one skin can be selected for the border slot.');
  });

  it('reads a path payload, the GitHub Pages query fallback, and an empty root URL', () => {
    expect(
      readInventoryPayloadFromUrl(new URL('https://inv.bexe.dev/AQEMDA')),
    ).toBe('AQEMDA');
    expect(
      readInventoryPayloadFromUrl(
        new URL('https://inv.bexe.dev/?payload=AQEMDA'),
      ),
    ).toBe('AQEMDA');
    expect(
      readInventoryPayloadFromUrl(new URL('https://inv.bexe.dev/')),
    ).toBeNull();
  });
});

function inventoryLink(
  ownedItemIds: string[],
  equippedItemIds: string[],
  catalogVersion: number = INVENTORY_CATALOG_VERSION,
  equipmentCodeOverride?: bigint,
): string {
  const bitmapLength = Math.ceil(INVENTORY_CATALOG_ITEMS.length / 8);
  const equippedCodeOffset = 1 + bitmapLength;
  const codeByteLength = equipmentCodeByteLength();
  const payload = new Uint8Array(equippedCodeOffset + codeByteLength);
  payload[0] = catalogVersion;
  const itemIndexes = new Map<string, number>(
    INVENTORY_CATALOG_ITEMS.map((item, index) => [item.id, index]),
  );

  for (const itemId of ownedItemIds) {
    setItemBit(payload, 1, itemIndexes.get(itemId));
  }

  let code = equipmentCodeOverride ?? 0n;
  if (equipmentCodeOverride === undefined) {
    const selectedItemsBySlot = new Map<string, string>();
    for (const itemId of equippedItemIds) {
      const item = INVENTORY_CATALOG_ITEMS.find(
        (catalogItem) => catalogItem.id === itemId,
      );
      if (!item) {
        throw new Error('The test payload contains an unknown item.');
      }
      if (selectedItemsBySlot.has(item.cosmetic.slot)) {
        throw new Error('The test payload contains duplicate equipped slots.');
      }
      selectedItemsBySlot.set(item.cosmetic.slot, item.id);
    }

    for (const slot of INVENTORY_EQUIPMENT_SLOT_ORDER) {
      const slotItems = INVENTORY_CATALOG_ITEMS.filter(
        (item) => item.cosmetic.slot === slot,
      );
      const itemId = selectedItemsBySlot.get(slot);
      const itemIndex =
        itemId === undefined
          ? -1
          : slotItems.findIndex((item) => item.id === itemId);
      code = code * BigInt(slotItems.length + 1) + BigInt(itemIndex + 1);
    }
  }

  for (let byteIndex = 0; byteIndex < codeByteLength; byteIndex++) {
    payload[equippedCodeOffset + byteIndex] = Number(code & 0xffn);
    code >>= 8n;
  }

  return encodeBase64Url(payload);
}

function equipmentStateCount(): bigint {
  return INVENTORY_EQUIPMENT_SLOT_ORDER.reduce((count, slot) => {
    const itemCount = INVENTORY_CATALOG_ITEMS.filter(
      (item) => item.cosmetic.slot === slot,
    ).length;
    return count * BigInt(itemCount + 1);
  }, 1n);
}

function equipmentCodeByteLength(): number {
  let value = equipmentStateCount() - 1n;
  let byteLength = 0;
  while (value > 0n) {
    value >>= 8n;
    byteLength++;
  }
  return Math.max(byteLength, 1);
}

function setItemBit(
  payload: Uint8Array,
  offset: number,
  itemIndex: number | undefined,
): void {
  if (itemIndex === undefined) {
    throw new Error('The test payload contains an unknown item.');
  }
  const byteIndex = offset + Math.floor(itemIndex / 8);
  payload[byteIndex] = (payload[byteIndex] ?? 0) | (1 << itemIndex % 8);
}

function encodeBase64Url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}
