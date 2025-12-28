import type { Platform } from './types';

declare global {
  interface Window {
    __TAURI_INTERNALS__?: unknown;
    Capacitor?: {
      isNativePlatform: () => boolean;
      getPlatform: () => string;
    };
  }
}

export function detectPlatform(): Platform {
  if (typeof window === 'undefined') {
    return 'web';
  }

  // Check for Tauri
  if ('__TAURI_INTERNALS__' in window) {
    const platform = navigator.platform.toLowerCase();
    if (platform.includes('mac')) {
      return 'tauri-macos';
    }
    if (platform.includes('win')) {
      return 'tauri-windows';
    }
    // Default to macos for other unix-like systems
    return 'tauri-macos';
  }

  // Check for Capacitor
  if (window.Capacitor?.isNativePlatform?.()) {
    const platform = window.Capacitor.getPlatform();
    if (platform === 'ios') {
      return 'capacitor-ios';
    }
    if (platform === 'android') {
      return 'capacitor-android';
    }
  }

  return 'web';
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}

export function isCapacitor(): boolean {
  return typeof window !== 'undefined' && !!window.Capacitor?.isNativePlatform?.();
}

export function isNative(): boolean {
  return isTauri() || isCapacitor();
}
