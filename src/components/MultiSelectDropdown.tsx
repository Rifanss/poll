import React, { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check, X } from 'lucide-react';

interface MultiSelectDropdownProps {
  id: string;
  label: string;
  options: string[];
  selectedValues: string[];
  onChange: (values: string[]) => void;
  placeholder?: string;
  required?: boolean;
  error?: boolean;
}

export const MultiSelectDropdown: React.FC<MultiSelectDropdownProps> = ({
  id,
  label,
  options,
  selectedValues,
  onChange,
  placeholder = 'اختر خيارًا واحدًا أو أكثر...',
  required = false,
  error = false
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option: string) => {
    if (selectedValues.includes(option)) {
      onChange(selectedValues.filter((v) => v !== option));
    } else {
      onChange([...selectedValues, option]);
    }
  };

  const handleSelectAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([...options]);
  };

  const handleClearAll = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange([]);
  };

  const removeItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    onChange(selectedValues.filter((v) => v !== item));
  };

  const handleToggleOpen = () => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) {
        setTimeout(() => {
          containerRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
      }
      return next;
    });
  };

  return (
    <div className="relative w-full" ref={containerRef} dir="rtl">
      <label
        htmlFor={`${id}-trigger`}
        className="block text-[13px] sm:text-xs font-semibold text-slate-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>

      {/* Trigger Button */}
      <div
        id={`${id}-trigger`}
        role="button"
        tabIndex={0}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={handleToggleOpen}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleToggleOpen();
          } else if (e.key === 'Escape') {
            setIsOpen(false);
          }
        }}
        className={`w-full min-h-[44px] sm:min-h-[46px] px-3 py-2 text-right bg-slate-50 border rounded-lg sm:rounded-xl cursor-pointer select-none transition-all flex items-center justify-between gap-2 ${
          error
            ? 'border-red-400 focus:ring-2 focus:ring-red-400/20'
            : isOpen
            ? 'border-[#005A36] bg-white ring-2 ring-[#005A36]/20'
            : 'border-slate-300 hover:border-slate-400 hover:bg-slate-100/60'
        }`}
      >
        <div className="flex-1 flex flex-wrap items-center gap-1.5">
          {selectedValues.length === 0 ? (
            <span className="text-slate-400 text-[13px] sm:text-sm font-normal">
              {placeholder}
            </span>
          ) : (
            selectedValues.map((val) => (
              <span
                key={val}
                className="inline-flex items-center gap-1 bg-[#005A36]/10 text-[#00482B] border border-[#005A36]/20 px-2.5 py-1 rounded-md text-[12px] sm:text-xs font-medium"
              >
                <span>{val}</span>
                <span
                  role="button"
                  tabIndex={0}
                  onClick={(e) => removeItem(e, val)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.stopPropagation();
                      removeItem(e as any, val);
                    }
                  }}
                  className="hover:text-red-600 rounded p-0.5 transition-colors cursor-pointer"
                  title="إزالة"
                >
                  <X className="w-3.5 h-3.5" />
                </span>
              </span>
            ))
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 text-slate-400 mr-1">
          {selectedValues.length > 0 && (
            <span className="text-[11px] font-mono font-bold bg-[#005A36] text-white px-2 py-0.5 rounded-full">
              {selectedValues.length}
            </span>
          )}
          <ChevronDown
            className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180 text-[#005A36]' : 'text-slate-500'}`}
          />
        </div>
      </div>

      {/* In-Flow Options Panel to guarantee full visibility on all mobile screens */}
      {isOpen && (
        <div
          role="listbox"
          aria-multiselectable="true"
          className="mt-2 w-full bg-white border-2 border-[#005A36]/30 rounded-xl shadow-md overflow-hidden animate-fadeIn"
        >
          {/* Quick Action Header */}
          <div className="px-3 py-2 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-[11px] font-medium text-slate-600">
            <span className="font-semibold text-slate-700">يمكنك اختيار أكثر من خيار:</span>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSelectAll}
                className="text-[#005A36] hover:underline cursor-pointer font-semibold"
              >
                تحديد الكل
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={handleClearAll}
                className="text-slate-500 hover:text-red-600 hover:underline cursor-pointer"
              >
                مسح
              </button>
              <span className="text-slate-300">•</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsOpen(false);
                }}
                className="text-[#005A36] font-bold bg-[#005A36]/10 px-2 py-0.5 rounded cursor-pointer hover:bg-[#005A36]/20 transition-colors"
              >
                إغلاق ✕
              </button>
            </div>
          </div>

          {/* Options List - Fully expanded without restrictive max-height so all items are 100% visible */}
          <div className="p-1.5 space-y-1 bg-white">
            {options.map((option) => {
              const isSelected = selectedValues.includes(option);
              return (
                <div
                  key={option}
                  role="option"
                  aria-selected={isSelected}
                  onClick={() => toggleOption(option)}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-lg text-[13px] sm:text-sm cursor-pointer select-none transition-colors ${
                    isSelected
                      ? 'bg-[#005A36]/10 text-[#00482B] font-semibold border border-[#005A36]/20'
                      : 'hover:bg-slate-50 text-slate-800 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                        isSelected
                          ? 'bg-[#005A36] border-[#005A36] text-white shadow-xs'
                          : 'border-slate-300 bg-white hover:border-slate-400'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                    <span className="text-[13px] sm:text-sm">{option}</span>
                  </div>

                  {isSelected && (
                    <span className="text-[11px] text-[#005A36] font-bold bg-[#005A36]/15 px-2 py-0.5 rounded-md">
                      تم الاختيار
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Bottom Confirmation Footer */}
          <div className="px-3 py-1.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              {selectedValues.length === 0
                ? 'لم يتم اختيار أي خيار بعد'
                : `تم اختيار (${selectedValues.length}) من (${options.length})`}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsOpen(false);
              }}
              className="text-[#005A36] font-semibold hover:underline cursor-pointer"
            >
              تم الاعتماد ✓
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
