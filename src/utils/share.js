// Pure functions that turn the combined quote into shareable text / links.
import { COMPANY } from '../data/catalog';
import { formatCurrency, formatDate } from './format';
import { quoteNumber } from './quote';

export const isCustomerValid = ({ name, phone }) => name.trim().length > 1 && /^\+?[\d\s-]{10,}$/.test(phone.trim());

const sectionToText = ({ category, lines, subtotal }) => [
  `*${category}*`,
  ...lines.map((l, i) => `${i + 1}. ${l.product.name} (${l.brand.name}) — ${l.quantity} ${l.product.unit} × ${formatCurrency(l.unitPrice)} = ${formatCurrency(l.amount)}`),
  `${category} subtotal: ${formatCurrency(subtotal)}`,
  '',
];

export const quoteToText = ({ sections, totals }, customer) =>
  [
    `*Quote Request – ${COMPANY.name}*`,
    `Quote #: ${quoteNumber()}  |  Date: ${formatDate()}`,
    `Customer: ${customer.name} (${customer.phone})${customer.city ? `, ${customer.city}` : ''}`,
    '',
    ...sections.filter((s) => s.lines.length).flatMap(sectionToText),
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
