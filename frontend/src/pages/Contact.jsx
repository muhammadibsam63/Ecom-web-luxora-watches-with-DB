import { useState } from 'react';
import { Mail, Phone, MapPin } from '../components/icons';
import { contactService } from '../services/contentServices';
import { useToast } from '../components/Toast';
import { useScrollReveal } from '../animations/useScrollAnimations';
import styles from './Contact.module.css';
import usePageMeta from '../hooks/usePageMeta';

export default function Contact() {
  usePageMeta({ title: 'Contact', description: 'Get in touch with the Luxora Watches team.' });
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [sending, setSending] = useState(false);
  const toast = useToast();
  const formRef = useScrollReveal({ y: 20 });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSending(true);
    try {
      const res = await contactService.submit(form);
      toast.success(res.message || 'Your message has been sent.');
      setForm({ name: '', email: '', subject: '', message: '' });
    } catch (err) {
      toast.error(err.message || 'Could not send your message.');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={`container ${styles.header}`}>
        <span className="eyebrow">Contact</span>
        <h1>We'd love to hear from you.</h1>
        <p>Questions about an order, a piece you're considering, or anything else — reach out and our team will respond shortly.</p>
      </div>

      <div className={`container ${styles.grid}`}>
        <form className={styles.form} onSubmit={handleSubmit} ref={formRef}>
          <label className={styles.field}>
            <span>Full Name</span>
            <input required placeholder="Enter your full name" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span>Email Address</span>
            <input type="email" required placeholder="Enter your email address" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span>Subject</span>
            <input placeholder="What is this regarding?" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
          </label>
          <label className={styles.field}>
            <span>Message</span>
            <textarea required rows={6} placeholder="Write your message…" value={form.message} onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))} />
          </label>
          <button type="submit" className="btn btn-primary" disabled={sending}>{sending ? 'Sending…' : 'Send Message'}</button>
        </form>

        <div className={styles.info}>
          <div className={styles.infoItem}>
            <Mail size={18} strokeWidth={1.5} />
            <div><span>Email</span><strong>support@luxorawatches.com</strong></div>
          </div>
          <div className={styles.infoItem}>
            <Phone size={18} strokeWidth={1.5} />
            <div><span>Phone</span><strong>+92 300 0000000</strong></div>
          </div>
          <div className={styles.infoItem}>
            <MapPin size={18} strokeWidth={1.5} />
            <div><span>Showroom</span><strong>Karachi, Pakistan</strong></div>
          </div>
        </div>
      </div>
    </div>
  );
}
