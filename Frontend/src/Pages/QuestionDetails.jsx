import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from "../Components/ui/badge";
import { Button } from '../Components/ui/button';
import { Card, CardContent } from '../Components/ui/card';
import { RichTextEditor } from '../Components/ui/rich-text-editor';
import { Toaster, toast } from 'sonner';
import { 
  ThumbsUp, 
  ThumbsDown, 
  MessageCircle, 
  Eye, 
  Clock, 
  Tag, 
  User, 
  ArrowLeft, 
  ChevronRight, 
  CheckCircle2,
  Globe,
  Bell,
  Menu,
  X,
  BookOpen,
  MoreVertical
} from 'lucide-react';

const mockQuestion = {
  id: '1',
  title: 'How to join 2 columns in a data set to make a separate column in SQL',
  content: `I do not know the code for it as I am a beginner. As an example what I need to do is like there is a column 1 containing First name, and column 2 consists of last name I want a column to combine`,
  tags: ['SQL', 'Data', 'Beginner'],
  views: 1250,
  upvotes: 42,
  createdAt: new Date().toISOString(),
  user: { username: 'john_doe' }
};

const mockAnswers = [
  {
    id: 'a1',
    content: `<p>You can join columns in SQL using several methods:</p>
    <ul>
      <li><strong>The || Operator (for PostgreSQL, SQLite):</strong> <code>SELECT first_name || ' ' || last_name AS full_name FROM users;</code></li>
      <li><strong>The + Operator (for SQL Server):</strong> <code>SELECT first_name + ' ' + last_name AS full_name FROM users;</code></li>
      <li><strong>The CONCAT Function (MySQL, PostgreSQL):</strong> <code>SELECT CONCAT(first_name, ' ', last_name) AS full_name FROM users;</code></li>
    </ul>
    <p>The CONCAT function is the most universal approach that works across different database systems.</p>`,
    votes: 28,
    userVoted: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    user: { username: 'sql_expert' }
  },
  {
    id: 'a2',
    content: `<p>Here's a more detailed example with different scenarios:</p>
    <pre><code>-- Basic concatenation
SELECT CONCAT(first_name, ' ', last_name) AS full_name
FROM employees;

-- Handling NULL values
SELECT CONCAT(COALESCE(first_name, ''), ' ', COALESCE(last_name, '')) AS full_name
FROM employees;

-- Adding titles
SELECT CONCAT(title, ' ', first_name, ' ', last_name) AS formal_name
FROM employees;</code></pre>
    <p>Always consider NULL values when concatenating columns to avoid unexpected results.</p>`,
    votes: 15,
    userVoted: false,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    user: { username: 'database_guru' }
  },
];

