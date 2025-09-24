import type { ReactNode } from 'react';
import clsx from 'clsx';
import Link from '@docusaurus/Link';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';
import Heading from '@theme/Heading';
import Translate, { translate } from '@docusaurus/Translate';

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
            <Translate id="homepage.getStarted">Get Started 🚀</Translate>
          </Link>
          <Link
            className="button button--secondary button--lg"
            to="/docs/installation"
          >
            <Translate id="homepage.installation">Installation 📦</Translate>
          </Link>
        </div>
        <div className={styles.heroStats}>
          <div className={styles.stat}>
            <span className={styles.statNumber}>1.74 kB</span>
            <span className={styles.statLabel}>
              <Translate id="homepage.stat.minified">Minified size</Translate>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>0</span>
            <span className={styles.statLabel}>
              <Translate id="homepage.stat.dependencies">
                Dependencies
              </Translate>
            </span>
          </div>
          <div className={styles.stat}>
            <span className={styles.statNumber}>TypeScript</span>
            <span className={styles.statLabel}>
              <Translate id="homepage.stat.typescript">Full support</Translate>
            </span>
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
      title={translate({
        id: 'homepage.title',
        message: 'Zustand Debounce - Debounce for Zustand',
      })}
      description={translate({
        id: 'homepage.description',
        message:
          'Optimized JSON storage with debounce for Zustand. Reduces write operations and improves your application performance.',
      })}
    >
      <HomepageHeader />
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
