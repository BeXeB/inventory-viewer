import { TestBed } from '@angular/core/testing';

import { INVENTORY_CATALOG_ITEMS } from './inventory-catalog.generated';
import { AppComponent } from './app.component';

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
  const payload = new Uint8Array(2 + bitmapLength * 2);
  payload[0] = 1;
  payload[1] = 1;
  const itemIndexes = new Map<string, number>(
    INVENTORY_CATALOG_ITEMS.map((item, index) => [item.id, index]),
  );

  for (const itemId of ownedItemIds) {
    setItemBit(payload, 2, itemIndexes.get(itemId));
  }
  for (const itemId of equippedItemIds) {
    setItemBit(payload, 2 + bitmapLength, itemIndexes.get(itemId));
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
