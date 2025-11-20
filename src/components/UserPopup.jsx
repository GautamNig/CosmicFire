import React, { useState, useEffect } from 'react';
import { RelationshipTypes, FriendshipStatus } from '../utils/relationshipTypes';
import { supabase } from '../lib/supabase';
import './UserPopup.css';

export default function UserPopup({ user, onClose, currentUser }) {
  const [friendshipStatus, setFriendshipStatus] = useState(FriendshipStatus.NOT_CONNECTED);
  const [isLoading, setIsLoading] = useState(false);
  const [showRelationships, setShowRelationships] = useState(false);
  const [followers, setFollowers] = useState([]);
  const [following, setFollowing] = useState([]);
  const [friends, setFriends] = useState([]);

  // Load relationship data when popup opens
  useEffect(() => {
    if (user && currentUser) {
      loadRelationshipData();
    }
  }, [user, currentUser]);

  const loadRelationshipData = async () => {
    try {
      // Load friendship status
      const status = await getFriendshipStatus(currentUser.id, user.id);
      setFriendshipStatus(status);

      // Load followers/following/friends if showing relationships
      if (showRelationships) {
        await loadRelationshipLists();
      }
    } catch (error) {
      console.error('Error loading relationship data:', error);
    }
  };

  const getFriendshipStatus = async (currentUserId, otherUserId) => {
    if (currentUserId === otherUserId) return FriendshipStatus.SELF;

    try {
      // Check if current user follows other user
      const { data: followingData } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('follower_id', currentUserId)
        .eq('followed_id', otherUserId)
        .eq('relationship_type', RelationshipTypes.FOLLOW)
        .single();

      // Check if other user follows current user
      const { data: followedByData } = await supabase
        .from('user_relationships')
        .select('*')
        .eq('follower_id', otherUserId)
        .eq('followed_id', currentUserId)
        .eq('relationship_type', RelationshipTypes.FOLLOW)
        .single();

      if (followingData && followedByData) {
        return FriendshipStatus.FRIENDS;
      } else if (followingData) {
        return FriendshipStatus.FOLLOWING;
      } else if (followedByData) {
        return FriendshipStatus.FOLLOWED_BY;
      } else {
        return FriendshipStatus.NOT_CONNECTED;
      }
    } catch (error) {
      console.error('Error checking friendship status:', error);
      return FriendshipStatus.NOT_CONNECTED;
    }
  };

  const handleFollow = async () => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_relationships')
        .insert({
          follower_id: currentUser.id,
          followed_id: user.id,
          relationship_type: RelationshipTypes.FOLLOW
        });

      if (error) throw error;

      // Update status
      await loadRelationshipData();
      
      // TODO: Send real-time notification to the followed user
      
    } catch (error) {
      console.error('Error following user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!currentUser || isLoading) return;
    
    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('user_relationships')
        .delete()
        .eq('follower_id', currentUser.id)
        .eq('followed_id', user.id)
        .eq('relationship_type', RelationshipTypes.FOLLOW);

      if (error) throw error;

      await loadRelationshipData();
      
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadRelationshipLists = async () => {
    try {
      // Load followers (people who follow this user)
      const { data: followersData } = await supabase
        .from('user_relationships')
        .select(`
          follower_id,
          user_profiles:user_profiles!follower_id(
            email,
            online,
            color
          )
        `)
        .eq('followed_id', user.id)
        .eq('relationship_type', RelationshipTypes.FOLLOW);

      setFollowers(followersData || []);

      // Load following (people this user follows)
      const { data: followingData } = await supabase
        .from('user_relationships')
        .select(`
          followed_id,
          user_profiles:user_profiles!followed_id(
            email,
            online,
            color
          )
        `)
        .eq('follower_id', user.id)
        .eq('relationship_type', RelationshipTypes.FOLLOW);

      setFollowing(followingData || []);

      // Load friends (mutual follows)
      const friendsList = followersData?.filter(follower => 
        followingData?.some(following => 
          following.followed_id === follower.follower_id
        )
      ) || [];
      
      setFriends(friendsList);

    } catch (error) {
      console.error('Error loading relationship lists:', error);
    }
  };

  const toggleRelationships = () => {
    setShowRelationships(!showRelationships);
    if (!showRelationships) {
      loadRelationshipLists();
    }
  };

  const getFollowButtonText = () => {
    switch (friendshipStatus) {
      case FriendshipStatus.FRIENDS:
        return 'Friends';
      case FriendshipStatus.FOLLOWING:
        return 'Following';
      case FriendshipStatus.FOLLOWED_BY:
        return 'Follow Back';
      case FriendshipStatus.NOT_CONNECTED:
        return 'Follow';
      default:
        return 'Follow';
    }
  };

  const canFollow = friendshipStatus === FriendshipStatus.NOT_CONNECTED || 
                   friendshipStatus === FriendshipStatus.FOLLOWED_BY;

  return (
    <div className="popup-overlay" onClick={onClose}>
      <div className="popup-content" onClick={(e) => e.stopPropagation()}>
        <button className="popup-close" onClick={onClose}>×</button>
        
        <div className="user-info">
          <div 
            className="user-avatar"
            style={{ '--user-color': user.color }}
          ></div>
          <h3>{user.email}</h3>
          <div className={`user-status ${user.online ? 'online' : 'offline'}`}>
            {user.online ? 'Online' : 'Offline'}
          </div>
        </div>

        {/* Follow/Unfollow Button */}
        {currentUser && currentUser.id !== user.id && (
          <div className="relationship-actions">
            {canFollow ? (
              <button 
                className={`follow-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleFollow}
                disabled={isLoading}
              >
                {isLoading ? '...' : getFollowButtonText()}
              </button>
            ) : (
              <button 
                className={`unfollow-btn ${isLoading ? 'loading' : ''}`}
                onClick={handleUnfollow}
                disabled={isLoading}
              >
                {isLoading ? '...' : 'Unfollow'}
              </button>
            )}
          </div>
        )}

        {/* Relationships Section */}
        <div className="relationships-section">
          <button 
            className="relationships-toggle"
            onClick={toggleRelationships}
          >
            {showRelationships ? '▲' : '▼'} Relationships
          </button>

          {showRelationships && (
            <div className="relationships-content">
              {/* Friends */}
              <div className="relationship-group">
                <h4>Friends ({friends.length})</h4>
                {friends.length > 0 ? (
                  <div className="relationship-list">
                    {friends.map((friend, index) => (
                      <div key={index} className="relationship-item">
                        <div 
                          className="friend-dot"
                          style={{ backgroundColor: friend.user_profiles.color }}
                        ></div>
                        <span>{friend.user_profiles.email}</span>
                        <span className={`status ${friend.user_profiles.online ? 'online' : 'offline'}`}>
                          {friend.user_profiles.online ? '●' : '○'}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-relationships">No friends yet</p>
                )}
              </div>

              {/* Followers */}
              <div className="relationship-group">
                <h4>Followers ({followers.length})</h4>
                {followers.length > 0 ? (
                  <div className="relationship-list">
                    {followers.map((follower, index) => (
                      <div key={index} className="relationship-item">
                        <div 
                          className="follower-dot"
                          style={{ backgroundColor: follower.user_profiles.color }}
                        ></div>
                        <span>{follower.user_profiles.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-relationships">No followers yet</p>
                )}
              </div>

              {/* Following */}
              <div className="relationship-group">
                <h4>Following ({following.length})</h4>
                {following.length > 0 ? (
                  <div className="relationship-list">
                    {following.map((follow, index) => (
                      <div key={index} className="relationship-item">
                        <div 
                          className="following-dot"
                          style={{ backgroundColor: follow.user_profiles.color }}
                        ></div>
                        <span>{follow.user_profiles.email}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="no-relationships">Not following anyone</p>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-stats">
          <div className="stat">
            <label>In Cosmos Since</label>
            <span>{new Date(user.created_at).toLocaleDateString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}