import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '../../Components/ui/button';
import { Card, CardContent, CardHeader } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { Input } from '../../Components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../Components/ui/select';
import { 
  Globe, 
  Search, 
  Plus, 
  Filter,
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
  ExternalLink,
  TrendingUp,
  Calendar,
  Users,
  BookOpen,
  Sparkles,
  Zap
} from 'lucide-react';

const Home = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('all');
  const [sortBy, setSortBy] = useState('newest');
  const [answeredFilter, setAnsweredFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);

  // Mock data for demonstration
  const mockQuestions = [
    {
      id: '1',
      title: 'How to implement sustainable energy solutions in developing countries?',
      content: 'Looking for practical approaches to deploy renewable energy infrastructure in regions with limited resources. What are the most cost-effective solutions that have proven successful globally?',
      answers: 5,
      views: 1247,
      upvotes: 42,
      tags: ['sustainability', 'renewable-energy', 'global-development'],
      author: 'sustainability_expert',
      authorId: '64aef889d3215a01aa0e11ff',
      createdAt: '2024-01-15T10:30:00Z'
    },
    {
      id: '2',
      title: 'Best practices for microservices architecture in Node.js applications',
      content: 'I\'m building a scalable Node.js application and considering microservices. What are the best practices for service discovery, communication patterns, and deployment strategies?',
      answers: 8,
      views: 2156,
      upvotes: 67,
      tags: ['nodejs', 'microservices', 'architecture', 'javascript'],
      author: 'tech_architect',
      authorId: '64aef889d3215a01aa0e11ff',
      createdAt: '2024-01-14T15:45:00Z'
    },
    {
      id: '3',
      title: 'Machine learning model deployment strategies for production environments',
      content: 'What are the most effective strategies for deploying ML models in production? Looking for insights on model versioning, A/B testing, and monitoring best practices.',
      answers: 3,
      views: 892,
      upvotes: 23,
      tags: ['machine-learning', 'deployment', 'production', 'ai'],
      author: 'ml_engineer',
      authorId: '64aef889d3215a01aa0e11ff',
      createdAt: '2024-01-13T09:20:00Z'
    },
    {
      id: '4',
      title: 'Cross-platform mobile development: React Native vs Flutter comparison',
      content: 'Planning to build a cross-platform mobile app. Need detailed comparison between React Native and Flutter in terms of performance, development speed, and ecosystem.',
      answers: 12,
      views: 3421,
      upvotes: 89,
      tags: ['react-native', 'flutter', 'mobile-development', 'cross-platform'],
      author: 'mobile_dev',
      authorId: '64aef889d3215a01aa0e11ff',
      createdAt: '2024-01-12T14:15:00Z'
    },
    {
      id: '5',
      title: 'Database optimization techniques for high-traffic web applications',
      content: 'Our web application is experiencing performance issues with database queries. Looking for optimization strategies, indexing best practices, and scaling solutions.',
      answers: 6,
      views: 1567,
      upvotes: 34,
      tags: ['database', 'optimization', 'performance', 'sql'],
      author: 'db_admin',
      authorId: '64aef889d3215a01aa0e11ff',
      createdAt: '2024-01-11T11:30:00Z'
    }
  ];

  const popularTags = [
    'javascript', 'python', 'react', 'nodejs', 'machine-learning', 
    'database', 'mobile-development', 'cloud-computing', 'devops', 'security'
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest', icon: Clock },
    { value: 'oldest', label: 'Oldest', icon: Calendar },
    { value: 'mostUpvoted', label: 'Most Upvoted', icon: ThumbsUp },
    { value: 'mostViewed', label: 'Most Viewed', icon: Eye },
    { value: 'mostAnswered', label: 'Most Answered', icon: MessageCircle },
    { value: 'newestAnswered', label: 'Newest Answered', icon: MessageCircle },
    { value: 'notNewestAnswered', label: 'Not Newest Answered', icon: TrendingUp }
  ];

  useEffect(() => {
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setQuestions(mockQuestions);
      setLoading(false);
    }, 1000);
  }, []);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const truncateText = (text, maxLength = 150) => {
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + '...';
  };

  const getTagColor = (tag) => {
    const colors = {
      'javascript': 'bg-yellow-900/30 text-yellow-300 border-yellow-700/50',
      'python': 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      'react': 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
      'nodejs': 'bg-green-900/30 text-green-300 border-green-700/50',
      'machine-learning': 'bg-purple-900/30 text-purple-300 border-purple-700/50',
      'database': 'bg-orange-900/30 text-orange-300 border-orange-700/50',
      'mobile-development': 'bg-pink-900/30 text-pink-300 border-pink-700/50',
      'cloud-computing': 'bg-indigo-900/30 text-indigo-300 border-indigo-700/50',
      'devops': 'bg-red-900/30 text-red-300 border-red-700/50',
      'security': 'bg-gray-900/30 text-gray-300 border-gray-700/50',
      'sustainability': 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
      'renewable-energy': 'bg-teal-900/30 text-teal-300 border-teal-700/50',
      'global-development': 'bg-amber-900/30 text-amber-300 border-amber-700/50',
      'microservices': 'bg-violet-900/30 text-violet-300 border-violet-700/50',
      'architecture': 'bg-slate-900/30 text-slate-300 border-slate-700/50',
      'ai': 'bg-rose-900/30 text-rose-300 border-rose-700/50',
      'deployment': 'bg-sky-900/30 text-sky-300 border-sky-700/50',
      'production': 'bg-lime-900/30 text-lime-300 border-lime-700/50',
      'react-native': 'bg-cyan-900/30 text-cyan-300 border-cyan-700/50',
      'flutter': 'bg-blue-900/30 text-blue-300 border-blue-700/50',
      'cross-platform': 'bg-fuchsia-900/30 text-fuchsia-300 border-fuchsia-700/50',
      'optimization': 'bg-emerald-900/30 text-emerald-300 border-emerald-700/50',
      'performance': 'bg-orange-900/30 text-orange-300 border-orange-700/50',
      'sql': 'bg-blue-900/30 text-blue-300 border-blue-700/50'
    };
    return colors[tag] || 'bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.08)_0%,transparent_50%),radial-gradient(circle_at_30%_70%,rgba(155,135,245,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(155,135,245,0.05)_0%,transparent_50%)]" />
      </div>

      {/* Navigation */}
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
            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <a href="/" className="text-[#9b87f5] font-medium relative group text-base md:text-lg">
                Home
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-[#9b87f5] transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Questions
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Tags
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="#" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Users
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
              <a href="/rich-text-demo" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Editor
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </a>
            </div>
            <div className="flex items-center space-x-3 sm:space-x-4">
              {/* Glowing Notification Bell */}
              <div className="relative">
                <div className="w-10 h-10 bg-white/5 backdrop-blur-sm rounded-xl flex items-center justify-center border border-white/10 hover:border-white/20 transition-all duration-300 cursor-pointer group">
                  <Bell className="w-5 h-5 text-white/70 group-hover:text-white transition-colors" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5] rounded-full animate-pulse shadow-lg shadow-[#9b87f5]/50" />
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5]/60 rounded-full animate-ping" />
                </div>
              </div>
              {/* Mobile Menu Button */}
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
          {/* Mobile Navigation */}
          {isMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="md:hidden mt-4 py-4 border-t border-white/10 bg-black/40 backdrop-blur-xl rounded-xl"
            >
              <div className="space-y-3 px-4">
                <a href="/" className="block text-[#9b87f5] font-medium py-2 px-3 rounded-lg bg-[#9b87f5]/10">Home</a>
                <a href="#" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Questions</a>
                <a href="#" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Tags</a>
                <a href="#" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Users</a>
                <a href="/rich-text-demo" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Editor</a>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 md:py-8 w-full">
        <div className="max-w-7xl mx-auto w-full">
          {/* Header Section */}
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
                      Global <span className="text-[#9b87f5] font-medium">Questions</span>
                    </h1>
                    <p className="text-white/60 text-base sm:text-lg">
                      Discover knowledge from experts worldwide
                    </p>
                  </div>
                </div>
              </div>
              <a href="/ask-question" className="w-full md:w-auto">
                <button className="relative flex items-center w-full md:w-auto justify-center px-8 py-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-[#9b87f5] to-purple-600 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300 transform hover:scale-105 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/40 mt-2 md:mt-0">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white text-2xl font-bold">+</span>
                  <span className="ml-6 text-white font-bold">Ask Question</span>
                </button>
              </a>
            </div>
          </motion.div>

          {/* Search and Filters */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8 md:mb-12"
          >
            {/* SEARCH BAR ROW */}
            {/* Replace the filters/search container with two rows: */}
            <div className="w-full space-y-3 md:space-y-0 md:grid md:grid-cols-4 md:gap-6 mb-4">
              {/* Search bar row */}
              <div className="w-full col-span-4">
                <div className="relative group w-full">
                  <input
                    type="text"
                    placeholder="Search questions..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-12 pr-4 py-4 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base md:text-lg"
                    style={{ minHeight: '56px', maxHeight: '56px' }}
                  />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#9b87f5] pointer-events-none" />
                </div>
              </div>
              {/* Filters row */}
              <div className="flex flex-row flex-wrap gap-3 w-full col-span-4">
                {/* Tag Filter */}
                <div className="relative group flex-1 min-w-[120px]">
                  <Select value={selectedTag} onValueChange={setSelectedTag}>
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue placeholder="Filter by tag" />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      <SelectItem value="all" className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">All Tags</SelectItem>
                      {popularTags.map((tag) => (
                        <SelectItem key={tag} value={tag} className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {/* Sort */}
                <div className="relative group flex-1 min-w-[120px]">
                  <Select value={sortBy} onValueChange={setSortBy}>
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      {sortOptions.map((option) => {
                        const IconComponent = option.icon;
                        return (
                          <SelectItem key={option.value} value={option.value} className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">
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
                {/* Answered Filter */}
                <div className="relative group flex-1 min-w-[120px]">
                  <Select value={answeredFilter} onValueChange={setAnsweredFilter}>
                    <SelectTrigger className="w-full py-4 px-4 bg-white/10 border border-[#9b87f5]/30 text-white rounded-2xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] hover:bg-white/15 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 outline-none text-base md:text-lg min-h-[56px] max-h-[56px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-black/90 border border-[#9b87f5]/30 rounded-2xl shadow-2xl shadow-[#9b87f5]/10 mt-2 p-2 min-w-[180px]">
                      <SelectItem value="all" className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">All Questions</SelectItem>
                      <SelectItem value="answered" className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">Answered</SelectItem>
                      <SelectItem value="unanswered" className="text-white hover:bg-[#9b87f5]/10 rounded-xl px-3 py-2 cursor-pointer">Unanswered</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Questions List */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="space-y-6 md:space-y-8"
          >
            {loading ? (
              // Loading skeleton
              <div className="space-y-6 md:space-y-8">
                {[...Array(5)].map((_, i) => (
                  <Card key={i} className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20 animate-pulse">
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
            ) : (
              questions.map((question, index) => (
                <motion.div
                  key={question.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#9b87f5]/10 group">
                    <CardContent className="p-8">
                      {/* CARD: Always show More button in bottom right of meta row, remove from top right */}
                      {/* Remove the <div className="flex w-full justify-end sm:hidden mb-2"> ... </div> block */}
                      {/* In the meta row (bottom of card), update the More button: */}
                      
                      <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        {/* Stats */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-6 sm:space-x-0 sm:space-y-4 min-w-[80px] w-full sm:w-auto justify-between sm:justify-start">
                          <div className="flex flex-col items-center space-y-1">
                            <ThumbsUp className="w-5 h-5 text-[#9b87f5] group-hover:scale-110 transition-transform duration-300" />
                            <span className="text-sm font-medium text-white">{question.upvotes}</span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <MessageCircle className="w-5 h-5 text-white/60 group-hover:text-white transition-colors duration-300" />
                            <span className="text-sm text-white/60">{question.answers} answers</span>
                          </div>
                          <div className="flex flex-col items-center space-y-1">
                            <Eye className="w-5 h-5 text-white/40 group-hover:text-white/60 transition-colors duration-300" />
                            <span className="text-sm text-white/40">{question.views}</span>
                          </div>
                        </div>

                        {/* Content */}
                        <div className="flex-1">
                          <h3 className="text-lg sm:text-xl font-medium text-white hover:text-[#9b87f5] transition-colors duration-300 cursor-pointer mb-4 group-hover:scale-[1.02] transform transition-transform">
                            {question.title}
                          </h3>
                          
                          <p className="text-white/60 mb-6 leading-relaxed text-base">
                            {truncateText(question.content)}
                          </p>

                          {/* Tags */}
                          <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                            {question.tags.map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className={`${getTagColor(tag)} cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 px-3 py-1`}
                              >
                                <Tag className="w-3 h-3 mr-1" />
                                {tag}
                              </Badge>
                            ))}
                          </div>

                          {/* Meta */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/50 gap-2 sm:gap-0">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[#9b87f5] font-medium">@{question.author}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(question.createdAt)}</span>
                              </div>
                            </div>
                            
                            {/* CARD: Always show More button in bottom right of meta row, remove from top right */}
                            {/* Remove the <div className="flex w-full justify-end sm:hidden mb-2"> ... </div> block */}
                            {/* In the meta row (bottom of card), update the More button: */}
                            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 group-hover:bg-white/15 ml-auto">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))
            )}
          </motion.div>

          {/* Pagination */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
            className="flex items-center justify-center mt-8 md:mt-12"
          >
            {/* PAGINATION: Make pagination wrap and never scroll */}
            {/* In the pagination section, update the container: */}
            <div className="flex flex-wrap items-center justify-center gap-2 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-2 max-w-full">
              <button
                className="px-2 sm:px-6 py-2 sm:py-3 rounded-full border border-[#9b87f5]/30 bg-gradient-to-r from-[#0a0613] to-[#150d27] text-xs sm:text-base font-medium shadow-md hover:bg-[#9b87f5]/10 hover:border-[#9b87f5]/50 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/30 disabled:opacity-50 min-w-[48px] sm:min-w-[80px] backdrop-blur-md"
                disabled={currentPage === 1}
              >
                Previous
              </button>
              <div className="flex flex-nowrap items-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5].map((page) => (
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
              >
                Next
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default Home; 