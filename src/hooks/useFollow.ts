import { useState, useEffect } from 'react';
import { followService } from '@/services/follow.service';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const useFollow = (targetUserId: string) => {
  const { user } = useAuth();
  const [isFollowing, setIsFollowing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

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

    setIsLoading(true);
    
    try {
      if (isFollowing) {
        await followService.unFollow(targetUserId);
        setIsFollowing(false);
        toast.success('Unfollowed user successfully');
      } else {
        await followService.follow(targetUserId);
        setIsFollowing(true);
        toast.success('Followed user successfully');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return { isFollowing, isLoading, toggleFollow };
};
