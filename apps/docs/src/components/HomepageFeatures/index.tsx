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
    title: 'Ultra Ligero',
    icon: '🪶',
    badge: '1.74 kB',
    description: (
      <>
        Solo <strong>1.74 kB</strong> comprimido y sin dependencias externas.
        Optimizado para el mejor rendimiento posible sin comprometer
        funcionalidad.
      </>
    ),
  },
  {
    title: 'Debounce Inteligente',
    icon: '⏱️',
    description: (
      <>
        Agrupa múltiples cambios en una sola operación de escritura, reduciendo
        significativamente las operaciones de I/O y mejorando el rendimiento.
      </>
    ),
  },
  {
    title: 'Múltiples Adaptadores',
    icon: '🗄️',
    description: (
      <>
        Soporte para <code>localStorage</code>, <code>sessionStorage</code>,
        <code>memoryStorage</code> y adaptadores personalizados.
      </>
    ),
  },
  {
    title: 'Sistema de Reintentos',
    icon: '🔁',
    description: (
      <>
        Reintentos automáticos con backoff exponencial configurable para
        operaciones fallidas, garantizando la persistencia de datos.
      </>
    ),
  },
  {
    title: 'TTL (Time-to-Live)',
    icon: '⌛',
    description: (
      <>
        Especifica un tiempo de vida para los datos almacenados. Los datos
        expirados se eliminan automáticamente del storage.
      </>
    ),
  },
  {
    title: 'TypeScript Completo',
    icon: '📘',
    badge: 'TypeScript',
    description: (
      <>
        Soporte completo para TypeScript con tipos estrictos y autocompletado.
        Desarrollado con TypeScript desde el principio.
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
          <Heading as="h2">¿Por qué elegir Zustand Debounce?</Heading>
          <p className="lead">
            Una extensión poderosa y ligera que mejora significativamente el
            rendimiento de tu aplicación Zustand mediante debounce inteligente.
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
