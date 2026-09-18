import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from "react";

import {
    auth,
    getToken,
} from "./api";


const C = createContext(null);


export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        try {
            return JSON.parse(
                localStorage.getItem("hikeupUser")
            );
        } catch {
            return null;
        }
    });


    const [loading, setLoading] = useState(
        !!getToken()
    );


    useEffect(() => {
        if (!getToken()) {
            setLoading(false);
            return;
        }


        auth
            .me()
            .then((d) => {
                setUser(d.user);
            })
            .catch(() => {
                localStorage.clear();
                setUser(null);
            })
            .finally(() => {
                setLoading(false);
            });
    }, []);


    const login = (data) => {
        localStorage.setItem(
            "hikeupToken",
            data.token
        );

        localStorage.setItem(
            "hikeupUser",
            JSON.stringify(data.user)
        );

        setUser(data.user);
    };


    const logout = () => {
        localStorage.removeItem("hikeupToken");
        localStorage.removeItem("hikeupUser");

        setUser(null);
    };


    return (
        <C.Provider
            value={{
                user,
                login,
                logout,
                loading,
            }}
        >
            {children}
        </C.Provider>
    );
}


export const useAuth = () => useContext(C);