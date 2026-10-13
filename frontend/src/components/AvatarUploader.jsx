import { useRef, useState } from 'react';
import { Upload, Trash2 } from './icons';
import { useToast } from './Toast';
import styles from './AvatarUploader.module.css';

const ALLOWED = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;

/**
 * Avatar with initials fallback, local preview while uploading, type/size validation.
 * `onUpload(file)` must return a promise; `onRemove()` optional.
 */
export default function AvatarUploader({ avatarUrl, name = '', onUpload, onRemove }) {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const [busy, setBusy] = useState(false);
  const [broken, setBroken] = useState(false);
  const toast = useToast();

  const handleFile = async (file) => {
    if (!file) return;
    if (!ALLOWED.includes(file.type)) return toast.error('Please choose a JPG, PNG or WEBP image.');
    if (file.size > MAX_SIZE) return toast.error('Image must be smaller than 5MB.');

    const url = URL.createObjectURL(file);
    setPreview(url);
    setBusy(true);
    try {
      await onUpload(file);
      setBroken(false);
      toast.success('Avatar updated.');
    } catch (err) {
      toast.error(err.message || 'Could not upload avatar.');
    } finally {
      setBusy(false);
      setPreview(null);
      URL.revokeObjectURL(url);
      if (inputRef.current) inputRef.current.value = '';
    }
  };

  const shown = preview || (!broken && avatarUrl);

  return (
    <div className={styles.wrap}>
      <div className={styles.avatar} data-busy={busy}>
        {shown ? (
          <img src={shown} alt={`${name} avatar`} onError={() => setBroken(true)} />
        ) : (
          <span>{name.trim().charAt(0).toUpperCase() || '?'}</span>
        )}
      </div>
      <div className={styles.actions}>
        <button type="button" className={styles.btn} onClick={() => inputRef.current?.click()} disabled={busy}>
          <Upload size={12} /> {busy ? 'Uploading…' : avatarUrl ? 'Replace photo' : 'Upload photo'}
        </button>
        {avatarUrl && onRemove && (
          <button type="button" className={`${styles.btn} ${styles.danger}`} onClick={onRemove} disabled={busy}>
            <Trash2 size={12} /> Remove
          </button>
        )}
        <small>JPG, PNG or WEBP, up to 5MB</small>
      </div>
      <input ref={inputRef} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => handleFile(e.target.files?.[0])} />
    </div>
  );
}
