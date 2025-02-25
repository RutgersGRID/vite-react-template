import React, { useState } from 'react';

interface HelloWorldProps {
  initialName?: string;
}

const HelloWorld: React.FC<HelloWorldProps> = ({ initialName = 'World' }) => {
  const [name, setName] = useState<string>(initialName);
  const [greeting, setGreeting] = useState<string>('Hello');
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  const [showFeatures, setShowFeatures] = useState<boolean>(false);

  const handleNameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setName(event.target.value);
  };

  const handleGreetingChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setGreeting(event.target.value);
  };

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const toggleFeatures = () => {
    setShowFeatures(!showFeatures);
  };

  return (
    <div className={`transition-colors duration-300 ${
      theme === 'light' 
        ? 'bg-white text-gray-800' 
        : 'bg-gray-800 text-white'
      } p-8 rounded-xl shadow-lg max-w-2xl mx-auto`}
    >
      {/* Header with responsive design */}
      <div className="flex flex-col sm:flex-row justify-between items-center mb-8">
        <h1 className={`text-4xl font-bold ${
          theme === 'light' ? 'text-blue-600' : 'text-blue-400'
        } mb-4 sm:mb-0`}>
          {greeting}, {name}!
        </h1>
        
        <button
          onClick={toggleTheme}
          className={`px-4 py-2 rounded-full flex items-center space-x-2 transition-colors ${
            theme === 'light' 
              ? 'bg-gray-200 hover:bg-gray-300' 
              : 'bg-gray-700 hover:bg-gray-600'
          }`}
        >
          <span className="text-sm font-medium">
            {theme === 'light' ? '🌙 Dark' : '☀️ Light'}
          </span>
        </button>
      </div>

      {/* Controls with Tailwind form styling */}
      <div className="space-y-5 mb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <label htmlFor="nameInput" className="block text-sm font-medium">
              Name:
            </label>
            <input 
              type="text" 
              id="nameInput" 
              value={name} 
              onChange={handleNameChange}
              placeholder="Enter a name"
              className={`w-full px-4 py-2 rounded-md border ${
                theme === 'light' 
                  ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-600 bg-gray-700 focus:border-blue-400 focus:ring-blue-400'
              } focus:outline-none focus:ring-2 transition-colors`}
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="greetingSelect" className="block text-sm font-medium">
              Greeting:
            </label>
            <select 
              id="greetingSelect" 
              value={greeting} 
              onChange={handleGreetingChange}
              className={`w-full px-4 py-2 rounded-md border ${
                theme === 'light' 
                  ? 'border-gray-300 focus:border-blue-500 focus:ring-blue-500' 
                  : 'border-gray-600 bg-gray-700 focus:border-blue-400 focus:ring-blue-400'
              } focus:outline-none focus:ring-2 transition-colors`}
            >
              <option value="Hello">Hello</option>
              <option value="Hi">Hi</option>
              <option value="Hey">Hey</option>
              <option value="Greetings">Greetings</option>
              <option value="Welcome">Welcome</option>
            </select>
          </div>
        </div>
      </div>

      {/* Features showcase section with toggle */}
      <div className="mt-8">
        <button
          onClick={toggleFeatures}
          className={`w-full py-3 px-4 rounded-md font-medium transition-colors ${
            theme === 'light'
              ? 'bg-blue-600 hover:bg-blue-700 text-white'
              : 'bg-blue-500 hover:bg-blue-600 text-white'
          }`}
        >
          {showFeatures ? 'Hide' : 'Show'} Tailwind Features
        </button>

        {showFeatures && (
          <div className={`mt-6 p-6 rounded-lg ${
            theme === 'light' ? 'bg-gray-100' : 'bg-gray-900'
          }`}>
            <h2 className="text-2xl font-bold mb-4">Tailwind CSS Features</h2>
            
            {/* Grid Layout */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Responsive Grid</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {[1, 2, 3, 4].map((item) => (
                  <div 
                    key={item}
                    className={`p-4 rounded ${
                      theme === 'light' 
                        ? 'bg-blue-100 text-blue-800' 
                        : 'bg-blue-900 text-blue-100'
                    } text-center`}
                  >
                    Item {item}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Flexbox */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Flexbox Layout</h3>
              <div className="flex flex-wrap gap-2">
                {['sm', 'md', 'lg', 'xl'].map((size) => (
                  <div 
                    key={size}
                    className={`px-3 py-1 rounded-full ${
                      theme === 'light' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-green-900 text-green-100'
                    }`}
                  >
                    Size: {size}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Typography */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-3">Typography</h3>
              <p className="text-sm mb-2">Small text (text-sm)</p>
              <p className="text-base mb-2">Base text (text-base)</p>
              <p className="text-lg mb-2">Large text (text-lg)</p>
              <p className="text-xl mb-2">Extra large text (text-xl)</p>
              <p className="font-light mb-2">Light font weight</p>
              <p className="font-bold mb-2">Bold font weight</p>
              <p className="italic mb-2">Italic style</p>
              <p className="underline">Underlined text</p>
            </div>
            
            {/* Animations & Transitions */}
            <div>
              <h3 className="text-lg font-semibold mb-3">Animations & Effects</h3>
              <div className="flex flex-wrap gap-4">
                <div className="transform hover:scale-110 transition-transform duration-300 p-4 rounded bg-purple-500 text-white">
                  Hover Scale
                </div>
                <div className="hover:rotate-12 transition-transform duration-300 p-4 rounded bg-yellow-500 text-white">
                  Hover Rotate
                </div>
                <div className="animate-pulse p-4 rounded bg-red-500 text-white">
                  Pulse Animation
                </div>
                <div className="hover:shadow-2xl transition-shadow duration-300 p-4 rounded bg-indigo-500 text-white">
                  Shadow on Hover
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default HelloWorld;