// Seeds categories and 30+ realistic LUXORA products with real, stable watch photography.
// Run with: npm run seed
require('../config/loadEnv');
const slugify = require('slugify');
const { pool, withTransaction } = require('../config/db');

// A rotating pool of real, high-resolution Unsplash watch photographs.
// Each entry is a stable Unsplash photo ID rendered at 1200px width.
const IMG_POOL = [
  '1523170335258-f5ed11844a49',
  '1524805444758-089113d48a6d',
  '1533139502658-0198f920d8e8',
  '1548171915-e79a380a2a4b',
  '1587836374828-4dbafa94cf0e',
  '1587925358603-c2eea5305bbc',
  '1622434641406-a158123450f9',
  '1509048191080-d2984bad6ae5',
  '1434493789847-2f02dc6ca35d',
  '1524592094714-0f0654e20314',
  '1611591437281-460bfbe1220a',
  '1546868871-7041f2a55e12',
];

function img(id, w = 1200) {
  return `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`;
}

function pickImages(offset, count = 3) {
  const out = [];
  for (let i = 0; i < count; i++) {
    out.push(img(IMG_POOL[(offset + i) % IMG_POOL.length]));
  }
  return out;
}

const CATEGORIES = [
  { name: 'Automatic', description: 'Self-winding mechanical movements, no battery required.' },
  { name: 'Chronograph', description: 'Precision stopwatch complications for the discerning wearer.' },
  { name: 'Dress Watches', description: 'Slim, refined timepieces for formal occasions.' },
  { name: 'Diver', description: 'Water-resistant sport watches built for depth.' },
  { name: 'Sport', description: 'Durable, versatile watches for an active life.' },
  { name: 'Classic', description: 'Timeless designs that never go out of style.' },
  { name: 'Luxury', description: 'The pinnacle of Luxora craftsmanship and materials.' },
];

const MOVEMENTS = ['Automatic', 'Manual Wind', 'Quartz', 'Automatic Chronometer'];
const CASE_MATERIALS = ['316L Stainless Steel', '18K Rose Gold', 'Titanium', 'Ceramic', 'Two-Tone Steel & Gold'];
const STRAPS = ['Italian Leather', 'Stainless Steel Bracelet', 'Rubber Sport Strap', 'Milanese Mesh', 'Alligator Leather'];
const DIALS = ['Midnight Black', 'Champagne', 'Ivory White', 'Ocean Blue', 'Slate Grey', 'Forest Green'];
const CRYSTALS = ['Sapphire Crystal', 'Domed Sapphire Crystal', 'Anti-Reflective Sapphire'];

const PRODUCTS = [
  { name: 'Luxora Heritage Automatic', category: 'Automatic', price: 220500, desc: 'A tribute to classic horology, the Heritage Automatic pairs a hand-finished movement with timeless proportions.' },
  { name: 'Luxora Imperial Chronograph', category: 'Chronograph', price: 350100, desc: 'Precision-engineered chronograph with a tachymeter bezel, built for those who measure every second.' },
  { name: 'Luxora Midnight Automatic', category: 'Automatic', price: 242100, desc: 'A midnight-black dial framed in brushed steel — understated power for the modern professional.' },
  { name: 'Luxora Ocean Diver', category: 'Diver', price: 283500, desc: 'Rated to 300m, the Ocean Diver is engineered for the deep without sacrificing refinement.' },
  { name: 'Luxora Executive Gold', category: 'Luxury', price: 801000, desc: '18K rose gold case and a sunburst dial make the Executive Gold a statement of quiet success.' },
  { name: 'Luxora Classic Steel', category: 'Classic', price: 175500, desc: 'The essential Luxora silhouette — polished steel, clean dial, effortless versatility.' },
  { name: 'Luxora Royal Chronograph', category: 'Chronograph', price: 382500, desc: 'Three-register chronograph with a hand-guilloché dial fit for royalty.' },
  { name: 'Luxora Moonphase', category: 'Luxury', price: 504000, desc: 'A poetic complication tracking the lunar cycle beneath a deep blue aventurine dial.' },
  { name: 'Luxora Minimal', category: 'Dress Watches', price: 130500, desc: 'Pared back to its essentials — a single hand-set, a clean dial, and nothing more.' },
  { name: 'Luxora Grand Date', category: 'Classic', price: 260100, desc: 'An oversized date complication rendered in Luxora\'s signature restrained style.' },
  { name: 'Luxora Signature Automatic', category: 'Automatic', price: 269100, desc: 'Our flagship automatic — in-house movement, 70-hour power reserve, uncompromising finish.' },
  { name: 'Luxora Eclipse', category: 'Luxury', price: 607500, desc: 'A striking two-tone case paired with a black ceramic bezel for dramatic contrast.' },
  { name: 'Luxora Heritage Gold', category: 'Luxury', price: 846000, desc: 'The Heritage silhouette reimagined in solid gold for the ultimate collector.' },
  { name: 'Luxora Marine Pro', category: 'Diver', price: 256500, desc: 'A professional dive watch with a unidirectional bezel and full luminous dial.' },
  { name: 'Luxora Classic Black', category: 'Classic', price: 170100, desc: 'A monochrome black-on-black rendition of our most enduring design.' },
  { name: 'Luxora Aviator Chronograph', category: 'Chronograph', price: 310500, desc: 'Inspired by cockpit instrumentation, with oversized legible indices.' },
  { name: 'Luxora Cellini Dress', category: 'Dress Watches', price: 202500, desc: 'An elegant dress watch with a fluted bezel and hand-stitched alligator strap.' },
  { name: 'Luxora Urban Sport', category: 'Sport', price: 157500, desc: 'A rugged everyday companion built to move from the boardroom to the trailhead.' },
  { name: 'Luxora Regatta', category: 'Sport', price: 189000, desc: 'A countdown-bezel sport watch built for competitive sailing.' },
  { name: 'Luxora Perpetual Steel', category: 'Automatic', price: 292500, desc: 'A perpetual rotor automatic housed in a brushed and polished steel case.' },
  { name: 'Luxora Deep Blue', category: 'Diver', price: 301500, desc: 'A gradient blue dial diver rated to 300m with a ceramic unidirectional bezel.' },
  { name: 'Luxora Onyx', category: 'Luxury', price: 648000, desc: 'A polished black onyx dial set within a titanium and ceramic case.' },
  { name: 'Luxora Explorer', category: 'Sport', price: 220500, desc: 'A no-nonsense field watch built for extremes of temperature and terrain.' },
  { name: 'Luxora Meridian', category: 'Dress Watches', price: 179100, desc: 'A GMT-inspired dress watch for the frequent, refined traveler.' },
  { name: 'Luxora Vintage 1962', category: 'Classic', price: 211500, desc: 'A faithful reissue of an archival Luxora design from 1962, updated for today.' },
  { name: 'Luxora Carbon Sport', category: 'Sport', price: 238500, desc: 'A forged-carbon case shaves weight without compromising strength.' },
  { name: 'Luxora Rose Elegance', category: 'Dress Watches', price: 247500, desc: 'A rose gold-toned dress watch with a mother-of-pearl dial.' },
  { name: 'Luxora Abyss Diver', category: 'Diver', price: 324000, desc: 'Professional-grade water resistance to 500m with a helium escape valve.' },
  { name: 'Luxora Tourbillon Elite', category: 'Luxury', price: 1665000, desc: 'A hand-assembled flying tourbillon visible through an open dial aperture.' },
  { name: 'Luxora Weekend Chrono', category: 'Chronograph', price: 193500, desc: 'An accessible chronograph built for everyday versatility.' },
  { name: 'Luxora Ivory Classic', category: 'Classic', price: 152100, desc: 'An ivory-dialed classic with Roman numeral indices and a leather strap.' },
  { name: 'Luxora Nightfall', category: 'Automatic', price: 233100, desc: 'A darkened PVD case pairs with a deep charcoal sunburst dial.' },
];

