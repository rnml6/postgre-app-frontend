import React from 'react';
import { FiMessageSquare, FiCompass } from 'react-icons/fi';

const Layout = ({ children, activeTab, setActiveTab }) => {
  const tabs = [
    { id: 'posts', label: 'Explore', icon: <FiCompass size={20} /> },
    { id: 'messages', label: 'Messages', icon: <FiMessageSquare size={20} /> },
  ];

  return (
    <div className="min-h-screen bg-white">
      <aside className="fixed left-0 top-0 h-full w-20 hidden lg:flex flex-col items-center py-8 border-r border-gray-100 bg-white z-50">
        <div className="w-12 h-12 bg-red-600 rounded-full flex items-center justify-center mb-12 shadow-lg shadow-red-200">
          <span className="text-white font-black text-xs">3B</span>
        </div>
        
        <nav className="flex flex-col gap-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-2xl transition-all duration-300 ${
                activeTab === tab.id 
                  ? 'bg-black text-white shadow-xl scale-110' 
                  : 'text-gray-400 hover:text-black hover:bg-gray-50'
              }`}
            >
              {tab.icon}
            </button>
          ))}
        </nav>
      </aside>

<header className="lg:hidden sticky top-0 bg-white/90 backdrop-blur-md z-40 pb-5 px-6 py-8 flex justify-center items-center overflow-hidden">
  <div className="relative">
    <span className="absolute -top-4 -left-6 text-6xl font-black text-gray-50 select-none">
      3B
    </span>
    
    <h1 className="relative flex items-baseline justify-center gap-1">
      <span className="text-4xl font-black tracking-tighter text-black">
        BSIT
      </span>
      
      <div className="relative">
        <span className="text-5xl font-black tracking-tighter text-red-600">
          3B
        </span>
        <div className="absolute -bottom-1.5 left-0 w-full h-2 bg-black rounded-full" />
      </div>
    </h1>
    
    <p className="text-[10px] font-bold tracking-[0.5em] text-gray-400 uppercase text-center mt-2">
      di Makausad
    </p>
  </div>
</header>

      <main className="lg:ml-20 min-h-screen">
        <div className="max-w-[1600px] mx-auto p-4 md:p-8">
          {children}
        </div>
      </main>

      <div className="lg:hidden fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-8 py-4 rounded-full shadow-2xl z-50 flex gap-12 items-center border border-white/10 transition-transform active:scale-95">
        {tabs.map((tab) => (
          <button 
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`transition-all duration-300 ${
              activeTab === tab.id 
                ? 'opacity-100 scale-125' 
                : 'opacity-40 hover:opacity-70'
            }`}
          >
            {tab.icon}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Layout;