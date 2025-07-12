import { SERVER_BASE_URL } from "../lib/config";

const ProfileService = {
  async getProfile() {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/profile`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to retrieve profile" };
      }
    } catch (error) {
      console.error("Get profile error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async editProfile(name, email, profileImage) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      if (profileImage) {
        formData.append("profileImage", profileImage);
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/profile/edit`, {
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
        return { success: false, message: data.message || "Failed to update profile" };
      }
    } catch (error) {
      console.error("Edit profile error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },

  async changePassword(currentPassword, newPassword) {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return { success: false, message: "No token found" };
      }

      const response = await fetch(`${SERVER_BASE_URL}/api/profile/change-password`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await response.json();

      if (response.ok) {
        return { success: true, data };
      } else {
        return { success: false, message: data.message || "Failed to change password" };
      }
    } catch (error) {
      console.error("Change password error:", error);
      return { success: false, message: "An error occurred. Please try again." };
    }
  },
};

export default ProfileService;