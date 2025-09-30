export default function Home() {
  return (
    <section className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-6 text-center">
      <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold mb-6 leading-tight">
        Xem Phim Miễn Phí Cực Nhanh, <br />
        Chất Lượng Cao Và Cập Nhật Liên Tục
      </h1>

      <p className="max-w-2xl text-gray-400 mb-8 text-base sm:text-lg leading-relaxed">
        Chào mừng bạn đến với Movix, không gian giải trí trực tuyến nơi hội tụ
        hàng ngàn bộ phim bom tấn, series hấp dẫn và chương trình truyền hình đặc sắc.
        <br />
        <br />
        Tại Movix, bạn có thể khám phá phim hành động, kinh dị, lãng mạn, anime và nhiều thể loại khác.
        Giao diện thân thiện, tốc độ mượt mà cùng chất lượng hình ảnh sắc nét sẽ mang đến trải nghiệm xem phim trọn vẹn nhất.
      </p>

      <a
        href="/movies"
        className="bg-red-600 hover:bg-red-700 transition-colors px-8 py-3 rounded-full text-lg font-semibold flex items-center gap-2"
      >
        ▶ Xem ngay
      </a>
    </section>
  );
}
