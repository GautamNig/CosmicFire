// src/utils/userCleanup.js
import { supabase } from '../lib/supabase';

export async function cleanupStaleUsers() {
  try {
    // Delete users who have been offline for more than 24 hours
    const { error } = await supabase
      .from('user_profiles')
      .delete()
      .lt('last_seen', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
      .eq('online', false);

    if (error) {
      console.error('Error cleaning up stale users:', error);
    } else {
      console.log('Stale users cleaned up successfully');
    }
  } catch (error) {
    console.error('Error in cleanupStaleUsers:', error);
  }
}

// Run cleanup every hour
setInterval(cleanupStaleUsers, 60 * 60 * 1000);