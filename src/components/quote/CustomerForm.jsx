import { TextField } from '../ui';

export const CUSTOMER_FIELDS = [
  { name: 'name', label: 'Full name *', type: 'text', autoComplete: 'name', placeholder: 'e.g. Ravi Kumar' },
  { name: 'phone', label: 'Mobile number *', type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '98851 65727', hint: '10-digit Indian mobile — we reply on WhatsApp' },
  { name: 'city', label: 'City *', type: 'text', autoComplete: 'address-level2', placeholder: 'e.g. Secunderabad' },
];

// optional: email (to find quotes again later) and, for business buyers, company + GSTIN for a B2B quotation
export const EXTRA_FIELDS = [
  { name: 'email', label: 'Email (optional)', type: 'email', autoComplete: 'email', placeholder: 'you@example.com' },
  { name: 'company', label: 'Company (for business quotes)', type: 'text', autoComplete: 'organization', placeholder: 'Optional' },
  { name: 'gstin', label: 'GSTIN', type: 'text', placeholder: 'Optional · 15 characters', style: { textTransform: 'uppercase' } },
];

/** Controlled form. `errors` are only shown for fields listed in `shown` (touched, or after a send attempt). */
export default function CustomerForm({ customer, errors, shown, onChange, onBlur }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {[...CUSTOMER_FIELDS, ...EXTRA_FIELDS].map(({ name, ...field }) => (
        <TextField
          key={name}
          id={`customer-${name}`}
          name={name}
          value={customer[name] ?? ''}
          error={shown[name] ? errors[name] : undefined}
          onChange={(e) => onChange({ ...customer, [name]: e.target.value })}
          onBlur={() => onBlur(name)}
          {...field}
        />
      ))}
    </div>
  );
}
