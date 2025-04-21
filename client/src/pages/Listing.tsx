import { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ServerCard } from '../components/ServerCard';
import { MCPServer } from '../types';
import { ChevronLeft, ChevronRight, ChevronDown } from 'lucide-react';

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
  
  // Get page and size from URL or use defaults
  const initialPage = parseInt(searchParams.get('page') || '1', 10);
  const initialSize = parseInt(searchParams.get('size') || '12', 10);
  
  const [serversData, setServersData] = useState<PaginatedResponse>({
    servers: [],
    totalItems: 0,
    currentPage: initialPage,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(initialSize);
  const pageSizeOptions = [6, 12, 24, 48];

  // Fetch servers for the given category and page
  const fetchServers = async (page = 1, size = pageSize) => {
    if (!categoryKey) return;
    
    try {
      setIsLoading(true);
      
      const url = `/v1/hub/search_servers?categoryKey=${categoryKey}&locale=${language || 'en'}&page=${page}&size=${size}`;
      const response = await fetch(url);
      
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
    // Use the initial page from URL parameters
    fetchServers(initialPage, pageSize);
  }, [categoryKey, language, initialPage, pageSize]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= serversData.totalPages) {
      // Update URL with new page parameter
      navigate(`/listing/${categoryKey}?page=${page}&size=${pageSize}`);
      
      fetchServers(page);
      // Scroll to top of the list when changing pages
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePageSizeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newSize = parseInt(event.target.value, 10);
    setPageSize(newSize);
    
    // Update URL with new size parameter and reset to page 1
    navigate(`/listing/${categoryKey}?page=1&size=${newSize}`);
    
    // Reset to first page when changing page size
    fetchServers(1, newSize);
    window.scrollTo({ top: 0, behavior: 'smooth' });
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
                {t('home.title') || 'MCP Hub'}
              </a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li>
              <a className="hover:text-indigo-600 transition-colors duration-200">
                {t('navigation.servers') || 'Servers'}
              </a>
            </li>
            <li className="flex items-center">
              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </li>
            <li className="flex items-center">
              <span className="text-gray-600">
                {t('navigation.category') || 'Category'}:
              </span>
            </li>
            <li className="font-medium text-gray-900 ml-1">
              {t(`category.${categoryKey}`) || t(`category-common.${categoryKey}`) || formatCategoryName(categoryKey)}
            </li>
          </ol>
        </nav>
      )}
      
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
            {t('details.lastUpdated') || t('listing.lastUpdated') || "Last Updated"}: {new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'zh-hans' ? 'zh-CN' : language === 'zh-hant' ? 'zh-TW' : 'en-US')}
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
            {t('listing.noServers')}
          </h2>
          <p className="text-gray-600">
            {t('listing.noServersDescription')}
          </p>
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
                    {t('pagination.itemsPerPage') || 'Items per page:'}
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
                  {t('pagination.showing') || 'Showing'} {((serversData.currentPage - 1) * pageSize) + 1}-
                  {Math.min(serversData.currentPage * pageSize, serversData.totalItems)} {t('pagination.of') || 'of'} {serversData.totalItems} {t('common.servers')}
                </div>
              </div>
              
              {serversData.totalPages > 1 && (
                <div className="flex items-center space-x-1">
                  {/* Previous Page Button */}
                <button 
                  onClick={() => handlePageChange(serversData.currentPage - 1)}
                  disabled={serversData.currentPage === 1}
                  className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('pagination.previous') || 'Previous page'}
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
                  aria-label={t('pagination.next') || 'Next page'}
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
