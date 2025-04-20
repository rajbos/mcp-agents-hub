import { useState, useEffect, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';
import { ServerCard } from '../components/ServerCard';
import { MCPServer } from '../types';
import { ChevronRight } from 'lucide-react';

export function Category() {
  const { t, language } = useLanguage();
  const { categoryKey } = useParams();
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [visibleCount, setVisibleCount] = useState(12);
  const LOAD_MORE_STEP = 12;

  useEffect(() => {
    const fetchCategoryServers = async () => {
      if (!categoryKey) return;
      
      try {
        setIsLoading(true);
        const url = `/v1/hub/search_servers?categoryKey=${categoryKey}&locale=${language || 'en'}`;
        const response = await fetch(url);
        
        if (!response.ok) {
          throw new Error(t('category.fetchError') || 'Failed to fetch category servers');
        }
        
        const data = await response.json();
        setServers(data);
      } catch (error) {
        console.error('Error fetching category servers:', error);
        setServers([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategoryServers();
    // Reset visible count when category changes
    setVisibleCount(12);
  }, [categoryKey, language]);

  const visibleServers = useMemo(() => {
    return servers.slice(0, visibleCount);
  }, [servers, visibleCount]);

  const handleLoadMore = () => {
    setVisibleCount(prev => Math.min(prev + LOAD_MORE_STEP, servers.length));
  };

  const formatCategoryName = (key: string) => {
    return key
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
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
            <li className="font-medium text-gray-900">
              {t(`category.${categoryKey}`) || t(`category-common.${categoryKey}`) || formatCategoryName(categoryKey)}
            </li>
          </ol>
        </nav>
      )}
      
      {/* Toolbar with statistics */}
      {!isLoading && servers.length > 0 && (
        <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-4 flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <div className="px-3 py-1 bg-blue-50 rounded-md text-blue-700 font-medium text-sm">
              {servers.length} {servers.length === 1 ? t('common.server') : t('common.servers')}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">{servers.filter(s => s.isRecommended).length}</span> {t('common.recommended')}
            </div>
          </div>
          <div className="text-sm text-gray-500">
            {t('details.lastUpdated') || t('category.lastUpdated') || "Last Updated"}: {new Date().toLocaleDateString(language === 'en' ? 'en-US' : language === 'ja' ? 'ja-JP' : language === 'es' ? 'es-ES' : language === 'de' ? 'de-DE' : language === 'zh-hans' ? 'zh-CN' : language === 'zh-hant' ? 'zh-TW' : 'en-US')}
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="py-12 text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"></div>
          <p className="mt-4 text-gray-600">{t('common.loading')}</p>
        </div>
      ) : servers.length === 0 ? (
        <div className="bg-white rounded-xl shadow-md p-8 text-center">
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {t('category.noServers')}
          </h2>
          <p className="text-gray-600">
            {t('category.noServersDescription')}
          </p>
        </div>
      ) : (
        <div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {visibleServers.map((server) => (
              <ServerCard key={server.mcpId} server={server} />
            ))}
          </div>
          
          {visibleCount < servers.length && (
            <div className="flex justify-end mt-6">
              <button 
                onClick={handleLoadMore}
                className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 
                flex items-center text-sm font-medium group"
              >
                <span>{t('home.loadMore')}</span>
                <span className="text-xs mx-2">
                  ({visibleCount} {t('home.of')} {servers.length})
                </span>
                <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
