import React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Profile from "./Pages/Profile/Profile";
import Logout from "./Components/Logout";
import StackItLanding from "./Pages/Landing/Landing";
import RichTextDemo from "./Pages/RichTextDemo/RichTextDemo";
import Home from "./Pages/Home/Home";
import AskQuestion from "./Pages/AskQuestion/AskQuestion";
import LoginPage from "./Pages/Authentication/Login/Login";
import ProfilePage from "./Pages/Profile/Profile";

function App() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const token = urlParams.get("token");

    if (token) {
      localStorage.setItem("token", token);
      navigate("/profile", { replace: true });
    }
  }, [location, navigate]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    // Redirect to login if no token and trying to access protected routes
    if (
      !token &&
      (location.pathname === "/profile" || location.pathname === "/")
    ) {
      navigate("/login", { replace: true });
    }
    // Redirect to profile if have token and on root
    else if (token && location.pathname === "/") {
      navigate("/profile", { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      <Logout />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/" element={<StackItLanding />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/landing" element={<StackItLanding />} />
        <Route path="/rich-text-demo" element={<RichTextDemo />} />
      </Routes>
    </div>
  );
}

export default App;
