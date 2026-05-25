'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { followService } from '@/services/follow.service';
import { UserProfile } from '@/services/user.service';
import { FollowButton } from '@/components/common/FollowButton';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function NetworkPage() {
  const [followings, setFollowings] = useState<UserProfile[]>([]);
  const [followers, setFollowers] = useState<UserProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchNetwork = async () => {
      try {
        setIsLoading(true);
        const [myFollowings, myFollowers] = await Promise.all([
          followService.getMyFollowings(),
          followService.getMyFollowers()
        ]);
        setFollowings(myFollowings);
        setFollowers(myFollowers);
      } catch (error) {
        toast.error('Không thể tải danh sách theo dõi');
      } finally {
        setIsLoading(false);
      }
    };
    fetchNetwork();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-400" />
      </div>
    );
  }

  const renderUserList = (users: UserProfile[], emptyMessage: string) => {
    if (users.length === 0) {
      return <div className="text-center text-zinc-500 py-8">{emptyMessage}</div>;
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {users.map(user => (
          <Card key={user.id} className="bg-zinc-900 border-zinc-800">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="h-10 w-10 border border-zinc-700">
                  <AvatarImage src={user.avatar_url || ''} />
                  <AvatarFallback className="bg-zinc-800 text-zinc-300">
                    {user.display_name?.charAt(0).toUpperCase() || user.username.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold text-white">{user.display_name || user.username}</p>
                </div>
              </div>
              <FollowButton targetUserId={user.id} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight text-white mb-2">Cộng đồng</h2>
        <p className="text-zinc-400 text-sm">
          Quản lý người bạn theo dõi và người theo dõi bạn
        </p>
      </div>

      <Tabs defaultValue="following" className="w-full">
        <TabsList className="bg-zinc-900 border border-zinc-800">
          <TabsTrigger value="following" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Đang theo dõi ({followings.length})
          </TabsTrigger>
          <TabsTrigger value="followers" className="data-[state=active]:bg-zinc-800 data-[state=active]:text-white">
            Người theo dõi ({followers.length})
          </TabsTrigger>
        </TabsList>
        <TabsContent value="following" className="mt-6">
          {renderUserList(followings, 'Bạn chưa theo dõi ai.')}
        </TabsContent>
        <TabsContent value="followers" className="mt-6">
          {renderUserList(followers, 'Chưa có ai theo dõi bạn.')}
        </TabsContent>
      </Tabs>
    </div>
  );
}
