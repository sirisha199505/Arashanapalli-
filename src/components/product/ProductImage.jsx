/** Product photo on a white plate (the photos have white backgrounds). */
export default function ProductImage({ product, className = '', padding = 'p-3' }) {
  return (
    <div className={`overflow-hidden bg-white ${className}`}>
      <img
        src={product.image}
        alt={product.name}
        loading="lazy"
        className={`h-full w-full object-contain ${padding} mix-blend-multiply transition duration-300 group-hover:scale-105`}
        onError={(e) => (e.currentTarget.style.visibility = 'hidden')}
      />
    </div>
  );
}
