import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Default to light mode for FinSet design
  const [isDark, setIsDark] = useState(() => {
    // Clear any old theme values and default to light
    const saved = localStorage.getItem('finset-theme');
    return saved === 'dark';
  });

  useEffect(() => {
    // Save to localStorage with new key
    localStorage.setItem('finset-theme', isDark ? 'dark' : 'light');
    
    // Apply dark class to html element
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    
    // Also remove any old 'light' class that might exist from previous version
    document.documentElement.classList.remove('light');
  }, [isDark]);

  const toggleTheme = () => {
    setIsDark(prev => !prev);
  };

  const setTheme = (theme) => {
    setIsDark(theme === 'dark');
  };

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};
