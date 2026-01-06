// src/services/withAuthLoader.js
import { supabase } from './supabase';

/**
 * Use this function to load data that requires authentication
 * It waits for auth to be ready before making the query
 */
export const loadWithAuth = async (queryFn, options = {}) => {
  const {
    maxRetries = 3,
    retryDelay = 1000,
    requireAuth = true
  } = options;
  
  let retries = 0;
  
  while (retries < maxRetries) {
    try {
      // 1. Check if we have a valid session
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.warn('Session check error:', sessionError);
        throw sessionError;
      }
      
      if (requireAuth && !session) {
        console.log('⚠️ No session found, retrying...');
        retries++;
        await new Promise(resolve => setTimeout(resolve, retryDelay));
        continue;
      }
      
      // 2. Execute the query
      const result = await queryFn(session);
      
      // 3. Return the result
      return result;
      
    } catch (error) {
      console.error(`Attempt ${retries + 1} failed:`, error.message);
      retries++;
      
      if (retries >= maxRetries) {
        throw new Error(`Failed after ${maxRetries} attempts: ${error.message}`);
      }
      
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }
};

/**
 * Helper function for common database queries
 */
export const queryWithAuth = {
  // For pets table
  async getAvailablePets() {
    return loadWithAuth(async (session) => {
      console.log('Loading pets with session:', session?.user?.id);
      
      const { data, error, count } = await supabase
        .from('pets')
        .select('*', { count: 'exact' })
        .eq('is_available', true)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      
      console.log(`✅ Loaded ${data?.length || 0} available pets`);
      return { data: data || [], count: count || 0 };
    }, { requireAuth: false }); // Pets don't require auth
  },
  
  // For profiles table
  async getUserProfile(userId) {
    return loadWithAuth(async (session) => {
      if (!session) throw new Error('No session found');
      
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      return data;
    });
  },
  
  // Generic query
  async query(table, options = {}) {
    return loadWithAuth(async (session) => {
      const { select = '*', filters = {}, orderBy, limit, requireSession = true } = options;
      
      if (requireSession && !session) {
        throw new Error('Authentication required');
      }
      
      let query = supabase.from(table).select(select);
      
      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (Array.isArray(value)) {
          query = query.in(key, value);
        } else {
          query = query.eq(key, value);
        }
      });
      
      // Apply ordering
      if (orderBy) {
        query = query.order(orderBy.field, { ascending: orderBy.ascending !== false });
      }
      
      // Apply limit
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data || [];
    });
  }
};