/**
 * Shared Module
 * Exports all shared components, hooks, and utilities
 */

// Components
export { default as ErrorBoundary } from './components/ErrorBoundary';
export { default as LoadingSpinner } from './components/ui/LoadingSpinner';
export { default as VirtualizedList } from './components/ui/VirtualizedList';
export { default as ThemeSwitcher } from './components/ui/ThemeSwitcher';
export { default as Button } from './components/ui/Button';
export {
  default as Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from './components/ui/Card';
export { default as ThemeDemo } from './components/ThemeDemo';

// Hooks
export { default as useAuth } from './hooks/useAuth';
export { default as useTheme } from './hooks/useTheme';
export { default as usePerformance } from './hooks/usePerformance';
export { default as useDebounce } from './hooks/useDebounce';
export { default as useVirtualization } from './hooks/useVirtualization';

// Services
export * from './services/user.service';
export * from './services/company.service';

// Utils
export { default as logger } from './utils/logger';
export * from './utils/security';
export * from './utils/test-utils';
export { default as themeUtils } from './utils/theme.utils';

// Types
export * from './types';

// Constants
export { default as APP_CONSTANTS } from './constants/app.constants';
