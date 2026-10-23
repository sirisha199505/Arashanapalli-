import { useEffect, useRef } from 'react';

const DENSITY = 1 / 6000; // stars per px²
const SHOOTING_EVERY = [2500, 6000]; // ms between shooting stars (min, max)

const prefersReducedMotion = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

const makeStars = (w, h) =>
  Array.from({ length: Math.round(w * h * DENSITY) }, () => ({
    x: Math.random() * w,
    y: Math.random() * h,
    r: Math.random() * 1.2 + 0.2,
    speed: Math.random() * 0.06 + 0.01,
    phase: Math.random() * Math.PI * 2,
  }));

const makeShootingStar = (w, h) => ({
  x: Math.random() * w * 0.8 + w * 0.1,
  y: Math.random() * h * 0.35,
  vx: (Math.random() < 0.5 ? -1 : 1) * (6 + Math.random() * 4),
  vy: 2.5 + Math.random() * 2,
  life: 1,
});

/** Twinkling, slowly drifting star canvas with occasional shooting stars (uses the --ink colour). */
export default function Starfield({ className = '' }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const still = prefersReducedMotion();
    let stars = [];
    let shooting = [];
    let nextShot = performance.now() + 1500;
    let frame;

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const { width, height } = canvas.getBoundingClientRect();
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      stars = makeStars(width, height);
    };

    const draw = (t = 0) => {
      const { width, height } = canvas.getBoundingClientRect();
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--ink');
      for (const s of stars) {
        if (!still) s.x = (s.x + s.speed) % width;
        ctx.globalAlpha = 0.25 + 0.55 * Math.abs(Math.sin(t / 1400 + s.phase));
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
      }
      if (!still) {
        if (t > nextShot) {
          shooting.push(makeShootingStar(width, height));
          nextShot = t + SHOOTING_EVERY[0] + Math.random() * (SHOOTING_EVERY[1] - SHOOTING_EVERY[0]);
        }
        shooting = shooting.filter((s) => s.life > 0);
        for (const s of shooting) {
          const tail = ctx.createLinearGradient(s.x, s.y, s.x - s.vx * 14, s.y - s.vy * 14);
          tail.addColorStop(0, `rgba(255,236,225,${s.life})`);
          tail.addColorStop(1, 'rgba(255,236,225,0)');
          ctx.globalAlpha = 1;
          ctx.strokeStyle = tail;
          ctx.lineWidth = 1.6;
          ctx.beginPath();
          ctx.moveTo(s.x, s.y);
          ctx.lineTo(s.x - s.vx * 14, s.y - s.vy * 14);
          ctx.stroke();
          s.x += s.vx;
          s.y += s.vy;
          s.life -= 0.018;
        }
        frame = requestAnimationFrame(draw);
      }
    };

    resize();
    draw();
    window.addEventListener('resize', resize);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return <canvas ref={canvasRef} aria-hidden="true" className={`h-full w-full ${className}`} />;
}
