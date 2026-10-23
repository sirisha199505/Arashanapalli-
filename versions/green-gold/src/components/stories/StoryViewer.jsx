import { useCallback, useEffect, useRef, useState } from 'react';
import { COMPANY } from '../../data/catalog';
import { INSTAGRAM_HANDLE } from '../../data/instagram';
import { stepStory, timeAgo } from '../../utils/stories';
import { whatsAppUrl } from '../../utils/share';
import { Icon } from '../ui';
import StoryMedia from './StoryMedia';
import StoryPreview from './StoryPreview';
import StoryProgress from './StoryProgress';

const DURATION = 5000;
const TAP_MS = 250;

const iconBtn = 'grid h-9 w-9 place-items-center rounded-full text-white/90 hover:bg-white/15';
const navBtn = 'hidden h-10 w-10 shrink-0 place-items-center rounded-full bg-white/15 text-white hover:bg-white/30 disabled:invisible sm:grid';

/** Full-screen Instagram-style story viewer. */
export default function StoryViewer({ groups, start, onClose, onSeen }) {
  const [pos, setPos] = useState(start);
  const [manualPause, setManualPause] = useState(false);
  const [held, setHeld] = useState(false);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState('');
  const [muted, setMuted] = useState(false);
  const [videoLength, setVideoLength] = useState(null); // { id, ms } of the loaded reel
  const pressStart = useRef(0);

  const group = groups[pos.groupIndex];
  const slide = group.slides[pos.slideIndex];
  // photos show for DURATION; reels run for their own length (bar waits until it is known)
  const duration = slide.video ? (videoLength?.id === slide.id ? videoLength.ms : null) : DURATION;
  const paused = manualPause || held || replying;
  const prevGroup = groups[pos.groupIndex - 1];
  const nextGroup = groups[pos.groupIndex + 1];
  const isFirst = pos.groupIndex === 0 && pos.slideIndex === 0;

  const go = (dir) => {
    const next = stepStory(groups, pos, dir);
    next ? setPos(next) : onClose();
  };
  const jumpTo = (groupIndex) => setPos({ groupIndex, slideIndex: 0 });

  useEffect(() => onSeen(group.id), [group.id, onSeen]);

  const onDuration = useCallback((id, ms) => setVideoLength({ id, ms }), []);
  const onAutoplayBlocked = useCallback(() => setMuted(true), []);

  // preload the next image so advancing feels instant
  useEffect(() => {
    const next = stepStory(groups, pos, 1);
    if (next) new Image().src = groups[next.groupIndex].slides[next.slideIndex].image;
  }, [groups, pos]);

  useEffect(() => {
    const onKey = (e) => {
      if (replying) return;
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') go(1);
      if (e.key === 'ArrowLeft') go(-1);
      if (e.key === ' ') {
        e.preventDefault();
        setManualPause((p) => !p);
      }
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  });

  // tap left third = back, elsewhere = forward; press and hold = pause
  const onPointerDown = () => {
    pressStart.current = Date.now();
    setHeld(true);
  };
  const onPointerUp = (e) => {
    setHeld(false);
    if (Date.now() - pressStart.current > TAP_MS) return;
    const { left, width } = e.currentTarget.getBoundingClientRect();
    go(e.clientX - left < width / 3 ? -1 : 1);
  };

  const sendReply = (e) => {
    e.preventDefault();
    window.open(whatsAppUrl(`${reply.trim() || 'Hi, I saw this on your website.'}\n\nAbout: ${slide.title}\n${slide.url}`), '_blank', 'noreferrer');
    setReply('');
    e.currentTarget.querySelector('input').blur();
  };

  return (
    <div role="dialog" aria-modal="true" aria-label={`${group.title} story`} className="fixed inset-0 z-[60] flex items-center justify-center gap-6 bg-black/95">
      <button onClick={onClose} aria-label="Close stories" className={`${iconBtn} absolute right-4 top-4 z-10 hidden sm:grid`}>
        <Icon name="close" className="h-6 w-6" />
      </button>

      {prevGroup ? <StoryPreview group={prevGroup} onClick={() => jumpTo(pos.groupIndex - 1)} /> : <span className="hidden h-[45vh] w-[25vh] xl:block" />}

      <button onClick={() => go(-1)} disabled={isFirst} aria-label="Previous" className={navBtn}>
        <Icon name="chevronLeft" />
      </button>

      <article className="relative h-full w-full overflow-hidden bg-black sm:aspect-[9/16] sm:h-[92vh] sm:w-auto sm:rounded-2xl">
        <StoryMedia slide={slide} paused={paused} muted={muted} onDuration={onDuration} onAutoplayBlocked={onAutoplayBlocked} />

        <div
          className="absolute inset-0 select-none"
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerLeave={() => setHeld(false)}
          onContextMenu={(e) => e.preventDefault()}
        />

        <header className="pointer-events-none absolute inset-x-0 top-0 space-y-3 bg-gradient-to-b from-black/70 to-transparent p-3 pb-10">
          <StoryProgress
            count={group.slides.length}
            active={pos.slideIndex}
            paused={paused || !duration}
            duration={duration ?? DURATION}
            animationKey={`${group.id}-${pos.slideIndex}`}
            onDone={() => go(1)}
          />
          <div className="pointer-events-auto flex items-center gap-2 text-white">
            <img src="/logo.jpg" alt="" className="h-8 w-8 rounded-full" />
            <span className="text-sm font-semibold">{group.title}</span>
            <span className="text-xs text-white/60">{timeAgo(slide.date)}</span>
            <span className="ml-auto flex">
              {slide.video && (
                <button onClick={() => setMuted((m) => !m)} aria-label={muted ? 'Unmute' : 'Mute'} className={iconBtn}>
                  <Icon name={muted ? 'volumeOff' : 'volume'} className="h-4 w-4" />
                </button>
              )}
              <button onClick={() => setManualPause((p) => !p)} aria-label={paused ? 'Play' : 'Pause'} className={iconBtn}>
                <Icon name={paused ? 'play' : 'pause'} className="h-4 w-4" />
              </button>
              <button onClick={onClose} aria-label="Close stories" className={`${iconBtn} sm:hidden`}>
                <Icon name="close" />
              </button>
            </span>
          </div>
        </header>

        <footer className="absolute inset-x-0 bottom-0 space-y-3 bg-gradient-to-t from-black/85 via-black/50 to-transparent p-4 pt-16 text-white">
          <div>
            <h3 className="font-bold leading-snug">{slide.title}</h3>
            <p className="mt-1 text-sm text-white/75">{slide.caption}</p>
          </div>
          <a
            href={slide.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 text-xs font-semibold backdrop-blur hover:bg-white/25"
          >
            <Icon name="instagram" className="h-4 w-4" />
            View on Instagram
          </a>
          <form onSubmit={sendReply} className="flex items-center gap-2">
            <input
              value={reply}
              onChange={(e) => setReply(e.target.value)}
              onFocus={() => setReplying(true)}
              onBlur={() => setReplying(false)}
              placeholder={`Reply to ${INSTAGRAM_HANDLE}…`}
              aria-label={`Send a WhatsApp message to ${COMPANY.name}`}
              className="min-w-0 flex-1 rounded-full border border-white/40 bg-transparent px-4 py-2.5 text-sm text-white outline-none placeholder:text-white/60 focus:border-white"
            />
            <button type="submit" aria-label="Send on WhatsApp" className={iconBtn}>
              <Icon name="send" />
            </button>
          </form>
        </footer>
      </article>

      <button onClick={() => go(1)} aria-label="Next" className={navBtn}>
        <Icon name="chevronRight" />
      </button>

      {nextGroup ? <StoryPreview group={nextGroup} onClick={() => jumpTo(pos.groupIndex + 1)} /> : <span className="hidden h-[45vh] w-[25vh] xl:block" />}
    </div>
  );
}
