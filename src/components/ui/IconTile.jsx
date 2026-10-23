import Icon from './Icon';

/** Red-tinted square holding an icon. */
export default function IconTile({ name, className = 'h-11 w-11' }) {
  return (
    <span className={`grid shrink-0 place-items-center rounded-xl bg-primary/10 text-primary ${className}`}>
      <Icon name={name} />
    </span>
  );
}
