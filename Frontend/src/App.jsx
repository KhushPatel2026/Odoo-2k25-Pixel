import React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import Login from "./Pages/Authentication/Login/Login";
import Profile from "./Pages/Profile/Profile";
import Logout from "./Components/Logout";
import StackItLanding from "./Pages/Landing/Landing";
import RichTextDemo from "./Pages/RichTextDemo/RichTextDemo";
import Home from "./Pages/Home/Home";
import AskQuestion from "./Pages/AskQuestion/AskQuestion";

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
    // Only redirect if we're on the root path and have authentication logic
    if (location.pathname === "/" && token) {
      navigate("/profile", { replace: true });
    }
  }, [navigate, location.pathname]);

  return (
    <div>
      <Logout />
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/login" element={<Login />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/landing" element={<StackItLanding />} />
        <Route path="/rich-text-demo" element={<RichTextDemo />} />
      </Routes>
    </div>
  );
}

export default App;
