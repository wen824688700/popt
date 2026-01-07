<<<<<<< HEAD
/**
 * 认证提供者组件
 * 在应用启动时初始化认证状态
 */
'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const initAuth = useAuthStore((state) => state.initAuth);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  return <>{children}</>;
}
=======
'use client';

import { useEffect } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useAuthStore } from '@/lib/stores/authStore';

export default function AuthProvider({ children }: { children: React.ReactNode }) {
  const setUser = useAuthStore((s) => s.setUser);

  useEffect(() => {
    let isMounted = true;

    const syncSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      if (!isMounted) return;

      if (error || !data.session?.user) {
        setUser(null);
        return;
      }

      const user = data.session.user;
      setUser({
        id: user.id,
        email: user.email ?? '',
        avatar: (user.user_metadata as any)?.avatar_url ?? '',
        accountType: 'free',
      });
    };

    void syncSession();

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const user = session?.user;
      if (!user) {
        setUser(null);
        return;
      }

      setUser({
        id: user.id,
        email: user.email ?? '',
        avatar: (user.user_metadata as any)?.avatar_url ?? '',
        accountType: 'free',
      });
    });

    return () => {
      isMounted = false;
      sub.subscription.unsubscribe();
    };
  }, [setUser]);

  return <>{children}</>;
}

>>>>>>> 26a3861 (fix: deploy to single vercel project (next+fastapi))
