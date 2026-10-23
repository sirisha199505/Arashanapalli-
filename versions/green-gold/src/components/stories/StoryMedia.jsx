import { useEffect, useRef } from 'react';

const fill = 'absolute inset-0 h-full w-full';

/** Photo or reel video for one story slide, over a blurred copy of its cover. */
export default function StoryMedia({ slide, paused, muted, onDuration, onAutoplayBlocked }) {
  const videoRef = useRef(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (paused) video.pause();
    else video.play().catch(onAutoplayBlocked); // browsers may block sound until the user interacts
  }, [paused, muted, slide.id, onAutoplayBlocked]);

  return (
    <>
      <img src={slide.image} alt="" className={`${fill} scale-110 object-cover blur-2xl brightness-50`} />
      {slide.video ? (
        <video
          key={slide.id}
          ref={videoRef}
          src={slide.video}
          poster={slide.image}
          muted={muted}
          playsInline
          preload="auto"
          onLoadedMetadata={(e) => onDuration(slide.id, e.currentTarget.duration * 1000)}
          className={`${fill} object-contain`}
        />
      ) : (
        <img key={slide.id} src={slide.image} alt={slide.title} className={`${fill} object-contain`} draggable="false" />
      )}
    </>
  );
}
