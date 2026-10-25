// Canonical message renderer, synced to the inventory viewer by CI.
import { Component, ElementRef, Input, ViewChild } from '@angular/core';

export type OverlayMessageCosmeticSlot =
  | 'background-color'
  | 'border'
  | 'entry-effect'
  | 'message-color'
  | 'message-font'
  | 'username-color';

export type OverlayMessageCosmetics = Partial<Record<OverlayMessageCosmeticSlot, string>>;

type BorderStyle = 'neon' | 'ornate' | 'starlight';
type EntryEffect = 'bounce-in' | 'drift-up' | 'fade-in' | 'slide-in';
type UsernameColorPreset =
  | 'gradient-cosmic'
  | 'gradient-nebula'
  | 'gradient-ocean'
  | 'gradient-sunset'
  | 'glow-aurora'
  | 'glow-emerald'
  | 'glow-inferno';

@Component({
  selector: 'app-overlay-message',
  standalone: true,
  templateUrl: './overlay-message.component.html',
  styleUrls: ['./overlay-message.component.css'],
})
export class OverlayMessageComponent {
  @Input() displayName = '';
  @Input() message = '';
  @Input() defaultUsernameColor: string | null = null;
  @Input() cosmetics: OverlayMessageCosmetics = {};
  @Input() animate = false;

  @ViewChild('messageElement')
  private messageElement?: ElementRef<HTMLParagraphElement>;

  get borderStyle(): BorderStyle | null {
    const border = this.cosmetics.border;
    return border === 'neon' || border === 'ornate' || border === 'starlight' ? border : null;
  }

  get borderColor(): string | null {
    const border = this.cosmetics.border;
    return isHexColor(border) ? border : null;
  }

  get backgroundPreset(): 'split-contrast-blue' | null {
    return this.cosmetics['background-color'] === 'split-contrast-blue'
      ? 'split-contrast-blue'
      : null;
  }

  get backgroundColor(): string | null {
    const background = this.cosmetics['background-color'];
    return isHexColor(background) ? background : null;
  }

  get messageFontFamily(): string | null {
    return this.cosmetics['message-font'] === 'jetbrains-mono'
      ? "'JetBrains Mono', monospace"
      : null;
  }

  get usernameColor(): string | null {
    const usernameColor = this.cosmetics['username-color'];
    return isHexColor(usernameColor) ? usernameColor : this.defaultUsernameColor;
  }

  get usernameColorPreset(): UsernameColorPreset | null {
    const usernameColor = this.cosmetics['username-color'];
    return isUsernameColorPreset(usernameColor) ? usernameColor : null;
  }

  get entryAnimation(): string | null {
    if (!this.animate) {
      return null;
    }

    const animations: Record<EntryEffect, string> = {
      'bounce-in': 'overlay-bounce-in',
      'drift-up': 'overlay-drift-up',
      'fade-in': 'overlay-fade-in',
      'slide-in': 'overlay-slide-in',
    };
    const effect = this.cosmetics['entry-effect'];
    if (
      effect !== 'bounce-in' &&
      effect !== 'drift-up' &&
      effect !== 'fade-in' &&
      effect !== 'slide-in'
    ) {
      return null;
    }
    return animations[effect];
  }

  replayEntryEffect(): void {
    const element = this.messageElement?.nativeElement;
    const animation = this.entryAnimation;
    if (!element || !animation) {
      return;
    }

    element.style.animationName = 'none';
    void element.offsetWidth;
    element.style.animationName = animation;
  }
}

function isHexColor(value: string | undefined): value is `#${string}` {
  return typeof value === 'string' && /^#[\da-f]{6}$/i.test(value);
}

function isUsernameColorPreset(value: string | undefined): value is UsernameColorPreset {
  return (
    value === 'gradient-cosmic' ||
    value === 'gradient-nebula' ||
    value === 'gradient-ocean' ||
    value === 'gradient-sunset' ||
    value === 'glow-aurora' ||
    value === 'glow-emerald' ||
    value === 'glow-inferno'
  );
}
