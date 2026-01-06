import { supabase } from './supabase';

export const userService = {
  async getAllUsers() {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select(`
        id,
        username,
        email,
        avatar_url,
        profile_picture,
        phone,
        date_of_birth,
        address,
        state,
        city,
        pincode,
        gender,
        created_at,
        updated_at,
        is_admin
      `)
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Supabase getAllUsers error:', error);
      throw error;
    }
    return profiles || [];
  },

  async deleteUser(userId) {
    console.log('Deleting user with ID:', userId);
    
    // First check if user exists
    const { data: userExists, error: checkError } = await supabase
      .from('profiles')
      .select('id, username, is_admin')
      .eq('id', userId)
      .single();
    
    if (checkError) {
      console.error('Error checking user:', checkError);
      throw new Error('User not found');
    }
    
    console.log('User found for deletion:', userExists);
    
    if (userExists.is_admin) {
      throw new Error('Cannot delete admin users');
    }
    
    // Try to delete from profiles table
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (error) {
      console.error('Supabase delete error:', error);
      throw error;
    }
    
    console.log('User deleted from profiles table successfully');
    return { success: true, message: 'User deleted successfully' };
  },

  async getUserStats() {
    const { count, error } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Stats error:', error);
      throw error;
    }
    
    const { count: adminCount } = await supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true })
      .eq('is_admin', true);
    
    return {
      totalUsers: count || 0,
      adminCount: adminCount || 0,
      regularUsers: (count || 0) - (adminCount || 0)
    };
  }
};