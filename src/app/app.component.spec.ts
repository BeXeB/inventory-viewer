import { TestBed } from '@angular/core/testing';

import {
  INVENTORY_CATALOG_ITEMS,
  INVENTORY_CATALOG_VERSION,
  INVENTORY_EQUIPMENT_SLOT_ORDER,
} from './inventory-catalog.generated';
import { AppComponent } from './app.component';
import { createSetEquipmentCommand } from './inventory-format';
import { OverlayMessageComponent } from './shared/overlay-message/overlay-message.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
  });

  it('shows pirate sparkles only when the Pirate Token border is equipped', () => {
    const fixture = TestBed.createComponent(OverlayMessageComponent);
    const component = fixture.componentInstance;
    component.cosmetics = { border: 'mint-thread' };
    fixture.detectChanges();

    const sparkles = fixture.nativeElement.querySelector(
      '.overlay-message__pirate-sparkles',
    ) as HTMLElement;
    expect(getComputedStyle(sparkles).display).toBe('none');

    component.cosmetics = { border: 'pirate-token' };
    fixture.detectChanges();
    expect(getComputedStyle(sparkles).display).toBe('block');
  });

  it('shows a helpful empty state when opened without an inventory payload', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    app.loadInventoryFromUrl(new URL('https://inv.bexe.dev/'));
    fixture.detectChanges();

    expect(fixture.nativeElement.textContent).toContain(
      'Open your inventory link',
    );
  });

  it('orders skin choices and selected skins by rarity', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(
      INVENTORY_CATALOG_ITEMS.map((item) => item.id),
      ['sky-username', 'midnight-theme', 'pirate-token'],
    );
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    expect(app.selectedItems.map((item) => item.id)).toEqual([
      'sky-username',
      'midnight-theme',
      'pirate-token',
    ]);

    const chatThemeItemIds = Array.from(
      (fixture.nativeElement as HTMLElement).querySelectorAll(
        '.slot-group[aria-labelledby="slot-chat-theme"] .skin-option[data-item-id]',
      ),
      (item) => item.getAttribute('data-item-id'),
    );
    const chatThemeItems = INVENTORY_CATALOG_ITEMS.filter(
      (item) => item.cosmetic.slot === 'chat-theme',
    );
    expect(chatThemeItems.length).toBe(15);
    expect(
      chatThemeItems.filter((item) => item.rarity === 'common').length,
    ).toBe(4);
    expect(chatThemeItems.filter((item) => item.rarity === 'rare').length).toBe(
      4,
    );
    expect(chatThemeItems.filter((item) => item.rarity === 'epic').length).toBe(
      4,
    );
    expect(
      chatThemeItems.filter((item) => item.rarity === 'legendary').length,
    ).toBe(3);
    expect(chatThemeItemIds).toEqual([
      'ivory-theme',
      'cloud-blue-theme',
      'soft-sage-theme',
      'blush-theme',
      'midnight-theme',
      'deep-ocean-theme',
      'forest-theme',
      'amethyst-theme',
      'split-contrast-theme',
      'aurora-theme',
      'sakura-sunset-theme',
      'glacier-theme',
      'neon-night-theme',
      'solar-flare-theme',
      'cosmic-current-theme',
    ]);
    const warmEmberTheme = INVENTORY_CATALOG_ITEMS.find(
      (item) => item.id === 'split-contrast-theme',
    );
    expect(warmEmberTheme?.name).toBe('Meleg Parázs Téma');
    expect(warmEmberTheme?.cosmetic).toEqual({
      slot: 'chat-theme',
      value: 'warm-ember',
    });
  });

  it('previews every chat theme and animates the two new legendary themes', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const chatThemeItems = INVENTORY_CATALOG_ITEMS.filter(
      (item) => item.cosmetic.slot === 'chat-theme',
    );

    for (const theme of chatThemeItems) {
      const link = inventoryLink([theme.id], [theme.id]);
      app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
      fixture.detectChanges();

      const preview = (fixture.nativeElement as HTMLElement).querySelector(
        '.skin-preview-stage .overlay-message',
      );
      expect(preview).not.toBeNull();
      expect((preview as HTMLElement).style.color).toBeTruthy();
      expect((preview as HTMLElement).style.background).toBeTruthy();
      expect(
        (preview as HTMLElement).classList.contains(
          'overlay-message--theme-animated',
        ),
      ).toBe(
        theme.cosmetic.value === 'neon-night' ||
          theme.cosmetic.value === 'solar-flare' ||
          theme.cosmetic.value === 'cosmic-current',
      );
    }
  });

  it('clears a slot without a None option', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(['ivory-theme'], ['ivory-theme']);
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    const slotGroup = (fixture.nativeElement as HTMLElement).querySelector(
      '.slot-group[aria-labelledby="slot-chat-theme"]',
    );
    expect(
      slotGroup?.querySelector(
        '.skin-options .skin-option:not([data-item-id])',
      ),
    ).toBeNull();

    const clearButton = slotGroup?.querySelector(
      '.clear-slot-button',
    ) as HTMLButtonElement | null;
    expect(clearButton?.disabled).toBeFalse();
    clearButton?.click();
    fixture.detectChanges();

    expect(app.isSlotEmpty('chat-theme')).toBeTrue();
    expect(clearButton?.disabled).toBeTrue();
  });

  it('preselects the current equipment and replaces a slot selection interactively', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(
      ['sky-username', 'mint-thread-border', 'skyline-border'],
      ['sky-username', 'mint-thread-border'],
    );
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'mint-thread-border']),
    );

    const skylineButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.skin-option[data-item-id="skyline-border"]',
    ) as HTMLButtonElement | null;
    expect(skylineButton?.disabled).toBeFalse();
    skylineButton?.click();
    fixture.detectChanges();

    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'skyline-border']),
    );
    expect(app.equipCommand).toBe('!setequip AhQBEg');
    expect(fixture.nativeElement.textContent).toContain('Your equip command');

    skylineButton?.click();
    fixture.detectChanges();
    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'skyline-border']),
    );
  });

  it('previews supported cosmetics and creates the compact equip command', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const selectedItemIds = [
      'bungee-font',
      'sky-username',
      'mint-thread-border',
      'midnight-theme',
    ];
    const link = inventoryLink(selectedItemIds, selectedItemIds);
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    const message = (fixture.nativeElement as HTMLElement).querySelector(
      '.skin-preview-stage .overlay-message',
    );
    expect(message).not.toBeNull();
    expect(message?.querySelector('strong')?.textContent?.trim()).toBe('xyz');
    expect(message?.querySelector('span')?.textContent?.trim()).toBe(': hello');
    expect(message?.querySelector('strong')?.getAttribute('style')).toContain(
      'color: rgb(116, 192, 252)',
    );
    expect((message as HTMLElement).style.border).toBeTruthy();
    expect((message as HTMLElement).style.background).toBe('rgb(36, 48, 59)');
    expect((message as HTMLElement).style.color).toBe('rgb(248, 250, 252)');
    expect((message as HTMLElement).style.animationName).toBe('');
    expect(app.selectedItemIds).toEqual(new Set(selectedItemIds));
    expect(app.equipCommand).toBe(createSetEquipmentCommand(selectedItemIds));
  });

  it('disables unowned skins and presents malformed links as an error', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(['sky-username'], ['sky-username']);
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    const gildedButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.skin-option[data-item-id="mint-thread-border"]',
    ) as HTMLButtonElement | null;
    expect(gildedButton?.disabled).toBeTrue();

    app.loadInventoryFromUrl(
      new URL('https://inv.bexe.dev/not-a-valid-payload'),
    );
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain(
      'This inventory link cannot be read',
    );
  });
});

