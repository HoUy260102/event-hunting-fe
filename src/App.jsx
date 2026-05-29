import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/Login/LoginPage";
import AdminLoginPage from "./pages/Login/AdminLoginPage";
import SignUpPage from "./pages/SignUp/SignUpPage";
import VerifyWaitingSignUpPage from "./pages/VerifyWaitingSignUp/VerifyWaitingSignUpPage";
import Dashboard from "./pages/Admin/Dashboard";
import DashboardOverview from "./pages/Admin/DashboardOverview";
import UserList from "./pages/Admin/UserList";
import AddUser from "./pages/Admin/AddUser";
import UpdateUser from "./pages/Admin/UpdateUser";
import RoleAssignment from "./pages/Admin/RoleAssignment";
import AddCategory from "./pages/Admin/AddCategory";
import CategoryList from "./pages/Admin/CategoryList";
import UpdateCategory from "./pages/Admin/UpdateCategory";
import AddEvent from "./pages/Admin/AddEvent/AddEvent";
import UpdateEvent from "./pages/Admin/UpdateEvent/UpdateEvent";
import InfoEvent from "./pages/Admin/InfoEvent/InfoEvent";
import EventInfor from "./pages/User/EventInfor";
import EventList from "./pages/Admin/EventList";
import EventOverview from "./pages/Admin/EventOverview";
import UserLayout from "./components/layouts/UserLayout/UserLayout";
import Booking from "./pages/User/Booking/Booking";
import EventSearch from "./pages/User/EventSearch";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useAuth } from "./hooks/useAuth";
import LoginModal from "./components/modals/LoginModal";
import MyTickets from "./pages/User/MyTickets";
import MyCalendar from "./pages/User/MyCalendar";
import TicketDetail from "./components/common/TicketDetail";
import PaymentSuccess from "./pages/User/Booking/PaymentSuccess";
import ReservationSummary from "./pages/User/ReservationSummary";
import UserProfile from "./pages/User/UserProfile";
import ChangePassword from "./pages/User/ChangePassword";
import Forbidden403 from "./pages/Forbidden403";
import NotFound404 from "./pages/NotFound404";
import TicketList from "./pages/Admin/TicketList";
import WaitingRoom from "./pages/User/Booking/WaitingRoom";
import AddVoucher from "./pages/Admin/AddVoucher";
import UpdateVoucher from "./pages/Admin/UpdateVoucher";
import VoucherList from "./pages/Admin/VoucherList";
import { useScrollToTop } from "./hooks/useScrollToTop";
import MyfavoriteEvent from "./pages/User/MyFavoriteEvent";
import Home from "./pages/User/Home";
import GeneralError from "./pages/GeneralError";
import ReservationList from "./pages/Admin/ReservationList";
import UpdateProfile from "./pages/Admin/UpdateProfile";

function App() {
  const { isLoginModalOpen, closeLogin } = useAuth();
  useScrollToTop();
  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLogin} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/verify" element={<VerifyWaitingSignUpPage />} />
        <Route path="/forbidden" element={<Forbidden403 />} />
        <Route path="/notfound" element={<NotFound404 />} />
        <Route path="/general-error" element={<GeneralError />} />
        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />}>
            <Route index element={<DashboardOverview />} />
            <Route path="update-profile" element={<UpdateProfile />} />
            
            <Route path="users" element={<UserList />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="update-user/:id" element={<UpdateUser />} />

            <Route path="categories" element={<CategoryList />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="update-category/:id" element={<UpdateCategory />} />

            <Route path="roles/assignment" element={<RoleAssignment />} />

            <Route path="add-event" element={<AddEvent />} />
            <Route path="update-event/:id" element={<UpdateEvent />} />
            <Route path="info-event/:id" element={<InfoEvent />} />
            <Route path="event/:id/overview" element={<EventOverview />} />
            <Route path="shows/:showId/tickets" element={<TicketList />} />
            <Route path="events" element={<EventList />} />

            <Route path="vouchers" element={<VoucherList />} />
            <Route path="add-voucher" element={<AddVoucher />} />
            <Route path="update-voucher/:id" element={<UpdateVoucher />} />

            <Route path="reservations" element={<ReservationList />} />
          </Route>
        </Route>

        <Route path="/" element={<UserLayout />}>
          <Route path="" element={<Home />} />
          <Route path="event/:id/details" element={<EventInfor />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="event/:eventId/show/:showId/booking"
              element={<Booking />}
            />
            <Route
              path="event/:eventId/show/:showId/queue"
              element={<WaitingRoom />}
            />
            <Route path="my-favorite-events" element={<MyfavoriteEvent />} />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="my-calendar" element={<MyCalendar />} />
            <Route path="my-tickets/:id" element={<TicketDetail />} />
            <Route path="payments/success/:id" element={<PaymentSuccess />} />
            <Route
              path="reservations/:id/summary"
              element={<ReservationSummary />}
            />
            <Route path="user/profile" element={<UserProfile />} />
            <Route path="user/change-password" element={<ChangePassword />} />
          </Route>
          <Route path="search" element={<EventSearch />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
