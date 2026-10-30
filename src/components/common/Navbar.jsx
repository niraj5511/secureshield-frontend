// components/common/Navbar.jsx
import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaShieldAlt,
  FaHome,
  FaGlobe,
  FaEnvelope,
  FaHistory,
  FaBars,
  FaTimes,
  FaUser,
  FaSignOutAlt,
  FaUserPlus,
  FaSignInAlt,
  FaChevronDown,
} from "react-icons/fa";
import ThemeToggle from "./ThemeToggle";
import { useTheme } from "../../context/ThemeContext";
import { useAuth } from "../../context/AuthContext";
import AuthModal from "./AuthModal";

const navItems = [
  { path: "/", label: "Dashboard", icon: FaHome },
  { path: "/url-scan", label: "URL Scanner", icon: FaGlobe },
  { path: "/message-scan", label: "Message Scanner", icon: FaEnvelope },
  { path: "/history", label: "History", icon: FaHistory },
];

const Navbar = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { isDark } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();

  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState("login");
  const [showUserMenu, setShowUserMenu] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 8);
    handleScroll();
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Close menus when the route changes
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  }, [location.pathname]);

  const isActive = (path) => location.pathname === path;

  const handleAuthClick = (mode) => {
    setAuthMode(mode);
    setShowAuthModal(true);
    setIsMobileMenuOpen(false);
    setShowUserMenu(false);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
    setShowUserMenu(false);
    setIsMobileMenuOpen(false);
  };

  const handleAuthSuccess = () => {
    setShowAuthModal(false);
    window.location.reload();
  };

  const initial = user?.firstName ? user.firstName.charAt(0).toUpperCase() : "U";

  // Colour tokens for this component (light / dark)
  const vars = isDark
    ? {
        "--nav-bg": "rgba(11, 18, 32, 0.85)",
        "--nav-border": "#1e293b",
        "--nav-text": "#e2e8f0",
        "--nav-muted": "#94a3b8",
        "--nav-hover": "rgba(148, 163, 184, 0.12)",
        "--nav-active-bg": "rgba(59, 130, 246, 0.16)",
        "--nav-active-text": "#93c5fd",
        "--nav-menu-bg": "#111a2e",
        "--nav-shadow": "0 8px 30px rgba(0, 0, 0, 0.45)",
        "--nav-danger-hover": "rgba(239, 68, 68, 0.12)",
      }
    : {
        "--nav-bg": "rgba(255, 255, 255, 0.85)",
        "--nav-border": "#e2e8f0",
        "--nav-text": "#0b1220",
        "--nav-muted": "#64748b",
        "--nav-hover": "#f1f5f9",
        "--nav-active-bg": "#eff6ff",
        "--nav-active-text": "#1d4ed8",
        "--nav-menu-bg": "#ffffff",
        "--nav-shadow": "0 8px 30px rgba(11, 18, 32, 0.12)",
        "--nav-danger-hover": "#fef2f2",
      };

  return (
    <>
      <nav
        className={`ss-nav ${scrolled ? "ss-nav--scrolled" : ""}`}
        style={vars}
      >
        <div className="ss-nav__inner">
          {/* Logo */}
          <Link to="/" className="ss-nav__logo">
            <span className="ss-nav__logo-mark">
              <FaShieldAlt size={18} />
            </span>
            <span className="ss-nav__logo-text">
              <span className="ss-nav__brand">
                Secure<span>Shield</span>
              </span>
              <span className="ss-nav__tagline">
                {isAuthenticated
                  ? `Welcome, ${user?.firstName || "User"}`
                  : "AI Phishing Detection"}
              </span>
            </span>
          </Link>

          {/* Desktop links */}
          <div className="ss-nav__links">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ss-nav__link ${
                  isActive(item.path) ? "ss-nav__link--active" : ""
                }`}
              >
                <item.icon size={15} />
                <span>{item.label}</span>
              </Link>
            ))}
          </div>

          {/* Desktop actions */}
          <div className="ss-nav__actions">
            <ThemeToggle />

            {isAuthenticated ? (
              <div style={{ position: "relative" }}>
                <button
                  className="ss-nav__user"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                >
                  <span className="ss-nav__avatar">{initial}</span>
                  <span className="ss-nav__user-name">
                    {user?.firstName || "User"}
                  </span>
                  <FaChevronDown
                    size={10}
                    style={{
                      transition: "transform 0.2s ease",
                      transform: showUserMenu ? "rotate(180deg)" : "none",
                    }}
                  />
                </button>

                {showUserMenu && (
                  <div className="ss-nav__dropdown">
                    <Link
                      to="/profile"
                      className="ss-nav__dropdown-item"
                      onClick={() => setShowUserMenu(false)}
                    >
                      <FaUser size={14} />
                      <span>Profile</span>
                    </Link>
                    <button
                      className="ss-nav__dropdown-item ss-nav__dropdown-item--danger"
                      onClick={handleLogout}
                    >
                      <FaSignOutAlt size={14} />
                      <span>Logout</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <>
                <button
                  className="ss-nav__btn ss-nav__btn--ghost"
                  onClick={() => handleAuthClick("login")}
                >
                  <FaSignInAlt size={14} />
                  <span>Login</span>
                </button>
                <button
                  className="ss-nav__btn ss-nav__btn--primary"
                  onClick={() => handleAuthClick("register")}
                >
                  <FaUserPlus size={14} />
                  <span>Register</span>
                </button>
              </>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className="ss-nav__burger"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {isMobileMenuOpen ? <FaTimes size={20} /> : <FaBars size={20} />}
          </button>
        </div>

        {/* Mobile menu */}
        {isMobileMenuOpen && (
          <div className="ss-nav__mobile">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`ss-nav__link ${
                  isActive(item.path) ? "ss-nav__link--active" : ""
                }`}
              >
                <item.icon size={16} />
                <span>{item.label}</span>
              </Link>
            ))}

            <div className="ss-nav__mobile-section">
              {isAuthenticated ? (
                <>
                  <div className="ss-nav__mobile-user">
                    <span className="ss-nav__avatar ss-nav__avatar--lg">
                      {initial}
                    </span>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ fontWeight: 700, color: "var(--nav-text)" }}>
                        {user?.firstName} {user?.lastName || ""}
                      </div>
                      <div
                        style={{
                          fontSize: 12,
                          color: "var(--nav-muted)",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                        }}
                      >
                        {user?.email || ""}
                      </div>
                    </div>
                  </div>
                  <Link to="/profile" className="ss-nav__link">
                    <FaUser size={15} />
                    <span>Profile</span>
                  </Link>
                  <button
                    className="ss-nav__link ss-nav__link--danger"
                    onClick={handleLogout}
                  >
                    <FaSignOutAlt size={15} />
                    <span>Logout</span>
                  </button>
                </>
              ) : (
                <>
                  <button
                    className="ss-nav__btn ss-nav__btn--ghost ss-nav__btn--block"
                    onClick={() => handleAuthClick("login")}
                  >
                    <FaSignInAlt size={14} />
                    <span>Login</span>
                  </button>
                  <button
                    className="ss-nav__btn ss-nav__btn--primary ss-nav__btn--block"
                    onClick={() => handleAuthClick("register")}
                  >
                    <FaUserPlus size={14} />
                    <span>Create Account</span>
                  </button>
                </>
              )}
            </div>

            <div className="ss-nav__mobile-section">
              <ThemeToggle />
            </div>
          </div>
        )}

        <style>{`
          .ss-nav {
            position: sticky;
            top: 0;
            z-index: 1000;
            background: var(--nav-bg);
            backdrop-filter: blur(16px);
            -webkit-backdrop-filter: blur(16px);
            border-bottom: 1px solid var(--nav-border);
            transition: box-shadow 0.25s ease;
          }
          .ss-nav--scrolled { box-shadow: var(--nav-shadow); }

          .ss-nav__inner {
            max-width: 1400px;
            margin: 0 auto;
            padding: 10px 24px;
            display: flex;
            align-items: center;
            gap: 24px;
          }

          /* Logo */
          .ss-nav__logo {
            display: flex;
            align-items: center;
            gap: 10px;
            text-decoration: none;
            flex-shrink: 0;
          }
          .ss-nav__logo-mark {
            width: 38px;
            height: 38px;
            border-radius: 11px;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
            box-shadow: 0 4px 12px rgba(37, 99, 235, 0.35);
          }
          .ss-nav__logo-text { display: flex; flex-direction: column; line-height: 1.15; }
          .ss-nav__brand {
            font-size: 19px;
            font-weight: 800;
            letter-spacing: -0.02em;
            color: var(--nav-text);
          }
          .ss-nav__brand span { color: #2563eb; }
          .ss-nav__tagline {
            font-size: 11px;
            font-weight: 500;
            color: var(--nav-muted);
          }

          /* Links */
          .ss-nav__links {
            display: flex;
            align-items: center;
            gap: 4px;
            margin: 0 auto;
          }
          .ss-nav__link {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 9px 14px;
            border-radius: 10px;
            border: none;
            background: transparent;
            color: var(--nav-muted);
            font-size: 14px;
            font-weight: 600;
            text-decoration: none;
            cursor: pointer;
            white-space: nowrap;
            transition: background 0.2s ease, color 0.2s ease;
          }
          .ss-nav__link:hover { background: var(--nav-hover); color: var(--nav-text); }
          .ss-nav__link--active,
          .ss-nav__link--active:hover {
            background: var(--nav-active-bg);
            color: var(--nav-active-text);
          }
          .ss-nav__link--danger { color: #ef4444; width: 100%; }
          .ss-nav__link--danger:hover { background: var(--nav-danger-hover); color: #ef4444; }

          /* Actions */
          .ss-nav__actions { display: flex; align-items: center; gap: 8px; }

          .ss-nav__btn {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 9px 16px;
            border-radius: 10px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            white-space: nowrap;
            transition: all 0.2s ease;
          }
          .ss-nav__btn--ghost {
            background: transparent;
            border: 1px solid var(--nav-border);
            color: var(--nav-text);
          }
          .ss-nav__btn--ghost:hover { background: var(--nav-hover); }
          .ss-nav__btn--primary {
            border: 1px solid transparent;
            color: #fff;
            background: #2563eb;
            box-shadow: 0 2px 8px rgba(37, 99, 235, 0.3);
          }
          .ss-nav__btn--primary:hover {
            background: #1d4ed8;
            box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
          }
          .ss-nav__btn--block { width: 100%; padding: 12px; }

          /* User menu */
          .ss-nav__user {
            display: flex;
            align-items: center;
            gap: 8px;
            padding: 5px 12px 5px 5px;
            border-radius: 999px;
            border: 1px solid var(--nav-border);
            background: transparent;
            color: var(--nav-text);
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: background 0.2s ease;
          }
          .ss-nav__user:hover { background: var(--nav-hover); }
          .ss-nav__avatar {
            width: 28px;
            height: 28px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-size: 13px;
            font-weight: 700;
            background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
          }
          .ss-nav__avatar--lg { width: 38px; height: 38px; font-size: 16px; flex-shrink: 0; }

          .ss-nav__dropdown {
            position: absolute;
            top: calc(100% + 10px);
            right: 0;
            min-width: 190px;
            padding: 6px;
            border-radius: 14px;
            background: var(--nav-menu-bg);
            border: 1px solid var(--nav-border);
            box-shadow: var(--nav-shadow);
          }
          .ss-nav__dropdown-item {
            display: flex;
            align-items: center;
            gap: 10px;
            width: 100%;
            padding: 10px 12px;
            border-radius: 9px;
            border: none;
            background: transparent;
            color: var(--nav-text);
            font-size: 14px;
            font-weight: 500;
            text-decoration: none;
            cursor: pointer;
            transition: background 0.15s ease;
          }
          .ss-nav__dropdown-item:hover { background: var(--nav-hover); }
          .ss-nav__dropdown-item--danger { color: #ef4444; }
          .ss-nav__dropdown-item--danger:hover { background: var(--nav-danger-hover); }

          /* Mobile */
          .ss-nav__burger {
            display: none;
            margin-left: auto;
            padding: 8px;
            border: none;
            border-radius: 10px;
            background: transparent;
            color: var(--nav-text);
            cursor: pointer;
          }
          .ss-nav__burger:hover { background: var(--nav-hover); }
          .ss-nav__mobile {
            display: none;
            padding: 12px 16px 20px;
            background: var(--nav-menu-bg);
            border-top: 1px solid var(--nav-border);
          }
          .ss-nav__mobile .ss-nav__link { padding: 12px; font-size: 15px; }
          .ss-nav__mobile-section {
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid var(--nav-border);
          }
          .ss-nav__mobile-user {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 12px;
            background: var(--nav-hover);
          }
          .ss-nav__mobile-section .ss-nav__btn + .ss-nav__btn { margin-top: 8px; }

          @media (max-width: 960px) {
            .ss-nav__links,
            .ss-nav__actions { display: none; }
            .ss-nav__burger { display: block; }
            .ss-nav__mobile { display: block; }
            .ss-nav__inner { padding: 10px 16px; }
          }
          @media (max-width: 1100px) and (min-width: 961px) {
            .ss-nav__user-name { display: none; }
            .ss-nav__link { padding: 9px 10px; }
          }
        `}</style>
      </nav>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode={authMode}
        onSuccess={handleAuthSuccess}
      />
    </>
  );
};

export default Navbar;