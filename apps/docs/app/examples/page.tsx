import { Description, H1 } from '@/components/typography';
import { demos } from './(examples)/examples';
import { Card } from 'fumadocs-ui/components/card';

export const metadata = {
  title: 'Examples',
  description: 'Examples and demos of zustand-debounce',
};

export default function ExamplesIndexPage() {
  return (
    <main className="py-6 md:py-10">
      <H1>{metadata.title}</H1>
      <Description>{metadata.description}</Description>
      <ul className="not-prose my-8 space-y-2">
        {Object.entries(demos).map(([path, { title, description }]) => (
          <li key={path}>
            <Card
              title={title}
              description={description}
              href={`/examples/${path}`}
            />
          </li>
        ))}
      </ul>
    </main>
  );
}
