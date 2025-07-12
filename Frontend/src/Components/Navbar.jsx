import React, { useState } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Bell, Menu, X, LogOut } from "lucide-react";

const Navbar = ({ userRole = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/landing");
  };

  return (
    <nav className="relative z-50 border-b border-white/10 bg-black/20 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4 md:gap-0">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20">
              <Globe className="w-6 h-6 text-white" />
            </div>
            <span className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
              StackIt
            </span>
          </div>

          <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
            <Link
              to="/home"
              className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
            >
              Home
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              to="/ask-question"
              className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
            >
              Ask Question
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
            </Link>
            <Link
              to="/profile"
              className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
            >
              Profile
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
            </Link>
            {userRole === "admin" && (
              <Link
                to="/admin"
                className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
              >
                Admin
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="relative">
              <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
                <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5] rounded-full animate-pulse shadow-lg shadow-[#9b87f5]/50" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5]/60 rounded-full animate-ping" />
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="hidden md:flex items-center space-x-2 text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>Logout</span>
            </button>
            <button
              className="md:hidden w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-5 h-5 text-white" />
              ) : (
                <Menu className="w-5 h-5 text-white" />
              )}
            </button>
          </div>
        </div>

        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden mt-4 py-4 border-t border-white/10 bg-black/40 backdrop-blur-xl rounded-xl"
          >
            <div className="space-y-3 px-4">
              <Link
                to="/home"
                className="block text-[#9b87f5] font-medium py-2 px-3 rounded-lg bg-[#9b87f5]/10"
              >
                Home
              </Link>
              <Link
                to="/ask-question"
                className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
              >
                Ask Question
              </Link>
              <Link
                to="/profile"
                className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
              >
                Profile
              </Link>
              {userRole === "admin" && (
                <Link
                  to="/admin"
                  className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Admin
                </Link>
              )}
              <button
                onClick={handleLogout}
                className="block w-full text-left text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
              >
                Logout
              </button>
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
