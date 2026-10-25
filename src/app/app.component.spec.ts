import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

import {
  INVENTORY_CATALOG_ITEMS,
  INVENTORY_CATALOG_VERSION,
} from './inventory-catalog.generated';
import { AppComponent } from './app.component';
import { OverlayMessageComponent } from './shared/overlay-message/overlay-message.component';

describe('AppComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AppComponent],
    }).compileComponents();
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
      ['sky-username', 'midnight-theme', 'starlight-frame'],
    );
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    expect(app.selectedItems.map((item) => item.id)).toEqual([
      'sky-username',
      'midnight-theme',
      'starlight-frame',
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
      ['sky-username', 'gilded-edge', 'starlight-frame'],
      ['sky-username', 'gilded-edge'],
    );
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'gilded-edge']),
    );

    const starlightButton = (
      fixture.nativeElement as HTMLElement
    ).querySelector(
      '.skin-option[data-item-id="starlight-frame"]',
    ) as HTMLButtonElement | null;
    expect(starlightButton?.disabled).toBeFalse();
    starlightButton?.click();
    fixture.detectChanges();

    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'starlight-frame']),
    );
    expect(app.equipCommand).toBe('!setequip AQWIAAAAAA');
    expect(fixture.nativeElement.textContent).toContain('Your equip command');

    starlightButton?.click();
    fixture.detectChanges();
    expect(app.selectedItemIds).toEqual(
      new Set(['sky-username', 'starlight-frame']),
    );
  });

  it('previews the selected cosmetics and can replay the entry effect', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const selectedItemIds = [
      'jetbrains-mono-font',
      'sky-username',
      'starlight-frame',
      'midnight-theme',
      'slide-entry',
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
    expect(
      message?.classList.contains('overlay-message--border-starlight'),
    ).toBeTrue();
    expect((message as HTMLElement).style.background).toBe('rgb(36, 48, 59)');
    expect((message as HTMLElement).style.color).toBe('rgb(248, 250, 252)');
    expect(message?.getAttribute('style')).toContain(
      'animation-name: overlay-slide-in',
    );

    const replayButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.preview-animation-button',
    ) as HTMLButtonElement | null;
    const preview = fixture.debugElement.query(
      By.directive(OverlayMessageComponent),
    ).componentInstance as OverlayMessageComponent;
    const replaySpy = spyOn(preview, 'replayEntryEffect').and.callThrough();
    replayButton?.click();
    expect(replaySpy).toHaveBeenCalled();
  });

  it('disables unowned skins and presents malformed links as an error', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(['sky-username'], ['sky-username']);
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    const gildedButton = (fixture.nativeElement as HTMLElement).querySelector(
      '.skin-option[data-item-id="gilded-edge"]',
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
  const payload = new Uint8Array(1 + bitmapLength * 2);
  payload[0] = INVENTORY_CATALOG_VERSION;
  const itemIndexes = new Map<string, number>(
    INVENTORY_CATALOG_ITEMS.map((item, index) => [item.id, index]),
  );

  for (const itemId of ownedItemIds) {
    setItemBit(payload, 1, itemIndexes.get(itemId));
  }
  for (const itemId of equippedItemIds) {
    setItemBit(payload, 1 + bitmapLength, itemIndexes.get(itemId));
  }

  return btoa(Array.from(payload, (byte) => String.fromCharCode(byte)).join(''))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
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
