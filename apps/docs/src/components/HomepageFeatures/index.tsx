import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import styles from './styles.module.css';

type FeatureItem = {
  title: string;
  icon: string;
  description: ReactNode;
  badge?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: 'Ultra Lightweight',
    icon: '🪶',
    badge: '1.74 kB',
    description: (
      <>
        Only <strong>1.74 kB</strong> compressed and no external dependencies.
        Optimized for the best possible performance without compromising
        functionality.
      </>
    ),
  },
  {
    title: 'Smart Debounce',
    icon: '⏱️',
    description: (
      <>
        Groups multiple changes into a single write operation, significantly
        reducing I/O operations and improving performance.
      </>
    ),
  },
  {
    title: 'Multiple Adapters',
    icon: '🗄️',
    description: (
      <>
        Support for <code>localStorage</code>, <code>sessionStorage</code>,
        <code>memoryStorage</code> and custom adapters.
      </>
    ),
  },
  {
    title: 'Retry System',
    icon: '🔁',
    description: (
      <>
        Automatic retries with configurable exponential backoff for failed
        operations, ensuring data persistence.
      </>
    ),
  },
  {
    title: 'TTL (Time-to-Live)',
    icon: '⌛',
    description: (
      <>
        Specify a lifetime for stored data. Expired data is automatically
        removed from storage.
      </>
    ),
  },
  {
    title: 'Full TypeScript',
    icon: '📘',
    badge: 'TypeScript',
    description: (
      <>
        Full TypeScript support with strict types and autocompletion. Built with
        TypeScript from the ground up.
      </>
    ),
  },
];

function Feature({ title, icon, description, badge }: FeatureItem) {
  return (
    <div className={clsx('col col--4')}>
      <div className={clsx('feature-card', styles.featureCard)}>
        <div className="text--center">
          <span className="feature-icon">{icon}</span>
          {badge && (
            <div className={styles.badgeContainer}>
              <span
                className={clsx(
                  'badge',
                  badge === 'TypeScript' ? 'badge--primary' : 'badge--success',
                )}
              >
                {badge}
              </span>
            </div>
          )}
        </div>
        <div className="text--center">
          <Heading as="h3" className="feature-title">
            {title}
          </Heading>
          <p>{description}</p>
        </div>
      </div>
    </div>
  );
}

export default function HomepageFeatures(): ReactNode {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="text--center margin-bottom--xl">
          <Heading as="h2">Why choose Zustand Debounce?</Heading>
          <p className="lead">
            A powerful and lightweight extension that significantly improves
            your Zustand application's performance through smart debouncing.
          </p>
        </div>
        <div className="row">
          {FeatureList.map((props, idx) => (
            <Feature key={idx} {...props} />
          ))}
        </div>
      </div>
    </section>
  );
}
