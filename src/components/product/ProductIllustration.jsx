import { useId } from 'react';

/**
 * Drawn product pictures, used until the shop adds real photos.
 * Each product type ("Butt Hinge", "BWR Plywood", "Pad Lock"…) maps to a drawing, coloured by the product's
 * variant: the hardware finish (Antique Brass, Black Matt…), the laminate / panel / floor shade, the veneer species.
 * Everything is inline SVG, so there is nothing to download or host.
 */

// ---------- colours ----------
const rgb = (h) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16));
const mix = (a, b, t) => '#' + rgb(a).map((v, i) => Math.round(v + (rgb(b)[i] - v) * t).toString(16).padStart(2, '0')).join('');
const tone = (base) => ({ base, light: mix(base, '#ffffff', 0.45), dark: mix(base, '#000000', 0.42) });

const STEEL = '#B8BEC5';
const FINISHES = [
  ['antique brass', '#9C7A3C'],
  ['rose gold', '#D29A86'],
  ['gold', '#D2AC3E'],
  ['black', '#3C3D41'],
  ['chrome', '#C9D1D9'],
  ['ss satin', STEEL],
];
const SHADES = Object.entries({
  'frosty white': '#EEF0EE', white: '#EDEEEC', ivory: '#EDE3CC', champagne: '#D8C29E', 'dusky beige': '#C8B293', beige: '#D2BE9F',
  'graphite grey': '#5D6166', 'grey ash': '#A39D93', grey: '#8A8E93', 'charcoal black': '#2F3033', black: '#2F3033',
  'olive green': '#6C7450', olive: '#6C7450', 'navy blue': '#2C3B5E', navy: '#2C3B5E', silver: '#C3C7CC', gold: '#C9A54A',
  'classic walnut': '#6A4630', walnut: '#6A4630', 'burma teak': '#9A6232', 'natural teak': '#A06C3A', teak: '#A06C3A',
  'light oak': '#CFAA76', 'american oak': '#C49A62', 'natural oak': '#C49A62', 'smoked oak': '#7A5E45', oak: '#C49A62',
  'smoked elm': '#7C6452', wenge: '#47342A', maple: '#DDBB88', cherry: '#97482F', hickory: '#9A6C43', 'white wash': '#E4DCCD',
  ash: '#D8C4A0', sapele: '#8E4B2E', rosewood: '#5E2B22', zebrano: '#C9A66B',
}).sort((a, b) => b[0].length - a[0].length); // longest name first, so "light oak" wins over "oak"
const WOODY = /walnut|teak|oak|elm|wenge|maple|cherry|hickory|ash|sapele|rosewood|zebrano|wash|wood/;
const LABELS = ['#B5452F', '#2F6DB5', '#2F8A57', '#C7861F', '#6B4AA0', '#1F7F8C'];
const hash = (s) => [...s].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);

const isDark = (h) => { const [r, g, b] = rgb(h); return r * 0.3 + g * 0.59 + b * 0.11 < 110; };
const findShade = (text) => SHADES.find(([k]) => text.includes(k))?.[1];
const findFinish = (text) => FINISHES.find(([k]) => text.includes(k))?.[1];

/** The colour of a shade or finish name ("Navy Blue", "Antique Brass"), for swatches; undefined when it isn't one. */
export const swatchColour = (text) => findFinish(String(text).toLowerCase()) ?? findShade(String(text).toLowerCase());

// ---------- which drawing ----------
// In lower case, the first rule that matches wins. Rules starting with ^ match "category|type"; the rest match the type only.
const RULES = [
  [/hinge screw/, 'screw'],
  [/door frame/, 'frame'],
  [/^doors & frames|^boards & mdf\|flush door/, 'door'],
  [/^plywood/, 'ply'],
  [/particle board/, 'particle'],
  [/block board/, 'blockboard'],
  [/mdf|hdhmr/, 'mdf'],
  [/^laminates/, 'laminate'],
  [/^veneers/, 'veneer'],
  [/marble/, 'marble'],
  [/3d wall/, 'panel3d'],
  [/acrylic wall/, 'acrylic'],
  [/soffit/, 'soffit'],
  [/louver|slat/, 'slats'],
  [/^wall panels/, 'fluted'],
  [/skirting/, 'skirting'],
  [/^flooring/, 'planks'],
  [/^edge banding/, 'roll'],
  [/led strip|led light/, 'ledstrip'],
  [/led profile/, 'ledprofile'],
  [/spot ?light|motion sensor/, 'spot'],
  [/panel light/, 'panel'],
  [/driver/, 'driver'],
  [/soft-close hinge|auto hinge/, 'cuphinge'],
  [/hinge/, 'hinge'],
  [/lever handle|mortise handle|handle lock set|door handles|window handle/, 'lever'],
  [/pull handle|glass door handle|sliding door handle/, 'pull'],
  [/profile handle/, 'profile'],
  [/handle/, 'dhandle'],
  [/knob/, 'knob'],
  [/push-to-open/, 'pushlatch'],
  [/pad ?lock/, 'padlock'],
  [/digital door lock|smart wi-fi/, 'digitallock'],
  [/mortise cylinder/, 'cylinder'],
  [/cupboard lock|drawer lock|furniture lock|almirah lock/, 'camlock'],
  [/digital safe|hotel room safe/, 'safedigital'],
  [/safe|home locker/, 'safe'],
  [/almirah/, 'almirah'],
  [/cash box/, 'cashbox'],
  [/key cabinet/, 'keycabinet'],
  [/lock|latch/, 'lockbody'],
  [/aldrop|tower bolt/, 'bolt'],
  [/floor spring/, 'floorspring'],
  [/closer/, 'closer'],
  [/stopper|magnet/, 'stopper'],
  [/viewer/, 'viewer'],
  [/chain/, 'chain'],
  [/kick plate/, 'kickplate'],
  [/window stay/, 'stay'],
  [/tandem drawer/, 'drawer'],
  [/channel|slide|keyboard tray/, 'slide'],
  [/gas lift|bed lift|lift-up flap/, 'piston'],
  [/bed fitting|bracket/, 'bracket'],
  [/castor/, 'castor'],
  [/cpu trolley/, 'trolley'],
  [/sofa leg|cabinet leg/, 'leg'],
  [/chair base/, 'chairbase'],
  [/grommet|cable manager/, 'grommet'],
  [/shelf support|shelf pin/, 'pins'],
  [/cutlery tray|accessory tray|jewellery drawer|tie & belt/, 'tray'],
  [/dustbin/, 'bin'],
  [/roller shutter/, 'shutter'],
  [/mirror/, 'mirror'],
  [/hanger/, 'rod'],
  [/sliding wardrobe|sliding glass door|sliding partition/, 'track'],
  [/spider/, 'spider'],
  [/patch fitting|clamp|glass-to-glass/, 'clamp'],
  [/aluminium (profile|glass)/, 'profile'],
  [/^kitchen fittings|^wardrobe fittings|basket|pull-out|rack/, 'basket'],
  [/silicone|epoxy|instant|filler/, 'tube'],
  [/hot melt/, 'gluestick'],
  [/thinner|polish|lacquer|sealer|primer|stain|duco/, 'can'],
  [/adhesive/, 'tub'],
  [/wire nail/, 'nail'],
  [/wall plug/, 'plug'],
  [/anchor/, 'anchor'],
  [/minifix/, 'minifix'],
  [/bolt & nut/, 'boltnut'],
  [/^screws/, 'screw'],
];

/** Which drawing a product gets, or null when there's none for it (e.g. a new category). */
export function illustrationKind(product) {
  const type = product.name.split(' – ')[0].toLowerCase();
  const key = `${product.category.toLowerCase()}|${type}`;
  return RULES.find(([re]) => re.test(re.source.startsWith('^') ? key : type))?.[1] ?? null;
}

// ---------- shared bits ----------
const ln = (c, w = 2) => ({ stroke: c, strokeWidth: w, strokeLinejoin: 'round', strokeLinecap: 'round' });
const Shadow = ({ y = 176, rx = 62 }) => <ellipse cx="100" cy={y} rx={rx} ry="7" fill="#000" opacity="0.08" />;
const Screw = ({ x, y, r = 4, m }) => (
  <g>
    <circle cx={x} cy={y} r={r} fill={m.light} {...ln(m.dark, 1.2)} />
    <path d={`M${x - r * 0.6} ${y}h${r * 1.2}`} {...ln(m.dark, 1.2)} />
  </g>
);
const Gloss = ({ d }) => <path d={d} fill="#fff" opacity="0.35" />;

// A slab seen from above at an angle (plywood, boards, laminates, veneers, flooring).
const A = [28, 92], B = [128, 64], C = [174, 96], D = [74, 124];
function Slab({ id, face, edge, t, pattern, layers = 0, shift = [0, 0] }) {
  const [sx, sy] = shift;
  const p = (pt, dy = 0) => `${pt[0] + sx},${pt[1] + sy + dy}`;
  const top = [A, B, C, D].map((q) => p(q)).join(' ');
  const f = tone(face), e = tone(edge);
  const clip = `${id}-${sx}-${sy}`;
  const lines = [];
  if (pattern === 'grain' || pattern === 'planks' || pattern === 'zebra') {
    for (let i = 0; i < 11; i++) {
      const k = (i + 0.5) / 11, x = A[0] + (D[0] - A[0]) * k + sx, y = A[1] + (D[1] - A[1]) * k + sy;
      const w = ((i * 37) % 9) - 4;
      lines.push(<path key={i} d={`M${x - 4} ${y + 1}q30 ${-10 + w} 60 ${-16} t62 ${-16 - w / 2} t40 -10`} fill="none" {...ln(f.dark, pattern === 'zebra' ? 4 : 1)} opacity={pattern === 'zebra' ? 0.55 : 0.35} />);
    }
  }
  if (pattern === 'planks') {
    [1, 2].forEach((n) => {
      const k = n / 3, x1 = A[0] + (D[0] - A[0]) * k + sx, y1 = A[1] + (D[1] - A[1]) * k + sy;
      lines.push(<path key={`s${n}`} d={`M${x1} ${y1}l100 -28`} {...ln(f.dark, 1.6)} opacity="0.6" />);
    });
    [[0.17, 0.4], [0.5, 0.7], [0.83, 0.25]].forEach(([k, j], n) => {
      const x = A[0] + (D[0] - A[0]) * k + 100 * j + sx, y = A[1] + (D[1] - A[1]) * k - 28 * j + sy;
      lines.push(<path key={`c${n}`} d={`M${x - 3} ${y - 5}l6 10`} {...ln(f.dark, 1.6)} opacity="0.6" />);
    });
  }
  if (pattern === 'stone') {
    lines.push(<path key="v1" d={`M${40 + sx} ${100 + sy}q30 -2 50 -18t60 -6`} fill="none" {...ln(f.dark, 1.4)} opacity="0.4" />);
    lines.push(<path key="v2" d={`M${60 + sx} ${116 + sy}q25 -16 45 -12t50 -16`} fill="none" {...ln(f.dark, 1)} opacity="0.3" />);
  }
  if (pattern === 'texture') {
    for (let i = 0; i < 60; i++) lines.push(<circle key={i} cx={30 + ((i * 53) % 140) + sx} cy={64 + ((i * 29) % 62) + sy} r="1" fill={f.dark} opacity="0.3" />);
  }
  if (pattern === 'speckle') {
    for (let i = 0; i < 80; i++) lines.push(<circle key={i} cx={30 + ((i * 53) % 140) + sx} cy={64 + ((i * 29) % 62) + sy} r={1 + (i % 3) * 0.5} fill={i % 2 ? f.dark : f.light} opacity="0.45" />);
  }
  const edgeLines = [];
  for (let n = 1; n < layers; n++) {
    const dy = (t * n) / layers;
    edgeLines.push(<path key={n} d={`M${p(A, dy)}L${p(D, dy)}L${p(C, dy)}`} fill="none" {...ln(n % 2 ? e.dark : e.light, 1)} opacity="0.7" />);
  }
  return (
    <g>
      <clipPath id={clip}><polygon points={top} /></clipPath>
      <polygon points={`${p(A)} ${p(D)} ${p(D, t)} ${p(A, t)}`} fill={e.base} {...ln(e.dark, 1.2)} />
      <polygon points={`${p(D)} ${p(C)} ${p(C, t)} ${p(D, t)}`} fill={mix(e.base, '#000000', 0.12)} {...ln(e.dark, 1.2)} />
      {edgeLines}
      <polygon points={top} fill={f.base} />
      <g clipPath={`url(#${clip})`}>
        {lines}
        {pattern === 'gloss' && <Gloss d={`M${60 + sx} ${40 + sy}l40 0l-50 110l-40 0z`} />}
        {pattern === 'gloss' && <Gloss d={`M${112 + sx} ${40 + sy}l14 0l-50 110l-14 0z`} />}
      </g>
      <polygon points={top} fill="none" {...ln(f.dark, 1.2)} />
    </g>
  );
}

// A long bar seen at an angle (aluminium profiles, skirting, LED profiles).
function Bar({ m, glow, curved }) {
  return (
    <g>
      <polygon points="26,128 150,62 172,72 48,138" fill={glow ? '#FFF8DC' : m.light} {...ln(m.dark, 1.4)} />
      {glow && <polygon points="34,128 152,66 164,72 46,134" fill="#FFE9A3" opacity="0.9" />}
      <polygon points="48,138 172,72 172,94 48,160" fill={m.base} {...ln(m.dark, 1.4)} />
      {curved ? (
        <path d="M26 128L48 138L48 160L26 150Q20 138 26 128z" fill={m.dark} />
      ) : (
        <path d="M26 128L48 138L48 160L26 150zM32 136l10 5v8l-10 -5z" fill={m.dark} fillRule="evenodd" />
      )}
      <path d="M52 146l116 -62" {...ln(m.light, 1)} opacity="0.6" />
    </g>
  );
}

