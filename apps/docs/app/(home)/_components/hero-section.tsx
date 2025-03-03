import { BasicForm } from '@/app/examples/(examples)/basic-form/_components/form';
import { baseOptions } from '@/app/layout.config';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Github, Library } from 'lucide-react';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section className="container relative mb-12 grid grid-cols-1 items-center justify-center gap-8 xl:h-[max(650px,min(800px,calc(75vh)))] xl:grid-cols-2 xl:flex-row">
      <aside className="my-16 flex flex-col items-center self-center xl:my-24 xl:-mr-10 xl:ml-10 xl:flex-1 xl:items-start">
        <h1 className="text-6xl md:text-8xl">
          <p>Zustand Debounce</p>
        </h1>
        <p className="my-8 text-center text-2xl md:text-4xl xl:text-left">
          Smarter state persistence
          <br />
          for React with Zustand
        </p>
        <nav className="flex flex-wrap gap-4">
          <Link
            href="/docs"
            className={cn(
              buttonVariants({
                size: 'lg',
              }),
              'text-md w-full rounded-full sm:w-auto',
            )}
          >
            <Library className="mr-2 inline-block" size={20} />
            Documentation
          </Link>
          <a
            href={baseOptions.githubUrl}
            className={cn(
              buttonVariants({
                size: 'lg',
                variant: 'secondary',
              }),
              'text-md w-full rounded-full sm:w-auto',
            )}
          >
            <Github className="-ml-1 mr-2 inline-block" size={20} />
            GitHub
          </a>
        </nav>
      </aside>
      <aside className="relative my-4 xl:my-auto xl:flex-1 xl:pt-4">
        <BasicForm />
      </aside>
      {/* <div
        className="absolute -bottom-12 left-0 right-0 hidden h-12 items-center justify-center xl:flex"
        aria-hidden
      >
        <ChevronDown />
      </div> */}
    </section>
  );
}
