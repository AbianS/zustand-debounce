import { DocsLayout } from 'fumadocs-ui/layouts/docs';
import { DocsBody, DocsPage } from 'fumadocs-ui/page';
import { baseOptions } from '../layout.config';
import { getExampleTree } from './(examples)/examples';

export default function PlaygroundLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <DocsLayout
        tree={getExampleTree()}
        {...baseOptions}
        sidebar={{
          collapsible: false,
        }}
      >
        <DocsPage>
          <DocsBody>{children}</DocsBody>
        </DocsPage>
      </DocsLayout>
    </>
  );
}
