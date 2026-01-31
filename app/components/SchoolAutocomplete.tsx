"use client";

import { useState, useEffect, useRef, useCallback } from "react";

interface School {
  id: string;
  name: string;
  nickname?: string | null;
  city?: string | null;
  state?: string | null;
  location?: string | null;
}

interface SchoolAutocompleteProps {
  value: string;
  onChange: (schoolId: string, schoolName: string) => void;
  initialSchoolName?: string;
  placeholder?: string;
  disabled?: boolean;
}

export default function SchoolAutocomplete({
  value,
  onChange,
  initialSchoolName = "",
  placeholder = "Start typing to search schools...",
  disabled = false
}: SchoolAutocompleteProps) {
  const [query, setQuery] = useState(initialSchoolName);
  const [schools, setSchools] = useState<School[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch schools based on query
  const searchSchools = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 2) {
      setSchools([]);
      setIsOpen(false);
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `/api/search/suggest?q=${encodeURIComponent(searchQuery)}`
      );
      if (response.ok) {
        const data = await response.json();
        setSchools(data.schools || []);
        setIsOpen(true);
        setHighlightedIndex(-1);
      }
    } catch (error) {
      console.error("Failed to search schools:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search
  useEffect(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchSchools(query);
    }, 250);

    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, [query, searchSchools]);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newQuery = e.target.value;
    setQuery(newQuery);
    // Clear selection if user is typing something different
    if (value && newQuery !== initialSchoolName) {
      onChange("", "");
    }
  };

  const handleSelect = (school: School) => {
    setQuery(school.name);
    onChange(school.id, school.name);
    setIsOpen(false);
    setHighlightedIndex(-1);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen || schools.length === 0) {
      if (e.key === "ArrowDown" && query.length >= 2) {
        searchSchools(query);
      }
      return;
    }

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        setHighlightedIndex((prev) =>
          prev < schools.length - 1 ? prev + 1 : prev
        );
        break;
      case "ArrowUp":
        e.preventDefault();
        setHighlightedIndex((prev) => (prev > 0 ? prev - 1 : -1));
        break;
      case "Enter":
        e.preventDefault();
        if (highlightedIndex >= 0 && highlightedIndex < schools.length) {
          handleSelect(schools[highlightedIndex]);
        }
        break;
      case "Escape":
        setIsOpen(false);
        setHighlightedIndex(-1);
        break;
    }
  };

  const handleFocus = () => {
    if (query.length >= 2 && schools.length > 0) {
      setIsOpen(true);
    }
  };

  return (
    <div className="school-autocomplete">
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        onFocus={handleFocus}
        placeholder={placeholder}
        autoComplete="off"
        aria-autocomplete="list"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        disabled={disabled}
      />
      {loading && <span className="school-autocomplete-loading">Searching...</span>}
      {isOpen && schools.length > 0 && (
        <div
          ref={dropdownRef}
          className="school-autocomplete-dropdown"
          role="listbox"
        >
          {schools.map((school, index) => (
            <div
              key={school.id}
              className={`school-autocomplete-option ${
                index === highlightedIndex ? "highlighted" : ""
              } ${school.id === value ? "selected" : ""}`}
              onClick={() => handleSelect(school)}
              onMouseEnter={() => setHighlightedIndex(index)}
              role="option"
              aria-selected={school.id === value}
            >
              <span className="school-name">
                {school.name}
                {school.nickname && (
                  <span className="school-nickname"> ({school.nickname})</span>
                )}
              </span>
              {school.location && (
                <span className="school-location">{school.location}</span>
              )}
            </div>
          ))}
        </div>
      )}
      {isOpen && schools.length === 0 && query.length >= 2 && !loading && (
        <div className="school-autocomplete-dropdown" role="listbox">
          <div className="school-autocomplete-empty">
            No schools found matching "{query}"
          </div>
        </div>
      )}
    </div>
  );
}
