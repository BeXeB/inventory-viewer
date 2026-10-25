// Canonical message renderer, synced to the inventory viewer by CI.
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { isChatTheme, type ChatTheme } from '../../../../shared/contracts/lootboxes';

export type OverlayMessageCosmeticSlot =
  | 'border'
  | 'chat-theme'
  | 'entry-effect'
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

interface ChatThemeStyle {
  animatedBackground?: string;
  background: string;
  color: string;
  glowColor?: string;
}

const CHAT_THEME_STYLES: Record<ChatTheme, ChatThemeStyle> = {
  ivory: { background: '#fff4de', color: '#1e293b' },
  'cloud-blue': { background: '#eaf4ff', color: '#17324d' },
  'soft-sage': { background: '#edf4e7', color: '#293b2d' },
  blush: { background: '#fff0f3', color: '#4a2532' },
  midnight: { background: '#24303b', color: '#f8fafc' },
  'deep-ocean': { background: '#0c2d48', color: '#ecf7ff' },
  forest: { background: '#173a32', color: '#e7f7ec' },
  amethyst: { background: '#302347', color: '#f4eaff' },
  'warm-ember': {
    background: 'linear-gradient(110deg, #241222 0%, #3c1f31 52%, #5a2b1d 100%)',
    color: '#fff1e6',
  },
  aurora: {
    background: 'linear-gradient(110deg, #103746 0%, #1e4d67 50%, #342a5e 100%)',
    color: '#e8fffa',
  },
  'sakura-sunset': {
    background: 'linear-gradient(110deg, #55213f 0%, #773144 52%, #783622 100%)',
    color: '#fff0f3',
  },
  glacier: {
    background: 'linear-gradient(110deg, #0d3b5a 0%, #145a68 52%, #1e3e70 100%)',
    color: '#eefaff',
  },
  'neon-night': {
    animatedBackground:
      'linear-gradient(110deg, #111827 0%, #12384b 38%, #155b70 64%, #111827 100%)',
    background: '#111827',
    color: '#67e8f9',
    glowColor: 'rgba(34, 211, 238, 0.42)',
  },
  'solar-flare': {
    animatedBackground:
      'linear-gradient(110deg, #4a1712 0%, #7a2617 38%, #8a3b13 65%, #4a1712 100%)',
    background: '#4a1712',
    color: '#fff3d6',
    glowColor: 'rgba(249, 115, 22, 0.45)',
  },
  'cosmic-current': {
    animatedBackground:
      'linear-gradient(110deg, #17123d 0%, #2a246b 42%, #104d58 72%, #17123d 100%)',
    background: '#17123d',
    color: '#f4eaff',
    glowColor: 'rgba(34, 211, 238, 0.4)',
  },
};

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

  get chatTheme(): ChatTheme | null {
    const theme = this.cosmetics['chat-theme'];
    return isChatTheme(theme) ? theme : null;
  }

  get chatThemeStyle(): ChatThemeStyle | null {
    const theme = this.chatTheme;
    return theme === null ? null : CHAT_THEME_STYLES[theme];
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
