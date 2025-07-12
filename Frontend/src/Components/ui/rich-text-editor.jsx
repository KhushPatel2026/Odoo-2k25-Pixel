import React, { useState, useRef, useEffect } from 'react';
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
  const [isFocused, setIsFocused] = useState(false);
  const [currentFormat, setCurrentFormat] = useState({});
  const [showTooltip, setShowTooltip] = useState(null);
  
  const quillRef = useRef(null);
  const editorContainerRef = useRef(null);
  const linkInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!quillRef.current) return;
      const quill = quillRef.current.getEditor();
      
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'b':
            e.preventDefault();
            quill.format('bold', !quill.getFormat().bold);
            break;
          case 'i':
            e.preventDefault();
            quill.format('italic', !quill.getFormat().italic);
            break;
          case 'u':
            e.preventDefault();
            quill.format('underline', !quill.getFormat().underline);
            break;
          case 'k':
            e.preventDefault();
            setShowLinkDialog(true);
            break;
          case 'z':
            if (e.shiftKey) {
              e.preventDefault();
              quill.history.redo();
            } else {
              e.preventDefault();
              quill.history.undo();
            }
            break;
        }
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

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
    const quill = quillRef.current.getEditor();
    const range = quill.getSelection();
    if (range) {
      quill.insertText(range.index, emoji.native);
    }
    setShowEmojiPicker(false);
    quill.focus();
  };

  const insertLink = () => {
    if (linkUrl && linkText) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'link', {
          href: linkUrl,
          text: linkText
        });
      }
      setShowLinkDialog(false);
      setLinkUrl('');
      setLinkText('');
      quill.focus();
    }
  };

  const insertImage = () => {
    if (imageUrl) {
      const quill = quillRef.current.getEditor();
      const range = quill.getSelection();
      if (range) {
        quill.insertEmbed(range.index, 'image', {
          src: imageUrl,
          alt: imageAlt
        });
      }
      setShowImageDialog(false);
      setImageUrl('');
      setImageAlt('');
      quill.focus();
    }
  };

  const formatText = (format, value = true) => {
    const quill = quillRef.current.getEditor();
    quill.format(format, value);
    quill.focus();
  };

  const handleFocus = () => {
    setIsFocused(true);
  };

  const handleBlur = () => {
    setIsFocused(false);
  };

  // Quill modules
  const modules = {
    toolbar: false,
    clipboard: {
      matchVisual: false,
    },
    history: {
      delay: 2000,
      maxStack: 500,
      userOnly: true
    }
  };

  const formats = [
    'header', 'bold', 'italic', 'underline', 'strike',
    'list', 'bullet', 'align', 'link', 'image',
    'blockquote', 'code-block'
  ];

  // Advanced CSS with professional UX
  const quillStyles = `
    .rich-text-editor {
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .rich-text-editor:focus-within {
      transform: translateY(-2px);
    }

    .ql-container {
      background: rgba(255, 255, 255, 0.03);
      backdrop-filter: blur(12px);
      border: 1px solid rgba(255, 255, 255, 0.08);
      border-top: none;
      border-radius: 0 0 12px 12px;
      min-height: 200px;
      transition: all 0.3s ease;
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
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    }

    .ql-editor ul, .ql-editor ol {
      padding-left: 24px;
      margin: 12px 0;
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

    .ql-editor code {
      background: rgba(255, 255, 255, 0.1);
      padding: 2px 6px;
      border-radius: 4px;
      font-family: 'Monaco', 'Menlo', monospace;
      font-size: 14px;
    }

    .ql-editor pre {
      background: rgba(0, 0, 0, 0.3);
      padding: 16px;
      border-radius: 8px;
      overflow-x: auto;
      margin: 16px 0;
    }

    /* Floating toolbar */
    .floating-toolbar {
      position: sticky;
      top: 0;
      z-index: 10;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px 12px 0 0;
      padding: 12px 16px;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    }

    .floating-toolbar:hover {
      background: rgba(0, 0, 0, 0.9);
      border-color: rgba(255, 255, 255, 0.15);
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

    .toolbar-group:hover {
      background: rgba(255, 255, 255, 0.08);
    }

    .toolbar-divider {
      width: 1px;
      height: 24px;
      background: rgba(255, 255, 255, 0.1);
      margin: 0 8px;
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

    .toolbar-button:hover {
      color: white;
      background: rgba(255, 255, 255, 0.1);
      transform: translateY(-1px);
    }

    .toolbar-button.active {
      color: #9b87f5;
      background: rgba(155, 135, 245, 0.2);
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

    .tooltip.show {
      opacity: 1;
    }

    /* Dialog styles */
    .dialog-overlay {
      position: fixed;
      inset: 0;
      background: rgba(0, 0, 0, 0.8);
      backdrop-filter: blur(8px);
      z-index: 1000;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .dialog {
      background: rgba(0, 0, 0, 0.95);
      backdrop-filter: blur(20px);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 12px;
      padding: 24px;
      min-width: 400px;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5);
    }

    .dialog-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 20px;
    }

    .dialog-title {
      color: white;
      font-size: 18px;
      font-weight: 600;
    }

    .dialog-input {
      width: 100%;
      padding: 12px 16px;
      background: rgba(255, 255, 255, 0.1);
      border: 1px solid rgba(255, 255, 255, 0.2);
      border-radius: 8px;
      color: white;
      font-size: 14px;
      margin-bottom: 12px;
      transition: all 0.2s ease;
    }

    .dialog-input:focus {
      outline: none;
      border-color: #9b87f5;
      background: rgba(255, 255, 255, 0.15);
    }

    .dialog-input::placeholder {
      color: rgba(255, 255, 255, 0.5);
    }

    .dialog-actions {
      display: flex;
      gap: 12px;
      justify-content: flex-end;
      margin-top: 20px;
    }

    /* Emoji picker positioning */
    .emoji-picker-container {
      position: absolute;
      z-index: 1000;
      top: 100%;
      left: 0;
      margin-top: 8px;
    }

    /* Custom emoji-mart theme */
    .emoji-mart {
      background: rgba(0, 0, 0, 0.95) !important;
      backdrop-filter: blur(20px) !important;
      border: 1px solid rgba(255, 255, 255, 0.1) !important;
      border-radius: 12px !important;
      box-shadow: 0 20px 40px rgba(0, 0, 0, 0.5) !important;
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
    }

    /* Focus indicator */
    .editor-focused .ql-container {
      border-color: rgba(155, 135, 245, 0.3);
      box-shadow: 0 0 0 2px rgba(155, 135, 245, 0.1);
    }
  `;

  const characterCount = value.replace(/<[^>]*>/g, '').length;

  return (
    <div className={`rich-text-editor ${className} ${isFocused ? 'editor-focused' : ''}`} ref={editorContainerRef}>
      <style dangerouslySetInnerHTML={{ __html: quillStyles }} />
      
      {/* Floating Toolbar */}
      <div className="floating-toolbar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {/* Text Formatting */}
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.bold ? 'active' : ''}`}
                onClick={() => formatText('bold')}
                onMouseEnter={() => setShowTooltip('bold')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Bold size={16} />
                {showTooltip === 'bold' && <div className="tooltip">Bold (Ctrl+B)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.italic ? 'active' : ''}`}
                onClick={() => formatText('italic')}
                onMouseEnter={() => setShowTooltip('italic')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Italic size={16} />
                {showTooltip === 'italic' && <div className="tooltip">Italic (Ctrl+I)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.underline ? 'active' : ''}`}
                onClick={() => formatText('underline')}
                onMouseEnter={() => setShowTooltip('underline')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Underline size={16} />
                {showTooltip === 'underline' && <div className="tooltip">Underline (Ctrl+U)</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.strike ? 'active' : ''}`}
                onClick={() => formatText('strike')}
                onMouseEnter={() => setShowTooltip('strike')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Strikethrough size={16} />
                {showTooltip === 'strike' && <div className="tooltip">Strikethrough</div>}
              </button>
            </div>

            <div className="toolbar-divider" />

            {/* Headers */}
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.header === 1 ? 'active' : ''}`}
                onClick={() => formatText('header', 1)}
                onMouseEnter={() => setShowTooltip('h1')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Heading1 size={16} />
                {showTooltip === 'h1' && <div className="tooltip">Heading 1</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.header === 2 ? 'active' : ''}`}
                onClick={() => formatText('header', 2)}
                onMouseEnter={() => setShowTooltip('h2')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Heading2 size={16} />
                {showTooltip === 'h2' && <div className="tooltip">Heading 2</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.header === 3 ? 'active' : ''}`}
                onClick={() => formatText('header', 3)}
                onMouseEnter={() => setShowTooltip('h3')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Heading3 size={16} />
                {showTooltip === 'h3' && <div className="tooltip">Heading 3</div>}
              </button>
            </div>

            <div className="toolbar-divider" />

            {/* Lists */}
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.list === 'bullet' ? 'active' : ''}`}
                onClick={() => formatText('list', 'bullet')}
                onMouseEnter={() => setShowTooltip('bullet')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <List size={16} />
                {showTooltip === 'bullet' && <div className="tooltip">Bullet List</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.list === 'ordered' ? 'active' : ''}`}
                onClick={() => formatText('list', 'ordered')}
                onMouseEnter={() => setShowTooltip('ordered')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <ListOrdered size={16} />
                {showTooltip === 'ordered' && <div className="tooltip">Numbered List</div>}
              </button>
            </div>

            <div className="toolbar-divider" />

            {/* Alignment */}
            <div className="toolbar-group">
              <button
                className={`toolbar-button ${currentFormat.align === 'left' ? 'active' : ''}`}
                onClick={() => formatText('align', 'left')}
                onMouseEnter={() => setShowTooltip('left')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <AlignLeft size={16} />
                {showTooltip === 'left' && <div className="tooltip">Align Left</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.align === 'center' ? 'active' : ''}`}
                onClick={() => formatText('align', 'center')}
                onMouseEnter={() => setShowTooltip('center')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <AlignCenter size={16} />
                {showTooltip === 'center' && <div className="tooltip">Align Center</div>}
              </button>
              <button
                className={`toolbar-button ${currentFormat.align === 'right' ? 'active' : ''}`}
                onClick={() => formatText('align', 'right')}
                onMouseEnter={() => setShowTooltip('right')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <AlignRight size={16} />
                {showTooltip === 'right' && <div className="tooltip">Align Right</div>}
              </button>
            </div>

            <div className="toolbar-divider" />

            {/* Media & Links */}
            <div className="toolbar-group">
              <button
                className="toolbar-button"
                onClick={() => setShowLinkDialog(true)}
                onMouseEnter={() => setShowTooltip('link')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Link size={16} />
                {showTooltip === 'link' && <div className="tooltip">Insert Link (Ctrl+K)</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowImageDialog(true)}
                onMouseEnter={() => setShowTooltip('image')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Image size={16} />
                {showTooltip === 'image' && <div className="tooltip">Insert Image</div>}
              </button>
              <button
                className="toolbar-button"
                onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                onMouseEnter={() => setShowTooltip('emoji')}
                onMouseLeave={() => setShowTooltip(null)}
              >
                <Smile size={16} />
                {showTooltip === 'emoji' && <div className="tooltip">Insert Emoji</div>}
              </button>
            </div>
          </div>

          {/* Undo/Redo */}
          <div className="toolbar-group">
            <button
              className="toolbar-button"
              onClick={() => {
                const quill = quillRef.current.getEditor();
                quill.history.undo();
              }}
              onMouseEnter={() => setShowTooltip('undo')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <Undo size={16} />
              {showTooltip === 'undo' && <div className="tooltip">Undo (Ctrl+Z)</div>}
            </button>
            <button
              className="toolbar-button"
              onClick={() => {
                const quill = quillRef.current.getEditor();
                quill.history.redo();
              }}
              onMouseEnter={() => setShowTooltip('redo')}
              onMouseLeave={() => setShowTooltip(null)}
            >
              <Redo size={16} />
              {showTooltip === 'redo' && <div className="tooltip">Redo (Ctrl+Shift+Z)</div>}
            </button>
          </div>
        </div>
      </div>

      {/* Quill Editor */}
      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={value}
        onChange={onChange}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        onFocus={handleFocus}
        onBlur={handleBlur}
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
                className="toolbar-button"
                onClick={() => setShowLinkDialog(false)}
              >
                <X size={16} />
              </button>
            </div>
            <input
              ref={linkInputRef}
              type="text"
              placeholder="Link text"
              value={linkText}
              onChange={(e) => setLinkText(e.target.value)}
              className="dialog-input"
              autoFocus
            />
            <input
              type="url"
              placeholder="URL"
              value={linkUrl}
              onChange={(e) => setLinkUrl(e.target.value)}
              className="dialog-input"
            />
            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => setShowLinkDialog(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={insertLink}
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white"
              >
                Insert
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Image Dialog */}
      {showImageDialog && (
        <div className="dialog-overlay" onClick={() => setShowImageDialog(false)}>
          <div className="dialog" onClick={(e) => e.stopPropagation()}>
            <div className="dialog-header">
              <div className="dialog-title">Insert Image</div>
              <button
                className="toolbar-button"
                onClick={() => setShowImageDialog(false)}
              >
                <X size={16} />
              </button>
            </div>
            <input
              ref={imageInputRef}
              type="url"
              placeholder="Image URL"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="dialog-input"
              autoFocus
            />
            <input
              type="text"
              placeholder="Alt text (optional)"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="dialog-input"
            />
            <div className="dialog-actions">
              <Button
                variant="outline"
                onClick={() => setShowImageDialog(false)}
                className="border-white/20 text-white hover:bg-white/10"
              >
                Cancel
              </Button>
              <Button
                onClick={insertImage}
                className="bg-[#9b87f5] hover:bg-[#9b87f5]/80 text-white"
              >
                Insert
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
                !e.target.closest('.ql-editor')) {
              setShowEmojiPicker(false);
            }
          }}
        />
      )}
    </div>
  );
};

export { RichTextEditor }; 