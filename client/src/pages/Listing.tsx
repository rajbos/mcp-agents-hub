import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ServerCard } from '../components/ServerCard';
import { MCPServer } from '../types';
import { ChevronLeft, ChevronRight, ChevronDown, Search } from 'lucide-react';

// Define interface for the new paginated response
interface PaginatedResponse {
  servers: MCPServer[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

export function Listing() {
  const { t, language } = useLanguage();
  const { categoryKey } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Get page, size, and search from URL or use defaults
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSize = parseInt(searchParams.get('size') || '12', 10);
  const initialSearch = searchParams.get('search') || '';
  
  const [serversData, setServersData] = useState<PaginatedResponse>({
    servers: [],
    totalItems: 0,
    currentPage: initialPage,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const pageSizeOptions = [6, 12, 24, 48];
  const [searchKeyword, setSearchKeyword] = useState<string>(initialSearch);
  const [searchInputValue, setSearchInputValue] = useState<string>(initialSearch);

  // Fetch servers for the given category, page, and search keyword
  const fetchServers = async (page = 1, size = pageSize, search = searchKeyword) => {
    // Don't return early if categoryKey is "all", that's a valid use case for search
    if (!categoryKey && categoryKey !== "all") return;
    
    try {
      setIsLoading(true);
      
      const url = `/v1/hub/search_servers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          // When categoryKey is "all", pass null or undefined to search all categories
          categoryKey: categoryKey === "all" ? undefined : categoryKey,
          locale: language || 'en',
          page: page,
          size: size,
          search_for: search || undefined
        })
      });
      
      if (!response.ok) {
        throw new Error(t('listing.fetchError') || 'Failed to fetch servers');
      }
      
      const data = await response.json() as PaginatedResponse;
      setServersData(data);
    } catch (error) {
      console.error('Error fetching servers:', error);
      setServersData({
        servers: [],
        totalItems: 0,
        currentPage: 1,
        totalPages: 1
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Use the initial parameters from URL
    fetchServers(initialPage, pageSize, searchKeyword);
  }, [categoryKey, language, initialPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= serversData.totalPages) {
      // Update URL with new page parameter
      const searchParam = searchKeyword ? `&search=${encodeURIComponent(searchKeyword)}` : '';
      navigate(`/listing/${categoryKey}?page=${page}&size=${pageSize}${searchParam}`);
      
      fetchServers(page, pageSize, searchKeyword);
      // Scroll to top of the list when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    
    // Update URL with new size parameter and reset to page 1
    const searchParam = searchKeyword ? `&search=${encodeURIComponent(searchKeyword)}` : '';
    navigate(`/listing/${categoryKey}?page=1&size=${newSize}${searchParam}`);
    
    // Reset to first page when changing page size
    fetchServers(1, newSize, searchKeyword);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchKeyword(searchInputValue);
    
    // Update URL with search parameter and reset to page 1
    navigate(`/listing/${categoryKey}?page=1&size=${pageSize}${searchInputValue ? `&search=${encodeURIComponent(searchInputValue)}` : ''}`);
    
    // Search with the new keyword
    fetchServers(1, pageSize, searchInputValue);
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInputValue(e.target.value);
  };

  const handleClearSearch = () => {
    setSearchInputValue('');
    setSearchKeyword('');
    
    // Update URL without search parameter and reset to page 1
    navigate(`/listing/${categoryKey}?page=1&size=${pageSize}`);
    
    // Reset search
    fetchServers(1, pageSize, '');
  };

  const formatCategoryName = (key: string) => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const { currentPage, totalPages } = serversData;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first page, last page, current page and pages adjacent to current
    let pages = [1, totalPages, currentPage];
    
    // Add one page before and after the current page if possible
    if (currentPage > 1) {
      pages.push(currentPage - 1);
    }
    
    if (currentPage < totalPages) {
      pages.push(currentPage + 1);
    }
    
    // Sort and remove duplicates
    pages = [...new Set(pages)].sort((a, b) => a - b);
    
    // Add ellipsis indicators
    const result = [];
    for (let i = 0; i < pages.length; i++) {
      result.push(pages[i]);
      
      // Add ellipsis if there's a gap
      if (pages[i + 1] && pages[i + 1] - pages[i] > 1) {
        result.push('ellipsis');
      }
    }
    
    return result;
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumbs */}
      {categoryKey && (
        <nav className="mb-4">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <a href="/" className="hover:text-indigo-600 transition-colors duration-200">
                {t('home.title')}
              </a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <a className="hover:text-indigo-600 transition-colors duration-200">
                {t('navigation.servers')}
              </a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <span className="text-gray-600">
                {t('navigation.category')}:
              </span>
            </li>
            <li className="font-medium text-gray-900 ml-1">
              {categoryKey === "all" ? t('category.all') : (t(`category.${categoryKey}`) || t(`category-common.${categoryKey}`) || formatCategoryName(categoryKey))}
            </li>
          </ol>
        </nav>
      )}
      
      {/* Search bar */}
      <div className="mb-6">
        <form onSubmit={handleSearchSubmit} className="bg-white rounded-lg shadow-sm border border-gray-100 p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-grow">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={t('search.placeholder')}
                value={searchInputValue}
                onChange={handleSearchInputChange}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
              {searchInputValue && (
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center"
                  aria-label={t('search.clear')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-400 hover:text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200 sm:flex-shrink-0"
            >
              {t('search.action')}
            </button>
          </div>
          {searchKeyword && (
            <div className="mt-3 flex items-center">
              <span className="text-sm text-gray-600 mr-2">
                {t('search.results')}:
              </span>
              <span className="px-2 py-1 bg-indigo-50 text-indigo-700 rounded-full text-xs font-medium flex items-center">
                {searchKeyword}
                <button
                  type="button"
                  onClick={handleClearSearch}
                  className="ml-1 text-indigo-500 hover:text-indigo-700 focus:outline-none"
                  aria-label={t('search.clear')}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </span>
            </div>
          )}
        </form>
      </div>
      
      {/* Toolbar with statistics */}
      {!isLoading && serversData.servers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-blue-50 rounded-md text-blue-700 font-medium text-sm">
              {serversData.totalItems} {serversData.totalItems === 1 ? t('common.server') : t('common.servers')}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{serversData.servers.filter(s => s.isRecommended).length}</span> {t('common.recommended')}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('details.lastUpdated') || t('listing.lastUpdated')}: {new Date().toLocaleDateString(
              language === 'en' ? 'en-US' : 
              language === 'ja' ? 'ja-JP' : 
              language === 'es' ? 'es-ES' : 
              language === 'de' ? 'de-DE' : 
              language === 'zh-hans' ? 'zh-CN' : 
              language === 'zh-hant' ? 'zh-TW' : 
              'en-US'
            )}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : serversData.servers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {searchKeyword ? t('search.noResults') : t('listing.noServers')}
          </h2>
          <p className="text-gray-600">
            {searchKeyword ? 
              t('search.tryDifferent') : 
              t('listing.noServersDescription')}
          </p>
          {searchKeyword && (
            <button
              onClick={handleClearSearch}
              className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-colors duration-200"
            >
              {t('search.clearAndShowAll')}
            </button>
          )}
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serversData.servers.map((server) => (
              <ServerCard key={server.mcpId} server={server} />
            ))}
          </div>
          
          {/* Pagination Toolbar */}
          {serversData.totalPages > 0 && (
            <div className="mt-8 bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-4">
                {/* Page Size Selector */}
                <div className="flex items-center space-x-2">
                  <label htmlFor="pageSize" className="text-sm text-gray-600">
                    {t('pagination.itemsPerPage')}
                  </label>
                  <div className="relative">
                    <select
                      id="pageSize"
                      value={pageSize}
                      onChange={handlePageSizeChange}
                      className="appearance-none bg-white border border-gray-200 rounded-md py-1 pl-3 pr-8 text-sm text-gray-700 cursor-pointer focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      {pageSizeOptions.map(size => (
                        <option key={`size-${size}`} value={size}>{size}</option>
                      ))}
                    </select>
                    <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                      <ChevronDown size={14} />
                    </div>
                  </div>
                </div>
                
                {/* Items Showing Info */}
                <div className="text-sm text-gray-600">
                  {t('pagination.showing')} {((serversData.currentPage - 1) * pageSize) + 1}-
                  {Math.min(serversData.currentPage * pageSize, serversData.totalItems)} {t('pagination.of')} {serversData.totalItems} {t('common.servers')}
                </div>
              </div>
              
              {serversData.totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  {/* Previous Page Button */}
                <button 
                  onClick={() => handlePageChange(serversData.currentPage - 1)}
                  disabled={serversData.currentPage === 1}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('pagination.previous')}
                >
                  <ChevronLeft size={18} />
                </button>
                
                {/* Page Numbers */}
                {getPageNumbers().map((page, index) => 
                  page === 'ellipsis' ? (
                    <span key={`ellipsis-${index}`} className="px-2 py-1">...</span>
                  ) : (
                    <button
                      key={`page-${page}`}
                      onClick={() => handlePageChange(page as number)}
                      disabled={page === serversData.currentPage}
                      className={`px-3 py-1 rounded text-sm transition-colors ${
                        page === serversData.currentPage 
                          ? 'bg-indigo-600 text-white font-medium'
                          : 'hover:bg-gray-100 text-gray-700'
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
                
                {/* Next Page Button */}
                <button 
                  onClick={() => handlePageChange(serversData.currentPage + 1)}
                  disabled={serversData.currentPage === serversData.totalPages}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('pagination.next')}
                >
                  <ChevronRight size={18} />
                </button>
              </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
