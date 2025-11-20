// src/utils/positionManager.js - ENHANCED WITH DATABASE SYNC
import { AppSettings } from '../config/settings';
import { supabase } from '../lib/supabase';

export class PositionManager {
  static localPositions = new Map(); // Cache for performance

  // Get or assign position from database - WITH PROPER PERSISTENCE
  static async getOrAssignPosition(userId, userEmail) {
    try {
      console.log(`📍 Getting/assigning position for: ${userEmail}`);
      
      // Check local cache first
      if (this.localPositions.has(userId)) {
        const cachedPos = this.localPositions.get(userId);
        console.log(`📍 Using cached position for ${userEmail}:`, cachedPos);
        return cachedPos;
      }

      // Call the database function to get or assign position
      const { data, error } = await supabase
        .rpc('get_or_assign_user_position', {
          user_id: userId,
          user_email: userEmail
        });

      if (error) {
        console.error('❌ Database position error:', error);
        // Generate and save a persistent position
        return await this.generateAndSavePosition(userId);
      }

      console.log(`📍 Database position for ${userEmail}:`, data);
      
      // Validate the position data
      if (!data || (data.x === 50 && data.y === 50)) {
        console.warn('⚠️ Invalid position from DB, generating new one');
        return await this.generateAndSavePosition(userId);
      }
      
      // Cache the position
      this.localPositions.set(userId, data);
      return data;
      
    } catch (error) {
      console.error('❌ Failed to get position from database:', error);
      return await this.generateAndSavePosition(userId);
    }
  }

  // Generate and permanently save a position
  static async generateAndSavePosition(userId) {
    const position = this.generateRandomPosition();
    
    try {
      // Save to database
      const { error } = await supabase
        .from('user_profiles')
        .update({ current_position: position })
        .eq('id', userId);

      if (error) {
        console.error('❌ Failed to save position to DB:', error);
      } else {
        console.log(`💾 Saved position to database for user ${userId}:`, position);
      }
    } catch (error) {
      console.error('❌ Position save error:', error);
    }
    
    // Cache locally
    this.localPositions.set(userId, position);
    return position;
  }

  // Generate random position
  static generateRandomPosition() {
    const minRadius = 20;
    const maxRadius = 45;
    
    const angle = Math.random() * 2 * Math.PI;
    const distance = minRadius + Math.random() * (maxRadius - minRadius);
    
    const x = 50 + distance * Math.cos(angle);
    const y = 50 + distance * Math.sin(angle);
    
    console.log(`🎲 Generated random position: {x: ${x.toFixed(2)}, y: ${y.toFixed(2)}}`);
    return { x, y };
  }

  // Get all positions from database for synchronization
  static async getAllUserPositions() {
    try {
      const { data, error } = await supabase
        .from('user_profiles')
        .select('id, email, current_position, online')
        .not('current_position', 'is', null)
        .eq('online', true);

      if (error) {
        console.error('❌ Failed to fetch all positions:', error);
        return new Map();
      }

      const positionMap = new Map();
      data.forEach(user => {
        if (user.current_position) {
          positionMap.set(user.id, user.current_position);
          // Update local cache
          this.localPositions.set(user.id, user.current_position);
        }
      });

      console.log(`📍 Loaded ${positionMap.size} positions from database for sync`);
      return positionMap;
      
    } catch (error) {
      console.error('❌ Positions sync error:', error);
      return new Map();
    }
  }

  // Clear local cache when user signs out
  static removePosition(userId) {
    console.log(`🗑️ Removing position from cache for user: ${userId}`);
    this.localPositions.delete(userId);
  }

  // Cleanup offline users
  static async cleanupOfflinePositions() {
    try {
      // We don't clear positions from database, just from local cache
      const { data: onlineUsers } = await supabase
        .from('user_profiles')
        .select('id')
        .eq('online', true);

      if (onlineUsers) {
        const onlineIds = new Set(onlineUsers.map(u => u.id));
        let removedCount = 0;
        
        for (const userId of this.localPositions.keys()) {
          if (!onlineIds.has(userId)) {
            this.localPositions.delete(userId);
            removedCount++;
          }
        }
        
        console.log(`🧹 Cleaned ${removedCount} offline users from position cache`);
      }
    } catch (error) {
      console.error('❌ Cleanup error:', error);
    }
  }
}