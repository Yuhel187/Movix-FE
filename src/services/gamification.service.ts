import { Achievement, UserAchievement } from "@/types/gamification";

const MOCK_ACHIEVEMENTS: Achievement[] = [
  {
    id: "1",
    name: "Tân Binh",
    description: "Hoàn thành việc đăng ký và xem bộ phim đầu tiên.",
    icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583344.png",
    condition_type: "MOVIE_COUNT",
    condition_value: 1, 
    reward_xp: 50,
    is_active: true,
  },
  {
    id: "2",
    name: "Mọt Phim",
    description: "Đạt 10 giờ xem phim trên hệ thống.",
    icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583434.png",
    condition_type: "WATCH_TIME",
    condition_value: 600, // 600 minutes
    reward_xp: 200,
    is_active: true,
  },
  {
    id: "3",
    name: "Thợ Săn XP",
    description: "Đạt mốc 1000 XP từ các hoạt động.",
    icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583319.png",
    condition_type: "XP",
    condition_value: 1000,
    reward_xp: 500,
    is_active: true,
  },
  {
    id: "4",
    name: "Khách Quen",
    description: "Đăng nhập liên tiếp 7 ngày.",
    icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583290.png",
    condition_type: "LOGIN_STREAK",
    condition_value: 7,
    reward_xp: 150,
    is_active: true, // Changed to true for testing visibility
  },
  {
      id: "5",
      name: "Bình Luận Viên",
      description: "Viết 10 bình luận đánh giá phim.",
      icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583387.png",
      condition_type: "COMMENT_COUNT",
      condition_value: 10,
      reward_xp: 100,
      is_active: true,
  },
    {
      id: "6",
      name: "Fan Cứng Marvel",
      description: "Xem 5 bộ phim thuộc vũ trụ điện ảnh Marvel.",
      icon_url: "https://cdn-icons-png.flaticon.com/512/2583/2583407.png",
      condition_type: "MOVIE_COUNT_CATEGORY",
      condition_value: 5,
      reward_xp: 300,
      is_active: true,
    }

];

// Simulate API call delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const getAllAchievements = async (): Promise<Achievement[]> => {
    await delay(500);
    return MOCK_ACHIEVEMENTS;
};

export const getUserAchievements = async (userId: string): Promise<UserAchievement[]> => {
    await delay(700);

    // This simulates backend logic: calculating progress for each achievement for a specific user
    // For now, we randomize it a bit or hardcode some states for demonstration
    return MOCK_ACHIEVEMENTS.map(achievement => {
        let progress = 0;
        let is_unlocked = false;
        let unlocked_at = undefined;

        // Mock logic - Example: User has progress on everything
        if (achievement.id === "1") { // Tân Binh - Complete
            progress = 1;
            is_unlocked = true;
            unlocked_at = "2024-01-15T10:00:00Z";
        } else if (achievement.id === "2") { // Mọt Phim - In Progress
            progress = 450; // 450/600 minutes
        } else if (achievement.id === "3") { // Thợ Săn XP - Barely started
             progress = 150; // 150/1000
        } else if (achievement.id === "4") { // Khách Quen - Complete
             progress = 7;
             is_unlocked = true;
             unlocked_at = "2024-03-01T08:30:00Z";
        } else {
             // Random progress for others
             progress = Math.floor(Math.random() * (achievement.condition_value + 1));
             if (progress >= achievement.condition_value) {
                 is_unlocked = true;
                 unlocked_at = new Date().toISOString();
                 progress = achievement.condition_value; // Cap at max
             }
        }

        return {
            ...achievement,
            progress,
            is_unlocked,
            unlocked_at
        };
    });
};

export const createAchievement = async (data: Omit<Achievement, 'id'>) => {
    await delay(500);
    const newAchievement = {
        ...data,
        id: Math.random().toString(36).substr(2, 9),
    };
    MOCK_ACHIEVEMENTS.push(newAchievement);
    return newAchievement;
};

export const updateAchievement = async (id: string, data: Partial<Achievement>) => {
    await delay(500);
    const index = MOCK_ACHIEVEMENTS.findIndex(a => a.id === id);
    if (index !== -1) {
        MOCK_ACHIEVEMENTS[index] = { ...MOCK_ACHIEVEMENTS[index], ...data };
        return MOCK_ACHIEVEMENTS[index];
    }
    throw new Error("Achievement not found");
};

export const deleteAchievement = async (id: string) => {
     await delay(500);
     const index = MOCK_ACHIEVEMENTS.findIndex(a => a.id === id);
     if (index !== -1) {
         MOCK_ACHIEVEMENTS.splice(index, 1);
         return true;
     }
     return false;
};
