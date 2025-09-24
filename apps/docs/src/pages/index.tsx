import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/docs/intro">
            Get Started 🚀
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/installation"
          >
            Installation 📦
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>1.74 kB</span>
            <span className={styles.statLabel}>Minified size</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>Dependencies</span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>TypeScript</span>
            <span className={styles.statLabel}>Full support</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default function Home(): ReactNode {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout
      title={`${siteConfig.title} - Debounce for Zustand`}
      description="Optimized JSON storage with debounce for Zustand. Reduces write operations and improves your application's performance."
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
