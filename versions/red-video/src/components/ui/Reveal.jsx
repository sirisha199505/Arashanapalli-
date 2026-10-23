import useInView from '../../hooks/useInView';

/** Fades its children up when they scroll into view. */
export default function Reveal({ children, className = '' }) {
  const [ref, inView] = useInView();
  return (
    <div ref={ref} className={`reveal ${inView ? 'is-visible' : ''} ${className}`}>
      {children}
    </div>
  );
}
