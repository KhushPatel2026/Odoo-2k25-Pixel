import { SERVER_BASE_URL } from "../lib/config";

const AnswerService = {
  async postAnswer(questionId, content, images) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const formData = new FormData();
      formData.append("questionId", questionId);
      formData.append("content", content);
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/post`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to post answer" };
      }
    } catch (error) {
      console.error("Post answer error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async acceptAnswer(answerId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/accept`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ answerId }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to accept answer" };
      }
    } catch (error) {
      console.error("Accept answer error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async voteAnswer(answerId, voteType) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/vote`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ answerId, voteType }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to vote on answer" };
      }
    } catch (error) {
      console.error("Vote answer error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async updateAnswer(answerId, { content, images }) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const formData = new FormData();
      if (content) formData.append("content", content);
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/update/${answerId}`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to update answer" };
      }
    } catch (error) {
      console.error("Update answer error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async postComment(answerId, content) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/comment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ answerId, content }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to post comment" };
      }
    } catch (error) {
      console.error("Post comment error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async updateComment(commentId, content) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/answers/comment/update/${commentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ content }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to update comment" };
      }
    } catch (error) {
      console.error("Update comment error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },
};

export default AnswerService;
