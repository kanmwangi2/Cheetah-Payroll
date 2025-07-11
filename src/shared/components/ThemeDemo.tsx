/**
 * Theme Demo Component
 * Showcases the theme system with all available components and colors
 */

import React, { useState } from 'react';
import { useThemeValues } from '../../core/providers/ThemeProvider';
import ThemeSwitcher from './ui/ThemeSwitcher';
import Button from './ui/Button';
import Card, { CardHeader, CardTitle, CardContent, CardFooter } from './ui/Card';
import LoadingSpinner from './ui/LoadingSpinner';

export const ThemeDemo: React.FC = () => {
  const {
    theme,
    resolvedTheme,
    systemTheme,
    isSystemTheme,
    isDark,
    isLight,
    getCSSVariable,
    getThemeColor,
    themeValue,
  } = useThemeValues();

  const [loading, setLoading] = useState(false);

  const handleLoadingDemo = () => {
    setLoading(true);
    setTimeout(() => setLoading(false), 3000);
  };

  const colorCategories = [
    {
      name: 'Primary Colors',
      colors: ['primary-500', 'primary-600', 'primary-700'],
    },
    {
      name: 'Semantic Colors',
      colors: ['success-500', 'warning-500', 'error-500', 'info-500'],
    },
    {
      name: 'Text Colors',
      colors: ['text-primary', 'text-secondary', 'text-tertiary'],
    },
    {
      name: 'Background Colors',
      colors: ['bg-primary', 'bg-secondary', 'bg-tertiary'],
    },
    {
      name: 'Border Colors',
      colors: ['border-primary', 'border-secondary', 'border-focus'],
    },
  ];

  const spacingValues = ['xs', 'sm', 'md', 'lg', 'xl', '2xl', '3xl'];
  const fontSizes = ['xs', 'sm', 'base', 'lg', 'xl', '2xl', '3xl'];

  return (
    <div
      style={{
        padding: 'var(--spacing-lg)',
        backgroundColor: 'var(--color-bg-primary)',
        minHeight: '100vh',
        color: 'var(--color-text-primary)',
      }}
    >
      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          position: 'relative',
        }}
      >
        {/* Theme Switcher */}
        <div
          style={{
            position: 'fixed',
            top: 'var(--spacing-lg)',
            right: 'var(--spacing-lg)',
            zIndex: 1000,
          }}
        >
          <ThemeSwitcher variant="dropdown" showLabels={true} />
        </div>

        {/* Header */}
        <header
          style={{
            textAlign: 'center',
            marginBottom: 'var(--spacing-4xl)',
            paddingTop: 'var(--spacing-4xl)',
          }}
        >
          <h1
            style={{
              fontSize: 'var(--font-size-4xl)',
              fontWeight: 'var(--font-weight-bold)',
              color: 'var(--color-text-primary)',
              marginBottom: 'var(--spacing-lg)',
            }}
          >
            🎨 Cheetah Payroll Theme Demo
          </h1>

          <p
            style={{
              fontSize: 'var(--font-size-lg)',
              color: 'var(--color-text-secondary)',
              maxWidth: '600px',
              margin: '0 auto',
            }}
          >
            Explore the comprehensive theme system with light, dark, and system modes. All
            components automatically adapt to the selected theme.
          </p>
        </header>

        {/* Theme Information */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Theme Information</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 'var(--spacing-lg)',
              }}
            >
              <div>
                <h4
                  style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Current Theme
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {theme} {isSystemTheme && `(resolves to ${resolvedTheme})`}
                </p>
              </div>

              <div>
                <h4
                  style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  System Theme
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {systemTheme} {systemTheme === 'dark' ? '🌙' : '☀️'}
                </p>
              </div>

              <div>
                <h4
                  style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Mode
                </h4>
                <p
                  style={{
                    margin: 0,
                    color: 'var(--color-text-secondary)',
                    fontSize: 'var(--font-size-sm)',
                  }}
                >
                  {isDark ? 'Dark Mode' : 'Light Mode'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Button Variants */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Button Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <Button variant="primary">Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="danger">Danger</Button>
              <Button variant="success">Success</Button>
              <Button variant="warning">Warning</Button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
              }}
            >
              <Button size="xs">Extra Small</Button>
              <Button size="sm">Small</Button>
              <Button size="md">Medium</Button>
              <Button size="lg">Large</Button>
              <Button size="xl">Extra Large</Button>
            </div>

            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 'var(--spacing-md)',
              }}
            >
              <Button loading={loading} onClick={handleLoadingDemo}>
                {loading ? 'Loading...' : 'Trigger Loading'}
              </Button>
              <Button disabled>Disabled</Button>
              <Button leftIcon={<span>🎨</span>}>With Icon</Button>
            </div>
          </CardContent>
        </Card>

        {/* Card Variants */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Card Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: 'var(--spacing-lg)',
              }}
            >
              <Card variant="default">
                <CardContent>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Default Card</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Standard card with shadow and border
                  </p>
                </CardContent>
              </Card>

              <Card variant="outlined">
                <CardContent>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Outlined Card</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Card with border, no shadow
                  </p>
                </CardContent>
              </Card>

              <Card variant="elevated">
                <CardContent>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Elevated Card</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Card with enhanced shadow
                  </p>
                </CardContent>
              </Card>

              <Card variant="filled">
                <CardContent>
                  <h4 style={{ margin: '0 0 var(--spacing-sm) 0' }}>Filled Card</h4>
                  <p style={{ margin: 0, fontSize: 'var(--font-size-sm)' }}>
                    Card with background fill
                  </p>
                </CardContent>
              </Card>
            </div>
          </CardContent>
        </Card>

        {/* Color Palette */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Color Palette</CardTitle>
          </CardHeader>
          <CardContent>
            {colorCategories.map(category => (
              <div key={category.name} style={{ marginBottom: 'var(--spacing-xl)' }}>
                <h4
                  style={{
                    margin: '0 0 var(--spacing-md) 0',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  {category.name}
                </h4>
                <div
                  style={{
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-md)',
                  }}
                >
                  {category.colors.map(colorName => (
                    <div
                      key={colorName}
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        gap: 'var(--spacing-sm)',
                      }}
                    >
                      <div
                        style={{
                          width: '60px',
                          height: '60px',
                          borderRadius: 'var(--border-radius-md)',
                          backgroundColor: `var(--color-${colorName})`,
                          border: '1px solid var(--color-border-primary)',
                          boxShadow: 'var(--shadow-sm)',
                        }}
                      />
                      <span
                        style={{
                          fontSize: 'var(--font-size-xs)',
                          color: 'var(--color-text-tertiary)',
                          textAlign: 'center',
                        }}
                      >
                        {colorName}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Typography */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Typography</CardTitle>
          </CardHeader>
          <CardContent>
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <h4
                style={{
                  margin: '0 0 var(--spacing-md) 0',
                  color: 'var(--color-text-primary)',
                }}
              >
                Font Sizes
              </h4>
              {fontSizes.map(size => (
                <div key={size} style={{ marginBottom: 'var(--spacing-sm)' }}>
                  <span
                    style={{
                      fontSize: `var(--font-size-${size})`,
                      color: 'var(--color-text-primary)',
                    }}
                  >
                    Font size {size} - The quick brown fox jumps over the lazy dog
                  </span>
                </div>
              ))}
            </div>

            <div>
              <h4
                style={{
                  margin: '0 0 var(--spacing-md) 0',
                  color: 'var(--color-text-primary)',
                }}
              >
                Font Weights
              </h4>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-light)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Light (300) - The quick brown fox jumps over the lazy dog
                </span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-normal)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Normal (400) - The quick brown fox jumps over the lazy dog
                </span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-medium)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Medium (500) - The quick brown fox jumps over the lazy dog
                </span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-semibold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Semibold (600) - The quick brown fox jumps over the lazy dog
                </span>
              </div>
              <div style={{ marginBottom: 'var(--spacing-sm)' }}>
                <span
                  style={{
                    fontWeight: 'var(--font-weight-bold)',
                    color: 'var(--color-text-primary)',
                  }}
                >
                  Bold (700) - The quick brown fox jumps over the lazy dog
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Spacing */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Spacing Scale</CardTitle>
          </CardHeader>
          <CardContent>
            {spacingValues.map(spacing => (
              <div key={spacing} style={{ marginBottom: 'var(--spacing-md)' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-md)',
                  }}
                >
                  <span
                    style={{
                      fontSize: 'var(--font-size-sm)',
                      color: 'var(--color-text-secondary)',
                      minWidth: '60px',
                    }}
                  >
                    {spacing}
                  </span>
                  <div
                    style={{
                      width: `var(--spacing-${spacing})`,
                      height: '20px',
                      backgroundColor: 'var(--color-primary-500)',
                      borderRadius: 'var(--border-radius-sm)',
                    }}
                  />
                  <span
                    style={{
                      fontSize: 'var(--font-size-xs)',
                      color: 'var(--color-text-tertiary)',
                    }}
                  >
                    {getCSSVariable(`--spacing-${spacing}`)}
                  </span>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Loading States */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Loading States</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xl)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div style={{ textAlign: 'center' }}>
                <LoadingSpinner size="small" message="Small" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <LoadingSpinner size="medium" message="Medium" />
              </div>
              <div style={{ textAlign: 'center' }}>
                <LoadingSpinner size="large" message="Large" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Theme Switcher Variants */}
        <Card style={{ marginBottom: 'var(--spacing-2xl)' }}>
          <CardHeader>
            <CardTitle>Theme Switcher Variants</CardTitle>
          </CardHeader>
          <CardContent>
            <div
              style={{
                display: 'flex',
                gap: 'var(--spacing-xl)',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              <div>
                <h5
                  style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Toggle
                </h5>
                <ThemeSwitcher variant="toggle" />
              </div>

              <div>
                <h5
                  style={{
                    margin: '0 0 var(--spacing-sm) 0',
                    fontSize: 'var(--font-size-sm)',
                    color: 'var(--color-text-secondary)',
                  }}
                >
                  Segmented
                </h5>
                <ThemeSwitcher variant="segmented" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Footer */}
        <Card>
          <CardContent>
            <div style={{ textAlign: 'center' }}>
              <p
                style={{
                  margin: 0,
                  color: 'var(--color-text-secondary)',
                  fontSize: 'var(--font-size-sm)',
                }}
              >
                🎨 Cheetah Payroll Theme System • Built with React, TypeScript, and CSS Custom
                Properties
              </p>
              <p
                style={{
                  margin: 'var(--spacing-sm) 0 0 0',
                  color: 'var(--color-text-tertiary)',
                  fontSize: 'var(--font-size-xs)',
                }}
              >
                Switch themes using the controls above to see all components adapt automatically
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ThemeDemo;
