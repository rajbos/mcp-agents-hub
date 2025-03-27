import { useState, useMemo, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ServerCard } from '../components/ServerCard';
import { fetchMCPServers } from '../data/servers';
import { MCPServer } from '../types';
import { Plug, Zap, Link, ChevronRight } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const { t } = useLanguage();
  const [inputQuery, setInputQuery] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [servers, setServers] = useState<MCPServer[]>([]);
  const [visibleRecommendedCount, setVisibleRecommendedCount] = useState(6);
  const [visibleOtherCount, setVisibleOtherCount] = useState(12);
  const RECOMMENDED_STEP = 6;
  const OTHER_STEP = 12;

  useEffect(() => {
    const loadServers = async () => {
      const data = await fetchMCPServers();
      setServers(data);
    };
    loadServers();
  }, []);

  useEffect(() => {
    setVisibleRecommendedCount(6);
    setVisibleOtherCount(12);
  }, [searchQuery]);

  const handleSearch = (query: string) => {
    setSearchQuery(query);
  };

  const filteredServers = useMemo(() => {
    const query = searchQuery.toLowerCase();
    return servers.filter((server) => (
      server.name.toLowerCase().includes(query) ||
      server.author.toLowerCase().includes(query) ||
      server.description.toLowerCase().includes(query) ||
      server.tags.some((tag) => tag.toLowerCase().includes(query))
    ));
  }, [searchQuery, servers]);

  const recommendedServers = useMemo(() => {
    return filteredServers.filter(server => server.isRecommended);
  }, [filteredServers]);

  const otherServers = useMemo(() => {
    return filteredServers.filter(server => !server.isRecommended);
  }, [filteredServers]);

  const handleLoadMoreRecommended = () => {
    setVisibleRecommendedCount(prev => 
      Math.min(prev + RECOMMENDED_STEP, recommendedServers.length)
    );
  };

  const handleLoadMoreOther = () => {
    setVisibleOtherCount(prev => 
      Math.min(prev + OTHER_STEP, otherServers.length)
    );
  };

  const visibleRecommendedServers = recommendedServers.slice(0, visibleRecommendedCount);
  const visibleOtherServers = otherServers.slice(0, visibleOtherCount);

  return (
    <>
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">{t('home.tagline')}</h2>
            <p className="text-xl text-blue-100 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Plug className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('home.feature1.title')}</h3>
              <p className="text-blue-100">{t('home.feature1.description')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Zap className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('home.feature2.title')}</h3>
              <p className="text-blue-100">{t('home.feature2.description')}</p>
            </div>
            <div className="flex flex-col items-center text-center p-6 rounded-lg bg-white/10 backdrop-blur-lg">
              <Link className="h-12 w-12 mb-4" />
              <h3 className="text-xl font-semibold mb-2">{t('home.feature3.title')}</h3>
              <p className="text-blue-100">{t('home.feature3.description')}</p>
            </div>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
            {t('home.discover.title')}
          </h2>
          <p className="mt-4 text-xl text-gray-600 max-w-2xl mx-auto">
            {t('home.discover.description')}
          </p>
          <p className="mt-3 text-lg text-indigo-600 font-medium">
            {servers.length} {t('home.serverCount', { count: servers.length })}
          </p>
          <div className="mt-8 flex justify-center">
            <SearchBar value={inputQuery} onChange={setInputQuery} onSearch={handleSearch} />
          </div>
        </div>

        {recommendedServers.length > 0 && (
          <div className="mb-12">
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              {t('home.recommendedServers')}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleRecommendedServers.map((server) => (
                <ServerCard key={server.mcpId} server={server} />
              ))}
            </div>
            {visibleRecommendedCount < recommendedServers.length && (
              <div className="flex justify-end mt-6">
                <button 
                  onClick={handleLoadMoreRecommended}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 
                  flex items-center text-sm font-medium group"
                >
                  <span>{t('home.loadMore')}</span>
                  <span className="text-xs mx-2">
                    ({visibleRecommendedCount} {t('home.of')} {recommendedServers.length})
                  </span>
                  <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}

        {otherServers.length > 0 && (
          <div>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 pb-2 border-b border-gray-200">
              {otherServers.length > 0 && recommendedServers.length > 0 ? t('home.otherServers') : ''}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {visibleOtherServers.map((server) => (
                <ServerCard key={server.mcpId} server={server} />
              ))}
            </div>
            {visibleOtherCount < otherServers.length && (
              <div className="flex justify-end mt-6">
                <button 
                  onClick={handleLoadMoreOther}
                  className="text-indigo-600 hover:text-indigo-800 transition-colors duration-300 
                  flex items-center text-sm font-medium group"
                >
                  <span>{t('home.loadMore')}</span>
                  <span className="text-xs mx-2">
                    ({visibleOtherCount} {t('home.of')} {otherServers.length})
                  </span>
                  <ChevronRight className="h-5 w-5 ml-1 group-hover:translate-x-1 transition-transform" strokeWidth={2.5} />
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </>
  );
}