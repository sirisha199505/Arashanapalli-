// How a product's sizes / shades are described: the choice's name, its options, and a one-line summary for cards.
import { getVariants, nameParts } from '../../utils/catalog';
import { swatchColour } from './ProductIllustration';

const uniq = (values) => [...new Set(values)].filter(Boolean);
const FINISH = /satin|brass|matt|chrome|gold|rose|pvd/i;

/** What a set of options is called: Finish (hardware), Colour (shades), Size (numbers) or Type. */
export const choiceName = (values) => {
  if (values.some((v) => FINISH.test(v)) && values.every((v) => swatchColour(v))) return 'Finish';
  if (values.every((v) => swatchColour(v))) return 'Colour';
  if (values.every((v) => /\d/.test(v))) return 'Size';
  if (values.every((v) => /small|medium|large/i.test(v))) return 'Size';
  return 'Type';
};
const PLURAL = { Finish: 'finishes', Colour: 'colours', Size: 'sizes', Type: 'types', Thickness: 'thicknesses' };

/**
 * The choices for a product: up to two, e.g. [{ field: 'size', name: 'Thickness', options: ['0.8 mm', '1 mm'] },
 * { field: 'variant', name: 'Colour', options: [...], swatches: true }]. Only choices with 2+ options are listed.
 */
export const getChoices = (product) => {
  const variants = getVariants(product);
  const sizes = uniq(variants.map((v) => nameParts(v).size));
  const values = uniq(variants.map((v) => nameParts(v).variant));
  const choices = [];
  if (sizes.length > 1) choices.push({ field: 'size', name: 'Thickness', options: sizes });
  if (values.length > 1) {
    const name = choiceName(values);
    choices.push({ field: 'variant', name, options: values, swatches: name === 'Colour' || name === 'Finish' });
  }
  return choices;
};

/** "12 colours · 2 thicknesses" — null for a product with a single option. */
export const choiceSummary = (product) => {
  const choices = getChoices(product);
  return choices.length ? [...choices].reverse().map((c) => `${c.options.length} ${PLURAL[c.name]}`).join(' · ') : null;
};
