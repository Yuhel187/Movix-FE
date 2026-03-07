"use client"
import React, { useState } from "react"
import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { MoreHorizontal, ThumbsUp, MessageCircle, Share2, Globe } from "lucide-react"
import { cn } from "@/lib/utils"

// --- MOCK DATA ---
const MOCK_POST = {
  id: "post-minimal-1",
  author: {
    username: "Nguyễn Phát",
    avatarUrl: "https://i.pravatar.cc/150?u=1",
  },
  timeAgo: "2 giờ trước",
  content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Donec non faucibus nunc, eu ornare nisi. Maecenas vel magna ac sem varius tristique sed eget dolor. In lobortis tincidunt mi, vitae maximus nulla venenatis in. Donec felis sem, imperdiet quis orci eget, aliquet porttitor arcu. Duis semper ex eu rutrum gravida. Proin egestas felis vulputate pharetra ornare. Nam pretium ligula eget eros sodales pretium. Duis sit amet auctor orci, at posuere nunc. Aliquam semper ipsum vitae tellus facilisis viverra. Proin pellentesque non enim in pellentesque. Nunc bibendum odio in blandit tempus. Proin elementum nibh ac ex consectetur pharetra. Cras efficitur purus lorem, in malesuada tellus rhoncus quis. Mauris ultricies augue eget quam tincidunt eleifend. Ut sagittis justo tortor, quis lacinia massa ultrices in. Curabitur nec feugiat metus, blandit luctus diam.",
  imageUrl: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?auto=format&fit=crop&q=80&w=800",
  stats: {
    likes: 42,
    comments: 15,
    shares: 8
  }
}

export interface Post {
    id?: string;
    author: {
        username: string;
        avatarUrl?: string;
    };
    timeAgo: string;
    content: string;
    imageUrl?: string;
    stats: {
        likes: number;
        comments: number;
        shares: number;
    }
}

interface PostCardProps {
    post?: Post;
}

export function PostCard({ post = MOCK_POST }: PostCardProps) {
  const [isLiked, setIsLiked] = useState(false)
  const [likesCount, setLikesCount] = useState(post.stats.likes)

  const handleLike = () => {
    setIsLiked(!isLiked)
    setLikesCount(prev => isLiked ? prev - 1 : prev + 1)
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader className="p-4 pb-1 space-y-3">
        <div className="flex items-center gap-3">
          <Avatar className="h-10 w-10 cursor-pointer">
            <AvatarImage src={post.author.avatarUrl} />
            <AvatarFallback>{post.author.username.charAt(0)}</AvatarFallback>
          </Avatar>
          
          <div className="min-w-0 flex-1">
            <p className="font-semibold text-sm leading-normal truncate cursor-pointer hover:underline">
              {post.author.username}
            </p>
            <div className="text-xs text-muted-foreground flex items-center gap-1">
              <span>{post.timeAgo}</span>
              <span>•</span>
              <Globe className="h-3 w-3" />
            </div>
          </div>

          <div className="ml-auto">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-4 pt-0">
        <div className="mb-4 text-sm text-foreground whitespace-pre-wrap">
          {post.content}
        </div>

        {post.imageUrl && (
          <div className="mt-4">
            <img
              src={post.imageUrl}
              alt="Post image"
              className="max-h-96 w-full rounded-md border object-cover"
            />
          </div>
        )}
      </CardContent>
      <CardFooter className="flex-col items-start gap-4">
        <div className="flex w-full justify-between text-xs text-muted-foreground">
          <div className="flex items-center gap-1">
            <ThumbsUp className="h-4 w-4 text-blue-600" />
            <span>{likesCount} Reactions</span>
          </div>
          <span>{post.stats.comments} Comments</span>
        </div>
        <div className="w-full border-t pt-2 flex">
          <Button
            variant="ghost"
            className={cn(
              "flex-1 flex items-center justify-center transition-colors",
              isLiked ? "text-blue-600 font-semibold" : "text-muted-foreground"
            )}
            onClick={handleLike}
          >
            <ThumbsUp className={cn("h-4 w-4 mr-2", isLiked ? "fill-current" : "")} />
            Thích
          </Button>

          <Button variant="ghost" className="flex-1 flex items-center justify-center text-muted-foreground">
            <MessageCircle className="h-4 w-4 mr-2" />
            Bình luận
          </Button>

          <Button variant="ghost" className="flex-1 flex items-center justify-center text-muted-foreground">
            <Share2 className="h-4 w-4 mr-2" />
            Chia sẻ
          </Button>
        </div>
      </CardFooter>
    </Card>
  )
}