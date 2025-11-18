import ActorDetailPage from "@/components/actor/ActorDetailPage";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { Movie } from "@/types/movie";
import { Actor } from "@/types/actor";

// --- Mock Data chỉ cho Cillian Murphy ---

const CILLIAN_MURPHY_ACTOR: Actor = {
    id: "cillian-murphy",
    name: "Cillian Murphy",
    profileUrl: "https://image.tmdb.org/t/p/original/llkbyWKwpfowZ6C8peBjIV9jj99.jpg", // <--- Dùng trường hotfix
    avatar_url: "https://image.tmdb.org/t/p/original/llkbyWKwpfowZ6C8peBjIV9jj99.jpg",
    biography: "Cillian Murphy (sinh ngày 25 tháng 5 năm 1976) là một diễn viên người Ireland. Anh bắt đầu sự nghiệp của mình với vai trò là một nhạc sĩ nhạc rock. Anh nổi tiếng qua các vai diễn trong Oppenheimer và series Peaky Blinders.",
    character: 'N/A', // Không áp dụng ở trang chi tiết
};

const CILLIAN_MURPHY_MOVIES: Movie[] = [
    {
        id: "inception",
        slug: "inception",
        title: "Kẻ Đánh Cắp Giấc Mơ",
        original_title: "Inception",
        posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
        year: 2010,
        metadata: { duration: '2h 28m', views: 22000000 },
        tags: ["Hành động", "Sci-Fi", "Phiêu lưu"],
        description: "Một tên trộm chuyên đánh cắp bí mật từ trong tiềm thức của người khác được trao cơ hội cuối cùng để chuộc tội..."
    },
    {
        id: "batman-begins",
        slug: "batman-begins",
        title: "Batman Begins",
        original_title: "Batman Begins",
        posterUrl: "https://image.tmdb.org/t/p/original/ziFjqY3ABYTJZ2kHMzjr3eeyMQZ.jpg",
        year: 2005,
        metadata: { duration: '2h 20m', views: 18000000 },
        tags: ["Hành động", "Chính kịch"],
        description: "Sau bi kịch của cha mẹ, Bruce Wayne đi khắp thế giới tìm kiếm phương tiện chống lại sự bất công và trở thành Batman."
    },
    {
        id: "quiet-place-2",
        slug: "a-quiet-place-part-ii",
        title: "Vùng Đất Câm Lặng 2",
        original_title: "A Quiet Place Part II",
        posterUrl: "https://image.tmdb.org/t/p/original/oZheHNTZvHZGQLy7Pd1ORjtaiKv.jpg", 
        year: 2021,
        metadata: { duration: '1h 37m', views: 9000000 },
        tags: ["Kinh dị", "Sci-Fi", "Gây cấn"],
        description: "Sau các sự kiện chết chóc ở nhà, gia đình Abbott phải đối mặt với nỗi kinh hoàng của thế giới bên ngoài khi họ tiếp tục cuộc chiến sinh tồn trong im lặng."
    },

    {
        id: "oppenheimer",
        slug: "oppenheimer",
        title: "Oppenheimer",
        original_title: "Oppenheimer",
        posterUrl: "https://image.tmdb.org/t/p/original/ixLH2iM9at8BbuLr5wQWnCfwhJO.jpg",
        year: 2023,
        metadata: { duration: '3h 0m', views: 15000000 },
        tags: ["Chính kịch", "Lịch sử"],
        description: "Câu chuyện về nhà vật lý lý thuyết người Mỹ J. Robert Oppenheimer, người đã lãnh đạo Dự án Manhattan và phát triển vũ khí hạt nhân đầu tiên."
    },
    {
        id: "peaky-blinders",
        slug: "peaky-blinders",
        title: "Bóng Ma Anh Quốc",
        original_title: "Peaky Blinders",
        posterUrl: "https://image.tmdb.org/t/p/original/wMUNrwZmGKgFrclABHrRZD1jF49.jpg",
        year: 2013,
        metadata: { duration: '~ 60m/tập', views: 25000000 },
        tags: ["Chính kịch", "Tội phạm"],
        description: "Một băng đảng khét tiếng ở Birmingham, Anh, năm 1919, do Tommy Shelby cầm đầu, một tên trùm tội phạm quyết tâm vươn lên trong thế giới."
    },

];

// --- Hết Mock Data ---

async function getActorDetails(id: string): Promise<{ actor: Actor, movies: Movie[] }> {
    await new Promise(res => setTimeout(res, 300));

    // Chỉ kiểm tra Cillian Murphy
    if (id === 'cillian-murphy') {
        return {
            actor: CILLIAN_MURPHY_ACTOR,
            movies: CILLIAN_MURPHY_MOVIES,
        };
    }

    // Fallback cho bất kỳ ID nào khác (dùng data generic)
    const fallbackActor: Actor = {
        id: id,
        name: `Diễn viên (Fallback) ${id.replace('actor-', '')}`,
        profileUrl: `https://picsum.photos/seed/${id}/400/600`,
        biography: "Dữ liệu giả lập cho diễn viên này chưa được định nghĩa. Vui lòng kiểm tra mock data.",
        character: 'N/A',
    };

    const fallbackMovies: Movie[] = []; // Không trả về phim nào cho fallback

    return {
        actor: fallbackActor,
        movies: fallbackMovies,
    };
}


export default async function Page({ params }: { params: { id: string } }) {
    const { actor, movies } = await getActorDetails(params.id);

    return (
        <main className="dark min-h-screen bg-black">
            <Navbar />
            <div className="pt-20">
                <ActorDetailPage actor={actor} movies={movies} />
            </div>
            <Footer />
            <AIChatWidget />
        </main>
    );
}