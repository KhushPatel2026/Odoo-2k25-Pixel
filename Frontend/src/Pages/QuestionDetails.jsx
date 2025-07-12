import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { Badge } from '../Components/ui/badge';
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
  MoreVertical,
  Trash2,
  Edit
} from 'lucide-react';
import io from 'socket.io-client';
import QuestionService from '../Services/QuestionService';
import { SERVER_BASE_URL } from '../lib/config';

const QuestionDetails = () => {
  const [question, setQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [answerContent, setAnswerContent] = useState('');
  const [commentContents, setCommentContents] = useState({});
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [isLoading, setIsLoading] = useState(true);
  const [acceptedAnswerId, setAcceptedAnswerId] = useState(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [socket, setSocket] = useState(null);
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Initialize Socket.IO
    const socketInstance = io(SERVER_BASE_URL, {
      auth: { token: localStorage.getItem('token') }
    });
    setSocket(socketInstance);

    // Fetch question and answers
    const fetchQuestion = async () => {
      setIsLoading(true);
      try {
        const response = await QuestionService.getQuestionById(id);
        if (response.success) {
          setQuestion(response.data.question);
          setAnswers(response.data.question.answers || []);
          setAcceptedAnswerId(response.data.question.acceptedAnswer?._id || null);
        } else {
          toast.error(response.message || 'Failed to load question');
        }
      } catch (error) {
        if (error.response?.status === 401) {
          setIsLoggedIn(false);
          localStorage.removeItem('token');
          toast.error('Session expired. Please log in again.');
          navigate('/login');
        } else {
          toast.error('Error loading question. Please try again.');
          console.error('Fetch question error:', error);
        }
      }
      setIsLoading(false);
    };

    fetchQuestion();

    // Socket.IO event listeners
    socketInstance.on('newAnswer', (newAnswer) => {
      if (newAnswer.question.toString() === id) {
        setAnswers((prev) => [...prev, newAnswer]);
        toast.info('New answer posted!');
      }
    });

    socketInstance.on('answerUpdated', (updatedAnswer) => {
      if (updatedAnswer.question.toString() === id) {
        setAnswers((prev) =>
          prev.map((a) => (a._id === updatedAnswer._id ? updatedAnswer : a))
        );
        toast.info('Answer updated!');
      }
    });

    socketInstance.on('answerDeleted', (answerId) => {
      setAnswers((prev) => prev.filter((a) => a._id !== answerId));
      toast.info('Answer deleted!');
    });

    socketInstance.on('newComment', (newComment) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === newComment.answer
            ? { ...a, comments: [...(a.comments || []), newComment] }
            : a
        )
      );
      toast.info('New comment posted!');
    });

    socketInstance.on('commentUpdated', (updatedComment) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === updatedComment.answer
            ? {
                ...a,
                comments: a.comments.map((c) =>
                  c._id === updatedComment._id ? updatedComment : c
                )
              }
            : a
        )
      );
      toast.info('Comment updated!');
    });

    socketInstance.on('commentDeleted', ({ commentId, answerId }) => {
      setAnswers((prev) =>
        prev.map((a) =>
          a._id === answerId
            ? { ...a, comments: a.comments.filter((c) => c._id !== commentId) }
            : a
        )
      );
      toast.info('Comment deleted!');
    });

    socketInstance.on('questionUpdated', (updatedQuestion) => {
      if (updatedQuestion._id === id) {
        setQuestion(updatedQuestion);
        toast.info('Question updated!');
      }
    });

    socketInstance.on('questionDeleted', (questionId) => {
      if (questionId === id) {
        toast.info('Question deleted.');
        navigate('/home');
      }
    });

    socketInstance.on('answerVoted', (updatedAnswer) => {
      if (updatedAnswer.question.toString() === id) {
        setAnswers((prev) =>
          prev.map((a) => (a._id === updatedAnswer._id ? updatedAnswer : a))
        );
        toast.info('Answer vote updated!');
      }
    });

    socketInstance.on('answerAccepted', ({ answerId, questionId }) => {
      if (questionId === id) {
        setAcceptedAnswerId(answerId);
        toast.info('Answer accepted!');
      }
    });

    socketInstance.on('notification', (notification) => {
      toast.info(notification.content);
    });

    // Cleanup on unmount
    return () => {
      socketInstance.disconnect();
    };
  }, [id, navigate]);

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return 'just now';
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const handleUpvote = async (answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to upvote.');
      return;
    }
    try {
      const response = await QuestionService.voteAnswer(answerId, 'upvote');
      if (response.success && response.data) {
        setAnswers((prev) =>
          prev.map((a) =>
            a._id === answerId
              ? {
                  ...a,
                  upvotes: response.data.upvotes || a.upvotes,
                  downvotes: response.data.downvotes || a.downvotes,
                  votes: (response.data.upvotes?.length || a.upvotes.length) - (response.data.downvotes?.length || a.downvotes.length)
                }
              : a
          )
        );
        window.location.reload(); 
        toast.success('Answer upvoted!');
      } else {
        toast.error(response.message || 'Failed to upvote answer');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while upvoting. Please try again.');
        console.error('Upvote error:', error);
      }
    }
  };

  const handleDownvote = async (answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to downvote.');
      return;
    }
    try {
      const response = await QuestionService.voteAnswer(answerId, 'downvote');
      if (response.success && response.data) {
        setAnswers((prev) =>
          prev.map((a) =>
            a._id === answerId
              ? {
                  ...a,
                  upvotes: response.data.upvotes || a.upvotes,
                  downvotes: response.data.downvotes || a.downvotes,
                  votes: (response.data.upvotes?.length || a.upvotes.length) - (response.data.downvotes?.length || a.downvotes.length)
                }
              : a
          )
        );
        window.location.reload();
        toast.success('Answer downvoted!');
      } else {
        toast.error(response.message || 'Failed to downvote answer');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while downvoting. Please try again.');
        console.error('Downvote error:', error);
      }
    }
  };

  const handleSubmitAnswer = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to submit an answer.');
      return;
    }
    if (!answerContent.trim()) {
      toast.error('Answer cannot be empty.');
      return;
    }
    try {
      const response = await QuestionService.postAnswer(id, answerContent);
      if (response.success) {
        setAnswerContent('');
        window.location.reload(); // Reload to fetch new answer
        toast.success('Your answer has been posted!');
      } else {
        toast.error(response.message || 'Failed to post answer');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while posting answer. Please try again.');
        console.error('Post answer error:', error);
      }
    }
  };

  const handleDeleteAnswer = async (answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to delete an answer.');
      return;
    }
    try {
      const response = await QuestionService.deleteAnswer(answerId);
      if (response.success) {
        toast.success('Answer deleted!');
      } else {
        toast.error(response.message || 'Failed to delete answer');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while deleting answer. Please try again.');
        console.error('Delete answer error:', error);
      }
    }
  };

  const handleAcceptAnswer = async (answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to accept an answer.');
      return;
    }
    try {
      const response = await QuestionService.acceptAnswer(answerId);
      if (response.success) {
        setAcceptedAnswerId(answerId);
        window.location.reload(); // Reload to reflect accepted answer
        toast.success('Marked as accepted answer!');
      } else {
        toast.error(response.message || 'Failed to accept answer');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while accepting answer. Please try again.');
        console.error('Accept answer error:', error);
      }
    }
  };

  const handleSubmitComment = async (answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to post a comment.');
      return;
    }
    const content = commentContents[answerId];
    if (!content || !content.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    try {
      const response = await QuestionService.postComment(answerId, content);
      if (response.success) {
        setCommentContents((prev) => ({ ...prev, [answerId]: '' }));
        window.location.reload(); // Reload to fetch new comment
        toast.success('Comment posted!');
      } else {
        toast.error(response.message || 'Failed to post comment');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while posting comment. Please try again.');
        console.error('Post comment error:', error);
      }
    }
  };

  const handleUpdateComment = async (commentId, answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to update a comment.');
      return;
    }
    const content = commentContents[answerId];
    if (!content || !content.trim()) {
      toast.error('Comment cannot be empty.');
      return;
    }
    try {
      const response = await QuestionService.updateComment(commentId, content);
      if (response.success) {
        setEditingCommentId(null);
        setCommentContents((prev) => ({ ...prev, [answerId]: '' }));
        toast.success('Comment updated!');
      } else {
        toast.error(response.message || 'Failed to update comment');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while updating comment. Please try again.');
        console.error('Update comment error:', error);
      }
    }
  };

  const handleDeleteComment = async (commentId, answerId) => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to delete a comment.');
      return;
    }
    try {
      const response = await QuestionService.deleteComment(commentId);
      if (response.success) {
        toast.success('Comment deleted!');
      } else {
        toast.error(response.message || 'Failed to delete comment');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while deleting comment. Please try again.');
        console.error('Delete comment error:', error);
      }
    }
  };

  const handleDeleteQuestion = async () => {
    if (!isLoggedIn) {
      navigate('/login');
      toast.info('Please login to delete the question.');
      return;
    }
    try {
      const response = await QuestionService.deleteQuestion(id);
      if (response.success) {
        toast.success('Question deleted!');
      } else {
        toast.error(response.message || 'Failed to delete question');
      }
    } catch (error) {
      if (error.response?.status === 401) {
        setIsLoggedIn(false);
        localStorage.removeItem('token');
        toast.error('Session expired. Please log in again.');
        navigate('/login');
      } else {
        toast.error('An error occurred while deleting question. Please try again.');
        console.error('Delete question error:', error);
      }
    }
  };

  // Assume ownership is determined by backend response or question data
  const isOwner = question?.isOwner || false; // Backend should include isOwner in question response

  const getTagColor = () => 'bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#9b87f5]"></div>
      </div>
    );
  }

  if (!question) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white flex items-center justify-center">
        <p>Question not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      <Toaster position="top-center" richColors closeButton />

      {/* Background Effects */}
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
            <div className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <Link to="/home" className="text-white/70 hover:text-white transition-colors relative group text-base md:text-lg">
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
                <Link to="/home" className="block text-white/70 hover:text-white transition-colors py-2 px-3 rounded-lg hover:bg-white/5">Home</Link>
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
            <span className="truncate max-w-[180px] sm:max-w-xs md:max-w-md" title={question.title}>
              {question.title.length > 40 ? question.title.slice(0, 40) + '...' : question.title}
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
                      <span className="text-sm font-medium text-white">{question.upvotes?.length || 0}</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <MessageCircle className="w-5 h-5 text-white/60" />
                      <span className="text-sm text-white/60">{answers.length} answers</span>
                    </div>
                    <div className="flex flex-col items-center space-y-1">
                      <Eye className="w-5 h-5 text-white/40" />
                      <span className="text-sm text-white/40">{question.views}</span>
                    </div>
                  </div>

                  {/* Question Content */}
                  <div className="flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-xl sm:text-2xl font-medium text-white leading-tight">
                        {question.title}
                      </h2>
                      {isLoggedIn && isOwner && (
                        <button
                          onClick={handleDeleteQuestion}
                          className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all duration-300"
                          title="Delete Question"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>

                    {/* Tags */}
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

                    {/* Question Description */}
                    <div
                      className="text-white/80 mb-6 leading-relaxed text-base"
                      dangerouslySetInnerHTML={{ __html: question.description }}
                    />

                    {/* User Info and Timestamp */}
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/50 gap-2 sm:gap-0">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <div className="w-6 h-6 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                            <User className="w-3 h-3 text-white" />
                          </div>
                          <span className="text-[#9b87f5] font-medium">@{question.user.username}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(question.createdAt)}</span>
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
                  key={answer._id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: 0.6 + idx * 0.1 }}
                >
                  <Card className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/10 group">
                    <CardContent className="p-8">
                      <div className="flex flex-col sm:flex-row items-start sm:space-x-6 space-y-4 sm:space-y-0">
                        {/* Vote Section */}
                        <div className="flex flex-row sm:flex-col items-center sm:items-center space-x-6 sm:space-x-0 sm:space-y-3 min-w-[80px] w-full sm:w-auto justify-start sm:justify-start">
                          {isLoggedIn && (
                            <>
                              <button
                                className={`rounded-full p-2 bg-[#9b87f5]/10 hover:bg-[#9b87f5]/20 border border-[#9b87f5]/30 text-[#9b87f5] transition-all duration-300 ${
                                  answer.upvotes?.includes(answer.userId) // Backend should return userId
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:scale-110'
                                }`}
                                onClick={() => handleUpvote(answer._id)}
                                disabled={answer.upvotes?.includes(answer.userId)}
                                title={answer.upvotes?.includes(answer.userId) ? 'You have already upvoted' : 'Upvote'}
                              >
                                <ThumbsUp className="w-4 h-4" />
                              </button>
                              <span className="text-lg font-medium text-white">
                                {(answer.upvotes?.length || 0) - (answer.downvotes?.length || 0)}
                              </span>
                              <button
                                className={`rounded-full p-2 bg-white/10 hover:bg-red-500/20 border border-white/20 text-white/60 hover:text-red-400 transition-all duration-300 ${
                                  answer.downvotes?.includes(answer.userId)
                                    ? 'opacity-60 cursor-not-allowed'
                                    : 'hover:scale-110'
                                }`}
                                onClick={() => handleDownvote(answer._id)}
                                disabled={answer.downvotes?.includes(answer.userId)}
                                title={answer.downvotes?.includes(answer.userId) ? 'You have already downvoted' : 'Downvote'}
                              >
                                <ThumbsDown className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {acceptedAnswerId === answer._id && (
                            <CheckCircle2 className="w-6 h-6 text-green-400" title="Accepted Answer" />
                          )}
                        </div>

                        {/* Answer Content */}
                        <div className="flex-1">
                          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-2 sm:gap-0">
                            <div className="flex items-center gap-3">
                              <div className="font-medium text-white text-lg">Answer {idx + 1}</div>
                              {isLoggedIn && isOwner && acceptedAnswerId !== answer._id && (
                                <button
                                  className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-sm font-semibold hover:bg-green-600/40 transition-all duration-300 border border-green-600/30"
                                  onClick={() => handleAcceptAnswer(answer._id)}
                                >
                                  Accept Answer
                                </button>
                              )}
                              {acceptedAnswerId === answer._id && (
                                <span className="px-3 py-1 rounded-lg bg-green-600/20 text-green-400 text-sm font-semibold border border-green-600/30 flex items-center gap-1">
                                  <CheckCircle2 className="w-4 h-4" />
                                  Accepted
                                </span>
                              )}
                              {isLoggedIn && answer.isOwner && (
                                <button
                                  onClick={() => handleDeleteAnswer(answer._id)}
                                  className="p-2 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all duration-300"
                                  title="Delete Answer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
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
                                <span className="text-[#9b87f5] font-medium">@{answer.user?.username || 'Unknown'}</span>
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

                          {/* Comments Section */}
                          <div className="mt-4">
                            {(answer.comments || []).map((comment) => (
                              <div key={comment._id} className="border-t border-white/10 pt-4 mt-4">
                                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between text-sm text-white/70">
                                  <div className="flex-1">
                                    <div
                                      className="text-white/80 text-sm leading-relaxed mb-2"
                                      dangerouslySetInnerHTML={{ __html: comment.content }}
                                    />
                                    <div className="flex items-center space-x-4 text-white/50">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-5 h-5 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center">
                                          <User className="w-2 h-2 text-white" />
                                        </div>
                                        <span className="text-[#9b87f5] font-medium">@{comment.user?.username || 'Unknown'}</span>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <Clock className="w-3 h-3" />
                                        <span>{formatDate(comment.createdAt)}</span>
                                      </div>
                                    </div>
                                  </div>
                                  {isLoggedIn && comment.isOwner && (
                                    <div className="flex space-x-2 mt-2 sm:mt-0">
                                      <button
                                        onClick={() => {
                                          setEditingCommentId(comment._id);
                                          setCommentContents((prev) => ({
                                            ...prev,
                                            [answer._id]: comment.content
                                          }));
                                        }}
                                        className="p-1 bg-blue-600/20 text-blue-400 rounded-lg hover:bg-blue-600/40 transition-all duration-300"
                                        title="Edit Comment"
                                      >
                                        <Edit className="w-3 h-3" />
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment._id, answer._id)}
                                        className="p-1 bg-red-600/20 text-red-400 rounded-lg hover:bg-red-600/40 transition-all duration-300"
                                        title="Delete Comment"
                                      >
                                        <Trash2 className="w-3 h-3" />
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                            {isLoggedIn && (
                              <div className="mt-4">
                                <RichTextEditor
                                  value={commentContents[answer._id] || ''}
                                  onChange={(value) => setCommentContents((prev) => ({ ...prev, [answer._id]: value }))}
                                  placeholder="Add a comment... Use @ to mention users."
                                  className="w-full min-h-[100px] rounded-xl"
                                />
                                <div className="flex justify-end mt-2">
                                  {editingCommentId ? (
                                    <button
                                      onClick={() => handleUpdateComment(editingCommentId, answer._id)}
                                      disabled={!commentContents[answer._id]?.trim()}
                                      className="px-4 py-2 rounded-lg bg-blue-600/20 text-blue-400 text-sm font-semibold hover:bg-blue-600/40 transition-all duration-300 border border-blue-600/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Update Comment
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleSubmitComment(answer._id)}
                                      disabled={!commentContents[answer._id]?.trim()}
                                      className="px-4 py-2 rounded-lg bg-[#9b87f5]/20 text-[#9b87f5] text-sm font-semibold hover:bg-[#9b87f5]/40 transition-all duration-300 border border-[#9b87f5]/30 disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                      Post Comment
                                    </button>
                                  )}
                                </div>
                              </div>
                            )}
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
          {isLoggedIn && (
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
          )}
        </div>
      </div>
    </div>
  );
};

export default QuestionDetails;