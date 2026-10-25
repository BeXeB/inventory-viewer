// Canonical message renderer, synced to the inventory viewer by CI.
import { Component, Input } from '@angular/core';
import {
  isChatBorderStyle,
  isChatTheme,
  type ChatBorderStyle,
  type ChatTheme,
} from '../../../../shared/contracts/lootboxes';

export type OverlayMessageCosmeticSlot =
  | 'border'
  | 'chat-theme'
  | 'message-font'
  | 'username-color';

export type OverlayMessageCosmetics = Partial<Record<OverlayMessageCosmeticSlot, string>>;

type UsernameColorPreset =
  | 'gradient-cosmic'
  | 'gradient-nebula'
  | 'gradient-ocean'
  | 'gradient-sunset'
  | 'glow-aurora'
  | 'glow-emerald'
  | 'glow-inferno';

interface BorderAppearance {
  animated?: boolean;
  border: string;
  borderLeft: string;
  borderRadius: string;
  boxShadow: string;
  glowColor?: string;
  themeBackgroundInset: string;
}

const BORDER_APPEARANCES: Record<ChatBorderStyle, BorderAppearance> = {
  'mint-thread': {
    border: '1px solid #68cba8',
    borderLeft: '1px solid #68cba8',
    borderRadius: '3px',
    boxShadow: 'none',
    themeBackgroundInset: '1px',
  },
  skyline: {
    border: '1px solid #78bfea',
    borderLeft: '1px solid #78bfea',
    borderRadius: '2px',
    boxShadow: 'inset 0 0 0 1px rgba(120, 191, 234, 0.22)',
    themeBackgroundInset: '1px',
  },
  'coral-stitch': {
    border: '1px dashed #f28585',
    borderLeft: '1px solid #f28585',
    borderRadius: '4px',
    boxShadow: 'none',
    themeBackgroundInset: '1px',
  },
  'sunlit-edge': {
    border: '1px double #e6b84f',
    borderLeft: '1px double #e6b84f',
    borderRadius: '2px',
    boxShadow: 'inset 0 0 0 1px rgba(230, 184, 79, 0.2)',
    themeBackgroundInset: '1px',
  },
  'copper-inlay': {
    border: '3px double #c98258',
    borderLeft: '3px double #e3a26f',
    borderRadius: '4px',
    boxShadow: 'inset 0 0 0 1px rgba(227, 162, 111, 0.2)',
    themeBackgroundInset: '3px',
  },
  'ice-lattice': {
    border: '2px dotted #74d5f2',
    borderLeft: '2px solid #a4ebf8',
    borderRadius: '3px',
    boxShadow: '0 0 5px rgba(116, 213, 242, 0.28)',
    themeBackgroundInset: '2px',
  },
  moonstone: {
    border: '2px double #bfa8f5',
    borderLeft: '2px solid #e4d5ff',
    borderRadius: '5px',
    boxShadow: 'inset 0 0 0 1px rgba(228, 213, 255, 0.25)',
    themeBackgroundInset: '2px',
  },
  'tide-glow': {
    border: '1px solid #2dcfc0',
    borderLeft: '1px solid #2dcfc0',
    borderRadius: '7px',
    boxShadow: '0 0 7px rgba(45, 207, 192, 0.38)',
    themeBackgroundInset: '1px',
  },
  'aurora-ribbon': {
    border: '2px solid #5eead4',
    borderLeft: '2px solid #a78bfa',
    borderRadius: '5px',
    boxShadow: '0 0 5px rgba(94, 234, 212, 0.28), inset 0 0 0 1px rgba(167, 139, 250, 0.32)',
    themeBackgroundInset: '2px',
  },
  'nebula-rim': {
    border: '2px double #c084fc',
    borderLeft: '2px solid #22d3ee',
    borderRadius: '5px',
    boxShadow: '0 0 7px rgba(192, 132, 252, 0.35)',
    themeBackgroundInset: '2px',
  },
  'prismatic-edge': {
    border: '2px solid #f0abfc',
    borderLeft: '2px double #fde68a',
    borderRadius: '4px',
    boxShadow: '0 0 5px rgba(240, 171, 252, 0.3), inset 0 0 0 1px rgba(253, 230, 138, 0.2)',
    themeBackgroundInset: '2px',
  },
  'deep-current': {
    border: '2px dashed #38bdf8',
    borderLeft: '2px solid #2dd4bf',
    borderRadius: '6px',
    boxShadow: '0 0 7px rgba(56, 189, 248, 0.3)',
    themeBackgroundInset: '2px',
  },
  'phoenix-flare': {
    animated: true,
    border: '2px solid #f97316',
    borderLeft: '2px double #fde68a',
    borderRadius: '5px',
    boxShadow: '0 0 7px rgba(249, 115, 22, 0.4)',
    glowColor: 'rgba(249, 115, 22, 0.76)',
    themeBackgroundInset: '2px',
  },
  'celestial-crown': {
    animated: true,
    border: '2px double #facc15',
    borderLeft: '2px solid #fff1a6',
    borderRadius: '7px',
    boxShadow: '0 0 7px rgba(250, 204, 21, 0.4)',
    glowColor: 'rgba(250, 204, 21, 0.78)',
    themeBackgroundInset: '2px',
  },
  dragonwake: {
    animated: true,
    border: '2px solid #34d399',
    borderLeft: '2px double #22d3ee',
    borderRadius: '6px',
    boxShadow: '0 0 7px rgba(52, 211, 153, 0.4)',
    glowColor: 'rgba(45, 212, 191, 0.8)',
    themeBackgroundInset: '2px',
  },
  neon: {
    border: '1px solid var(--message-border-color, #fff)',
    borderLeft: '1px solid var(--message-border-color, #fff)',
    borderRadius: '3px',
    boxShadow: '0 0 8px var(--message-border-color, #fff)',
    themeBackgroundInset: '1px',
  },
  ornate: {
    border: '3px double var(--message-border-color, #fff)',
    borderLeft: '3px double var(--message-border-color, #fff)',
    borderRadius: '5px',
    boxShadow: 'none',
    themeBackgroundInset: '3px',
  },
  starlight: {
    border: '2px double var(--message-border-color, #fff)',
    borderLeft: '2px double var(--message-border-color, #fff)',
    borderRadius: '4px',
    boxShadow: 'inset 0 0 0 1px rgba(255, 255, 255, 0.18)',
    themeBackgroundInset: '2px',
  },
};

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

  get borderStyle(): ChatBorderStyle | null {
    return isChatBorderStyle(this.cosmetics.border) ? this.cosmetics.border : null;
  }

  get borderAppearance(): BorderAppearance | null {
    const border = this.borderStyle;
    return border === null ? null : BORDER_APPEARANCES[border];
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
    switch (this.cosmetics['message-font']) {
      case 'jetbrains-mono':
        return "'JetBrains Mono', monospace";
      case 'orbitron':
        return "'Orbitron', sans-serif";
      case 'bungee':
        return "'Bungee', sans-serif";
      case 'caveat':
        return "'Caveat', cursive";
      case 'pixelify-sans':
        return "'Pixelify Sans', sans-serif";
      case 'special-elite':
        return "'Special Elite', monospace";
      case 'metamorphous':
        return "'Metamorphous', serif";
      case 'bubble-fantasy':
        return "'Bubble Fantasy', sans-serif";
      default:
        return null;
    }
  }

  get usernameColor(): string | null {
    const usernameColor = this.cosmetics['username-color'];
    if (isHexColor(usernameColor)) {
      return usernameColor;
    }
    return isUsernameColorPreset(usernameColor) ? null : this.defaultUsernameColor;
  }

  get usernameColorPreset(): UsernameColorPreset | null {
    const usernameColor = this.cosmetics['username-color'];
    return isUsernameColorPreset(usernameColor) ? usernameColor : null;
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
