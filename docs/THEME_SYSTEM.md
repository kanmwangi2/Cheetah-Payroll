# 🎨 Theme System Documentation

A comprehensive theme management system for Cheetah Payroll with support for light, dark, and system
themes.

## Overview

The theme system provides:

- **Light/Dark/System modes** with automatic system preference detection
- **CSS Custom Properties** for consistent design tokens
- **Theme-aware components** that automatically adapt
- **Smooth transitions** between themes
- **Persistent theme preferences** with localStorage
- **Accessibility support** with proper contrast and reduced motion
- **TypeScript support** for type safety

## Quick Start

### 1. Basic Usage

```tsx
import { useThemeContext } from '../core/providers/ThemeProvider';

function MyComponent() {
  const { theme, setTheme, isDark, isLight } = useThemeContext();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      <p>Current theme: {theme}</p>
      <button onClick={() => setTheme('dark')}>Switch to Dark</button>
    </div>
  );
}
```

### 2. Using Theme Switcher

```tsx
import { ThemeSwitcher } from '../shared/components/ui/ThemeSwitcher';

function App() {
  return (
    <div>
      <ThemeSwitcher variant="dropdown" position="top-right" showLabels={true} />
    </div>
  );
}
```

### 3. Theme-aware Components

```tsx
import { Button, Card } from '../shared/components/ui';

function Dashboard() {
  return (
    <Card variant="elevated">
      <Card.Header>
        <Card.Title>Dashboard</Card.Title>
      </Card.Header>
      <Card.Content>
        <Button variant="primary">Primary Action</Button>
        <Button variant="secondary">Secondary Action</Button>
      </Card.Content>
    </Card>
  );
}
```

## Architecture

### Theme Provider Structure

```
ThemeProvider
├── useTheme hook (core theme logic)
├── Theme persistence (localStorage)
├── System preference detection
├── CSS class application
└── Context provision
```

### File Structure

```
src/
├── core/
│   └── providers/
│       ├── ThemeProvider.tsx      # Main theme provider
│       └── AppProvider.tsx        # Root provider wrapper
├── shared/
│   ├── hooks/
│   │   └── useTheme.ts           # Core theme hook
│   ├── components/ui/
│   │   ├── ThemeSwitcher.tsx     # Theme switching UI
│   │   ├── Button.tsx            # Theme-aware button
│   │   └── Card.tsx              # Theme-aware card
│   ├── utils/
│   │   └── theme.utils.ts        # Theme utility functions
│   └── components/
│       └── ThemeDemo.tsx         # Theme showcase
└── assets/
    └── styles/
        └── themes.css            # CSS custom properties
```

## CSS Custom Properties

### Color System

#### Primary Colors

```css
--color-primary-50   /* Lightest */
--color-primary-100
--color-primary-200
--color-primary-300
--color-primary-400
--color-primary-500  /* Base */
--color-primary-600
--color-primary-700
--color-primary-800
--color-primary-900  /* Darkest */
```

#### Semantic Colors

```css
--color-success-500
--color-warning-500
--color-error-500
--color-info-500
```

#### Text Colors

```css
--color-text-primary     /* Main text */
--color-text-secondary   /* Secondary text */
--color-text-tertiary    /* Muted text */
--color-text-inverse     /* Inverse text (for dark backgrounds) */
--color-text-disabled    /* Disabled text */
```

#### Background Colors

```css
--color-bg-primary       /* Main background */
--color-bg-secondary     /* Secondary background */
--color-bg-tertiary      /* Tertiary background */
--color-bg-overlay       /* Modal/overlay background */
```

#### Border Colors

```css
--color-border-primary   /* Default borders */
--color-border-secondary /* Secondary borders */
--color-border-focus     /* Focus states */
--color-border-error     /* Error states */
--color-border-success   /* Success states */
```

### Typography

#### Font Families

```css
--font-family-primary    /* Main font stack */
--font-family-mono      /* Monospace font */
```

#### Font Sizes

```css
--font-size-xs          /* 12px */
--font-size-sm          /* 14px */
--font-size-base        /* 16px */
--font-size-lg          /* 18px */
--font-size-xl          /* 20px */
--font-size-2xl         /* 24px */
--font-size-3xl         /* 30px */
--font-size-4xl         /* 36px */
```

#### Font Weights

```css
--font-weight-light     /* 300 */
--font-weight-normal    /* 400 */
--font-weight-medium    /* 500 */
--font-weight-semibold  /* 600 */
--font-weight-bold      /* 700 */
```

### Spacing

```css
--spacing-xs            /* 4px */
--spacing-sm            /* 8px */
--spacing-md            /* 12px */
--spacing-lg            /* 16px */
--spacing-xl            /* 20px */
--spacing-2xl           /* 24px */
--spacing-3xl           /* 32px */
--spacing-4xl           /* 40px */
--spacing-5xl           /* 48px */
--spacing-6xl           /* 64px */
```

