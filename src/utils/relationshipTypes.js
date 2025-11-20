// src/utils/relationshipTypes.js
export const RelationshipTypes = {
  FOLLOW: 'follow',
  BLOCK: 'block'
};

export const MessageStatus = {
  SENT: 'sent',
  DELIVERED: 'delivered', 
  READ: 'read'
};

// Friendship status constants
export const FriendshipStatus = {
  NOT_CONNECTED: 'not_connected',      // No relationship
  FOLLOWING: 'following',              // You follow them
  FOLLOWED_BY: 'followed_by',          // They follow you  
  FRIENDS: 'friends',                  // Mutual follow
  BLOCKED: 'blocked'                   // You blocked them
};

// Default relationship manager
export const RelationshipManager = {
  // Check if user A follows user B
  async isFollowing(followerId, followedId) {
    // Will implement with Supabase calls
  },

  // Check if two users are friends (mutual follow)
  async areFriends(userAId, userBId) {
    // Will implement with Supabase calls
  },

  // Get friendship status between two users
  async getFriendshipStatus(currentUserId, otherUserId) {
    // Will implement with Supabase calls
  }
};