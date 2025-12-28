import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'Layers',
  description: 'Cross-platform rich text editor built with Tauri, React, and TipTap',

  // Ignore localhost links (runtime-only) and relative links to root docs
  ignoreDeadLinks: [
    /localhost/,
    /^\.\/README/,
    /^\.\/STACK_COMPARISON/,
    /^\.\/PERFORMANCE_RESULTS/,
  ],

  head: [
    ['link', { rel: 'icon', href: '/favicon.ico' }]
  ],

  themeConfig: {
    logo: '/logo.svg',

    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'API', link: '/api/' },
      { text: 'Components', link: '/components/' },
      { text: 'Reference', link: '/reference/' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: 'Getting Started',
          items: [
            { text: 'Introduction', link: '/guide/' },
            { text: 'Installation', link: '/guide/installation' },
            { text: 'Architecture', link: '/guide/architecture' }
          ]
        },
        {
          text: 'Core Concepts',
          items: [
            { text: 'Platform Abstraction', link: '/guide/platform' },
            { text: 'Offline-First Sync', link: '/guide/sync' },
            { text: 'Authentication', link: '/guide/auth' }
          ]
        },
        {
          text: 'Development',
          items: [
            { text: 'Tooling', link: '/guide/tooling' }
          ]
        }
      ],
      '/api/': [
        {
          text: 'API Reference',
          items: [
            { text: 'Overview', link: '/api/' }
          ]
        },
        {
          text: 'Platform',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/generated/lib/platform/' },
            { text: 'PlatformAdapter', link: '/api/generated/lib/platform/interfaces/PlatformAdapter' },
            { text: 'detectPlatform', link: '/api/generated/lib/platform/functions/detectPlatform' },
            { text: 'getPlatformAdapter', link: '/api/generated/lib/platform/functions/getPlatformAdapter' }
          ]
        },
        {
          text: 'Supabase',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/generated/lib/supabase/' },
            { text: 'getSupabase', link: '/api/generated/lib/supabase/functions/getSupabase' },
            { text: 'User', link: '/api/generated/lib/supabase/interfaces/User' }
          ]
        },
        {
          text: 'Sync',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/generated/lib/sync/' },
            { text: 'LayersSyncProvider', link: '/api/generated/lib/sync/classes/LayersSyncProvider' },
            { text: 'OfflineSyncQueue', link: '/api/generated/lib/sync/classes/OfflineSyncQueue' }
          ]
        },
        {
          text: 'Hooks',
          collapsed: false,
          items: [
            { text: 'Overview', link: '/api/generated/hooks/' },
            { text: 'useAuth', link: '/api/generated/hooks/functions/useAuth' },
            { text: 'useAutoSave', link: '/api/generated/hooks/functions/useAutoSave' },
            { text: 'useCollaborativeEditor', link: '/api/generated/hooks/functions/useCollaborativeEditor' }
          ]
        }
      ],
      '/components/': [
        {
          text: 'Components',
          items: [
            { text: 'Overview', link: '/components/' },
            { text: 'Editor', link: '/components/editor' },
            { text: 'Toolbar', link: '/components/toolbar' }
          ]
        }
      ],
      '/reference/': [
        {
          text: 'Reference',
          items: [
            { text: 'Research', link: '/reference/research' },
            { text: 'Benchmarks', link: '/reference/benchmarks' },
            { text: 'Performance', link: '/reference/performance' },
            { text: 'Skills', link: '/reference/skills' },
            { text: 'Windows Setup', link: '/reference/windows-setup' },
            { text: 'iOS Build Guide', link: '/reference/ios-build' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/your-org/layers' }
    ],

    search: {
      provider: 'local'
    },

    editLink: {
      pattern: 'https://github.com/your-org/layers/edit/main/docs/:path',
      text: 'Edit this page on GitHub'
    },

    footer: {
      message: 'Released under the MIT License.',
      copyright: 'Copyright © 2024 Layers'
    }
  }
})
