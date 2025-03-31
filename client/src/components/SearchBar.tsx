import React, { useState, useEffect } from 'react';
import { Search } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string) => void;
}

export function SearchBar({ value, onChange, onSearch }: SearchBarProps) {
  const { t } = useLanguage();
  const [inputValue, setInputValue] = useState(value);
  
  // Update internal state when prop value changes (e.g., reset from parent)
  useEffect(() => {
    setInputValue(value);
  }, [value]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setInputValue(newValue);
    onChange(newValue);
    
    // If the input is cleared, automatically trigger search with empty string
    if (newValue === '') {
      onSearch('');
    }
  };

  const handleSearch = () => {
    onSearch(inputValue);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };
  
  return (
    <div className="relative max-w-2xl w-full flex flex-col sm:flex-row">
      <div className="relative flex-grow mb-2 sm:mb-0">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg sm:rounded-l-lg sm:rounded-r-none bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder={t('home.search.placeholder')}
          value={inputValue}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
        />
      </div>
      <button
        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg sm:rounded-l-none sm:rounded-r-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors w-full sm:w-auto sm:min-w-[120px]"
        onClick={handleSearch}
      >
        {t('home.search.button') || 'Search'}
      </button>
    </div>
  );
}