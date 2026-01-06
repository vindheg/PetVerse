import { supabase } from './supabase';

export const petService = {
  // Get all available pets
  async getAvailablePets() {
    try {
      // Wait for auth to initialize
      const { data: { session } } = await supabase.auth.getSession();
      
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching pets:', error);
      return { success: false, error: error.message };
    }
  },

  // Get pets by type
  async getPetsByType(type) {
    try {
      const { data, error } = await supabase
        .from('pets')
        .select('*')
        .eq('type', type)
        .eq('status', true)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching pets by type:', error);
      return { success: false, error: error.message };
    }
  }
};