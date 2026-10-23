import { useState } from 'react';
import { Icon } from '../ui';
import StoryProgress from '../stories/StoryProgress';

const SLIDE_MS = 5500;

const arrowBtn =
  'grid h-10 w-10 place-items-center rounded-full bg-black/40 text-white opacity-0 backdrop-blur transition hover:bg-black/60 group-hover:opacity-100 focus-visible:opacity-100';

/** Cross-fading, slowly zooming slideshow of featured photos. Click a slide to open it full screen. */
export default function HeroSlider({ group, onOpen }) {
  const { slides } = group;
  const [index, setIndex] = useState(0);
  const [hovered, setHovered] = useState(false);
  const go = (dir) => setIndex((i) => (i + dir + slides.length) % slides.length);
  const slide = slides[index];

  return (
    <div
      className="group relative mx-auto aspect-[4/5] w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-surface shadow-2xl shadow-black/60"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-roledescription="carousel"
      aria-label="Featured products"
    >
      {slides.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt={s.title}
          loading={i === 0 ? 'eager' : 'lazy'}
          aria-hidden={i !== index}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ease-out ${
            i === index ? 'animate-kenburns opacity-100' : 'opacity-0'
          }`}
        />
      ))}

      {/* click anywhere on the photo to open it full screen */}
      <button onClick={() => onOpen(index)} className="absolute inset-0" aria-label={`Open ${slide.title}`} />

      <div className="pointer-events-none absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/40 to-transparent p-6 pt-24">
        <p key={slide.id} className="animate-fade-up text-xl font-bold leading-snug text-white">
          {slide.title}
        </p>
        <p key={`${slide.id}-c`} className="animate-fade-up mt-1 text-sm text-white/75 [animation-delay:120ms]">
          {slide.caption}
        </p>
        <div className="mt-4 w-32">
          <StoryProgress count={slides.length} active={index} paused={hovered} duration={SLIDE_MS} animationKey={`hero-${index}`} onDone={() => go(1)} />
        </div>
      </div>

      <div className="absolute inset-y-0 left-3 flex items-center">
        <button onClick={() => go(-1)} aria-label="Previous slide" className={arrowBtn}>
          <Icon name="chevronLeft" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-3 flex items-center">
        <button onClick={() => go(1)} aria-label="Next slide" className={arrowBtn}>
          <Icon name="chevronRight" />
        </button>
      </div>
    </div>
  );
}
