"use client";

import React, { useState, useRef, useEffect } from "react";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link as LinkIcon,
  Image as ImageIcon,
  Table as TableIcon,
  Code,
  Minus,
  RotateCcw,
  RotateCw,
  Eye,
  FileCode,
  Edit3,
  Maximize2,
  Minimize2,
  Sparkles,
  Upload,
  Check,
  X,
  Type,
  Palette,
  Highlighter,
} from "lucide-react";

export default function BlogWordEditor({
  initialContent = "",
  onChange,
  onOpenAiGenerator,
}) {
  const editorRef = useRef(null);
  const [activeTab, setActiveTab] = useState("editor"); // "editor" | "preview" | "code"
  const [htmlContent, setHtmlContent] = useState(initialContent || "");
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [stats, setStats] = useState({ words: 0, characters: 0, readTime: "1 min read" });

  const lastSyncHtmlRef = useRef(initialContent || "");
  const isInitializedRef = useRef(false);

  // Modals state
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");

  const [showImageModal, setShowImageModal] = useState(false);
  const [imageUrl, setImageUrl] = useState("");
  const [imageAlt, setImageAlt] = useState("");
  const [imageCaption, setImageCaption] = useState("");
  const [imageUploading, setImageUploading] = useState(false);

  const [showTableModal, setShowTableModal] = useState(false);
  const [tableRows, setTableRows] = useState(3);
  const [tableCols, setTableCols] = useState(3);

  // Callback ref: immediately populates the contentEditable DOM node when it attaches
  const setEditorRef = (node) => {
    editorRef.current = node;
    if (node && !isInitializedRef.current) {
      node.innerHTML = initialContent || "";
      isInitializedRef.current = true;
      lastSyncHtmlRef.current = initialContent || "";
      calculateStats(initialContent || "");
    }
  };

  // Sync initialContent changes from parent (e.g. AI generator, loading another blog post)
  useEffect(() => {
    if (initialContent !== lastSyncHtmlRef.current || !isInitializedRef.current) {
      lastSyncHtmlRef.current = initialContent || "";
      isInitializedRef.current = true;
      setHtmlContent(initialContent || "");
      if (editorRef.current) {
        editorRef.current.innerHTML = initialContent || "";
      }
      calculateStats(initialContent || "");
    }
  }, [initialContent]);

  // Calculate word count and read time
  const calculateStats = (content) => {
    if (!content) {
      setStats({ words: 0, characters: 0, readTime: "1 min read" });
      return;
    }
    const text = content.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
    const words = text ? text.split(/\s+/).filter(Boolean).length : 0;
    const characters = text.length;
    const minutes = Math.ceil(words / 200) || 1;
    setStats({
      words,
      characters,
      readTime: `${minutes} min read`,
    });
  };

  const handleContentChange = () => {
    if (!editorRef.current) return;
    const newHtml = editorRef.current.innerHTML;
    // Guard against accidental empty blur wiping non-empty initial content
    if (!newHtml && lastSyncHtmlRef.current) {
      return;
    }
    lastSyncHtmlRef.current = newHtml;
    setHtmlContent(newHtml);
    calculateStats(newHtml);
    if (onChange) onChange(newHtml);
  };

  const executeCommand = (command, value = null) => {
    if (activeTab !== "editor") {
      setActiveTab("editor");
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          document.execCommand(command, false, value);
          handleContentChange();
        }
      }, 50);
      return;
    }
    if (editorRef.current) {
      editorRef.current.focus();
      document.execCommand(command, false, value);
      handleContentChange();
    }
  };

  // Format block helper (H1, H2, H3, P, Blockquote)
  const formatBlock = (tag) => {
    executeCommand("formatBlock", tag);
  };

  // Insert Custom Elements
  const insertLink = (e) => {
    e.preventDefault();
    if (!linkUrl) return;
    const selectedText = window.getSelection()?.toString() || linkText || linkUrl;
    const anchorHtml = `<a href="${linkUrl}" target="_blank" rel="noopener noreferrer" style="color: #05D4B5; text-decoration: underline; font-weight: 500;">${selectedText}</a>`;
    executeCommand("insertHTML", anchorHtml);
    setShowLinkModal(false);
    setLinkUrl("");
    setLinkText("");
  };

  const insertImage = (url, alt = "", caption = "") => {
    if (!url) return;
    const figureHtml = `
      <figure style="margin: 28px 0; text-align: center;">
        <img src="${url}" alt="${alt || 'Blog illustration'}" style="max-width: 100%; height: auto; border-radius: 8px; box-shadow: 0 4px 20px rgba(0,0,0,0.08); margin: 0 auto; display: block;" />
        ${caption ? `<figcaption style="margin-top: 8px; font-size: 13px; color: #64748b; font-style: italic;">${caption}</figcaption>` : ""}
      </figure>
    `;
    executeCommand("insertHTML", figureHtml);
    setShowImageModal(false);
    setImageUrl("");
    setImageAlt("");
    setImageCaption("");
  };

  // Handle direct image file upload to Cloudinary
  const handleImageFileUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setImageUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/admin/blogs/upload-image", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setImageUrl(data.url);
      } else {
        // Direct Cloudinary client-side fallback
        const cloudName = process.env.REACT_APP_CLOUDINARY_CLOUD_NAME || "dnuucbhwa";
        const uploadPreset = process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET || "closet_rush";
        const cloudFormData = new FormData();
        cloudFormData.append("file", file);
        cloudFormData.append("upload_preset", uploadPreset);

        const directRes = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/upload`, {
          method: "POST",
          body: cloudFormData,
        });

        if (directRes.ok) {
          const directData = await directRes.json();
          setImageUrl(directData.secure_url);
        } else {
          alert("Image upload failed. Please try again.");
        }
      }
    } catch (err) {
      console.error("Cloudinary upload error:", err);
      alert("Error uploading image to Cloudinary: " + err.message);
    } finally {
      setImageUploading(false);
    }
  };

  const insertTable = () => {
    const rows = Math.max(1, parseInt(tableRows, 10));
    const cols = Math.max(1, parseInt(tableCols, 10));

    let tableHtml = `<table style="width: 100%; border-collapse: collapse; margin: 24px 0; font-size: 14px; text-align: left; border: 1px solid #E2E8F0;"><thead><tr style="background-color: #032026; color: #FFFFFF;">`;
    for (let c = 0; c < cols; c++) {
      tableHtml += `<th style="padding: 12px 16px; border: 1px solid #1A4F54;">Header ${c + 1}</th>`;
    }
    tableHtml += `</tr></thead><tbody>`;

    for (let r = 0; r < rows; r++) {
      const bg = r % 2 === 0 ? "#FAF9F6" : "#FFFFFF";
      tableHtml += `<tr style="background-color: ${bg};">`;
      for (let c = 0; c < cols; c++) {
        tableHtml += `<td style="padding: 10px 16px; border: 1px solid #E2E8F0;">Cell ${r + 1},${c + 1}</td>`;
      }
      tableHtml += `</tr>`;
    }
    tableHtml += `</tbody></table><p><br></p>`;

    executeCommand("insertHTML", tableHtml);
    setShowTableModal(false);
  };

  const insertCalloutBox = () => {
    const calloutHtml = `
      <blockquote style="border-left: 4px solid #05D4B5; padding: 16px 20px; background: #F0F6F6; font-style: italic; margin: 24px 0; border-radius: 4px; color: #032026;">
        <strong>Pro Tip:</strong> Enter your key insight or expert recommendation here.
      </blockquote>
      <p><br></p>
    `;
    executeCommand("insertHTML", calloutHtml);
  };

  const handleRawHtmlChange = (e) => {
    const newHtml = e.target.value;
    lastSyncHtmlRef.current = newHtml;
    setHtmlContent(newHtml);
    calculateStats(newHtml);
    if (editorRef.current) {
      editorRef.current.innerHTML = newHtml;
    }
    if (onChange) onChange(newHtml);
  };

  return (
    <div
      className={`flex flex-col bg-white border border-gray-200 rounded-xl shadow-sm overflow-hidden transition-all duration-300 ${
        isFullscreen ? "fixed inset-0 z-50 rounded-none h-screen" : "min-h-[580px]"
      }`}
    >
      {/* WORD PROCESSOR TOP RIBBON BAR */}
      <div className="bg-[#FAF9F6] border-b border-gray-200 px-3 py-2 flex flex-wrap items-center justify-between gap-2 select-none">
        {/* Left Formatting Tools Group */}
        <div className="flex flex-wrap items-center gap-1">
          {/* History Undo / Redo */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("undo")}
              title="Undo (Ctrl+Z)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("redo")}
              title="Redo (Ctrl+Y)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <RotateCw className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block" />

          {/* AI Writer Quick Trigger */}
          {onOpenAiGenerator && (
            <button
              type="button"
              onClick={onOpenAiGenerator}
              className="flex items-center gap-1 px-2.5 py-1 bg-[#032026] hover:bg-[#1A4F54] text-[#05D4B5] text-xs font-bold rounded shadow-2xs transition"
              title="Generate Blog Post with Sarvam AI"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>AI Writer</span>
            </button>
          )}

          {/* Headings & Hierarchy Dropdown */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <select
              onChange={(e) => {
                if (e.target.value) formatBlock(e.target.value);
              }}
              defaultValue="p"
              className="text-xs font-medium text-gray-700 bg-transparent border-none outline-none py-1 px-1.5 cursor-pointer"
            >
              <option value="p">Normal Text</option>
              <option value="h1">Title (Heading 1)</option>
              <option value="h2">Section (Heading 2)</option>
              <option value="h3">Subsection (Heading 3)</option>
              <option value="blockquote">Quote Block</option>
            </select>
          </div>

          {/* Font Size Preset */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <select
              onChange={(e) => {
                if (e.target.value) executeCommand("fontSize", e.target.value);
              }}
              defaultValue="3"
              className="text-xs font-medium text-gray-700 bg-transparent border-none outline-none py-1 px-1.5 cursor-pointer"
            >
              <option value="2">Small (12px)</option>
              <option value="3">Normal (14px)</option>
              <option value="4">Medium (16px)</option>
              <option value="5">Large (18px)</option>
              <option value="6">X-Large (24px)</option>
            </select>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block" />

          {/* Typography Styles */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("bold")}
              title="Bold (Ctrl+B)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black font-bold transition"
            >
              <Bold className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("italic")}
              title="Italic (Ctrl+I)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black italic transition"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("underline")}
              title="Underline (Ctrl+U)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black underline transition"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("strikeThrough")}
              title="Strikethrough"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black line-through transition"
            >
              <Strikethrough className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block" />

          {/* Lists & Quotes */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => executeCommand("insertUnorderedList")}
              title="Bulleted List"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <List className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertOrderedList")}
              title="Numbered List"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <ListOrdered className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={insertCalloutBox}
              title="Insert Pro-Tip Callout Box"
              className="p-1.5 hover:bg-gray-100 rounded text-teal-700 hover:text-black transition flex items-center gap-0.5"
            >
              <Quote className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="h-5 w-px bg-gray-300 mx-1 hidden sm:block" />

          {/* Insert Rich Media Components */}
          <div className="flex items-center bg-white border border-gray-200 rounded-md p-0.5 shadow-2xs">
            <button
              type="button"
              onClick={() => setShowTableModal(true)}
              title="Insert Comparison Table"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <TableIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => setShowImageModal(true)}
              title="Insert Image (Direct Cloudinary Upload)"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <ImageIcon className="w-3.5 h-3.5 text-teal-700" />
            </button>
            <button
              type="button"
              onClick={() => setShowLinkModal(true)}
              title="Insert Link"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <LinkIcon className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => executeCommand("insertHorizontalRule")}
              title="Divider Line"
              className="p-1.5 hover:bg-gray-100 rounded text-gray-700 hover:text-black transition"
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right Tab Switcher & Fullscreen Mode */}
        <div className="flex items-center gap-2">
          {/* Mode Tabs */}
          <div className="flex items-center bg-gray-200/80 p-0.5 rounded-lg text-xs font-semibold">
            <button
              type="button"
              onClick={() => setActiveTab("editor")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                activeTab === "editor"
                  ? "bg-white text-[#032026] shadow-2xs font-bold"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Edit3 className="w-3 h-3" />
              <span>Editor</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("preview")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                activeTab === "preview"
                  ? "bg-white text-[#032026] shadow-2xs font-bold"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <Eye className="w-3 h-3" />
              <span>Preview</span>
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("code")}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-md transition ${
                activeTab === "code"
                  ? "bg-white text-[#032026] shadow-2xs font-bold"
                  : "text-gray-600 hover:text-black"
              }`}
            >
              <FileCode className="w-3 h-3" />
              <span>HTML</span>
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            type="button"
            onClick={() => setIsFullscreen(!isFullscreen)}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen (Distraction Free)"}
            className="p-1.5 bg-white border border-gray-200 rounded-md text-gray-700 hover:text-black hover:bg-gray-100 transition shadow-2xs"
          >
            {isFullscreen ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="flex-1 overflow-y-auto bg-gray-50 flex justify-center p-3 sm:p-6">
        {/* WORD PROCESSOR CANVAS CONTAINER */}
        <div className="w-full max-w-4xl bg-white border border-gray-200 rounded-lg shadow-sm min-h-[500px] flex flex-col">
          {/* TAB 1: WYSIWYG WORD EDITOR */}
          <div
            ref={setEditorRef}
            contentEditable
            onInput={handleContentChange}
            onBlur={handleContentChange}
            suppressContentEditableWarning
            className={`flex-1 p-6 sm:p-10 outline-none font-sans text-gray-900 leading-relaxed word-editor-canvas ${
              activeTab === "editor" ? "block" : "hidden"
            }`}
            style={{
              fontSize: "16px",
              lineHeight: "1.8",
              minHeight: "450px",
            }}
          />

          {/* TAB 2: LIVE READER PREVIEW */}
          <div
            className={`flex-1 p-6 sm:p-10 bg-[#FAF9F6] rounded-lg ${
              activeTab === "preview" ? "block" : "hidden"
            }`}
          >
            <div className="mb-4 pb-3 border-b border-gray-200 flex items-center justify-between text-xs text-gray-500 uppercase tracking-wider font-semibold">
              <span>Live Reader Experience Preview</span>
              <span className="text-[#05D4B5]">ClosetRush Layout</span>
            </div>
            <div
              className="blog-rendered-content max-w-none prose prose-teal"
              dangerouslySetInnerHTML={{
                __html:
                  htmlContent ||
                  "<p class='text-gray-400 italic'>No content yet. Type in the editor or generate an article with the AI Writer.</p>",
              }}
            />
          </div>

          {/* TAB 3: RAW HTML CODE VIEW */}
          <div
            className={`flex-1 p-4 bg-[#0d1518] text-emerald-400 font-mono text-xs rounded-lg flex-col ${
              activeTab === "code" ? "flex" : "hidden"
            }`}
          >
            <div className="text-gray-400 text-[11px] mb-2 font-sans flex items-center justify-between">
              <span>Raw Semantic HTML5 Markup (Edit directly to customize)</span>
              <span>UTF-8</span>
            </div>
            <textarea
              value={htmlContent}
              onChange={handleRawHtmlChange}
              className="w-full flex-1 bg-transparent text-emerald-300 font-mono text-xs leading-5 outline-none resize-none min-h-[420px]"
              spellCheck={false}
            />
          </div>
        </div>
      </div>

      {/* WORD STATUS BAR (AT BOTTOM) */}
      <div className="bg-[#FAF9F6] border-t border-gray-200 px-4 py-2 flex flex-wrap items-center justify-between text-xs text-gray-600 select-none">
        <div className="flex items-center gap-4">
          <span className="font-semibold text-gray-800">
            Words: <strong className="text-[#032026]">{stats.words}</strong>
          </span>
          <span>
            Characters: <strong>{stats.characters}</strong>
          </span>
          <span className="hidden sm:inline bg-teal-50 text-teal-800 border border-teal-200 px-2 py-0.5 rounded text-[11px] font-bold">
            ⏱ {stats.readTime}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[11px] text-gray-500">
          <span className="hidden md:inline">Word 365 Architecture</span>
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500" />
          <span>Ready & Formatted</span>
        </div>
      </div>

      {/* MODAL: INSERT LINK */}
      {showLinkModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-md w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Insert Hyperlink</h3>
              <button
                type="button"
                onClick={() => setShowLinkModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={insertLink} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Target URL</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.closetrush.in/shop"
                  value={linkUrl}
                  onChange={(e) => setLinkUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Display Text (optional)</label>
                <input
                  type="text"
                  placeholder="e.g., View Bedding Plans"
                  value={linkText}
                  onChange={(e) => setLinkText(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLinkModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#032026] text-white rounded-lg text-xs font-bold hover:bg-[#1A4F54] transition"
                >
                  Insert Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: INSERT IMAGE */}
      {showImageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Insert Blog Image</h3>
              <button
                type="button"
                onClick={() => setShowImageModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              {/* Upload option */}
              <div className="border-2 border-dashed border-gray-300 rounded-xl p-4 text-center hover:border-[#05D4B5] transition">
                <Upload className="w-6 h-6 mx-auto text-gray-400 mb-1" />
                <label className="cursor-pointer text-xs font-bold text-[#1A4F54] hover:underline">
                  <span>{imageUploading ? "Uploading image..." : "Upload from Computer"}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageFileUpload}
                    className="sr-only"
                    disabled={imageUploading}
                  />
                </label>
                <p className="text-[11px] text-gray-400 mt-1">PNG, JPG, WEBP up to 5MB</p>
              </div>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-gray-200"></div>
                <span className="flex-shrink mx-3 text-gray-400 text-xs uppercase font-bold">or use image URL</span>
                <div className="flex-grow border-t border-gray-200"></div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Image URL</label>
                <input
                  type="url"
                  placeholder="https://images.unsplash.com/photo-..."
                  value={imageUrl}
                  onChange={(e) => setImageUrl(e.target.value)}
                  className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Alt Text (SEO)</label>
                  <input
                    type="text"
                    placeholder="e.g. Crisp white bedsheets"
                    value={imageAlt}
                    onChange={(e) => setImageAlt(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Caption (optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. 400 TC organic cotton weave"
                    value={imageCaption}
                    onChange={(e) => setImageCaption(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
              </div>

              {imageUrl && (
                <div className="mt-2 text-center">
                  <p className="text-xs text-gray-500 mb-1">Preview:</p>
                  <img
                    src={imageUrl}
                    alt="Preview"
                    className="max-h-32 mx-auto rounded border object-cover"
                  />
                </div>
              )}

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowImageModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!imageUrl}
                  onClick={() => insertImage(imageUrl, imageAlt, imageCaption)}
                  className="px-4 py-2 bg-[#032026] text-white rounded-lg text-xs font-bold hover:bg-[#1A4F54] transition disabled:opacity-50"
                >
                  Insert Image
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: INSERT TABLE */}
      {showTableModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900">Insert Custom Table</h3>
              <button
                type="button"
                onClick={() => setShowTableModal(false)}
                className="text-gray-400 hover:text-gray-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Columns</label>
                  <input
                    type="number"
                    min="1"
                    max="8"
                    value={tableCols}
                    onChange={(e) => setTableCols(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Rows (Body)</label>
                  <input
                    type="number"
                    min="1"
                    max="15"
                    value={tableRows}
                    onChange={(e) => setTableRows(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#05D4B5]"
                  />
                </div>
              </div>
              <p className="text-xs text-gray-500">
                A modern comparison table with dark header and zebra striping will be inserted.
              </p>
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTableModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-lg text-xs font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={insertTable}
                  className="px-4 py-2 bg-[#032026] text-white rounded-lg text-xs font-bold hover:bg-[#1A4F54] transition"
                >
                  Insert Table
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
