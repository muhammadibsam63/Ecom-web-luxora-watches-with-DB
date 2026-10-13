import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SlidersHorizontal, X } from '../components/icons';
import { productService, categoryService } from '../services/productService';
import ProductCard from '../components/ProductCard';
import ProductGridSkeleton from '../components/ProductGridSkeleton';
import styles from './Shop.module.css';
import usePageMeta from '../hooks/usePageMeta';

const SORT_OPTIONS = [
  { value: 'featured', label: 'Featured' },
  { value: 'newest', label: 'Newest' },
  { value: 'best_selling', label: 'Best Selling' },
  { value: 'price_low', label: 'Price: Low to High' },
  { value: 'price_high', label: 'Price: High to Low' },
  { value: 'rating', label: 'Highest Rated' },
];

export default function Shop() {
  usePageMeta({ title: 'Shop All Watches', description: 'Browse the full Luxora collection — automatic, chronograph, diver, dress and luxury watches, priced in PKR.' });
  const [searchParams, setSearchParams] = useSearchParams();
  const [products, setProducts] = useState(null);
  const [pagination, setPagination] = useState(null);
  const [categories, setCategories] = useState([]);
  const [filtersOpen, setFiltersOpen] = useState(false);

  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const sort = searchParams.get('sort') || (searchParams.get('filter') === 'new' ? 'newest' : searchParams.get('filter') === 'best' ? 'best_selling' : 'featured');
  const page = Number(searchParams.get('page')) || 1;
  const minPrice = searchParams.get('minPrice') || '';
  const maxPrice = searchParams.get('maxPrice') || '';
  const availability = searchParams.get('availability') || '';

  useEffect(() => {
    categoryService.list().then(({ categories }) => setCategories(categories)).catch(() => {});
  }, []);

  useEffect(() => {
    setProducts(null);
    productService
      .list({ search, category, sort, page, minPrice, maxPrice, availability, limit: 12 })
      .then(({ products, pagination }) => {
        setProducts(products);
        setPagination(pagination);
      })
      .catch(() => setProducts([]));
  }, [search, category, sort, page, minPrice, maxPrice, availability]);

  const updateParam = useCallback((key, value) => {
    const next = new URLSearchParams(searchParams);
    if (value) next.set(key, value); else next.delete(key);
    if (key !== 'page') next.delete('page');
    setSearchParams(next);
  }, [searchParams, setSearchParams]);

  const clearFilters = () => setSearchParams({});

  return (
    <div className={styles.page}>
      <div className={`container ${styles.headerRow}`}>
        <div>
          <h1 className={styles.title}>{search ? `Results for "${search}"` : 'Shop All Watches'}</h1>
          {pagination && <p className={styles.count}>{pagination.total} pieces</p>}
        </div>
        <div className={styles.controls}>
          <button className={styles.filterToggle} onClick={() => setFiltersOpen((v) => !v)}>
            <SlidersHorizontal size={15} strokeWidth={1.5} /> Filters
          </button>
          <select className={styles.select} value={sort} onChange={(e) => updateParam('sort', e.target.value)}>
            {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
      </div>

      <div className={`container ${styles.layout}`}>
        <aside className={`${styles.sidebar} ${filtersOpen ? styles.sidebarOpen : ''}`}>
          <div className={styles.sidebarHeader}>
            <span>Filters</span>
            <button onClick={() => setFiltersOpen(false)} className={styles.closeFilters}><X size={18} /></button>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Category</span>
            <button className={`${styles.filterOption} ${!category ? styles.filterOptionActive : ''}`} onClick={() => updateParam('category', '')}>
              All
            </button>
            {categories.map((c) => (
              <button
                key={c.id}
                className={`${styles.filterOption} ${category === c.slug ? styles.filterOptionActive : ''}`}
                onClick={() => updateParam('category', c.slug)}
              >
                {c.name} <span>({c.product_count})</span>
              </button>
            ))}
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Price Range</span>
            <div className={styles.priceRow}>
              <input type="number" placeholder="Min" value={minPrice} onChange={(e) => updateParam('minPrice', e.target.value)} className={styles.priceInput} />
              <span>—</span>
              <input type="number" placeholder="Max" value={maxPrice} onChange={(e) => updateParam('maxPrice', e.target.value)} className={styles.priceInput} />
            </div>
          </div>

          <div className={styles.filterGroup}>
            <span className={styles.filterLabel}>Availability</span>
            {[{ v: 'in_stock', l: 'In Stock' }, { v: 'out_of_stock', l: 'Out of Stock' }].map((o) => (
              <button
                key={o.v}
                className={`${styles.filterOption} ${availability === o.v ? styles.filterOptionActive : ''}`}
                onClick={() => updateParam('availability', availability === o.v ? '' : o.v)}
              >
                {o.l}
              </button>
            ))}
          </div>

          {(category || minPrice || maxPrice || availability || search) && (
            <button className={styles.clearBtn} onClick={clearFilters}>Clear All Filters</button>
          )}
        </aside>

        <div className={styles.results}>
          {products === null ? (
            <ProductGridSkeleton count={12} />
          ) : products.length === 0 ? (
            <div className={styles.empty}>
              <p>No watches match your filters.</p>
              <button className="btn btn-outline" onClick={clearFilters}>Clear Filters</button>
            </div>
          ) : (
            <>
              <div className={styles.grid}>
                {products.map((p) => <ProductCard key={p.id} product={p} />)}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className={styles.pagination}>
                  {Array.from({ length: pagination.totalPages }).map((_, i) => (
                    <button
                      key={i}
                      className={`${styles.pageBtn} ${pagination.page === i + 1 ? styles.pageBtnActive : ''}`}
                      onClick={() => updateParam('page', String(i + 1))}
                    >
                      {i + 1}
                    </button>
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