const QuestionDetails = () => {
  const [answers, setAnswers] = useState(mockAnswers);
  const [answerContent, setAnswerContent] = useState('');
  const [showLogin, setShowLogin] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [acceptedAnswerId, setAcceptedAnswerId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isOwner = true;
  const { id } = useParams();
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUpvote = (answerId) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      toast.info('Please login to upvote.');
      return;
    }
    setAnswers((prev) =>
      prev.map((a) =>
        a.id === answerId && !a.userVoted
          ? { ...a, votes: a.votes + 1, userVoted: true }
          : a
      )
    );
    toast.success('Answer upvoted!');
  };

  const handleDownvote = (answerId) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      toast.info('Please login to downvote.');
      return;
    }
    toast.info('Downvote feature coming soon!');
  };

  const handleSubmitAnswer = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      toast.info('Please login to submit an answer.');
      return;
    }
    if (!answerContent.trim()) {
      toast.error('Answer cannot be empty.');
      return;
    }
    setAnswers((prev) => [
      ...prev,
      {
        id: 'a' + (prev.length + 1),
        content: answerContent,
        votes: 0,
        userVoted: false,
        createdAt: new Date().toISOString(),
        user: { username: 'current_user' }
      },
    ]);
    setAnswerContent('');
    toast.success('Your answer has been posted!');
  };

  const handleAcceptAnswer = (answerId) => {
    if (!isOwner) return;
    setAcceptedAnswerId(answerId);
    toast.success('Marked as accepted answer!');
  };

  const getTagColor = () => 'bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      <Toaster position="top-center" richColors closeButton />
      
      {/* Background Effects - Same as Home */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.08)_0%,transparent_50%),radial-gradient(circle_at_30%_70%,rgba(155,135,245,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(155,135,245,0.05)_0%,transparent_50%)]" />
      </div>

      {/* Navigation - Exact same as Home */}
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
              <Link to="/" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Home
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <Link to="/ask-question" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
                Ask Question
                <div className="absolute -bottom-1 left-0 w-0 h-0.5 bg-white transition-all duration-300 group-hover:w-full"></div>
              </Link>
              <span className="text-[#9b87f5] font-medium relative group text-base md:text-lg">
                Question Details
                <div className="absolute -bottom-1 left-0 w-full h-0.5 bg-[#9b87f5]"></div>
              </span>
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
                <Link to="/" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Home</Link>
                <Link to="/ask-question" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Ask Question</Link>
                <span className="block text-[#9b87f5] font-medium py-2 px-3 rounded-lg bg-[#9b87f5]/10">Question Details</span>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 md:py-8 w-full">
        <div className="max-w-7xl mx-auto w-full">
          
          {/* Breadcrumb */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center text-sm text-[#9b87f5] mb-6 gap-2"
          >
            <button onClick={() => navigate(-1)} className="hover:underline flex items-center gap-1 transition-colors duration-300">
              <ArrowLeft className="w-4 h-4" />
              Back to Questions
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="truncate max-w-[180px] sm:max-w-xs md:max-w-md" title={mockQuestion.title}>
              {mockQuestion.title.length > 40 ? mockQuestion.title.slice(0, 40) + '...' : mockQuestion.title}
            </span>
          </motion.div>

          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 md:mb-12"
          >
            <div className="flex items-center space-x-3 mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20">
                <BookOpen className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2">
                  Question <span className="text-[#9b87f5] font-medium">Details</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg">
                  Detailed view and discussion
                </p>
              </div>
            </div>
          </motion.div>

          {/* Question Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-8"
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-2xl shadow-black/20">
              <CardContent className="p-8">
                <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                  {/* Vote/Stats Section */}
                  <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-6 sm:space-x-0 sm:space-y-4 min-w-[80px] w-full sm:w-auto justify-between sm:justify-start">
                    <div className="flex flex-col items-center space-y-1">
                      <ThumbsUp className="w-5 h-5 text-[#9b87f5]" />
                      <span className="text-sm font-medium text-white">{mockQuestion.upvotes}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <MessageCircle className="w-5 h-5 text-white/60" />
                      <span className="text-sm text-white/60">{answers.length} answers</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Eye className="w-5 h-5 text-white/40" />
                      <span className="text-sm text-white/40">{mockQuestion.views}</span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <h2 className="text-xl sm:text-2xl font-medium text-white mb-4 leading-tight">
                      {mockQuestion.title}
                    </h2>
                    
                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 sm:gap-3 mb-6">
                      {mockQuestion.tags.map((tag) => (
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
                    
                    {/* Question Description */}
                    <div className="text-white/80 mb-6 leading-relaxed text-base">
                      {mockQuestion.content}
                    </div>
                    
                    {/* User Info and Timestamp */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/50 gap-2 sm:gap-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[#9b87f5] font-medium">@{mockQuestion.user.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(mockQuestion.createdAt)}</span>
                        </div>
                      </div>
                      <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 ml-auto">
                        <MoreVertical className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>

          {/* Answers Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="mb-8"
          >
            <h3 className="text-xl sm:text-2xl font-medium text-white mb-6 flex items-center">
              <MessageCircle className="w-6 h-6 mr-3 text-[#9b87f5]" />
              {answers.length} Answer{answers.length !== 1 ? 's' : ''}
            </h3>
            
            <div className="space-y-6">
              {answers.map((answer, idx) => (
                <motion.div
                  key={answer.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/10 group">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        {/* Vote Section */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-6 sm:space-x-0 sm:space-y-3 min-w-[80px] w-full sm:w-auto justify-start sm:justify-start">
                          <button
                            className={`rounded-full p-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border border-[#9b87f5]/30 text-[#9b87f5] transition-all duration-300 ${answer.userVoted ? 'opacity-60 cursor-not-allowed' : 'hover:scale-110'}`}
                            onClick={() => handleUpvote(answer.id)}
                            disabled={answer.userVoted}
                            title={answer.userVoted ? 'You have already upvoted' : 'Upvote'}
                          >
                            <ThumbsUp className="w-4 h-4" />
                          </button>
                          <span className="text-lg font-medium text-white">{answer.votes}</span>
                          <button
                            className="rounded-full p-2 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white/60 hover:text-red-400 transition-all duration-300 hover:scale-110"
                            onClick={() => handleDownvote(answer.id)}
                            title="Downvote"
                          >
                            <ThumbsDown className="w-4 h-4" />
                          </button>
                          {acceptedAnswerId === answer.id && (
                            <CheckCircle2 className="w-6 h-6 text-green-400" title="Accepted Answer" />
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-white text-lg">Answer {idx + 1}</div>
                              {isOwner && acceptedAnswerId !== answer.id && (
                                <button
                                  className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-sm font-semibold hover:bg-green-600/40 transition-all duration-300 border border-green-600/30"
                                  onClick={() => handleAcceptAnswer(answer.id)}
                                >
                                  Accept Answer
                                </button>
                              )}
                              {acceptedAnswerId === answer.id && (
                                <span className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-sm font-semibold border border-green-600/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accepted
                                </span>
                              )}
                            </div>
                          </div>
                          
                          <div 
                            className="text-white/80 text-base leading-relaxed mb-4" 
                            dangerouslySetInnerHTML={{ __html: answer.content }} 
                          />
                          
                          {/* Answer Meta */}
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/50 gap-2 sm:gap-0">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-2">
                                <div className="w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                                  <User className="w-3 h-3 text-white" />
                                </div>
                                <span className="text-[#9b87f5] font-medium">@{answer.user.username}</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <Clock className="w-4 h-4" />
                                <span>{formatDate(answer.createdAt)}</span>
                              </div>
                            </div>
                            <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 ml-auto">
                              <MoreVertical className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Submit Answer Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-2xl shadow-black/20">
              <CardContent className="p-8">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
                    <MessageCircle className="w-4 h-4 text-white" />
                  </div>
                  <h4 className="text-xl font-medium text-white">Submit Your Answer</h4>
                </div>
                
                <div className="mb-6">
                  <RichTextEditor
                    value={answerContent}
                    onChange={setAnswerContent}
                    placeholder="Write your answer here... Use the rich text editor to format your content with bold, italic, lists, links, images, and more."
                    className="w-full min-h-[200px] rounded-xl"
                  />
                </div>
                
                <div className="flex justify-end">
                  <button
                    onClick={handleSubmitAnswer}
                    disabled={!answerContent.trim()}
                    className="px-8 py-4 rounded-2xl text-lg font-semibold bg-gradient-to-r from-[#9b87f5] to-purple-600 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300 transform hover:scale-105 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/40 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 text-white font-bold"
                  >
                    Submit Answer
                  </button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;