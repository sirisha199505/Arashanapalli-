/** Stroke icon set (24×24). Add a path here to add an icon everywhere. */
const PATHS = {
  check: ['M5 13l4 4L19 7'],
  arrow: ['M5 12h14', 'M13 6l6 6-6 6'],
  search: ['M11 19a8 8 0 100-16 8 8 0 000 16z', 'M21 21l-4.3-4.3'],
  home: ['M3 10l9-7 9 7v10a1 1 0 01-1 1h-5v-6H9v6H4a1 1 0 01-1-1V10z'],
  grid: ['M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h6v6h-6z'],
  tag: ['M20.6 13.4l-7.2 7.2a2 2 0 01-2.8 0L3 13V3h10l7.6 7.6a2 2 0 010 2.8z', 'M7.5 7.5h.01'],
  file: ['M14 3H6a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V9z', 'M14 3v6h6', 'M8 13h8M8 17h5'],
  shield: ['M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z', 'M9 12l2 2 4-4'],
  clock: ['M12 22a10 10 0 100-20 10 10 0 000 20z', 'M12 6v6l4 2'],
  award: ['M12 15a7 7 0 100-14 7 7 0 000 14z', 'M8.2 13.9L7 23l5-3 5 3-1.2-9.1'],
  layers: ['M12 2l10 5-10 5L2 7z', 'M2 17l10 5 10-5', 'M2 12l10 5 10-5'],
  door: ['M5 21V4a1 1 0 011-1h12a1 1 0 011 1v17', 'M3 21h18', 'M15 12h.01'],
  monitor: ['M3 4h18v12H3z', 'M8 20h8M12 16v4'],
  phone: ['M3 5a2 2 0 012-2h3.3a1 1 0 01.95.68l1.5 4.5a1 1 0 01-.5 1.2l-2.26 1.13a11 11 0 005.52 5.52l1.13-2.26a1 1 0 011.2-.5l4.5 1.5a1 1 0 01.68.95V19a2 2 0 01-2 2h-1C9.72 21 3 14.28 3 6V5z'],
  chat: ['M21 12a9 9 0 01-13.4 7.85L3 21l1.15-4.6A9 9 0 1121 12z', 'M8 10h8M8 14h5'],
  pin: ['M12 22s7-6.5 7-12a7 7 0 10-14 0c0 5.5 7 12 7 12z', 'M12 12.5a2.5 2.5 0 100-5 2.5 2.5 0 000 5z'],
  instagram: ['M7 2h10a5 5 0 015 5v10a5 5 0 01-5 5H7a5 5 0 01-5-5V7a5 5 0 015-5z', 'M16 11.4A4 4 0 1112.6 8 4 4 0 0116 11.4z', 'M17.5 6.5h.01'],
  close: ['M6 6l12 12M18 6L6 18'],
  diamond: ['M6 3h12l4 6-10 12L2 9z', 'M2 9h20', 'M12 21L8 9l4-6 4 6z'],
  box: ['M21 8l-9-5-9 5v8l9 5 9-5z', 'M3 8l9 5 9-5', 'M12 13v8', 'M7.5 5.5l9 5'],
  headset: ['M3 14v-2a9 9 0 0118 0v2', 'M3 14h3v6H4a1 1 0 01-1-1zM21 14h-3v6h2a1 1 0 001-1z'],
  play: ['M7 4l13 8-13 8z'],
  volume: ['M11 5L6 9H2v6h4l5 4z', 'M15.5 8.5a5 5 0 010 7', 'M19 5a10 10 0 010 14'],
  volumeOff: ['M11 5L6 9H2v6h4l5 4z', 'M22 9l-6 6M16 9l6 6'],
  pause: ['M7 4h3v16H7zM14 4h3v16h-3z'],
  send: ['M22 2L11 13', 'M22 2l-7 20-4-9-9-4z'],
  chevronLeft: ['M15 18l-6-6 6-6'],
  chevronRight: ['M9 18l6-6-6-6'],
  reel: ['M3 5h18v14H3z', 'M3 9h18', 'M8 5l3 4M14 5l3 4', 'M10 12.5v4l3.5-2z'],
};

export default function Icon({ name, className = 'h-5 w-5' }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {PATHS[name].map((d) => (
        <path key={d} d={d} />
      ))}
    </svg>
  );
}
