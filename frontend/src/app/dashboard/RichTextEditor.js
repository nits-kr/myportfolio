// components/RichTextEditor.jsx
import React, { useState, useEffect, useRef } from "react";
import "./richeditor.css";
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiList,
  FiAlignLeft,
  FiAlignCenter,
  FiAlignRight,
  FiAlignJustify,
  FiLink,
  FiImage,
  FiMinus,
  FiRotateCcw,
  FiRotateCw,
  FiX,
  FiCheck,
  FiTrash2,
  FiCode,
  FiType,
  FiDroplet,
  FiCornerUpLeft,
  FiCornerUpRight,
  FiMoreHorizontal,
} from "react-icons/fi";
import {
  FaStrikethrough,
  FaSubscript,
  FaSuperscript,
  FaHighlighter,
} from "react-icons/fa";

const RichTextEditor = ({ value, onChange, onClose }) => {
  const iframeRef = useRef(null);
  const [viewSource, setViewSource] = useState(false);
  const [sourceCode, setSourceCode] = useState(value || "");
  const [mounted, setMounted] = useState(false);

  // Refs to track state without triggering re-renders or dependency loops
  const lastValueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  const iframeInitializedRef = useRef(false);

  // Keep onChangeRef up to date
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
    return () => setMounted(false);
  }, []);

  // Reset initialization state when switching to source view so it re-inits when switching back
  useEffect(() => {
    if (viewSource) {
      iframeInitializedRef.current = false;
      lastValueRef.current = null;
    }
  }, [viewSource]);

  // Initialize iframe content
  useEffect(() => {
    const iframe = iframeRef.current;
    if (iframe && !viewSource && mounted) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;

      // Only update content if it's the first run or if value changed externally
      // We check against lastValueRef to avoid re-writing what we just typed
      if (!iframeInitializedRef.current || value !== lastValueRef.current) {
        doc.designMode = "on";
        doc.open();
        doc.write(value || "");
        doc.close();

        // Ensure decent default styling for the editable area so it doesn't look broken
        if (!doc.querySelector("style")) {
          const style = doc.createElement("style");
          style.textContent = `
          body { font-family: -apple-system, system-ui, sans-serif; padding: 1rem; color: #333; line-height: 1.5; }
          a { color: #2563eb; text-decoration: underline; }
          ul, ol { margin-left: 20px; }
          img { max-width: 100%; height: auto; }
          blockquote { border-left: 4px solid #ccc; padding-left: 10px; margin-left: 0; color: #666; }
`;
          doc.head.appendChild(style);
        }

        iframeInitializedRef.current = true;
        lastValueRef.current = value;
      }

      const handleInput = () => {
        const content = doc.documentElement.outerHTML;
        lastValueRef.current = content; // Update our tracker
        if (onChangeRef.current) {
          onChangeRef.current(content);
        }
        setSourceCode(content); // Keep sync
      };

      // Always re-attach listeners because cleanup form previous run removes them (or they need to be fresh)
      doc.body.addEventListener("input", handleInput);
      doc.body.addEventListener("keyup", handleInput);
      doc.body.addEventListener("click", handleInput);

      return () => {
        if (doc.body) {
          doc.body.removeEventListener("input", handleInput);
          doc.body.removeEventListener("keyup", handleInput);
          doc.body.removeEventListener("click", handleInput);
        }
      };
    }
  }, [viewSource, mounted, value]); // onChange removed to prevent loop

  const execCmd = (command, value = null) => {
    const iframe = iframeRef.current;
    if (iframe && !viewSource) {
      const doc = iframe.contentDocument || iframe.contentWindow.document;
      doc.execCommand(command, false, value);

      const event = new Event("input", { bubbles: true });
      doc.body.dispatchEvent(event);
      onChange(doc.documentElement.outerHTML);
    }
  };

  const handleSourceChange = (e) => {
    setSourceCode(e.target.value);
    onChange(e.target.value);
  };

  const insertLink = () => {
    const url = prompt("Enter link URL:", "https://");
    if (url) execCmd("createLink", url);
  };

  const insertImage = () => {
    const url = prompt("Enter image URL:", "https://");
    if (url) execCmd("insertImage", url);
  };

  // Use portal to render at body level to avoid z-index/stacking context issues

  if (!mounted) return null;

  // Use ReactDOM.createPortal to render the modal into the body
  const ReactDOM = require("react-dom");

  return ReactDOM.createPortal(
    <div className="rte-overlay">
      <div className="fixed inset-0" onClick={onClose} />

      <div className="rte-modal">
        {/* Header */}
        <div className="rte-header">
          <div className="rte-title-section">
            <div className="rte-icon-box">
              <FiType size={20} />
            </div>
            <div>
              <h3 className="rte-title">Professional Editor</h3>
              <p className="rte-subtitle">Design beautiful, responsive HTML</p>
            </div>
          </div>
          <button onClick={onClose} className="rte-btn">
            <FiX className="w-5 h-5" />
          </button>
        </div>

        {/* Toolbar - Only visible in Design Mode */}
        {!viewSource && (
          <div className="rte-toolbar">
            <div className="rte-toolbar-group">
              <select
                onChange={(e) => execCmd("formatBlock", e.target.value)}
                className="rte-select"
                defaultValue=""
                title="Format"
              >
                <option value="" disabled>
                  Format
                </option>
                <option value="p">Paragraph</option>
                <option value="h1">Heading 1</option>
                <option value="h2">Heading 2</option>
                <option value="h3">Heading 3</option>
                <option value="h4">Heading 4</option>
                <option value="h5">Heading 5</option>
                <option value="h6">Heading 6</option>
                <option value="pre">Code Block</option>
                <option value="blockquote">Quote</option>
              </select>
            </div>

            <div className="rte-toolbar-group">
              <select
                onChange={(e) => execCmd("fontName", e.target.value)}
                className="rte-select"
                defaultValue=""
                title="Font Family"
                style={{ width: "130px" }}
              >
                <option value="" disabled>
                  Font Family
                </option>
                <option value="Arial">Arial</option>
                <option value="Courier New">Courier New</option>
                <option value="Georgia">Georgia</option>
                <option value="Tahoma">Tahoma</option>
                <option value="Times New Roman">Times New Roman</option>
                <option value="Verdana">Verdana</option>
              </select>
            </div>

            <div className="rte-toolbar-group">
              <select
                onChange={(e) => execCmd("fontSize", e.target.value)}
                className="rte-select"
                defaultValue=""
                title="Font Size"
                style={{ width: "70px" }}
              >
                <option value="" disabled>
                  Size
                </option>
                <option value="1">Small</option>
                <option value="2">Normal</option>
                <option value="3">Large</option>
                <option value="4">Huge</option>
                <option value="5">X-Huge</option>
                <option value="6">XX-Huge</option>
                <option value="7">XXX-Huge</option>
              </select>
            </div>

            <div className="rte-toolbar-group">
              <div
                className="rte-color-wrapper hover:bg-gray-200 rounded"
                title="Text Color"
              >
                <FiDroplet size={18} className="text-gray-600" />
                <input
                  type="color"
                  className="rte-color-input"
                  onChange={(e) => execCmd("foreColor", e.target.value)}
                />
              </div>
              <div className="rte-color-wrapper" title="Background Color">
                <FaHighlighter size={16} className="text-gray-600" />
                <input
                  type="color"
                  className="rte-color-input"
                  onChange={(e) => execCmd("hiliteColor", e.target.value)}
                />
              </div>
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<FiBold />}
                onClick={() => execCmd("bold")}
                label="Bold (Ctrl+B)"
              />
              <ToolbarButton
                icon={<FiItalic />}
                onClick={() => execCmd("italic")}
                label="Italic (Ctrl+I)"
              />
              <ToolbarButton
                icon={<FiUnderline />}
                onClick={() => execCmd("underline")}
                label="Underline (Ctrl+U)"
              />
              <ToolbarButton
                icon={<FaStrikethrough />}
                onClick={() => execCmd("strikeThrough")}
                label="Strikethrough"
              />
              <ToolbarButton
                icon={<FaSubscript />}
                onClick={() => execCmd("subscript")}
                label="Subscript"
              />
              <ToolbarButton
                icon={<FaSuperscript />}
                onClick={() => execCmd("superscript")}
                label="Superscript"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<FiAlignLeft />}
                onClick={() => execCmd("justifyLeft")}
                label="Align Left"
              />
              <ToolbarButton
                icon={<FiAlignCenter />}
                onClick={() => execCmd("justifyCenter")}
                label="Align Center"
              />
              <ToolbarButton
                icon={<FiAlignRight />}
                onClick={() => execCmd("justifyRight")}
                label="Align Right"
              />
              <ToolbarButton
                icon={<FiAlignJustify />}
                onClick={() => execCmd("justifyFull")}
                label="Justify"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<FiList />}
                onClick={() => execCmd("insertUnorderedList")}
                label="Bullet List"
              />
              <ToolbarButton
                icon={<FiMoreHorizontal />}
                onClick={() => execCmd("insertOrderedList")}
                label="Numbered List"
              />
              <ToolbarButton
                icon={<FiCornerUpLeft />}
                onClick={() => execCmd("outdent")}
                label="Decrease Indent"
              />
              <ToolbarButton
                icon={<FiCornerUpRight />}
                onClick={() => execCmd("indent")}
                label="Increase Indent"
              />
            </div>

            <div className="rte-toolbar-group">
              <ToolbarButton
                icon={<FiLink />}
                onClick={insertLink}
                label="Insert Link"
              />
              <ToolbarButton
                icon={<FiImage />}
                onClick={insertImage}
                label="Insert Image"
              />
              <ToolbarButton
                icon={<FiMinus />}
                onClick={() => execCmd("insertHorizontalRule")}
                label="Horizontal Line"
              />
            </div>

            <div className="rte-toolbar-group" style={{ borderRight: "none" }}>
              <ToolbarButton
                icon={<FiRotateCcw />}
                onClick={() => execCmd("undo")}
                label="Undo (Ctrl+Z)"
              />
              <ToolbarButton
                icon={<FiRotateCw />}
                onClick={() => execCmd("redo")}
                label="Redo (Ctrl+Y)"
              />
              <ToolbarButton
                icon={<FiTrash2 />}
                onClick={() => execCmd("removeFormat")}
                label="Clear Formatting"
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="rte-content-wrapper">
          {viewSource ? (
            <textarea
              className="rte-source-area"
              value={sourceCode}
              onChange={handleSourceChange}
              spellCheck={false}
            />
          ) : (
            <div className="rte-canvas">
              <iframe
                ref={iframeRef}
                title="wysiwyg-editor"
                style={{ width: "100%", height: "100%", border: "none" }}
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="rte-footer">
          <div className="rte-footer-actions">
            <button
              onClick={() => {
                if (
                  window.confirm("Clear all content? This cannot be undone.")
                ) {
                  if (viewSource) {
                    setSourceCode("");
                    onChange("");
                  } else {
                    const iframe = iframeRef.current;
                    iframe.contentDocument.body.innerHTML = "";
                    onChange("");
                  }
                }
              }}
              className="rte-footer-btn-secondary border-0"
            >
              Clear
            </button>
            <button
              onClick={onClose}
              className="rte-footer-btn-primary border-0"
            >
              <FiCheck className="w-4 h-4" />
              Save & Exit
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
};

const ToolbarButton = ({ icon, onClick, label }) => (
  <button type="button" onClick={onClick} title={label} className="rte-btn">
    {React.cloneElement(icon, { size: 18 })}
  </button>
);

export default RichTextEditor;