// ---------- the drawings ----------
// ctx: { id, m (metal tone), s (shade tone), t (sheet thickness), type, variant, label }
const DRAW = {
  ply: ({ id, s, t }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#E2C79A" t={t} layers={Math.max(3, Math.round(t / 2.2))} pattern="grain" shift={[6, -16]} />
      <Slab id={id} face={s.base} edge="#E2C79A" t={t} layers={Math.max(3, Math.round(t / 2.2))} pattern="grain" />
    </>
  ),
  blockboard: ({ id, s, t }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#C9A46E" t={t} layers={3} pattern="grain" />
    </>
  ),
  mdf: ({ id, s, t, type }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={type.includes('pre-laminated') ? s.base : '#B88A5C'} edge={type.includes('hdhmr') ? '#7E8A5A' : '#B07E52'} t={t} shift={[6, -16]} />
      <Slab id={id} face={type.includes('pre-laminated') ? s.base : '#C29466'} edge={type.includes('hdhmr') ? '#7E8A5A' : '#B07E52'} t={t} />
    </>
  ),
  particle: ({ id, s, t, type }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={type.includes('pre-laminated') ? s.base : '#CDAF85'} edge="#C9AC80" t={t} pattern={type.includes('pre-laminated') ? undefined : 'speckle'} />
    </>
  ),
  laminate: ({ id, s, type, variant }) => {
    const pattern = type.includes('stone') ? 'stone' : type.includes('gloss') || type.includes('acrylic') ? 'gloss' : type.includes('textured') || type.includes('suede') ? 'texture' : type.includes('wood') || WOODY.test(variant) ? 'grain' : undefined;
    return (
      <>
        <Shadow y={140} rx={74} />
        <Slab id={id} face={s.base} edge="#4A3B30" t={3} pattern={pattern} shift={[8, -20]} />
        <Slab id={id} face={s.base} edge="#4A3B30" t={3} pattern={pattern} />
      </>
    );
  },
  veneer: ({ id, s, type }) => (
    <>
      <Shadow y={140} rx={74} />
      <Slab id={id} face={s.light} edge={s.base} t={2} pattern={type.includes('zebrano') ? 'zebra' : 'grain'} shift={[8, -20]} />
      <Slab id={id} face={s.base} edge={s.dark} t={2} pattern={type.includes('zebrano') ? 'zebra' : 'grain'} />
    </>
  ),
  planks: ({ id, s }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge={s.dark} t={8} pattern="planks" />
    </>
  ),
  roll: ({ s, variant }) => {
    const w = variant.startsWith('45') ? 22 : 14;
    return (
      <>
        <Shadow y={168} rx={56} />
        <path d={`M120 150L184 ${172 - w / 2}L184 ${172 + w / 2}L118 ${158 + w / 2}z`} fill={s.base} {...ln(s.dark, 1.2)} />
        <circle cx={96 + w / 2} cy="96" r="58" fill={s.dark} />
        <rect x="96" y="38" width={w / 2} height="116" fill={s.dark} />
        <circle cx="96" cy="96" r="58" fill={s.base} {...ln(s.dark, 1.4)} />
        {[50, 42, 34].map((r) => <circle key={r} cx="96" cy="96" r={r} fill="none" {...ln(s.dark, 1)} opacity="0.25" />)}
        <circle cx="96" cy="96" r="26" fill="#C9A57A" {...ln('#8C6A44', 1.4)} />
        <circle cx="96" cy="96" r="19" fill="#fff" {...ln('#8C6A44', 1)} />
      </>
    );
  },
  fluted: ({ s, type }) => {
    const step = type.includes('pvc') ? 18 : 10;
    return (
      <>
        <Shadow />
        <polygon points="146,24 156,30 156,178 146,172" fill={s.dark} />
        <rect x="54" y="24" width="92" height="148" fill={s.base} />
        {Array.from({ length: Math.floor(92 / step) }, (_, i) => (
          <g key={i}>
            <rect x={54 + i * step} y="24" width="2.5" height="148" fill={s.light} opacity="0.8" />
            <rect x={54 + i * step + step - 2.5} y="24" width="2.5" height="148" fill={s.dark} opacity="0.5" />
          </g>
        ))}
        <rect x="54" y="24" width="92" height="148" fill="none" {...ln(s.dark, 1.2)} />
      </>
    );
  },
  slats: ({ s }) => (
    <>
      <Shadow />
      <rect x="50" y="24" width="100" height="150" fill="#2A2A2C" />
      {Array.from({ length: 8 }, (_, i) => (
        <g key={i}>
          <rect x={53 + i * 12} y="24" width="8" height="150" fill={s.base} />
          <rect x={53 + i * 12} y="24" width="2" height="150" fill={s.light} opacity="0.7" />
        </g>
      ))}
    </>
  ),
  soffit: ({ s }) => (
    <>
      <Shadow />
      <rect x="40" y="30" width="120" height="140" fill={s.base} {...ln(s.dark, 1.2)} />
      {Array.from({ length: 6 }, (_, i) => <path key={i} d={`M40 ${53 + i * 23}h120`} {...ln(s.dark, 2)} opacity="0.5" />)}
      {Array.from({ length: 12 }, (_, i) => <path key={`g${i}`} d={`M${46 + ((i * 37) % 100)} ${36 + i * 11}q12 -2 26 0`} fill="none" {...ln(s.dark, 1)} opacity="0.3" />)}
    </>
  ),
  panel3d: ({ s }) => (
    <>
      <Shadow />
      <rect x="40" y="30" width="120" height="140" fill={s.base} />
      {Array.from({ length: 4 }, (_, r) =>
        Array.from({ length: 4 }, (_, c) => {
          const x = 40 + c * 30, y = 30 + r * 35;
          return (
            <g key={`${r}${c}`}>
              <polygon points={`${x},${y} ${x + 30},${y} ${x + 15},${y + 17.5}`} fill={s.light} />
              <polygon points={`${x},${y + 35} ${x + 30},${y + 35} ${x + 15},${y + 17.5}`} fill={s.dark} opacity="0.45" />
            </g>
          );
        }),
      )}
      <rect x="40" y="30" width="120" height="140" fill="none" {...ln(s.dark, 1.2)} />
    </>
  ),
  marble: ({ s }) => {
    const base = s.base === '#2F3033' ? s : tone(mix(s.base, '#ffffff', 0.5));
    return (
      <>
        <Shadow />
        <rect x="46" y="22" width="108" height="152" rx="2" fill={base.base} {...ln(base.dark, 1.2)} />
        <path d="M46 60q30 10 44 40t64 30M60 22q10 40 50 50t44 10M46 140q40 -14 60 6t48 0" fill="none" {...ln(base.dark, 1.4)} opacity="0.45" />
        <path d="M80 174q4 -30 30 -40" fill="none" {...ln('#C9A54A', 1.2)} opacity="0.6" />
        <Gloss d="M70 22h22l-40 152h-6v-40z" />
      </>
    );
  },
  acrylic: ({ s }) => (
    <>
      <Shadow />
      <rect x="46" y="22" width="108" height="152" rx="3" fill={s.base} {...ln(s.dark, 1.2)} />
      <Gloss d="M70 22h30l-54 120v-50z" />
      <Gloss d="M120 22h10l-84 152h-0v-18z" />
    </>
  ),
  skirting: ({ s }) => (
    <>
      <Shadow y={166} />
      <Bar m={s} curved />
    </>
  ),
  door: ({ s, type }) => {
    const face = type.includes('teak') ? tone('#A06C3A') : type.includes('wpc') ? tone('#D7C7AC') : s;
    return (
      <>
        <Shadow y={180} rx={50} />
        <polygon points="140,20 148,26 148,182 140,180" fill={face.dark} />
        <rect x="60" y="20" width="80" height="160" fill={face.base} {...ln(face.dark, 1.4)} />
        {type.includes('membrane') ? (
          <>
            <rect x="70" y="32" width="60" height="58" rx="3" fill="none" {...ln(face.dark, 2)} opacity="0.5" />
            <rect x="70" y="104" width="60" height="64" rx="3" fill="none" {...ln(face.dark, 2)} opacity="0.5" />
          </>
        ) : (
          [0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${66 + i * 12} 24q2 70 0 152`} fill="none" {...ln(face.dark, 1)} opacity="0.25" />)
        )}
        <rect x="124" y="94" width="6" height="18" rx="2" fill={STEEL} {...ln('#6E757C', 1)} />
        <rect x="118" y="98" width="14" height="4" rx="2" fill={STEEL} {...ln('#6E757C', 1)} />
      </>
    );
  },
  frame: ({ type }) => {
    const f = tone(type.includes('teak') ? '#A06C3A' : '#CDBB9C');
    return (
      <>
        <Shadow y={180} rx={56} />
        <path d="M50 182V18h100v164h-14V32H64v150z" fill={f.base} {...ln(f.dark, 1.4)} />
        <path d="M64 182V32h72v150" fill="none" {...ln(f.dark, 1)} opacity="0.6" />
        <path d="M58 30v148M142 30v148M60 24h80" {...ln(f.dark, 1)} opacity="0.3" />
      </>
    );
  },
  hinge: ({ m }) => (
    <>
      <Shadow y={168} rx={54} />
      <rect x="50" y="38" width="48" height="124" rx="4" fill={m.base} {...ln(m.dark)} />
      <rect x="102" y="38" width="48" height="124" rx="4" fill={m.base} {...ln(m.dark)} />
      <rect x="92" y="32" width="16" height="136" rx="7" fill={m.light} {...ln(m.dark)} />
      {[66, 100, 134].map((y) => <path key={y} d={`M92 ${y}h16`} {...ln(m.dark, 1.5)} />)}
      {[62, 100, 138].map((y) => (
        <g key={y}><Screw x={72} y={y} m={m} r={6} /><Screw x={128} y={y} m={m} r={6} /></g>
      ))}
      <Gloss d="M54 42h8v116h-8z" />
    </>
  ),
  cuphinge: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <rect x="70" y="86" width="96" height="26" rx="8" fill={m.base} {...ln(m.dark)} />
      <rect x="140" y="70" width="36" height="58" rx="6" fill={m.light} {...ln(m.dark)} />
      <Screw x={158} y={84} m={m} r={5} />
      <Screw x={158} y={114} m={m} r={5} />
      <circle cx="58" cy="99" r="32" fill={m.base} {...ln(m.dark)} />
      <circle cx="58" cy="99" r="22" fill={m.dark} />
      <circle cx="58" cy="99" r="12" fill={m.base} opacity="0.6" />
      <Screw x={32} y={74} m={m} r={5} />
      <Screw x={32} y={124} m={m} r={5} />
    </>
  ),
  lever: ({ m }) => (
    <>
      <Shadow y={172} rx={50} />
      <rect x="82" y="34" width="36" height="134" rx="16" fill={m.base} {...ln(m.dark)} />
      <Gloss d="M88 44h6v114h-6z" />
      <circle cx="100" cy="132" r="7" fill={m.dark} />
      <path d="M97 132l-3 16h12l-3 -16z" fill={m.dark} />
      <rect x="92" y="62" width="82" height="18" rx="9" fill={m.base} {...ln(m.dark)} />
      <path d="M100 66h68" {...ln(m.light, 3)} opacity="0.7" />
      <circle cx="100" cy="71" r="16" fill={m.light} {...ln(m.dark)} />
    </>
  ),
  pull: ({ m }) => (
    <>
      <Shadow y={182} rx={40} />
      <rect x="62" y="44" width="34" height="14" fill={m.dark} />
      <rect x="62" y="142" width="34" height="14" fill={m.dark} />
      <rect x="56" y="38" width="8" height="26" rx="3" fill={m.base} {...ln(m.dark, 1.4)} />
      <rect x="56" y="136" width="8" height="26" rx="3" fill={m.base} {...ln(m.dark, 1.4)} />
      <rect x="92" y="16" width="20" height="168" rx="10" fill={m.base} {...ln(m.dark)} />
      <Gloss d="M97 24h5v152h-5z" />
    </>
  ),
  dhandle: ({ m }) => (
    <>
      <Shadow y={140} rx={70} />
      <rect x="44" y="96" width="14" height="32" fill={m.dark} />
      <rect x="142" y="96" width="14" height="32" fill={m.dark} />
      <ellipse cx="51" cy="128" rx="14" ry="5" fill={m.base} {...ln(m.dark, 1.4)} />
      <ellipse cx="149" cy="128" rx="14" ry="5" fill={m.base} {...ln(m.dark, 1.4)} />
      <rect x="26" y="80" width="148" height="18" rx="9" fill={m.base} {...ln(m.dark)} />
      <path d="M36 85h128" {...ln(m.light, 3)} opacity="0.7" />
    </>
  ),
  knob: ({ m }) => (
    <>
      <Shadow y={170} rx={40} />
      <ellipse cx="100" cy="162" rx="30" ry="9" fill={m.base} {...ln(m.dark, 1.4)} />
      <rect x="90" y="122" width="20" height="40" fill={m.dark} />
      <circle cx="100" cy="88" r="44" fill={m.base} {...ln(m.dark)} />
      <circle cx="86" cy="72" r="16" fill={m.light} opacity="0.75" />
      <circle cx="80" cy="66" r="6" fill="#fff" opacity="0.6" />
    </>
  ),
  bolt: ({ m }) => (
    <>
      <Shadow y={150} rx={74} />
      <rect x="40" y="76" width="112" height="48" rx="5" fill={m.base} {...ln(m.dark)} />
      <rect x="54" y="68" width="14" height="64" rx="3" fill={m.light} {...ln(m.dark, 1.5)} />
      <rect x="124" y="68" width="14" height="64" rx="3" fill={m.light} {...ln(m.dark, 1.5)} />
      <rect x="20" y="91" width="160" height="18" rx="9" fill={m.light} {...ln(m.dark)} />
      <path d="M94 100v-46" {...ln(m.dark, 10)} />
      <path d="M94 100v-46" {...ln(m.base, 6)} />
      <circle cx="94" cy="50" r="10" fill={m.base} {...ln(m.dark)} />
      <Screw x={48} y={84} m={m} />
      <Screw x={48} y={116} m={m} />
      <Screw x={146} y={84} m={m} />
      <Screw x={146} y={116} m={m} />
    </>
  ),
  closer: ({ m }) => (
    <>
      <Shadow y={140} rx={74} />
      <path d="M118 84L150 56L178 96" fill="none" {...ln(m.dark, 12)} />
      <path d="M118 84L150 56L178 96" fill="none" {...ln(m.base, 7)} />
      <circle cx="150" cy="56" r="7" fill={m.light} {...ln(m.dark, 1.5)} />
      <rect x="168" y="94" width="20" height="16" rx="3" fill={m.base} {...ln(m.dark, 1.5)} />
      <rect x="22" y="76" width="110" height="46" rx="12" fill={m.base} {...ln(m.dark)} />
      <rect x="30" y="80" width="94" height="10" rx="5" fill={m.light} opacity="0.7" />
      <circle cx="118" cy="84" r="9" fill={m.light} {...ln(m.dark, 1.5)} />
    </>
  ),
  floorspring: ({ m }) => (
    <>
      <Shadow y={150} rx={78} />
      <polygon points="24,110 120,84 178,104 82,132" fill={m.light} {...ln(m.dark)} />
      <polygon points="24,110 82,132 82,146 24,124" fill={m.base} {...ln(m.dark, 1.4)} />
      <polygon points="82,132 178,104 178,118 82,146" fill={m.dark} />
      <ellipse cx="74" cy="110" rx="12" ry="6" fill={m.dark} />
      <rect x="70" y="98" width="8" height="12" fill={m.dark} />
      <Screw x={44} y={110} m={m} />
      <Screw x={156} y={104} m={m} />
    </>
  ),
  stopper: ({ m }) => (
    <>
      <Shadow y={140} rx={70} />
      <ellipse cx="44" cy="100" rx="14" ry="34" fill={m.base} {...ln(m.dark)} />
      <rect x="44" y="84" width="96" height="32" fill={m.base} />
      <path d="M44 84h96M44 116h96" {...ln(m.dark)} />
      <path d="M50 90h88" {...ln(m.light, 4)} opacity="0.7" />
      <ellipse cx="140" cy="100" rx="7" ry="16" fill={m.base} {...ln(m.dark)} />
      <rect x="140" y="88" width="22" height="24" rx="4" fill="#2C2C2E" />
      <ellipse cx="162" cy="100" rx="6" ry="12" fill="#3F3F42" />
    </>
  ),
  viewer: ({ m }) => (
    <>
      <Shadow y={160} rx={50} />
      <circle cx="100" cy="96" r="54" fill={m.base} {...ln(m.dark)} />
      <circle cx="100" cy="96" r="40" fill={m.light} {...ln(m.dark, 1.4)} />
      <circle cx="100" cy="96" r="30" fill="#7FA9C0" {...ln(m.dark, 1.4)} />
      <circle cx="100" cy="96" r="12" fill="#2E4756" />
      <ellipse cx="88" cy="84" rx="10" ry="6" fill="#fff" opacity="0.7" transform="rotate(-30 88 84)" />
    </>
  ),
  chain: ({ m }) => (
    <>
      <Shadow y={170} rx={60} />
      <rect x="112" y="36" width="58" height="30" rx="5" fill={m.base} {...ln(m.dark)} />
      <path d="M120 51h40" {...ln(m.dark, 5)} />
      <rect x="34" y="128" width="30" height="40" rx="5" fill={m.base} {...ln(m.dark)} />
      {Array.from({ length: 8 }, (_, i) => {
        const k = i / 7, x = 140 - 90 * k, y = 54 + 86 * k + Math.sin(k * Math.PI) * 18;
        return <ellipse key={i} cx={x} cy={y} rx="9" ry="5" fill="none" {...ln(m.dark, 4)} transform={`rotate(${-50 + (i % 2) * 90} ${x} ${y})`} />;
      })}
      <circle cx="140" cy="51" r="7" fill={m.light} {...ln(m.dark, 1.4)} />
    </>
  ),
  kickplate: ({ m }) => (
    <>
      <Shadow y={150} rx={84} />
      <rect x="16" y="66" width="168" height="72" rx="3" fill={m.base} {...ln(m.dark)} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M20 ${74 + i * 8}h160`} {...ln(m.light, 1)} opacity="0.6" />)}
      <Gloss d="M40 66h24l-30 72h-18v-8z" />
      {[[26, 76], [174, 76], [26, 128], [174, 128]].map(([x, y]) => <Screw key={`${x}${y}`} x={x} y={y} m={m} />)}
    </>
  ),
  stay: ({ m }) => (
    <>
      <Shadow y={140} rx={80} />
      <rect x="18" y="84" width="40" height="34" rx="5" fill={m.base} {...ln(m.dark)} />
      <rect x="40" y="92" width="144" height="18" rx="9" fill={m.base} {...ln(m.dark)} />
      {[70, 94, 118, 142, 166].map((x) => <circle key={x} cx={x} cy="101" r="4" fill={m.dark} />)}
      <circle cx="40" cy="101" r="8" fill={m.light} {...ln(m.dark, 1.4)} />
    </>
  ),
  slide: ({ m }) => (
    <>
      <Shadow y={140} rx={84} />
      <rect x="14" y="76" width="134" height="48" rx="4" fill={m.base} {...ln(m.dark)} />
      <rect x="56" y="86" width="132" height="28" rx="3" fill={m.light} {...ln(m.dark)} />
      {[64, 76, 88, 100, 112, 124, 136].map((x) => <circle key={x} cx={x} cy="100" r="3.5" fill={m.dark} />)}
      {[28, 46].map((x) => <rect key={x} x={x} y="94" width="10" height="12" rx="3" fill={m.dark} />)}
      <rect x="168" y="94" width="12" height="12" rx="3" fill={m.dark} />
    </>
  ),
  piston: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-24 100 100)">
      <rect x="112" y="94" width="62" height="12" rx="3" fill={tone(STEEL).light} {...ln(tone(STEEL).dark, 1.4)} />
      <rect x="28" y="84" width="92" height="32" rx="8" fill="#35373B" {...ln('#1E1F21')} />
      <rect x="34" y="88" width="80" height="6" rx="3" fill="#5A5C60" />
      <circle cx="22" cy="100" r="10" fill={STEEL} {...ln('#6E757C')} />
      <circle cx="180" cy="100" r="10" fill={STEEL} {...ln('#6E757C')} />
      </g>
    </>
  ),
  bracket: ({ m }) => (
    <>
      <Shadow y={170} rx={60} />
      <path d="M52 28h22v118h92v22H52z" fill={m.base} {...ln(m.dark)} />
      <path d="M74 60L134 146H74z" fill={m.light} {...ln(m.dark, 1.4)} />
      {[48, 84, 118].map((y) => <circle key={y} cx="63" cy={y} r="4" fill={m.dark} />)}
      {[100, 140].map((x) => <circle key={x} cx={x} cy="157" r="4" fill={m.dark} />)}
    </>
  ),
  castor: ({ m }) => (
    <>
      <Shadow y={162} rx={44} />
      <rect x="56" y="34" width="88" height="12" rx="3" fill={m.base} {...ln(m.dark)} />
      <path d="M70 46h60l-6 60H76z" fill={m.light} {...ln(m.dark)} />
      <circle cx="100" cy="118" r="38" fill="#2E2F33" />
      <circle cx="100" cy="118" r="26" fill="#45474C" />
      <circle cx="100" cy="118" r="10" fill={m.base} {...ln(m.dark)} />
      <path d="M80 98a28 28 0 0 1 20 -8" fill="none" {...ln('#fff', 2)} opacity="0.3" />
    </>
  ),
  trolley: ({ m }) => (
    <>
      <Shadow y={172} rx={60} />
      <rect x="58" y="30" width="84" height="122" rx="4" fill="none" {...ln(m.dark, 10)} />
      <rect x="58" y="30" width="84" height="122" rx="4" fill="none" {...ln(m.base, 6)} />
      <rect x="64" y="138" width="72" height="8" fill={m.light} />
      {[64, 136].map((x) => <circle key={x} cx={x} cy="162" r="9" fill="#2E2F33" />)}
    </>
  ),
  leg: ({ m }) => (
    <>
      <Shadow y={170} rx={36} />
      <rect x="62" y="22" width="76" height="12" rx="3" fill={m.base} {...ln(m.dark)} />
      <path d="M80 34h40l-8 128h-24z" fill={m.base} {...ln(m.dark)} />
      <path d="M88 38l3 120" {...ln(m.light, 4)} opacity="0.7" />
      <ellipse cx="100" cy="164" rx="16" ry="5" fill={m.dark} />
    </>
  ),
  chairbase: ({ m }) => (
    <>
      <Shadow y={162} rx={84} />
      {[-90, -18, 54, 126, 198].map((a) => {
        const x = 100 + Math.cos((a * Math.PI) / 180) * 76, y = 120 + Math.sin((a * Math.PI) / 180) * 30;
        return (
          <g key={a}>
            <path d={`M100 120L${x} ${y}`} {...ln(m.dark, 14)} />
            <path d={`M100 120L${x} ${y}`} {...ln(m.base, 9)} />
            <circle cx={x} cy={y + 12} r="8" fill="#2E2F33" />
          </g>
        );
      })}
      <rect x="92" y="50" width="16" height="70" fill={m.light} {...ln(m.dark, 1.4)} />
      <ellipse cx="100" cy="120" rx="16" ry="8" fill={m.base} {...ln(m.dark)} />
    </>
  ),
  grommet: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <ellipse cx="100" cy="110" rx="66" ry="30" fill={m.base} {...ln(m.dark)} />
      <ellipse cx="100" cy="108" rx="48" ry="20" fill={m.dark} />
      <path d="M52 108a48 20 0 0 1 96 0z" fill={m.light} {...ln(m.dark, 1.4)} />
      <rect x="88" y="98" width="24" height="8" rx="3" fill={m.dark} />
    </>
  ),
  pins: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      {[[-30, 60, 90], [20, 110, 110], [-10, 80, 136]].map(([a, x, y]) => (
        <g key={x} transform={`rotate(${a} ${x} ${y})`}>
          <rect x={x - 30} y={y - 5} width="34" height="10" rx="5" fill={m.base} {...ln(m.dark, 1.4)} />
          <rect x={x + 4} y={y - 12} width="8" height="24" rx="2" fill={m.light} {...ln(m.dark, 1.4)} />
          <rect x={x + 12} y={y - 6} width="18" height="12" rx="2" fill={m.base} {...ln(m.dark, 1.4)} />
        </g>
      ))}
    </>
  ),
  pushlatch: ({ m }) => (
    <>
      <Shadow y={140} rx={70} />
      <rect x="30" y="80" width="110" height="40" rx="10" fill="#E9E9EA" {...ln('#8C8F94')} />
      <rect x="140" y="88" width="34" height="24" rx="6" fill="#9DA1A7" {...ln('#5E6266')} />
      <circle cx="176" cy="100" r="8" fill="#3A3B3E" />
      <Screw x={50} y={100} m={m} r={6} />
    </>
  ),
  padlock: ({ m }) => (
    <>
      <Shadow y={176} rx={52} />
      <path d="M68 100V64a32 32 0 0 1 64 0v36" fill="none" {...ln(tone(STEEL).dark, 16)} />
      <path d="M68 100V64a32 32 0 0 1 64 0v36" fill="none" {...ln(STEEL, 11)} />
      <rect x="50" y="92" width="100" height="80" rx="12" fill={m.base} {...ln(m.dark)} />
      <Gloss d="M58 98h10v68h-10z" />
      <circle cx="100" cy="124" r="8" fill={m.dark} />
      <path d="M96 126l-3 22h14l-3 -22z" fill={m.dark} />
    </>
  ),
  lockbody: ({ m }) => (
    <>
      <Shadow y={178} rx={56} />
      <rect x="44" y="38" width="96" height="132" rx="4" fill={tone('#8E949A').base} {...ln('#4E5358')} />
      <rect x="140" y="26" width="16" height="156" rx="3" fill={m.base} {...ln(m.dark)} />
      <path d="M156 62h16l-16 20z" fill={m.light} {...ln(m.dark, 1.5)} />
      <rect x="156" y="120" width="20" height="18" rx="2" fill={m.light} {...ln(m.dark, 1.5)} />
      <rect x="96" y="66" width="18" height="18" fill="#3A3D40" />
      <circle cx="105" cy="122" r="11" fill="#3A3D40" />
      <rect x="99" y="122" width="12" height="22" fill="#3A3D40" />
      {[54, 150].map((y) => <Screw key={y} x={148} y={y - 20} m={m} />)}
      <Screw x={148} y={166} m={m} />
    </>
  ),
  digitallock: ({ m }) => (
    <>
      <Shadow y={182} rx={40} />
      <rect x="70" y="16" width="60" height="168" rx="20" fill="#2B2D31" {...ln('#121315')} />
      <rect x="78" y="30" width="44" height="70" rx="8" fill="#1A1B1E" />
      {Array.from({ length: 12 }, (_, i) => <text key={i} x={87 + (i % 3) * 13} y={44 + Math.floor(i / 3) * 16} fontSize="9" textAnchor="middle" fill="#9FD3FF" fontFamily="sans-serif">{'123456789*0#'[i]}</text>)}
      <rect x="92" y="126" width="80" height="16" rx="8" fill={m.base} {...ln(m.dark)} />
      <circle cx="100" cy="134" r="12" fill={m.light} {...ln(m.dark)} />
      <rect x="88" y="156" width="24" height="12" rx="4" fill="#3A3C40" />
    </>
  ),
  cylinder: ({ m }) => (
    <>
      <Shadow y={150} rx={76} />
      <rect x="24" y="78" width="152" height="34" rx="6" fill={m.base} {...ln(m.dark)} />
      <path d="M86 112h28v20a8 8 0 0 1 -8 8h-12a8 8 0 0 1 -8 -8z" fill={m.base} {...ln(m.dark)} />
      <rect x="92" y="112" width="16" height="22" rx="3" fill={m.dark} />
      <path d="M30 86h140" {...ln(m.light, 4)} opacity="0.7" />
      <rect x="24" y="90" width="6" height="12" fill={m.dark} />
      <rect x="170" y="90" width="6" height="12" fill={m.dark} />
      <circle cx="100" cy="95" r="5" fill={m.dark} />
    </>
  ),
  camlock: ({ m }) => (
    <>
      <Shadow y={160} rx={56} />
      <rect x="92" y="96" width="70" height="26" rx="5" fill={m.dark} />
      <rect x="150" y="84" width="16" height="50" rx="3" fill={tone(STEEL).base} {...ln(tone(STEEL).dark, 1.4)} />
      <circle cx="84" cy="108" r="46" fill={m.base} {...ln(m.dark)} />
      <circle cx="84" cy="108" r="32" fill={m.light} {...ln(m.dark, 1.4)} />
      <path d="M84 90v32" {...ln(m.dark, 6)} />
      <circle cx="84" cy="96" r="5" fill={m.dark} />
    </>
  ),
  safe: ({ s }) => (
    <>
      <Shadow y={176} rx={66} />
      <polygon points="156,36 168,30 168,164 156,172" fill={s.dark} />
      <polygon points="40,36 52,30 168,30 156,36" fill={s.light} />
      <rect x="40" y="36" width="116" height="136" rx="4" fill={s.base} {...ln(s.dark)} />
      <rect x="50" y="46" width="96" height="116" rx="3" fill="none" {...ln(s.dark, 1.5)} />
      <circle cx="98" cy="92" r="20" fill={tone(STEEL).base} {...ln('#55595F')} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M98 75v4`} transform={`rotate(${i * 30} 98 92)`} {...ln('#55595F', 1.4)} />)}
      <circle cx="98" cy="92" r="7" fill="#55595F" />
      <rect x="82" y="124" width="32" height="8" rx="4" fill={STEEL} {...ln('#55595F', 1.4)} />
    </>
  ),
  safedigital: ({ s }) => (
    <>
      <Shadow y={176} rx={66} />
      <polygon points="156,36 168,30 168,164 156,172" fill={s.dark} />
      <polygon points="40,36 52,30 168,30 156,36" fill={s.light} />
      <rect x="40" y="36" width="116" height="136" rx="4" fill={s.base} {...ln(s.dark)} />
      <rect x="64" y="58" width="44" height="12" rx="2" fill="#173B2A" />
      <text x="86" y="67" fontSize="8" textAnchor="middle" fill="#7CF0A8" fontFamily="monospace">- - - -</text>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={66 + (i % 3) * 14} y={78 + Math.floor(i / 3) * 12} width="10" height="8" rx="2" fill="#D9DCE0" />)}
      <circle cx="132" cy="104" r="12" fill={STEEL} {...ln('#55595F', 1.4)} />
      <rect x="128" y="104" width="8" height="26" rx="4" fill={STEEL} {...ln('#55595F', 1.4)} />
    </>
  ),
  almirah: ({ s }) => (
    <>
      <Shadow y={182} rx={56} />
      <rect x="52" y="14" width="96" height="168" rx="3" fill={s.base} {...ln(s.dark)} />
      <path d="M100 18v160" {...ln(s.dark, 1.5)} />
      <path d="M52 24h96M52 172h96" {...ln(s.dark, 1)} opacity="0.5" />
      <rect x="90" y="82" width="5" height="26" rx="2" fill={STEEL} {...ln('#55595F', 1)} />
      <rect x="105" y="82" width="5" height="26" rx="2" fill={STEEL} {...ln('#55595F', 1)} />
      <circle cx="108" cy="118" r="3" fill="#2B2D31" />
      <Gloss d="M60 18h10l-12 60v-40z" />
    </>
  ),
  cashbox: ({ s }) => (
    <>
      <Shadow y={170} rx={70} />
      <path d="M78 78a22 14 0 0 1 44 0" fill="none" {...ln(tone(STEEL).dark, 7)} />
      <path d="M78 78a22 14 0 0 1 44 0" fill="none" {...ln(STEEL, 4)} />
      <polygon points="34,90 54,78 172,78 160,90" fill={s.light} {...ln(s.dark, 1.4)} />
      <polygon points="160,90 172,78 172,150 160,164" fill={s.dark} />
      <rect x="34" y="90" width="126" height="74" rx="3" fill={s.base} {...ln(s.dark)} />
      <path d="M34 108h126" {...ln(s.dark, 1.4)} />
      <circle cx="97" cy="126" r="6" fill={STEEL} {...ln('#55595F', 1)} />
    </>
  ),
  keycabinet: ({ s }) => (
    <>
      <Shadow y={176} rx={60} />
      <rect x="46" y="26" width="108" height="146" rx="4" fill={s.base} {...ln(s.dark)} />
      <rect x="56" y="36" width="88" height="126" rx="2" fill={s.light} />
      {[60, 98, 136].map((y) =>
        [70, 92, 114, 136].map((x) => (
          <g key={`${x}${y}`}>
            <path d={`M${x} ${y - 8}v6`} {...ln('#55595F', 1.5)} />
            <circle cx={x} cy={y + 2} r="5" fill="none" {...ln(LABELS[(x + y) % 6], 2)} />
            <path d={`M${x} ${y + 7}v12M${x} ${y + 15}h4`} {...ln('#9C7A3C', 2)} />
          </g>
        )),
      )}
    </>
  ),
  basket: ({ m, type }) => {
    const w = tone(STEEL);
    return (
      <>
        <Shadow y={162} rx={80} />
        <path d="M52 62H182V128L160 150" fill="none" {...ln(w.dark, 2)} opacity="0.6" />
        <rect x="30" y="84" width="130" height="66" fill={w.light} opacity="0.35" />
        {type.includes('plate') && [0, 1, 2, 3, 4, 5].map((i) => <ellipse key={i} cx={60 + i * 16} cy="96" rx="5" ry="26" fill="#F7F7F5" {...ln('#B9B9B4', 1.4)} />)}
        {type.includes('bottle') && [0, 1, 2].map((i) => <path key={i} d={`M${60 + i * 34} 146v-50q0 -10 8 -14v-20h8v20q8 4 8 14v50z`} fill={LABELS[i]} opacity="0.85" />)}
        {type.includes('cup') && [0, 1, 2, 3].map((i) => <path key={i} d={`M${48 + i * 28} 104h20l-3 22h-14z`} fill="#F7F7F5" {...ln('#B9B9B4', 1.4)} />)}
        {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${40 + i * 10} 84v66`} {...ln(w.dark, 1.6)} />)}
        <path d="M30 84L52 62H182L160 84z" fill="none" {...ln(w.dark, 3)} />
        <path d="M160 84L182 62V128L160 150" fill="none" {...ln(w.dark, 3)} />
        <rect x="30" y="84" width="130" height="66" fill="none" {...ln(w.dark, 3.5)} />
        <path d="M30 118h130" {...ln(w.dark, 2.4)} />
      </>
    );
  },
  tray: () => (
    <>
      <Shadow y={160} rx={80} />
      <polygon points="20,112 60,62 186,62 160,112" fill="#E3E5E8" {...ln('#8E949A')} />
      <polygon points="20,112 160,112 160,130 20,130" fill="#C8CCD1" {...ln('#8E949A', 1.4)} />
      <polygon points="160,112 186,62 186,80 160,130" fill="#AEB3B9" {...ln('#8E949A', 1.4)} />
      {[0.25, 0.5, 0.75].map((k) => <path key={k} d={`M${20 + 140 * k} 112L${60 + 126 * k} 62`} {...ln('#8E949A', 2)} />)}
      <path d="M40 87h130" {...ln('#8E949A', 2)} />
    </>
  ),
  drawer: ({ m }) => (
    <>
      <Shadow y={164} rx={80} />
      <polygon points="26,96 60,66 184,66 150,96" fill="#5A5D62" />
      <polygon points="150,96 184,66 184,122 150,154" fill="#9AA0A6" {...ln('#5E6266', 1.4)} />
      <rect x="26" y="96" width="124" height="58" rx="2" fill="#ECE8E1" {...ln('#A79F92', 1.4)} />
      <rect x="62" y="118" width="52" height="7" rx="3" fill={m.base} {...ln(m.dark, 1.2)} />
    </>
  ),
  bin: () => (
    <>
      <Shadow y={178} rx={46} />
      <path d="M58 54h84l-8 120H66z" fill="#C8CCD1" {...ln('#6E757C')} />
      {[0, 1, 2, 3, 4].map((i) => <path key={i} d={`M${74 + i * 13} 64l-2 100`} {...ln('#9AA0A6', 1.4)} />)}
      <rect x="52" y="40" width="96" height="16" rx="6" fill="#4A4E54" />
      <rect x="88" y="30" width="24" height="10" rx="3" fill="#4A4E54" />
    </>
  ),
  shutter: ({ m }) => (
    <>
      <Shadow y={182} rx={56} />
      <rect x="48" y="16" width="104" height="166" rx="3" fill={m.base} {...ln(m.dark)} />
      <rect x="56" y="24" width="88" height="150" fill="#ECEFF2" />
      {Array.from({ length: 18 }, (_, i) => <path key={i} d={`M56 ${28 + i * 8}h88`} {...ln('#AEB4BB', 1.4)} />)}
      <rect x="56" y="160" width="88" height="14" fill={m.light} {...ln(m.dark, 1.2)} />
    </>
  ),
  mirror: ({ m }) => (
    <>
      <Shadow y={182} rx={44} />
      <rect x="64" y="16" width="72" height="166" rx="4" fill={m.base} {...ln(m.dark)} />
      <rect x="70" y="22" width="60" height="154" rx="2" fill="#D6E7EF" />
      <Gloss d="M80 22h14l-24 70v-34z" />
      <Gloss d="M110 22h6l-46 120v-16z" />
    </>
  ),
  rod: ({ m }) => (
    <>
      <Shadow y={170} rx={80} />
      <rect x="16" y="52" width="20" height="36" rx="4" fill={m.base} {...ln(m.dark)} />
      <rect x="164" y="52" width="20" height="36" rx="4" fill={m.base} {...ln(m.dark)} />
      {[62, 100, 138].map((x) => (
        <path key={x} d={`M${x} 70q8 0 6 -8M${x} 70l-30 40h60z`} fill="none" {...ln('#8C6A44', 3)} />
      ))}
      <rect x="22" y="62" width="156" height="14" rx="7" fill={m.base} {...ln(m.dark)} />
      <path d="M28 66h144" {...ln(m.light, 3)} opacity="0.7" />
    </>
  ),
  track: ({ m, category }) => {
    const glass = category.includes('glass');
    return (
      <>
        <Shadow y={180} rx={70} />
        <rect x="14" y="30" width="172" height="20" rx="4" fill={m.base} {...ln(m.dark)} />
        {[54, 106].map((x) => (
          <g key={x}>
            <rect x={x - 4} y="44" width="8" height="22" fill={m.dark} />
            <circle cx={x} cy="44" r="9" fill={m.light} {...ln(m.dark, 1.5)} />
          </g>
        ))}
        <rect x="32" y="62" width="96" height="114" rx="2" fill={glass ? '#CFE6EE' : '#D7C7AC'} opacity={glass ? 0.8 : 1} {...ln(glass ? '#7FA9C0' : '#9C8668', 1.4)} />
        {glass && <Gloss d="M50 62h14l-32 70v-34z" />}
      </>
    );
  },
  clamp: ({ m }) => (
    <>
      <Shadow y={180} rx={60} />
      <rect x="34" y="16" width="106" height="164" fill="#CFE6EE" opacity="0.75" {...ln('#7FA9C0', 1.4)} />
      <Gloss d="M50 16h16l-32 80v-38z" />
      <rect x="112" y="78" width="54" height="44" rx="8" fill={m.base} {...ln(m.dark)} />
      <path d="M118 84h42" {...ln(m.light, 3)} opacity="0.7" />
      <Screw x={128} y={108} m={m} r={5} />
      <Screw x={150} y={108} m={m} r={5} />
    </>
  ),
  spider: ({ m }) => (
    <>
      <Shadow y={180} rx={70} />
      <rect x="18" y="18" width="80" height="80" fill="#CFE6EE" opacity="0.75" {...ln('#7FA9C0', 1.2)} />
      <rect x="102" y="18" width="80" height="80" fill="#CFE6EE" opacity="0.75" {...ln('#7FA9C0', 1.2)} />
      <rect x="18" y="102" width="80" height="80" fill="#CFE6EE" opacity="0.75" {...ln('#7FA9C0', 1.2)} />
      <rect x="102" y="102" width="80" height="80" fill="#CFE6EE" opacity="0.75" {...ln('#7FA9C0', 1.2)} />
      {[[70, 70], [130, 70], [70, 130], [130, 130]].map(([x, y]) => (
        <g key={`${x}${y}`}>
          <path d={`M100 100L${x} ${y}`} {...ln(m.dark, 12)} />
          <path d={`M100 100L${x} ${y}`} {...ln(m.base, 8)} />
          <circle cx={x} cy={y} r="10" fill={m.light} {...ln(m.dark, 1.5)} />
        </g>
      ))}
      <circle cx="100" cy="100" r="16" fill={m.base} {...ln(m.dark)} />
    </>
  ),
  profile: ({ m }) => (
    <>
      <Shadow y={166} />
      <Bar m={m} />
    </>
  ),
  ledprofile: ({ m }) => (
    <>
      <Shadow y={166} />
      <Bar m={m} glow />
    </>
  ),
  ledstrip: ({ variant }) => {
    const glow = variant.includes('warm') ? '#FFD27A' : variant.includes('rgb') ? '#FF7AD9' : '#FFF4C2';
    return (
      <>
        <Shadow y={170} rx={70} />
        <circle cx="76" cy="84" r="50" fill="#F2F2F0" {...ln('#A9ABAE')} />
        <circle cx="76" cy="84" r="20" fill="#fff" {...ln('#A9ABAE')} />
        {[44, 38, 32].map((r) => <circle key={r} cx="76" cy="84" r={r} fill="none" {...ln('#C9CBCE', 1)} />)}
        <path d="M118 112q30 10 30 32t34 30" fill="none" {...ln('#E8E8E6', 12)} />
        <path d="M118 112q30 10 30 32t34 30" fill="none" {...ln(glow, 4)} strokeDasharray="4 6" />
      </>
    );
  },
  spot: ({ variant }) => (
    <>
      <Shadow y={160} rx={56} />
      <ellipse cx="100" cy="100" rx="64" ry="34" fill="#FFF3C4" opacity="0.5" />
      <path d="M58 92v18a42 18 0 0 0 84 0v-18" fill={variant.includes('black') ? '#2E2F33' : '#D9DCE0'} {...ln('#6E757C', 1.4)} />
      <ellipse cx="100" cy="92" rx="42" ry="18" fill={variant.includes('black') ? '#3C3D41' : '#EEF0F2'} {...ln('#6E757C', 1.4)} />
      <ellipse cx="100" cy="92" rx="26" ry="11" fill="#FFF8DC" />
    </>
  ),
  panel: () => (
    <>
      <Shadow y={160} rx={76} />
      <polygon points="20,104 100,62 180,104 100,146" fill="#FFF6D6" opacity="0.6" />
      <polygon points="30,104 100,68 170,104 100,140" fill="#E4E6E9" {...ln('#8E949A')} />
      <polygon points="40,104 100,74 160,104 100,134" fill="#FFFDF2" />
      <polygon points="30,104 100,140 100,146 30,110" fill="#C8CCD1" />
      <polygon points="100,140 170,104 170,110 100,146" fill="#AEB3B9" />
    </>
  ),
  driver: () => (
    <>
      <Shadow y={150} rx={80} />
      <path d="M40 100q-14 0 -22 14M40 108q-10 4 -16 18" fill="none" {...ln('#C0392B', 3)} />
      <path d="M160 100q14 0 22 14M160 108q10 4 16 18" fill="none" {...ln('#222', 3)} />
      <rect x="38" y="74" width="124" height="56" rx="6" fill="#C9CDD2" {...ln('#6E757C')} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${48 + i * 11} 80v44`} {...ln('#A4AAB1', 2)} />)}
      <rect x="70" y="90" width="60" height="22" rx="2" fill="#fff" {...ln('#6E757C', 1)} />
      <path d="M78 98h44M78 104h30" {...ln('#9AA0A6', 2)} />
    </>
  ),
  tube: ({ label }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-20 100 100)">
      <path d="M40 80h96l14 6v28l-14 6H40l-6 -4V84z" fill="#F4F4F2" {...ln('#A2A4A8')} />
      <rect x="62" y="84" width="58" height="32" rx="2" fill={label} />
      <path d="M70 94h40M70 104h28" {...ln('#fff', 3)} opacity="0.85" />
      <rect x="150" y="90" width="16" height="20" rx="2" fill="#E2E3E5" {...ln('#A2A4A8', 1.4)} />
      <path d="M166 96l20 4l-20 4z" fill="#E2E3E5" {...ln('#A2A4A8', 1.4)} />
      <rect x="24" y="82" width="12" height="36" rx="2" fill="#D0D2D5" {...ln('#A2A4A8', 1.4)} />
      </g>
    </>
  ),
  gluestick: () => (
    <>
      <Shadow y={160} rx={70} />
      {[0, 1, 2].map((i) => (
        <g key={i} transform={`rotate(-18 100 ${80 + i * 22})`}>
          <rect x="30" y={70 + i * 22} width="140" height="16" rx="8" fill="#F3EEDC" opacity="0.9" {...ln('#C5BA97', 1.4)} />
          <path d={`M40 ${74 + i * 22}h118`} {...ln('#fff', 2)} opacity="0.8" />
        </g>
      ))}
    </>
  ),
  can: ({ label, variant, plain }) => {
    const h = variant.startsWith('5') ? 128 : variant.startsWith('1') ? 108 : 88;
    const top = 172 - h;
    return (
      <>
        <Shadow y={174} rx={48} />
        <path d={`M56 ${top}v${h}a44 10 0 0 0 88 0v-${h}`} fill="#C9CDD2" {...ln('#6E757C')} />
        <rect x="56" y={top + h * 0.22} width="88" height={h * 0.56} fill={label} />
        {!plain && <path d={`M68 ${top + h * 0.4}h52M68 ${top + h * 0.52}h34`} {...ln('#fff', 4)} opacity="0.85" />}
        <ellipse cx="100" cy={top} rx="44" ry="10" fill="#E2E5E8" {...ln('#6E757C')} />
        <ellipse cx="100" cy={top} rx="34" ry="6" fill="none" {...ln('#9AA0A6', 1.4)} />
        <Gloss d={`M62 ${top + 6}h8v${h - 4}h-8z`} />
      </>
    );
  },
  tub: ({ label, variant, plain }) => {
    const big = variant.startsWith('5');
    return (
      <>
        <Shadow y={174} rx={54} />
        {big && <path d="M52 64q48 -50 96 0" fill="none" {...ln('#6E757C', 3)} />}
        <path d="M50 62h100l-8 110H58z" fill="#F4F4F2" {...ln('#A2A4A8')} />
        <path d="M54 92h92l-4 50H58z" fill={label} />
        {!plain && <path d="M70 110h50M70 124h32" {...ln('#fff', 4)} opacity="0.85" />}
        <rect x="44" y="52" width="112" height="14" rx="4" fill={label} {...ln(mix(label, '#000000', 0.3), 1.4)} />
      </>
    );
  },
  screw: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-35 100 100)">
      <path d="M38 82h10v36H38a18 18 0 0 1 0 -36z" fill={m.base} {...ln(m.dark)} />
      <path d="M30 96h10M35 91v10" {...ln(m.dark, 2)} />
      <path d="M48 92h104l20 8l-20 8H48z" fill={m.light} {...ln(m.dark, 1.5)} />
      {Array.from({ length: 11 }, (_, i) => <path key={i} d={`M${56 + i * 10} 90l-6 20`} {...ln(m.dark, 1.5)} />)}
      </g>
    </>
  ),
  nail: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-35 100 100)">
      <rect x="30" y="80" width="8" height="40" rx="2" fill={m.base} {...ln(m.dark)} />
      <path d="M38 96h120l16 4l-16 4H38z" fill={m.light} {...ln(m.dark, 1.5)} />
      </g>
    </>
  ),
  plug: () => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-30 100 100)">
      <path d="M40 84h104l20 16l-20 16H40z" fill="#CFD8E3" {...ln('#6F86A3')} />
      {Array.from({ length: 8 }, (_, i) => <path key={i} d={`M${58 + i * 12} 84v32`} {...ln('#6F86A3', 1.5)} />)}
      <rect x="30" y="80" width="12" height="40" rx="3" fill="#B6C4D5" {...ln('#6F86A3')} />
      </g>
    </>
  ),
  anchor: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-30 100 100)">
      <path d="M50 92h130v16H50z" fill={m.light} {...ln(m.dark, 1.5)} />
      {Array.from({ length: 10 }, (_, i) => <path key={i} d={`M${86 + i * 9} 92l-4 16`} {...ln(m.dark, 1.4)} />)}
      <rect x="60" y="86" width="60" height="28" rx="3" fill={m.base} {...ln(m.dark)} />
      <path d="M100 86l-6 28" {...ln(m.dark, 2)} />
      <rect x="44" y="82" width="14" height="36" rx="2" fill={m.base} {...ln(m.dark)} />
      <path d="M30 84h12l4 8v16l-4 8H30l-4 -8V92z" fill={m.light} {...ln(m.dark)} />
      </g>
    </>
  ),
  minifix: ({ m }) => (
    <>
      <Shadow y={160} rx={70} />
      <g transform="rotate(-20 120 100)">
        <rect x="96" y="92" width="80" height="14" rx="3" fill={m.light} {...ln(m.dark, 1.5)} />
        {Array.from({ length: 5 }, (_, i) => <path key={i} d={`M${130 + i * 9} 92l-4 14`} {...ln(m.dark, 1.4)} />)}
        <circle cx="96" cy="99" r="8" fill={m.base} {...ln(m.dark)} />
      </g>
      <circle cx="62" cy="112" r="34" fill={m.base} {...ln(m.dark)} />
      <circle cx="62" cy="112" r="24" fill={m.light} {...ln(m.dark, 1.4)} />
      <path d="M50 112h24M62 100v24" {...ln(m.dark, 4)} />
    </>
  ),
  boltnut: ({ m }) => (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-30 100 100)">
      <path d="M56 90h120v20H56z" fill={m.light} {...ln(m.dark, 1.5)} />
      {Array.from({ length: 12 }, (_, i) => <path key={i} d={`M${66 + i * 9} 90l-5 20`} {...ln(m.dark, 1.4)} />)}
      <path d="M28 78h22l8 22l-8 22H28l-8 -22z" fill={m.base} {...ln(m.dark)} />
      <path d="M124 80h18l6 20l-6 20h-18l-6 -20z" fill={m.base} {...ln(m.dark)} />
      </g>
    </>
  ),
};

// ---------- one picture per product type ----------
// Product types that share a drawing above get their own here: a different shape, different contents, or the grade
// printed on the sheet the way the trade stamps it. Matched against the product type (lower case); first match wins.

const GLASS = '#CFE6EE';
const Glass = ({ x, y, w, h }) => (
  <>
    <rect x={x} y={y} width={w} height={h} fill={GLASS} opacity="0.8" {...ln('#7FA9C0', 1.2)} />
    <path d={`M${x + w * 0.2} ${y}h${w * 0.14}l${-w * 0.34} ${h * 0.45}v${-h * 0.25}z`} fill="#fff" opacity="0.4" />
  </>
);
const Label = ({ x, y, w, text, size = 9, color = '#fff' }) => (
  <text x={x + w / 2} y={y} fontSize={Math.min(size, (w / Math.max(text.length, 1)) * 1.7)} fontWeight="700" textAnchor="middle" fill={color} fontFamily="Arial, sans-serif" letterSpacing="0.3">
    {text}
  </text>
);
// the grade printed on a sheet's face, following its slant
const Stamp = ({ text, color = '#5B3B8C', dy = 0 }) => (
  <text transform={`matrix(0.963 -0.27 0.82 0.57 101 ${98 + dy})`} fontSize={Math.min(13, 150 / Math.max(text.length, 1))} fontWeight="800" textAnchor="middle" fill={color} opacity="0.8" fontFamily="Arial, sans-serif" letterSpacing="0.5">
    {text}
  </text>
);
const Key = ({ x, y, rot = 0 }) => (
  <g transform={`rotate(${rot} ${x} ${y})`}>
    <rect x={x} y={y - 3} width="34" height="6" rx="2" fill="#C9A54A" {...ln('#8C6E22', 1)} />
    <path d={`M${x + 22} ${y + 3}v5h4v-5M${x + 28} ${y + 3}v4`} {...ln('#8C6E22', 1.6)} />
    <circle cx={x - 6} cy={y} r="10" fill="#C9A54A" {...ln('#8C6E22', 1.2)} />
    <circle cx={x - 9} cy={y} r="3" fill="#fff" />
  </g>
);
const Basket = ({ x = 30, y = 84, w = 130, h = 66, d = 22, wires = 10 }) => {
  const c = tone(STEEL).dark;
  return (
    <>
      <path d={`M${x} ${y}l${d} ${-d}h${w}v${h}l${-d} ${d}M${x + w} ${y}l${d} ${-d}`} fill="none" {...ln(c, 3)} />
      {Array.from({ length: Math.floor(w / wires) }, (_, i) => <path key={i} d={`M${x + 10 + i * wires} ${y}v${h}`} {...ln(c, 1.5)} />)}
      <rect x={x} y={y} width={w} height={h} fill="none" {...ln(c, 3.5)} />
    </>
  );
};
const Cloth = ({ x, y, w, h, c }) => <path d={`M${x} ${y}h${w}l${w * 0.08} ${h}h${-w * 1.16}z`} fill={c} {...ln(mix(c, '#000000', 0.3), 1)} />;
// a fastener: head style, shank colour and length vary by type
const Fastener = ({ head, color, len = 112, thick = 16, tip = 20 }) => {
  const f = tone(color);
  return (
    <>
      <Shadow y={150} rx={70} />
      <g transform="rotate(-35 100 100)">
        {head === 'bugle' && <path d="M30 80h6l12 16v8l-12 16h-6z" fill={f.base} {...ln(f.dark)} />}
        {head === 'pan' && <path d="M48 82v36h-6a14 18 0 0 1 0 -36z" fill={f.base} {...ln(f.dark)} />}
        {head === 'flat' && <path d="M38 82h10v36H38a18 18 0 0 1 0 -36z" fill={f.base} {...ln(f.dark)} />}
        {head === 'hex' && <path d="M30 80h16l4 6v28l-4 6H30z" fill={f.base} {...ln(f.dark)} />}
        {head !== 'hex' && <path d="M32 96h10M37 91v10" {...ln(f.dark, 2)} />}
        <path d={`M48 ${100 - thick / 2}h${len}l${tip} ${thick / 2}l${-tip} ${thick / 2}H48z`} fill={f.light} {...ln(f.dark, 1.5)} />
        {Array.from({ length: Math.floor(len / 10) }, (_, i) => <path key={i} d={`M${58 + i * 10} ${100 - thick / 2 - 2}l-6 ${thick + 4}`} {...ln(f.dark, 1.5)} />)}
      </g>
    </>
  );
};

const VARIANTS = [
  // --- boards & doors ---
  [/flexible plywood/, ({ s }) => (
    <>
      <Shadow y={162} rx={74} />
      <path d="M24 150Q60 40 176 52l4 10Q70 56 34 154z" fill="#E2C79A" {...ln('#9C7A4C', 1.4)} />
      <path d="M24 150Q60 40 176 52" fill="none" {...ln(s.dark, 1)} />
      <path d="M34 154Q70 56 180 62" fill="none" {...ln(s.dark, 1)} />
      {[0, 1, 2, 3].map((i) => <path key={i} d={`M${40 + i * 30} ${130 - i * 18}q30 -20 70 -30`} fill="none" {...ln('#9C7A4C', 1)} opacity="0.3" />)}
      <path d="M24 150l10 4" {...ln('#9C7A4C', 2)} />
      <text x="96" y="160" fontSize="11" fontWeight="800" textAnchor="middle" fill="#5B3B8C" opacity="0.8" fontFamily="Arial, sans-serif">FLEXIBLE</text>
    </>
  )],
  [/shuttering plywood/, ({ id, t }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face="#5A3A26" edge="#C9A46E" t={t} layers={5} shift={[6, -16]} />
      <Slab id={id} face="#6B4530" edge="#C9A46E" t={t} layers={5} pattern="gloss" />
      <Stamp text="SHUTTERING" color="#F2D9A6" />
    </>
  )],
  [/^flush door/, () => (
    <>
      <Shadow y={180} rx={50} />
      <polygon points="140,20 148,26 148,182 140,180" fill="#BFA27A" />
      <rect x="60" y="20" width="80" height="160" fill="#E4CFA8" {...ln('#A68B62', 1.4)} />
      <path d="M60 20h80v6H60zM60 174h80v6H60z" fill="#C9AE84" />
      <text x="100" y="104" fontSize="9" fontWeight="800" textAnchor="middle" fill="#5B3B8C" opacity="0.7" fontFamily="Arial, sans-serif">FLUSH DOOR</text>
    </>
  )],
  [/wpc door$/, () => (
    <>
      <Shadow y={180} rx={50} />
      <polygon points="140,20 148,26 148,182 140,180" fill="#B9AC97" />
      <rect x="60" y="20" width="80" height="160" fill="#ECE4D6" {...ln('#A79C88', 1.4)} />
      {[52, 84, 116, 148].map((y) => <path key={y} d={`M68 ${y}h64`} {...ln('#A79C88', 2.5)} />)}
      <rect x="124" y="94" width="6" height="18" rx="2" fill={STEEL} {...ln('#6E757C', 1)} />
      <rect x="118" y="98" width="14" height="4" rx="2" fill={STEEL} {...ln('#6E757C', 1)} />
    </>
  )],
  [/laminated flush door/, () => (
    <>
      <Shadow y={180} rx={50} />
      <polygon points="140,20 148,26 148,182 140,180" fill="#4A3020" />
      <rect x="60" y="20" width="80" height="160" fill="#6A4630" {...ln('#3F291B', 1.4)} />
      {[0, 1, 2, 3, 4, 5].map((i) => <path key={i} d={`M${66 + i * 12} 24q3 70 0 152`} fill="none" {...ln('#3F291B', 1.2)} opacity="0.5" />)}
      <rect x="124" y="80" width="5" height="44" rx="2" fill="#2E2F33" />
    </>
  )],
  // --- floors & wall panels ---
  [/spc flooring/, ({ id, s }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#9EA3A6" t={6} pattern="planks" />
      <Stamp text="SPC" color="#fff" dy={4} />
    </>
  )],
  [/vinyl plank/, ({ id, s }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#3A3A3C" t={3} pattern="planks" />
      <path d="M174 96q10 10 -2 26l-6 -4q8 -12 0 -18z" fill={s.base} {...ln(s.dark, 1.2)} />
    </>
  )],
  [/engineered wood/, ({ id, s }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#D9B98A" t={14} layers={5} pattern="planks" />
    </>
  )],
  [/laminate flooring/, ({ id, s, type }) => (
    <>
      <Shadow y={150} rx={74} />
      <Slab id={id} face={s.base} edge="#8C6A4A" t={type.includes('12') ? 11 : 7} pattern="planks" />
      <Stamp text={type.includes('12') ? '12 MM' : '8 MM'} color="#fff" dy={4} />
    </>
  )],
  [/wooden slat panel/, ({ s }) => (
    <>
      <Shadow />
      <rect x="50" y="24" width="100" height="150" fill="#5C5F63" />
      {Array.from({ length: 100 }, (_, i) => <circle key={i} cx={52 + ((i * 37) % 96)} cy={28 + ((i * 53) % 142)} r="0.8" fill="#7A7D82" />)}
      {Array.from({ length: 7 }, (_, i) => (
        <g key={i}>
          <rect x={54 + i * 14} y="24" width="10" height="150" rx="1" fill={s.base} {...ln(s.dark, 0.8)} />
          <path d={`M${57 + i * 14} 30q1 60 0 138`} fill="none" {...ln(s.dark, 0.8)} opacity="0.4" />
        </g>
      ))}
    </>
  )],
  [/charcoal louvers/, ({ s }) => (
    <>
      <Shadow />
      <rect x="50" y="24" width="100" height="150" fill="#1E1F21" />
      {Array.from({ length: 10 }, (_, i) => (
        <g key={i}>
          <rect x={51 + i * 10} y="24" width="8" height="150" rx="4" fill={s.base} />
          <rect x={52 + i * 10} y="24" width="2" height="150" fill={s.light} opacity="0.6" />
        </g>
      ))}
    </>
  )],
  [/pvc wall panel/, ({ s }) => (
    <>
      <Shadow />
      {[0, 1, 2].map((i) => (
        <g key={i}>
          <rect x={44 + i * 38} y="22" width="36" height="152" fill={s.base} {...ln(s.dark, 1.2)} />
          <path d={`M${80 + i * 38} 22v152`} {...ln(s.dark, 2.5)} opacity="0.5" />
          <path d={`M${50 + i * 38} 30l14 -8`} {...ln('#fff', 4)} opacity="0.4" />
        </g>
      ))}
    </>
  )],
  // --- door hardware ---
  [/ball bearing hinge/, (ctx) => {
    const { m } = ctx;
    return (
      <>
        {DRAW.hinge(ctx)}
        {[66, 134].map((y) => <rect key={y} x="89" y={y - 4} width="22" height="8" rx="3" fill={mix(m.base, '#C9A54A', 0.5)} {...ln(m.dark, 1.2)} />)}
      </>
    );
  }],
  [/shower hinge/, ({ m }) => (
    <>
      <Shadow y={176} rx={60} />
      <Glass x={92} y={16} w={86} h={164} />
      <rect x="20" y="16" width="20" height="164" fill="#E8E2D8" {...ln('#B5AC9D', 1.2)} />
      <rect x="36" y="64" width="44" height="64" rx="6" fill={m.base} {...ln(m.dark)} />
      <rect x="80" y="64" width="44" height="64" rx="6" fill={m.base} {...ln(m.dark)} />
      <rect x="74" y="58" width="12" height="76" rx="6" fill={m.light} {...ln(m.dark)} />
      <Screw x={100} y={84} m={m} r={5} />
      <Screw x={100} y={108} m={m} r={5} />
    </>
  )],
  [/lever handle on rose/, ({ m }) => (
    <>
      <Shadow y={150} rx={56} />
      <circle cx="80" cy="96" r="34" fill={m.base} {...ln(m.dark)} />
      <circle cx="80" cy="96" r="24" fill={m.light} opacity="0.6" />
      <rect x="72" y="86" width="104" height="20" rx="10" fill={m.base} {...ln(m.dark)} />
      <path d="M84 91h86" {...ln(m.light, 3)} opacity="0.7" />
      <circle cx="80" cy="96" r="15" fill={m.light} {...ln(m.dark)} />
    </>
  )],
  [/window handle/, ({ m }) => (
    <>
      <Shadow y={182} rx={36} />
      <rect x="78" y="22" width="44" height="64" rx="12" fill={m.base} {...ln(m.dark)} />
      <rect x="90" y="48" width="20" height="132" rx="10" fill={m.base} {...ln(m.dark)} />
      <path d="M95 60v110" {...ln(m.light, 3)} opacity="0.7" />
      <circle cx="100" cy="52" r="15" fill={m.light} {...ln(m.dark)} />
    </>
  )],
  [/handle lock set/, (ctx) => {
    const { m } = ctx;
    return (
      <>
        {DRAW.lever(ctx)}
        <rect x="16" y="56" width="52" height="96" rx="6" fill="#8E949A" {...ln('#4E5358')} />
        <rect x="62" y="50" width="8" height="108" rx="2" fill={m.base} {...ln(m.dark, 1.4)} />
        <circle cx="40" cy="80" r="6" fill="#3A3D40" />
        <circle cx="40" cy="118" r="8" fill="#3A3D40" />
        <rect x="36" y="118" width="8" height="16" fill="#3A3D40" />
      </>
    );
  }],
  [/sliding door handle/, ({ m }) => (
    <>
      <Shadow y={180} rx={40} />
      <rect x="66" y="24" width="68" height="152" rx="34" fill={m.base} {...ln(m.dark)} />
      <rect x="78" y="38" width="44" height="124" rx="22" fill={m.dark} />
      <path d="M84 50q-4 50 0 100" fill="none" {...ln(m.light, 3)} opacity="0.4" />
      <Gloss d="M72 50h6v100h-6z" />
    </>
  )],
  [/glass door handle/, (ctx) => (
    <>
      <Glass x={14} y={14} w={118} h={172} />
      {DRAW.pull(ctx)}
    </>
  )],
  [/door magnet/, ({ m }) => (
    <>
      <Shadow y={150} rx={74} />
      <ellipse cx="40" cy="100" rx="14" ry="30" fill={m.base} {...ln(m.dark)} />
      <rect x="40" y="86" width="56" height="28" fill={m.base} />
      <path d="M40 86h56M40 114h56" {...ln(m.dark)} />
      <ellipse cx="96" cy="100" rx="7" ry="14" fill="#2C2C2E" />
      <rect x="134" y="70" width="18" height="60" rx="3" fill={m.base} {...ln(m.dark)} />
      <rect x="120" y="88" width="16" height="24" rx="4" fill={m.light} {...ln(m.dark, 1.4)} />
      <path d="M104 92q6 8 0 16M110 88q9 12 0 24" fill="none" {...ln('#C0392B', 1.6)} />
    </>
  )],
  [/glass floor spring/, (ctx) => (
    <>
      {DRAW.floorspring(ctx)}
      <Glass x={62} y={14} w={70} h={86} />
      <rect x="60" y="88" width="30" height="16" rx="3" fill={ctx.m.base} {...ln(ctx.m.dark, 1.4)} />
    </>
  )],
  [/cable manager/, () => (
    <>
      <Shadow y={186} rx={40} />
      <path d="M100 20q20 80 0 160" fill="none" {...ln('#2F6DB5', 3)} />
      <path d="M104 20q20 80 0 160" fill="none" {...ln('#B5452F', 3)} />
      <path d="M96 20q20 80 0 160" fill="none" {...ln('#2F8A57', 3)} />
      {Array.from({ length: 11 }, (_, i) => {
        const y = 22 + i * 15, x = 100 + Math.sin((i / 10) * Math.PI) * 15;
        return <rect key={i} x={x - 18} y={y} width="36" height="12" rx="4" fill="#2E2F33" opacity="0.92" />;
      })}
      <rect x="70" y="174" width="60" height="10" rx="3" fill="#3A3B3E" />
    </>
  )],
  // --- locks ---
  [/cylindrical lock/, ({ m }) => (
    <>
      <Shadow y={170} rx={56} />
      <rect x="110" y="88" width="66" height="24" rx="3" fill={m.dark} />
      <rect x="168" y="80" width="10" height="40" rx="2" fill={m.base} {...ln(m.dark, 1.4)} />
      <ellipse cx="96" cy="100" rx="22" ry="44" fill={m.base} {...ln(m.dark)} />
      <circle cx="84" cy="100" r="44" fill={m.base} {...ln(m.dark)} />
      <circle cx="72" cy="86" r="14" fill={m.light} opacity="0.7" />
      <rect x="81" y="88" width="6" height="22" rx="3" fill={m.dark} />
    </>
  )],
  [/main door lock/, ({ m }) => (
    <>
      <Shadow y={170} rx={66} />
      <rect x="150" y="66" width="28" height="14" rx="2" fill={STEEL} {...ln('#6E757C', 1.4)} />
      <rect x="150" y="96" width="28" height="14" rx="2" fill={STEEL} {...ln('#6E757C', 1.4)} />
      <rect x="30" y="34" width="124" height="128" rx="10" fill={m.base} {...ln(m.dark)} />
      <Gloss d="M38 42h10v112h-10z" />
      <circle cx="92" cy="76" r="22" fill={m.light} {...ln(m.dark)} />
      <rect x="88" y="62" width="8" height="28" rx="3" fill={m.dark} />
      <circle cx="92" cy="126" r="8" fill={m.dark} />
      <path d="M88 128l-3 20h14l-3 -20z" fill={m.dark} />
    </>
  )],
  [/rim lock/, ({ m }) => (
    <>
      <Shadow y={160} rx={74} />
      <rect x="22" y="64" width="116" height="84" rx="6" fill="#55605A" {...ln('#2E3530')} />
      <rect x="146" y="70" width="32" height="72" rx="4" fill="#55605A" {...ln('#2E3530')} />
      <rect x="136" y="84" width="16" height="14" fill={m.base} {...ln(m.dark, 1.4)} />
      <circle cx="58" cy="106" r="16" fill={m.base} {...ln(m.dark)} />
      <rect x="54" y="96" width="8" height="20" rx="3" fill={m.dark} />
      <circle cx="106" cy="122" r="6" fill={m.dark} />
    </>
  )],
  [/glass door lock/, ({ m }) => (
    <>
      <Shadow y={172} rx={66} />
      <Glass x={28} y={14} w={144} h={120} />
      <rect x="60" y="112" width="80" height="54" rx="6" fill={m.base} {...ln(m.dark)} />
      <path d="M66 118h68" {...ln(m.light, 3)} opacity="0.7" />
      <circle cx="100" cy="140" r="10" fill={m.light} {...ln(m.dark, 1.4)} />
      <rect x="97" y="132" width="6" height="16" rx="2" fill={m.dark} />
    </>
  )],
  [/shutter lock/, ({ m }) => (
    <>
      <Shadow y={150} rx={84} />
      <rect x="14" y="94" width="20" height="14" rx="3" fill={STEEL} {...ln('#6E757C', 1.4)} />
      <rect x="166" y="94" width="20" height="14" rx="3" fill={STEEL} {...ln('#6E757C', 1.4)} />
      <rect x="30" y="78" width="140" height="46" rx="10" fill={m.base} {...ln(m.dark)} />
      <path d="M40 86h120" {...ln(m.light, 4)} opacity="0.7" />
      <circle cx="100" cy="104" r="12" fill={m.light} {...ln(m.dark, 1.4)} />
      <rect x="97" y="96" width="6" height="16" rx="2" fill={m.dark} />
    </>
  )],
  [/night latch/, ({ m }) => (
    <>
      <Shadow y={160} rx={70} />
      <rect x="40" y="56" width="104" height="90" rx="8" fill="#ECE6D8" {...ln('#A79F92')} />
      <rect x="144" y="84" width="22" height="22" rx="2" fill={m.base} {...ln(m.dark, 1.4)} />
      <path d="M166 86h10l-10 18z" fill={m.light} {...ln(m.dark, 1.4)} />
      <circle cx="92" cy="100" r="18" fill={m.base} {...ln(m.dark)} />
      <rect x="74" y="96" width="36" height="8" rx="4" fill={m.dark} />
      <rect x="52" y="126" width="22" height="10" rx="3" fill={m.base} {...ln(m.dark, 1.2)} />
    </>
  )],
  [/drawer lock/, ({ m }) => (
    <>
      <Shadow y={160} rx={60} />
      <rect x="70" y="62" width="70" height="76" rx="4" fill={m.dark} />
      <rect x="132" y="50" width="14" height="30" rx="2" fill={tone(STEEL).base} {...ln(tone(STEEL).dark, 1.4)} />
      <rect x="44" y="76" width="54" height="54" rx="8" fill={m.base} {...ln(m.dark)} />
      <circle cx="71" cy="103" r="15" fill={m.light} {...ln(m.dark, 1.4)} />
      <Key x={110} y={140} rot={-10} />
    </>
  )],
  [/almirah lock/, ({ m }) => (
    <>
      <Shadow y={184} rx={40} />
      <rect x="78" y="16" width="44" height="168" rx="6" fill={m.base} {...ln(m.dark)} />
      <rect x="86" y="40" width="28" height="70" rx="12" fill="none" {...ln(m.dark, 6)} />
      <circle cx="100" cy="140" r="12" fill={m.light} {...ln(m.dark, 1.4)} />
      <rect x="97" y="132" width="6" height="16" rx="2" fill={m.dark} />
    </>
  )],
  [/furniture lock/, ({ m }) => (
    <>
      <Shadow y={170} rx={50} />
      <rect x="92" y="20" width="16" height="70" rx="3" fill={tone(STEEL).base} {...ln(tone(STEEL).dark, 1.4)} />
      <rect x="64" y="70" width="72" height="80" rx="6" fill={m.dark} />
      <circle cx="100" cy="110" r="30" fill={m.base} {...ln(m.dark)} />
      <circle cx="100" cy="110" r="18" fill={m.light} {...ln(m.dark, 1.4)} />
      <Key x={118} y={150} rot={30} />
    </>
  )],
  [/smart wi-fi/, (ctx) => (
    <>
      {DRAW.digitallock(ctx)}
      <circle cx="100" cy="114" r="7" fill="#1A1B1E" {...ln('#9FD3FF', 1)} />
      {[14, 22, 30].map((r) => <path key={r} d={`M${150 - r * 0.7} ${44 - r * 0.7}a${r} ${r} 0 0 1 ${r * 1.4} 0`} fill="none" {...ln('#2F6DB5', 3)} />)}
      <circle cx="150" cy="46" r="3" fill="#2F6DB5" />
    </>
  )],
  [/soft-close hinge/, (ctx) => (
    <>
      {DRAW.cuphinge(ctx)}
      <rect x="92" y="78" width="40" height="14" rx="7" fill="#4A4C50" {...ln('#222', 1.2)} />
    </>
  )],
  // --- furniture fittings ---
  [/under-mount/, ({ m }) => (
    <>
      <Shadow y={150} rx={84} />
      <polygon points="24,90 60,60 186,60 150,90" fill="#EDE6DA" {...ln('#A79F92', 1.4)} />
      <rect x="24" y="90" width="126" height="10" fill="#D9CFBE" {...ln('#A79F92', 1.2)} />
      <rect x="20" y="104" width="134" height="14" rx="3" fill={m.base} {...ln(m.dark)} />
      <rect x="60" y="108" width="126" height="10" rx="3" fill={m.light} {...ln(m.dark)} />
      <rect x="22" y="100" width="18" height="22" rx="4" fill="#E36B2C" />
    </>
  )],
  [/keyboard tray/, ({ m }) => (
    <>
      <Shadow y={160} rx={84} />
      <polygon points="30,110 58,70 176,70 150,110" fill="#2E2F33" />
      {Array.from({ length: 24 }, (_, i) => <rect key={i} x={58 + (i % 8) * 11 - Math.floor(i / 8) * 7} y={78 + Math.floor(i / 8) * 9} width="8" height="6" rx="1" fill="#D9DCE0" />)}
      <rect x="30" y="110" width="120" height="8" fill="#1E1F21" />
      <rect x="20" y="124" width="140" height="10" rx="3" fill={m.base} {...ln(m.dark, 1.4)} />
    </>
  )],
  [/sofa leg/, () => (
    <>
      <Shadow y={170} rx={30} />
      <rect x="64" y="40" width="72" height="12" rx="3" fill="#B8BEC5" {...ln('#6E757C')} />
      <path d="M76 52h48l-12 100h-24z" fill="#7A5233" {...ln('#4A3020')} />
      <path d="M86 56l4 90" {...ln('#A57A52', 4)} opacity="0.7" />
      <path d="M88 140h24l-1 18h-22z" fill="#C9A54A" {...ln('#8C6E22', 1.4)} />
    </>
  )],
  [/cabinet leg/, () => (
    <>
      <Shadow y={174} rx={44} />
      <rect x="58" y="24" width="84" height="16" rx="3" fill="#2E2F33" />
      <rect x="80" y="40" width="40" height="88" rx="4" fill="#3A3B3E" />
      <path d="M86 46v76" {...ln('#5A5C60', 4)} />
      <rect x="94" y="128" width="12" height="22" fill="#9AA0A6" />
      {[132, 138, 144].map((y) => <path key={y} d={`M94 ${y}h12`} {...ln('#6E757C', 1)} />)}
      <ellipse cx="100" cy="158" rx="30" ry="9" fill="#2E2F33" />
    </>
  )],
  [/hydraulic bed lift/, ({ m }) => (
    <>
      <Shadow y={168} rx={84} />
      <rect x="16" y="146" width="168" height="12" rx="3" fill={m.base} {...ln(m.dark)} />
      <path d="M30 140L176 70" {...ln(m.dark, 12)} />
      <path d="M30 140L176 70" {...ln(m.base, 7)} />
      <path d="M70 146L120 96" {...ln(m.dark, 9)} />
      <path d="M70 146L120 96" {...ln(m.base, 5)} />
      <g transform="rotate(-38 118 130)">
        <rect x="80" y="122" width="50" height="16" rx="5" fill="#35373B" />
        <rect x="128" y="127" width="36" height="6" fill={STEEL} />
      </g>
      {[[30, 140], [70, 146], [120, 96]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill={m.light} {...ln(m.dark, 1.4)} />)}
    </>
  )],
  [/lift-up flap/, () => (
    <>
      <Shadow y={176} rx={70} />
      <rect x="36" y="96" width="128" height="76" fill="#F2EEE7" {...ln('#A79F92', 1.6)} />
      <rect x="44" y="104" width="112" height="64" fill="#DCD5C9" />
      <polygon points="36,96 164,96 150,40 50,40" fill="#E9E2D6" {...ln('#A79F92', 1.6)} />
      <rect x="48" y="110" width="22" height="34" rx="3" fill="#9AA0A6" {...ln('#5E6266', 1.2)} />
      <path d="M60 112L72 66" {...ln('#5E6266', 5)} />
      <circle cx="60" cy="114" r="4" fill="#5E6266" />
    </>
  )],
  [/shelf support/, ({ m }) => (
    <>
      <Shadow y={150} rx={60} />
      {[[60, 70], [120, 104]].map(([x, y]) => (
        <g key={x}>
          <path d={`M${x} ${y}h14v34h28v12H${x}z`} fill={m.base} {...ln(m.dark)} />
          <rect x={x - 14} y={y + 12} width="16" height="8" rx="4" fill={m.light} {...ln(m.dark, 1.4)} />
        </g>
      ))}
    </>
  )],
  [/glass shelf bracket/, ({ m }) => (
    <>
      <Shadow y={150} rx={74} />
      <polygon points="40,94 70,74 186,74 156,94" fill={GLASS} opacity="0.85" {...ln('#7FA9C0', 1.4)} />
      <rect x="40" y="94" width="116" height="6" fill="#A9D0DE" {...ln('#7FA9C0', 1)} />
      <rect x="18" y="64" width="26" height="60" rx="5" fill={m.base} {...ln(m.dark)} />
      <path d="M44 84h22v26H44" fill={m.light} {...ln(m.dark)} />
      <Screw x={31} y={76} m={m} />
      <Screw x={31} y={112} m={m} />
    </>
  )],
  [/tie & belt/, ({ m }) => (
    <>
      <Shadow y={176} rx={74} />
      <rect x="20" y="30" width="160" height="14" rx="5" fill={m.base} {...ln(m.dark)} />
      {[['#B5452F', 36], ['#2F6DB5', 64], ['#2F8A57', 92], ['#C7861F', 120], ['#6B4AA0', 148]].map(([c, x]) => (
        <g key={x}>
          <path d={`M${x + 8} 44v8`} {...ln(m.dark, 2)} />
          <path d={`M${x} 52h16l-2 98l-6 10l-6 -10z`} fill={c} {...ln(mix(c, '#000000', 0.3), 1)} />
        </g>
      ))}
    </>
  )],
  [/jewellery drawer/, () => (
    <>
      <Shadow y={160} rx={80} />
      <polygon points="20,112 60,62 186,62 160,112" fill="#6B1E2E" {...ln('#3E0F19')} />
      <polygon points="20,112 160,112 160,128 20,128" fill="#4E1520" />
      {[0.33, 0.66].map((k) => <path key={k} d={`M${20 + 140 * k} 112L${60 + 126 * k} 62`} {...ln('#3E0F19', 3)} />)}
      <path d="M40 87h130" {...ln('#3E0F19', 3)} />
      {[[62, 76], [78, 100], [110, 76], [150, 76]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="6" fill="none" {...ln('#E5C35A', 2.5)} />)}
      <circle cx="126" cy="98" r="4" fill="#7FD3F0" />
      <path d="M140 92q8 12 20 0" fill="none" {...ln('#E5C35A', 2)} />
    </>
  )],
  [/accessory tray/, () => (
    <>
      <Shadow y={160} rx={80} />
      <polygon points="20,112 60,62 186,62 160,112" fill="#8B8F93" {...ln('#55595F')} />
      <polygon points="20,112 160,112 160,128 20,128" fill="#6E7276" />
      <path d="M90 112L123 62" {...ln('#55595F', 3)} />
      <ellipse cx="70" cy="88" rx="16" ry="10" fill="none" {...ln('#C9A54A', 4)} />
      <ellipse cx="70" cy="88" rx="8" ry="5" fill="#F3F1EA" />
      <rect x="124" y="80" width="34" height="10" rx="5" fill="#2E2F33" />
      <rect x="110" y="94" width="40" height="8" rx="4" fill="#7A5233" />
    </>
  )],
  // --- kitchen & wardrobe ---
  [/wicker basket/, () => (
    <>
      <Shadow y={162} rx={80} />
      <path d="M30 84l22 -22h130v66l-22 22" fill="#C79A5B" {...ln('#7A5A2E', 2)} />
      <rect x="30" y="84" width="130" height="66" fill="#D9AE6E" {...ln('#7A5A2E', 3)} />
      {Array.from({ length: 13 }, (_, i) => <path key={i} d={`M${34 + i * 10} 88l8 58M${42 + i * 10} 88l-8 58`} {...ln('#9C7642', 1.4)} />)}
    </>
  )],
  [/tall unit pantry/, () => (
    <>
      <Shadow y={186} rx={50} />
      <rect x="58" y="10" width="84" height="176" fill="none" {...ln('#6E757C', 4)} />
      {[46, 88, 130, 172].map((y, i) => (
        <g key={y}>
          {[0, 1, 2].map((j) => <rect key={j} x={66 + j * 24} y={y - 24} width="18" height="22" rx="3" fill={LABELS[(i + j) % 6]} opacity="0.8" />)}
          <path d={`M58 ${y}h84`} {...ln('#6E757C', 4)} />
          <path d={`M58 ${y - 10}h84`} {...ln('#9AA0A6', 1.5)} />
        </g>
      ))}
    </>
  )],
  [/magic corner/, () => (
    <>
      <Shadow y={166} rx={84} />
      {[[16, 70], [104, 96]].map(([x, y]) => (
        <g key={x}>
          <path d={`M${x} ${y}h70q10 0 10 10v40h-80z`} fill="#E9ECEF" opacity="0.6" />
          {Array.from({ length: 7 }, (_, i) => <path key={i} d={`M${x + 6 + i * 11} ${y}v50`} {...ln('#6E757C', 1.4)} />)}
          <path d={`M${x} ${y}h70q10 0 10 10v40h-80z`} fill="none" {...ln('#6E757C', 3)} />
        </g>
      ))}
      <path d="M96 90l10 6" {...ln('#6E757C', 4)} />
    </>
  )],
  [/corner carousel/, () => (
    <>
      <Shadow y={176} rx={72} />
      <rect x="96" y="16" width="8" height="160" fill="#9AA0A6" {...ln('#6E757C', 1)} />
      {[66, 140].map((y) => (
        <g key={y}>
          <path d={`M30 ${y}a70 22 0 0 0 140 0`} fill="#E9ECEF" {...ln('#6E757C', 2)} />
          <ellipse cx="100" cy={y} rx="70" ry="22" fill="#F4F5F6" {...ln('#6E757C', 2.5)} />
          <path d={`M100 ${y}L170 ${y}`} {...ln('#6E757C', 2)} />
          <rect x="60" y={y - 18} width="14" height="16" rx="2" fill="#C7861F" />
          <rect x="124" y={y - 14} width="12" height="14" rx="2" fill="#2F8A57" />
        </g>
      ))}
    </>
  )],
  [/spice pull-out/, () => (
    <>
      <Shadow y={170} rx={46} />
      <rect x="70" y="16" width="60" height="154" fill="none" {...ln('#6E757C', 3)} />
      {[56, 108, 160].map((y, i) => (
        <g key={y}>
          {[0, 1].map((j) => (
            <g key={j}>
              <rect x={76 + j * 26} y={y - 34} width="20" height="30" rx="3" fill="#F6E9D2" opacity="0.9" {...ln('#C9B79C', 1)} />
              <rect x={76 + j * 26} y={y - 38} width="20" height="7" rx="2" fill={LABELS[(i * 2 + j) % 6]} />
              <rect x={78 + j * 26} y={y - 20} width="16" height="14" fill={['#C0392B', '#E3A21A', '#7A5233'][(i + j) % 3]} opacity="0.7" />
            </g>
          ))}
          <path d={`M70 ${y}h60`} {...ln('#6E757C', 3)} />
        </g>
      ))}
    </>
  )],
  [/thali basket/, () => (
    <>
      <Shadow y={162} rx={80} />
      {[56, 86, 116].map((x) => (
        <g key={x}>
          <ellipse cx={x + 20} cy="94" rx="10" ry="42" fill="#D9DCE0" {...ln('#8E949A', 1.6)} />
          <ellipse cx={x + 20} cy="94" rx="5" ry="30" fill="#EEF0F2" />
        </g>
      ))}
      <Basket />
    </>
  )],
  [/grain trolley/, () => (
    <>
      <Shadow y={162} rx={80} />
      {[['#E8D9A8', 38], ['#F2EBDD', 68], ['#C9933F', 98], ['#E2B33B', 128]].map(([c, x]) => (
        <g key={x}>
          <rect x={x} y="74" width="26" height="72" rx="4" fill="#fff" opacity="0.6" {...ln('#9AA0A6', 1.2)} />
          <rect x={x + 2} y="98" width="22" height="46" rx="3" fill={c} />
          <rect x={x} y="68" width="26" height="8" rx="2" fill="#B5452F" />
        </g>
      ))}
      <Basket />
    </>
  )],
  [/detergent holder/, () => (
    <>
      <Shadow y={162} rx={80} />
      <path d="M44 146v-54q0 -10 10 -12h20q10 2 10 12v54z" fill="#2F6DB5" />
      <rect x="58" y="70" width="12" height="12" fill="#E3E3E3" />
      <path d="M96 146v-46q0 -14 14 -14v-10h10v10q14 0 14 14v46z" fill="#2F8A57" />
      <path d="M115 66h14l4 6" {...ln('#555', 3)} />
      <rect x="140" y="104" width="16" height="42" rx="3" fill="#C7861F" />
      <Basket />
    </>
  )],
  [/under-sink/, () => (
    <>
      <Shadow y={166} rx={80} />
      <path d="M86 20v64" {...ln('#9AA0A6', 10)} />
      <path d="M30 84h40v-20h40v20h50v66H30z" fill="#E9ECEF" opacity="0.6" />
      {Array.from({ length: 13 }, (_, i) => {
        const x = 36 + i * 10;
        return <path key={i} d={`M${x} ${x > 70 && x < 110 ? 64 : 84}v66`} {...ln('#6E757C', 1.4)} />;
      })}
      <path d="M30 84h40v-20h40v20h50v66H30z" fill="none" {...ln('#6E757C', 3.5)} />
    </>
  )],
  [/glass pull-out/, () => (
    <>
      <Shadow y={162} rx={80} />
      {[44, 76, 108, 140].map((x) => (
        <g key={x}>
          <path d={`M${x} 70h22q0 26 -11 30v32h8v4h-18v-4h8v-32q-11 -4 -11 -30z`} fill="#E3F1F6" opacity="0.9" {...ln('#7FA9C0', 1.2)} />
          <path d={`M${x + 2} 84h18q-2 12 -9 14q-7 -2 -9 -14z`} fill="#8E2A3A" opacity="0.7" />
        </g>
      ))}
      <Basket />
    </>
  )],
  [/trouser pull-out/, () => (
    <>
      <Shadow y={172} rx={80} />
      <rect x="20" y="40" width="160" height="110" fill="none" {...ln('#6E757C', 4)} />
      {[52, 92, 132].map((x, i) => (
        <g key={x}>
          <path d={`M${x} 46v18h28v-18`} fill={['#2C3B5E', '#7A6A55', '#3C3D41'][i]} />
          <path d={`M${x} 64l-2 70h12l6 -60l6 60h12l-2 -70z`} fill={['#2C3B5E', '#7A6A55', '#3C3D41'][i]} />
        </g>
      ))}
      <path d="M20 46h160" {...ln('#6E757C', 3)} />
    </>
  )],
  [/shoe rack/, () => (
    <>
      <Shadow y={176} rx={74} />
      <rect x="26" y="30" width="148" height="140" fill="none" {...ln('#6E757C', 4)} />
      {[80, 140].map((y, i) => (
        <g key={y}>
          <path d={`M26 ${y}l148 -18`} {...ln('#6E757C', 3)} />
          {[0, 1, 2].map((j) => (
            <path key={j} d={`M${40 + j * 46} ${y - 6 - j * 6}q0 -20 14 -20h6q4 10 18 12q6 2 6 8z`} fill={LABELS[(i * 3 + j) % 6]} opacity="0.9" />
          ))}
        </g>
      ))}
    </>
  )],
  [/saree rack/, () => (
    <>
      <Shadow y={176} rx={74} />
      <rect x="20" y="24" width="160" height="12" rx="4" fill="#9AA0A6" {...ln('#6E757C')} />
      {['#B5452F', '#C7861F', '#2F8A57', '#6B4AA0', '#1F7F8C'].map((c, i) => (
        <g key={c}>
          <path d={`M${36 + i * 28} 36v16`} {...ln('#6E757C', 3)} />
          <Cloth x={30 + i * 28} y={52} w={14} h={110} c={c} />
          <path d={`M${30 + i * 28} 150h20`} {...ln('#E5C35A', 3)} />
        </g>
      ))}
    </>
  )],
  [/wardrobe basket/, () => (
    <>
      <Shadow y={162} rx={80} />
      {[['#2C3B5E', 96], ['#B5452F', 110], ['#E8E1D0', 124]].map(([c, y]) => <rect key={y} x="44" y={y} width="56" height="13" rx="3" fill={c} />)}
      {[['#6C7450', 104], ['#C7861F', 118], ['#5D6166', 132]].map(([c, y]) => <rect key={y} x="104" y={y} width="50" height="13" rx="3" fill={c} />)}
      <Basket />
    </>
  )],
  [/profile handle/, ({ m }) => (
    <>
      <Shadow y={178} rx={74} />
      <rect x="26" y="62" width="148" height="110" fill="#ECE8E1" {...ln('#A79F92', 1.4)} />
      <rect x="26" y="40" width="148" height="24" fill={m.base} {...ln(m.dark)} />
      <path d="M26 52h148" {...ln(m.dark, 4)} />
      <path d="M30 44h140" {...ln(m.light, 2)} />
    </>
  )],
  [/aluminium profile shutter/, ({ m }) => (
    <>
      <Shadow y={182} rx={50} />
      <rect x="56" y="16" width="88" height="166" fill={m.base} {...ln(m.dark)} />
      <Glass x={66} y={26} w={68} h={146} />
      <rect x="128" y="80" width="5" height="40" rx="2" fill={m.dark} />
    </>
  )],
  [/kitchen skirting/, () => (
    <>
      <Shadow y={170} rx={84} />
      {[50, 150].map((x) => <rect key={x} x={x - 6} y="100" width="12" height="60" fill="#2E2F33" />)}
      <polygon points="14,118 40,100 186,100 160,118" fill="#B8BEC5" />
      <rect x="14" y="118" width="146" height="44" fill="#C9CFD5" {...ln('#6E757C', 1.4)} />
      <path d="M14 124h146M14 156h146" {...ln('#9AA0A6', 1.2)} />
      <polygon points="160,118 186,100 186,144 160,162" fill="#9AA0A6" />
    </>
  )],
  [/sliding partition/, ({ m }) => (
    <>
      <Shadow y={182} rx={84} />
      <rect x="10" y="20" width="180" height="14" rx="3" fill={m.base} {...ln(m.dark)} />
      {[16, 72, 128].map((x) => <Glass key={x} x={x} y={38} w={56} h={142} />)}
      {[16, 72, 128].map((x) => <rect key={x} x={x} y="38" width="56" height="142" fill="none" {...ln(m.base, 4)} />)}
    </>
  )],
  [/pull-down hanger/, ({ m }) => (
    <>
      <Shadow y={182} rx={70} />
      <rect x="20" y="20" width="160" height="10" rx="3" fill="#D9CFBE" {...ln('#A79F92', 1.2)} />
      {[30, 170].map((x) => (
        <g key={x}>
          <path d={`M${x} 30L${x + (x < 100 ? 20 : -20)} 70L${x} 120`} fill="none" {...ln(m.dark, 7)} />
          <path d={`M${x} 30L${x + (x < 100 ? 20 : -20)} 70L${x} 120`} fill="none" {...ln(m.base, 4)} />
        </g>
      ))}
      <rect x="26" y="114" width="148" height="12" rx="6" fill={m.base} {...ln(m.dark)} />
      {[70, 130].map((x) => <path key={x} d={`M${x} 126q6 0 5 -6M${x} 126l-22 30h44z`} fill="none" {...ln('#8C6A44', 3)} />)}
      <path d="M100 126v40" {...ln(m.dark, 3)} />
      <rect x="88" y="164" width="24" height="8" rx="4" fill="#2E2F33" />
    </>
  )],
  [/wardrobe led/, () => (
    <>
      <Shadow y={180} rx={80} />
      <polygon points="30,60 170,60 186,130 14,130" fill="#FFF3C4" opacity="0.6" />
      <rect x="20" y="44" width="160" height="16" rx="8" fill="#C9D1D9" {...ln('#6E757C')} />
      <rect x="28" y="56" width="144" height="5" rx="2" fill="#FFE27A" />
      {[60, 100, 140].map((x) => <path key={x} d={`M${x} 60q8 0 6 -8M${x} 60l-26 36h52z`} fill="none" {...ln('#8C6A44', 3)} />)}
      <Cloth x={44} y={96} w={30} h={70} c="#2F6DB5" />
      <Cloth x={86} y={96} w={30} h={70} c="#E8E1D0" />
      <Cloth x={126} y={96} w={30} h={70} c="#B5452F" />
    </>
  )],
  [/patch fitting/, ({ m }) => (
    <>
      <Shadow y={182} rx={60} />
      <Glass x={40} y={14} w={130} h={168} />
      <path d="M40 120h54v62H40z" fill={m.base} {...ln(m.dark)} />
      <path d="M46 126h42" {...ln(m.light, 3)} opacity="0.7" />
      <circle cx="67" cy="160" r="8" fill={m.light} {...ln(m.dark, 1.4)} />
    </>
  )],
  [/glass-to-glass/, ({ m }) => (
    <>
      <Shadow y={182} rx={74} />
      <polygon points="100,20 100,180 20,150 20,40" fill={GLASS} opacity="0.85" {...ln('#7FA9C0', 1.2)} />
      <polygon points="100,20 100,180 180,150 180,40" fill="#BFDDE8" opacity="0.85" {...ln('#7FA9C0', 1.2)} />
      <rect x="86" y="84" width="28" height="32" rx="5" fill={m.base} {...ln(m.dark)} />
      <Screw x={100} y={100} m={m} r={5} />
    </>
  )],
  [/motion sensor/, () => (
    <>
      <Shadow y={150} rx={74} />
      <rect x="24" y="86" width="132" height="30" rx="10" fill="#EEF0F2" {...ln('#6E757C', 1.4)} />
      <rect x="34" y="94" width="96" height="14" rx="5" fill="#FFF3C4" />
      <circle cx="142" cy="101" r="8" fill="#2E2F33" />
      <circle cx="140" cy="99" r="2.5" fill="#fff" opacity="0.7" />
      {[14, 24, 34].map((r) => <path key={r} d={`M${156 + r * 0.6} ${101 - r}a${r} ${r} 0 0 1 0 ${r * 2}`} fill="none" {...ln('#2F8A57', 2.5)} opacity="0.7" />)}
    </>
  )],
  // --- safes ---
  [/office safe/, (ctx) => {
    const { s } = ctx;
    return (
      <>
        <Shadow y={184} rx={60} />
        <polygon points="150,22 162,16 162,174 150,182" fill={s.dark} />
        <rect x="50" y="22" width="100" height="160" rx="4" fill={s.base} {...ln(s.dark)} />
        <rect x="58" y="30" width="84" height="144" rx="3" fill="none" {...ln(s.dark, 1.5)} />
        <circle cx="100" cy="74" r="18" fill={tone(STEEL).base} {...ln('#55595F')} />
        <circle cx="100" cy="74" r="6" fill="#55595F" />
        <rect x="124" y="94" width="8" height="40" rx="4" fill={STEEL} {...ln('#55595F', 1.4)} />
        <circle cx="100" cy="120" r="5" fill="#2B2D31" />
      </>
    );
  }],
  [/jewellery safe/, (ctx) => {
    const { s } = ctx;
    return (
      <>
        <Shadow y={178} rx={66} />
        <rect x="40" y="30" width="120" height="146" rx="4" fill={s.base} {...ln(s.dark)} />
        <rect x="50" y="40" width="100" height="74" rx="3" fill="none" {...ln(s.dark, 1.5)} />
        <circle cx="100" cy="76" r="14" fill={tone(STEEL).base} {...ln('#55595F')} />
        <polygon points="30,132 170,132 160,124 40,124" fill="#6B1E2E" />
        <rect x="30" y="132" width="140" height="34" rx="3" fill={s.light} {...ln(s.dark)} />
        <rect x="88" y="146" width="24" height="6" rx="3" fill={STEEL} />
        {[60, 80, 120, 140].map((x) => <circle key={x} cx={x} cy="126" r="3" fill={x % 40 ? '#7FD3F0' : '#E5C35A'} />)}
      </>
    );
  }],
  [/fire resistant safe/, (ctx) => (
    <>
      {DRAW.safe({ ...ctx, s: tone('#C9C3B5') })}
      <path d="M128 150q-14 -10 -6 -26q4 8 8 6q-2 -12 8 -20q-2 12 6 18q8 10 -2 22z" fill="#D9461F" />
      <path d="M131 148q-6 -6 0 -14q2 6 6 4q4 6 -2 10z" fill="#F2B233" />
    </>
  )],
  [/hotel room safe/, ({ s }) => (
    <>
      <Shadow y={162} rx={84} />
      <polygon points="16,62 30,52 184,52 170,62" fill={s.light} />
      <polygon points="170,62 184,52 184,140 170,152" fill={s.dark} />
      <rect x="16" y="62" width="154" height="90" rx="4" fill={s.base} {...ln(s.dark)} />
      <rect x="40" y="76" width="54" height="14" rx="2" fill="#173B2A" />
      <text x="67" y="87" fontSize="9" textAnchor="middle" fill="#7CF0A8" fontFamily="monospace">OPEN</text>
      {Array.from({ length: 12 }, (_, i) => <rect key={i} x={106 + (i % 4) * 14} y={76 + Math.floor(i / 4) * 12} width="10" height="8" rx="2" fill="#D9DCE0" />)}
      <rect x="40" y="100" width="12" height="36" rx="5" fill={STEEL} {...ln('#55595F', 1.2)} />
    </>
  )],
  // --- adhesives & polish: each with its own pack and printed name ---
  [/wood adhesive/, ({ variant }) => (
    <>
      {DRAW.tub({ label: '#E3A21A', variant, plain: true })}
      <Label x={54} y={124} w={92} text="WOOD GLUE" size={12} />
    </>
  )],
  [/contact adhesive/, ({ variant }) => (
    <>
      {DRAW.can({ label: '#C0392B', variant, plain: true })}
      <Label x={56} y={128} w={88} text="CONTACT" size={13} />
    </>
  )],
  [/tile adhesive/, () => (
    <>
      <Shadow y={178} rx={60} />
      <path d="M46 40h108l8 136H38z" fill="#D7D2C8" {...ln('#8C877E')} />
      <path d="M46 40l8 -10h92l8 10" fill="#C2BCB0" {...ln('#8C877E', 1.4)} />
      <rect x="50" y="80" width="100" height="56" fill="#2F6DB5" />
      <Label x={50} y={106} w={100} text="TILE" size={18} />
      <Label x={50} y={126} w={100} text="ADHESIVE" size={11} />
    </>
  )],
  [/epoxy/, () => (
    <>
      <Shadow y={170} rx={60} />
      <g transform="rotate(-25 100 100)">
        <rect x="36" y="82" width="110" height="16" rx="3" fill="#F2F2F0" {...ln('#9AA0A6')} />
        <rect x="36" y="102" width="110" height="16" rx="3" fill="#F2F2F0" {...ln('#9AA0A6')} />
        <rect x="40" y="85" width="100" height="10" fill="#E3C35A" opacity="0.8" />
        <rect x="40" y="105" width="100" height="10" fill="#9AA0A6" opacity="0.8" />
        <rect x="20" y="78" width="16" height="44" rx="3" fill="#2F6DB5" />
        <path d="M146 92h18l10 8l-10 8h-18z" fill="#E6E6E4" {...ln('#9AA0A6', 1.4)} />
      </g>
      <Label x={40} y={168} w={120} text="EPOXY" size={14} color="#2F6DB5" />
    </>
  )],
  [/silicone/, () => (
    <>
      <Shadow y={160} rx={74} />
      <g transform="rotate(-25 100 100)">
        <rect x="26" y="78" width="120" height="44" rx="6" fill="#ECECEA" {...ln('#9AA0A6')} />
        <rect x="46" y="84" width="80" height="32" fill="#1F7F8C" />
        <Label x={46} y={104} w={80} text="SILICONE" size={11} />
        <path d="M146 92l40 6v4l-40 6z" fill="#F2F2F0" {...ln('#9AA0A6', 1.4)} />
        <rect x="16" y="82" width="12" height="36" rx="2" fill="#D0D2D5" />
      </g>
    </>
  )],
  [/wood filler/, () => (
    <>
      <Shadow y={170} rx={64} />
      <path d="M50 92h100v70a8 8 0 0 1 -8 8H58a8 8 0 0 1 -8 -8z" fill="#F4F4F2" {...ln('#A2A4A8')} />
      <ellipse cx="100" cy="92" rx="50" ry="10" fill="#B8865A" {...ln('#7A5233', 1.4)} />
      <rect x="50" y="112" width="100" height="36" fill="#7A5233" />
      <Label x={50} y={136} w={100} text="WOOD FILLER" size={11} />
      <path d="M132 40l26 -14l8 10l-24 18z" fill="#C9CDD2" {...ln('#6E757C', 1.4)} />
      <path d="M118 90l18 -40" {...ln('#C9A57A', 6)} />
    </>
  )],
  [/instant adhesive/, () => (
    <>
      <Shadow y={170} rx={40} />
      <path d="M74 80h52v86H74z" fill="#F4F4F2" {...ln('#A2A4A8')} />
      <path d="M80 80l10 -24h20l10 24z" fill="#E6E6E4" {...ln('#A2A4A8', 1.4)} />
      <path d="M96 56l4 -30l4 30z" fill="#E6E6E4" {...ln('#A2A4A8', 1.4)} />
      <rect x="74" y="98" width="52" height="50" fill="#C7861F" />
      <Label x={74} y={120} w={52} text="INSTANT" size={9} />
      <Label x={74} y={136} w={52} text="GLUE" size={9} />
    </>
  )],
  [/thinner/, () => (
    <>
      <Shadow y={178} rx={56} />
      <path d="M48 52h96v124H48z" fill="#C9CDD2" {...ln('#6E757C')} />
      <path d="M48 52l14 -14h40l10 14" fill="#B8BEC5" {...ln('#6E757C', 1.4)} />
      <rect x="116" y="30" width="18" height="22" rx="3" fill="#C0392B" />
      <path d="M60 38h30" {...ln('#6E757C', 6)} />
      <rect x="48" y="90" width="96" height="52" fill="#E8E1D0" />
      <Label x={48} y={122} w={96} text="THINNER" size={14} color="#C0392B" />
    </>
  )],
  [/hot melt/, (ctx) => (
    <>
      {DRAW.gluestick(ctx)}
      <g transform="rotate(-18 150 150)">
        <path d="M120 130h40l10 10v20h-50z" fill="#2E2F33" />
        <path d="M170 146h16l4 4l-4 4h-16z" fill="#C9CDD2" />
        <rect x="128" y="160" width="18" height="30" rx="4" fill="#2E2F33" />
      </g>
    </>
  )],
];
// "polish / primer / lacquer / stain / sealer / duco": the tin with its own name and colour
const TIN_LABELS = { 'pu polish': ['PU POLISH', '#B5452F'], 'melamine polish': ['MELAMINE', '#6B4AA0'], 'wood primer': ['PRIMER', '#1F7F8C'], lacquer: ['LACQUER', '#2F8A57'], 'wood stain': ['WOOD STAIN', '#7A5233'], 'nc sealer': ['NC SEALER', '#2F6DB5'], 'pu sealer': ['PU SEALER', '#C7861F'], 'duco paint': ['DUCO', '#C0392B'] };
// fasteners: [head, colour, length, thickness]
const FASTENERS = { 'wood screw': ['flat', '#C9A54A', 112, 16], 'drywall screw': ['bugle', '#3C3D41', 112, 13], 'confirmat screw': ['flat', '#B8BEC5', 96, 22], 'self-tapping screw': ['hex', '#C9D1D9', 80, 16], 'chipboard screw': ['flat', '#E2C25A', 120, 14], 'hinge screw': ['pan', '#C9D1D9', 56, 14] };
// sheets carry their grade, the way the trade stamps it
const stampOf = (kind, type) => {
  if (kind === 'laminate') return type.replace(/laminate|\d.*mm/g, '').trim().toUpperCase();
  if (kind === 'blockboard') return 'BLOCK BOARD';
  if (['ply', 'mdf', 'particle'].includes(kind)) return type.replace(/plywood|board|grade(?= mdf)/g, '').replace(/pre-laminated/, 'pre-lam').replace(/\s+/g, ' ').trim().toUpperCase();
  return null;
};

/** Picks the type-specific drawing when there is one, else the kind's drawing (plus the sheet stamp). */
function drawProduct(kind, ctx) {
  const v = VARIANTS.find(([re]) => re.test(ctx.type))?.[1];
  if (v) return v(ctx);
  const tin = TIN_LABELS[ctx.type];
  if (tin) return (<>{DRAW.can({ ...ctx, label: tin[1], plain: true })}<Label x={56} y={ctx.variant.startsWith('5') ? 104 : ctx.variant.startsWith('1') ? 116 : 124} w={88} text={tin[0]} size={12} /></>);
  const fast = FASTENERS[ctx.type];
  if (fast) return <Fastener head={fast[0]} color={fast[1]} len={fast[2]} thick={fast[3]} />;
  const stamp = stampOf(kind, ctx.type);
  return (
    <>
      {DRAW[kind](ctx)}
      {stamp && <Stamp text={stamp} color={kind === 'laminate' && isDark(ctx.s.base) ? '#ffffff' : '#5B3B8C'} />}
    </>
  );
}

/** The drawing for a product; null when there's none (the caller falls back to its own placeholder). */
export default function ProductIllustration({ product, className = '' }) {
  const rawId = useId().replace(/[^a-zA-Z0-9]/g, '');
  const kind = illustrationKind(product);
  if (!kind) return null;
  const [typeRaw, variantRaw = ''] = product.name.split(' – ');
  const type = typeRaw.toLowerCase(), variant = variantRaw.toLowerCase(), category = product.category.toLowerCase();
  const isLocker = category.includes('locker');
  const finish = findFinish(variant) ?? findFinish(type) ?? (category.includes('glass') ? '#C9D1D9' : STEEL);
  const shade = findShade(variant) ?? findShade(type) ?? (isLocker ? (type.includes('almirah') ? '#8A949E' : type.includes('jewellery') ? '#3E4349' : '#5B6670') : /plywood|block/.test(type) ? '#D9B98A' : '#C9B79C');
  const mm = parseFloat(variant) || 12;
  const ctx = {
    id: `pi${rawId}`,
    m: tone(finish),
    s: tone(shade),
    t: Math.min(18, Math.max(4, mm * 0.7)),
    type,
    variant,
    category,
    label: LABELS[hash(type) % LABELS.length],
  };
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      {drawProduct(kind, ctx)}
    </svg>
  );
}
