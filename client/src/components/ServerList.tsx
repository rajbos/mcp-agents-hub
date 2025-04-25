import { useState, useEffect, useRef } from 'react';
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
  const [animationDirection, setAnimationDirection] = useState<'left' | 'right' | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const listContainerRef = useRef<HTMLDivElement>(null);

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
  
  // Reset animation state when new data is loaded
  useEffect(() => {
    if (!isLoading && animationDirection) {
      // Wait for DOM to be updated with new content
      setTimeout(() => {
        setAnimationDirection(null);
      }, 50);
    }
  }, [isLoading, serversData]);

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= serversData.totalPages && !isLoading) {
      // Set animation direction based on which way we're moving
      const direction = page > currentPage ? 'left' : 'right';
      setAnimationDirection(direction);
      
      // Start animation
      setIsAnimating(true);
      
      // Update the page after a short delay to allow animation to complete
      setTimeout(() => {
        setCurrentPage(page);
        
        // Reset animation state after the page has changed and content is loaded
        setTimeout(() => {
          setAnimationDirection(null);
          setIsAnimating(false);
        }, 50);
      }, 300);
    }
  };

  // No longer need page numbers generation since we only show prev/next navigation

  return (
    <div className="mb-12">
      <div className="flex justify-between items-center mb-6 pb-2 border-b border-gray-200">
        {title && (
          <h3 className="text-2xl font-bold text-gray-900">
            {title}
          </h3>
        )}
        
        {/* This empty div ensures pagination is pushed to the right even when there's no title */}
        {!title && <div></div>}
        
        {/* Pagination controls at the top-right */}
        {serversData.totalPages > 1 && !isLoading && (
          <div className="flex items-center space-x-4 ml-auto">
            <button 
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('pagination.previous')}
            >
              <ChevronLeft size={16} />
            </button>
            
            {/* Page count display in the middle */}
            <span className="text-sm text-gray-500">
              {serversData.currentPage} / {serversData.totalPages}
            </span>
            
            <button 
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === serversData.totalPages}
              className="px-2 py-1 rounded hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              aria-label={t('pagination.next')}
            >
              <ChevronRight size={16} />
            </button>
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
          <div 
            ref={listContainerRef}
            className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 transition-all duration-300 ease-in-out ${
              animationDirection === 'left' ? 'translate-x-[-100%] opacity-0' : 
              animationDirection === 'right' ? 'translate-x-[100%] opacity-0' : 
              'translate-x-0 opacity-100'
            }`}
          >
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
