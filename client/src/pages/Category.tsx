import React from 'react';
import { useParams } from 'react-router-dom';
import { useLanguage } from '../contexts/LanguageContext';

export function Category() {
  const { t } = useLanguage();
  const { categoryKey } = useParams();
  
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">hello category</h1>
      
      {categoryKey && (
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-semibold text-gray-800 mb-4">Category Key: {categoryKey}</h2>
          <p className="text-gray-600">You are viewing content for the <span className="font-medium text-blue-600">{categoryKey}</span> category.</p>
        </div>
      )}
    </div>
  );
}
