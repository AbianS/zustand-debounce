'use client';

import { cn } from '@/lib/utils';
import { Github } from 'lucide-react';

export function FirstFeaturesSection() {
  const features = [
    {
      title: 'Flexible Application Deployment',
      description:
        'Deploy any application using Nixpacks, Heroku Buildpacks, or your custom Dockerfile, tailored to your stack.',
      icon: <Github />,
    },
    {
      title: 'Native Docker Compose Support',
      description:
        'Deploy complex applications natively with full Docker Compose integration for seamless orchestration.',
      icon: <Github />,
    },
    {
      title: 'Multi-server Support',
      description:
        'Effortlessly deploy your applications on remote servers, with zero configuration hassle.',
      icon: <Github />,
    },
    {
      title: 'Advanced User Management',
      description:
        'Control user access with detailed roles and permissions, keeping your deployments secure and organized.',
      icon: <Github />,
    },
    {
      title: 'Database Management with Backups',
      description:
        'Manage and back up MySQL, PostgreSQL, MongoDB, MariaDB, Redis directly from Dokploy.',
      icon: <Github />,
    },
    {
      title: 'API & CLI Access',
      description:
        'Need custom functionality? Dokploy offers complete API and CLI access to fit your needs.',
      icon: <Github />,
    },
    {
      title: 'Docker Swarm Clusters',
      description:
        'Scale your deployments seamlessly with built-in Docker Swarm support for robust, multi-node applications.',
      icon: <Github />,
    },
    {
      title: 'Open Source Templates',
      description:
        'Get started quickly with pre-configured templates for popular tools like Supabase, Cal.com, and Pocketbase.',
      icon: <Github />,
    },
    {
      title: 'No Vendor Lock-In',
      description:
        'Experience complete freedom to modify, scale, and customize Dokploy to suit your specific needs.',
      icon: <Github />,
    },
    {
      title: 'Real-time Monitoring & Alerts',
      description:
        'Monitor CPU, memory, and network usage in real-time across your deployments for full visibility.',
      icon: <Github />,
    },
    {
      title: 'Built for developers',
      description:
        'Designed specifically for engineers and developers seeking control and flexibility.',
      icon: <Github />,
    },
    {
      title: 'Self-hosted & Open Source',
      description:
        'Dokploy provides complete control with self-hosting capabilities and open-source transparency.',
      icon: <Github />,
    },
  ];
  return (
    <section className="flex flex-col justify-center items-center pt-32 pb-24 px-4">
      <h2 className="font-display text-3xl tracking-tight text-primary sm:text-4xl text-center">
        Powerful Deployment, Tailored for You
      </h2>
      <p className="mt-4 text-lg tracking-tight  text-muted-foreground text-center">
        Unlock seamless multi-server deployments, advanced user control, and
        flexible database management—all with Dokploy’s developer-focused
        features.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4  relative z-10 py-10 max-w-7xl mx-auto mt-10 max-sm:p-0 max-sm:mx-0 max-sm:w-full">
        {features.map((feature, index) => (
          <Feature key={feature.title} {...feature} index={index} />
        ))}
      </div>
    </section>
  );
}

const Feature = ({
  title,
  description,
  icon,
  index,
}: {
  title: string;
  description: string;
  icon: React.ReactNode;
  index: number;
}) => {
  return (
    <div
      className={cn(
        'flex flex-col lg:border-r  py-10 relative group/feature border-neutral-800',
        (index === 0 || index === 4 || index === 8) &&
          'lg:border-l dark:border-neutral-800',
        (index < 4 || index < 8) && 'lg:border-b dark:border-neutral-800',
      )}
    >
      {index < 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-t from-neutral-800 to-transparent pointer-events-none" />
      )}
      {index >= 4 && (
        <div className="opacity-0 group-hover/feature:opacity-100 transition duration-200 absolute inset-0 h-full w-full bg-gradient-to-b from-neutral-800 to-transparent pointer-events-none" />
      )}
      <div className="mb-4 relative z-10 px-10 text-neutral-400">{icon}</div>
      <div className="text-lg font-bold mb-2 relative z-10 px-10">
        <div className="absolute left-0 inset-y-0 h-6 group-hover/feature:h-8 w-1 rounded-tr-full rounded-br-full bg-neutral-700 group-hover/feature:bg-white transition-all duration-200 origin-center" />
        <span className="group-hover/feature:translate-x-2 transition duration-200 inline-block text-neutral-100">
          {title}
        </span>
      </div>
      <p className="text-sm text-neutral-300 max-w-xs relative z-10 px-10">
        {description}
      </p>
    </div>
  );
};
