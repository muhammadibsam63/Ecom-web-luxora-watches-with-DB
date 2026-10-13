import { useScrollReveal } from '../../animations/useScrollAnimations';
import styles from './SectionHeading.module.css';

export default function SectionHeading({ eyebrow, title, description, align = 'left' }) {
  const ref = useScrollReveal({ y: 20 });
  return (
    <div ref={ref} className={styles.wrap} data-align={align}>
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2 className={styles.title}>{title}</h2>
      {description && <p className={styles.desc}>{description}</p>}
    </div>
  );
}
