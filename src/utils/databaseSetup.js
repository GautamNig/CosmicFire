// src/utils/databaseSetup.js
import { supabase } from '../lib/supabase';

export async function setupUserProfile(user) {
  try {
    // First, check if user profile already exists
    const { data: existingProfile, error: fetchError } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows
      console.error('Error fetching existing profile:', fetchError);
    }

    let profileData;
    
    if (existingProfile) {
      // Update existing profile - set online and update position
      const { data, error } = await supabase
        .from('user_profiles')
        .update({
          online: true,
          last_seen: new Date().toISOString(),
          current_position: {
            x: Math.random() * 80 + 10, // New random position
            y: Math.random() * 80 + 10
          },
          movement_vector: {
            dx: (Math.random() - 0.5) * 0.8,
            dy: (Math.random() - 0.5) * 0.8
          }
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;
      profileData = data;
    } else {
      // Create new profile
      const { data, error } = await supabase
        .from('user_profiles')
        .insert({
          id: user.id,
          email: user.email,
          online: true,
          last_seen: new Date().toISOString(),
          current_position: {
            x: Math.random() * 80 + 10,
            y: Math.random() * 80 + 10
          },
          movement_vector: {
            dx: (Math.random() - 0.5) * 0.8,
            dy: (Math.random() - 0.5) * 0.8
          },
          color: `hsl(${Math.random() * 360}, 70%, 70%)`
        })
        .select()
        .single();

      if (error) throw error;
      profileData = data;
    }

    return profileData;
  } catch (error) {
    console.error('Error setting up user profile:', error);
    return null;
  }
}

// Fallback function if foreign key constraint fails
async function createUserProfileWithoutConstraint(user) {
  try {
    const { data, error } = await supabase
      .from('user_profiles')
      .insert({
        id: user.id,
        email: user.email,
        online: true,
        last_seen: new Date().toISOString(),
        current_position: {
          x: Math.random() * 80 + 10,
          y: Math.random() * 80 + 10
        },
        movement_vector: {
          dx: (Math.random() - 0.5) * 0.8,
          dy: (Math.random() - 0.5) * 0.8
        },
        color: `hsl(${Math.random() * 360}, 70%, 70%)`
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (fallbackError) {
    console.error('Fallback creation also failed:', fallbackError);
    return null;
  }
}