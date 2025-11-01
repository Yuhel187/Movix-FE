// src/components/movie/comments/MovieCommentSection.tsx
"use client";

import { useState } from "react";
import type { Comment } from "@/types/comment";
import { Button } from "@/components/ui/button";
import { CommentForm } from "./CommentForm";
import { CommentList } from "./CommentList";
import { MessageSquare, Star } from "lucide-react";


export function MovieCommentSection() {
  const [activeTab, setActiveTab] = useState<"comments" | "reviews">("comments");
  const [comments, setComments] = useState<Comment[]>([]); 
  
  const handleCommentSubmit = (text: string, isSpoiler: boolean) => {
    console.log("Submitting:", { text, isSpoiler });
    // ---todo Logic API call ---
    const newComment: Comment = {
      id: Math.random(),
      user: { id: "user1", name: "Huy Lê", avatarUrl: "https://i.pravatar.cc/150?u=a042581f4e29026704d" },
      createdAt: new Date().toISOString(),
      text,
      isSpoiler,
      likes: 0,
    };
    setComments([newComment, ...comments]);
  };

  return (
    <div className="w-full max-w-4xl  bg-card rounded-lg p-6 md:p-8 text-white">
      {/* Header và Tabs */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageSquare className="h-7 w-7 text-gray-300" />
          <h2 className="text-2xl font-bold">Bình luận</h2>
        </div>
        <div className="flex items-center gap-1 bg-zinc-800 p-1 rounded-lg">
          <Button
            variant={activeTab === "comments" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("comments")}
            className={`rounded-md ${
              activeTab === "comments"
                ? "bg-red-600 text-white"
                : "text-gray-400"
            }`}
          >
            Bình luận
          </Button>
          <Button
            variant={activeTab === "reviews" ? "secondary" : "ghost"}
            onClick={() => setActiveTab("reviews")}
            className={`rounded-md ${
              activeTab === "reviews"
                ? "bg-red-600 text-white"
                : "text-gray-400"
            }`}
          >
            Đánh giá
          </Button>
        </div>
      </div>

      {/* Nội dung Tab */}
      <div className="space-y-8">
        {activeTab === "comments" ? (
          <>
            <CommentForm onSubmit={handleCommentSubmit} />
            <CommentList comments={comments} />
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 py-16 text-gray-500">
            <Star className="h-16 w-16" />
            <p className="text-lg font-medium">Chưa có đánh giá nào</p>
          </div>
        )}
      </div>
    </div>
  );
}