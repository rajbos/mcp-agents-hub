import { useState, useEffect } from 'react';
import { SearchBar } from '../components/SearchBar';
import { ServerList } from '../components/ServerList';
import { CountUpAnimation } from '../components/CountUpAnimation';
import { fetchMCPServers } from '../data/servers';
import { MCPServer } from '../types';
import { Plug, Zap, Send } from 'lucide-react';
import { Link as IconLink } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Home() {
  const { t, language } = useLanguage();
  const navigate = useNavigate();
  const [inputQuery, setInputQuery] = useState('');
  const [servers, setServers] = useState<MCPServer[]>([]);

  useEffect(() => {
    const loadServers = async () => {
      const data = await fetchMCPServers(language);
      setServers(data);
    };
    loadServers();
  }, [language]); // Add language as dependency to reload when language changes

  const handleSearch = (query: string) => {
    if (query.trim()) {
      // Redirect to the listing page with the search keyword
      navigate(`/listing/all?page=1&size=12&search=${encodeURIComponent(query)}`);
    }
  };

  return (
    <>
      {/* Server Count Banner */}
      <div className="bg-amber-50 border-y border-amber-200 py-2">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center">
            <CountUpAnimation 
              endValue={servers.length} 
              duration={2500} 
              className="text-lg font-bold text-amber-800" 
            />
            <span className="ml-2 text-lg text-amber-700">{t('home.serverCount', { count: servers.length })}</span>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
          <div className="text-center mb-6 md:mb-8">
            <h2 className="text-3xl md:text-4xl font-bold mb-2 md:mb-3">{t('home.tagline')}</h2>
            <p className="text-base md:text-lg text-blue-100 max-w-2xl mx-auto">
              {t('home.subtitle')}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
            <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-5 rounded-lg bg-white/10 backdrop-blur-lg">
              <Plug className="h-8 w-8 md:h-10 md:w-10 mr-3 md:mr-0 md:mb-3 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">{t('home.feature1.title')}</h3>
                <p className="text-sm md:text-base text-blue-100">{t('home.feature1.description')}</p>
              </div>
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-5 rounded-lg bg-white/10 backdrop-blur-lg">
              <Zap className="h-8 w-8 md:h-10 md:w-10 mr-3 md:mr-0 md:mb-3 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">{t('home.feature2.title')}</h3>
                <p className="text-sm md:text-base text-blue-100">{t('home.feature2.description')}</p>
              </div>
            </div>
            <div className="flex flex-row md:flex-col items-center md:items-center text-left md:text-center p-3 md:p-5 rounded-lg bg-white/10 backdrop-blur-lg">
              <IconLink className="h-8 w-8 md:h-10 md:w-10 mr-3 md:mr-0 md:mb-3 flex-shrink-0" />
              <div>
                <h3 className="text-base md:text-lg font-semibold mb-0.5 md:mb-1">{t('home.feature3.title')}</h3>
                <p className="text-sm md:text-base text-blue-100">{t('home.feature3.description')}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Server Submit Banner */}
      <div className="bg-amber-50 border-y border-amber-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="mb-6 md:mb-0 md:mr-8">
              <div className="flex flex-col md:flex-row md:items-center gap-4 mb-3">
                <h3 className="text-2xl font-bold text-amber-900">{t('submit.benefits.title')}</h3>
              </div>
              <p className="text-amber-800 max-w-2xl mb-2">
                {t('submit.tagline')}
              </p>
              <p className="text-amber-700">
                <span className="font-medium">{t('home.submitBanner.oneClick')}</span> {t('home.submitBanner.aiSystem')}
              </p>
            </div>
            <div className="flex-shrink-0">
              <Link 
                to="/submit" 
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-amber-600 hover:bg-amber-700 transition-colors shadow-sm hover:shadow"
              >
                <Send className="h-5 w-5 mr-2" />
                {t('nav.submit')}
              </Link>
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
          <div className="mt-8 flex justify-center">
            <SearchBar value={inputQuery} onChange={setInputQuery} onSearch={handleSearch} />
          </div>
        </div>

        {/* Recommended Servers - now using ServerList component */}
        <ServerList 
          isRecommended={true} 
          initialPageSize={6} 
          title={t('home.recommendedServers')}
        />

        {/* Other Servers - now using ServerList component */}
        <ServerList 
          isRecommended={false} 
          initialPageSize={12} 
          title={t('home.otherServers')}
        />
      </main>
    </>
  );
}