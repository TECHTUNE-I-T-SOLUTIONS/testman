'use client';

import { useEffect, useState } from 'react';
import type { FC } from "react";


const CookieNotice: FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const hasAccepted = localStorage.getItem('cookieAccepted');
    if (!hasAccepted) {
      setIsVisible(true);
    }
  }, []);

  const handleAccept = () => {
    localStorage.setItem('cookieAccepted', 'true');
    setIsVisible(false);
  };

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-white border border-gray-300 shadow-lg rounded-md p-4 max-w-sm w-full animate-fade-in">
      <p className="text-sm text-gray-800 mb-3">
        This website uses cookies to enhance the user experience. By continuing to browse, you agree to our use of cookies.
      </p>
      <button
        onClick={handleAccept}
        className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition-all text-sm"
      >
        Okay
      </button>
    </div>
  );
};

export default CookieNotice;
