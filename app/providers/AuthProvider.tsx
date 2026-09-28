"use client"
import React, { createContext, useContext, useEffect, useState } from "react";

import { createClient } from "../lib/supabase/client";
import type { Session } from "@supabase/supabase-js";

interface AuthContextType {
    session: Session | null;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const SESSION_MAX_AGE = 30 * 24 * 60 * 60 * 1000;
const LOGIN_TIMESTAMP_KEY = "moonight_login_timestamp";

export function AuthProvider({ children }: { children: React.ReactNode }) {
    const supabase = createClient();
    const [session, setSession] = useState<Session | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkSession = async () =>{
            const {data:{session},} = await supabase.auth.getSession();
            if(!session){
                localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
                setSession(null);
                setLoading(false);
                return;
            }

            const loginStamp = localStorage.getItem(LOGIN_TIMESTAMP_KEY);

            if(loginStamp) {
                const loginTime = Number(loginStamp);
                const now = Date.now();

                if(now - loginTime >= SESSION_MAX_AGE) {
                    await supabase.auth.signOut();
                    localStorage.removeItem(LOGIN_TIMESTAMP_KEY);

                    setSession(null);
                    setLoading(false);

                    return;
                }

            } else {

                 localStorage.setItem(
                    LOGIN_TIMESTAMP_KEY,
                    Date.now().toString()
                );
            }

            setSession(session);
            setLoading(false);


    };

    checkSession();

   
        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange(async (event, newSession) => {
            if (event === "SIGNED_IN" && newSession) {
                localStorage.setItem(
                    LOGIN_TIMESTAMP_KEY,
                    Date.now().toString()
                );

                setSession(newSession);
                return;
            }

            if (event === "SIGNED_OUT") {
                localStorage.removeItem(LOGIN_TIMESTAMP_KEY);
                setSession(null);
                return;
            }

            setSession(newSession);
        });

        return () => {
            subscription.unsubscribe();
        };

    },[]);

    return (
        <AuthContext.Provider value={{ session, loading }}>
            {children}
        </AuthContext.Provider>
    )
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
