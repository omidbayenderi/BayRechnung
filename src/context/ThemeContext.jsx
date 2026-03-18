import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  // theme forced to 'light' for now
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', 'light');
    // Disable localStorage for theme to prevent persistent dark mode
    localStorage.removeItem('app-theme');
  }, []);

  const toggleTheme = (newTheme) => {
    // Disable theme toggling for now
    // setTheme(newTheme);
  };

  return (
    <ThemeContext.Provider value={{ theme: 'light', toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
