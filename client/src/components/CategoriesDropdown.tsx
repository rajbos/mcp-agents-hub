import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

type CategoryProps = {
  isMobile?: boolean;
  onSelectMobile?: () => void;
};

export function CategoriesDropdown({ isMobile, onSelectMobile }: CategoryProps) {
  const [isCategoriesMenuOpen, setIsCategoriesMenuOpen] = useState(false);
  const categoriesMenuRef = useRef<HTMLDivElement>(null);
  const { t } = useLanguage();

  const categories = [
    "Browser Automation",
    "Cloud Platforms",
    "Communication",
    "Databases",
    "File Systems",
    "Knowledge & Memory",
    "Location Services",
    "Monitoring",
    "Search",
    "Version Control",
    "Integrations",
    "Other Tools",
    "Developer Tools"
  ];

  // Close the dropdown menu when selecting a category on mobile
  const handleCategoryClick = () => {
    if (isMobile && onSelectMobile) {
      onSelectMobile();
    }
    setIsCategoriesMenuOpen(false);
  };

  // Handle clicks outside the menu to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isCategoriesMenuOpen &&
        categoriesMenuRef.current &&
        !categoriesMenuRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('button.categories-toggle')
      ) {
        setIsCategoriesMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isCategoriesMenuOpen]);

  if (isMobile) {
    // Mobile version
    return (
      <div className="border-b border-gray-100 pb-2 mb-2">
        <div className="text-gray-700 font-medium text-base py-2">{t('nav.categories')}</div>
        <div className="flex flex-col space-y-2 mt-1 pl-4">
          {categories.map((category, index) => (
            <Link 
              key={index}
              to={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
              className="text-gray-600 hover:text-indigo-600 text-sm"
              onClick={handleCategoryClick}
            >
              {category}
            </Link>
          ))}
        </div>
      </div>
    );
  }

  // Desktop version
  return (
    <div className="relative">
      <button 
        className="categories-toggle flex items-center text-gray-700 hover:text-indigo-600 font-medium"
        onClick={() => setIsCategoriesMenuOpen(!isCategoriesMenuOpen)}
      >
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          className="w-5 h-5 mr-1"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" 
          />
        </svg>
        {t('nav.categories')}
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          fill="none" 
          viewBox="0 0 24 24" 
          strokeWidth="1.5" 
          stroke="currentColor" 
          className="w-4 h-4 ml-1"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            d="M19.5 8.25l-7.5 7.5-7.5-7.5" 
          />
        </svg>
      </button>
      
      {/* Categories dropdown menu */}
      {isCategoriesMenuOpen && (
        <div 
          className="absolute left-0 mt-2 w-60 bg-white rounded-md shadow-lg z-20 py-2" 
          ref={categoriesMenuRef}
        >
          <div className="grid grid-cols-1 gap-1">
            {categories.map((category, index) => (
              <Link 
                key={index}
                to={`/category/${category.toLowerCase().replace(/ /g, '-')}`}
                className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-indigo-600"
                onClick={handleCategoryClick}
              >
                {category}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
