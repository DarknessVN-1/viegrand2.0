import React, { createContext, useContext, useState } from 'react';
import { colors as defaultColors } from '../theme/colors';

export const ThemeContext = createContext({
  colors: defaultColors,
  setColors: () => {},
});

export const ThemeProvider = ({ children }) => {
  const [themeColors] = useState(defaultColors);

  const contextValue = React.useMemo(() => ({
    colors: themeColors,
    setColors: () => {}, // Add implementation if needed
  }), [themeColors]);

  if (!contextValue.colors) {
    console.warn('ThemeProvider: colors is undefined, using default colors');
    contextValue.colors = defaultColors;
  }

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context || !context.colors) {
    console.warn('useTheme: Missing context or colors, using default colors');
    return { colors: defaultColors, setColors: () => {} };
  }
  return context;
};