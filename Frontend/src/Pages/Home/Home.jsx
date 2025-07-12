import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { io } from "socket.io-client";
import { Button } from "../../Components/ui/button";
import { Card, CardContent } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import { Input } from "../../Components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../../Components/ui/select";
import {
  Globe,
  Search,
  Plus,
  MessageCircle,
  Eye,
  ThumbsUp,
  Clock,
  User,
  Tag,
  MoreVertical,
  Bell,
  Menu,
  X,
  TrendingUp,
  Calendar,
  BookOpen,
} from "lucide-react";
import QuestionService from "../../services/questionService";
import ProfileService from "../../services/profileService";
import { SERVER_BASE_URL } from "../../lib/config";

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTag, setSelectedTag] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [answeredFilter, setAnsweredFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [totalQuestions, setTotalQuestions] = useState(0);
  const [limit, setLimit] = useState(10);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState(null);

  const sortOptions = [
    { value: "newest", label: "Newest", icon: Clock },
    { value: "oldest", label: "Oldest", icon: Calendar },
    { value: "mostUpvoted", label: "Most Upvoted", icon: ThumbsUp },
    { value: "mostViewed", label: "Most Viewed", icon: Eye },
    { value: "mostAnswered", label: "Most Answered", icon: MessageCircle },
    { value: "newestAnswered", label: "Newest Answered", icon: MessageCircle },
    {
      value: "notNewestAnswered",
      label: "Not Newest Answered",
      icon: TrendingUp,
    },
  ];

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const [questionsResponse, tagsResponse] = await Promise.all([
          QuestionService.getQuestions({
            page: currentPage,
            limit: 10,
            tag: selectedTag !== "all" ? selectedTag : undefined,
            search: searchTerm || undefined,
            sort: sortBy,
            answered:
              answeredFilter !== "all"
                ? answeredFilter === "answered"
                : undefined,
          }),
          QuestionService.getTrendingTags({ limit: 10 }),
        ]);

        if (questionsResponse.success) {
          setQuestions(questionsResponse.data.questions || []);
          setTotalQuestions(questionsResponse.data.total || 0);
          setLimit(questionsResponse.data.limit || 10);
        }
        if (tagsResponse.success) {
          setPopularTags(
            tagsResponse.data.tags.map((tagObj) => tagObj.tag) || []
          );
        }
      } catch (error) {
        console.error("Fetch data error:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentPage, selectedTag, searchTerm, sortBy, answeredFilter]);

  useEffect(() => {
    const socket = io(SERVER_BASE_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    socket.on("connect", () => {
      socket.emit("joinRoom", "questions");
    });

    socket.on("newQuestion", (newQuestion) => {
      // Apply filters to ensure the new question matches current criteria
      const matchesTag =
        selectedTag === "all" ||
        newQuestion.tags.includes(selectedTag.toLowerCase());
      const matchesSearch =
        !searchTerm ||
        newQuestion.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesAnswered =
        answeredFilter === "all" ||
        (answeredFilter === "answered" && newQuestion.answerCount > 0) ||
        (answeredFilter === "unanswered" && newQuestion.answerCount === 0);

      if (matchesTag && matchesSearch && matchesAnswered) {
        setQuestions((prevQuestions) => {
          // Only add if on the first page and question not already present
          if (
            currentPage === 1 &&
            !prevQuestions.some((q) => q._id === newQuestion._id)
          ) {
            const updatedQuestions = [newQuestion, ...prevQuestions].slice(
              0,
              limit
            );
            return updatedQuestions;
          }
          return prevQuestions;
        });
        setTotalQuestions((prevTotal) => prevTotal + 1);
      }
    });

    socket.on("questionUpdated", (updatedQuestion) => {
      setQuestions((prevQuestions) => {
        const index = prevQuestions.findIndex(
          (q) => q._id === updatedQuestion._id
        );
        if (index !== -1) {
          // Check if updated question still matches filters
          const matchesTag =
            selectedTag === "all" ||
            updatedQuestion.tags.includes(selectedTag.toLowerCase());
          const matchesSearch =
            !searchTerm ||
            updatedQuestion.title
              .toLowerCase()
              .includes(searchTerm.toLowerCase());
          const matchesAnswered =
            answeredFilter === "all" ||
            (answeredFilter === "answered" &&
              updatedQuestion.answerCount > 0) ||
            (answeredFilter === "unanswered" &&
              updatedQuestion.answerCount === 0);

          if (matchesTag && matchesSearch && matchesAnswered) {
            const newQuestions = [...prevQuestions];
            newQuestions[index] = updatedQuestion;
            return newQuestions;
          } else {
            // Remove question if it no longer matches filters
            return prevQuestions.filter((q) => q._id !== updatedQuestion._id);
          }
        }
        return prevQuestions;
      });
    });

    socket.on("questionDeleted", (questionId) => {
      setQuestions((prevQuestions) => {
        const newQuestions = prevQuestions.filter((q) => q._id !== questionId);
        if (newQuestions.length < prevQuestions.length) {
          setTotalQuestions((prevTotal) => prevTotal - 1);
        }
        return newQuestions;
      });
    });

    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
    });

    return () => {
      socket.emit("leaveRoom", "questions");
      socket.disconnect();
    };
  }, [selectedTag, searchTerm, answeredFilter, currentPage, limit]);

  useEffect(() => {
    // Fetch user role on mount
    const fetchUserRole = async () => {
      const result = await ProfileService.getProfile();
      if (result.success && result.data && result.data.profile) {
        setUserRole(result.data.profile.role);
      }
    };
    fetchUserRole();
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));

    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 150) => {
    const div = document.createElement("div");
    div.innerHTML = text;
    const plainText = div.textContent || div.innerText || "";
    if (plainText.length <= maxLength) return text;
    return plainText.substring(0, maxLength) + "...";
  };

  const getTagColor = () => {
    return "bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30";
  };

  const totalPages = Math.ceil(totalQuestions / limit);
  const pageNumbers = [];
  for (let i = 1; i <= Math.min(totalPages, 5); i++) {
    pageNumbers.push(i);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.08)_0%,transparent_50%),radial-gradient(circle_at_30%_70%,rgba(155,135,245,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(155,135,245,0.05)_0%,transparent_50%)]" />
      </div>

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
                to="/"
                className="text-[#9b87f5] font-medium relative group text-base md:text-lg"
              >
                Home
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9b87f5] transition-all duration-300 group-hover:w-full"></div>
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
                  to="/"
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
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 md:py-8 w-full">
        <div className="max-w-7xl mx-auto w-full">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 md:mb-12"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between md:gap-8 w-full">
              <div className="w-full md:w-auto">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20">
                    <BookOpen className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2">
                      Global{" "}
                      <span className="text-[#9b87f5] font-medium">
                        Questions
                      </span>
                    </h1>
                    <p className="text-white/60 text-base sm:text-lg">
                      Discover knowledge from experts worldwide
                    </p>
                  </div>
                </div>
              </div>
              <Link to="/ask-question" className="w-full md:w-auto">
                <button className="relative flex items-center w-full md:w-auto justify-center px-8 py-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-[#9b87f5] to-purple-600 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300 transform hover:scale-105 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/40 mt-2 md:mt-0">
                  <span className=" text-white font-bold text-2xl mb-1.5">
                    +
                  </span>
                  <span className="ml-3 text-white font-bold">
                    Ask Question
                  </span>
                </button>
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 md:mb-12"
          >
            <div className="w-full space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-6 mb-4">
              <div className="w-full col-span-4">
                <div className="relative group w-full">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base md:text-lg"
                    style={{ minHeight: "56px", maxHeight: "56px" }}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b87f5] pointer-events-none" />
                </div>
              </div>
              <div className="flex flex-row flex-wrap gap-3 w-full col-span-4">
                <div className="relative group flex-1 min-w-[120px]">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                      >
                        All Tags
                      </SelectItem>
                      {popularTags.map((tag) => (
                        <SelectItem
                          key={tag}
                          value={tag}
                          className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                        >
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative group flex-1 min-w-[120px]">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      {sortOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                          >
                            <div className="flex items-center">
                              <IconComponent className="w-4 h-4 mr-3" />
                              {option.label}
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                </div>
                <div className="relative group flex-1 min-w-[120px]">
                  <Select
                    value={answeredFilter}
                    onValueChange={setAnsweredFilter}
                  >
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      <SelectItem
                        value="all"
                        className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                      >
                        All Questions
                      </SelectItem>
                      <SelectItem
                        value="answered"
                        className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                      >
                        Answered
                      </SelectItem>
                      <SelectItem
                        value="unanswered"
                        className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer"
                      >
                        Unanswered
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 md:space-y-8"
          >
            {loading ? (
              <div className="space-y-6 md:space-y-8">
                {[...Array(5)].map((_, i) => (
                  <Card
                    key={i}
                    className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 animate-pulse"
                  >
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        <div className="flex flex-col items-center space-y-3 min-w-[80px]">
                          <div className="h-8 w-8 bg-white/10 rounded-lg"></div>
                          <div className="h-6 w-6 bg-white/10 rounded-lg"></div>
                          <div className="h-6 w-6 bg-white/10 rounded-lg"></div>
                        </div>
                        <div className="flex-1 space-y-4">
                          <div className="h-6 bg-white/10 rounded-lg w-3/4"></div>
                          <div className="h-4 bg-white/10 rounded-lg w-full"></div>
                          <div className="h-4 bg-white/10 rounded-lg w-2/3"></div>
                          <div className="flex space-x-2">
                            <div className="h-6 w-16 bg-white/10 rounded-lg"></div>
                            <div className="h-6 w-20 bg-white/10 rounded-lg"></div>
                            <div className="h-6 w-14 bg-white/10 rounded-lg"></div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : questions.length === 0 ? (
              <div className="text-center text-white/60 text-lg">
                No questions found
              </div>
            ) : (
              questions.map((question, index) => (
                <motion.div
                  key={question._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#9b87f5]/10 group">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-6 sm:space-x-0 sm:space-y-4 min-w-[80px] w-full sm:w-auto justify-between sm:justify-start">
                          <div className="flex flex-col items-center space-y-1">
                            <ThumbsUp className="w-5 h-5 text-[#9b87f5] group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm font-medium text-white">
                              {question.totalUpvotes}
                            </span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <MessageCircle className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
                            <span className="text-sm text-white/60">
                              {question.answerCount} answers
                            </span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <Eye className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                            <span className="text-sm text-white/40">
                              {question.views}
                            </span>
                          </div>
                        </div>
                        <div className="flex-1">
                          <Link to={`/home/${question._id}`}>
                            <h3 className="text-lg sm:text-xl font-medium text-white hover:text-[#9b87f5] transition-colors duration-300 cursor-pointer mb-4 group-hover:scale-[1.02] transform transition-transform">
                              {question.title}
                            </h3>
                          </Link>
                          <div
                            className="text-white/60 mb-6 leading-relaxed text-base"
                            dangerouslySetInnerHTML={{
                              __html: truncateText(question.description),
                            }}
                          />
                          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                            {question.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`${getTagColor()} cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 px-3 py-1`}
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/50 gap-2 sm:gap-0">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[#9b87f5] font-medium">
                                  @{question.user.username}
                                </span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(question.createdAt)}</span>
                              </div>
                            </div>
                            {userRole === "admin" && (
                              <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-white/15 ml-auto">
                                <MoreVertical className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {!loading && questions.length > 0 && totalQuestions > limit && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="flex items-center justify-center mt-8 md:mt-12"
            >
              <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 max-w-full">
                <button
                  className="px-2 sm:px-6 py-2 sm:py-3 rounded-full border border-[#9b87f5]/30 bg-gradient-to-r from-[#0a0613] to-[#150d27] text-xs sm:text-base font-medium shadow-md hover:bg-[#9b87f5]/10 hover:border-[#9b87f5]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/30 disabled:opacity-50 min-w-[48px] sm:min-w-[80px] backdrop-blur-md"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage(currentPage - 1)}
                >
                  Previous
                </button>
                <div className="flex flex-nowrap items-center gap-1 sm:gap-2">
                  {pageNumbers.map((page) => (
                    <button
                      key={page}
                      className={
                        currentPage === page
                          ? "bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white rounded-full px-2 sm:px-4 py-2 sm:py-3 shadow-lg shadow-[#9b87f5]/25 font-bold border-2 border-[#9b87f5]/70 min-w-[32px] sm:min-w-[48px] text-xs sm:text-base scale-110 ring-2 ring-[#9b87f5]/40 transition-all duration-200"
                          : "border border-[#9b87f5]/30 text-white bg-white/5 hover:bg-[#9b87f5]/10 hover:border-[#9b87f5]/50 rounded-full px-2 sm:px-4 py-2 sm:py-3 transition-all duration-200 font-medium min-w-[32px] sm:min-w-[48px] text-xs sm:text-base backdrop-blur-md"
                      }
                      onClick={() => setCurrentPage(page)}
                    >
                      {page}
                    </button>
                  ))}
                </div>
                <button
                  className="px-4 sm:px-6 py-3 rounded-full border border-[#9b87f5]/30 bg-gradient-to-r from-[#0a0613] to-[#150d27] text-white font-medium shadow-md hover:bg-[#9b87f5]/10 hover:border-[#9b87f5]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/30 min-w-[80px] backdrop-blur-md"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage(currentPage + 1)}
                >
                  Next
                </button>
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
