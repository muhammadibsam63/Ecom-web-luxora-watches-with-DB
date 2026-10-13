import { useRef, useState } from 'react';
import { Upload, X, Star, GripVertical, Plus, ImageIcon } from '../../components/icons';
import { adminImageService } from '../../services/adminServices';
import { useToast } from '../../components/Toast';
import styles from './ImageUploader.module.css';

const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
const MAX_SIZE = 5 * 1024 * 1024;
const MAX_IMAGES = 50;
const URL_PATTERN = /^https?:\/\/.+/i;

export default function ImageUploader({ productId, images, onChange }) {
  const [urlFields, setUrlFields] = useState(['']);
  const [fileFields, setFileFields] = useState([null]);
  const [submitting, setSubmitting] = useState(false);
  const [progress, setProgress] = useState(0);
  const dragIndex = useRef(null);
  const toast = useToast();

  const plannedUrlCount = urlFields.filter((u) => u.trim()).length;
  const plannedFileCount = fileFields.filter(Boolean).length;
  const totalPlanned = images.length + plannedUrlCount + plannedFileCount;
  const atLimit = totalPlanned >= MAX_IMAGES;
  const remaining = Math.max(0, MAX_IMAGES - images.length);

  const validateFiles = (files) => {
    for (const f of files) {
      if (!ALLOWED_TYPES.includes(f.type)) {
        toast.error(`${f.name} is not a JPG, PNG or WEBP image.`);
        return false;
      }
      if (f.size > MAX_SIZE) {
        toast.error(`${f.name} exceeds the 5MB limit.`);
        return false;
      }
    }
    return true;
  };

  // --- URL fields ---
  const updateUrlField = (i, val) => setUrlFields((prev) => prev.map((u, idx) => (idx === i ? val : u)));
  const addUrlField = () => {
    if (atLimit) { toast.info(`A product can have at most ${MAX_IMAGES} images.`); return; }
    setUrlFields((prev) => [...prev, '']);
  };
  const removeUrlField = (i) => setUrlFields((prev) => (prev.length === 1 ? [''] : prev.filter((_, idx) => idx !== i)));

  // --- File fields ---
  const updateFileField = (i, file) => setFileFields((prev) => prev.map((f, idx) => (idx === i ? file : f)));
  const addFileField = () => {
    if (atLimit) { toast.info(`A product can have at most ${MAX_IMAGES} images.`); return; }
    setFileFields((prev) => [...prev, null]);
  };
  const removeFileField = (i) => setFileFields((prev) => (prev.length === 1 ? [null] : prev.filter((_, idx) => idx !== i)));

  const handleAddAll = async () => {
    if (!productId) { toast.info('Save the product first, then add images.'); return; }

    const urls = urlFields.map((u) => u.trim()).filter(Boolean);
    const files = fileFields.filter(Boolean);

    if (!urls.length && !files.length) {
      toast.error('Add at least one image URL or choose at least one file.');
      return;
    }
    for (const u of urls) {
      if (!URL_PATTERN.test(u)) { toast.error(`"${u}" is not a valid image URL.`); return; }
    }
    if (files.length && !validateFiles(files)) return;
    if (images.length + urls.length + files.length > MAX_IMAGES) {
      toast.error(`A product can have at most ${MAX_IMAGES} images (currently ${images.length}).`);
      return;
    }

    setSubmitting(true);
    setProgress(0);
    try {
      let merged = images;
      if (files.length) {
        const { images: uploaded } = await adminImageService.upload(productId, files, setProgress);
        merged = [...merged, ...uploaded];
      }
      if (urls.length) {
        const { images: added } = await adminImageService.addByUrl(productId, urls);
        merged = [...merged, ...added];
      }
      onChange(merged);
      setUrlFields(['']);
      setFileFields([null]);
      const count = urls.length + files.length;
      toast.success(`${count} image${count !== 1 ? 's' : ''} added.`);
    } catch (err) {
      toast.error(err.message || 'Could not add images.');
    } finally {
      setSubmitting(false);
      setProgress(0);
    }
  };

  const handleRemove = async (img) => {
    try {
      await adminImageService.remove(productId, img.id);
      onChange(images.filter((i) => i.id !== img.id));
    } catch (err) {
      toast.error(err.message || 'Could not remove image.');
    }
  };

  const handleSetPrimary = async (img) => {
    try {
      const { images: reordered } = await adminImageService.setPrimary(productId, img.id);
      onChange(reordered);
    } catch (err) {
      toast.error(err.message || 'Could not set primary image.');
    }
  };

  const handleDragStart = (index) => { dragIndex.current = index; };
  const handleDropReorder = async (index) => {
    const from = dragIndex.current;
    if (from === null || from === index) return;
    const next = [...images];
    const [moved] = next.splice(from, 1);
    next.splice(index, 0, moved);
    onChange(next);
    dragIndex.current = null;
    try {
      await adminImageService.reorder(productId, next.map((i) => i.id));
    } catch (err) {
      toast.error(err.message || 'Could not save new order.');
    }
  };

  return (
    <div className={styles.wrap}>
      <p className={styles.limitNote}>
        Add images by URL, by file upload, or both at once — up to {MAX_IMAGES} images total per product
        {images.length > 0 && ` (${remaining} remaining)`}.
      </p>

      {/* --- Image URL fields --- */}
      <div className={styles.fieldGroup}>
        <span className={styles.fieldGroupLabel}><ImageIcon size={13} /> Image URLs</span>
        {urlFields.map((val, i) => (
          <div className={styles.urlRow} key={i}>
            {val.trim() && URL_PATTERN.test(val.trim()) ? (
              <img src={val.trim()} alt="" className={styles.urlPreview} onError={(e) => { e.currentTarget.style.visibility = 'hidden'; }} />
            ) : (
              <span className={styles.urlPreviewPlaceholder}><ImageIcon size={14} /></span>
            )}
            <input
              type="url"
              placeholder={`Image URL #${i + 1}`}
              value={val}
              onChange={(e) => updateUrlField(i, e.target.value)}
            />
            <button type="button" className={styles.removeFieldBtn} onClick={() => removeUrlField(i)} aria-label="Remove URL field">
              <X size={13} />
            </button>
          </div>
        ))}
        <button type="button" className={styles.addFieldBtn} onClick={addUrlField} disabled={atLimit}>
          <Plus size={13} /> Add More URL Field
        </button>
      </div>

      {/* --- File upload fields --- */}
      <div className={styles.fieldGroup}>
        <span className={styles.fieldGroupLabel}><Upload size={13} /> File Uploads</span>
        {fileFields.map((file, i) => (
          <div className={styles.urlRow} key={i}>
            {file ? (
              <img src={URL.createObjectURL(file)} alt="" className={styles.urlPreview} />
            ) : (
              <span className={styles.urlPreviewPlaceholder}><Upload size={14} /></span>
            )}
            <label className={styles.fileInputLabel}>
              <span>{file ? file.name : `Select Image File #${i + 1}`}</span>
              <input
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                hidden
                onChange={(e) => updateFileField(i, e.target.files?.[0] || null)}
              />
            </label>
            <button type="button" className={styles.removeFieldBtn} onClick={() => removeFileField(i)} aria-label="Remove upload field">
              <X size={13} />
            </button>
          </div>
        ))}
        <button type="button" className={styles.addFieldBtn} onClick={addFileField} disabled={atLimit}>
          <Plus size={13} /> Add More Upload Field
        </button>
        <small className={styles.hint}>JPG, PNG or WEBP — up to 5MB each</small>
      </div>

      <button type="button" className="btn btn-outline" onClick={handleAddAll} disabled={submitting || !productId}>
        {submitting ? 'Adding Images…' : 'Add Images to Product'}
      </button>

      {submitting && (
        <div className={styles.progressTrack}>
          <div className={styles.progressFill} style={{ width: `${progress}%` }} />
        </div>
      )}

      {images.length > 0 && (
        <div className={styles.grid}>
          {images.map((img, index) => (
            <div
              key={img.id || img.url}
              className={styles.thumb}
              draggable
              onDragStart={() => handleDragStart(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => handleDropReorder(index)}
            >
              <img src={img.url} alt="" />
              {index === 0 && <span className={styles.primaryBadge}>Primary</span>}
              <div className={styles.thumbActions}>
                <button type="button" onClick={() => handleSetPrimary(img)} aria-label="Set as primary" title="Set as primary">
                  <Star size={13} fill={index === 0 ? 'currentColor' : 'none'} />
                </button>
                <button type="button" onClick={() => handleRemove(img)} aria-label="Remove image" title="Remove">
                  <X size={13} />
                </button>
              </div>
              <span className={styles.dragHandle}><GripVertical size={12} /></span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
