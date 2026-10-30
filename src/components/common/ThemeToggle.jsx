import React, { useState, useEffect, useRef } from "react";
import { useTheme } from "../../context/ThemeContext";
import { FaSun, FaMoon, FaDesktop, FaCheck } from "react-icons/fa";

const options = [
  { value: "light", icon: FaSun, label: "Light" },
  { value: "dark", icon: FaMoon, label: "Dark" },
  { value: "system", icon: FaDesktop, label: "System" },
];

// variant="icon"      -> compact icon button + dropdown (desktop navbar)
// variant="segmented" -> three inline buttons (mobile menu)
const ThemeToggle = ({ variant = "icon" }) => {
  const { theme, toggleTheme, isDark } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef(null);

  // Close the dropdown when clicking outside
  useEffect(() => {
    if (!isOpen) return;
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [isOpen]);

  const CurrentIcon = (options.find((o) => o.value === theme) || options[0]).icon;

  const vars = isDark
    ? {
        "--tt-bg": "#111a2e",
        "--tt-border": "#1e293b",
        "--tt-text": "#e2e8f0",
        "--tt-muted": "#94a3b8",
        "--tt-hover": "rgba(148, 163, 184, 0.12)",
        "--tt-active-bg": "rgba(59, 130, 246, 0.16)",
        "--tt-active-text": "#93c5fd",
        "--tt-shadow": "0 8px 30px rgba(0, 0, 0, 0.45)",
      }
    : {
        "--tt-bg": "#ffffff",
        "--tt-border": "#e2e8f0",
        "--tt-text": "#0b1220",
        "--tt-muted": "#64748b",
        "--tt-hover": "#f1f5f9",
        "--tt-active-bg": "#eff6ff",
        "--tt-active-text": "#1d4ed8",
        "--tt-shadow": "0 8px 30px rgba(11, 18, 32, 0.12)",
      };

  const styles = `
    .tt-icon-btn {
      width: 38px;
      height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 10px;
      border: 1px solid var(--tt-border);
      background: transparent;
      color: var(--tt-text);
      cursor: pointer;
      transition: background 0.2s ease;
    }
    .tt-icon-btn:hover { background: var(--tt-hover); }

    .tt-menu {
      position: absolute;
      top: calc(100% + 10px);
      right: 0;
      min-width: 160px;
      padding: 6px;
      border-radius: 14px;
      background: var(--tt-bg);
      border: 1px solid var(--tt-border);
      box-shadow: var(--tt-shadow);
      z-index: 1000;
    }
    .tt-item {
      display: flex;
      align-items: center;
      gap: 10px;
      width: 100%;
      padding: 10px 12px;
      border-radius: 9px;
      border: none;
      background: transparent;
      color: var(--tt-text);
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: background 0.15s ease;
    }
    .tt-item:hover { background: var(--tt-hover); }
    .tt-item--active,
    .tt-item--active:hover {
      background: var(--tt-active-bg);
      color: var(--tt-active-text);
      font-weight: 600;
    }
    .tt-item__check { margin-left: auto; }

    .tt-segmented {
      display: flex;
      gap: 4px;
      padding: 4px;
      border-radius: 12px;
      background: var(--tt-hover);
    }
    .tt-seg-btn {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 6px;
      padding: 9px 8px;
      border: none;
      border-radius: 9px;
      background: transparent;
      color: var(--tt-muted);
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .tt-seg-btn--active {
      background: var(--tt-bg);
      color: var(--tt-active-text);
      box-shadow: 0 1px 3px rgba(11, 18, 32, 0.15);
    }
  `;

  if (variant === "segmented") {
    return (
      <div className="tt-segmented" style={vars}>
        {options.map((o) => (
          <button
            key={o.value}
            className={`tt-seg-btn ${theme === o.value ? "tt-seg-btn--active" : ""}`}
            onClick={() => toggleTheme(o.value)}
          >
            <o.icon size={13} />
            <span>{o.label}</span>
          </button>
        ))}
        <style>{styles}</style>
      </div>
    );
  }

  return (
    <div ref={ref} style={{ position: "relative", ...vars }}>
      <button
        className="tt-icon-btn"
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Change theme"
        title={`Theme: ${theme}`}
      >
        <CurrentIcon size={16} />
      </button>

      {isOpen && (
        <div className="tt-menu">
          {options.map((o) => (
            <button
              key={o.value}
              className={`tt-item ${theme === o.value ? "tt-item--active" : ""}`}
              onClick={() => {
                toggleTheme(o.value);
                setIsOpen(false);
              }}
            >
              <o.icon size={15} />
              <span>{o.label}</span>
              {theme === o.value && <FaCheck size={11} className="tt-item__check" />}
            </button>
          ))}
        </div>
      )}
      <style>{styles}</style>
    </div>
  );
};

export default ThemeToggle;