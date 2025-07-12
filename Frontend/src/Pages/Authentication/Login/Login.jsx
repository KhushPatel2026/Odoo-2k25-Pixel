import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { toast, Toaster } from "sonner";
import { Globe, Eye, EyeOff, ArrowLeft } from "lucide-react";
import AuthService from "../../../services/authService";
import { useNavigate } from "react-router-dom";

const LoginPage = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [name, setName] = useState("");
  const [emailOrUsername, setEmailOrUsername] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [usernameSuggestions, setUsernameSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [usernameLoading, setUsernameLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let debounceTimer;
    if (!isLogin && username.trim().length > 3) {
      setUsernameLoading(true);
      debounceTimer = setTimeout(async () => {
        try {
          const result = await AuthService.suggestUsernames(username);
          if (result.success) {
            setUsernameSuggestions(result.data || []);
            setShowSuggestions(true);
          } else {
            setUsernameSuggestions([]);
            setShowSuggestions(false);
          }
        } catch (err) {
          console.error("Error fetching suggestions:", err);
          setUsernameSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setUsernameLoading(false);
        }
      }, 300);
    } else {
      setUsernameSuggestions([]);
      setShowSuggestions(false);
      setUsernameLoading(false);
    }

    return () => clearTimeout(debounceTimer);
  }, [username, isLogin]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsLoading(true);

    try {

      const result = isLogin
        ? await AuthService.login(emailOrUsername, password)
        : await AuthService.register(name, emailOrUsername, username, password);

      if (result.success) {
        toast.success(`${isLogin ? "Login" : "Registration"} successful!`);
        setTimeout(() => {
          navigate("/home");
        }, 1500);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      toast.error("An error occurred. Please try again.");
      console.error("Auth error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleAuthMode = () => {
    setIsLogin(!isLogin);
    setName("");
    setEmailOrUsername("");
    setUsername("");
    setPassword("");
    setUsernameSuggestions([]);
    setShowSuggestions(false);
    setUsernameLoading(false);
  };

  const handleSuggestionClick = (suggestion) => {
    setUsername(suggestion);
    setUsernameSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center p-4 overflow-hidden"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 20% 20%, rgba(155, 135, 245, 0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(155, 135, 245, 0.1) 0%, transparent 50%)",
        }}
      />

      <a
        href="/landing"
        className="absolute top-6 left-6 flex items-center space-x-2 text-white/70 hover:text-white transition-colors z-10"
      >
        <ArrowLeft className="w-5 h-5" />
        <span>Back to Home</span>
      </a>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="w-full max-w-md relative z-10"
      >
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 shadow-[0_0_50px_rgba(155,135,245,0.1)] rounded-lg">
          <div className="text-center pb-8 pt-6">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-xl flex items-center justify-center">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white">StackIt</span>
            </div>
            <h2 className="text-3xl font-light text-white">
              {isLogin ? "Welcome Back" : "Join the Global Community"}
            </h2>
            <p className="text-white/60 mt-2">
              {isLogin
                ? "Sign in to continue your knowledge journey"
                : "Create your account to start connecting globally"}
            </p>
          </div>

          <div className="px-6 pb-6 space-y-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              {!isLogin && (
                <>
                  <div className="space-y-2">
                    <label htmlFor="name" className="text-white/80">
                      Full Name
                    </label>
                    <input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      type="text"
                      placeholder="Enter your full name"
                      required={!isLogin}
                      className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 transition-all duration-300 rounded-md px-3 py-2"
                    />
                  </div>
                  <div className="space-y-2 relative">
                    <label htmlFor="username" className="text-white/80">
                      Username
                    </label>
                    <input
                      id="username"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      type="text"
                      placeholder="Enter your username"
                      required={!isLogin}
                      className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 transition-all duration-300 rounded-md px-3 py-2"
                    />
                    <div className="mt-1 text-xs text-white/70 flex items-center gap-1 flex-wrap">
                      {usernameLoading && <span>Loading...</span>}
                      {!usernameLoading &&
                        showSuggestions &&
                        usernameSuggestions.length > 0 && (
                          <>
                            <span className="italic mr-1">Suggested:</span>
                            {usernameSuggestions.map((suggestion, index) => (
                              <button
                                key={index}
                                type="button"
                                onClick={() =>
                                  handleSuggestionClick(suggestion)
                                }
                                className="rounded-full cursor-pointer border border-white/20 bg-white/10 text-xs font-medium hover:bg-[#9b87f5] hover:text-white transition leading-tight px-3 py-0.5 m-0"
                              >
                                {suggestion}
                              </button>
                            ))}
                          </>
                        )}
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <label htmlFor="emailOrUsername" className="text-white/80">
                  {isLogin ? "Email or Username" : "Email Address"}
                </label>
                <input
                  id="emailOrUsername"
                  value={emailOrUsername}
                  onChange={(e) => setEmailOrUsername(e.target.value)}
                  type="text"
                  placeholder={
                    isLogin
                      ? "Enter your email or username"
                      : "Enter your email"
                  }
                  required
                  className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 transition-all duration-300 rounded-md px-3 py-2"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="password" className="text-white/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    required
                    className="w-full bg-white/5 border border-white/20 text-white placeholder-white/40 focus:border-[#9b87f5]/50 focus:ring-[#9b87f5]/20 transition-all duration-300 rounded-md px-3 py-2 pr-12"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="w-5 h-5" />
                    ) : (
                      <Eye className="w-5 h-5" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full bg-gradient-to-r from-[#9b87f5] to-purple-600 hover:from-[#8b77e5] hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-300 transform hover:scale-[1.02] hover:shadow-[0_0_20px_rgba(155,135,245,0.4)] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {isLoading ? (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>
                      {isLogin ? "Signing In..." : "Creating Account..."}
                    </span>
                  </div>
                ) : (
                  <span>{isLogin ? "Sign In" : "Create Account"}</span>
                )}
              </button>
            </form>

            {isLogin && (
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10" />
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-transparent text-white/60">
                    or continue with
                  </span>
                </div>
              </div>
            )}

            {isLogin && (
              <button
                type="button"
                onClick={AuthService.googleAuth}
                className="w-full bg-white/5 border border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-all duration-300 rounded-md py-3"
              >
                <svg className="w-5 h-5 mr-2 inline" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-1.04.69-2.36 1.09-3.71 1.09-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.66-2.84z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l2.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </button>
            )}

            <div className="text-center">
              <button
                type="button"
                onClick={toggleAuthMode}
                className="text-white/60 hover:text-[#9b87f5] transition-colors duration-300 text-sm"
              >
                {isLogin ? (
                  <>
                    Don't have an account?{" "}
                    <span className="font-medium text-[#9b87f5]">Sign up</span>
                  </>
                ) : (
                  <>
                    Already have an account?{" "}
                    <span className="font-medium text-[#9b87f5]">Sign in</span>
                  </>
                )}
              </button>
            </div>

            {isLogin && (
              <div className="text-center">
                <button
                  type="button"
                  className="text-white/60 hover:text-[#9b87f5] transition-colors duration-300 text-sm"
                >
                  Forgot your password?
                </button>
              </div>
            )}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="text-center mt-8 text-white/40 text-sm"
        >
          <p>
            By {isLogin ? "signing in" : "creating an account"}, you agree to
            our{" "}
            <a href="#" className="text-[#9b87f5] hover:underline">
              Terms of Service
            </a>{" "}
            and{" "}
            <a href="#" className="text-[#9b87f5] hover:underline">
              Privacy Policy
            </a>
          </p>
        </motion.div>
      </motion.div>

      <Toaster
        theme="dark"
        position="top-right"
        toastOptions={{
          style: {
            background: "rgba(0, 0, 0, 0.8)",
            border: "1px solid rgba(255, 255, 255, 0.1)",
            color: "white",
          },
        }}
      />
    </div>
  );
};

export default LoginPage;
