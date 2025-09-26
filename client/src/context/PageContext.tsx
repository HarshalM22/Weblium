import { createContext } from 'react';

// 1. Create the context
const PageContext = createContext(null);

// 2. Create the Provider component
// export const PageProvider = ({ children }) => {
//   // Initialize the view state to 'home'
//   const [view, setView] = useState('home');

//   // The value object will pass down the current view and the function to update it
//   const value = { view, setView };

//   return (
//     <PageContext.Provider value={value}>
//       {children}
//     </PageContext.Provider>
//   );
// };

export default PageContext;