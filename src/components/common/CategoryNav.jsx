import MusicNoteIcon from "@mui/icons-material/MusicNote";
import TheaterComedyIcon from "@mui/icons-material/TheaterComedy";
import EmojiEventsIcon from "@mui/icons-material/EmojiEvents";
import { useEffect, useState } from "react";
import axiosClient from "../../api/axiosClient";
import { useNavigate } from "react-router-dom";

function CategoryNav() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [categoryRes] = await Promise.all([
          axiosClient.get("/categories"),
        ]);
        setCategories(categoryRes.data);
      } catch (error) {
        console.error("Lỗi khi lấy dữ liệu:", error.message);
      }
    };
    fetchData();
  }, []);

  const handleCategoryClick = (categoryId) => {
    const params = new URLSearchParams(window.location.search);
    params.set("categoryIds", categoryId);
    params.set("page", "1");
    navigate(`/search?${params.toString()}`);
  };
  return (
    <>
      <style
        dangerouslySetInnerHTML={{
          __html: `
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `,
        }}
      />
      <div className="bg-black py-4 sticky top-20 z-49 border-b">
        <div className="max-w-full px-6 flex gap-4 overflow-x-auto no-scrollbar scroll-smooth">
          {categories.map((item) => (
            <button
              key={item.id}
              onClick={() => {
                handleCategoryClick(item?.id);
              }}
              className="flex items-center gap-2 px-4 py-2 bg-transparent hover:text-[#22C55E] transition-all whitespace-nowrap text-sm text-white font-medium"
            >
              {item.name}
            </button>
          ))}
        </div>
      </div>
    </>
  );
}
export default CategoryNav;
