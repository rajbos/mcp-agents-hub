import React from 'react';
import { Plug, GitBranch, Users, Building, Database, Code, Github, Layers, Globe, Zap } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

export function About() {
  const { t } = useLanguage();
  
  return (
    <div>
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h1 className="text-4xl font-bold text-center mb-4">
            {t('about.hero.title')}
          </h1>
          <p className="text-xl text-blue-100 max-w-2xl mx-auto text-center">
            {t('about.hero.subtitle')}
          </p>
        </div>
      </div>
      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* What is MCP Section */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.whatIsMcp.title')}</h2>
          <p className="text-lg text-gray-600 mb-4 leading-relaxed">
            {t('about.whatIsMcp.paragraph1')}
          </p>
          
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {t('about.whatIsMcp.paragraph2')}
          </p>
          
          <div className="bg-gray-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about.whatIsMcp.components.title')}</h3>
            <div className="grid md:grid-cols-3 gap-6 mt-6">
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Layers className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">{t('about.whatIsMcp.components.specification.title')}</h4>
                </div>
                <p className="text-gray-600">
                  {t('about.whatIsMcp.components.specification.description')}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Database className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">{t('about.whatIsMcp.components.servers.title')}</h4>
                </div>
                <p className="text-gray-600">
                  {t('about.whatIsMcp.components.servers.description')}
                </p>
              </div>
              <div className="flex flex-col">
                <div className="flex items-center mb-3">
                  <div className="bg-blue-100 rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Plug className="h-5 w-5 text-blue-600" />
                  </div>
                  <h4 className="font-semibold text-lg">{t('about.whatIsMcp.components.clients.title')}</h4>
                </div>
                <p className="text-gray-600">
                  {t('about.whatIsMcp.components.clients.description')}
                </p>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">{t('about.whatIsMcp.whyMarketplace.title')}</h3>
            <p className="text-lg text-gray-600 leading-relaxed mb-6">
              {t('about.whatIsMcp.whyMarketplace.description')}
            </p>
            <ul className="list-disc pl-6 mb-4 text-lg text-gray-600 space-y-2">
              <li>{t('about.whatIsMcp.whyMarketplace.benefits.discover')}</li>
              <li>{t('about.whatIsMcp.whyMarketplace.benefits.share')}</li>
              <li>{t('about.whatIsMcp.whyMarketplace.benefits.learn')}</li>
              <li>{t('about.whatIsMcp.whyMarketplace.benefits.deploy')}</li>
            </ul>
          </div>
        </div>
        {/* Marketplace Features */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.features.title')}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {t('about.features.description')}
          </p>
          
          <div className="grid md:grid-cols-3 gap-8 mt-12">
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Code className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('about.features.serverBuilding.title')}</h3>
              <p className="text-gray-600">
                {t('about.features.serverBuilding.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Plug className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('about.features.clientDevelopment.title')}</h3>
              <p className="text-gray-600">
                {t('about.features.clientDevelopment.description')}
              </p>
            </div>
            
            <div className="bg-white rounded-xl p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center mb-4">
                <Database className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-3">{t('about.features.toolDiscovery.title')}</h3>
              <p className="text-gray-600">
                {t('about.features.toolDiscovery.description')}
              </p>
            </div>
          </div>
        </div>
        {/* Showcase Section - New */}
        <div className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.showcase.title')}</h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            {t('about.showcase.description')}
          </p>
          
          <div className="bg-white rounded-xl border border-gray-200 p-8 mb-8">
            <blockquote className="text-xl text-gray-600 italic mb-4">
              {t('about.showcase.quote.text')}
            </blockquote>
            <div className="flex items-center">
              <div className="ml-4">
                <p className="text-lg font-semibold">{t('about.showcase.quote.author')}</p>
                <p className="text-gray-500">{t('about.showcase.quote.position')}</p>
              </div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Globe className="h-5 w-5 text-blue-600 mr-2" />
                {t('about.showcase.forOrganizations.title')}
              </h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>{t('about.showcase.forOrganizations.benefits.deploy')}</li>
                <li>{t('about.showcase.forOrganizations.benefits.connect')}</li>
                <li>{t('about.showcase.forOrganizations.benefits.build')}</li>
                <li>{t('about.showcase.forOrganizations.benefits.maintain')}</li>
              </ul>
            </div>
            <div className="bg-gray-50 rounded-xl p-6">
              <h3 className="text-xl font-semibold mb-3 flex items-center">
                <Users className="h-5 w-5 text-blue-600 mr-2" />
                {t('about.showcase.forDevelopers.title')}
              </h3>
              <ul className="list-disc pl-6 text-gray-600 space-y-2">
                <li>{t('about.showcase.forDevelopers.benefits.enhance')}</li>
                <li>{t('about.showcase.forDevelopers.benefits.buildOnce')}</li>
                <li>{t('about.showcase.forDevelopers.benefits.contribute')}</li>
                <li>{t('about.showcase.forDevelopers.benefits.create')}</li>
              </ul>
            </div>
          </div>
        </div>
        {/* Enterprise Focus */}
        <div className="bg-gray-50 rounded-2xl p-8 mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.enterprise.title')}</h2>
          <p className="text-lg text-gray-600 leading-relaxed mb-6">
            {t('about.enterprise.description')}
          </p>
          <ul className="list-disc pl-6 mb-6 text-lg text-gray-600 space-y-2">
            <li>{t('about.enterprise.benefits.share')}</li>
            <li>{t('about.enterprise.benefits.discover')}</li>
            <li>{t('about.enterprise.benefits.maintain')}</li>
            <li>{t('about.enterprise.benefits.foster')}</li>
          </ul>
          <div className="flex justify-center mt-8">
            <div className="bg-white rounded-xl p-6 shadow-md inline-flex items-center space-x-4">
              <div className="bg-blue-100 rounded-full w-12 h-12 flex items-center justify-center">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="text-left">
                <h3 className="text-xl font-semibold">{t('about.enterprise.onPremise.title')}</h3>
                <p className="text-gray-600">{t('about.enterprise.onPremise.description')}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Community Section */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">{t('about.community.title')}</h2>
          <p className="text-lg text-gray-600 leading-relaxed max-w-3xl mx-auto mb-8">
            {t('about.community.description')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <a
              href="https://github.com/mcp-agents-ai/mcp-agents-hub"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 transition-colors"
            >
              <Github className="mr-2 h-5 w-5" />
              {t('about.community.joinCommunity')}
            </a>
            <a
              href="https://github.com/mcp-agents-ai/mcp-agents-hub"
              className="inline-flex items-center px-6 py-3 border border-blue-600 text-base font-medium rounded-md text-blue-600 bg-white hover:bg-blue-50 transition-colors"
            >
              {t('about.community.deploymentGuide')}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}