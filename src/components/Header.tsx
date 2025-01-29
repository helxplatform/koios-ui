// components/Header.tsx
import React from 'react';
import banner from './../banner.png';

export const Header = () => (
  <header className="bg-gray-50 border-b border-gray-200 py-4 px-4 shadow-sm">
    <div className="container mx-auto flex items-center gap-4">
      <img 
        src={banner}
        alt="App Logo"
        className="h-25 w-100 rounded-lg"
      />
    </div>
  </header>
);