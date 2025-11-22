import Navbar from "@/components/layout/NavBar";
import Footer from "@/components/layout/Footer";
import ActorList from "@/components/actor/ActorList";
import { getPeopleList } from "@/services/person.service";
import { ServerPagination } from "@/components/common/ServerPagination"; 

export default async function PeoplesPage({ searchParams }: { searchParams: { page?: string } }) {
  const currentPage = Number(searchParams.page) || 1;
  const { people, totalPages } = await getPeopleList(currentPage);

  return (
    <main className="min-h-screen bg-black text-white">
      <div className="fixed top-0 left-0 w-full z-50">
        <Navbar />
      </div>

      <div className="pt-24 pb-12 container mx-auto px-4">
        <div className="flex items-end justify-between mb-8">
          <div>
             <h1 className="text-3xl font-bold bg-gradient-to-r from-white to-gray-400 bg-clip-text text-transparent">
                Người nổi tiếng
             </h1>
             <p className="text-gray-400 mt-2">
                Danh sách diễn viên và đạo diễn
             </p>
          </div>
        </div>

        <ActorList people={people} />
        <div className="mt-12 flex justify-center">
           <ServerPagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
           />
        </div>
      </div>
      <Footer />
    </main>
  );
}