import Starfield from './Starfield';

/** Animated hero background: stars + a rising, glowing horizon with a sunrise flare (brand red). */
export default function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 overflow-hidden">
      <Starfield className="absolute inset-0 opacity-70 [mask-image:linear-gradient(to_bottom,#000_55%,transparent)]" />

      {/* planet: a huge circle whose top edge forms the horizon */}
      <div className="animate-horizon absolute left-1/2 top-[74%] aspect-square w-[320%] rounded-full sm:top-[76%] sm:w-[240%] lg:w-[200%]">
        <div className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_0%,var(--surface-2),var(--bg)_35%)] shadow-[0_-2px_0_0_rgba(255,170,120,0.55),0_-10px_40px_0_var(--primary),0_-40px_140px_10px_var(--glow)]" />
        {/* bright spot gliding along the rim: conic highlight masked to a thin ring */}
        <div className="animate-rim absolute -inset-[2px] rounded-full bg-[conic-gradient(from_-12deg,transparent_0deg,rgba(255,225,200,0.95)_12deg,transparent_24deg)] [mask-image:radial-gradient(farthest-side,transparent_calc(100%-4px),#000_calc(100%-3px))] blur-[1px]" />
        {/* city lights scattered across the surface */}
        <div className="absolute inset-x-[25%] top-[0.6%] h-[5%] opacity-70 [background-image:radial-gradient(circle,rgba(255,190,120,0.9)_1px,transparent_1.5px)] [background-size:22px_14px] [mask-image:radial-gradient(ellipse_50%_100%_at_50%_0%,#000,transparent)]" />
      </div>

      {/* sunrise flare sitting on the horizon */}
      <div className="animate-flare absolute left-1/2 top-[calc(74%-5rem)] h-40 w-[42rem] max-w-[120%] rounded-[50%] bg-[radial-gradient(ellipse_at_center,rgba(255,236,220,0.95),rgba(255,140,90,0.55)_18%,var(--glow)_45%,transparent_70%)] blur-md sm:top-[calc(76%-5rem)]" />
    </div>
  );
}
