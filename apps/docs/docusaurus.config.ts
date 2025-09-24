import { themes as prismThemes } from 'prism-react-renderer';
import type { Config } from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Zustand Debounce',
  tagline: 'Almacenamiento JSON optimizado con debounce para Zustand',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://zustand-debounce.vercel.app',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'AbianS', // Usually your GitHub org/user name.
  projectName: 'zustand-debounce', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'es',
    locales: ['es'],
  },

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          editUrl:
            'https://github.com/AbianS/zustand-debounce/tree/main/apps/docs/',
        },
        blog: false, // Disable blog
        theme: {
          customCss: './src/css/custom.css',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/zustand-debounce-social.jpg',
    navbar: {
      title: 'Zustand Debounce',
      logo: {
        alt: 'Zustand Debounce Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'tutorialSidebar',
          position: 'left',
          label: 'Documentación',
        },
        {
          href: 'https://www.npmjs.com/package/zustand-debounce',
          label: 'NPM',
          position: 'right',
        },
        {
          href: 'https://github.com/AbianS/zustand-debounce',
          label: 'GitHub',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentación',
          items: [
            {
              label: 'Inicio Rápido',
              to: '/docs/intro',
            },
            {
              label: 'Instalación',
              to: '/docs/installation',
            },
            {
              label: 'Configuración',
              to: '/docs/configuration',
            },
          ],
        },
        {
          title: 'Más',
          items: [
            {
              label: 'GitHub',
              href: 'https://github.com/AbianS/zustand-debounce',
            },
            {
              label: 'NPM Package',
              href: 'https://www.npmjs.com/package/zustand-debounce',
            },
            {
              label: 'Zustand Official',
              href: 'https://github.com/pmndrs/zustand',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Zustand Debounce. Hecho con ❤️ por <a href="https://github.com/AbianS" target="_blank">AbianS</a>`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.vsDark,
      additionalLanguages: ['bash', 'typescript', 'javascript', 'json'],
    },
    colorMode: {
      defaultMode: 'dark',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    announcementBar: {
      id: 'new_version',
      content:
        '⭐ Si te gusta Zustand Debounce, ¡dale una estrella en <a target="_blank" rel="noopener noreferrer" href="https://github.com/AbianS/zustand-debounce">GitHub</a>!',
      backgroundColor: '#fafbfc',
      textColor: '#091E42',
      isCloseable: true,
    },
  } satisfies Preset.ThemeConfig,
};

export default config;
