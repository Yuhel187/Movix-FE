import { useState, useEffect } from 'react';
import { followService } from '@/services/follow.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollow = (targetUserId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleFollowChange = (e: CustomEvent) => {
      if (e.detail.userId === targetUserId) {
        setIsFollowing(e.detail.isFollowing);
      }
    };
    
    window.addEventListener('follow_status_change' as any, handleFollowChange);
    return () => {
      window.removeEventListener('follow_status_change' as any, handleFollowChange);
    };
  }, [targetUserId]);

  useEffect(() => {
    if (!user || user.id === targetUserId) {
      setIsLoading(false);
      return;
    }
    
    const checkFollowStatus = async () => {
      try {
        const followings = await followService.getMyFollowings();
        const following = followings.some((f) => f.id === targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Failed to fetch followings', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    checkFollowStatus();
  }, [user, targetUserId]);

  const toggleFollow = async () => {
    if (!user) {
      toast.error('Please log in to follow users');
      return;
    }

    if (user.id === targetUserId) {
      return;
    }

    // Capture the current status before changing
    const currentStatus = isFollowing;
    const newStatus = !currentStatus;

    // Optimistic update
    setIsFollowing(newStatus);
    window.dispatchEvent(
      new CustomEvent('follow_status_change', {
        detail: { userId: targetUserId, isFollowing: newStatus }
      })
    );
    
    try {
      if (currentStatus) {
        await followService.unFollow(targetUserId);
        toast.success('Unfollowed user successfully');
      } else {
        await followService.follow(targetUserId);
        toast.success('Followed user successfully');
      }
    } catch (error: any) {
      // Revert on error
      setIsFollowing(currentStatus);
      window.dispatchEvent(
        new CustomEvent('follow_status_change', {
          detail: { userId: targetUserId, isFollowing: currentStatus }
        })
      );
      toast.error(error.response?.data?.error || 'An error occurred');
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};
