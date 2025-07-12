import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RichTextEditor } from '../../Components/ui/rich-text-editor';
import { Button } from '../../Components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../../Components/ui/card';
import { Badge } from '../../Components/ui/badge';
import { 
  ArrowLeft, 
  Globe, 
  FileText, 
  Sparkles, 
  Zap,
  Keyboard,
  MousePointer,
  Palette,
  Code
} from 'lucide-react';

const RichTextDemo = () => {
  const [content, setContent] = useState('');

  const features = [
    {
      icon: Keyboard,
      title: "Keyboard Shortcuts",
      description: "Use Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links, and more for lightning-fast editing.",
      color: "from-blue-500 to-cyan-500"
    },
    {
      icon: MousePointer,
      title: "Floating Toolbar",
      description: "Professional floating toolbar that stays accessible while you write, with intuitive tooltips.",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: Palette,
      title: "Rich Formatting",
      description: "Bold, italic, headers, lists, alignment, links, images, and emoji support with StackIt theme.",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: Code,
      title: "Advanced Features",
      description: "Character count, undo/redo, image uploads, link dialogs, and professional styling throughout.",
      color: "from-orange-500 to-red-500"
    }
  ];

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

          <a href="/landing">
            <Button variant="outline" className="border-white/20 text-white hover:bg-white/10">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Landing
            </Button>
          </a>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="container mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
            className="text-center mb-16"
          >
            <div className="flex items-center justify-center mb-6">
              <div className="w-16 h-16 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-2xl flex items-center justify-center mr-4">
                <FileText className="w-8 h-8 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-4xl md:text-5xl font-light text-white">
                  Rich Text <span className="text-[#9b87f5]">Editor</span>
                </h1>
                <p className="text-white/60 text-lg">Professional-grade editing experience</p>
              </div>
            </div>
            
            <div className="flex items-center justify-center space-x-4 mb-8">
              <Badge className="bg-[#9b87f5]/20 text-[#9b87f5] border-[#9b87f5]/30">
                <Sparkles className="w-3 h-3 mr-1" />
                Enhanced UX
              </Badge>
              <Badge className="bg-green-900/30 text-green-300 border-green-700/50">
                <Zap className="w-3 h-3 mr-1" />
                Keyboard Shortcuts
              </Badge>
              <Badge className="bg-blue-900/30 text-blue-300 border-blue-700/50">
                <MousePointer className="w-3 h-3 mr-1" />
                Floating Toolbar
              </Badge>
            </div>
          </motion.div>

          {/* Editor Section */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="mb-16"
          >
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10 overflow-hidden shadow-[0_0_50px_rgba(155,135,245,0.1)]">
              <CardHeader className="border-b border-white/10">
                <CardTitle className="text-white flex items-center">
                  <FileText className="w-5 h-5 mr-2 text-[#9b87f5]" />
                  Try the Enhanced Editor
                </CardTitle>
                <p className="text-white/60 text-sm">
                  Experience the professional-grade rich text editor with floating toolbar, keyboard shortcuts, and StackIt theme.
                </p>
              </CardHeader>
              <CardContent className="p-6">
                <RichTextEditor
                  value={content}
                  onChange={setContent}
                  placeholder="Start writing your question or answer here... Use the floating toolbar above or keyboard shortcuts like Ctrl+B for bold, Ctrl+I for italic, Ctrl+K for links..."
                  className="w-full"
                />
              </CardContent>
            </Card>
          </motion.div>

          {/* Features Grid */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16"
          >
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
              >
                <Card className="bg-white/5 backdrop-blur-lg border border-white/10 hover:border-white/20 transition-all duration-300 hover:shadow-[0_0_30px_rgba(155,135,245,0.1)]">
                  <CardContent className="p-6">
                    <div className={`w-12 h-12 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4`}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {feature.title}
                    </h3>
                    <p className="text-white/60 text-sm leading-relaxed">
                      {feature.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>

          {/* Usage Instructions */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.8 }}
          >
            <Card className="bg-white/5 backdrop-blur-lg border border-white/10">
              <CardHeader>
                <CardTitle className="text-white flex items-center">
                  <Keyboard className="w-5 h-5 mr-2 text-[#9b87f5]" />
                  Keyboard Shortcuts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Bold</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + B
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Italic</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + I
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Underline</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + U
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Insert Link</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + K
                      </Badge>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Undo</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + Z
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Redo</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Ctrl + Shift + Z
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Emoji Picker</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Click 😊
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg">
                      <span className="text-white/80">Image Upload</span>
                      <Badge variant="outline" className="border-white/20 text-white">
                        Click 📷
                      </Badge>
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
        <div className="max-w-6xl mx-auto text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-br from-[#9b87f5] to-purple-600 rounded-lg flex items-center justify-center">
              <Globe className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">StackIt</span>
          </div>
          <p className="text-white/50">
            Professional-grade rich text editor with enhanced UX and StackIt theme
          </p>
        </div>
      </footer>
    </div>
  );
};

export default RichTextDemo; 