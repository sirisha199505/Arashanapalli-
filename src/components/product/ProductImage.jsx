import { useState } from 'react';
import Icon from '../ui/Icon';
import { getCategoryIcon } from '../../utils/catalog';

/** Product photo on a white plate (the photos have white backgrounds); the category icon when there's no photo or it fails to load. */
export default function ProductImage({ product, className = '', padding = 'p-3' }) {
  const [failed, setFailed] = useState(false);
  if (!product.image || failed) {
    return (
      <div className={`grid place-items-center bg-surface-2 text-ink/40 ${className}`} role="img" aria-label={product.name}>
        <Icon name={getCategoryIcon(product.category)} className="h-1/2 max-h-12 w-1/2 max-w-12 [stroke-width:1.5]" />
      </div>
    );
  }
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={`h-full w-full object-contain ${padding} mix-blend-multiply transition duration-300 group-hover:scale-105`}
        onError={() => setFailed(true)}
      />
    </div>
  );
}
