import { By } from '@angular/platform-browser';
import { TestBed } from '@angular/core/testing';

import { INVENTORY_CATALOG_ITEMS } from './inventory-catalog.generated';
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

  it('preselects the current equipment and replaces a slot selection interactively', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const link = inventoryLink(
      ['mint-signature', 'gilded-edge', 'starlight-frame'],
      ['mint-signature', 'gilded-edge'],
    );
    app.loadInventoryFromUrl(new URL(`https://inv.bexe.dev/${link}`));
    fixture.detectChanges();

    expect(app.selectedItemIds).toEqual(
      new Set(['mint-signature', 'gilded-edge']),
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
      new Set(['mint-signature', 'starlight-frame']),
    );
    expect(app.equipCommand).toBe('!setequip AQEU');
    expect(fixture.nativeElement.textContent).toContain('Your equip command');

    starlightButton?.click();
    fixture.detectChanges();
    expect(app.selectedItemIds).toEqual(
      new Set(['mint-signature', 'starlight-frame']),
    );
  });

  it('previews the selected cosmetics and can replay the entry effect', () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    fixture.detectChanges();
    const selectedItemIds = [
      'ember-text',
      'jetbrains-mono-font',
      'mint-signature',
      'starlight-frame',
      'midnight-background',
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
      'color: rgb(114, 224, 182)',
    );
    expect(message?.querySelector('span')?.getAttribute('style')).toContain(
      'color: rgb(255, 115, 92)',
    );
    expect(
      message?.classList.contains('overlay-message--border-starlight'),
    ).toBeTrue();
    expect(message?.getAttribute('style')).toContain(
      '--message-background-color: #24303B',
    );
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
    const link = inventoryLink(['mint-signature'], ['mint-signature']);
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
  payload[0] = 1;
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
