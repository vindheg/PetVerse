import { supabase } from './supabase';

export const adoptionService = {
  async submitAdoptionRequest(adoptionData) {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      // Insert adoption record
      const { data, error } = await supabase
        .from('adoptions')
        .insert([{
          pet_id: adoptionData.petId,
          pet_name: adoptionData.petName,
          adopter_name: adoptionData.adopterName,
          adopter_phone: adoptionData.adopterPhone,
          adopter_email: adoptionData.adopterEmail,
          adopter_address: adoptionData.adopterAddress,
          user_id: userId,
          status: 'pending',
          created_at: new Date().toISOString()
        }])
        .select();

      if (error) throw error;

      // Update pet status to unavailable
      await supabase
        .from('pets')
        .update({ status: false })
        .eq('id', adoptionData.petId);

      return { 
        success: true, 
        data,
        message: 'Adoption request submitted successfully! Under review by PetVerse team.' 
      };
    } catch (error) {
      console.error('Error submitting adoption:', error);
      return { success: false, error: error.message };
    }
  },

  // Get user's adoption requests
  async getUserAdoptions() {
    try {
      const { data: userData } = await supabase.auth.getUser();
      const userId = userData.user?.id;

      if (!userId) {
        throw new Error('User not authenticated');
      }

      const { data, error } = await supabase
        .from('adoptions')
        .select('*, pets(*)')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching user adoptions:', error);
      return { success: false, error: error.message };
    }
  },

  // Get all adoption requests (for admin)
  async getAllAdoptions() {
    try {
      const { data, error } = await supabase
        .from('adoptions')
        .select('*, pets(*)')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { success: true, data };
    } catch (error) {
      console.error('Error fetching all adoptions:', error);
      return { success: false, error: error.message };
    }
  },

  // Update adoption status (for admin)
  async updateAdoptionStatus(adoptionId, status) {
    try {
      const { data, error } = await supabase
        .from('adoptions')
        .update({ 
          status: status,
          admin_verified_at: status !== 'pending' ? new Date().toISOString() : null
        })
        .eq('id', adoptionId)
        .select();

      if (error) throw error;

      // If rejected, make pet available again
      if (status === 'rejected') {
        const adoptionData = data[0];
        await supabase
          .from('pets')
          .update({ status: true })
          .eq('id', adoptionData.pet_id);
      }

      return { success: true, data };
    } catch (error) {
      console.error('Error updating adoption status:', error);
      return { success: false, error: error.message };
    }
  }
};