import React from 'react';

const SegmentedTabs = ({ items, value, onChange, size = 'md', label = 'Sections' }) => (
  <div
    role="tablist"
    aria-label={label}
    className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line-subtle bg-paper-1/70 p-1"
  >
    {items.map((item) => {
      const key = item.key ?? item.name;
      const isActive = key === value;
      return (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={isActive}
          onClick={() => onChange(item)}
          className={`rounded-full font-semibold transition-colors ${
            size === 'sm' ? 'px-3.5 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
          } ${
            isActive
              ? 'bg-ink text-paper-1 shadow-paper'
              : 'text-ink-2 hover:text-ink hover:bg-paper-2/70'
          }`}
        >
          {item.label ?? item.name}
        </button>
      );
    })}
  </div>
);

export default SegmentedTabs;
