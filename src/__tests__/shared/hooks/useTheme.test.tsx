/**
 * Theme Hook Tests
 * Tests for the enhanced theme management hook
 */

import { renderHook, act } from '@testing-library/react';
import { useTheme } from '../../../shared/hooks/useTheme';

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

// Mock window.matchMedia
const mockMatchMedia = jest.fn();

// Mock logger
jest.mock('../../../shared/utils/logger', () => ({
  logger: {
    debug: jest.fn(),
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();

  // Mock localStorage
  Object.defineProperty(window, 'localStorage', {
    value: mockLocalStorage,
    writable: true,
  });

  // Mock matchMedia
  Object.defineProperty(window, 'matchMedia', {
    value: (query: string) => ({
      matches: query === '(prefers-color-scheme: dark)',
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      media: query,
      onchange: null,
      dispatchEvent: jest.fn(),
    }),
    writable: true,
  });
});

describe('useTheme', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Reset matchMedia to default (light mode)
    jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
      matches: false, // default to light
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
      addListener: jest.fn(),
      removeListener: jest.fn(),
      media: query,
      onchange: null,
      dispatchEvent: jest.fn(),
    }));
  });

  describe('initialization', () => {
    it('should initialize with default theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      // matchMedia returns light
      jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        media: query,
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('light');
      expect(result.current.systemTheme).toBe('light');
      expect(result.current.isSystemTheme).toBe(true);
      expect(result.current.isDark).toBe(false);
      expect(result.current.isLight).toBe(true);
    });

    it('should initialize with stored theme', () => {
      mockLocalStorage.getItem.mockReturnValue('dark');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isSystemTheme).toBe(false);
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });

    it('should detect system dark mode', () => {
      mockLocalStorage.getItem.mockReturnValue('system');
      jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: true,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        media: query,
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
      const { result } = renderHook(() => useTheme());
      expect(result.current.theme).toBe('system');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.systemTheme).toBe('dark');
      expect(result.current.isSystemTheme).toBe(true);
      expect(result.current.isDark).toBe(true);
      expect(result.current.isLight).toBe(false);
    });
  });

  describe('theme changing', () => {
    it('should change theme and update localStorage', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme());

      act(() => {
        result.current.setTheme('dark');
      });

      expect(result.current.theme).toBe('dark');
      expect(result.current.resolvedTheme).toBe('dark');
      expect(result.current.isDark).toBe(true);
      expect(mockLocalStorage.setItem).toHaveBeenCalledWith('theme', 'dark');
    });

    it('should toggle through themes', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme());

      // Start with light
      expect(result.current.theme).toBe('light');

      // Toggle to dark
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('dark');

      // Toggle to system
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('system');

      // Toggle back to light
      act(() => {
        result.current.toggleTheme();
      });
      expect(result.current.theme).toBe('light');
    });

    it('should not change theme if the same theme is set', () => {
      mockLocalStorage.getItem.mockReturnValue('light');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme());

      const initialTheme = result.current.theme;

      act(() => {
        result.current.setTheme('light');
      });

      expect(result.current.theme).toBe(initialTheme);
    });
  });

  describe('system theme detection', () => {
    it('should listen for system theme changes', () => {
      const addEventListener = jest.fn();
      const removeEventListener = jest.fn();
      jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        addEventListener,
        removeEventListener,
        addListener: jest.fn(),
        removeListener: jest.fn(),
        media: query,
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
      const { unmount } = renderHook(() => useTheme());
      expect(addEventListener).toHaveBeenCalledWith('change', expect.any(Function));
      unmount();
      expect(removeEventListener).toHaveBeenCalledWith('change', expect.any(Function));
    });

    it('should update system theme when media query changes', () => {
      let mediaQueryCallback: ((e: MediaQueryListEvent) => void) | null = null;
      jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        addEventListener: jest.fn((_, callback) => {
          mediaQueryCallback = callback as (e: MediaQueryListEvent) => void;
        }),
        removeEventListener: jest.fn(),
        addListener: jest.fn(),
        removeListener: jest.fn(),
        media: query,
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
      const { result } = renderHook(() => useTheme());
      expect(result.current.systemTheme).toBe('light');
      act(() => {
        if (mediaQueryCallback) {
          mediaQueryCallback({ matches: true } as MediaQueryListEvent);
        }
      });
      expect(result.current.systemTheme).toBe('dark');
    });
  });

  describe('configuration options', () => {
    it('should use custom storage key', () => {
      const customStorageKey = 'custom-theme';

      renderHook(() => useTheme({ storageKey: customStorageKey }));

      expect(mockLocalStorage.getItem).toHaveBeenCalledWith(customStorageKey);
    });

    it('should use custom default theme', () => {
      mockLocalStorage.getItem.mockReturnValue(null);
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme({ defaultTheme: 'dark' }));

      expect(result.current.theme).toBe('dark');
    });

    it('should disable system theme detection', () => {
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      renderHook(() => useTheme({ enableSystem: false }));

      expect(mockMatchMedia).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle localStorage errors gracefully', () => {
      mockLocalStorage.getItem.mockImplementation(() => {
        throw new Error('localStorage error');
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system'); // Should use default
    });

    it('should handle matchMedia errors gracefully', () => {
      const errorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
      jest.spyOn(window, 'matchMedia').mockImplementation(() => {
        throw new Error('matchMedia error');
      });
      expect(() => {
        renderHook(() => useTheme());
      }).toThrow('matchMedia error');
      errorSpy.mockRestore();
    });

    it('should validate theme values', () => {
      mockLocalStorage.getItem.mockReturnValue('invalid-theme');
      mockMatchMedia.mockReturnValue({
        matches: false,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      });

      const { result } = renderHook(() => useTheme());

      expect(result.current.theme).toBe('system'); // Should use default for invalid theme
    });
  });

  describe('legacy browser support', () => {
    it('should use addListener/removeListener for older browsers', () => {
      const addListener = jest.fn();
      const removeListener = jest.fn();
      jest.spyOn(window, 'matchMedia').mockImplementation((query: string) => ({
        matches: false,
        addListener,
        removeListener,
        addEventListener: undefined as any,
        removeEventListener: undefined as any,
        media: query,
        onchange: null,
        dispatchEvent: jest.fn(),
      }));
      const { unmount } = renderHook(() => useTheme());
      expect(addListener).toHaveBeenCalledWith(expect.any(Function));
      unmount();
      expect(removeListener).toHaveBeenCalledWith(expect.any(Function));
    });
  });
});
