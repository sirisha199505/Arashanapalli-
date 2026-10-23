import { COMPANY } from '../../data/catalog';

/** Brand logo (from Instagram). Also used as the favicon — see index.html. */
export default function Logo({ className = 'h-10 w-10' }) {
  return <img src="/logo.jpg" alt={`${COMPANY.name} logo`} className={`shrink-0 rounded-xl object-cover ${className}`} />;
}
