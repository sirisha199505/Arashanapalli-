// Pure checks for the customer details on the quote's send step.
const NAME_RE = /^[A-Za-z][A-Za-z .'-]*$/;
const PHONE_CHARS_RE = /^[+\d\s()-]+$/;
const MOBILE_RE = /^[6-9]\d{9}$/;

/** '+91 98851-65727', '098851 65727', '9885165727' → '9885165727'. */
export const normalizePhone = (phone) => {
  const d = phone.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return d.slice(2);
  if (d.length === 11 && d.startsWith('0')) return d.slice(1);
  return d;
};

export const formatPhone = (phone) => `+91 ${normalizePhone(phone).replace(/(\d{5})(\d{5})/, '$1 $2')}`;

/** { field: message } for every invalid field — an empty object means the details are valid. */
export const validateCustomer = ({ name, phone, city, ...rest }) => {
  const errors = {};
  const n = name.trim();
  const p = phone.trim();
  const c = city.trim();

  if (!n) errors.name = 'Please enter your name.';
  else if (n.length < 2 || !NAME_RE.test(n)) errors.name = 'Name should have at least 2 letters (letters, spaces and . only).';

  if (!p) errors.phone = 'Please enter your mobile number.';
  else if (!PHONE_CHARS_RE.test(p) || !MOBILE_RE.test(normalizePhone(p))) errors.phone = 'Enter a valid 10-digit Indian mobile number (starts with 6–9).';

  if (!c) errors.city = 'Please enter your city.';
  else if (c.length < 2 || !NAME_RE.test(c)) errors.city = 'Enter a valid city name.';

  const e = (rest.email ?? '').trim();
  if (e && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(e)) errors.email = 'Enter a valid email, or leave it empty.';
  const g = (rest.gstin ?? '').trim().toUpperCase();
  if (g && !/^\d{2}[A-Z]{5}\d{4}[A-Z][1-9A-Z]Z[0-9A-Z]$/.test(g)) errors.gstin = 'GSTIN should look like 36ABCDE1234F1Z5.';
  if (g && !(rest.company ?? '').trim()) errors.company = 'Add the company name for a GST quotation.';

  return errors;
};
