// src/utils/databaseSetup.js - ENHANCED WITH POSITION
import { supabase } from '../lib/supabase';

export async function setupUserProfile(user) {
  try {
    console.log('Setting up profile for user:', user.email);
    
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: user.id,
        email: user.email,
        online: true,
        last_seen: new Date().toISOString(),
        color: `hsl(${Math.random() * 360}, 70%, 70%)`,
        // Note: Position will be assigned by the database function
      }, {
        onConflict: 'id',
        ignoreDuplicates: false
      })
      .select()
      .single();

    if (error) {
      console.error('Error in setupUserProfile:', error);
      throw error;
    }

    console.log('Profile setup successful for:', user.email);
    return data;
  } catch (error) {
    console.error('Error setting up user profile:', error);
    return null;
  }
}