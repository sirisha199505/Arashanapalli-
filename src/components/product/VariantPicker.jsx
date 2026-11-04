import { navigate } from '../../hooks/useRoute';
import { getStartingPrice, getVariants, nameParts, productPath } from '../../utils/catalog';
import { formatCurrency } from '../../utils/format';
import { swatchColour } from './ProductIllustration';
import { getChoices } from './variants';

/**
 * Amazon-style choosers on the product page: "Colour: Navy Blue" with swatches, "Thickness: 1 mm" with buttons.
 * Every size / shade is its own product (own code, price and page), so picking one opens that product in place,
 * keeping the chosen brand and the scroll position.
 */
export default function VariantPicker({ product, brandId }) {
  const choices = getChoices(product);
  if (!choices.length) return null;
  const variants = getVariants(product);
  const current = nameParts(product);
  const find = (want) => variants.find((v) => {
    const p = nameParts(v);
    return p.size === want.size && p.variant === want.variant;
  });
  // the product for an option: same other choice if that exists, else the first with this option
  const productFor = (field, value) => find({ ...current, [field]: value }) ?? variants.find((v) => nameParts(v)[field] === value);
  const open = (target) => {
    if (target && target !== product) navigate(productPath(target) + (brandId ? `?brand=${brandId}` : ''), { replace: true, scroll: false });
  };

  return (
    <div className="mt-4 space-y-4">
      {choices.map((choice) => (
        <div key={choice.field}>
          <p className="mb-2 text-sm">
            <span className="text-muted">{choice.name}:</span> <span className="font-semibold">{current[choice.field]}</span>
          </p>
          <div role="radiogroup" aria-label={choice.name} className="flex flex-wrap gap-2">
            {choice.options.map((option) => {
              const target = productFor(choice.field, option);
              const selected = current[choice.field] === option;
              // this option exists, but not together with the other choice made (e.g. a shade only sold in 1 mm)
              const exact = Boolean(find({ ...current, [choice.field]: option }));
              if (choice.swatches) {
                return (
                  <button
                    key={option}
                    type="button"
                    role="radio"
                    aria-checked={selected}
                    aria-label={option}
                    title={`${option} — from ${formatCurrency(getStartingPrice(target))}`}
                    onClick={() => open(target)}
                    className={`grid h-11 w-11 place-items-center rounded-full transition ${selected ? 'ring-2 ring-primary ring-offset-2' : 'ring-1 ring-line hover:ring-primary'} ${exact ? '' : 'opacity-50'}`}
                  >
                    <span className="h-8 w-8 rounded-full ring-1 ring-black/15" style={{ background: swatchColour(option) }} />
                  </button>
                );
              }
              return (
                <button
                  key={option}
                  type="button"
                  role="radio"
                  aria-checked={selected}
                  onClick={() => open(target)}
                  className={`min-w-20 rounded-lg border px-3 py-1.5 text-left text-sm transition ${
                    selected ? 'border-primary bg-primary/5 ring-1 ring-primary' : 'border-line hover:border-primary'
                  } ${exact ? '' : 'border-dashed text-muted'}`}
                >
                  <span className="block font-semibold">{option}</span>
                  <span className="block text-xs text-muted">{formatCurrency(getStartingPrice(target))}</span>
                </button>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
