/** Segmented progress bars. The active bar's CSS animation drives auto-advance via onDone. */
export default function StoryProgress({ count, active, paused, duration, animationKey, onDone }) {
  return (
    <div className="flex gap-1">
      {Array.from({ length: count }, (_, i) => (
        <span key={i} className="h-[3px] flex-1 overflow-hidden rounded-full bg-white/35">
          {i < active && <span className="block h-full w-full bg-white" />}
          {i === active && (
            <span
              key={animationKey}
              className="block h-full bg-white"
              style={{ animation: `story-progress ${duration}ms linear forwards`, animationPlayState: paused ? 'paused' : 'running' }}
              onAnimationEnd={onDone}
            />
          )}
        </span>
      ))}
    </div>
  );
}
