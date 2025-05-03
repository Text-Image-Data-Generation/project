import React, { createContext, useState, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [authenticated, setAuthenticated] = useState(false);
    const [username, setUsername] = useState("user");
    const [userId, setUserId] = useState(null);

    return (
        <AuthContext.Provider
            value={{
                authenticated,
                setAuthenticated,
                username,
                setUsername,
                userId,
                setUserId
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
