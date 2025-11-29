import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPage from "./pages/register";
import LoginPage from "./pages/login";
import HomePage from "./pages/home";
import CreateBlogPage from "./pages/createBlog";
import LandingPage from "./pages/landing";
import BlogPage from "./pages/blog";
import EditBlogPage from "./pages/editBlog";
import BlogsPage from "./pages/blogs";
import TrashPage from "./pages/trash";
import ProfilePage from "./pages/profile";
import EditProfilePage from "./pages/editProfile";
import ChangePasswordPage from "./pages/changePassword";
import Header from "./pages/header";
import LogoutPage from "./pages/logout";


export default function App() {
  return (
    <BrowserRouter>
      <Header />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/home" element={<HomePage />} />
        <Route path="/blogs" element={<BlogsPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/create" element={<CreateBlogPage />} />
        <Route path="/blogs/:id" element={<BlogPage />} />
        <Route path="/blogs/:id/edit" element={<EditBlogPage />} />
        <Route path="/trash" element={<TrashPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/profile/edit" element={<EditProfilePage />} />
        <Route path="/profile/password" element={<ChangePasswordPage />} />
        <Route path="/logout" element={<LogoutPage />} />
      </Routes>
    </BrowserRouter>
  );
}
