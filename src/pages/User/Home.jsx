import { useState, useEffect } from "react";
import axiosClient from "../../api/axiosClient";
import WhatshotIcon from "@mui/icons-material/Whatshot";
import TrendingEvent from "../../components/common/TrendingEvent";
import EventCard from "../../components/EventSearch/User/EventCard";
import { useAuth } from "../../hooks/useAuth";
import EventCardSkeleton from "../../components/EventSearch/User/EventCardSkeleton";

function Home() {
  const { user, openLogin } = useAuth();
  const [trending, setTrending] = useState([]);
  const [cat1, setCat1] = useState([]);
  const [cat2, setCat2] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getTrending = async () => {
      try {
        setLoading(true);
        const [resTrending, resCat1, resCat2] = await Promise.all([
          axiosClient.get(`/events/trending`),
          axiosClient.get("/events/public/search", {
            params: { categoryIds: ["01KGJ1PKYHGAME8BA3QAXYDSCJ"], size: 4 },
          }),
          axiosClient.get("/events/public/search", {
            params: { categoryIds: ["01KGJ1N6SG60BZD68S7W09QD6P"], size: 4 },
          }),
        ]);
        setTrending(resTrending?.data || []);
        setCat1(resCat1?.data?.content || []);
        setCat2(resCat2?.data?.content || []);
      } catch (error) {
        console.error("Fetch trending error:", error);
      } finally {
        setLoading(false);
      }
    };
    getTrending();
  }, [user]);

  return (
    <>
      <main className="px-2 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <WhatshotIcon className="text-orange-500" sx={{ fontSize: 35 }} />
            <h3 className="text-xl font-bold text-white">Sự kiện nổi bật</h3>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <TrendingEvent events={trending}></TrendingEvent>
        )}
      </main>
      <main className="px-2 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">Liveshow & Concert</h3>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cat1?.map((item) => (
              <EventCard
                event={item}
                key={item?.id}
                user={user}
                openLogin={openLogin}
              ></EventCard>
            ))}
          </div>
        )}
      </main>
      <main className="px-2 py-10 max-w-7xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            <h3 className="text-xl font-bold text-white">
              Sân khấu & Nhạc kịch
            </h3>
          </div>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-2.5">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="w-full">
                <EventCardSkeleton />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {cat2?.map((item) => (
              <EventCard
                key={item?.id}
                event={item}
                user={user}
                openLogin={openLogin}
              ></EventCard>
            ))}
          </div>
        )}
      </main>
    </>
  );
}

export default Home;
