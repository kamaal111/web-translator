import type { WebTranslatorContext } from '@/context/schemas';

declare const window: {
  WebTranslatorContext: WebTranslatorContext | null;
};

export function getWindow(): typeof window {
  return window;
}
