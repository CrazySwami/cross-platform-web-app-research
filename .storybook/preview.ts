import type { Preview } from '@storybook/react';
import '../src/index.css';

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    docs: {
      toc: true,
    },
    a11y: {
      // Accessibility testing config
      element: '#storybook-root',
      config: {},
      options: {},
      manual: false,
    },
  },
  tags: ['autodocs'],
};

export default preview;
