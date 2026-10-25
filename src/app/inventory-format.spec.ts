import {
  createSetEquipmentCommand,
  decodeInventoryLink,
  readInventoryPayloadFromUrl,
} from './inventory-format';
import { INVENTORY_CATALOG_ITEMS } from './inventory-catalog.generated';

describe('inventory payload format', () => {
  it('decodes ownership and currently equipped bits by canonical catalog index', () => {
    const encoded = inventoryLink(
      ['mint-signature', 'gilded-edge'],
      ['mint-signature', 'gilded-edge'],
    );

    expect(decodeInventoryLink(encoded)).toEqual({
      ownedItemIds: ['mint-signature', 'gilded-edge'],
      equippedItemIds: ['mint-signature', 'gilded-edge'],
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
    expect(() => decodeInventoryLink(inventoryLink([], [], 2))).toThrowError(
      'This inventory link uses an unsupported skin catalog.',
    );
  });

  it('rejects equipped skins that are not owned and duplicate equipped slots', () => {
    expect(() =>
      decodeInventoryLink(inventoryLink([], ['mint-signature'])),
    ).toThrowError('This inventory link marks a skin equipped but not owned.');
    expect(() =>
      decodeInventoryLink(
        inventoryLink(
          ['gilded-edge', 'starlight-frame'],
          ['gilded-edge', 'starlight-frame'],
        ),
      ),
    ).toThrowError('This inventory link equips multiple skins in one slot.');
  });

  it('creates a versioned !setequip command and supports an empty selection', () => {
    expect(createSetEquipmentCommand(['mint-signature', 'gilded-edge'])).toBe(
      '!setequip AQEM',
    );
    expect(createSetEquipmentCommand([])).toBe('!setequip AQEA');
  });

  it('rejects unknown skins and multiple selections for one slot', () => {
    expect(() => createSetEquipmentCommand(['missing-skin'])).toThrowError(
      'Unknown inventory skin: missing-skin.',
    );
    expect(() =>
      createSetEquipmentCommand(['gilded-edge', 'starlight-frame']),
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
  catalogVersion = 1,
): string {
  const bitmapLength = Math.ceil(INVENTORY_CATALOG_ITEMS.length / 8);
  const payload = new Uint8Array(1 + bitmapLength * 2);
  payload[0] = catalogVersion;
  const itemIndexes = new Map<string, number>(
    INVENTORY_CATALOG_ITEMS.map((item, index) => [item.id, index]),
  );

  for (const itemId of ownedItemIds) {
    setItemBit(payload, 1, itemIndexes.get(itemId));
  }
  for (const itemId of equippedItemIds) {
    setItemBit(payload, 1 + bitmapLength, itemIndexes.get(itemId));
  }

  return encodeBase64Url(payload);
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
