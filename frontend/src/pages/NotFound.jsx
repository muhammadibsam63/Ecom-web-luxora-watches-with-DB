import { Link } from 'react-router-dom';
import styles from './NotFound.module.css';

export default function NotFound() {
  return (
    <div className={styles.wrap}>
      <span className={styles.code}>404</span>
      <h1>This page has wandered off.</h1>
      <p>The page you're looking for doesn't exist, or has moved.</p>
      <Link to="/" className="btn btn-primary">Return Home</Link>
    </div>
  );
}
