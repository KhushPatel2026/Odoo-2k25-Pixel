import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RichTextEditor } from '../../Components/ui/rich-text-editor';
import { Button } from '../../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Input } from '../../Components/ui/input';
import { Badge } from '../../Components/ui/badge';
import { 
  ArrowLeft, 
  Globe, 
  FileText, 
  Tag,
  X,
  Bell,
  Menu
} from 'lucide-react';
import { Toaster, toast } from 'sonner';

const AskQuestion = () => {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const popularTags = [
    'javascript', 'python', 'react', 'nodejs', 'machine-learning', 
    'database', 'mobile-development', 'cloud-computing', 'devops', 'security'
  ];

  const addTag = (tag) => {
    if (tag && !tags.includes(tag)) {
      if (tags.length >= 5) {
        toast.warning('You can add up to 5 tags only.');
        return;
      }
      setTags([...tags, tag]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = () => {
    if (!title.trim() || !content.trim()) {
      toast.error('Please fill in both the title and content.');
      return;
    }
    
    console.log('Submitting question:', {
      title,
      content,
      tags
    });
    
    try {
      // Simulate API call
      alert('Question submitted successfully!');
      toast.success('Your question has been posted!');
    } catch (err) {
      toast.error('Something went wrong. Please try again.');
    }
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
      'security': 'bg-gray-900/30 text-gray-300 border-gray-700/50'
    };
    return colors[tag] || 'bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30';
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      <Toaster position="top-center" richColors closeButton />
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.08)_0%,transparent_50%),radial-gradient(circle_at_30%_70%,rgba(155,135,245,0.08)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(155,135,245,0.05)_0%,transparent_50%)]" />
      </div>

      {/* NAVBAR: Replace with Home page's full navbar (logo, nav links, bell, mobile menu) */}
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
                onClick={() => setIsMenuOpen((v) => !v)}
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
        <div className="max-w-4xl mx-auto w-full flex flex-col gap-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-6 md:mb-10"
          >
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-6 text-center sm:text-left">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20 mx-auto sm:mx-0">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white">
                  Ask a <span className="text-[#9b87f5] font-medium">Question</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg">Share your knowledge with the global community</p>
              </div>
            </div>
          </motion.div>

          {/* Question Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-8"
          >
            {/* Title */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 w-full">
              <div className="px-4 sm:px-6 md:px-8 pt-8 pb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Question Title</h2>
                <p className="text-white/60 text-sm mb-4">Be specific and imagine you're asking another person</p>
                <input
                  placeholder="e.g., How to implement sustainable energy solutions in developing countries?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-4 px-4 sm:px-5 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base md:text-lg"
                />
              </div>
            </div>

            {/* Content */}
            {/* RICH TEXT EDITOR: Make toolbar/tools responsive, stack or wrap on mobile */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 w-full">
              <div className="px-2 sm:px-4 md:px-8 pt-8 pb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Question Details</h2>
                <p className="text-white/60 text-sm mb-4">Include all the information someone would need to answer your question</p>
                <div className="w-full max-w-full">
                  <RichTextEditor
                    value={content}
                    onChange={setContent}
                    placeholder="Describe your question in detail... Use the rich text editor to format your content with bold, italic, lists, links, images, and more."
                    className="w-full min-h-[180px] sm:min-h-[220px] md:min-h-[260px] max-w-full text-base md:text-lg rounded-xl border border-[#9b87f5]/30 bg-white/10 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300"
                    toolbarClassName="flex flex-wrap gap-2 sm:gap-3 md:gap-4 w-full !flex-row !flex-wrap !items-center !justify-start !overflow-x-auto !overflow-y-visible"
                  />
                </div>
              </div>
            </div>

            {/* Tags */}
            <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl shadow-black/20 w-full">
              <div className="px-4 sm:px-6 md:px-8 pt-8 pb-2">
                <h2 className="text-lg sm:text-xl font-semibold text-white mb-2">Tags</h2>
                <p className="text-white/60 text-sm mb-4">Add up to 5 tags to help categorize your question</p>
                {/* Tag Input */}
                <div className="flex flex-col sm:flex-row items-stretch gap-2 mb-4">
                  <input
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag(tagInput.trim());
                      }
                    }}
                    className="w-full py-3 px-4 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base md:text-lg"
                  />
                  <button
                    onClick={() => addTag(tagInput.trim())}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="w-full sm:w-auto px-6 py-3 rounded-xl border border-[#9b87f5]/30 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-[#9b87f5]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/30 disabled:opacity-50 text-base md:text-lg"
                  >
                    Add
                  </button>
                </div>

                {/* Selected Tags */}
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-2 sm:gap-3 mb-4">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className={`${getTagColor(tag)} cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 px-3 py-1 flex items-center`}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-1 hover:bg-white/20 rounded-full p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}

                {/* Popular Tags */}
                <div>
                  <p className="text-white/60 text-sm mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-2">
                    {popularTags.slice(0, 10).map((tag) => (
                      <Badge
                        key={tag}
                        variant="outline"
                        className="border-[#9b87f5]/30 text-white hover:bg-[#9b87f5]/10 cursor-pointer px-3 py-1 rounded-xl"
                        onClick={() => addTag(tag)}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <button
                onClick={handleSubmit}
                className="relative flex items-center w-full sm:w-auto justify-center px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-semibold bg-gradient-to-r from-[#9b87f5] to-purple-600 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300 transform hover:scale-105 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/40"
              >
                <FileText className="w-6 h-6 mr-2 text-white" />
                <span className="text-white font-bold">Post Question</span>
              </button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion; 