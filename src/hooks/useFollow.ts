import { useState, useEffect } from 'react';
import { followService } from '@/services/follow.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollow = (targetUserId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const handleFollowChange = (event: Event) => {
      const { userId, isFollowing } = (event as CustomEvent<{ userId: string; isFollowing: boolean }>).detail;
      if (userId === targetUserId) {
        setIsFollowing(isFollowing);
      }
    };
    
    window.addEventListener('follow_status_change', handleFollowChange);
    return () => {
      window.removeEventListener('follow_status_change', handleFollowChange);
    };
  }, [targetUserId]);

  useEffect(() => {
    if (!user || !targetUserId || user.id === targetUserId) {
      setIsFollowing(false);
      setIsLoading(false);
      return;
    }
    
    const checkFollowStatus = async () => {
      setIsLoading(true);
      try {
        const following = await followService.isFollowing(targetUserId);
        setIsFollowing(following);
      } catch (error) {
        console.error('Failed to fetch followings', error);
        setIsFollowing(false);
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
        toast.success('Đã ngừng theo dõi');
      } else {
        await followService.follow(targetUserId);
        toast.success('Đã theo dõi');
      }
    } catch (error: unknown) {
      // Revert on error
      setIsFollowing(currentStatus);
      window.dispatchEvent(
        new CustomEvent('follow_status_change', {
          detail: { userId: targetUserId, isFollowing: currentStatus }
        })
      );
      const message = (error as { response?: { data?: { error?: string } } }).response?.data?.error;
      toast.error(message || 'Đã xảy ra lỗi');
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};
