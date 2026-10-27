import { TextField } from '../ui';

export const CUSTOMER_FIELDS = [
  { name: 'name', label: 'Full name *', type: 'text', autoComplete: 'name', placeholder: 'e.g. Ravi Kumar' },
  { name: 'phone', label: 'Mobile number *', type: 'tel', inputMode: 'tel', autoComplete: 'tel', placeholder: '98851 65727', hint: '10-digit Indian mobile — we reply on WhatsApp' },
  { name: 'city', label: 'City *', type: 'text', autoComplete: 'address-level2', placeholder: 'e.g. Secunderabad' },
];

/** Controlled form. `errors` are only shown for fields listed in `shown` (touched, or after a send attempt). */
export default function CustomerForm({ customer, errors, shown, onChange, onBlur }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {CUSTOMER_FIELDS.map(({ name, ...field }) => (
        <TextField
          key={name}
          id={`customer-${name}`}
          name={name}
          value={customer[name]}
          error={shown[name] ? errors[name] : undefined}
          onChange={(e) => onChange({ ...customer, [name]: e.target.value })}
          onBlur={() => onBlur(name)}
          {...field}
        />
      ))}
    </div>
  );
}
