import { Outlet } from "react-router-dom";
import Header from "./Header";
import CategoryNav from "../../common/CategoryNav";
import Footer from "./Footer";
import ScrollToTopButton from "../../common/ScrollToTopButton";

function UserLayout() {
  return (
    <div className="user-page-container bg-[#0A0A0A] min-h-screen">
      <Header></Header>
      <CategoryNav></CategoryNav>
      <main className="max-w-full h-full overflow-hidden pb-10">
        <Outlet />
      </main>
      <ScrollToTopButton />
      <Footer></Footer>
    </div>
  );
}

export default UserLayout;
