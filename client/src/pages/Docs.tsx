import React from 'react';
import { BookOpen, Terminal, Github } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function Docs() {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">{t('docs.hero.title')}</h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            {t('docs.hero.subtitle')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Availability Section */}
        <div className="bg-white rounded-2xl shadow-lg p-8 mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">{t('docs.availability.title')}</h2>
          <div className="space-y-4 text-gray-600">
            <p className="leading-relaxed">
              {t('docs.availability.paragraph1')}
            </p>
            <p className="leading-relaxed">
              {t('docs.availability.paragraph2')}
            </p>
            <p className="leading-relaxed">
              {t('docs.availability.paragraph3')}
            </p>
          </div>
        </div>

        {/* Start Using Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('docs.startUsing.title')}</h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          {t('docs.startUsing.subtitle')}
        </p>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startUsing.claudeDesktop.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startUsing.claudeDesktop.description')}
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startUsing.claudeDesktop.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startUsing.vsCodeExtension.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startUsing.vsCodeExtension.description')}
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startUsing.vsCodeExtension.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startUsing.jetbrainsPlugin.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startUsing.jetbrainsPlugin.description')}
            </p>
            <a href="https://modelcontextprotocol.io/clients" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startUsing.jetbrainsPlugin.learnMore')}
            </a>
          </div>
        </div>

        {/* Start Building Section */}
        <h2 className="text-3xl font-bold text-gray-900 mb-4">{t('docs.startBuilding.title')}</h2>
        <p className="text-gray-600 mb-8 max-w-3xl">
          {t('docs.startBuilding.subtitle')}
        </p>
        
        {/* Server Developers Subsection */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-5">{t('docs.startBuilding.serverDevelopers.title')}</h3>
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.serverDevelopers.customServers.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.serverDevelopers.customServers.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.serverDevelopers.customServers.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.serverDevelopers.serverSDK.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.serverDevelopers.serverSDK.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.serverDevelopers.serverSDK.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.serverDevelopers.serverTemplates.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.serverDevelopers.serverTemplates.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.serverDevelopers.serverTemplates.learnMore')}
            </a>
          </div>
        </div>
        
        {/* Client Developers Subsection */}
        <h3 className="text-2xl font-semibold text-gray-800 mb-5">{t('docs.startBuilding.clientDevelopers.title')}</h3>
        <div className="grid md:grid-cols-3 gap-8 mb-16">
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.clientDevelopers.clientSDK.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.clientDevelopers.clientSDK.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.clientDevelopers.clientSDK.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Terminal className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.clientDevelopers.integrationGuide.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.clientDevelopers.integrationGuide.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.clientDevelopers.integrationGuide.learnMore')}
            </a>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow border border-gray-100">
            <div className="bg-blue-50 rounded-full w-12 h-12 flex items-center justify-center mb-4">
              <Github className="h-6 w-6 text-blue-600" />
            </div>
            <h3 className="text-xl font-semibold mb-3">{t('docs.startBuilding.clientDevelopers.contribute.title')}</h3>
            <p className="text-gray-600 mb-3">
              {t('docs.startBuilding.clientDevelopers.contribute.description')}
            </p>
            <a href="https://modelcontextprotocol.io/introduction" className="text-blue-600 hover:text-blue-800 font-medium">
              {t('docs.startBuilding.clientDevelopers.contribute.learnMore')}
            </a>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-gray-50 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">{t('docs.cta.title')}</h2>
          <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
            {t('docs.cta.subtitle')}
          </p>
          <div className="flex justify-center space-x-4">
            <a
              href="#"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              {t('docs.cta.readDocs')}
            </a>
            <a
              href="https://github.com/modelcontextprotocol"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 transition-colors"
            >
              {t('docs.cta.viewOnGithub')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}