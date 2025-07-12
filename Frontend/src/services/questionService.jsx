import { SERVER_BASE_URL } from "../lib/config";

const QuestionService = {
  async askQuestion(title, description, tags, images) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const formData = new FormData();
      formData.append("title", title);
      formData.append("description", description);
      formData.append("tags", tags.join(","));
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/questions/ask`, {
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
        return { success: false, message: data.message || "Failed to post question" };
      }
    } catch (error) {
      console.error("Ask question error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async getQuestions({
    page = 1,
    limit = 10,
    tag,
    search,
    sort = "newest",
    answered,
    userId,
    username,
    mentioned,
    hasAccepted,
  } = {}) {
    try {
      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        ...(tag && { tag }),
        ...(search && { search }),
        ...(sort && { sort }),
        ...(answered !== undefined && { answered: answered.toString() }),
        ...(userId && { userId }),
        ...(username && { username }),
        ...(mentioned && { mentioned }),
        ...(hasAccepted !== undefined && { hasAccepted: hasAccepted.toString() }),
      }).toString();

      const response = await fetch(`${SERVER_BASE_URL}/api/questions?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve questions" };
      }
    } catch (error) {
      console.error("Get questions error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async getUserQuestions({ page = 1, limit = 10 } = {}) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const queryParams = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`${SERVER_BASE_URL}/api/questions/user-questions?${queryParams}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve user questions" };
      }
    } catch (error) {
      console.error("Get user questions error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async getQuestionById(questionId) {
    try {
      const response = await fetch(`${SERVER_BASE_URL}/api/questions/${questionId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve question" };
      }
    } catch (error) {
      console.error("Get question by ID error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async updateQuestion(questionId, { title, description, tags, status, images }) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const formData = new FormData();
      if (title) formData.append("title", title);
      if (description) formData.append("description", description);
      if (tags && tags.length > 0) formData.append("tags", tags.join(","));
      if (status) formData.append("status", status);
      if (images && images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images[${index}]`, image);
        });
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/questions/update/${questionId}`, {
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
        return { success: false, message: data.message || "Failed to update question" };
      }
    } catch (error) {
      console.error("Update question error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async deleteQuestion(questionId) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/questions/delete/${questionId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to delete question" };
      }
    } catch (error) {
      console.error("Delete question error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async getTrendingTags({ limit = 5 } = {}) {
    try {
      const queryParams = new URLSearchParams({
        limit: limit.toString(),
      }).toString();

      const response = await fetch(`${SERVER_BASE_URL}/api/questions/trending/tags?${queryParams}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      console.log("Trending tags data:", data);

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve trending tags" };
      }
    } catch (error) {
      console.error("Get trending tags error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  }
};

export default QuestionService;