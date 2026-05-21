'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { UserPlus, UserMinus, Loader2 } from 'lucide-react';

interface FollowButtonProps extends React.ComponentProps<typeof Button> {
  targetUserId: string;
  showIcon?: boolean;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetUserId, 
  showIcon = true,
  variant = 'default',
  size = 'sm',
  className,
  onClick,
  ...props 
}) => {
  const { user } = useAuth();
  const { isFollowing, isLoading, toggleFollow } = useFollow(targetUserId);

  if (user && user.id === targetUserId) {
    return null;
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (onClick) {
      onClick(e);
    }
    toggleFollow();
  };

  return (
    <Button
      variant={isFollowing ? 'secondary' : variant}
      size={size}
      className={className}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isLoading ? (
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
      ) : showIcon ? (
        isFollowing ? (
          <UserMinus className="mr-2 h-4 w-4" />
        ) : (
          <UserPlus className="mr-2 h-4 w-4" />
        )
      ) : null}
      {isFollowing ? 'Following' : 'Follow'}
    </Button>
  );
};
