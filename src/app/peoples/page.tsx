import ActorListPage from "@/components/actor/ActorList";
import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { Actor } from "@/types/actor"; // <--- Dùng type hotfix

// Giả lập dữ liệu diễn viên (sử dụng type Actor cũ)
const MOCK_ACTORS: Actor[] = [
  // Hàng 1
  {
    id: "keanu-reeves",
    name: "Keanu Reeves",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/kEoUZKEG7dzbCESDjd0CKAN1r0n.jpg", 
  },
  {
    id: "scarlett-johansson",
    name: "Scarlett Johansson",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/mjReG6rR7NPMEIWb1T4YWtV11ty.jpg",
  },
  {
    id: "tom-hanks",
    name: "Tom Hanks",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/eKF1sGJRrZJbfBG1KirPt1cfNd3.jpg",
  },
  {
    id: "margot-robbie",
    name: "Margot Robbie",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/euDPyqLnuwaWMHajcU3oZ9uZezR.jpg",
  },
  {
    id: "chris-hemsworth",
    name: "Chris Hemsworth",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/jpurJ9jAcLCYjgHHfYF32m3zJYm.jpg",
  },
  {
    id: "zendaya",
    name: "Zendaya",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/3WdOloHpjtjL96uVOhFRRCcYSwq.jpg",
  },
  {
    id: "dwayne-johnson",
    name: "Dwayne Johnson",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/w500/kuqFzlYMc2IrsOyPznMd1FroeGq.jpg",
  },
  {
    id: "florence-pugh",
    name: "Florence Pugh",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/nuRLGEBCfUVXTjq9guz9OlTGjtL.jpg",
  },
  // Hàng 2
  {
    id: "ryan-gosling",
    name: "Ryan Gosling",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/asoKC7CLCqpZKZDL6iovNurQUdf.jpg",
  },
  {
    id: "anya-taylor-joy",
    name: "Anya Taylor-Joy",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/qYNofOjlRke2MlJVihmJmEdQI4v.jpg",
  },
  {
    id: "cillian-murphy",
    name: "Cillian Murphy",
    character: 'Nhiều vai diễn', 
    profileUrl: "https://image.tmdb.org/t/p/original/llkbyWKwpfowZ6C8peBjIV9jj99.jpg",
  },
  
];


export default function ActorsPage() {
  const allActors = MOCK_ACTORS;

  return (
    <main className="dark min-h-screen bg-black">
      <Navbar />
      <div className="pt-20">
        <ActorListPage allActors={allActors} />
      </div>
      <Footer />
      <AIChatWidget />
    </main>
  );
}