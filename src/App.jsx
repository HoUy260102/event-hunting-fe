import { Route, Routes } from "react-router-dom";
import "./App.css";
import AuthProvider from "./contexts/AuthContext";
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
function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignUpPage />} />
        <Route path="/signup/verify" element={<VerifyWaitingSignUpPage />} />
        <Route path="/event/:id/details" element={<EventInfor />} />
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
      </Routes>
    </AuthProvider>
  );
}

export default App;
