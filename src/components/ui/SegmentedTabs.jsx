import React from 'react';

const SegmentedTabs = ({ items, value, onChange, size = 'md', label = 'Sections' }) => (
  <div
    role="tablist"
    aria-label={label}
    className="inline-flex flex-wrap justify-center gap-1 rounded-full border border-line-subtle bg-paper-1/70 p-1"
  >
    {items.map((item) => {
      const key = item.key ?? item.id ?? item.name;
      const isActive = key === value;
      const Icon = item.icon;
      return (
        <button
          key={key}
          role="tab"
          type="button"
          aria-selected={isActive}
          disabled={item.disabled}
          onClick={() => onChange(item)}
          className={`inline-flex items-center gap-2 rounded-full font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
            size === 'sm' ? 'px-3.5 py-1.5 text-[11px]' : 'px-4 py-2 text-xs'
          } ${
            isActive
              ? 'bg-ink text-paper-1 shadow-paper'
              : 'text-ink-2 hover:text-ink hover:bg-paper-2/70'
          }`}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {item.label ?? item.name}
        </button>
      );
    })}
  </div>
);

export default SegmentedTabs;
