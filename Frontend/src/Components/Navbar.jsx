import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { Globe, Bell, Menu, X, LogOut } from "lucide-react";
import axios from "axios";

const Navbar = ({ userRole = null }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const navigate = useNavigate();
  
  // Check if user is logged in
  const isLoggedIn = localStorage.getItem("token") !== null;

  // Fetch notifications
  const fetchNotifications = async () => {
    try {
      console.log('Fetching notifications with token:', localStorage.getItem("token"));
      const response = await axios.get("http://localhost:3000/api/notifications", {
        headers: { 'x-access-token': `${localStorage.getItem("token")}` },
      });
      console.log('Notifications fetched:', response);
      setNotifications(response.data.notifications);
      setUnreadCount(response.data.unreadCount);
    } catch (error) {
      console.error("Error fetching notifications:", error);
    }
  };

  // Mark notifications as read
  const markNotificationsRead = async () => {
    try {
      console.log('token:', localStorage.getItem("token"));
      await axios.post(
        "http://localhost:3000/api/notifications/read",
        {},
        { headers: { 'x-access-token': `${localStorage.getItem("token")}` } }
      );
      setUnreadCount(0);
      setNotifications((prev) =>
        prev.map((notif) => ({ ...notif, read: true }))
      );
    } catch (error) {
      console.error("Error marking notifications as read:", error);
    }
  };

  // Handle notification click
  const handleNotificationClick = (notification) => {
    if (!notification.read) {
      markNotificationsRead();
    }
    setIsNotificationsOpen(false);
  };

  // Fetch notifications on mount
  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
    }
  }, [isLoggedIn]);

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
              className="text-[#9b87f5] font-medium relative group text-base md:text-lg"
            >
              Home
              <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9b87f5] transition-all duration-300 group-hover:w-full"></div>
            </Link>
            {isLoggedIn && (
              <Link
                to="/ask-question"
                className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
              >
                Ask Question
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </Link>
            )}
            {isLoggedIn && (
              <Link
                to="/profile"
                className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
              >
                Profile
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </Link>
            )}
          </div>

          <div className="flex items-center space-x-3 sm:space-x-4">
            {isLoggedIn && (
              <div className="relative">
                <div
                  className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group"
                  onClick={() => {
                    setIsNotificationsOpen(!isNotificationsOpen);
                    if (!isNotificationsOpen) {
                      fetchNotifications();

                    }
                  }}
                >
                  <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  {unreadCount > 0 && (
                    <>
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5] rounded-full animate-pulse shadow-lg shadow-[#9b87f5]/50" />
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5]/60 rounded-full animate-ping" />
                      <span className="absolute -top-2 -right-2 bg-[#9b87f5] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                        {unreadCount}
                      </span>
                    </>
                  )}
                </div>

                <AnimatePresence>
                  {isNotificationsOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="absolute right-0 mt-2 w-80 bg-black/80 backdrop-blur-xl rounded-xl border border-white/10 shadow-lg shadow-[#9b87f5]/20 p-4 max-h-96 overflow-y-auto"
                      style={{
                        scrollbarWidth: "none",
                        msOverflowStyle: "none",
                      }}
                    >
                      <style>
                        {`
                          .hide-scrollbar::-webkit-scrollbar {
                            display: none;
                          }
                        `}
                      </style>
                      <div className="hide-scrollbar">
                        <h3 className="text-white font-semibold mb-3">Notifications</h3>
                        {notifications.length === 0 ? (
                          <p className="text-white/70">No notifications</p>
                        ) : (
                          notifications.map((notification) => (
                            <div
                              key={notification._id}
                              className={`p-3 mb-2 rounded-lg cursor-pointer  ${
                                notification.read
                                  ? "bg-white/5 text-white/70"
                                  : "bg-[#9b87f5]/10 text-white"
                              } hover:bg-white/10 transition-colors`}
                              onClick={() => handleNotificationClick(notification)}
                            >
                              <p className="text-sm">{notification.content}</p>
                              <p className="text-xs text-white/50">
                                {new Date(notification.createdAt).toLocaleString()}
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
            {isLoggedIn ? (
              <button
                onClick={handleLogout}
                className="hidden md:flex items-center space-x-2 text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="hidden md:flex items-center space-x-2 text-white/70 hover:text-white transition-colors relative group text-base md:text-lg"
              >
                <span>Login</span>
              </Link>
            )}
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
              {isLoggedIn && (
                <Link
                  to="/ask-question"
                  className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Ask Question
                </Link>
              )}
              {isLoggedIn && (
                <Link
                  to="/profile"
                  className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Profile
                </Link>
              )}
              {isLoggedIn && userRole === "admin" && (
                <Link
                  to="/admin"
                  className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Admin
                </Link>
              )}
              {isLoggedIn ? (
                <button
                  onClick={handleLogout}
                  className="block w-full text-left text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Logout
                </button>
              ) : (
                <Link
                  to="/login"
                  className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5"
                >
                  Login
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;