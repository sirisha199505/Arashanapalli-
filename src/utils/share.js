// Pure functions that turn the combined quote into shareable text / links.
import { COMPANY } from '../data/catalog';
import { formatCurrency, formatDate } from './format';
import { quoteNumber } from './quote';
import { dynamicCode } from './catalog';
import { formatPhone } from './validation';

const qtyText = ({ quantity, product }) => `${quantity} ${product.unit}${quantity === 1 ? '' : 's'}`;

const sectionToText = ({ category, lines, subtotal }) => {
  const priced = lines.filter((l) => l.available);
  if (!priced.length) return [];
  return [
    `*${category}*`,
    ...priced.map((l, i) => `${i + 1}. ${l.product.name} (${l.brand.name}) [${dynamicCode(l.product, l.brand)}] — ${qtyText(l)} × ${formatCurrency(l.unitPrice)} = ${formatCurrency(l.amount)}`),
    `${category} subtotal: ${formatCurrency(subtotal)}`,
    '',
  ];
};

// items the chosen brand doesn't make still go in the message, so the shop can suggest an alternative
const unavailableToText = (lines) =>
  lines.length
    ? ['*Not available in the chosen brand — please suggest:*', ...lines.map((l) => `• ${l.product.name} (asked: ${l.brand.name}) — ${qtyText(l)}`), '']
    : [];

/** Where a customer can see a quotation again by its ID. */
export const trackUrl = (quotationId) => `${window.location.origin}/track/${quotationId}`;

/** `quotationId` is the saved quotation's ID (AT-2611-7K3P9); without it (offline) a dated reference is used. */
export const quoteToText = ({ brands, sections, unavailable, totals }, customer, quotationId) =>
  [
    `*Quote Request – ${COMPANY.name}*`,
    `Quotation ID: ${quotationId ?? quoteNumber()}  |  Date: ${formatDate()}`,
    `Customer: ${customer.name.trim()} (${formatPhone(customer.phone)}), ${customer.city.trim()}`,
    customer.company?.trim() && `Company: ${customer.company.trim()}${customer.gstin?.trim() ? `  |  GSTIN: ${customer.gstin.trim().toUpperCase()}` : ''}`,
    `${brands.length === 1 ? 'Brand' : 'Brands'}: ${brands.map((b) => b.name).join(', ')}`,
    '',
    ...sections.flatMap(sectionToText),
    ...unavailableToText(unavailable),
    `Subtotal: ${formatCurrency(totals.subtotal)}`,
    `GST: ${formatCurrency(totals.gst)}`,
    `Total: ${formatCurrency(totals.total)}`,
    quotationId && '',
    quotationId && `Track this quotation: ${trackUrl(quotationId)}`,
  ]
    .filter((line) => line !== false && line !== undefined && line !== null)
    .join('\n');

const digits = (phone) => phone.replace(/\D/g, '');

export const whatsAppUrl = (text) => `https://wa.me/${digits(COMPANY.phone)}?text=${encodeURIComponent(text)}`;

export const phoneUrl = () => `tel:${digits(COMPANY.phone)}`;

export const buildWhatsAppLink = (quote, customer, quotationId) => whatsAppUrl(quoteToText(quote, customer, quotationId));

export const buildMailtoLink = (quote, customer, quotationId) =>
  `mailto:${COMPANY.email}?subject=${encodeURIComponent(`Quote Request ${quotationId ?? ''} – ${customer.name}`)}&body=${encodeURIComponent(quoteToText(quote, customer, quotationId).replaceAll('*', ''))}`;

/**
 * Share a PDF on WhatsApp. On phones that can share files, the PDF itself goes (pick WhatsApp in the share sheet);
 * otherwise WhatsApp opens with the message and a link to the PDF — to `phone` if given, else to a contact the user picks.
 */
export async function sharePdf({ url, filename, text, phone }) {
  try {
    if (navigator.canShare) {
      const blob = await (await fetch(url)).blob();
      const file = new File([blob], filename, { type: 'application/pdf' });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({ files: [file], text });
        return 'shared';
      }
    }
  } catch (err) {
    if (err?.name === 'AbortError') return 'cancelled'; // closed the share sheet
  }
  const to = phone ? `91${digits(phone).slice(-10)}` : '';
  window.open(`https://wa.me/${to}?text=${encodeURIComponent(`${text}\n${url}`)}`, '_blank', 'noopener');
  return 'link';
}
