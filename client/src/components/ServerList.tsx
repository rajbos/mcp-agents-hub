import { useState, useEffect } from 'react';
import { ServerCard } from './ServerCard';
import { MCPServer } from '../types';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

// Define interface for paginated response
interface PaginatedResponse {
  servers: MCPServer[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
}

interface ServerListProps {
  isRecommended?: boolean;
  initialPageSize?: number;
  categoryKey?: string;
  searchKeyword?: string;
  title?: string;
}

export function ServerList({
  isRecommended,
  initialPageSize = 6,
  categoryKey,
  searchKeyword,
  title
}: ServerListProps) {
  const { t, language } = useLanguage();
  const [serversData, setServersData] = useState<PaginatedResponse>({
    servers: [],
    totalItems: 0,
    currentPage: 1,
    totalPages: 1
  });
  const [isLoading, setIsLoading] = useState(true);
  const [pageSize, setPageSize] = useState<number>(initialPageSize);
  const [currentPage, setCurrentPage] = useState<number>(1);

  // Fetch servers with the given parameters
  const fetchServers = async (page = 1, size = pageSize) => {
    try {
      setIsLoading(true);
      
      const url = `/v1/hub/search_servers`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          categoryKey: categoryKey === "all" ? undefined : categoryKey,
          locale: language || 'en',
          page: page,
          size: size,
          search_for: searchKeyword || undefined,
          isRecommended: isRecommended !== undefined ? isRecommended : undefined
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch servers');
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
    fetchServers(currentPage, pageSize);
  }, [categoryKey, language, searchKeyword, isRecommended, pageSize, currentPage]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= serversData.totalPages) {
      setCurrentPage(page);
      // Don't scroll to top when changing pages via pagination arrows
    }
  };

  // Generate array of page numbers to display
  const getPageNumbers = () => {
    const maxPagesToShow = 5;
    const { currentPage: page, totalPages } = serversData;
    
    if (totalPages <= maxPagesToShow) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    
    // Always include first page, last page, current page and pages adjacent to current
    let pages = [1, totalPages, page];
    
    // Add one page before and after the current page if possible
    if (page > 1) {
      pages.push(page - 1);
    }
    
    if (page < totalPages) {
      pages.push(page + 1);
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
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
        {title && (
          <h3 className="text-2xl font-bold text-gray-900">
            {title}
          </h3>
        )}
        
        {/* Pagination controls at the top-right */}
        {serversData.totalPages > 1 && !isLoading && (
          <div className="flex items-center space-x-1">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('pagination.previous')}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page Numbers */}
            {getPageNumbers().map((page, index) => 
              page === 'ellipsis' ? (
                <span key={`ellipsis-${index}`} className="px-2 py-1 text-sm">...</span>
              ) : (
                <button
                  key={`page-${page}`}
                  onClick={() => handlePageChange(page as number)}
                  disabled={page === currentPage}
                  className={`px-2 py-1 rounded text-sm transition-colors ${
                    page === currentPage 
                      ? 'bg-indigo-600 text-white font-medium'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  {page}
                </button>
              )
            )}
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === serversData.totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('pagination.next')}
            >
              <ChevronRight size={16} />
            </button>
            
            <span className="text-sm text-gray-500 ml-2">
              {serversData.currentPage} / {serversData.totalPages}
            </span>
          </div>
        )}
      </div>
      
      {isLoading ? (
        <div className="py-8 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : serversData.servers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-6 text-center">
          <p className="text-gray-600">
            {t('listing.noServers')}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {serversData.servers.map((server) => (
              <ServerCard key={server.mcpId} server={server} />
            ))}
          </div>
          
          {/* No "Load More" button - pagination controls at the top are sufficient */}
        </>
      )}
    </div>
  );
}
