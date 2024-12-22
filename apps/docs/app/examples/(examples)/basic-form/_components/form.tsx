'use client';

import { CodeBlock } from '@/components/code-block.client';
import { useFormStore } from './form.store';
import { Timer } from 'lucide-react';
import useFormattedLocalStorageJSON from '@/lib/hooks/use-local-storage-data';

export function BasicForm() {
  const { name, surname, setName, setSurname, email, setEmail } =
    useFormStore();
  const code = useFormattedLocalStorageJSON('form-storage');

  return (
    <section className="flex flex-col gap-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="grid w-full  items-center gap-1.5">
          <label htmlFor="name">Name</label>
          <input
            id="name"
            value={name}
            placeholder="Enter your name"
            className="peer flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setName(e.target.value)}
            data-interacted={Boolean(name)}
          />
        </div>

        <div className="grid w-full items-center gap-1.5">
          <label htmlFor="surname">Surname</label>
          <input
            id="surname"
            value={surname}
            placeholder="Enter your surname"
            className="peer flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            onChange={(e) => setSurname(e.target.value)}
            data-interacted={Boolean(name)}
          />
        </div>
      </div>
      <div className="grid w-full items-center gap-1.5">
        <label htmlFor="email">Email</label>
        <input
          id="email"
          value={email}
          placeholder="Enter your email"
          className="peer flex h-10 rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          onChange={(e) => setEmail(e.target.value)}
          data-interacted={Boolean(name)}
        />
      </div>

      <CodeBlock
        allowCopy={false}
        title="localStorage (real time)"
        icon={<Timer />}
        code={code}
        lang="json"
      />
    </section>
  );
}
