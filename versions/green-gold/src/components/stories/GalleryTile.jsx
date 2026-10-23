import { useRef } from 'react';
import { Icon } from '../ui';

/** One Instagram tile. Reels show a play badge and preview silently on hover. */
export default function GalleryTile({ post, onClick }) {
  const videoRef = useRef(null);
  const preview = (play) => {
    const v = videoRef.current;
    if (!v) return;
    if (play) v.play().catch(() => {});
    else {
      v.pause();
      v.currentTime = 0;
    }
  };

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => preview(true)}
      onMouseLeave={() => preview(false)}
      className="group relative block aspect-[4/5] w-full overflow-hidden rounded-lg bg-surface-2 sm:rounded-xl"
      aria-label={post.video ? `Play reel: ${post.title}` : post.title}
    >
      <img src={post.image} alt={post.title} loading="lazy" className="h-full w-full object-cover transition duration-300 group-hover:scale-105" />
      {post.video && (
        <>
          <video ref={videoRef} src={post.video} muted loop playsInline preload="none" className="absolute inset-0 h-full w-full object-cover opacity-0 transition group-hover:opacity-100" />
          <span className="absolute inset-0 grid place-items-center transition group-hover:opacity-0">
            <span className="grid h-11 w-11 place-items-center rounded-full bg-black/55 text-white backdrop-blur">
              <Icon name="play" className="ml-0.5 h-5 w-5" />
            </span>
          </span>
        </>
      )}
      {post.type === 'carousel' && (
        <span className="absolute right-2 top-2 text-white drop-shadow">
          <Icon name="layers" className="h-4 w-4" />
        </span>
      )}
      <span className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent p-2 text-left text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100">
        {post.title}
      </span>
    </button>
  );
}
