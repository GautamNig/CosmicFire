// src/utils/databaseSetup.js - ENHANCED WITH POSITION
import { supabase } from '../lib/supabase';

export async function setupUserProfile(user) {
  try {
    console.log('🔄 Setting up profile for user:', user.email, user.id);
    
    // First, check if user exists
    const { data: existingUser, error: checkError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('❌ Error checking user:', checkError);
    }

    if (existingUser) {
      // User exists, update to online
      console.log('✅ User exists, updating to online');
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          online: true,
          last_seen: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Error updating user:', error);
        throw error;
      }
      return data;
    } else {
      // User doesn't exist, create new profile
      console.log('🆕 Creating new user profile');
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          online: true,
          last_seen: new Date().toISOString(),
          color: `hsl(${Math.random() * 360}, 70%, 70%)`,
          current_position: '{"x": 50, "y": 50}'
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating user:', error);
        throw error;
      }
      console.log('✅ User profile created successfully');
      return data;
    }
  } catch (error) {
    console.error('❌ Error in setupUserProfile:', error);
    return null;
  }
}