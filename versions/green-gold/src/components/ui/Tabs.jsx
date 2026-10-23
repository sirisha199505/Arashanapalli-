/** Underlined tab bar (TradeIndia style). Pure: parent owns `activeId`. */
export default function Tabs({ tabs, activeId, onChange }) {
  return (
    <nav role="tablist" className="flex gap-6 overflow-x-auto overflow-y-hidden border-b border-line [scrollbar-width:none] sm:gap-8 [&::-webkit-scrollbar]:hidden">
      {tabs.map((tab) => {
        const active = tab.id === activeId;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(tab.id)}
            className={`-mb-px whitespace-nowrap border-b-[3px] py-3 text-sm font-semibold transition sm:text-[15px] ${
              active ? 'border-primary text-primary' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </nav>
  );
}
