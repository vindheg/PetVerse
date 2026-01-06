// src/contexts/AuthContext.jsx - COMPLETE UPDATED VERSION
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

const AuthContext = createContext({});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [language, setLanguage] = useState('en');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const initializeAuth = async () => {
      try {
        console.log('🔄 Starting auth initialization...');
        
        // 1. Clear logout flag if exists
        if (localStorage.getItem('supabase_logout_flag') === 'true') {
          console.log('🚫 Clearing logout flag');
          localStorage.removeItem('supabase_logout_flag');
        }
        
        // 2. Get session with retry logic
        let retries = 0;
        const maxRetries = 3;
        
        const getSessionWithRetry = async () => {
          while (retries < maxRetries) {
            try {
              const { data: { session }, error } = await supabase.auth.getSession();
              
              if (error) throw error;
              
              console.log('✅ Session retrieved:', session?.user?.email);
              return session;
            } catch (error) {
              retries++;
              if (retries >= maxRetries) throw error;
              await new Promise(resolve => setTimeout(resolve, 500));
            }
          }
        };
        
        const session = await getSessionWithRetry();
        
        if (mounted && session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else if (mounted) {
          console.log('❌ No active session');
          setUser(null);
          setProfile(null);
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        if (mounted) {
          setUser(null);
          setProfile(null);
        }
      } finally {
        if (mounted) {
          // Small delay to ensure React state updates are complete
          setTimeout(() => {
            console.log('🏁 Auth initialization complete');
            setLoading(false);
            setIsInitialized(true);
          }, 300);
        }
      }
    };
    
    initializeAuth();
    
    // Initialize language
    const savedLang = localStorage.getItem('preferred_language') || 'en';
    setLanguage(savedLang);
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('🔔 Auth event:', event);
        
        if (!mounted) return;
        
        if (session?.user) {
          setUser(session.user);
          await fetchProfile(session.user.id);
        } else {
          setUser(null);
          setProfile(null);
          localStorage.removeItem('petverse_profile');
        }
        
        // Update loading state for auth changes
        setLoading(false);
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId) => {
    try {
      // Try to get from localStorage first
      const cached = localStorage.getItem('petverse_profile');
      if (cached) {
        try {
          const profileData = JSON.parse(cached);
          if (profileData?.id === userId) {
            setProfile(profileData);
          }
        } catch (e) {
          // Invalid cache, ignore
        }
      }

      // Fetch from Supabase with timeout
      const profilePromise = supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]);

      if (error) throw error;

      if (data) {
        setProfile(data);
        localStorage.setItem('petverse_profile', JSON.stringify(data));
      }
    } catch (error) {
      console.warn('Profile fetch warning:', error.message);
      // Don't throw, just continue without profile
    }
  };

  const login = async (email, password) => {
    try {
      // Admin credentials check
      const ADMIN_CREDENTIALS = {
        email: "admin@petverse.com",
        password: "admin123"
      };
      
      if (email === ADMIN_CREDENTIALS.email && password === ADMIN_CREDENTIALS.password) {
        localStorage.setItem('adminToken', 'petverse-admin-token-2024');
        localStorage.setItem('adminData', JSON.stringify({
          email: ADMIN_CREDENTIALS.email,
          name: "PetVerse Administrator",
          role: "super_admin"
        }));
        
        const mockAdminUser = {
          id: 'admin-001',
          email: ADMIN_CREDENTIALS.email,
          user_metadata: {
            role: 'admin',
            is_admin: true,
            name: 'PetVerse Administrator'
          }
        };
        
        setUser(mockAdminUser);
        return { 
          success: true, 
          isAdmin: true,
          user: mockAdminUser 
        };
      }

      // Regular user login
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      // Immediately fetch and update profile
      if (data.user) {
        setUser(data.user);
        await fetchProfile(data.user.id);
      }

      return { 
        success: true, 
        isAdmin: false,
        user: data.user 
      };
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const signup = async (email, password, username) => {
    try {
      if (email === "admin@petverse.com") {
        throw new Error("This email cannot be used for registration");
      }

      const { data: existingUser } = await supabase
        .from('profiles')
        .select('username')
        .eq('username', username)
        .maybeSingle();

      if (existingUser) {
        throw new Error("Username is already taken. Please choose another.");
      }

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { username },
          emailRedirectTo: null
        }
      });

      if (error) throw error;

      if (data.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              username: username,
              email: email,
              created_at: new Date().toISOString()
            }
          ]);

        if (profileError) {
          console.error('Profile creation error:', profileError);
        }

        // Auto-confirm
        try {
          await supabase.auth.admin.updateUserById(
            data.user.id,
            { email_confirm: true }
          );
        } catch (confirmError) {
          console.error('Auto-confirm error:', confirmError);
        }
      }

      return { 
        success: true, 
        data,
        message: 'Account created successfully! You can now login.' 
      };
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  };

  const logout = async () => {
    try {
      console.log('🔄 Starting logout process...');
      
      // 1. Clear ALL storage
      const clearAllStorage = () => {
        localStorage.removeItem('sb-access-token');
        localStorage.removeItem('sb-refresh-token');
        localStorage.removeItem('petverse_profile');
        localStorage.removeItem('adminToken');
        localStorage.removeItem('adminData');
        localStorage.removeItem('supabase.auth.token');
        
        // Clear all supabase keys
        Object.keys(localStorage).forEach(key => {
          if (key.startsWith('sb-') || key.includes('supabase')) {
            localStorage.removeItem(key);
          }
        });
        
        sessionStorage.clear();
      };
      
      clearAllStorage();
      
      // 2. Clear React state
      setUser(null);
      setProfile(null);
      
      // 3. Try Supabase signOut (non-blocking)
      supabase.auth.signOut().catch(() => {
        // Ignore errors
      });
      
      // 4. Set logout flag to prevent auto-login
      localStorage.setItem('supabase_logout_flag', 'true');
      localStorage.setItem('supabase.skip_session', 'true');
      
      console.log('✅ Logout complete');
      
      // 5. Force hard redirect to login
      window.location.href = '/login';
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Logout error:', error);
      localStorage.clear();
      window.location.href = '/login';
    }
  };

  const updateLanguage = (lang) => {
    setLanguage(lang);
    localStorage.setItem('preferred_language', lang);
  };

  // NEW: Add this function to check if auth is ready
  const waitForAuth = async () => {
    if (!loading && isInitialized) {
      return true;
    }
    
    // Wait for auth to initialize
    return new Promise((resolve) => {
      const check = () => {
        if (!loading && isInitialized) {
          resolve(true);
        } else {
          setTimeout(check, 50);
        }
      };
      check();
    });
  };

  const value = {
    user,
    profile,
    loading,
    language,
    setLanguage: updateLanguage,
    login,
    signup,
    logout,
    isAuthenticated: !!user,
    isAdmin: !!localStorage.getItem('adminToken'),
    waitForAuth, // Add this new function
    isInitialized // Add this
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};