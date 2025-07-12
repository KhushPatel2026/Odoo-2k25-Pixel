import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Link, useNavigate } from "react-router-dom";
import { RichTextEditor } from "../../Components/ui/rich-text-editor";
import { Button } from "../../Components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import { Input } from "../../Components/ui/input";
import { Badge } from "../../Components/ui/badge";
import { ArrowLeft, FileText, Tag, X, Image } from "lucide-react";
import { Toaster, toast } from "sonner";
import QuestionService from "../../services/QuestionService";
import { SERVER_BASE_URL } from "../../lib/config";
import Navbar from "../../Components/Navbar";

const AskQuestion = () => {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState([]);
  const [tagInput, setTagInput] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchTrendingTags = async () => {
      try {
        const response = await QuestionService.getTrendingTags();
        if (response.success && response.data.status === "ok") {
          setPopularTags(response.data.tags.map((t) => t.tag));
        } else {
          toast.error(response.message || "Failed to fetch trending tags.");
        }
      } catch (err) {
        toast.error("Failed to fetch trending tags.");
        console.error("Error fetching trending tags:", err);
      }
    };
    fetchTrendingTags();
  }, []);

  const addTag = (tag) => {
    if (!tag) return;
    const trimmedTag = tag.trim().toLowerCase();
    if (trimmedTag.length > 30) {
      toast.warning("Tags must be 30 characters or less.");
      return;
    }
    if (!/^[a-z0-9-]+$/.test(trimmedTag)) {
      toast.warning(
        "Tags can only contain lowercase letters, numbers, and hyphens."
      );
      return;
    }
    if (tags.includes(trimmedTag)) {
      toast.warning("This tag has already been added.");
      return;
    }
    if (tags.length >= 5) {
      toast.warning("You can add up to 5 tags only.");
      return;
    }
    setTags([...tags, trimmedTag]);
    setTagInput("");
  };

  const removeTag = (tagToRemove) => {
    setTags(tags.filter((tag) => tag !== tagToRemove));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    if (images.length + files.length > 10) {
      toast.warning("You can upload up to 10 images only.");
      return;
    }
    setImages([...images, ...files]);
    setImagePreviews([...imagePreviews, ...files.map((file) => file.name)]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImagePreviews(imagePreviews.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Please fill in both the title and content.");
      return;
    }
    if (content.replace(/<[^>]*>/g, "").length > 10000) {
      toast.error("Question content cannot exceed 10,000 characters.");
      return;
    }
    if (tags.length === 0) {
      toast.error("Please add at least one tag.");
      return;
    }

    try {
      const response = await QuestionService.askQuestion(
        title,
        content,
        tags.join(","),
        images
      );
      if (response.success) {
        toast.success("Your question has been posted!");
        setTitle("");
        setContent("");
        setTags([]);
        setImages([]);
        setImagePreviews([]);
        navigate(`/home/${response.data.question._id}`);
      } else {
        toast.error(response.message || "Failed to post question.");
      }
    } catch (err) {
      if (err.response?.status === 401) {
        toast.error("Please log in to post a question.");
      } else if (err.response?.status === 400) {
        toast.error("Validation error: Please check your inputs.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
      console.error("Error submitting question:", err);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white font-light antialiased">
      <Toaster position="top-center" richColors closeButton />
      {/* Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none select-none">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_30%,rgba(155,135,245,0.1)_0%,transparent_50%),radial-gradient(circle_at_30%_70%,rgba(155,135,245,0.1)_0%,transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,rgba(155,135,245,0.06)_0%,transparent_50%)]" />
      </div>

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="relative z-5 px-4 sm:px-6 lg:px-8 py-8 w-full">
        <div className="max-w-4xl mx-auto flex flex-col gap-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-8"
          >
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <Link
                to="/"
                className="flex items-center text-white/70 hover:text-white transition-colors text-base"
              >
                <ArrowLeft className="w-6 h-6 mr-2" />
                Back to Home
              </Link>
              <div className="flex flex-col items-center sm:items-end">
                <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20 mx-auto sm:mx-0">
                  <FileText className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-light text-white mt-4">
                  Ask a{" "}
                  <span className="text-[#9b87f5] font-medium">Question</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg mt-2">
                  Share your knowledge with the global community
                </p>
              </div>
            </div>
          </motion.div>

          {/* Question Form */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="flex flex-col gap-6"
          >
            {/* Title */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  Question Title
                </CardTitle>
                <p className="text-white/60 text-sm">Be specific and concise</p>
              </CardHeader>
              <CardContent>
                <Input
                  type="text"
                  placeholder="e.g., How to implement sustainable energy solutions?"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full py-4 px-5 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base sm:text-lg"
                />
              </CardContent>
            </Card>

            {/* Content */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  Question Details
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Provide detailed information with rich formatting
                </p>
              </CardHeader>
              <CardContent>
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Describe your question in detail with bold, italic, lists, links, images, and more..."
                  className="w-full min-h-[250px] sm:min-h-[300px] lg:min-h-[350px] text-base sm:text-lg rounded-xl border border-[#9b87f5]/30 bg-white/10 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300"
                />
              </CardContent>
            </Card>

            {/* Images */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  Images
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Upload up to 10 images to support your question
                </p>
              </CardHeader>
              <CardContent>
                <Input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full py-4 px-5 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base sm:text-lg"
                />
                {imagePreviews.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {imagePreviews.map((name, index) => (
                      <Badge
                        key={index}
                        variant="secondary"
                        className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 px-4 py-2 flex items-center text-base"
                      >
                        <Image className="w-4 h-4 mr-2" />
                        {name}
                        <button
                          onClick={() => removeImage(index)}
                          className="ml-2 hover:bg-white/20 rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Tags */}
            <Card className="bg-white/5 backdrop-blur-xl border-white/10 rounded-2xl shadow-2xl shadow-black/20">
              <CardHeader>
                <CardTitle className="text-xl font-semibold text-white">
                  Tags
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Add up to 5 tags to categorize your question
                </p>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row items-stretch gap-3 mb-4">
                  <Input
                    type="text"
                    autoComplete="off"
                    placeholder="Add a tag..."
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        addTag(tagInput);
                      }
                    }}
                    className="w-full py-4 px-5 bg-white/10 border border-[#9b87f5]/30 text-white placeholder:text-white/60 rounded-xl shadow-[0_2px_16px_0_rgba(155,135,245,0.08)] focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 transition-all duration-300 hover:bg-white/15 outline-none text-base sm:text-lg"
                  />
                  <Button
                    onClick={() => addTag(tagInput)}
                    disabled={!tagInput.trim() || tags.length >= 5}
                    className="w-full sm:w-auto px-6 py-4 rounded-xl border border-[#9b87f5]/30 bg-gradient-to-r from-[#9b87f5] to-purple-600 text-white font-semibold shadow-md hover:shadow-lg hover:shadow-[#9b87f5]/20 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/30 disabled:opacity-50 text-base sm:text-lg"
                  >
                    Add Tag
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-3 mb-4">
                    {tags.map((tag) => (
                      <Badge
                        key={tag}
                        variant="secondary"
                        className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30 cursor-pointer hover:opacity-80 transition-all duration-300 hover:scale-105 px-4 py-2 flex items-center text-base"
                      >
                        <Tag className="w-4 h-4 mr-2" />
                        {tag}
                        <button
                          onClick={() => removeTag(tag)}
                          className="ml-2 hover:bg-white/20 rounded-full p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
                <div>
                  <p className="text-white/60 text-sm mb-2">Popular tags:</p>
                  <div className="flex flex-wrap gap-3">
                    {popularTags.length > 0 ? (
                      popularTags.slice(0, 10).map((tag) => (
                        <Badge
                          key={tag}
                          variant="outline"
                          className="border-[#9b87f5]/30 text-white hover:bg-[#9b87f5]/10 cursor-pointer px-4 py-2 rounded-xl text-base"
                          onClick={() => addTag(tag)}
                        >
                          <Tag className="w-4 h-4 mr-2" />
                          {tag}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-white/60 text-sm">
                        No trending tags available.
                      </p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Submit Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="flex justify-center"
            >
              <Button
                onClick={handleSubmit}
                className="w-full sm:w-auto px-8 sm:px-10 py-4 rounded-2xl text-base sm:text-lg font-semibold bg-gradient-to-r from-[#9b87f5] to-purple-600 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transition-all duration-300 transform hover:scale-105 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#9b87f5]/40"
              >
                <FileText className="w-6 h-6 mr-2 text-white" />
                Post Question
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </div>
  );
};

export default AskQuestion;
