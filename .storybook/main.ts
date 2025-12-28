import type { StorybookConfig } from '@storybook/react-vite';

const config: StorybookConfig = {
  stories: ['../src/**/*.stories.@(ts|tsx|mdx)'],
  addons: [
    '@storybook/addon-essentials',
    '@storybook/addon-interactions',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {},
  },
  docs: {
    autodocs: 'tag',
  },
  viteFinal: async (config) => {
    // Customize Vite config for Storybook
    return {
      ...config,
      define: {
        ...config.define,
        // Mock Tauri internals for Storybook (web environment)
        '__TAURI_INTERNALS__': undefined,
      },
    };
  },
};

export default config;