### Other Design Tokens

#### Border Radius

```css
--border-radius-sm      /* 2px */
--border-radius-md      /* 4px */
--border-radius-lg      /* 8px */
--border-radius-xl      /* 12px */
--border-radius-2xl     /* 16px */
--border-radius-full    /* 9999px */
```

#### Shadows

```css
--shadow-sm             /* Small shadow */
--shadow-md             /* Medium shadow */
--shadow-lg             /* Large shadow */
--shadow-xl             /* Extra large shadow */
--shadow-2xl            /* 2x large shadow */
```

#### Transitions

```css
--transition-fast       /* 150ms */
--transition-normal     /* 250ms */
--transition-slow       /* 350ms */
```

## Theme Hook API

### useTheme Hook

```tsx
const {
  theme, // Current theme ('light' | 'dark' | 'system')
  resolvedTheme, // Resolved theme ('light' | 'dark')
  systemTheme, // System preference ('light' | 'dark')
  isSystemTheme, // Whether using system theme
  setTheme, // Function to set theme
  toggleTheme, // Function to cycle through themes
  isDark, // Whether current theme is dark
  isLight, // Whether current theme is light
} = useTheme();
```

### useThemeContext Hook

```tsx
const {
  // All useTheme properties plus:
  getCSSVariable, // Get CSS custom property value
  getThemeColor, // Get theme color by name
  themeClass, // Current theme class name
  themeValue, // Conditional theme values
} = useThemeContext();
```

## Components

### ThemeSwitcher

A flexible theme switching component with multiple variants:

```tsx
<ThemeSwitcher
  variant="dropdown" // 'dropdown' | 'toggle' | 'segmented'
  size="md" // 'sm' | 'md' | 'lg'
  position="top-right" // Position for fixed variant
  showLabels={true} // Show text labels
  className="custom-class" // Custom CSS class
/>
```

**Variants:**

- **Dropdown**: Full-featured dropdown with all theme options
- **Toggle**: Cycles through themes on click
- **Segmented**: Radio button style selection

### Button

Theme-aware button component:

```tsx
<Button
  variant="primary" // 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'success' | 'warning'
  size="md" // 'xs' | 'sm' | 'md' | 'lg' | 'xl'
  loading={false} // Show loading state
  disabled={false} // Disabled state
  fullWidth={false} // Full width button
  leftIcon={<Icon />} // Icon on the left
  rightIcon={<Icon />} // Icon on the right
>
  Button Text
</Button>
```

### Card

Theme-aware card component:

```tsx
<Card
  variant="default" // 'default' | 'outlined' | 'elevated' | 'filled'
  size="md" // 'sm' | 'md' | 'lg'
  clickable={false} // Make card clickable
  onClick={() => {}} // Click handler
>
  <Card.Header>
    <Card.Title>Title</Card.Title>
  </Card.Header>
  <Card.Content>Content goes here</Card.Content>
  <Card.Footer>
    <Button>Action</Button>
  </Card.Footer>
</Card>
```

## Utility Functions

### Theme Utilities

```tsx
import { themeUtils } from '../shared/utils/theme.utils';

// Get CSS custom property
const primaryColor = themeUtils.getCSSVariable('--color-primary-500');

// Get theme color
const textColor = themeUtils.getThemeColor('text-primary');

// Check current theme
const isDark = themeUtils.isDarkTheme();

// Get theme-aware value
const borderColor = themeUtils.getThemeValue('#e5e7eb', '#374151');

// Create theme-aware styles
const styles = themeUtils.createThemeStyles({
  common: { padding: '16px' },
  light: { backgroundColor: '#ffffff' },
  dark: { backgroundColor: '#1f2937' },
});
```

### Creating Custom Theme-Aware Components

```tsx
import { useThemeValues } from '../core/providers/ThemeProvider';

function CustomComponent() {
  const { isDark, themeValue, getThemeColor } = useThemeValues();

  return (
    <div
      style={{
        backgroundColor: getThemeColor('bg-primary'),
        color: getThemeColor('text-primary'),
        border: `1px solid ${getThemeColor('border-primary')}`,
        padding: themeValue('16px', '20px'), // More padding in dark mode
        borderRadius: isDark ? '8px' : '4px',
      }}
    >
      Custom themed content
    </div>
  );
}
```

## Best Practices

### 1. Always Use CSS Custom Properties

**Good:**

```css
.my-component {
  background-color: var(--color-bg-primary);
  color: var(--color-text-primary);
  border: 1px solid var(--color-border-primary);
}
```

**Bad:**