function inventoryLink(
  ownedItemIds: string[],
  equippedItemIds: string[],
): string {
  const bitmapLength = Math.ceil(INVENTORY_CATALOG_ITEMS.length / 8);
  const equippedCodeOffset = 1 + bitmapLength;
  const codeByteLength = equipmentCodeByteLength();
  const payload = new Uint8Array(equippedCodeOffset + codeByteLength);
  payload[0] = INVENTORY_CATALOG_VERSION;
  const itemIndexes = new Map<string, number>(
    INVENTORY_CATALOG_ITEMS.map((item, index) => [item.id, index]),
  );

  for (const itemId of ownedItemIds) {
    setItemBit(payload, 1, itemIndexes.get(itemId));
  }

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

  let code = 0n;
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
  for (let byteIndex = 0; byteIndex < codeByteLength; byteIndex++) {
    payload[equippedCodeOffset + byteIndex] = Number(code & 0xffn);
    code >>= 8n;
  }

  return btoa(Array.from(payload, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function equipmentCodeByteLength(): number {
  let stateCount = 1n;
  for (const slot of INVENTORY_EQUIPMENT_SLOT_ORDER) {
    const itemCount = INVENTORY_CATALOG_ITEMS.filter(
      (item) => item.cosmetic.slot === slot,
    ).length;
    stateCount *= BigInt(itemCount + 1);
  }

  let value = stateCount - 1n;
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
