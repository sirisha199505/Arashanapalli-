// Pure functions behind "compare quotations": each quotation ({ id, name, brandId, items }) is priced like the quote page,
// scored on price, benefits (warranty / guarantee), quality, savings and support, and given pros and cons relative to the others.
import { BRANDS, BRAND_TIERS } from '../data/catalog';
import { getBrandsForProduct, getProduct, getUnitPrice, shortBrandName } from './catalog';
import { formatCurrency } from './format';
import { buildQuote } from './quote';

export const MAX_COMPARE_QUOTES = 4;

// higher = better; brands of an unknown class count as Standard
const TIER_RANK = { Premium: 3, Standard: 2, Economy: 1 };
const tierRank = (brand) => TIER_RANK[brand.tier] ?? 2;

/**
 * Warranty in years from the brand's text: '5 years' → 5, 'Up to 30 years' → 30, '2–5 years' → 2 (what's guaranteed),
 * '18 months' → 1.5, 'Lifetime …' → 25. Shelf life isn't a warranty → null.
 */
export const warrantyYears = (text = '') => {
  const t = String(text).toLowerCase();
  if (!t || t.includes('shelf life')) return null;
  if (t.includes('lifetime')) return 25;
  const numbers = (t.match(/\d+(\.\d+)?/g) ?? []).map(Number);
  if (!numbers.length) return null;
  const n = t.includes('up to') ? Math.max(...numbers) : numbers[0];
  return t.includes('month') ? n / 12 : n;
};

const sum = (list, fn) => list.reduce((s, x) => s + fn(x), 0);
const unique = (list) => [...new Set(list.filter(Boolean))];
const years = (n) => (n >= 25 ? 'lifetime' : `${Math.round(n * 10) / 10} yr${n === 1 ? '' : 's'}`);

/** Price, warranty, quality and support figures for one quotation. */
export const evaluateQuotation = (quotation) => {
  const quote = buildQuote(quotation);
  const priced = quote.lines.filter((l) => l.available);
  const amount = sum(priced, (l) => l.amount) || 1;
  const warranties = priced.map((l) => ({ line: l, years: warrantyYears(l.brand.specs?.warranty) })).filter((w) => w.years !== null);
  const warrantyWeight = sum(warranties, (w) => w.line.amount) || 1;
  const brands = quote.brands.filter((b) => priced.some((l) => l.brand.id === b.id));

  return {
    quotation,
    quote,
    total: quote.totals.total,
    itemCount: quote.lines.length,
    missing: quote.lines.length - priced.length,
    // quality: the class of each item's brand, weighted by how much of the quote it is (1 = all Economy … 3 = all Premium)
    quality: sum(priced, (l) => tierRank(l.brand) * l.amount) / amount,
    tierShare: Object.fromEntries(BRAND_TIERS.map((t) => [t, sum(priced.filter((l) => l.brand.tier === t), (l) => l.amount) / amount])),
    warranty: warranties.length
      ? {
          min: Math.min(...warranties.map((w) => w.years)),
          max: Math.max(...warranties.map((w) => w.years)),
          avg: sum(warranties, (w) => w.years * w.line.amount) / warrantyWeight,
        }
      : null,
    guarantees: unique(brands.map((b) => b.specs?.guarantee)),
    supports: unique(brands.map((b) => b.specs?.support)),
    brands,
  };
};

const qualityLabel = (q) => (q >= 2.6 ? 'Mostly premium brands' : q >= 1.8 ? 'Mostly standard brands' : 'Mostly budget brands');

/**
 * Every quotation evaluated, with `criteria` (price, benefits, quality, savings, support — each { value, tone: 'pro' | 'con' | null, note })
 * and `badges`, relative to the others. Totals are only compared between quotations that price every item.
 */
