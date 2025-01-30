// components/Header.tsx
import React from 'react';
import banner from './../banner.png';

export const Header = () => (

    <header className="bg-gray-50 border-b border-gray-200 pt-20 pb-4 px-4 shadow-sm"> 
    <h4 className="bg-yellow-100 border-l-4 border-r-4 border-yellow-500 text-yellow-700 p-4 fixed top-0 left-0 w-full z-50 text-center">
        This bot is still under construction. If you might experience downtimes and unexpected results, please contact us using the  {" "}
              <a 
                href="https://docs.google.com/forms/d/e/1FAIpQLSfMeejDbCv9lcc8nkYKMHpbsTMDlwbcoYx0eYG1cu5lT4yK7g/viewform" 
                className="hover:text-red-900 underline"
              >
              feedback google form
              </a>, and we will get in touch with you to resolve the situation.
    </h4>    
    <div className="container mx-auto flex items-center gap-4">
        <img 
            src={banner}
            alt="App Logo"
            className="h-25 w-100 rounded-lg"
        />
    </div>
</header>
);