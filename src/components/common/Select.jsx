import { useState, useRef, useEffect, useId } from 'react';
import { ChevronDown, Check } from 'lucide-react';

/**
 * Dark-themed dropdown (replaces native <select> which breaks in modals on Windows).
 */
const Select = ({
  value,
  onChange,
  options = [],
  placeholder = 'Select…',
  className = '',
  disabled = false,
  size = 'md',
  id: idProp,
}) => {
  const autoId = useId();
  const id = idProp || autoId;
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);

  const selected = options.find((o) => String(o.value) === String(value));
  const label = selected?.label ?? placeholder;

  const sizeClasses = size === 'sm'
    ? 'py-2 text-xs rounded-lg'
    : 'py-3 text-sm rounded-xl';

  useEffect(() => {
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) setOpen(false);
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, []);

  const pick = (opt) => {
    onChange?.(opt.value);
    setOpen(false);
  };

  return (
    <div ref={rootRef} className={`relative ${className}`} id={id}>
      <button
        type="button"
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => !disabled && setOpen((o) => !o)}
        className={`w-full flex items-center justify-between gap-2 border px-3 text-left transition-colors ${sizeClasses}
          ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-primary-fixed/40'}
          ${open ? 'border-primary-fixed/50 ring-1 ring-primary-fixed/20' : 'border-white/10'}
          bg-[#1a1919] text-white`}
      >
        <span className={selected ? 'truncate' : 'truncate text-gray-500'}>{label}</span>
        <ChevronDown className={`w-4 h-4 shrink-0 text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <ul
          role="listbox"
          className="absolute z-[100] left-0 right-0 mt-1 max-h-48 overflow-y-auto rounded-xl border border-white/10 bg-[#1a1919] shadow-2xl py-1"
        >
          {options.length === 0 ? (
            <li className="px-4 py-2 text-xs text-gray-500">No options</li>
          ) : (
            options.map((opt) => {
              const active = String(opt.value) === String(value);
              return (
                <li key={String(opt.value)}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={active}
                    onClick={() => pick(opt)}
                    className={`w-full flex items-center justify-between gap-2 px-4 py-2.5 text-sm text-left transition-colors
                      ${active ? 'bg-primary-fixed/15 text-primary-fixed' : 'text-gray-200 hover:bg-white/5 hover:text-white'}`}
                  >
                    <span className="truncate">{opt.label}</span>
                    {active && <Check className="w-4 h-4 shrink-0 text-primary-fixed" />}
                  </button>
                </li>
              );
            })
          )}
        </ul>
      )}
    </div>
  );
};

export default Select;
