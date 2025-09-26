import  { useState } from 'react';
import PageContext from './PageContext';

// This component will manage and provide the theme state
export const PageProvider = ({ children }) => {
  // Initialize the view state to 'home'
  const [view, setView] = useState('home');

  // The value object will pass down the current view and the function to update it
  const value = { view, setView };

  return (
    <PageContext.Provider value={value}>
      {children}
    </PageContext.Provider>
  );
};



