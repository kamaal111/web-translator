import type { WebTranslatorContext } from '@/data-providers/configurations-context';

declare const window: {
  WebTranslatorContext: WebTranslatorContext | null;
};

export function getWindow(): typeof window {
  return window;
}
