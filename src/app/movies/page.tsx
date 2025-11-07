'use client';

import Navbar from "@/components/layout/NavBar";
import HeroBanner from "@/components/movie/HeroBanner";
import type { Movie } from "@/types/movie";
import { MovieCarousel } from "@/components/movie/MovieCarousel"; 
import Footer from "@/components/layout/Footer";

export default function MoviesPage() {
  const featuredMovies: Movie[] = [
    {
      id: "breaking-bad",
      slug: "breaking-bad",
      title: "Breaking Bad",
      description:
        "Walter White, giáo viên hóa học bị ung thư, bắt đầu hành trình sản xuất ma túy để lo cho gia đình.",
      posterUrl:
        "https://image.tmdb.org/t/p/original/ggFHVNu6YYI5L9pCfOacjizRGt.jpg",
      backdropUrl:
        "https://image.tmdb.org/t/p/original/9faGSFi5jam6pDWGNd0p8JcJgXQ.jpg",
      tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
    },
    {
      id: "interstellar",
      slug: "interstellar",
      title: "Giữa Các Vì Sao",
      subTitle: "Interstellar",
      description: "A fiery young man clashes with an unflinching forest officer in a south Indian village where spirituality, fate and folklore rule the lands.",
      posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
      backdropUrl: "https://image.tmdb.org/t/p/original/9REO1DLpmwhrBJY3mYW5eVxkXFM.jpg",
      tags: ["T18", "Hình sự", "Khoa học", "Tâm lý"],
    },
    {
      id: "your-name",
      slug: "your-name",
      title: "Kỵ Sĩ Bóng Đêm",
      subTitle: "The Dark Knight",
      description:
        "Joker gieo rắc hỗn loạn ở Gotham, buộc Batman phải đối mặt với giới hạn đạo đức của chính mình.",
      posterUrl:
        "https://image.tmdb.org/t/p/original/qJ2tW6WMUDux911r6m7haRef0WH.jpg",
      backdropUrl:
        "https://image.tmdb.org/t/p/original/orKrjonvMHiGFjuDNKnQGkXfGe8.jpg",
      tags: ["Chính kịch", "Hành động", "Tội phạm"],
    },
  ];
const recommendMovies: Movie[] = [
  {
    id: "interstellar",
    slug: "interstellar",
    title: "Hố Đen Tử Thần",
    subTitle: "Interstellar",
    description:
      "Một nhóm nhà thám hiểm dùng lỗ sâu để tìm ngôi nhà mới cho nhân loại.",
    posterUrl: "https://image.tmdb.org/t/p/original/if4TI9LbqNIrzkoOgWjX5PZYDYe.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/ln2Gre4IYRhpjuGVybbtaF4CLo5.jpg",
    tags: ["Khoa học", "Phiêu lưu", "Chính kịch"],
    year: 2014,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.6,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
  {
    id: "parasite",
    slug: "parasite",
    title: "Ký Sinh Trùng",
    subTitle: "Parasite",
    description:
      "Gia đình Ki-taek thâm nhập vào gia đình giàu có họ Park với những hệ lụy khó lường.",
    posterUrl: "https://image.tmdb.org/t/p/w500/7IiTTgloJU318Uv9B9gW8e8M9g5.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/hiKmpZNUZrfWdLRngjmxLtzUBOD.jpg",
    tags: ["Chính kịch", "Gay cấn", "Hài đen"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.5,
    duration: "2h 12m",
    country: "Hàn Quốc",
    views: 8200000,
  },
  {
    id: "la-la-land",
    slug: "la-la-land",
    title: "Những Kẻ Khờ Mộng Mơ",
    subTitle: "La La Land",
    description:
      "Câu chuyện tình giữa nữ diễn viên trẻ và nhạc công jazz ở Los Angeles.",
    posterUrl: "https://image.tmdb.org/t/p/original/gN1VfkONPYb7frEKfpCFTHRMxj3.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/qJeU7KM4nR2C1TuUmnkpLMU7mh.jpg",
    tags: ["Lãng mạn", "Nhạc", "Chính kịch"],
    year: 2016,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 7.9,
    duration: "2h 8m",
    country: "Mỹ",
    views: 5100000,
  },
  {
    id: "mat-biec",
    slug: "mat-biec",
    title: "Mắt Biếc",
    subTitle: "Mat Biec",
    description:
      "Mối tình đơn phương của Ngạn dành cho Hà Lan, trải dài từ tuổi thơ đến trưởng thành.",
    posterUrl: "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    tags: ["Lãng mạn", "Chính kịch"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.0,
    duration: "1h 57m",
    country: "Việt Nam",
    views: 4400000,
  },
];
const actionMovies: Movie[] = [
  {
    id: "john-wick",
    slug: "john-wick",
    title: "Sát Thủ John Wick",
    subTitle: "John Wick",
    description:
      "Cựu sát thủ tái xuất giang hồ để trả thù những kẻ sát hại chú chó của mình.",
    posterUrl: "https://image.tmdb.org/t/p/original/8CYSvYTw9tbFynivdcBcoqRWPGM.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/vL5LR6WdxWPjLPFRLe133jXWsh5.jpg",
    tags: ["Hành động", "Tội phạm", "Gay cấn"],
    year: 2014,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 7.4,
    duration: "1h 41m",
    country: "Mỹ",
    views: 7200000,
  },
  {
    id: "avengers-endgame",
    slug: "avengers-endgame",
    title: "Avengers: Hồi Kết",
    subTitle: "Avengers: Endgame",
    description:
      "Avengers tập hợp để đảo ngược hành động của Thanos và cứu vũ trụ.",
    posterUrl:
      "https://image.tmdb.org/t/p/original/8go3YE9sBMQaCXEx23j6BAfeuxd.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    tags: ["Hành động", "Phiêu lưu", "Khoa học"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.3,
    duration: "3h 1m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: "train-to-busan",
    slug: "train-to-busan",
    title: "Chuyến Tàu Sinh Tử",
    subTitle: "Train to Busan",
    description:
      "Virus zombie bùng phát, hành khách trên chuyến tàu đến Busan chiến đấu sinh tồn.",
    posterUrl:
      "https://image.tmdb.org/t/p/original/xMAMpuKpqXI3tfWow59oInjfoPA.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/aKISIT8ir0UhHD4yRHDzpK4b6yS.jpg",
    tags: ["Hành động", "Kinh dị", "Gay cấn"],
    year: 2016,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 7.8,
    duration: "1h 58m",
    country: "Hàn Quốc",
    views: 7300000,
  },
  {
    id: "spider-man-into-the-spider-verse",
    slug: "spider-man-into-the-spider-verse",
    title: "Người Nhện: Vũ Trụ Mới",
    subTitle: "Spider-Man: Into the Spider-Verse",
    description:
      "Miles Morales hợp lực với các Người Nhện từ đa vũ trụ để cứu toàn bộ thực tại.",
    posterUrl: "https://image.tmdb.org/t/p/w500/iiZZdoQBEYBv6id8su7ImL0oCbD.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/uUiId6cG32JSRI6RyBGGvU62uMf.jpg",
    tags: ["Hành động", "Hoạt hình", "Phiêu lưu"],
    year: 2018,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.4,
    duration: "1h 57m",
    country: "Mỹ",
    views: 8600000,
  },
  {
    id: "inception",
    slug: "inception",
    title: "Kẻ Đánh Cắp Giấc Mơ",
    subTitle: "Inception",
    description:
      "Xâm nhập giấc mơ để đánh cắp/cài cắm ý tưởng — phi vụ bất khả thi.",
    posterUrl: "https://image.tmdb.org/t/p/w500/9gk7adHYeDvHkCSEqAvQNLV5Uge.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/ztZ4vw151mw04Bg6rqJLQGBAmvn.jpg",
    tags: ["Hành động", "Khoa học", "Giật gân"],
    year: 2010,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.8,
    duration: "2h 28m",
    country: "Mỹ",
    views: 9800000,
  },
];

const newupdateMovies: Movie[] = [
  {
    id: "mai",
    slug: "mai",
    title: "Mai",
    subTitle: "Mai",
    description:
      "Mai gặp nhạc công Dương; mặc cảm quá khứ khiến cô do dự đón nhận tình cảm.",
    posterUrl: "https://image.tmdb.org/t/p/original/n764Alj5Uf1uMtnEpN3OkVyLob5.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/zZ6nRdNQNxRnZ1LQ2ttPBZl9AXV.jpg",
    tags: ["Lãng mạn", "Tâm lý", "Chính kịch"],
    year: 2024,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 7.8,
    duration: "2h 11m",
    country: "Việt Nam",
    views: 6900000,
  },
  {
    id: "avengers-endgame",
    slug: "avengers-endgame",
    title: "Avengers: Hồi Kết",
    subTitle: "Avengers: Endgame",
    description:
      "Các siêu anh hùng nỗ lực đảo ngược thảm họa và cứu vũ trụ.",
    posterUrl:
      "https://image.tmdb.org/t/p/original/8go3YE9sBMQaCXEx23j6BAfeuxd.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/7RyHsO4yDXtBv1zUU3mTpHeQ0d5.jpg",
    tags: ["Hành động", "Phiêu lưu", "Khoa học"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.3,
    duration: "3h 1m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: "mat-biec",
    slug: "mat-biec",
    title: "Mắt Biếc",
    subTitle: "Mat Biec",
    description:
      "Chuyện tình đơn phương của Ngạn dành cho Hà Lan qua năm tháng.",
    posterUrl: "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    tags: ["Lãng mạn", "Chính kịch"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.0,
    duration: "1h 57m",
    country: "Việt Nam",
    views: 4300000,
  },
  {
    id: "your-name",
    slug: "your-name",
    title: "Tên Cậu Là Gì?",
    subTitle: "Kimi no Na wa.",
    description:
      "Hai người lạ kết nối qua giấc mơ và tìm cách gặp nhau ngoài đời thực.",
    posterUrl: "https://image.tmdb.org/t/p/w500/q719jXXEzOoYaps6babgKnONONX.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/dIWwZW7dJJtqC6CgWzhYkypQDrm.jpg",
    tags: ["Anime", "Lãng mạn", "Giả tưởng"],
    year: 2016,
    type: "Anime Movie",
    episode: "Full HD",
    rating: 8.6,
    duration: "1h 46m",
    country: "Nhật Bản",
    views: 9100000,
  },
  {
    id: "squid-game",
    slug: "squid-game",
    title: "Trò Chơi Con Mực",
    subTitle: "Squid Game (Series)",
    description:
      "Hàng trăm người kẹt tiền tham gia trò chơi sinh tồn để giành giải thưởng.",
    posterUrl: "https://image.tmdb.org/t/p/w500/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/dDlEmu3EZ0Pgg93K2SVNLCjCSvE.jpg",
    tags: ["Hành động", "Gay cấn", "Bí ẩn"],
    year: 2021,
    type: "TV Series",
    episode: "Mùa 1",
    rating: 8.4,
    duration: "~60m/tập",
    country: "Hàn Quốc",
    views: 15000000,
  },
];
const horrorMovies: Movie[] = [
  {
    id: '74af397a-0b08-4816-a941-9cfa8b8fc3a9',
    slug: "inception",
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Si`êu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 2,
    slug: "john-wick-4",
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
  {
    id: "mat-biec",
    slug: "mat-biec",
    title: "Mắt Biếc",
    subTitle: "Mat Biec",
    description:
      "Chuyện tình đơn phương của Ngạn dành cho Hà Lan qua năm tháng.",
    posterUrl: "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    backdropUrl:
      "https://image.tmdb.org/t/p/original/mCB5zkwMdDoygHV4Lklps74K3dK.jpg",
    tags: ["Lãng mạn", "Chính kịch"],
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 8.0,
    duration: "1h 57m",
    country: "Việt Nam",
    views: 4300000,
  },
  {
    id: 4,
    slug: "interstellar",
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
  {
    id: "mai",
    slug: "mai",
    title: "Mai",
    subTitle: "Mai",
    description:
      "Mai gặp nhạc công Dương; mặc cảm quá khứ khiến cô do dự đón nhận tình cảm.",
    posterUrl: "https://image.tmdb.org/t/p/original/n764Alj5Uf1uMtnEpN3OkVyLob5.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/zZ6nRdNQNxRnZ1LQ2ttPBZl9AXV.jpg",
    tags: ["Lãng mạn", "Tâm lý", "Chính kịch"],
    year: 2024,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    rating: 7.8,
    duration: "2h 11m",
    country: "Việt Nam",
    views: 6900000,
  },
  {
    id: 6,
    title: "Interstellar",
    subTitle: "Cuộc du hành xuyên không gian",
    posterUrl: "https://image.tmdb.org/t/p/w500/gEU2QniE6E77NI6lCU6MxlNBvIx.jpg",
    description:
      "Một nhóm phi hành gia vượt qua lỗ sâu để tìm kiếm hành tinh có thể sinh sống cho loài người.",
    year: 2014,
    type: "Phim khoa học viễn tưởng",
    episode: "Full HD",
    tags: ["Sci-Fi", "Phiêu lưu", "Tâm lý"],
    rating: 8.9,
    duration: "2h 49m",
    country: "Mỹ",
    views: 10400000,
  },
   {
    id: 7,
    title: "Avengers: Endgame",
    subTitle: "Hồi kết của Avengers",
    posterUrl: "https://image.tmdb.org/t/p/w500/ulzhLuWrPK07P1YkdWQLZnQh1JL.jpg",
    backdropUrl: "https://image.tmdb.org/t/p/original/or06FN3Dka5tukK1e9sl16pB3iy.jpg",
    description:
      "Sau khi Thanos xóa sổ nửa vũ trụ, những anh hùng còn lại phải tìm cách đảo ngược thảm họa và cứu lấy thế giới.",
    year: 2019,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Khoa học viễn tưởng", "Siêu anh hùng"],
    rating: 9.0,
    duration: "3h 2m",
    country: "Mỹ",
    views: 12000000,
  },
  {
    id: 8,
    slug: "inception",
    title: "John Wick 4",
    subTitle: "Chương cuối của sát thủ huyền thoại",
    posterUrl: "https://image.tmdb.org/t/p/w500/vZloFAK7NmvMGKE7VkF5UHaz0I.jpg",
    description:
      "John Wick đối đầu với Hội Bàn Tròn trong trận chiến sinh tử để giành lại tự do của mình.",
    year: 2023,
    type: "Phim chiếu rạp",
    episode: "Full HD",
    tags: ["Hành động", "Tội phạm", "Hồi hộp"],
    rating: 8.7,
    duration: "2h 49m",
    country: "Mỹ",
    views: 8900000,
  },
]

  return (
    <main className="dark min-h-screen bg-black">
      <Navbar />
      <section className="w-full h-screen">
        <HeroBanner movies={featuredMovies} />
      </section>
      <MovieCarousel 
        title="Phim Thịnh Hành" 
        movies={horrorMovies} 
      />
      <MovieCarousel title="Dành riêng cho bạn" movies={recommendMovies} />
      <MovieCarousel title="Phim Hành Động" movies={actionMovies} />
      <MovieCarousel title="Mới Cập Nhật" movies={newupdateMovies} />
      

      <Footer />
    </main>
  );
}