import React, { useEffect, useState } from "react";
import QuestionService from "../../services/questionService";
import AdminService from "../../services/adminService";
import { Card, CardContent } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import {
  User,
  Clock,
  Tag,
  MessageCircle,
  Eye,
  ThumbsUp,
  X,
} from "lucide-react";

const AdminPage = () => {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [modLoading, setModLoading] = useState(false);
  const [modMessage, setModMessage] = useState("");

  useEffect(() => {
    const fetchQuestions = async () => {
      setLoading(true);
      setError("");
      const result = await QuestionService.getQuestions({});
      if (result.success) {
        setQuestions(result.data.questions || []);
      } else {
        setError(result.message || "Failed to fetch questions");
      }
      setLoading(false);
    };
    fetchQuestions();
  }, []);

  const handleCardClick = async (questionId) => {
    console.log("Card clicked for question ID:", questionId);
    setDetailLoading(true);
    setSelectedQuestion(null);
    setModMessage("");

    try {
      const result = await QuestionService.getQuestionById(questionId);
      console.log("Question details result:", result);

      if (result.success) {
        const questionData = result.data.question || result.data;
        console.log("Setting selected question:", questionData);
        console.log("Question ID for deletion:", questionData._id);
        setSelectedQuestion(questionData);
      } else {
        console.error("Failed to fetch question details:", result.message);
        setModMessage(result.message || "Failed to fetch question details");

        // If question not found, it might have been deleted - refresh the questions list
        if (result.message === "Question not found") {
          console.log("Question not found, refreshing questions list...");
          const refreshResult = await QuestionService.getQuestions({});
          if (refreshResult.success) {
            setQuestions(refreshResult.data.questions || []);
            setModMessage(
              "Question not found (may have been deleted). Questions list refreshed."
            );
          }
        }
      }
    } catch (error) {
      console.error("Error in handleCardClick:", error);
      setModMessage("Error fetching question details");
    }

    setDetailLoading(false);
  };

  const handleModerate = async (type, id) => {
    console.log("Attempting to moderate:", { type, id, action: "delete" });
    setModLoading(true);
    setModMessage("");
    const result = await AdminService.moderateContent(type, id, "delete");
    console.log("Moderation result:", result);
    if (result.success) {
      setModMessage("Content deleted successfully.");
      // Refresh the questions list after successful deletion
      const refreshResult = await QuestionService.getQuestions({});
      if (refreshResult.success) {
        setQuestions(refreshResult.data.questions || []);
      }
      // Close the modal after successful deletion
      if (type === "question") {
        setSelectedQuestion(null);
      }
    } else {
      setModMessage(result.message || "Moderation failed.");
    }
    setModLoading(false);
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    if (diffInHours < 1) return "just now";
    if (diffInHours < 24) return `${diffInHours}h ago`;
    if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
    return date.toLocaleDateString();
  };

  const getTagColor = () => {
    return "bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30";
  };

  const refreshQuestions = async () => {
    setLoading(true);
    setError("");
    const result = await QuestionService.getQuestions({});
    if (result.success) {
      setQuestions(result.data.questions || []);
      setModMessage("Questions list refreshed successfully.");
    } else {
      setError(result.message || "Failed to fetch questions");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0613] via-[#150d27] to-[#0a0613] text-white p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Panel</h1>
        <button
          onClick={refreshQuestions}
          disabled={loading}
          className="bg-[#9b87f5] hover:bg-[#8b77e5] text-white px-4 py-2 rounded-lg font-medium transition-all disabled:opacity-50"
        >
          {loading ? "Refreshing..." : "🔄 Refresh Questions"}
        </button>
      </div>
      {loading ? (
        <div>Loading questions...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : (
        <div className="space-y-6 md:space-y-8">
          {questions.map((question) => (
            <Card
              key={question._id}
              className="bg-white/5 backdrop-blur-xl border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-2xl hover:shadow-[#9b87f5]/10 group cursor-pointer"
              onClick={() => handleCardClick(question._id)}
            >
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
                    <h3 className="text-lg sm:text-xl font-medium text-white group-hover:text-[#9b87f5] transition-colors duration-300 cursor-pointer mb-4 group-hover:scale-[1.02] transform transition-transform">
                      {question.title}
                    </h3>
                    <div
                      className="text-white/60 mb-6 leading-relaxed text-base"
                      dangerouslySetInnerHTML={{ __html: question.description }}
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
                            @{question.user?.username}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Clock className="w-4 h-4" />
                          <span>{formatDate(question.createdAt)}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <span
                            className={`px-2 py-1 rounded text-xs ${
                              question.status === "active"
                                ? "bg-green-500/20 text-green-400"
                                : "bg-yellow-500/20 text-yellow-400"
                            }`}
                          >
                            {question.status || "no-status"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Question Detail Modal/Section */}
      {selectedQuestion && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
          <div className="bg-[#18122b] rounded-xl shadow-2xl max-w-2xl w-full p-8 relative">
            <button
              className="absolute top-4 right-4 text-white/60 hover:text-white"
              onClick={() => setSelectedQuestion(null)}
            >
              <X className="w-6 h-6" />
            </button>
            {detailLoading ? (
              <div>Loading...</div>
            ) : (
              <>
                <h2 className="text-2xl font-bold mb-2">
                  {selectedQuestion.title}
                </h2>
                <div
                  className="text-white/70 mb-4"
                  dangerouslySetInnerHTML={{
                    __html: selectedQuestion.description,
                  }}
                />
                <div className="flex flex-wrap gap-2 mb-4">
                  {selectedQuestion.tags.map((tag) => (
                    <Badge
                      key={tag}
                      variant="secondary"
                      className={`${getTagColor()} px-3 py-1`}
                    >
                      <Tag className="w-3 h-3 mr-1" />
                      {tag}
                    </Badge>
                  ))}
                </div>
                <div className="mb-4 text-sm text-white/60">
                  Asked by{" "}
                  <span className="text-[#9b87f5]">
                    @{selectedQuestion.user?.username}
                  </span>{" "}
                  on {formatDate(selectedQuestion.createdAt)}
                </div>
                <div className="mb-4 p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
                  <h3 className="text-lg font-semibold text-red-400 mb-2">
                    Admin Actions
                  </h3>
                  <button
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-3 rounded-lg font-medium transition-all disabled:opacity-50 mr-2 shadow-lg hover:shadow-xl"
                    disabled={modLoading}
                    onClick={() => {
                      console.log(
                        "te button clicked for question ID:",
                        selectedQuestion._id
                      );
                      if (
                        window.confirm(
                          `Are you sure you want to delete the question "${selectedQuestion.title}"? This action cannot be undone.`
                        )
                      ) {
                        handleModerate("question", selectedQuestion._id);
                      }
                    }}
                  >
                    {modLoading ? "Deleting..." : "🗑️ Delete Question"}
                  </button>
                  {modMessage && (
                    <span
                      className={`ml-2 text-sm ${
                        modMessage.includes("success")
                          ? "text-green-400"
                          : "text-red-400"
                      }`}
                    >
                      {modMessage}
                    </span>
                  )}
                </div>
                {/* Answers and Comments */}
                {selectedQuestion.answers &&
                  selectedQuestion.answers.length > 0 && (
                    <div className="mt-6">
                      <h3 className="text-lg font-semibold mb-2">Answers</h3>
                      {selectedQuestion.answers.map((answer) => (
                        <div
                          key={answer._id}
                          className="bg-white/10 rounded-lg p-4 mb-4"
                        >
                          <div className="mb-2 text-white/80">
                            {answer.content}
                          </div>
                          <div className="mb-2 text-xs text-white/50">
                            By @{answer.user?.username}
                          </div>
                          <button
                            className="bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-xs font-medium transition-all disabled:opacity-50"
                            disabled={modLoading}
                            onClick={() => handleModerate("answer", answer._id)}
                          >
                            {modLoading ? "Deleting..." : "Delete Answer"}
                          </button>
                          {/* Comments for this answer */}
                          {answer.comments && answer.comments.length > 0 && (
                            <div className="mt-2 ml-4">
                              <h4 className="text-sm font-semibold mb-1">
                                Comments
                              </h4>
                              {answer.comments.map((comment) => (
                                <div
                                  key={comment._id}
                                  className="flex items-center justify-between bg-white/5 rounded px-2 py-1 mb-1"
                                >
                                  <span className="text-xs text-white/70">
                                    {comment.content}
                                  </span>
                                  <button
                                    className="bg-red-600 hover:bg-red-700 text-white px-2 py-0.5 rounded text-xs font-medium transition-all disabled:opacity-50 ml-2"
                                    disabled={modLoading}
                                    onClick={() =>
                                      handleModerate("comment", comment._id)
                                    }
                                  >
                                    {modLoading ? "Deleting..." : "Delete"}
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPage;
