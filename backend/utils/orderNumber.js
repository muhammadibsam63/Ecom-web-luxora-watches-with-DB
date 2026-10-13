// Generates a human-friendly, unique-enough order number, e.g. LUX-20260918-4F82
function generateOrderNumber() {
  const date = new Date();
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  const rand = Math.random().toString(16).slice(2, 6).toUpperCase();
  return `LUX-${y}${m}${d}-${rand}`;
}

module.exports = generateOrderNumber;
