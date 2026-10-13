import { Link, useParams, Navigate } from 'react-router-dom';
import usePageMeta from '../hooks/usePageMeta';
import { useScrollReveal } from '../animations/useScrollAnimations';
import { INFO_PAGES } from './infoContent';
import styles from './InfoPage.module.css';

export default function InfoPage({ pageKey }) {
  const params = useParams();
  const key = pageKey || params.page;
  const page = INFO_PAGES[key];
  const ref = useScrollReveal({ y: 16 });
  usePageMeta({ title: page?.title, description: page?.summary });

  if (!page) return <Navigate to="/404" replace />;

  return (
    <div className={styles.page}>
      <div className={`container ${styles.inner}`} ref={ref}>
        <span className="eyebrow">{page.eyebrow}</span>
        <h1>{page.title}</h1>
        <p className={styles.lead}>{page.summary}</p>
        {page.sections.map((s) => (
          <section key={s.heading} className={styles.section}>
            <h2>{s.heading}</h2>
            {s.body.map((para, i) => <p key={i}>{para}</p>)}
          </section>
        ))}
        <p className={styles.help}>Still have a question? <Link to="/contact">Contact our team</Link>.</p>
      </div>
    </div>
  );
}
