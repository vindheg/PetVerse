import { supabase } from './supabase';
import { emailService } from './emailService';

export const lostFoundService = {
  // Submit a lost/found report
  async submitReport(reportData, file) {
    let imageUrl = null;

    // Upload image if exists
    if (file) {
      const fileName = `lostfound/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('pet-images')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Build clean report object with only valid DB columns
    const fullReport = {
      report_type: reportData.report_type,
      pet_name: reportData.pet_name || '',
      pet_type: reportData.pet_type,
      breed: reportData.breed || null,
      color: reportData.color || null,
      location: reportData.location,
      date_lost_found: reportData.date_lost_found,
      contact_phone: reportData.contact_phone,
      contact_email: reportData.contact_email || null,
      description: reportData.description || null,
      latitude: reportData.latitude || null,
      longitude: reportData.longitude || null,
      image_url: imageUrl,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('lost_found_pets')
      .insert([fullReport])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Get all reports (for user)
  async getReports(type = 'all') {
    let query = supabase
      .from('lost_found_pets')
      .select('*')
      .order('created_at', { ascending: false });

    if (type !== 'all') {
      query = query.eq('report_type', type);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Get pending reports (for admin)
  async getPendingReports() {
    const { data, error } = await supabase
      .from('lost_found_pets')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Get reviewed reports (for admin)
  async getReviewedReports() {
    const { data, error } = await supabase
      .from('lost_found_pets')
      .select('*')
      .neq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Update report status (admin)
  async updateStatus(id, status, email, petName = '', reportType = 'lost') {
    // Ensure id is a number (bigint in DB)
    const numericId = typeof id === 'string' ? parseInt(id, 10) : id;

    console.log('=== UPDATE STATUS ===');
    console.log('ID:', numericId, 'Type:', typeof numericId);
    console.log('Status:', status);

    // Update the database - update both status and verified_status
    const { data, error: updateError } = await supabase
      .from('lost_found_pets')
      .update({
        status: status,
        
        updated_at: new Date().toISOString()
      })
      .eq('id', numericId)
      .select();

    console.log('Update response - Data:', data, 'Error:', updateError);

    if (updateError) {
      console.error('Database update error:', updateError);
      throw updateError;
    }

    if (!data || data.length === 0) {
      console.error('No rows updated! ID might not exist:', numericId);
      throw new Error(`No report found with ID: ${numericId}`);
    }

    console.log('Database update successful:', data[0]);

    // Send email notification using custom SMTP service
    try {
      await emailService.sendLostFoundStatusEmail(email, petName, status, reportType);
      console.log(`Lost/Found status email sent to ${email}`);
    } catch (emailError) {
      console.error('Failed to send email:', emailError);
      // Don't throw - status was updated successfully
    }

    return { success: true, data: data[0] };
  },

  // Get accepted lost pet reports (for found form dropdown)
  async getAcceptedLostPets() {
    const { data, error } = await supabase
      .from('lost_found_pets')
      .select('*')
      .eq('report_type', 'lost')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Submit a found report with optional matching to lost pet
  async submitFoundReport(reportData, file, matchedLostPetId = null) {
    let imageUrl = null;

    // Upload image if exists
    if (file) {
      const fileName = `lostfound/${Date.now()}_${file.name}`;
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('pet-images')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage
        .from('pet-images')
        .getPublicUrl(fileName);

      imageUrl = urlData.publicUrl;
    }

    // Build clean report object with only valid DB columns
    const fullReport = {
      report_type: 'found',
      pet_name: reportData.pet_name || '',
      pet_type: reportData.pet_type,
      breed: reportData.breed || null,
      color: reportData.color || null,
      location: reportData.location,
      date_lost_found: reportData.date_lost_found,
      contact_phone: reportData.contact_phone,
      contact_email: reportData.contact_email || null,
      description: reportData.description || null,
      latitude: reportData.latitude || null,
      longitude: reportData.longitude || null,
      image_url: imageUrl,
      matched_with: matchedLostPetId ? parseInt(matchedLostPetId) : null,
      status: 'pending',
      created_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('lost_found_pets')
      .insert([fullReport])
      .select()
      .single();

    if (error) throw error;

    // If matched to a lost pet, notify the original owner AND clean up
    if (matchedLostPetId) {
      const numericLostPetId = typeof matchedLostPetId === 'string' ? parseInt(matchedLostPetId) : matchedLostPetId;

      // 1. Notify the pet owner
      await this.notifyPetOwner(numericLostPetId, {
        contact_phone: reportData.contact_phone,
        contact_email: reportData.contact_email,
        location: reportData.location
      });

      // 2. Update the lost pet status to 'found'
      await supabase
        .from('lost_found_pets')
        .update({ status: 'found', updated_at: new Date().toISOString() })
        .eq('id', numericLostPetId);

      // 3. Remove the community post for this lost pet
      await this.removeCommunityPost(numericLostPetId);
    }

    return data;
  },

  // Remove community post when lost pet is found
  async removeCommunityPost(lostPetId) {
    try {
      const numericId = typeof lostPetId === 'string' ? parseInt(lostPetId) : lostPetId;
      console.log('Removing community post for lost pet ID:', numericId);

      const { error } = await supabase
        .from('community_posts')
        .delete()
        .eq('lost_pet_id', numericId);

      if (error) {
        console.error('Error removing community post:', error);
      } else {
        console.log('Community post removed successfully');
      }
    } catch (error) {
      console.error('Failed to remove community post:', error);
      // Don't throw - the found report was submitted successfully
    }
  },

  // Notify lost pet owner that their pet may have been found
  async notifyPetOwner(lostPetId, finderDetails) {
    try {
      // Get the lost pet report to find owner's email
      const { data: lostPet, error: fetchError } = await supabase
        .from('lost_found_pets')
        .select('*')
        .eq('id', lostPetId)
        .single();

      if (fetchError) throw fetchError;

      if (lostPet && lostPet.contact_email) {
        await emailService.sendPetFoundMatchEmail(
          lostPet.contact_email,
          lostPet.pet_name,
          finderDetails
        );
        console.log(`Pet found notification sent to ${lostPet.contact_email}`);
      }
    } catch (error) {
      console.error('Failed to notify pet owner:', error);
      // Don't throw - the found report was submitted successfully
    }
  },

  // Post lost pet to community section when approved
  async postLostPetToCommunity(report) {
    console.log('=== POST TO COMMUNITY ===');
    console.log('Report:', report);

    // Ensure lost_pet_id is a number (bigint in DB)
    const lostPetId = typeof report.id === 'string' ? parseInt(report.id, 10) : report.id;

    const postData = {
      user_id: report.user_id || null,
      user_name: report.user_name || 'PetVerse Alert',
      post_type: 'lost_pet',
      title: `Lost Pet Alert: ${report.pet_name || 'Unknown'}`,
      content: `🔍 LOST ${report.pet_type?.toUpperCase() || 'PET'}\n\nName: ${report.pet_name || 'Unknown'}\nBreed: ${report.breed || 'Unknown'}\nColor: ${report.color || 'Not specified'}\nLast Seen: ${report.location}\n\nDescription: ${report.description || 'No description'}\n\nIf found, please contact: ${report.contact_phone}`,
      image_url: report.image_url || null,
      lost_pet_id: lostPetId,
      created_at: new Date().toISOString()
    };

    console.log('Insert data:', postData);

    const { data, error } = await supabase
      .from('community_posts')
      .insert([postData])
      .select();

    console.log('Insert response - Data:', data, 'Error:', error);

    if (error) {
      console.error('Community post insert error:', error);
      throw error;  // Throw so the admin sees the error
    }

    if (!data || data.length === 0) {
      console.error('No post created!');
      throw new Error('Failed to create community post');
    }

    console.log('Community post created successfully:', data[0]);
    return true;
  }
};
