import { TextField } from '../ui';

const FIELDS = [
  { name: 'name', label: 'Your name *', type: 'text', autoComplete: 'name' },
  { name: 'phone', label: 'Phone *', type: 'tel', autoComplete: 'tel' },
  { name: 'city', label: 'City', type: 'text', autoComplete: 'address-level2' },
];

export default function CustomerForm({ customer, onChange }) {
  return (
    <div className="grid gap-3 sm:grid-cols-3">
      {FIELDS.map(({ name, ...field }) => (
        <TextField
          key={name}
          id={`customer-${name}`}
          value={customer[name]}
          onChange={(e) => onChange({ ...customer, [name]: e.target.value })}
          {...field}
        />
      ))}
    </div>
  );
}
