import React, { useState } from "react";
import { motion } from "framer-motion";
import { Button } from "../../Components/ui/button";
import { Card, CardContent } from "../../Components/ui/card";
import { Badge } from "../../Components/ui/badge";
import GlobeHero from "../../Components/ui/globehero";
import { GlowCard } from "../../Components/ui/spotlight-card";
import { RadialOrbitalTimeline } from "../../Components/ui/radial-orbital-timeline";
import landingImg from '../../assests/landing.png'; // Adjust the path if needed
import {
  Bell,
  Menu,
  X,
  ArrowUp,
  ArrowDown,
  MessageCircle,
  Github,
  ExternalLink,
  Globe,
  Users,
  BookOpen,
  MessageSquare,
  ThumbsUp,
  Tag,
  FileText,
  Search,
  Shield,
} from "lucide-react";

export default function StackItLanding() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div
      className="min-h-screen text-white overflow-hidden font-light antialiased"
      style={{
        background: "linear-gradient(135deg, #0a0613 0%, #150d27 100%)",
      }}
    >
      {/* Radial Gradient Overlays */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 70% 30%, rgba(155, 135, 245, 0.08) 0%, rgba(13, 10, 25, 0) 50%), radial-gradient(circle at 30% 70%, rgba(155, 135, 245, 0.08) 0%, rgba(13, 10, 25, 0) 50%)",
        }}
      />

      {/* Navigation */}
      <nav className="relative z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">StackIt</span>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <a
              href="/home"
              className="text-white/70 hover:text-white transition-colors"
            >
              Home
            </a>
            <a
              href="/login"
              className="text-white/70 hover:text-white transition-colors"
            >
              Log In
            </a>
          </div>

          <div className="flex items-center space-x-4">
            {/* Glowing Notification Bell */}
            <div className="relative">
              <Bell className="w-6 h-6 text-white/70 hover:text-white transition-colors cursor-pointer" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5] rounded-full animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#9b87f5]/60 rounded-full animate-ping" />
            </div>

            {/* Mobile Menu Button */}
            <button
              className="md:hidden"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? (
                <X className="w-6 h-6" />
              ) : (
                <Menu className="w-6 h-6" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden absolute top-full left-0 right-0 bg-black/95 backdrop-blur-lg border-t border-white/10">
            <div className="px-6 py-4 space-y-4">
              <a
                href="/home"
                className="block text-white/70 hover:text-white transition-colors"
              >
                Home
              </a>
              <a
                href="/login"
                className="block text-white/70 hover:text-white transition-colors"
              >
                Log In
              </a>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20 md:py-32">
        <div className="container relative z-10 mx-auto max-w-2xl text-center md:max-w-4xl md:px-6 lg:max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <span className="mb-6 inline-block rounded-full border border-[#9b87f5]/30 px-3 py-1 text-xs text-[#9b87f5]">
              GLOBAL KNOWLEDGE NETWORK
            </span>
            <h1 className="mx-auto mb-6 max-w-4xl text-4xl font-light md:text-5xl lg:text-7xl">
              Connect Minds <span className="text-[#9b87f5]">Globally</span>{" "}
              with StackIt
            </h1>
            <p className="mx-auto mb-10 max-w-2xl text-lg text-white/60 md:text-xl">
              A worldwide Q&A platform where knowledge flows freely across
              borders, connecting learners and experts from every corner of the
              globe.
            </p>

            <div className="mb-10 sm:mb-0 flex flex-col items-center justify-center gap-4 sm:flex-row">
              <a href="/home">
                <Button className="cursor-pointer neumorphic-button hover:shadow-[0_0_20px_rgba(155,135,245,0.5)] relative w-full overflow-hidden rounded-full border border-white/10 bg-gradient-to-b from-white/10 to-white/5 px-8 py-4 text-white shadow-lg transition-all duration-300 hover:border-[#9b87f5]/30 sm:w-auto">
                  Get Started
                  <ExternalLink className="ml-2 w-4 h-4" />
                </Button>
              </a>
              <a
                href="#features"
                className="flex w-full items-center justify-center gap-2 text-white/70 transition-colors hover:text-white sm:w-auto"
              >
                <span>Explore Features</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="m6 9 6 6 6-6"></path>
                </svg>
              </a>
            </div>
          </motion.div>

          <motion.div
            className="relative"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.3 }}
          >
            <GlobeHero />
            <div className="relative z-10 mx-auto max-w-5xl overflow-hidden rounded-lg shadow-[0_0_50px_rgba(155,135,245,0.2)]">
            <img src={landingImg} alt="Landing" className="w-full h-auto rounded-2xl shadow-lg" />
            </div>
          </motion.div>
        </div>
      </section>

      {/* Why StackIt Section */}
      <section id="features" className="relative z-10 px-6 py-20">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-center mb-16 text-white">
              Why Choose <span className="text-[#9b87f5]">StackIt</span>?
            </h2>
          </motion.div>

          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            {/* Feature Card 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              viewport={{ once: true }}
            >
              <GlowCard 
                glowColor="purple" 
                size="md"
                className="text-white"
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Globe className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-light mb-4 text-white">
                    Global Reach
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Connect with experts and learners from around the world,
                    breaking down geographical barriers to knowledge sharing.
                  </p>
                </div>
              </GlowCard>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              viewport={{ once: true }}
            >
              <GlowCard 
                glowColor="purple" 
                size="md"
                className="text-white"
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <Users className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-light mb-4 text-white">
                    Community Driven
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Powered by a diverse community of contributors who vote,
                    validate, and curate the best answers for everyone.
                  </p>
                </div>
              </GlowCard>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              viewport={{ once: true }}
            >
              <GlowCard 
                glowColor="purple" 
                size="md"
                className="text-white"
              >
                <div className="flex flex-col items-center text-center h-full justify-center">
                  <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center mb-6">
                    <BookOpen className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-light mb-4 text-white">
                    Rich Knowledge Base
                  </h3>
                  <p className="text-white/60 leading-relaxed">
                    Build and access a comprehensive repository of structured
                    knowledge with advanced formatting and search capabilities.
                  </p>
                </div>
              </GlowCard>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="relative z-10 px-6 py-12">
        <div className="max-w-6xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-4xl md:text-5xl font-light text-center mb-8 text-white">
              StackIt <span className="text-[#9b87f5]">Features</span>
            </h2>
          </motion.div>

          <div className="h-[800px] relative">
            <RadialOrbitalTimeline 
              timelineData={[
                {
                  id: 1,
                  title: "Ask Questions",
                  date: "Core Feature",
                  content: "Submit questions with rich text editor, tags, and detailed descriptions. Support for images, links, and formatted content.",
                  category: "Core",
                  icon: MessageSquare,
                  relatedIds: [2, 3],
                  status: "completed",
                  energy: 100,
                },
                {
                  id: 2,
                  title: "Rich Text Editor",
                  date: "Advanced",
                  content: "Full-featured editor with bold, italic, lists, emojis, hyperlinks, image uploads, and text alignment options.",
                  category: "Editor",
                  icon: FileText,
                  relatedIds: [1, 3],
                  status: "completed",
                  energy: 95,
                },
                {
                  id: 3,
                  title: "Voting System",
                  date: "Community",
                  content: "Upvote and downvote answers. Question owners can mark accepted answers. Community-driven quality control.",
                  category: "Voting",
                  icon: ThumbsUp,
                  relatedIds: [1, 4],
                  status: "completed",
                  energy: 90,
                },
                {
                  id: 4,
                  title: "Tagging System",
                  date: "Organization",
                  content: "Organize questions with relevant tags. Multi-select input for better categorization and searchability.",
                  category: "Tags",
                  icon: Tag,
                  relatedIds: [3, 5],
                  status: "completed",
                  energy: 85,
                },
                {
                  id: 5,
                  title: "Notifications",
                  date: "Real-time",
                  content: "Get notified when someone answers your question, comments on your answer, or mentions you with @username.",
                  category: "Notifications",
                  icon: Bell,
                  relatedIds: [4, 6],
                  status: "completed",
                  energy: 80,
                },
                {
                  id: 6,
                  title: "Search & Discovery",
                  date: "Findability",
                  content: "Advanced search functionality to find questions and answers. Discover relevant content through tags and categories.",
                  category: "Search",
                  icon: Search,
                  relatedIds: [5, 7],
                  status: "in-progress",
                  energy: 70,
                },
                {
                  id: 7,
                  title: "User Roles",
                  date: "Access Control",
                  content: "Guest users can view content, registered users can post and vote, admins can moderate content.",
                  category: "Security",
                  icon: Shield,
                  relatedIds: [6],
                  status: "completed",
                  energy: 75,
                },
              ]} 
            />
          </div>
        </div>
      </section>

      {/* Q&A Preview Section */}
      <section className="relative z-10 px-6 py-20">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-3xl md:text-4xl font-light text-center mb-12 text-white">
              Experience <span className="text-[#9b87f5]">Global</span>{" "}
              Collaboration
            </h2>
          </motion.div>

          {/* Mock Q&A Card */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
          >
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(155,135,245,0.1)]">
              <CardContent className="p-0">
                {/* Question */}
                <div className="p-6 border-b border-white/10">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center space-y-2">
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <ArrowUp className="w-5 h-5 text-white/60 hover:text-[#9b87f5]" />
                      </button>
                      <span className="text-lg font-semibold text-white">
                        42
                      </span>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <ArrowDown className="w-5 h-5 text-white/60 hover:text-red-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-xl font-light text-white mb-3">
                        How to implement sustainable energy solutions in
                        developing countries?
                      </h3>
                      <p className="text-white/60 mb-4">
                        Looking for practical approaches to deploy renewable
                        energy infrastructure in regions with limited resources.
                        What are the most cost-effective solutions that have
                        proven successful globally?
                      </p>
                      <div className="flex items-center space-x-4 text-sm text-white/60">
                        <div className="flex space-x-2">
                          <Badge
                            variant="secondary"
                            className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30"
                          >
                            sustainability
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-green-900/30 text-green-300 border-green-700/50"
                          >
                            renewable-energy
                          </Badge>
                          <Badge
                            variant="secondary"
                            className="bg-blue-900/30 text-blue-300 border-blue-700/50"
                          >
                            global-development
                          </Badge>
                        </div>
                        <span>•</span>
                        <span>asked 3 hours ago</span>
                        <span>•</span>
                        <span className="flex items-center space-x-1">
                          <MessageCircle className="w-4 h-4" />
                          <span>5 answers</span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Answer Preview */}
                <div className="p-6 bg-white/[0.02]">
                  <div className="flex items-start space-x-4">
                    <div className="flex flex-col items-center space-y-2">
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <ArrowUp className="w-5 h-5 text-[#9b87f5]" />
                      </button>
                      <span className="text-lg font-semibold text-white">
                        28
                      </span>
                      <button className="p-1 hover:bg-white/10 rounded transition-colors">
                        <ArrowDown className="w-5 h-5 text-white/60 hover:text-red-400" />
                      </button>
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-3">
                        <div className="w-2 h-2 bg-[#9b87f5] rounded-full"></div>
                        <span className="text-sm text-[#9b87f5] font-medium">
                          Accepted Answer
                        </span>
                      </div>
                      <p className="text-white/60 mb-4">
                        Based on successful implementations in Kenya and
                        Bangladesh, micro-grid solar systems combined with
                        community ownership models have shown remarkable
                        results. Here's a comprehensive approach...
                      </p>
                      <div className="text-sm text-white/60">
                        answered 2 hours ago by{" "}
                        <span className="text-[#9b87f5]">
                          @sustainability_expert
                        </span>{" "}
                        • 🇰🇪 Kenya
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-6 py-12 border-t border-white/10">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
                <Globe className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold">StackIt</span>
            </div>
            <div className="flex items-center space-x-8 text-white/60">
              <a href="#" className="hover:text-white transition-colors">
                About
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Privacy
              </a>
              <a
                href="#"
                className="flex items-center space-x-2 hover:text-white transition-colors"
              >
                <Github className="w-4 h-4" />
                <span>GitHub</span>
              </a>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t border-white/10 text-center text-white/50">
            <p>© 2024 StackIt. Connecting minds globally through knowledge.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
