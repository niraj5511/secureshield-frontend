import React, { useState, useEffect } from "react";
import { FaShieldAlt, FaArrowUp, FaHeart } from "react-icons/fa";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => setShowScrollTop(window.scrollY > 300);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => window.scrollTo({ top: 0, behavior: "smooth" });

  return (
    <>
      <footer className="ss-footer">
        <div className="ss-footer__inner">
          <div className="ss-footer__brand">
            <span className="ss-footer__mark">
              <FaShieldAlt size={14} />
            </span>
            <div>
              <div className="ss-footer__name">
                Secure<span>Shield</span>
              </div>
              <div className="ss-footer__tagline">
                AI-powered phishing and scam detection
              </div>
            </div>
          </div>

          <div className="ss-footer__meta">
            <span>
              Crafted with <FaHeart className="ss-footer__heart" /> by{" "}
              <strong>Team SecureShield</strong>
            </span>
            <span className="ss-footer__dot">•</span>
            <span>© {currentYear}</span>
          </div>
        </div>
      </footer>

      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="ss-scroll-top"
          aria-label="Scroll to top"
        >
          <FaArrowUp size={13} />
        </button>
      )}

      <style>{`
        .ss-footer {
          width: 100%;
          margin-top: auto;
          background: #0b1220;
          border-top: 1px solid #1e293b;
          color: #94a3b8;
        }
        .ss-footer__inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 24px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          flex-wrap: wrap;
          gap: 16px;
        }
        .ss-footer__brand { display: flex; align-items: center; gap: 12px; }
        .ss-footer__mark {
          width: 34px;
          height: 34px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: linear-gradient(135deg, #2563eb 0%, #4f46e5 100%);
        }
        .ss-footer__name {
          font-size: 15px;
          font-weight: 800;
          letter-spacing: -0.02em;
          color: #f1f5f9;
        }
        .ss-footer__name span { color: #60a5fa; }
        .ss-footer__tagline { font-size: 12px; color: #64748b; margin-top: 1px; }
        .ss-footer__meta {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: #64748b;
        }
        .ss-footer__meta strong { color: #cbd5e1; font-weight: 600; }
        .ss-footer__heart { color: #f43f5e; font-size: 11px; margin: 0 2px; }
        .ss-footer__dot { color: #334155; }

        .ss-scroll-top {
          position: fixed;
          bottom: 24px;
          right: 24px;
          width: 40px;
          height: 40px;
          border: none;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: #fff;
          background: #2563eb;
          box-shadow: 0 4px 14px rgba(37, 99, 235, 0.4);
          cursor: pointer;
          z-index: 1000;
          transition: transform 0.2s ease, background 0.2s ease;
        }
        .ss-scroll-top:hover { background: #1d4ed8; transform: translateY(-2px); }

        @media (max-width: 600px) {
          .ss-footer__inner {
            flex-direction: column;
            text-align: center;
            padding: 20px 16px;
          }
          .ss-footer__meta { flex-wrap: wrap; justify-content: center; }
        }
      `}</style>
    </>
  );
};

export default Footer;