"use client";

import React, { useState } from "react";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { PostCard, Post } from "@/components/post/PostCard";
import { Sparkles, MessageSquare, TrendingUp } from "lucide-react";

// Extend Post interface for filtering
interface BlogPost extends Post {
  category: "newest" | "reviews" | "top";
}

// --- MOCK DATA ---
const BLOG_POSTS: BlogPost[] = [
  {
    id: "1",
    author: {
        username: "Admin Movix",
        avatarUrl: "/images/logo.png",
    },
    timeAgo: "2 giờ trước",
    content: "Khi mùa xuân đang dần chuyển sang hè, các hãng phim lớn cũng bắt đầu tung ra những bom tấn đầu tiên. Cùng điểm qua những cái tên không thể bỏ lỡ trong tháng 3 này. Dune Part 2 vẫn đang làm mưa làm gió tại các rạp chiếu...",
    imageUrl: "https://images.unsplash.com/photo-1536440136628-849c177e76a1?q=80&w=1000&auto=format&fit=crop",
    stats: {
        likes: 120,
        comments: 45,
        shares: 12
    },
    category: "newest"
  },
  {
    id: "2",
    author: {
        username: "Minh Tuấn",
        avatarUrl: "https://github.com/shadcn.png",
    },
    timeAgo: "5 giờ trước",
    content: "REVIEW CHI TIẾT: Dune Part 2.\nSau thành công vang dội của phần 1, đạo diễn Denis Villeneuve tiếp tục đưa chúng ta trở lại Arrakis với quy mô hoành tráng hơn gấp bội. Kịch bản chặt chẽ, hình ảnh mãn nhãn và âm nhạc của Hans Zimmer vẫn là điểm nhấn không thể chối từ...",
    imageUrl: "https://images.unsplash.com/photo-1542204165-65bf26472b9b?q=80&w=1000&auto=format&fit=crop",
    stats: {
        likes: 85,
        comments: 32,
        shares: 5
    },
    category: "reviews"
  },
  {
    id: "3",
    author: {
        username: "Support Team",
        avatarUrl: "/images/support.png",
    },
    timeAgo: "1 ngày trước",
    content: "Xem phim cùng bạn bè chưa bao giờ dễ dàng đến thế. Tìm hiểu cách tạo phòng, mời bạn bè và chat voice trực tiếp trên Movix với tính năng Watch Party mới nhất...",
    imageUrl: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?q=80&w=1000&auto=format&fit=crop",
    stats: {
        likes: 210,
        comments: 88,
        shares: 45
    },
    category: "newest"
  },
  {
    id: "4",
    author: {
        username: "Lan Anh",
        avatarUrl: "https://github.com/shadcn.png",
    },
    timeAgo: "2 ngày trước",
    content: "Thảo luận: Oscar 2026 và những dự đoán táo bạo.\nLiệu phim nghệ thuật hay bom tấn thương mại sẽ lên ngôi? Cùng nhìn lại những ứng cử viên sáng giá nhất cho hạng mục Phim Hay Nhất...",
    imageUrl: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1000&auto=format&fit=crop",
    stats: {
        likes: 156,
        comments: 142,
        shares: 18
    },
    category: "top"
  },
  {
    id: "5",
    author: {
        username: "Phê Phim",
        avatarUrl: "https://yt3.googleusercontent.com/ytc/AIdro_nC4q7q4j-9vM4d8d8d8d8d8d8d=s900-c-k-c0x00ffffff-no-rj",
    },
    timeAgo: "3 ngày trước",
    content: "Top 10 Easter Eggs bạn có thể đã bỏ lỡ trong 'The Batman Part II'. Matt Reeves thực sự là một thiên tài trong việc cài cắm các chi tiết nhỏ...",
    imageUrl: "https://images.unsplash.com/photo-1626814026160-2237a95fc5a0?q=80&w=1000&auto=format&fit=crop",
    stats: {
        likes: 312,
        comments: 56,
        shares: 21
    },
    category: "reviews"
  }
];

export default function BlogPage() {
  const [activeFilter, setActiveFilter] = useState<"newest" | "reviews" | "top">("newest");

  const filteredPosts = activeFilter === "newest" 
    ? BLOG_POSTS 
    : BLOG_POSTS.filter(post => post.category === activeFilter);

  return (
    <div className="bg-black min-h-screen flex flex-col font-sans dark text-white">
       <Navbar />
       
       <main className="flex-grow pt-24 pb-20 px-4 md:px-8">
          <div className="max-w-xl mx-auto">
             {/* Header Section */}
             <div className="mb-8 text-center sm:text-left space-y-2 border-b border-zinc-800 pb-6">
               <h1 className="text-2xl font-bold text-white tracking-tight">
                 Cộng Đồng Movix
               </h1>
               <p className="text-zinc-400 text-sm">
                 Nơi chia sẻ, thảo luận và kết nối đam mê điện ảnh.
               </p>
             </div>

             {/* Filter Tabs */}
             <div className="flex items-center space-x-2 mb-6 overflow-x-auto pb-2 scrollbar-hide">
               <Button 
                 variant={activeFilter === 'newest' ? "default" : "secondary"} 
                 size="sm"
                 onClick={() => setActiveFilter('newest')}
                 className={`rounded-full transition-all ${activeFilter === 'newest' ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
               >
                 <Sparkles className="w-4 h-4 mr-2" />
                 Bài viết mới
               </Button>
               <Button 
                 variant={activeFilter === 'reviews' ? "default" : "secondary"} 
                 size="sm"
                 onClick={() => setActiveFilter('reviews')}
                 className={`rounded-full transition-all ${activeFilter === 'reviews' ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
               >
                 <MessageSquare className="w-4 h-4 mr-2" />
                 Đánh giá chuyên sâu
               </Button>
               <Button 
                 variant={activeFilter === 'top' ? "default" : "secondary"} 
                 size="sm"
                 onClick={() => setActiveFilter('top')}
                 className={`rounded-full transition-all ${activeFilter === 'top' ? 'bg-yellow-500 hover:bg-yellow-600 text-black font-semibold' : 'bg-zinc-900 text-zinc-400 hover:bg-zinc-800 hover:text-white'}`}
               >
                 <TrendingUp className="w-4 h-4 mr-2" />
                 Top thảo luận
               </Button>
             </div>

             {/* Blog List - Social Feed Layout */}
             <div className="space-y-6">
               {filteredPosts.length > 0 ? (
                 filteredPosts.map((post) => (
                   <div key={post.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                     <PostCard post={post} />
                   </div>
                 ))
               ) : (
                 <div className="text-center py-10 text-zinc-500">
                   Chưa có bài viết nào trong mục này.
                 </div>
               )}
             </div>

             {/* Load More */}
             <div className="mt-10 text-center flex justify-center">
                 <Button variant="ghost" className="text-zinc-500 hover:text-white hover:bg-zinc-900 transition-all">
                    Đang tải thêm...
                 </Button>
             </div>
          </div>
       </main>

       <Footer />
    </div>
  );
}
