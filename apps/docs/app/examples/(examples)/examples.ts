import type { PageTree } from 'fumadocs-core/server';

type DemoMetadata = {
  title: string;
  description: string;
};

export const demos = {
  'basic-form': {
    title: 'Basic Form',
    description:
      'A lightweight form example demonstrating debounced state storage in localStorage, with a 600ms debounce delay to optimize performance and reduce write operations',
  },
} as const satisfies Record<string, DemoMetadata>;

export function getMetadata(path: keyof typeof demos): DemoMetadata {
  return demos[path];
}

export function getExampleTree(): PageTree.Root {
  return {
    name: 'Examples',
    children: Object.entries(demos).map(([path, { title, description }]) => ({
      type: 'page',
      name: title,
      description,
      url: `/examples/${path}`,
    })),
  };
}
