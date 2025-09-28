import { createContext, useState, useContext, useEffect } from 'react';


const AuthContext = createContext(null);


export const AuthProvider = ({ children }) => {
  const [authToken, setAuthToken] = useState(String);

  
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setAuthToken(token);
    }
  }, []);

 

  // The value that will be provided to all consuming components.
  // We include the token, login/logout functions, and a helpful boolean.
  const value = {
    authToken,
    isAuthenticated: !!authToken, // Converts the token string to a boolean
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// 3. Create a Custom Hook
// This makes it easier and cleaner to use the context in other components.
export const useAuth = () => {
  return useContext(AuthContext);
};