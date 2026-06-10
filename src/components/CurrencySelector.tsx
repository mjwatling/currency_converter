"use client";

import { useState, useRef, useEffect, useId } from "react";
import type { Currency } from "@/lib/currencies";
import { getFavorites, saveFavorites } from "./FavoritesBar";

interface CurrencySelectorProps {
  value: string;
  onChange: (code: string) => void;
  label: string;
  currencies: Currency[];
}

export default function CurrencySelector({
  value,
  onChange,
  label,
  currencies,
}: CurrencySelectorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const id = useId();
  const listboxId = `listbox-${id}`;

  const [favorites, setFavorites] = useState<string[]>(() => getFavorites());

  const toggleFavorite = (code: string) => {
    const updated = favorites.includes(code)
      ? favorites.filter((c) => c !== code)
      : [...favorites, code];
    setFavorites(updated);
    saveFavorites(updated);
  };

  const selected = currencies.find((c) => c.code === value);

  const filtered = currencies.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.name.length > 0 && c.name.toLowerCase().includes(search.toLowerCase())
  );

  const openDropdown = () => {
    setSearch("");
    setFocusedIndex(-1);
    setIsOpen(true);
  };

  useEffect(() => {
    if (focusedIndex >= 0 && listRef.current) {
      const element = listRef.current.querySelector<HTMLElement>(`[data-index="${focusedIndex}"]`);
      if (element) {
        element.scrollIntoView({ block: "nearest" });
      }
    }
  }, [focusedIndex]);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleSelect = (code: string) => {
    onChange(code);
    setIsOpen(false);
  };

  const isFav = favorites.includes(value);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else {
          setFocusedIndex((i) => Math.min(i + 1, filtered.length - 1));
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (isOpen) {
          setFocusedIndex((i) => Math.max(i - 1, 0));
        }
        break;
      case "Enter":
        e.preventDefault();
        if (!isOpen) {
          openDropdown();
        } else if (focusedIndex >= 0 && focusedIndex < filtered.length) {
          handleSelect(filtered[focusedIndex].code);
        }
        break;
      case "Escape":
        e.preventDefault();
        setIsOpen(false);
        break;
      case "Tab":
        setIsOpen(false);
        break;
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <label
        className="block text-sm font-medium mb-1.5"
        style={{ color: "var(--secondary)" }}
      >
        {label}
      </label>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={() => (isOpen ? setIsOpen(false) : openDropdown())}
          onKeyDown={handleKeyDown}
          role="combobox"
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          aria-controls={listboxId}
          className="flex-1 flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 cursor-pointer"
          style={{
            backgroundColor: "var(--input-bg)",
            border: `2px solid ${isOpen ? "var(--input-focus)" : "var(--input-border)"}`,
          }}
        >
          <span className="text-2xl">{selected?.flag ?? "🌐"}</span>
          <div className="flex-1 min-w-0">
            <div className="font-semibold">{selected?.code ?? value}</div>
            <div
              className="text-sm truncate"
              style={{ color: "var(--secondary)" }}
            >
              {selected?.name ?? value}
            </div>
          </div>
          <svg
            className={`w-5 h-5 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            style={{ color: "var(--secondary)" }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 9l-7 7-7-7"
            />
          </svg>
        </button>
        <button
          type="button"
          onClick={() => toggleFavorite(value)}
          className="p-2 rounded-lg transition-colors cursor-pointer"
          style={{ color: isFav ? "var(--accent)" : "var(--secondary)" }}
          title={isFav ? "Remove from favorites" : "Add to favorites"}
        >
          {isFav ? (
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z"
              />
            </svg>
          )}
        </button>
      </div>

      {isOpen && (
        <div
          className="absolute z-50 w-full mt-2 rounded-xl shadow-2xl overflow-hidden"
          style={{
            backgroundColor: "var(--card-bg)",
            border: "1px solid var(--card-border)",
          }}
        >
          <div className="p-2">
            <input
              ref={inputRef}
              type="text"
              placeholder="Search currencies..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={handleKeyDown}
              aria-label="Search currencies"
              className="w-full px-3 py-2 rounded-lg text-sm outline-none"
              style={{
                backgroundColor: "var(--input-bg)",
                border: "1px solid var(--input-border)",
              }}
            />
          </div>
          <div
            id={listboxId}
            role="listbox"
            ref={listRef}
            className="max-h-64 overflow-y-auto"
          >
            {filtered.map((currency, index) => (
              <button
                key={currency.code}
                type="button"
                role="option"
                aria-selected={currency.code === value}
                data-index={index}
                onClick={() => handleSelect(currency.code)}
                onMouseEnter={() => setFocusedIndex(index)}
                onMouseLeave={() => setFocusedIndex(-1)}
                className="w-full flex items-center gap-3 px-4 py-2.5 transition-colors cursor-pointer"
                style={{
                  backgroundColor:
                    index === focusedIndex
                      ? "var(--input-bg)"
                      : currency.code === value
                      ? "var(--primary-light)"
                      : "transparent",
                }}
              >
                <span className="text-xl">{currency.flag}</span>
                <div className="flex-1 text-left">
                  <span className="font-medium">{currency.code}</span>
                  <span
                    className="text-sm ml-2"
                  >
                    {currency.name}
                  </span>
                </div>
                {favorites.includes(currency.code) && (
                  <svg className="w-3.5 h-3.5 flex-shrink-0" fill="currentColor" style={{ color: "var(--accent)" }} viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.56 5.82 22 7 14.14l-5-4.87 6.91-1.01z" />
                  </svg>
                )}
              </button>
            ))}
            {filtered.length === 0 && (
              <div
                className="px-4 py-6 text-center text-sm"
                style={{ color: "var(--secondary)" }}
              >
                No currencies found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
