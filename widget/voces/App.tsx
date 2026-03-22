import React from 'react';
import FloatingPanel from './components/FloatingPanel';

// This component simulates the context of the WordPress site.
// In the plugin, only <FloatingPanel /> would be rendered into a specific div.
function App() {
  return (
    <div className="relative w-full min-h-screen bg-neutral-900">
      
      {/* 
        MOCK BACKGROUND - Simulating the Radio Vesánico website 
        so you can see how the chat looks in context.
      */}
      <div className="absolute inset-0 z-0 opacity-30 pointer-events-none bg-[url('https://images.unsplash.com/photo-1598518619679-5847a279e025?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center grayscale contrast-125" />
      
      <div className="relative z-10 p-10 flex flex-col items-center justify-center min-h-screen text-center">
        <h1 className="text-6xl md:text-8xl font-sans font-bold text-white tracking-tighter mb-4">
          RADIO VESÁNICO
        </h1>
        <p className="text-xl text-vesanico-accent font-mono uppercase tracking-widest bg-black px-4 py-1">
          Hemos perdido la cabeza, pero la perdimos por el Rock!
        </p>
        <p className="mt-8 text-gray-500 max-w-lg mx-auto font-mono text-sm">
          [ Este es un entorno de demostración para el plugin. El reproductor de la radio estaría en la parte inferior. ]
        </p>
      </div>

      {/* 
        MOCK PLAYER BAR - To ensure the chat is positioned correctly above it 
        height is usually around 80px (h-20)
      */}
      <div className="fixed bottom-0 left-0 right-0 h-20 bg-[#1f1f1f] border-t border-[#333] z-40 flex items-center px-8 justify-between">
         <div className="flex items-center gap-4">
            <div className="w-10 h-10 bg-vesanico-accent animate-pulse"></div>
            <div>
              <div className="text-white font-bold font-sans tracking-wide">THE CURE</div>
              <div className="text-gray-400 text-xs font-mono">A Forest</div>
            </div>
         </div>
         <div className="hidden md:flex text-gray-500 font-mono text-xs">
            03:45 / 05:55
         </div>
      </div>

      {/* 
        ACTUAL PLUGIN COMPONENT 
        This is what will be injected into the WordPress site
      */}
      <FloatingPanel />
      
    </div>
  );
}

export default App;