```css
.my-component {
  background-color: #ffffff;
  color: #000000;
  border: 1px solid #e5e7eb;
}
```

### 2. Use Semantic Color Names

**Good:**

```css
.error-message {
  color: var(--color-error-500);
}

.success-message {
  color: var(--color-success-500);
}
```

**Bad:**

```css
.error-message {
  color: var(--color-red-500);
}
```

### 3. Leverage Theme-Aware Components

**Good:**

```tsx
<Button variant="primary">Submit</Button>
<Card variant="elevated">Content</Card>
```

**Bad:**

```tsx
<button style={{ backgroundColor: '#3b82f6' }}>Submit</button>
```

### 4. Use Consistent Spacing

**Good:**

```css
.component {
  padding: var(--spacing-lg);
  margin-bottom: var(--spacing-xl);
  gap: var(--spacing-md);
}
```

**Bad:**

```css
.component {
  padding: 16px;
  margin-bottom: 24px;
  gap: 12px;
}
```

### 5. Test All Themes

Always test your components in all theme modes:

- Light mode
- Dark mode
- System mode (both light and dark system preferences)

## Accessibility

### High Contrast Support

The theme system includes high contrast mode support:

```css
@media (prefers-contrast: high) {
  :root {
    --color-border-primary: #000000;
    --color-text-primary: #000000;
  }

  .theme-dark {
    --color-border-primary: #ffffff;
    --color-text-primary: #ffffff;
  }
}
```

### Reduced Motion

Respects user's motion preferences:

```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

### Color Contrast

All color combinations meet WCAG AA contrast requirements:

- Light mode: 4.5:1 minimum contrast ratio
- Dark mode: 4.5:1 minimum contrast ratio
- Interactive elements: 3:1 minimum contrast ratio

## Advanced Usage

### Custom Theme Configuration

```tsx
<ThemeProvider
  defaultTheme="system"
  enableSystem={true}
  enableTransitions={true}
  storageKey="my-app-theme"
  attribute="class"
>
  <App />
</ThemeProvider>
```

### Creating Theme Variants

```tsx
// Create custom theme variants
const createCustomTheme = (baseTheme: 'light' | 'dark') => {
  return {
    ...baseTheme,
    colors: {
      primary: baseTheme === 'dark' ? '#60a5fa' : '#3b82f6',
      secondary: baseTheme === 'dark' ? '#a78bfa' : '#8b5cf6',
    },
  };
};
```

### Dynamic Theme Updates

```tsx
function DynamicTheme() {
  const { setTheme } = useThemeContext();

  useEffect(() => {
    // Change theme based on time of day
    const hour = new Date().getHours();
    const isDaytime = hour >= 6 && hour < 18;

    setTheme(isDaytime ? 'light' : 'dark');
  }, []);

  return <div>Dynamic theme content</div>;
}
```

## Troubleshooting

### Common Issues

1. **Theme not persisting**: Check localStorage availability
2. **Flashing on load**: Ensure theme is set before first render
3. **Custom properties not working**: Verify CSS import order
4. **System theme not detected**: Check browser compatibility

### Browser Support

- **Modern browsers**: Full support
- **Safari**: Full support (iOS 12.2+)
- **Chrome**: Full support (79+)
- **Firefox**: Full support (72+)
- **Edge**: Full support (79+)

### Performance Considerations

- CSS custom properties are performant
- Theme changes only trigger necessary re-renders
- Transitions are GPU-accelerated where possible
- Lazy loading of theme CSS reduces initial bundle size

## Migration Guide

### From Legacy Theme System

1. Replace hardcoded colors with CSS custom properties
2. Update theme switching logic to use new hooks
3. Replace custom theme components with provided ones
4. Update tests to use new theme utilities

### Example Migration

**Before:**

```tsx
function OldComponent() {
  const [isDark, setIsDark] = useState(false);

  return (
    <div
      style={{
        backgroundColor: isDark ? '#1f2937' : '#ffffff',
        color: isDark ? '#f9fafb' : '#111827',
      }}
    >
      <button onClick={() => setIsDark(!isDark)}>Toggle Theme</button>
    </div>
  );
}
```

**After:**

```tsx
function NewComponent() {
  const { isDark } = useThemeContext();

  return (
    <div
      style={{
        backgroundColor: 'var(--color-bg-primary)',
        color: 'var(--color-text-primary)',
      }}
    >
      <ThemeSwitcher variant="toggle" />
    </div>
  );
}
```

## Contributing

When adding new theme features:

1. Follow the existing color naming conventions
2. Add proper TypeScript types
3. Include comprehensive tests
4. Update documentation
5. Test accessibility features
6. Verify browser compatibility

---

This theme system provides a solid foundation for consistent, accessible, and maintainable theming
across the entire Cheetah Payroll application.
