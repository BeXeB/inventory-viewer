import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';

import {
  createSetEquipmentCommand,
  decodeInventoryLink,
  InventoryCatalogItem,
  InventoryCosmeticSlot,
  InventoryPayloadError,
  InventorySnapshot,
  readInventoryPayloadFromUrl,
} from './inventory-format';
import { INVENTORY_CATALOG_ITEMS } from './inventory-catalog.generated';
import {
  OverlayMessageComponent,
  type OverlayMessageCosmetics,
} from './shared/overlay-message/overlay-message.component';

interface InventorySlotGroup {
  items: readonly InventoryCatalogItem[];
  label: string;
  slot: InventoryCosmeticSlot;
}

const slotLabels: Record<InventoryCosmeticSlot, string> = {
  'background-color': 'Chat background',
  border: 'Message border',
  'entry-effect': 'Entry effect',
  'message-color': 'Message text color',
  'message-font': 'Message font',
  'username-color': 'Username color',
};

const rarityLabels: Record<InventoryCatalogItem['rarity'], string> = {
  common: 'Common',
  epic: 'Epic',
  legendary: 'Legendary',
  rare: 'Rare',
  uncommon: 'Uncommon',
};

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, OverlayMessageComponent],
  templateUrl: './app.component.html',
})
export class AppComponent implements OnInit {
  readonly title = 'Skin inventory';
  readonly previewDisplayName = 'xyz';
  readonly previewText = 'hello';
  readonly slotGroups = createSlotGroups();
  readonly catalogItems = INVENTORY_CATALOG_ITEMS;
  readonly rarityLabels = rarityLabels;

  errorMessage: string | null = null;
  snapshot: InventorySnapshot | null = null;
  ownedItemIds = new Set<string>();
  equippedItemIds = new Set<string>();
  selectedItemIds = new Set<string>();
  equipCommand = '';
  copyMessage = '';

  get ownedCount(): number {
    return this.ownedItemIds.size;
  }

  get selectedCount(): number {
    return this.selectedItemIds.size;
  }

  get selectedItems(): InventoryCatalogItem[] {
    return this.catalogItems.filter((item) =>
      this.selectedItemIds.has(item.id),
    );
  }

  get selectedCosmetics(): OverlayMessageCosmetics {
    const cosmetics: OverlayMessageCosmetics = {};
    for (const item of this.selectedItems) {
      cosmetics[item.cosmetic.slot] = item.cosmetic.value;
    }
    return cosmetics;
  }

  ngOnInit(): void {
    this.loadInventoryFromUrl(new URL(window.location.href));
  }

  loadInventoryFromUrl(url: URL): void {
    this.errorMessage = null;
    this.snapshot = null;
    this.ownedItemIds = new Set();
    this.equippedItemIds = new Set();
    this.selectedItemIds = new Set();
    this.equipCommand = '';
    this.copyMessage = '';

    const encoded = readInventoryPayloadFromUrl(url);
    if (encoded === null) {
      return;
    }

    try {
      this.snapshot = decodeInventoryLink(encoded);
    } catch (error) {
      if (!(error instanceof InventoryPayloadError)) {
        throw error;
      }
      this.errorMessage = error.message;
      return;
    }

    this.ownedItemIds = new Set(this.snapshot.ownedItemIds);
    this.equippedItemIds = new Set(this.snapshot.equippedItemIds);
    this.selectedItemIds = new Set(this.snapshot.equippedItemIds);
    this.updateEquipCommand();
  }

  isOwned(itemId: string): boolean {
    return this.ownedItemIds.has(itemId);
  }

  isSelected(itemId: string): boolean {
    return this.selectedItemIds.has(itemId);
  }

  isSlotEmpty(slot: InventoryCosmeticSlot): boolean {
    return !this.selectedItems.some((item) => item.cosmetic.slot === slot);
  }

  selectSkin(item: InventoryCatalogItem): void {
    if (!this.isOwned(item.id)) {
      return;
    }

    const selectedItemIds = new Set(this.selectedItemIds);
    if (!selectedItemIds.has(item.id)) {
      for (const selectedItemId of selectedItemIds) {
        const selectedItem = this.catalogItems.find(
          (candidate) => candidate.id === selectedItemId,
        );
        if (selectedItem?.cosmetic.slot === item.cosmetic.slot) {
          selectedItemIds.delete(selectedItemId);
        }
      }
      selectedItemIds.add(item.id);
    }

    this.selectedItemIds = selectedItemIds;
    this.updateEquipCommand();
  }

  clearSlot(slot: InventoryCosmeticSlot): void {
    const selectedItemIds = new Set(this.selectedItemIds);
    for (const selectedItemId of selectedItemIds) {
      const selectedItem = this.catalogItems.find(
        (candidate) => candidate.id === selectedItemId,
      );
      if (selectedItem?.cosmetic.slot === slot) {
        selectedItemIds.delete(selectedItemId);
      }
    }
    this.selectedItemIds = selectedItemIds;
    this.updateEquipCommand();
  }

  isColorValue(value: string): boolean {
    return /^#[\da-f]{6}$/i.test(value);
  }

  async copyCommand(): Promise<void> {
    if (!this.equipCommand) {
      return;
    }

    try {
      await navigator.clipboard.writeText(this.equipCommand);
      this.copyMessage =
        'Command copied. Paste it into Twitch chat to apply your selection.';
    } catch {
      this.copyMessage =
        'Clipboard access failed. Select the command above and copy it manually.';
    }
  }

  private updateEquipCommand(): void {
    this.equipCommand = createSetEquipmentCommand(this.selectedItemIds);
    this.copyMessage = '';
  }
}

function createSlotGroups(): InventorySlotGroup[] {
  const groups = new Map<InventoryCosmeticSlot, InventoryCatalogItem[]>();

  for (const item of INVENTORY_CATALOG_ITEMS) {
    const items = groups.get(item.cosmetic.slot) ?? [];
    items.push(item);
    groups.set(item.cosmetic.slot, items);
  }

  return Array.from(groups, ([slot, items]) => ({
    items,
    label: slotLabels[slot],
    slot,
  }));
}
