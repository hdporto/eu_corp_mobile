// useNotifications.js
import { useEffect } from 'react';
import { supabase } from './supabaseClient';

const useNotifications = (userId, setNotifications) => {
  useEffect(() => {
    const channel = supabase
      .channel('notifications')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setNotifications((prev) => [payload.new, ...prev]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, setNotifications]);
};

export default useNotifications;
