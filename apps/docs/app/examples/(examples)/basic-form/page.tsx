import { CodeBlock } from '@/components/code-block';
import { Description, H1 } from '@/components/typography';
import { getMetadata } from '../examples';
import { BasicForm } from './_components/form';
import { BASIC_FORM_CODE } from '@/lib/constants';

export const metadata = getMetadata('basic-form');

export default function BasicCounterDemoPage() {
  return (
    <>
      <H1 className="mb-4 text-3xl font-bold text-foreground sm:text-4xl">
        {metadata.title}
      </H1>
      <Description>{metadata.description}</Description>
      <BasicForm />
      <hr />
      <CodeBlock code={BASIC_FORM_CODE} />
    </>
  );
}
