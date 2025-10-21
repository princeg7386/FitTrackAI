import React from "react";
import { supabase } from "@/lib/supabase";

export type User = {
  id: string;
  name: string;
  email: string;
  age?: number;
  heightCm?: number;
  weightKg?: number;
  goal?: "lose_weight" | "build_muscle" | "improve_endurance" | "general_health";
};

const STORAGE_KEY = "ft_user";

function loadUser(): User | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as User) : null;
  } catch {
    return null;
  }
}

function saveUser(user: User | null) {
  if (!user) {
    localStorage.removeItem(STORAGE_KEY);
    return;
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export const AuthContext = React.createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
}>({ user: null, setUser: () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = React.useState<User | null>(() => loadUser());
  const setUser = (u: User | null) => {
    setUserState(u);
    saveUser(u);
  };

  // Sync with Supabase auth state on mount and subscribe to changes
  React.useEffect(() => {
    let sub: { data: { subscription: { unsubscribe: () => void } } } | null = null;

    const init = async () => {
      try {
        // Try to load current Supabase user
        const userResp = await (supabase.auth.getUser ? supabase.auth.getUser() : Promise.resolve({ data: { user: null } }));
        const supaUser = (userResp as any).data?.user;
        if (supaUser) {
          // Try to load profile row for richer data (name, age, etc.)
          try {
            const { data: profile } = await supabase.from('users').select('*').eq('id', supaUser.id).limit(1).single();
            if (profile) {
              setUser({ id: supaUser.id, name: profile.name ?? '', email: supaUser.email ?? '' , age: profile.age, heightCm: profile.height_cm, weightKg: profile.weight_kg, goal: profile.goal });
            } else {
              setUser({ id: supaUser.id, name: supaUser.user_metadata?.full_name ?? '', email: supaUser.email ?? '' });
            }
          } catch (err) {
            // fallback to minimal user
            setUser({ id: supaUser.id, name: supaUser.user_metadata?.full_name ?? '', email: supaUser.email ?? '' });
          }
        }

        // Subscribe to auth state changes
        if (supabase.auth.onAuthStateChange) {
          sub = supabase.auth.onAuthStateChange((event: any, session: any) => {
            const sUser = session?.user ?? null;
            if (!sUser) {
              setUser(null);
              return;
            }
            // when signed in, fetch profile
            (async () => {
              try {
                const { data: profile } = await supabase.from('users').select('*').eq('id', sUser.id).limit(1).single();
                if (profile) {
                  setUser({ id: sUser.id, name: profile.name ?? '', email: sUser.email ?? '' , age: profile.age, heightCm: profile.height_cm, weightKg: profile.weight_kg, goal: profile.goal });
                } else {
                  setUser({ id: sUser.id, name: sUser.user_metadata?.full_name ?? '', email: sUser.email ?? '' });
                }
              } catch (e) {
                setUser({ id: sUser.id, name: sUser.user_metadata?.full_name ?? '', email: sUser.email ?? '' });
              }
            })();
          });
        }
      } catch (e) {
        // ignore
      }
    };

    init();

    // storage event for manual localStorage changes
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setUserState(loadUser());
    };
    window.addEventListener("storage", onStorage);

    return () => {
      window.removeEventListener("storage", onStorage);
      try {
        if (sub && sub.data && sub.data.subscription && typeof sub.data.subscription.unsubscribe === 'function') sub.data.subscription.unsubscribe();
      } catch {}
    };
  }, []);
  return (
    <AuthContext.Provider value={{ user, setUser }}>{children}</AuthContext.Provider>
  );
}

export function useAuth() {
  return React.useContext(AuthContext);
}
