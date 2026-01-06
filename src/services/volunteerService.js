import { supabase } from './supabase';
import { emailService } from './emailService';

export const volunteerService = {
  // Admin: Create new event
  async createEvent(eventData) {
    const { data, error } = await supabase
      .from('volunteer_events')
      .insert([eventData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Admin: Get all events
  async getEvents() {
    const { data, error } = await supabase
      .from('volunteer_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // Admin: Update event
  async updateEvent(id, updates) {
    const { data, error } = await supabase
      .from('volunteer_events')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // User: Get upcoming events
  async getUpcomingEvents() {
    const { data, error } = await supabase
      .from('volunteer_events')
      .select('*')
      .in('status', ['upcoming', 'ongoing'])
      .order('date', { ascending: true });

    if (error) throw error;
    return data;
  },

  // User: Register for event
  async registerForEvent(registrationData) {
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .insert([registrationData])
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // User: Get my registrations
  async getMyRegistrations(userId) {
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select(`
        *,
        volunteer_events (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Get all registrations with event details
  async getAllRegistrations() {
    const { data, error } = await supabase
      .from('volunteer_registrations')
      .select(`
        *,
        volunteer_events (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Update registration status
  async updateRegistrationStatus(id, status, adminNotes = '') {
    const updates = {
      status,
      admin_notes: adminNotes,
      updated_at: new Date().toISOString()
    };

    if (status === 'approved') {
      // Get the registration to get event_id
      const { data: registration } = await supabase
        .from('volunteer_registrations')
        .select('event_id')
        .eq('id', id)
        .single();

      if (registration) {
        // Increment current_volunteers count
        await supabase.rpc('increment_volunteers', { event_id: registration.event_id });
      }
    }

    const { data, error } = await supabase
      .from('volunteer_registrations')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  // Delete event (admin)
  async deleteEvent(id) {
    const { error } = await supabase
      .from('volunteer_events')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  },

  // ========== VOLUNTEER APPLICATION MANAGEMENT ==========

  // Admin: Get all volunteer applications from volunteers table
  async getVolunteerApplications() {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Get pending volunteer applications
  async getPendingApplications() {
    const { data, error } = await supabase
      .from('volunteers')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  },

  // Admin: Get accepted volunteers, optionally filtered by role
  async getAcceptedVolunteers(role = null) {
    let query = supabase
      .from('volunteers')
      .select('*')
      .eq('status', 'approved')
      .order('created_at', { ascending: false });

    if (role && role !== 'all') {
      query = query.eq('role_interest', role);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  // Admin: Update volunteer application status (accept/reject) with email notification
  async updateVolunteerStatus(id, status, email, volunteerName) {
    // Update status in database
    const { data, error } = await supabase
      .from('volunteers')
      .update({
        status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Send email notification using custom SMTP service
    if (status === 'approved' || status === 'rejected') {
      try {
        await emailService.sendVolunteerStatusEmail(email, volunteerName, status);
        console.log(`Volunteer ${status} email sent to ${email}`);
      } catch (emailError) {
        console.error('Failed to send email notification:', emailError);
        // Don't throw - status was updated successfully
      }
    }

    return data;
  },

  // Admin: Send event notification email to volunteers
  async sendEventEmail(eventDetails, volunteerEmails, customMessage = '') {
    try {
      await emailService.sendVolunteerEventEmail(eventDetails, volunteerEmails, customMessage);
      return { success: true };
    } catch (error) {
      console.error('Failed to send event emails:', error);
      throw error;
    }
  }
};