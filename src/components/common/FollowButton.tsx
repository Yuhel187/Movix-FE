'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { useFollow } from '@/hooks/useFollow';
import { useAuth } from '@/contexts/AuthContext';
import { cn } from '@/lib/utils';

interface FollowButtonProps extends React.ComponentProps<typeof Button> {
  targetUserId: string;
}

export const FollowButton: React.FC<FollowButtonProps> = ({ 
  targetUserId, 
  variant = 'ghost',
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
      variant={variant}
      size={size}
      className={cn(
        `font-semibold ${isFollowing ? 'text-zinc-400 hover:text-red-500' : 'text-blue-500 hover:text-blue-400'} transition-colors`,
        className
      )}
      onClick={handleClick}
      disabled={isLoading}
      {...props}
    >
      {isFollowing ? 'Unfollow' : 'Follow'}
    </Button>
  );
};
