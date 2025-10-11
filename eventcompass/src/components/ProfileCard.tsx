// src/components/ProfileCard.tsx
"use client";

import { useState, useEffect, useRef } from "react";
import { supabase } from "../lib/supabase/client";
import { useRouter } from "next/navigation";
import { useSession, useSupabaseClient } from "@supabase/auth-helpers-react";
import styles from "../css/ProfileCard.module.css"; 

export default function ProfileCard() {
    const [show, setShow] = useState(false);
    const session = useSession(); 
    const supabase = useSupabaseClient();
    const router = useRouter();
    const cardRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // Close card when clicking outside
        const handleClickOutside = (e: MouseEvent) => {
            if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
                setShow(false);
            }
        };

        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Logout handler
    const handleLogout = async () => {
        const res = await fetch("/api/auth/login", {
            method: "DELETE"
        });

        if (res.ok) {
            router.replace("/auth");
            setShow(false);
            window.location.assign("/auth");
        } else {
            const data = await res.json();
            alert(data.error || "Logout failed. You are playing SAO");
        }
    };

    return (
        <div className={styles.container} ref={cardRef}>
            <div className={styles.avatar} onClick={() => setShow(!show)} title="Profile">
                {/* Replace with user avatar if you have one */}
            </div>

            {show && session?.user ? (
                <div className={styles.card}>
                    <p>{session.user.email}</p>
                <button className={styles.logoutButton} onClick={handleLogout}>
                    Logout
                </button>
                </div>
            ) : (
                show && (
                    <div className={styles.card}>
                        <a href="/auth" className={styles.loginButton}>
                            Sign In
                        </a>
                    </div>
                )
            )
            }
        </div>
    );
}
