import type { SatisApi } from '../electron/preload';

declare global {
  interface Window {
    satis: SatisApi;
  }
}

export {};
