import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import ActorDetailPage from "@/components/actor/ActorDetailPage";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { getPersonDetail } from "@/services/person.service";

export default async function PersonDetailPage({ params }: { params: { id: string } }) {
  const person = await getPersonDetail(params.id);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>
      <ActorDetailPage person={person} />
      
      <Footer />
      <AIChatWidget />
    </main>
  );
}