// Pure functions that turn the combined quote into shareable text / links.
import { COMPANY } from '../data/catalog';
import { formatCurrency, formatDate } from './format';
import { quoteNumber } from './quote';
import { formatPhone } from './validation';

const qtyText = ({ quantity, product }) => `${quantity} ${product.unit}${quantity === 1 ? '' : 's'}`;

const sectionToText = ({ category, lines, subtotal }) => {
  const priced = lines.filter((l) => l.available);
  if (!priced.length) return [];
  return [
    `*${category}*`,
    ...priced.map((l, i) => `${i + 1}. ${l.product.name} (${l.brand.name}) — ${qtyText(l)} × ${formatCurrency(l.unitPrice)} = ${formatCurrency(l.amount)}`),
    `${category} subtotal: ${formatCurrency(subtotal)}`,
    '',
  ];
};

// items the chosen brand doesn't make still go in the message, so the shop can suggest an alternative
const unavailableToText = (lines) =>
  lines.length
    ? ['*Not available in the chosen brand — please suggest:*', ...lines.map((l) => `• ${l.product.name} (asked: ${l.brand.name}) — ${qtyText(l)}`), '']
    : [];

export const quoteToText = ({ brands, sections, unavailable, totals }, customer) =>
  [
    `*Quote Request – ${COMPANY.name}*`,
    `Quote #: ${quoteNumber()}  |  Date: ${formatDate()}`,
    `Customer: ${customer.name.trim()} (${formatPhone(customer.phone)}), ${customer.city.trim()}`,
    `${brands.length === 1 ? 'Brand' : 'Brands'}: ${brands.map((b) => b.name).join(', ')}`,
    '',
    ...sections.flatMap(sectionToText),
    ...unavailableToText(unavailable),
    `Subtotal: ${formatCurrency(totals.subtotal)}`,
    `GST: ${formatCurrency(totals.gst)}`,
    `Total: ${formatCurrency(totals.total)}`,
  ].join('\n');

const digits = (phone) => phone.replace(/\D/g, '');

export const whatsAppUrl = (text) => `https://wa.me/${digits(COMPANY.phone)}?text=${encodeURIComponent(text)}`;

export const phoneUrl = () => `tel:${digits(COMPANY.phone)}`;

export const buildWhatsAppLink = (quote, customer) => whatsAppUrl(quoteToText(quote, customer));

export const buildMailtoLink = (quote, customer) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(`Quote Request – ${customer.name}`)}&body=${encodeURIComponent(quoteToText(quote, customer).replaceAll('*', ''))}`;
