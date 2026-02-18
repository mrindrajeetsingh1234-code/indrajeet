
export interface Caption {
  id: string;
  start: number;
  end: number;
  text: string;
}

export type CaptionTheme = {
  name: string;
  textColor: string;
  bgColor: string;
  fontFamily: string;
  fontWeight: string;
  fontSize: string;
  borderRadius: string;
  padding: string;
  border?: string;
  shadow?: string;
  gradient?: string;
};

export const CAPTION_THEMES: Record<string, CaptionTheme> = {
  classic: {
    name: 'Classic Black',
    textColor: 'text-white',
    bgColor: 'bg-black/70',
    fontFamily: 'font-sans',
    fontWeight: 'font-medium',
    fontSize: 'text-lg',
    borderRadius: 'rounded',
    padding: 'px-3 py-1',
  },
  neon: {
    name: 'Neon Glow',
    textColor: 'text-cyan-400',
    bgColor: 'bg-slate-900/90',
    fontFamily: 'font-mono',
    fontWeight: 'font-bold',
    fontSize: 'text-xl',
    borderRadius: 'rounded-lg',
    padding: 'px-4 py-2',
    border: 'border border-cyan-500/50',
    shadow: 'shadow-[0_0_15px_rgba(34,211,238,0.5)]',
  },
  sunset: {
    name: 'Sunset Gradient',
    textColor: 'text-white',
    bgColor: 'bg-gradient-to-r from-orange-500/90 to-pink-600/90',
    fontFamily: 'font-sans',
    fontWeight: 'font-extrabold',
    fontSize: 'text-xl',
    borderRadius: 'rounded-full',
    padding: 'px-6 py-2',
    shadow: 'shadow-lg',
  },
  minimal: {
    name: 'Clean White',
    textColor: 'text-slate-900',
    bgColor: 'bg-white/95',
    fontFamily: 'font-sans',
    fontWeight: 'font-semibold',
    fontSize: 'text-base',
    borderRadius: 'rounded-sm',
    padding: 'px-2 py-0.5',
  },
  gold: {
    name: 'Luxury Gold',
    textColor: 'text-amber-100',
    bgColor: 'bg-neutral-900/95',
    fontFamily: 'font-serif',
    fontWeight: 'font-bold',
    fontSize: 'text-lg',
    borderRadius: 'rounded-none',
    padding: 'px-4 py-2',
    border: 'border-l-4 border-amber-500',
  }
};
