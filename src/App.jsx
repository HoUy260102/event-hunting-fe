import { Route, Routes } from "react-router-dom";
import "./App.css";
import LoginPage from "./pages/Login/LoginPage";
import SignUpPage from "./pages/SignUp/SignUpPage";
import VerifyWaitingSignUpPage from "./pages/VerifyWaitingSignUp/VerifyWaitingSignUpPage";
import Dashboard from "./pages/Admin/Dashboard";
import UserList from "./pages/Admin/UserList";
import AddUser from "./pages/Admin/AddUser";
import UpdateUser from "./pages/Admin/UpdateUser";
import RoleAssignment from "./pages/Admin/RoleAssignment";
import AddCategory from "./pages/Admin/AddCategory";
import CategoryList from "./pages/Admin/CategoryList";
import UpdateCategory from "./pages/Admin/UpdateCategory";
import AddEvent from "./pages/Admin/AddEvent/AddEvent";
import UpdateEvent from "./pages/Admin/UpdateEvent/UpdateEvent";
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
import TicketDetail from "./components/common/TicketDetail";
import PaymentSuccess from "./pages/User/Booking/PaymentSuccess";
function App() {
  const { isLoginModalOpen, closeLogin } = useAuth();
  return (
    <>
      <LoginModal isOpen={isLoginModalOpen} onClose={closeLogin} />
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/verify" element={<VerifyWaitingSignUpPage />} />

        <Route element={<ProtectedRoute />}>
          <Route path="/admin" element={<Dashboard />}>
            <Route path="users" element={<UserList />} />
            <Route path="add-user" element={<AddUser />} />
            <Route path="update-user/:id" element={<UpdateUser />} />

            <Route path="categories" element={<CategoryList />} />
            <Route path="add-category" element={<AddCategory />} />
            <Route path="update-category/:id" element={<UpdateCategory />} />

            <Route path="roles/assignment" element={<RoleAssignment />} />

            <Route path="add-event" element={<AddEvent />} />
            <Route path="update-event/:id" element={<UpdateEvent />} />
            <Route path="event/:id/overview" element={<EventOverview />} />
            <Route path="events" element={<EventList />} />
          </Route>
        </Route>

        <Route path="/" element={<UserLayout />}>
          <Route path="event/:id/details" element={<EventInfor />} />
          <Route element={<ProtectedRoute />}>
            <Route
              path="event/:eventId/show/:showId/booking"
              element={<Booking />}
            />
            <Route path="my-tickets" element={<MyTickets />} />
            <Route path="my-tickets/:id" element={<TicketDetail />} />
            <Route path="payments/:id" element={<PaymentSuccess />} />
          </Route>
          <Route path="search" element={<EventSearch />} />
        </Route>
      </Routes>
    </>
  );
}

export default App;
