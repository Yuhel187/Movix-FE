import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import ActorDetailPage from "@/components/actor/ActorDetailPage";
import AIChatWidget from "@/components/ai/AIChatWidget";
import { getPersonDetail } from "@/services/person.service";

export default async function PersonDetailPage({ 
  params 
}: { 
  params: Promise<{ id: string }> 
}) {
  const { id } = await params; 
  const person = await getPersonDetail(id);

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