export const compareQuotations = (quotations) => {
  const results = quotations.map(evaluateQuotation);
  const complete = results.filter((r) => r.missing === 0 && r.itemCount > 0);
  const several = complete.length > 1;
  const best = (list, fn) => (list.length ? Math.max(...list.map(fn)) : null);
  const worst = (list, fn) => (list.length ? Math.min(...list.map(fn)) : null);

  const minTotal = worst(complete, (r) => r.total);
  const maxTotal = best(complete, (r) => r.total);
  const withWarranty = complete.filter((r) => r.warranty);
  const bestWarranty = best(withWarranty, (r) => r.warranty.avg);
  const worstWarranty = worst(withWarranty, (r) => r.warranty.avg);
  const bestQuality = best(complete, (r) => r.quality);
  const worstQuality = worst(complete, (r) => r.quality);

  // overall balance (for "Recommended"): cheaper, better quality, longer warranty, fewer brands to deal with
  const spread = (v, lo, hi) => (hi > lo ? (v - lo) / (hi - lo) : 1);
  const balance = (r) =>
    // price counts in proportion (₹3 dearer ≈ as good); the others relative to the best and worst on offer
    0.4 * (r.total > 0 ? minTotal / r.total : 0) +
    0.25 * spread(r.quality, worstQuality, bestQuality) +
    0.2 * (r.warranty ? spread(r.warranty.avg, worstWarranty ?? 0, bestWarranty ?? 0) : 0) +
    0.15 * (r.brands.length <= 1 ? 1 : r.brands.length === 2 ? 0.6 : 0.3);
  const recommended = several ? complete.reduce((a, b) => (balance(b) > balance(a) ? b : a)) : null;

  return results.map((r) => {
    const comparable = complete.includes(r);
    const savings = comparable ? maxTotal - r.total : 0;
    const extra = comparable ? r.total - minTotal : 0;
    const is = (v, target) => several && comparable && v === target;

    const price = {
      value: formatCurrency(r.total),
      note: !comparable
        ? `${r.missing} of ${r.itemCount} item${r.itemCount === 1 ? '' : 's'} not priced — total not comparable`
        : is(r.total, minTotal)
          ? 'Lowest price'
          : several
            ? `${formatCurrency(extra)} more than the cheapest`
            : 'Incl. 18% GST',
      tone: !comparable ? 'con' : is(r.total, minTotal) ? 'pro' : is(r.total, maxTotal) ? 'con' : null,
    };
    const benefits = {
      value: r.warranty ? (r.warranty.min === r.warranty.max ? years(r.warranty.min) : `${years(r.warranty.min)} – ${years(r.warranty.max)}`) : 'Not stated',
      note: [
        r.warranty && `avg ${years(r.warranty.avg)} warranty`,
        r.guarantees.length && `Guarantee: ${r.guarantees.join('; ')}`,
      ]
        .filter(Boolean)
        .join(' · '),
      tone: !r.warranty ? 'con' : is(r.warranty.avg, bestWarranty) ? 'pro' : is(r.warranty.avg, worstWarranty) || r.warranty.min <= 1 ? 'con' : null,
    };
    const nothingPriced = !r.brands.length; // no brand chosen for any item yet
    const quality = {
      value: nothingPriced ? '—' : qualityLabel(r.quality),
      note: BRAND_TIERS.filter((t) => r.tierShare[t] > 0)
        .map((t) => `${Math.round(r.tierShare[t] * 100)}% ${t}`)
        .join(' · '),
      tone: nothingPriced ? null : is(r.quality, bestQuality) ? 'pro' : is(r.quality, worstQuality) ? 'con' : null,
    };
    const savingsCriterion = {
      value: comparable && several ? formatCurrency(savings) : '—',
      note: !comparable || !several ? 'Compare with another complete quotation' : savings > 0 ? `${Math.round((savings / maxTotal) * 100)}% less than the costliest option` : 'The costliest option',
      tone: comparable && several ? (savings > 0 ? 'pro' : 'con') : null,
    };
    const support = nothingPriced
      ? { value: '—', note: 'Choose brands to see support', tone: null }
      : {
          value: `${r.brands.length} brand${r.brands.length === 1 ? '' : 's'}`,
          note: [r.brands.length === 1 ? 'One point of contact for service' : r.brands.length >= 3 ? 'Several service contacts' : 'Two service contacts', ...r.supports].join(' · '),
          tone: r.brands.length === 1 ? 'pro' : r.brands.length >= 3 ? 'con' : null,
        };

    return {
      ...r,
      comparable,
      savings,
      criteria: [
        { key: 'price', label: 'Price', ...price },
        { key: 'benefits', label: 'Benefits (warranty, guarantee)', ...benefits },
        { key: 'quality', label: 'Quality', ...quality },
        { key: 'savings', label: 'Savings', ...savingsCriterion },
        { key: 'support', label: 'Support', ...support },
      ],
      badges: [
        r === recommended && 'Recommended',
        is(r.total, minTotal) && 'Best price',
        r.warranty && is(r.warranty.avg, bestWarranty) && 'Longest warranty',
        is(r.quality, bestQuality) && 'Best quality',
      ].filter(Boolean),
    };
  });
};

