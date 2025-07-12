import React from "react";
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Routes, Route } from "react-router-dom";
import "./App.css";
import StackItLanding from "./Pages/Landing/Landing";
import RichTextDemo from "./Pages/RichTextDemo/RichTextDemo";
import Home from "./Pages/Home/Home";
import AskQuestion from "./Pages/AskQuestion/AskQuestion";
import LoginPage from "./Pages/Authentication/Login/Login";
import ProfilePage from "./Pages/Profile/Profile";
import QuestionDetails from './Pages/QuestionDetails';

function App() {
  return (
    <div>
      <Routes>
        <Route path="/home" element={<Home />} />
        <Route path="/ask-question" element={<AskQuestion />} />
        <Route path="/home/:id" element={<QuestionDetails />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/landing" element={<StackItLanding />} />
        <Route path="/rich-text-demo" element={<RichTextDemo />} />
      </Routes>
    </div>
  );
}

export default App;
