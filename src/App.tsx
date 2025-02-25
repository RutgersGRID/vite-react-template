import React from 'react';
import HelloWorld from './components/HelloWorld';

function App() {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <header className="mb-10 text-center">
          <h1 className="text-4xl font-extrabold text-gray-900">
            Vite React Template
          </h1>
          <p className="mt-2 text-lg text-gray-600">
            Built with Vite, React, TypeScript, Tailwind CSS and Bun
          </p>
        </header>
        
        <main>
          {/* Using the HelloWorld component with all its Tailwind features */}
          <HelloWorld initialName="React Developer" />
        </main>
        
        <footer className="mt-12 text-center text-sm text-gray-500">
          <p>© {new Date().getFullYear()} - RutgersGRID</p>
          <p className="mt-1">A modern React template for rapid development</p>
        </footer>
      </div>
    </div>
  );
}

export default App;