/**
 * Ready-made alternatives for the current items (same quantities), so a customer can compare without building each one:
 * cheapest single brand, cheapest per item, longest-warranty brand, premium brands. Duplicates of each other are dropped.
 */
export const suggestQuotations = (items) => {
  if (!items.length) return [];
  const products = items.map((i) => getProduct(i.productId)).filter(Boolean);
  const covering = BRANDS.map((brand) => ({ brand, count: products.filter((p) => p.brandIds.includes(brand.id)).length })).filter((c) => c.count);
  const most = Math.max(0, ...covering.map((c) => c.count));
  const full = covering.filter((c) => c.count === most).map((c) => c.brand);
  const totalIn = (brand) => sum(items, (i) => (getProduct(i.productId)?.brandIds.includes(brand.id) ? getUnitPrice(getProduct(i.productId), brand) * i.quantity : 0));
  const perItem = (pick) => items.map((i) => ({ ...i, brandId: pick(getBrandsForProduct(getProduct(i.productId)), getProduct(i.productId))?.id }));
  const cheapestOf = (brands, p) => brands.reduce((a, b) => (getUnitPrice(p, b) < getUnitPrice(p, a) ? b : a));

  const cheapestBrand = full.reduce((a, b) => (totalIn(b) < totalIn(a) ? b : a), full[0]);
  const longest = full.reduce((a, b) => ((warrantyYears(b.specs?.warranty) ?? 0) > (warrantyYears(a.specs?.warranty) ?? 0) ? b : a), full[0]);
  const scope = most < products.length ? ` (${most} of ${products.length} items)` : '';

  const list = [
    cheapestBrand && { id: 'suggest-cheapest-brand', name: `All in ${shortBrandName(cheapestBrand)} — cheapest single brand${scope}`, brandId: cheapestBrand.id, items },
    { id: 'suggest-cheapest-each', name: 'Cheapest brand for each item', brandId: null, items: perItem((brands, p) => cheapestOf(brands, p)) },
    longest && { id: 'suggest-warranty', name: `All in ${shortBrandName(longest)} — longest warranty${scope}`, brandId: longest.id, items },
    {
      id: 'suggest-premium',
      name: 'Premium brand for each item',
      brandId: null,
      items: perItem((brands, p) => {
        const top = Math.max(...brands.map(tierRank));
        return cheapestOf(brands.filter((b) => tierRank(b) === top), p);
      }),
    },
  ].filter(Boolean);

  // the same brand choices under two names → keep the first
  const key = (q) => q.items.map((i) => `${i.productId}:${i.brandId ?? q.brandId}`).join('|');
  return list.filter((q, i) => list.findIndex((o) => key(o) === key(q)) === i);
};
