import { SERVER_BASE_URL } from "../lib/config";

const AuthService = {
  async login(emailOrUsername, password) {
    try {
      const requestBody = { emailOrUsername, password };
      console.log("Login request body:", { ...requestBody, password });

      const response = await fetch(`${SERVER_BASE_URL}/api/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Login response:", data);
      console.log("Response status:", response.status);
      console.log(
        "Response headers:",
        Object.fromEntries(response.headers.entries())
      );

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        return { success: true, data };
      } else {
        return {
          success: false,
          message:
            data.message || data.error || "Please check your credentials",
        };
      }
    } catch (error) {
      console.error("Login error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async register(name, email, username, password) {
    try {
      const requestBody = { name, email, username, password };
      console.log("Register request body:", requestBody);

      const response = await fetch(`${SERVER_BASE_URL}/api/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(requestBody),
      });

      const data = await response.json();
      console.log("Register response:", data);

      if (response.ok && data.token) {
        localStorage.setItem("token", data.token);
        return { success: true, data };
      } else {
        return {
          success: false,
          message:
            data.message || data.error || "Please check your credentials",
        };
      }
    } catch (error) {
      console.error("Register error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async verifyToken() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/auth/verify-token`, {
        method: "GET",
        headers: {
          "x-access-token": token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || data.error || "Invalid token",
        };
      }
    } catch (error) {
      console.error("Verify token error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async getProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/profile`, {
        method: "GET",
        headers: {
          "x-access-token": token,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || data.error || "Failed to retrieve profile",
        };
      }
    } catch (error) {
      console.error("Get profile error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async editProfile(name, email) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/profile/edit`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-access-token": token,
        },
        body: JSON.stringify({ name, email }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || data.error || "Failed to update profile",
        };
      }
    } catch (error) {
      console.error("Edit profile error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(
        `${SERVER_BASE_URL}/api/profile/change-password`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "x-access-token": token,
          },
          body: JSON.stringify({ currentPassword, newPassword }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return {
          success: false,
          message: data.message || data.error || "Failed to change password",
        };
      }
    } catch (error) {
      console.error("Change password error:", error);
      return {
        success: false,
        message: "An error occurred. Please try again.",
      };
    }
  },

  async suggestUsernames(query) {
    try {
      const response = await fetch(
        `${SERVER_BASE_URL}/api/auth/suggest-usernames?context=registration&query=${encodeURIComponent(
          query
        )}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();

      if (response.ok && data.status === "ok") {
        return { success: true, data: data.usernames };
      } else {
        return {
          success: false,
          message: data.message || "Failed to fetch username suggestions",
        };
      }
    } catch (error) {
      console.error("Suggest usernames error:", error);
      return {
        success: false,
        message: "An error occurred while fetching suggestions.",
      };
    }
  },

  googleAuth() {
    window.location.href = `${SERVER_BASE_URL}/auth/google`;
  },
};

export default AuthService;
