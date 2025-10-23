import React, { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

const ButtonTop = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      setIsVisible(window.scrollY > 200);
    };

    window.addEventListener('scroll', toggleVisibility);
    return () => window.removeEventListener('scroll', toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    isVisible && (
      <button
        onClick={scrollToTop}
        className="fixed bottom-5 right-5 z-50 p-2 rounded-full bg-red-600 text-white hover:bg-red-700 transition duration-300"
        aria-label="Kembali ke atas"
      >
        <ArrowUp size={20} />
      </button>
    )
  );
};

export default ButtonTop;