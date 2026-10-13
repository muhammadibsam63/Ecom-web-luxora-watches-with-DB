import { useState } from 'react';
import { useScrollReveal } from '../../animations/useScrollAnimations';
import { useToast } from '../../components/Toast';
import styles from './Newsletter.module.css';

export default function Newsletter() {
  const ref = useScrollReveal({ y: 20 });
  const [email, setEmail] = useState('');
  const toast = useToast();

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!email.trim()) return;
    toast.success('You\u2019re on the list. Welcome to Luxora.');
    setEmail('');
  };

  return (
    <section className={styles.section} ref={ref}>
      <div className={`container ${styles.inner}`}>
        <h2 className={styles.title}>Join the Luxora circle.</h2>
        <p className={styles.desc}>New arrivals, private collections, and notes from the workshop — no more than once a month.</p>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            type="email"
            required
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className="btn btn-gold">Subscribe</button>
        </form>
      </div>
    </section>
  );
}