async function seed() {
  await withTransaction(async (client) => {
    console.log('Seeding categories...');
    const categoryIds = {};
    for (const cat of CATEGORIES) {
      const slug = slugify(cat.name, { lower: true, strict: true });
      const { rows } = await client.query(
        `INSERT INTO categories (name, slug, description, image_url)
         VALUES ($1,$2,$3,$4)
         ON CONFLICT (slug) DO UPDATE SET description = EXCLUDED.description
         RETURNING id, name`,
        [cat.name, slug, cat.description, img(IMG_POOL[0])]
      );
      categoryIds[rows[0].name] = rows[0].id;
    }

    console.log(`Seeding ${PRODUCTS.length} products...`);
    let offset = 0;
    for (const [idx, p] of PRODUCTS.entries()) {
      const slug = slugify(p.name, { lower: true, strict: true });
      const sku = `LUX-${1000 + idx}`;
      const movement = MOVEMENTS[idx % MOVEMENTS.length];
      const caseMaterial = CASE_MATERIALS[idx % CASE_MATERIALS.length];
      const strap = STRAPS[idx % STRAPS.length];
      const dial = DIALS[idx % DIALS.length];
      const crystal = CRYSTALS[idx % CRYSTALS.length];
      const rating = (3.8 + ((idx * 7) % 12) / 10).toFixed(1);
      const ratingCount = 8 + ((idx * 13) % 140);

      const { rows } = await client.query(
        `INSERT INTO products
          (name, slug, brand, description, short_description, price, compare_price, category_id, stock, sku,
           movement, case_material, case_diameter, case_thickness, water_resistance, strap_material, dial_color,
           crystal, power_reserve, warranty, rating_average, rating_count,
           is_featured, is_new_arrival, is_best_seller, is_active)
         VALUES ($1,$2,'Luxora',$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$21,$22,$23,$24,TRUE)
         ON CONFLICT (slug) DO NOTHING
         RETURNING id`,
        [
          p.name, slug, p.desc, p.desc.slice(0, 120), p.price,
          idx % 4 === 0 ? Math.round(p.price * 1.15) : null,
          categoryIds[p.category], 15 + ((idx * 5) % 40), sku,
          movement, caseMaterial, ['38mm', '40mm', '42mm', '44mm'][idx % 4], '11mm',
          ['30m', '50m', '100m', '300m', '500m'][idx % 5], strap, dial, crystal,
          movement === 'Quartz' ? null : `${40 + (idx % 4) * 10} hours`, '2-Year International Warranty',
          rating, ratingCount,
          idx % 6 === 0,        // is_featured
          idx % 5 === 0,        // is_new_arrival
          idx % 4 === 0,        // is_best_seller
        ]
      );
      if (!rows[0]) continue; // already seeded
      const productId = rows[0].id;

      const images = pickImages(offset, 3);
      offset += 3;
      const types = ['front', 'angled', 'lifestyle'];
      for (let i = 0; i < images.length; i++) {
        await client.query(
          `INSERT INTO product_images (product_id, url, alt_text, image_type, sort_order)
           VALUES ($1,$2,$3,$4,$5)`,
          [productId, images[i], `${p.name} — ${types[i]} view`, types[i], i]
        );
      }
    }
  });

  console.log('✔ Seed complete.');
  await pool.end();
}

seed().catch((err) => {
  console.error('✘ Seed failed:', err.message);
  process.exit(1);
});
