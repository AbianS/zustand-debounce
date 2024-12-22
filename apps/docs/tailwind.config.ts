import { Config } from 'tailwindcss';
import shadcnPreset from './tailwind.shadcn';
import tremorPreset from './tailwind.tremor';
import tailwindAnimate from 'tailwindcss-animate';
import { createPreset as createFumadocsPreset } from 'fumadocs-ui/tailwind-plugin';
import containerQueries from '@tailwindcss/container-queries';

const tailwindConfig: Config = {
  darkMode: ['class'],
  content: [
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './content/**/*.{md,mdx}',
    './mdx-components.{ts,tsx}',
    '../../node_modules/fumadocs-ui/dist/**/*.js',
  ],
  theme: {
  	container: {
  		center: 'true',
  		padding: '2rem',
  		screens: {
  			'2xl': '1400px'
  		}
  	},
  	extend: {
  		keyframes: {
  			'accordion-down': {
  				from: {
  					height: '0'
  				},
  				to: {
  					height: 'var(--radix-accordion-content-height)'
  				}
  			},
  			'accordion-up': {
  				from: {
  					height: 'var(--radix-accordion-content-height)'
  				},
  				to: {
  					height: '0'
  				}
  			}
  		},
  		animation: {
  			'accordion-down': 'accordion-down 0.2s ease-out',
  			'accordion-up': 'accordion-up 0.2s ease-out'
  		}
  	}
  },
  presets: [
    createFumadocsPreset({
      layoutWidth: '1600px',
    }),
    shadcnPreset,
    tremorPreset,
  ],
  plugins: [tailwindAnimate, containerQueries],
};

export default tailwindConfig;
