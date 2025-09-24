import type { ReactNode } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';
import Translate from '@docusaurus/Translate';
import styles from './styles.module.css';

type FeatureItem = {
  title: ReactNode;
  icon: string;
  description: ReactNode;
  badge?: string;
};

const FeatureList: FeatureItem[] = [
  {
    title: (
      <Translate id="features.ultraLightweight.title">
        Ultra Lightweight
      </Translate>
    ),
    icon: '🪶',
    badge: '1.74 kB',
    description: (
      <Translate id="features.ultraLightweight.description">
        Only 1.74 kB gzipped with zero external dependencies. Optimized for the
        best possible performance without compromising functionality.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="features.smartDebounce.title">Smart Debounce</Translate>
    ),
    icon: '⏱️',
    description: (
      <Translate id="features.smartDebounce.description">
        Groups multiple changes into a single write operation, significantly
        reducing I/O operations and improving performance.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="features.multipleAdapters.title">
        Multiple Adapters
      </Translate>
    ),
    icon: '🗄️',
    description: (
      <>
        <Translate id="features.multipleAdapters.description">
          Support for localStorage, sessionStorage, memoryStorage and custom
          adapters.
        </Translate>
      </>
    ),
  },
  {
    title: <Translate id="features.retrySystem.title">Retry System</Translate>,
    icon: '🔁',
    description: (
      <Translate id="features.retrySystem.description">
        Automatic retries with configurable exponential backoff for failed
        operations, ensuring data persistence.
      </Translate>
    ),
  },
  {
    title: <Translate id="features.ttl.title">TTL (Time-to-Live)</Translate>,
    icon: '⌛',
    description: (
      <Translate id="features.ttl.description">
        Specify a lifetime for stored data. Expired data is automatically
        removed from storage.
      </Translate>
    ),
  },
  {
    title: (
      <Translate id="features.typescript.title">Full TypeScript</Translate>
    ),
    icon: '📘',
    badge: 'TypeScript',
    description: (
      <Translate id="features.typescript.description">
        Full TypeScript support with strict typing and autocompletion. Built
        with TypeScript from the ground up.
      </Translate>
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
          <Heading as="h2">
            <Translate id="features.heading">
              Why choose Zustand Debounce?
            </Translate>
          </Heading>
          <p className="lead">
            <Translate id="features.subheading">
              A powerful and lightweight extension that significantly improves
              your Zustand application performance through smart debouncing.
            </Translate>
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
