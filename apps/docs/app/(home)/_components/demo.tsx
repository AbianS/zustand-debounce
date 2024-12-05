import { CodeBlock } from '@/components/code-block';
import { LANDING_CODE } from '@/lib/constants';
import { ZustandDemo } from './zustand-demo';

export function LandingDemo() {
  return (
    <>
      <div className="mb-4 flex flex-col gap-4 sm:flex-row sm:items-center">
        <ZustandDemo />
      </div>
      <CodeBlock code={LANDING_CODE} />
    </>
  );
}
