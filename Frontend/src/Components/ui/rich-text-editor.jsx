import React, { useState, useRef, useEffect, useCallback } from 'react';
import ReactQuill from 'react-quill';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import { 
  Smile, 
  Bold, 
  Italic, 
  Underline, 
  Strikethrough,
  List,
  ListOrdered,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Link,
  Image,
  Upload,
  Type,
  Heading1,
  Heading2,
  Heading3,
  Quote,
  Code,
  Undo,
  Redo,
  X
} from 'lucide-react';
import { Button } from './button';
import 'react-quill/dist/quill.snow.css';

// Suppress ReactQuill findDOMNode warnings
const originalError = console.error;
const originalWarn = console.warn;

console.error = (...args) => {
  if (typeof args[0] === 'string' && args[0].includes('findDOMNode')) {
    return;
  }
  originalError(...args);
};

console.warn = (...args) => {
  if (typeof args[0] === 'string' && (args[0].includes('findDOMNode') || args[0].includes('DOMNodeInserted'))) {
    return;
  }
  originalWarn(...args);
};

const RichTextEditor = ({ 
  value = '', 
  onChange, 
  placeholder = 'Write your question or answer here...',
  className = '',
  label = 'Editor'
}) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [showImageDialog, setShowImageDialog] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkText, setLinkText] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [imageAlt, setImageAlt] = useState('');
  const [imageFile, setImageFile] = useState(null);
  const [uploadMode, setUploadMode] = useState('url'); // 'url' or 'file'
  const [isFocused, setIsFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState({});
  const [showTooltip, setShowTooltip] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const linkInputRef = useRef(null);
  const imageInputRef = useRef(null);
  const fileInputRef = useRef(null);

  // Keyboard shortcuts - only when editor is focused
  useEffect(() => {
    const handleKeyDown = (e) => {
      // Only handle shortcuts when the editor is focused and not in dialog inputs
      if (!isFocused || !quillRef.current) return;
      
      // Don't handle shortcuts if we're typing in a dialog input
      if (e.target.classList.contains('dialog-input')) return;
      
      const quill = quillRef.current.getEditor();
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            e.stopPropagation();
            quill.format('bold', !quill.getFormat().bold);
            break;
          case 'i':
            e.preventDefault();
            e.stopPropagation();
            quill.format('italic', !quill.getFormat().italic);
            break;
          case 'u':
            e.preventDefault();
            e.stopPropagation();
            quill.format('underline', !quill.getFormat().underline);
            break;
          case 'k':
            e.preventDefault();
            e.stopPropagation();
            setShowLinkDialog(true);
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              e.stopPropagation();
              quill.history.redo();
            } else {
              e.preventDefault();
              e.stopPropagation();
              quill.history.undo();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isFocused]);

  // Update current format when selection changes
  useEffect(() => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    
    const updateFormat = () => {
      const format = quill.getFormat();
      setCurrentFormat(format);
    };

    quill.on('selection-change', updateFormat);
    quill.on('text-change', updateFormat);
    
    return () => {
      quill.off('selection-change', updateFormat);
      quill.off('text-change', updateFormat);
    };
  }, []);

  const insertEmoji = (emoji) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    if (range) {
      quill.insertText(range.index, emoji.native);
      quill.setSelection(range.index + emoji.native.length);
    }
    setShowEmojiPicker(false);
    quill.focus();
  };

  const insertLink = () => {
    if (!linkUrl || !linkText || !quillRef.current) return;
    
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection(true);
    
    if (range) {
      // Insert the link text first
      quill.insertText(range.index, linkText);
      // Then format it as a link
      quill.formatText(range.index, linkText.length, 'link', linkUrl);
      quill.setSelection(range.index + linkText.length);
    }
    
    setShowLinkDialog(false);
    setLinkUrl('');
    setLinkText('');
    quill.focus();
  };

  // File upload handler
  const handleFileUpload = async (file) => {
    if (!file) return;
    
    setIsUploading(true);
    
    try {
      // Convert file to base64 for demo purposes
      // In production, you'd upload to your server/cloud storage
      const reader = new FileReader();
      reader.onload = (e) => {
        const imageDataUrl = e.target.result;
        
        if (quillRef.current) {
          const quill = quillRef.current.getEditor();
          const range = quill.getSelection(true);
          
          if (range) {
            quill.insertEmbed(range.index, 'image', imageDataUrl);
            quill.setSelection(range.index + 1);
          }
        }
        
        setIsUploading(false);
        setShowImageDialog(false);
        setImageFile(null);
        
        if (quillRef.current) {
          quillRef.current.getEditor().focus();
        }
      };
      
      reader.onerror = () => {
        setIsUploading(false);
        alert('Error uploading file. Please try again.');
      };
      
      reader.readAsDataURL(file);
    } catch (error) {
      setIsUploading(false);
      alert('Error uploading file. Please try again.');
    }
  };

  const insertImage = () => {
    if (uploadMode === 'file' && imageFile) {
      handleFileUpload(imageFile);
    } else if (uploadMode === 'url' && imageUrl) {
      if (!quillRef.current) return;
      
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection(true);
      
      if (range) {
        quill.insertEmbed(range.index, 'image', imageUrl);
        quill.setSelection(range.index + 1);
      }
      
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
      quill.focus();
    }
  };

  const formatText = (format, value = true) => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    const currentFormat = quill.getFormat();
    
    if (format === 'header') {
      // Toggle header - if already this header level, remove it
      const newValue = currentFormat.header === value ? false : value;
      quill.format('header', newValue);
    } else if (format === 'list') {
      // Toggle list - if already this list type, remove it
      const newValue = currentFormat.list === value ? false : value;
      quill.format('list', newValue);
    } else if (format === 'align') {
      // Toggle alignment - if already this alignment, set to left (default)
      const newValue = currentFormat.align === value ? false : value;
      quill.format('align', newValue);
    } else {
      // Toggle boolean formats (bold, italic, underline, etc.)
      quill.format(format, !currentFormat[format]);
    }
    
    quill.focus();
  };

  const handleUndo = () => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    quill.history.undo();
    quill.focus();
  };

  const handleRedo = () => {
    if (!quillRef.current) return;
    const quill = quillRef.current.getEditor();
    quill.history.redo();
    quill.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = (e) => {
    // Only set unfocused if we're not focusing on a dialog or toolbar element
    if (!e.relatedTarget || (!e.relatedTarget.closest('.floating-toolbar') && 
        !e.relatedTarget.closest('.dialog') && 
        !e.relatedTarget.closest('.emoji-picker-container'))) {
      setIsFocused(false);
    }
  };

  // Enhanced Quill modules with proper toolbar configuration
  const modules = React.useMemo(() => ({
    toolbar: false, // We're using custom toolbar
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  }), []);

  const formats = React.useMemo(() => [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'image',
    'blockquote', 'code-block', 'code'
  ], []);

  // Memoized change handler to prevent unnecessary re-renders
  const handleChange = useCallback((content) => {
    if (onChange) {
      onChange(content);
    }
  }, [onChange]);

  // Enhanced CSS with better z-index management and positioning
  const quillStyles = `
    .rich-text-editor {
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      width: 100%;
      max-width: 100%;
      z-index: 1;
    }
    
    /* Desktop and Tablet Toolbar */
    .floating-toolbar {
      position: sticky;
      top: 0;
      z-index: 100;
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px 12px 0 0;
      padding: 12px 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }
    
    .floating-toolbar:hover {
      background: rgba(0, 0, 0, 0.98);
      border-color: rgba(255, 255, 255, 0.15);
    }
    
    .toolbar-content {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    .toolbar-row {
      display: flex;
      align-items: center;
      gap: 8px;
      flex-wrap: wrap;
    }
    
    /* Mobile Toolbar Styles */
    @media (max-width: 768px) {
      .floating-toolbar {
        padding: 8px 12px;
        border-radius: 8px 8px 0 0;
        z-index: 200;
      }
      
      .toolbar-content {
        flex-direction: column;
        gap: 8px;
        align-items: stretch;
      }
      
      .toolbar-row {
        justify-content: center;
        gap: 4px;
        min-height: 40px;
      }
      
      .toolbar-row.mobile-row-1 {
        order: 1;
      }
      
      .toolbar-row.mobile-row-2 {
        order: 2;
      }
    }
    
    /* Extra small mobile devices */
    @media (max-width: 480px) {
      .floating-toolbar {
        padding: 6px 8px;
        z-index: 300;
      }
      
      .toolbar-row {
        gap: 2px;
        min-height: 36px;
      }
    }
    
    .ql-container {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: none;
      border-radius: 0 0 12px 12px;
      min-height: 200px;
      transition: all 0.3s ease;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
      position: relative;
      z-index: 1;
    }
    
    @media (max-width: 768px) {
      .ql-container {
        min-height: 150px;
        border-radius: 0 0 8px 8px;
      }
    }
    
    .ql-container:hover {
      background: rgba(255, 255, 255, 0.05);
      border-color: rgba(255, 255, 255, 0.12);
    }
    
    .ql-editor {
      color: white;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 15px;
      line-height: 1.7;
      padding: 16px 20px;
      transition: all 0.2s ease;
      width: 100%;
      max-width: 100%;
      box-sizing: border-box;
    }
    
    @media (max-width: 768px) {
      .ql-editor {
        font-size: 14px;
        padding: 12px 16px;
        line-height: 1.6;
      }
    }
    
    @media (max-width: 480px) {
      .ql-editor {
        font-size: 13px;
        padding: 10px 12px;
      }
    }
    
    .ql-editor:focus {
      outline: none;
    }
    
    .ql-editor.ql-blank::before {
      color: rgba(255, 255, 255, 0.4);
      font-style: italic;
      font-size: 15px;
      left: 20px;
      top: 16px;
    }
    
    @media (max-width: 768px) {
      .ql-editor.ql-blank::before {
        font-size: 14px;
        left: 16px;
        top: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .ql-editor.ql-blank::before {
        font-size: 13px;
        left: 12px;
        top: 10px;
      }
    }
    
    .ql-editor a {
      color: #9b87f5;
      text-decoration: underline;
      transition: color 0.2s ease;
    }
    
    .ql-editor a:hover {
      color: #8b7ae5;
    }
    
    .ql-editor img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 8px 0;
    }
    
    .ql-editor ul, .ql-editor ol {
      padding-left: 24px;
      margin: 12px 0;
    }
    
    @media (max-width: 768px) {
      .ql-editor ul, .ql-editor ol {
        padding-left: 20px;
        margin: 10px 0;
      }
    }
    
    .ql-editor li {
      margin-bottom: 6px;
    }
    
    .ql-editor h1, .ql-editor h2, .ql-editor h3 {
      color: white;
      margin: 20px 0 12px 0;
      font-weight: 600;
      line-height: 1.3;
    }
    
    .ql-editor h1 {
      font-size: 28px;
    }
    
    .ql-editor h2 {
      font-size: 24px;
    }
    
    .ql-editor h3 {
      font-size: 20px;
    }
    
    @media (max-width: 768px) {
      .ql-editor h1 {
        font-size: 24px;
      }
      
      .ql-editor h2 {
        font-size: 20px;
      }
      
      .ql-editor h3 {
        font-size: 18px;
      }
    }
    
    .ql-editor p {
      margin-bottom: 16px;
    }
    
    .ql-editor blockquote {
      border-left: 4px solid #9b87f5;
      padding: 12px 20px;
      margin: 20px 0;
      font-style: italic;
      color: rgba(255, 255, 255, 0.8);
      background: rgba(155, 135, 245, 0.05);
      border-radius: 0 8px 8px 0;
    }
    
    @media (max-width: 768px) {
      .ql-editor blockquote {
        padding: 10px 16px;
        margin: 16px 0;
      }
    }
    
    .ql-editor code {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
      color: #fbbf24;
    }
    
    @media (max-width: 768px) {
      .ql-editor code {
        font-size: 12px;
        padding: 1px 4px;
      }
    }
    
    .ql-editor pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
      border-left: 4px solid #9b87f5;
    }
    
    .ql-editor pre code {
      background: transparent;
      padding: 0;
      color: #e5e7eb;
    }
    
    @media (max-width: 768px) {
      .ql-editor pre {
        padding: 12px;
        margin: 12px 0;
        font-size: 12px;
      }
    }
    
    /* Toolbar groups */
    .toolbar-group {
      display: flex;
      align-items: center;
      gap: 2px;
      padding: 4px;
      border-radius: 8px;
      background: rgba(255, 255, 255, 0.03);
      transition: background 0.2s ease;
    }
    
    @media (max-width: 768px) {
      .toolbar-group {
        gap: 1px;
        padding: 2px;
        border-radius: 6px;
      }
    }
    
    .toolbar-group:hover {
      background: rgba(255, 255, 255, 0.08);
    }
    
    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 8px;
    }
    
    @media (max-width: 768px) {
      .toolbar-divider {
        display: none;
      }
    }
    
    /* Button styles */
    .toolbar-button {
      position: relative;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      color: rgba(255, 255, 255, 0.7);
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-size: 14px;
    }
    
    @media (max-width: 768px) {
      .toolbar-button {
        width: 28px;
        height: 28px;
        border-radius: 4px;
        font-size: 12px;
      }
    }
    
    @media (max-width: 480px) {
      .toolbar-button {
        width: 24px;
        height: 24px;
        font-size: 11px;
      }
    }
    
    .toolbar-button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }
    
    @media (max-width: 768px) {
      .toolbar-button:hover {
        transform: none;
      }
    }
    
    .toolbar-button.active {
      color: #9b87f5;
      background: rgba(155, 135, 245, 0.2);
      box-shadow: 0 0 0 1px rgba(155, 135, 245, 0.3);
    }
    
    .toolbar-button:active {
      transform: translateY(0);
    }
    
    /* Tooltip */
    .tooltip {
      position: absolute;
      bottom: -40px;
      left: 50%;
      transform: translateX(-50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 6px 10px;
      border-radius: 6px;
      font-size: 12px;
      white-space: nowrap;
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.2s ease;
      z-index: 1000;
    }
    
    @media (max-width: 768px) {
      .tooltip {
        display: none;
      }
    }
    
    .tooltip.show {
      opacity: 1;
    }
    
    /* Dialog styles */
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 16px;
    }
    
    .dialog {
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 16px;
      padding: 24px;
      min-width: 400px;
      max-width: 90vw;
      width: 100%;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
      position: relative;
      max-height: 90vh;
      overflow-y: auto;
    }
    
    @media (max-width: 768px) {
      .dialog {
        min-width: 0;
        padding: 20px;
        border-radius: 12px;
        max-height: 85vh;
      }
    }
    
    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
      padding-bottom: 12px;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    .dialog-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }
    
    @media (max-width: 768px) {
      .dialog-title {
        font-size: 16px;
      }
    }
    
    .dialog-close {
      color: rgba(255, 255, 255, 0.7);
      hover: rgba(255, 255, 255, 1);
      transition: color 0.2s ease;
    }
    
    .dialog-content {
      margin-bottom: 20px;
    }
    
    .dialog-tabs {
      display: flex;
      gap: 8px;
      margin-bottom: 16px;
    }
    
    .dialog-tab {
      padding: 8px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 8px;
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: all 0.2s ease;
      font-size: 14px;
    }
    
    .dialog-tab.active {
      background: rgba(155, 135, 245, 0.2);
      border-color: rgba(155, 135, 245, 0.3);
      color: #9b87f5;
    }
    
    .dialog-tab:hover:not(.active) {
      background: rgba(255, 255, 255, 0.1);
      color: white;
    }
    
    .dialog-input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.15);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
      box-sizing: border-box;
    }
    
    @media (max-width: 768px) {
      .dialog-input {
        padding: 10px 12px;
        font-size: 13px;
      }
    }
    
    .dialog-input:focus {
      outline: none;
      border-color: #9b87f5;
      background: rgba(255, 255, 255, 0.1);
      box-shadow: 0 0 0 2px rgba(155, 135, 245, 0.2);
    }
    
    .dialog-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }
    
    .file-upload-area {
      border: 2px dashed rgba(255, 255, 255, 0.3);
      border-radius: 8px;
      padding: 20px;
      text-align: center;
      cursor: pointer;
      transition: all 0.2s ease;
      margin-bottom: 12px;
    }
    
    .file-upload-area:hover {
      border-color: #9b87f5;
      background: rgba(155, 135, 245, 0.05);
    }
    
    .file-upload-area.dragover {
      border-color: #9b87f5;
      background: rgba(155, 135, 245, 0.1);
    }
    
    .file-upload-text {
      color: rgba(255, 255, 255, 0.7);
      font-size: 14px;
      margin-top: 8px;
    }
    
    .file-info {
      background: rgba(155, 135, 245, 0.1);
      border: 1px solid rgba(155, 135, 245, 0.3);
      border-radius: 8px;
      padding: 12px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      gap: 8px;
    }
    
    .file-info-text {
      color: white;
      font-size: 14px;
      flex: 1;
    }
    
    .file-remove {
      color: rgba(255, 255, 255, 0.7);
      cursor: pointer;
      transition: color 0.2s ease;
    }
    
    .file-remove:hover {
      color: #ef4444;
    }
    
    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
      padding-top: 16px;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
    }
    
    @media (max-width: 768px) {
      .dialog-actions {
        gap: 8px;
        flex-direction: column-reverse;
      }
    }
    
    .loading-spinner {
      display: inline-block;
      width: 16px;
      height: 16px;
      border: 2px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: white;
      animation: spin 1s ease-in-out infinite;
    }
    
    @keyframes spin {
      to { transform: rotate(360deg); }
    }
    
    /* Emoji picker positioning */
    .emoji-picker-container {
      position: absolute;
      z-index: 1500;
      top: 100%;
      left: 0;
      margin-top: 8px;
    }
    
    @media (max-width: 768px) {
      .emoji-picker-container {
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        margin-top: 0;
        z-index: 1800;
      }
    }
    
    /* Custom emoji-mart theme */
    .emoji-mart {
      background: rgba(0, 0, 0, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
    }
    
    @media (max-width: 768px) {
      .emoji-mart {
        max-width: 90vw !important;
        max-height: 80vh !important;
        border-radius: 8px !important;
      }
    }
    
    .emoji-mart * {
      color: white !important;
    }
    
    .emoji-mart-search input {
      background: rgba(255, 255, 255, 0.1) !important;
      border: 1px solid rgba(255, 255, 255, 0.2) !important;
      color: white !important;
      border-radius: 8px !important;
    }
    
    .emoji-mart-search input::placeholder {
      color: rgba(255, 255, 255, 0.5) !important;
    }
    
    .emoji-mart-category-label {
      background: rgba(155, 135, 245, 0.1) !important;
    }
    
    .emoji-mart-scroll {
      background: transparent !important;
    }
    
    .emoji-mart-preview {
      background: rgba(155, 135, 245, 0.1) !important;
    }
    
    /* Character count */
    .character-count {
      position: absolute;
      bottom: 8px;
      right: 12px;
      color: rgba(255, 255, 255, 0.5);
      font-size: 12px;
      pointer-events: none;
      z-index: 10;
    }
    
    @media (max-width: 768px) {
      .character-count {
        bottom: 6px;
        right: 10px;
        font-size: 11px;
      }
    }
    
    /* Focus indicator */
    .editor-focused .ql-container {
      border-color: rgba(155, 135, 245, 0.3);
      box-shadow: 0 0 0 2px rgba(155, 135, 245, 0.1);
    }
    
    /* Loading state */
    .ql-container.loading {
      opacity: 0.7;
      pointer-events: none;
    }
  `;

  const characterCount = value.replace(/<[^>]*>/g, '').length;

  // Close dialogs on escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') {
        setShowEmojiPicker(false);
        setShowLinkDialog(false);
        setShowImageDialog(false);
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, []);

  // Cleanup console overrides on unmount
  useEffect(() => {
    return () => {
      console.error = originalError;
      console.warn = originalWarn;
    };
  }, []);

  // Handle file drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('dragover');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        setUploadMode('file');
      }
    }
  };

  return (
    <div className={`rich-text-editor ${className} ${isFocused ? 'editor-focused' : ''}`} ref={editorContainerRef}>
      <style dangerouslySetInnerHTML={{ __html: quillStyles }} />
      
      {/* Mobile-Optimized Floating Toolbar */}
      <div className="floating-toolbar">
        <div className="toolbar-content">
          {/* Row 1: Essential Formatting - Mobile */}
          <div className="toolbar-row mobile-row-1">
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.bold ? 'active' : ''}`}
                onClick={() => formatText('bold')}
                onMouseEnter={() => setShowTooltip('bold')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Bold (Ctrl+B)"
                type="button"
              >
                <Bold size={16} />
                {showTooltip === 'bold' && <div className="tooltip show">Bold (Ctrl+B)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.italic ? 'active' : ''}`}
                onClick={() => formatText('italic')}
                onMouseEnter={() => setShowTooltip('italic')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Italic (Ctrl+I)"
                type="button"
              >
                <Italic size={16} />
                {showTooltip === 'italic' && <div className="tooltip show">Italic (Ctrl+I)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.underline ? 'active' : ''}`}
                onClick={() => formatText('underline')}
                onMouseEnter={() => setShowTooltip('underline')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Underline (Ctrl+U)"
                type="button"
              >
                <Underline size={16} />
                {showTooltip === 'underline' && <div className="tooltip show">Underline (Ctrl+U)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.list === 'bullet' ? 'active' : ''}`}
                onClick={() => formatText('list', 'bullet')}
                onMouseEnter={() => setShowTooltip('bullet')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Bullet List"
                type="button"
              >
                <List size={16} />
                {showTooltip === 'bullet' && <div className="tooltip show">Bullet List</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.list === 'ordered' ? 'active' : ''}`}
                onClick={() => formatText('list', 'ordered')}
                onMouseEnter={() => setShowTooltip('ordered')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Numbered List"
                type="button"
              >
                <ListOrdered size={16} />
                {showTooltip === 'ordered' && <div className="tooltip show">Numbered List</div>}
              </button>
            </div>
            
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.header === 1 ? 'active' : ''}`}
                onClick={() => formatText('header', 1)}
                onMouseEnter={() => setShowTooltip('h1')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Heading 1"
                type="button"
              >
                <Heading1 size={16} />
                {showTooltip === 'h1' && <div className="tooltip show">Heading 1</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.header === 2 ? 'active' : ''}`}
                onClick={() => formatText('header', 2)}
                onMouseEnter={() => setShowTooltip('h2')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Heading 2"
                type="button"
              >
                <Heading2 size={16} />
                {showTooltip === 'h2' && <div className="tooltip show">Heading 2</div>}
              </button>
            </div>
          </div>

          {/* Row 2: Advanced Tools - Mobile */}
          <div className="toolbar-row mobile-row-2">
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.align === 'left' || !currentFormat.align ? 'active' : ''}`}
                onClick={() => formatText('align', 'left')}
                onMouseEnter={() => setShowTooltip('left')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Align Left"
                type="button"
              >
                <AlignLeft size={16} />
                {showTooltip === 'left' && <div className="tooltip show">Align Left</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.align === 'center' ? 'active' : ''}`}
                onClick={() => formatText('align', 'center')}
                onMouseEnter={() => setShowTooltip('center')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Align Center"
                type="button"
              >
                <AlignCenter size={16} />
                {showTooltip === 'center' && <div className="tooltip show">Align Center</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowLinkDialog(true)}
                onMouseEnter={() => setShowTooltip('link')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Insert Link (Ctrl+K)"
                type="button"
              >
                <Link size={16} />
                {showTooltip === 'link' && <div className="tooltip show">Insert Link (Ctrl+K)</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowImageDialog(true)}
                onMouseEnter={() => setShowTooltip('image')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Insert Image"
                type="button"
              >
                <Image size={16} />
                {showTooltip === 'image' && <div className="tooltip show">Insert Image</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                onMouseEnter={() => setShowTooltip('emoji')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Insert Emoji"
                type="button"
              >
                <Smile size={16} />
                {showTooltip === 'emoji' && <div className="tooltip show">Insert Emoji</div>}
              </button>
            </div>
            
            <div className="toolbar-group">
              <button
                className="toolbar-button"
                onClick={handleUndo}
                onMouseEnter={() => setShowTooltip('undo')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Undo (Ctrl+Z)"
                type="button"
              >
                <Undo size={16} />
                {showTooltip === 'undo' && <div className="tooltip show">Undo (Ctrl+Z)</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={handleRedo}
                onMouseEnter={() => setShowTooltip('redo')}
                onMouseLeave={() => setShowTooltip(null)}
                title="Redo (Ctrl+Shift+Z)"
                type="button"
              >
                <Redo size={16} />
                {showTooltip === 'redo' && <div className="tooltip show">Redo (Ctrl+Shift+Z)</div>}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={handleChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
        preserveWhitespace={false}
        style={{
          backgroundColor: 'transparent',
        }}
      />

      {/* Character Count */}
      <div className="character-count">
        {characterCount} characters
      </div>

      {/* Emoji Picker */}
      {showEmojiPicker && (
        <div className="emoji-picker-container">
          <Picker
            data={data}
            onEmojiSelect={insertEmoji}
            theme="dark"
            set="native"
            previewPosition="none"
            skinTonePosition="none"
            maxFrequentRows={0}
            locale="en"
          />
        </div>
      )}

      {/* Link Dialog */}
      {showLinkDialog && (
        <div className="dialog-overlay" onClick={() => setShowLinkDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title">Insert Link</div>
              <button
                className="toolbar-button dialog-close"
                onClick={() => setShowLinkDialog(false)}
                title="Close"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            <div className="dialog-content">
              <input
                ref={linkInputRef}
                type="text"
                placeholder="Link text (e.g., Click here)"
                value={linkText}
                onChange={(e) => setLinkText(e.target.value)}
                className="dialog-input"
                autoFocus
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkText && linkUrl) {
                    insertLink();
                  }
                }}
              />
              <input
                type="url"
                placeholder="URL (e.g., https://example.com)"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                className="dialog-input"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && linkText && linkUrl) {
                    insertLink();
                  }
                }}
              />
            </div>
            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                className="border-white/20 text-white hover:bg-white/10"
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={insertLink}
                disabled={!linkText || !linkUrl}
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                Insert Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Image Dialog */}
      {showImageDialog && (
        <div className="dialog-overlay" onClick={() => setShowImageDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title">Insert Image</div>
              <button
                className="toolbar-button dialog-close"
                onClick={() => setShowImageDialog(false)}
                title="Close"
                type="button"
              >
                <X size={16} />
              </button>
            </div>
            
            <div className="dialog-content">
              {/* Upload Mode Tabs */}
              <div className="dialog-tabs">
                <button
                  className={`dialog-tab ${uploadMode === 'url' ? 'active' : ''}`}
                  onClick={() => setUploadMode('url')}
                  type="button"
                >
                  <Link size={14} style={{ marginRight: '6px' }} />
                  From URL
                </button>
                <button
                  className={`dialog-tab ${uploadMode === 'file' ? 'active' : ''}`}
                  onClick={() => setUploadMode('file')}
                  type="button"
                >
                  <Upload size={14} style={{ marginRight: '6px' }} />
                  Upload File
                </button>
              </div>

              {/* URL Mode */}
              {uploadMode === 'url' && (
                <>
                  <input
                    ref={imageInputRef}
                    type="url"
                    placeholder="Image URL (e.g., https://example.com/image.jpg)"
                    value={imageUrl}
                    onChange={(e) => setImageUrl(e.target.value)}
                    className="dialog-input"
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && imageUrl) {
                        insertImage();
                      }
                    }}
                  />
                  <input
                    type="text"
                    placeholder="Alt text (optional, for accessibility)"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="dialog-input"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && imageUrl) {
                        insertImage();
                      }
                    }}
                  />
                </>
              )}

              {/* File Upload Mode */}
              {uploadMode === 'file' && (
                <>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        setImageFile(file);
                      }
                    }}
                    style={{ display: 'none' }}
                  />
                  
                  {!imageFile ? (
                    <div
                      className="file-upload-area"
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={handleDragOver}
                      onDragLeave={handleDragLeave}
                      onDrop={handleDrop}
                    >
                      <Upload size={32} style={{ color: 'rgba(255, 255, 255, 0.7)', margin: '0 auto' }} />
                      <div className="file-upload-text">
                        Click to select an image or drag & drop
                      </div>
                      <div style={{ fontSize: '12px', color: 'rgba(255, 255, 255, 0.5)', marginTop: '4px' }}>
                        Supports: JPG, PNG, GIF, WebP (Max 10MB)
                      </div>
                    </div>
                  ) : (
                    <div className="file-info">
                      <Image size={20} style={{ color: '#9b87f5' }} />
                      <div className="file-info-text">
                        {imageFile.name} ({(imageFile.size / 1024 / 1024).toFixed(2)} MB)
                      </div>
                      <button
                        className="file-remove"
                        onClick={() => setImageFile(null)}
                        title="Remove file"
                        type="button"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  )}
                  
                  <input
                    type="text"
                    placeholder="Alt text (optional, for accessibility)"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="dialog-input"
                  />
                </>
              )}
            </div>

            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => {
                  setShowImageDialog(false);
                  setImageFile(null);
                  setImageUrl('');
                  setImageAlt('');
                }}
                className="border-white/20 text-white hover:bg-white/10"
                type="button"
              >
                Cancel
              </Button>
              <Button
                onClick={insertImage}
                disabled={
                  isUploading || 
                  (uploadMode === 'url' && !imageUrl) || 
                  (uploadMode === 'file' && !imageFile)
                }
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white disabled:opacity-50 disabled:cursor-not-allowed"
                type="button"
              >
                {isUploading ? (
                  <>
                    <span className="loading-spinner" style={{ marginRight: '8px' }}></span>
                    Uploading...
                  </>
                ) : (
                  'Insert Image'
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Click outside to close emoji picker */}
      {showEmojiPicker && (
        <div
          className="fixed inset-0 z-40"
          onClick={(e) => {
            if (!e.target.closest('.emoji-picker-container') && 
                !e.target.closest('.ql-editor') &&
                !e.target.closest('[title="Insert Emoji"]')) {
              setShowEmojiPicker(false);
            }
          }}
        />
      )}
    </div>
  );
};

export { RichTextEditor };