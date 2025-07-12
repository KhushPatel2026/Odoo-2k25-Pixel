import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Input } from "../../Components/ui/input";
import { Label } from "../../Components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "../../Components/ui/card";
import {
  Globe,
  LogOut,
  User,
  Camera,
  Eye,
  EyeOff,
  ArrowLeft,
  Loader2,
  Settings,
  Shield,
  Mail,
  UserCheck,
  Sparkles,
  Zap,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import { toast, Toaster } from "sonner";
import AuthService from "../../services/authService";
import ProfileService from "../../services/profileService";

const ProfilePage = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fileInputRef = useRef(null);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [profileImage, setProfileImage] = useState("");
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isUploadingImage, setIsUploadingImage] = useState(false);

  // Handle URL token
  useEffect(() => {
    const query = new URLSearchParams(location.search);
    const urlToken = query.get("token");
    if (urlToken) {
      localStorage.setItem("token", urlToken);
      navigate("/profile", { replace: true });
    }
  }, [location, navigate]);

  // Verify token and fetch profile
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      toast.error("No authentication token found");
      navigate("/login");
      return;
    }

    const verifyToken = async (retryCount = 0) => {
      try {
        const verifyResult = await AuthService.verifyToken();
        if (!verifyResult.success) {
          if (retryCount < 3) {
            setTimeout(() => verifyToken(retryCount + 1), 5000);
            return;
          }
          throw new Error(verifyResult.message || "Invalid token");
        }

        const profileResult = await ProfileService.getProfile();
        if (profileResult.success) {
          setProfile(profileResult.data.profile);
          setProfileImage(profileResult.data.profile.profileImage || "");
        } else {
          throw new Error(profileResult.message || "Profile fetch failed");
        }

        setLoading(false);
      } catch (error) {
        if (retryCount < 3) {
          setTimeout(() => verifyToken(retryCount + 1), 5000);
        } else {
          toast.error(error.message);
          localStorage.removeItem("token");
          navigate("/login");
        }
      }
    };

    verifyToken();
  }, [navigate]);

  // Handle profile image upload
  const handleImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image size should be less than 5MB");
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await ProfileService.editProfile(profile.name, file);
      if (result.success) {
        setProfileImage(result.data.profile.profileImage || "");
        setProfile(result.data.profile);
        toast.success("Profile image updated successfully");
      } else {
        throw new Error(result.message || "Image upload failed");
      }
    } catch (error) {
      toast.error(error.message || "Failed to upload image");
      console.error("Image upload error:", error);
    } finally {
      setIsUploadingImage(false);
    }
  };

  // Edit profile handler
  const handleEditProfile = async (e) => {
    e.preventDefault();
    setIsUpdatingProfile(true);
    const form = e.target;
    const formData = new FormData(form);
    const name = formData.get("name").trim();

    try {
      const result = await ProfileService.editProfile(name);
      if (result.success) {
        toast.success("Profile updated successfully");
        setProfile(result.data.profile);
      } else {
        throw new Error(result.message || "Profile update failed");
      }
    } catch (error) {
      toast.error(
        error.message || "An error occurred while updating your profile"
      );
      console.error("Profile update error:", error);
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  // Password validation
  const validatePassword = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = "Current password is required";
    }
    if (!passwordData.newPassword) {
      newErrors.newPassword = "New password is required";
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = "Password must be at least 8 characters";
    }
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Password change handler
  const handlePasswordChange = async (e) => {
    e.preventDefault();
    setIsChangingPassword(true);

    if (!validatePassword()) {
      setIsChangingPassword(false);
      return;
    }

    try {
      const result = await ProfileService.changePassword(
        passwordData.currentPassword,
        passwordData.newPassword
      );
      if (result.success) {
        toast.success("Password changed successfully");
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: "",
        });
        setErrors({});
        setShowPasswords({ current: false, new: false, confirm: false });
      } else {
        throw new Error(result.message || "Failed to change password");
      }
    } catch (error) {
      toast.error(error.message || "An error occurred while changing password");
      console.error("Password change error:", error);
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center"
        style={{
          background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
        }}
      >
        <div className="flex items-center space-x-3 text-white">
          <Loader2 className="w-8 h-8 animate-spin text-[#9b87f5]" />
          <span className="text-xl">Loading your profile...</span>
        </div>
      </div>
    );
  }

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
        <div className="max-w-7xl mx-auto px-3 sm:px-3 py-4">
          <div className="flex items-center justify-between ">
            <Link
              to="/home"
              className="bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-xl px-4 py-2 font-medium shadow-lg shadow-black/20 min-w-[120px] text-center"
            >
              Go to Home
            </Link>
            <button
              onClick={handleLogout}
              className="bg-white/5 backdrop-blur-sm border border-white/10 text-white hover:bg-white/10 hover:border-white/20 transition-all duration-300 rounded-xl px-4 py-2 font-medium shadow-lg shadow-black/20 min-w-[120px]"
            >
              Logout
            </button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="relative z-10 px-4 sm:px-6 md:px-8 py-6 md:py-8">
        <div className="max-w-4xl mx-auto">
          {/* Header Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="mb-8 md:mb-12"
          >
            <div className="flex items-center space-x-4 mb-6">
              <div className="w-12 h-12 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center shadow-lg shadow-[#9b87f5]/20">
                <Settings className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl md:text-5xl font-light text-white mb-2">
                  Profile{" "}
                  <span className="text-[#9b87f5] font-medium">Settings</span>
                </h1>
                <p className="text-white/60 text-base sm:text-lg">
                  Manage your account and security preferences
                </p>
              </div>
            </div>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Profile Image Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="lg:col-span-1"
            >
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)] hover:shadow-[0_0_60px_rgba(155,135,245,0.15)] transition-all duration-300">
                <CardContent className="p-8 text-center">
                  <div className="relative inline-block mb-6">
                    <div className="w-32 h-32 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-full flex items-center justify-center mx-auto overflow-hidden shadow-2xl shadow-[#9b87f5]/30">
                      {profileImage ? (
                        <img
                          src={profileImage || "/placeholder.svg"}
                          alt="Profile"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="w-16 h-16 text-white" />
                      )}
                    </div>
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={isUploadingImage}
                      className="absolute bottom-2 right-2 w-12 h-12 bg-gradient-to-r from-[#9b87f5] to-purple-600 hover:from-[#8b77e5] hover:to-purple-700 rounded-full flex items-center justify-center transition-all duration-300 disabled:opacity-50 shadow-lg shadow-[#9b87f5]/30 hover:shadow-xl hover:shadow-[#9b87f5]/40 hover:scale-110"
                    >
                      {isUploadingImage ? (
                        <Loader2 className="w-6 h-6 text-white animate-spin" />
                      ) : (
                        <Camera className="w-6 h-6 text-white" />
                      )}
                    </button>
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                  />
                  <h3 className="text-xl font-medium text-white mb-2">
                    {profile?.name || "User"}
                  </h3>
                  <p className="text-white/60 text-sm mb-4">{profile?.email}</p>
                  <div className="flex items-center justify-center space-x-2 text-[#9b87f5]">
                    <UserCheck className="w-4 h-4" />
                    <span className="text-sm font-medium">
                      Verified Account
                    </span>
                  </div>
                </CardContent>
              </Card>
            </motion.div>

            {/* Profile Settings */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="lg:col-span-2 space-y-8"
            >
              {/* Profile Information */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)] hover:shadow-[0_0_60px_rgba(155,135,245,0.15)] transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
                      <User className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-light text-white">
                      Profile Information
                    </CardTitle>
                  </div>
                  <p className="text-white/60">
                    Update your personal information and account details
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handleEditProfile} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="name"
                        className="text-white/80 font-medium"
                      >
                        Full Name
                      </Label>
                      <Input
                        id="name"
                        name="name"
                        type="text"
                        placeholder="Enter your full name"
                        defaultValue={profile?.name}
                        required
                        className="bg-white/10 border border-[#9b87f5]/30 text-white placeholder-white/40 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 rounded-xl py-4 px-4 text-base transition-all duration-300 hover:bg-white/15"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="email"
                        className="text-white/80 font-medium"
                      >
                        Email Address
                      </Label>
                      <div className="relative">
                        <Input
                          id="email"
                          type="email"
                          value={profile?.email || ""}
                          disabled
                          className="bg-white/5 border border-white/20 text-white/60 cursor-not-allowed rounded-xl py-4 px-4 text-base"
                        />
                        <Mail className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                      </div>
                      <p className="text-white/40 text-sm flex items-center space-x-2">
                        <AlertCircle className="w-4 h-4" />
                        <span>Email cannot be changed</span>
                      </p>
                    </div>

                    <div className="w-full flex justify-center">
                      <button
                        type="submit"
                        disabled={isUpdatingProfile}
                        className="w-full max-w-[200px] flex items-center justify-center space-x-2 bg-gradient-to-r from-[#9b87f5] to-purple-600 hover:from-[#8b77e5] hover:to-purple-700 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-[#9b87f5]/25 hover:shadow-xl hover:shadow-[#9b87f5]/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                      >
                        {isUpdatingProfile ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Saving Changes...</span>
                          </>
                        ) : (
                          <>
                            <CheckCircle className="w-5 h-5" />
                            <span>Save Changes</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Change Password Section */}
              <Card className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)] hover:shadow-[0_0_60px_rgba(155,135,245,0.15)] transition-all duration-300">
                <CardHeader className="pb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-red-500 to-red-600 rounded-lg flex items-center justify-center">
                      <Shield className="w-4 h-4 text-white" />
                    </div>
                    <CardTitle className="text-2xl font-light text-white">
                      Security Settings
                    </CardTitle>
                  </div>
                  <p className="text-white/60">
                    Update your password to keep your account secure
                  </p>
                </CardHeader>

                <CardContent className="space-y-6">
                  <form onSubmit={handlePasswordChange} className="space-y-6">
                    <div className="space-y-2">
                      <Label
                        htmlFor="currentPassword"
                        className="text-white/80 font-medium"
                      >
                        Current Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="currentPassword"
                          type={showPasswords.current ? "text" : "password"}
                          value={passwordData.currentPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              currentPassword: e.target.value,
                            })
                          }
                          placeholder="Enter current password"
                          className="bg-white/10 border border-[#9b87f5]/30 text-white placeholder-white/40 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 rounded-xl py-4 px-4 pr-12 text-base transition-all duration-300 hover:bg-white/15"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              current: !showPasswords.current,
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPasswords.current ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.currentPassword && (
                        <p className="text-red-400 text-sm flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.currentPassword}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="newPassword"
                        className="text-white/80 font-medium"
                      >
                        New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="newPassword"
                          type={showPasswords.new ? "text" : "password"}
                          value={passwordData.newPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              newPassword: e.target.value,
                            })
                          }
                          placeholder="Enter new password"
                          className="bg-white/10 border border-[#9b87f5]/30 text-white placeholder-white/40 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 rounded-xl py-4 px-4 pr-12 text-base transition-all duration-300 hover:bg-white/15"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              new: !showPasswords.new,
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPasswords.new ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.newPassword && (
                        <p className="text-red-400 text-sm flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.newPassword}</span>
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label
                        htmlFor="confirmPassword"
                        className="text-white/80 font-medium"
                      >
                        Confirm New Password
                      </Label>
                      <div className="relative">
                        <Input
                          id="confirmPassword"
                          type={showPasswords.confirm ? "text" : "password"}
                          value={passwordData.confirmPassword}
                          onChange={(e) =>
                            setPasswordData({
                              ...passwordData,
                              confirmPassword: e.target.value,
                            })
                          }
                          placeholder="Confirm new password"
                          className="bg-white/10 border border-[#9b87f5]/30 text-white placeholder-white/40 focus:border-[#9b87f5] focus:ring-2 focus:ring-[#9b87f5]/20 rounded-xl py-4 px-4 pr-12 text-base transition-all duration-300 hover:bg-white/15"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowPasswords({
                              ...showPasswords,
                              confirm: !showPasswords.confirm,
                            })
                          }
                          className="absolute right-4 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                        >
                          {showPasswords.confirm ? (
                            <EyeOff className="w-5 h-5" />
                          ) : (
                            <Eye className="w-5 h-5" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && (
                        <p className="text-red-400 text-sm flex items-center space-x-2">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.confirmPassword}</span>
                        </p>
                      )}
                    </div>

                    <div className="w-full flex justify-center">
                      <button
                        type="submit"
                        disabled={isChangingPassword}
                        className="w-full max-w-[200px] flex items-center justify-center space-x-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white font-medium py-3 rounded-xl transition-all duration-300 shadow-lg shadow-red-500/25 hover:shadow-xl hover:shadow-red-500/30 transform hover:scale-[1.02] disabled:opacity-50 disabled:transform-none"
                      >
                        {isChangingPassword ? (
                          <>
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>Changing Password...</span>
                          </>
                        ) : (
                          <>
                            <Shield className="w-5 h-5" />
                            <span>Change Password</span>
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.9)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
            backdropFilter: "blur(10px)",
          },
        }}
      />
    </div>
  );
};

export default ProfilePage;
