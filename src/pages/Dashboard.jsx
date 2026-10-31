// pages/Dashboard.jsx
import React, { useState, useEffect } from "react";
import { getScanHistory } from "../services/api";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useGuest } from "../context/GuestContext";
import {
  FaShieldAlt,
  FaEnvelope,
  FaExclamationTriangle,
  FaCheckCircle,
  FaChartLine,
  FaClock,
  FaArrowUp,
  FaArrowDown,
  FaLink,
  FaComment,
  FaEye,
  FaChevronRight,
  FaChartPie,
  FaCalendarAlt,
  FaInbox,
  FaUserPlus,
  FaSync,
  FaHashtag,
} from "react-icons/fa";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import toast from "react-hot-toast";
import AuthModal from "../components/common/AuthModal";
import { useTheme } from "../context/ThemeContext";
import "../styles/dashboard.css";

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalScans: 0,
    phishingDetected: 0,
    scamMessages: 0,
    safeDetections: 0,
    recentScans: [],
    weeklyData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();
  const { isDark } = useTheme();
  const { getStats: getGuestStats, scans: guestScans } = useGuest();

  useEffect(() => {
    fetchDashboardStats();
  }, [isAuthenticated]);

  // Helper function to get prediction from API response
  const getPrediction = (scan) => {
    return scan.overallPrediction || scan.prediction || "UNKNOWN";
  };

  // Helper function to detect scan type
  const getScanType = (scan) => {
    // Check if type is explicitly set
    if (scan.type) {
      const type = scan.type.toLowerCase();
      if (type === "url" || type === "message") return type;
    }
    if (scan.scanType) {
      const type = scan.scanType.toLowerCase();
      if (type === "url" || type === "message") return type;
      if (type.includes("url")) return "url";
      if (type.includes("message")) return "message";
    }
    // Check if it's a message scan by looking for message field
    if (scan.message) return "message";
    // Check if it's a URL scan by looking for url field
    if (scan.url) return "url";
    // Check content field
    if (scan.content) {
      const content = String(scan.content);
      if (
        content.match(/^https?:\/\/[^\s]+/) ||
        content.match(/^[a-zA-Z0-9-]+\.[a-zA-Z]{2,}/)
      ) {
        return "url";
      }
      if (content.length > 50) return "message";
      return content.length > 20 ? "message" : "url";
    }
    // Default to URL
    return "url";
  };

  // Helper function to classify a scan based on type and prediction
  const classifyScan = (scan) => {
    const type = getScanType(scan);
    const pred = getPrediction(scan).toUpperCase();

    // Determine if it's a threat (phishing or scam)
    const isThreat =
      pred === "PHISHING" ||
      pred === "DANGEROUS" ||
      pred === "MALICIOUS" ||
      pred === "SCAM" ||
      pred === "SUSPICIOUS" ||
      pred === "WARNING";

    // For URL scans
    if (type === "url") {
      if (pred === "PHISHING" || pred === "DANGEROUS" || pred === "MALICIOUS") {
        return "phishing";
      } else if (pred === "SUSPICIOUS" || pred === "WARNING") {
        return "suspicious_url";
      } else if (pred === "SAFE" || pred === "LEGITIMATE") {
        return "safe";
      }
      return "unknown";
    }

    // For Message scans
    if (type === "message") {
      if (
        pred === "PHISHING" ||
        pred === "DANGEROUS" ||
        pred === "MALICIOUS" ||
        pred === "SCAM"
      ) {
        return "scam";
      } else if (pred === "SUSPICIOUS" || pred === "WARNING") {
        return "suspicious_message";
      } else if (pred === "SAFE" || pred === "LEGITIMATE") {
        return "safe";
      }
      return "unknown";
    }

    return "unknown";
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);

      if (isAuthenticated) {
        const historyResponse = await getScanHistory();

        let allScans = [];
        if (
          historyResponse &&
          historyResponse.scans &&
          Array.isArray(historyResponse.scans)
        ) {
          allScans = historyResponse.scans;
        } else if (Array.isArray(historyResponse)) {
          allScans = historyResponse;
        } else if (
          historyResponse &&
          historyResponse.response &&
          Array.isArray(historyResponse.response)
        ) {
          allScans = historyResponse.response;
        }

        const totalScans = allScans.length;

        // Count using classifyScan function
        let phishingDetected = 0;
        let scamMessages = 0;
        let safeDetections = 0;

        allScans.forEach((scan) => {
          const classification = classifyScan(scan);
          if (classification === "phishing") {
            phishingDetected++;
          } else if (classification === "scam") {
            scamMessages++;
          } else if (classification === "safe") {
            safeDetections++;
          }
        });

        const recentScans = allScans.slice(0, 5).map((scan) => {
          const type = getScanType(scan);
          const content = scan.url || scan.message || scan.content || "";
          return {
            reference: scan.reference,
            content: content,
            type: type,
            result: getResultFromPrediction(getPrediction(scan)),
            date: scan.scannedAt,
            prediction: getPrediction(scan),
          };
        });

        const weeklyData = generateWeeklyDataFromScans(allScans);

        setStats({
          totalScans,
          phishingDetected,
          scamMessages,
          safeDetections,
          recentScans,
          weeklyData,
        });
      } else {
        const guestStats = getGuestStats();
        const guestRecentScans = guestScans.slice(0, 5).map((scan) => ({
          reference: scan.id || scan.reference || `guest_${Date.now()}`,
          content: scan.content || scan.url || scan.message || "",
          type: scan.type || "url",
          result: scan.result || "unknown",
          date: scan.date || new Date().toISOString(),
          prediction: scan.prediction || "UNKNOWN",
        }));

        setStats({
          totalScans: guestStats.total,
          phishingDetected: guestStats.phishing,
          scamMessages: guestStats.scam,
          safeDetections: guestStats.safe,
          recentScans: guestRecentScans,
          weeklyData: generateWeeklyDataFromScans(guestScans),
        });
      }
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      if (isAuthenticated) {
        toast.error("Failed to load dashboard data");
      }
      setStats({
        totalScans: 0,
        phishingDetected: 0,
        scamMessages: 0,
        safeDetections: 0,
        recentScans: [],
        weeklyData: generateEmptyWeeklyData(),
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultFromPrediction = (prediction) => {
    const pred = prediction?.toUpperCase() || "";
    switch (pred) {
      case "PHISHING":
      case "DANGEROUS":
      case "MALICIOUS":
        return "phishing";
      case "SCAM":
      case "SUSPICIOUS":
      case "WARNING":
        return "suspicious";
      case "SAFE":
      case "LEGITIMATE":
        return "safe";
      default:
        return "unknown";
    }
  };

  const generateWeeklyDataFromScans = (scans) => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    const today = new Date();
    const dayMap = {};

    days.forEach((day, index) => {
      const d = new Date(today);
      d.setDate(d.getDate() - (6 - index));
      const dateStr = d.toISOString().split("T")[0];
      dayMap[dateStr] = { day, phishing: 0, scam: 0, safe: 0, date: dateStr };
    });

    scans.forEach((scan) => {
      if (!scan.scannedAt) return;
      const scanDate = new Date(scan.scannedAt);
      const dateStr = scanDate.toISOString().split("T")[0];

      if (dayMap[dateStr]) {
        const classification = classifyScan(scan);
        if (classification === "phishing") {
          dayMap[dateStr].phishing += 1;
        } else if (classification === "scam") {
          dayMap[dateStr].scam += 1;
        } else if (classification === "safe") {
          dayMap[dateStr].safe += 1;
        }
      }
    });

    const result = Object.values(dayMap);
    result.sort((a, b) => a.date.localeCompare(b.date));
    return result;
  };

  const generateEmptyWeeklyData = () => {
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
    return days.map((day) => ({
      day,
      phishing: 0,
      scam: 0,
      safe: 0,
    }));
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardStats();
    setRefreshing(false);
    toast.success("Dashboard refreshed!");
  };

  const weeklyData =
    stats.weeklyData.length > 0 ? stats.weeklyData : generateEmptyWeeklyData();
  const hasData = stats.totalScans > 0;
  const hasWeeklyData = weeklyData.some(
    (d) => d.phishing > 0 || d.scam > 0 || d.safe > 0,
  );

  const totalThreats = stats.phishingDetected + stats.scamMessages;

  const pieData = [
    {
      name: "Phishing URLs",
      value: stats.phishingDetected,
      color: "#ef4444",
      percentage:
        totalThreats > 0
          ? ((stats.phishingDetected / totalThreats) * 100).toFixed(1)
          : 0,
    },
    {
      name: "Scam Messages",
      value: stats.scamMessages,
      color: "#f59e0b",
      percentage:
        totalThreats > 0
          ? ((stats.scamMessages / totalThreats) * 100).toFixed(1)
          : 0,
    },
    {
      name: "Safe",
      value: stats.safeDetections,
      color: "#10b981",
      percentage:
        stats.totalScans > 0
          ? ((stats.safeDetections / stats.totalScans) * 100).toFixed(1)
          : 0,
    },
  ];

  const pct = (part, whole) => (whole > 0 ? (part / whole) * 100 : 0);

  const StatCard = ({
    title,
    value,
    icon: Icon,
    tone = "blue",
    subtitle,
    percent,
    locked,
  }) => (
    <div className={`db-stat db-stat--${tone}`}>
      <div className="db-stat__top">
        <span className="db-stat__icon">
          <Icon size={18} />
        </span>
        <span className="db-stat__label">{title}</span>
        {locked && !isAuthenticated && (
          <span className="db-stat__lock">
            <FaUserPlus size={9} />
            Sign in
          </span>
        )}
      </div>
      <div className="db-stat__value">{value}</div>
      {subtitle && <div className="db-stat__sub">{subtitle}</div>}
      {percent !== undefined && (
        <div className="db-stat__bar">
          <span style={{ width: `${Math.min(percent, 100)}%` }} />
        </div>
      )}
    </div>
  );

  const axisColor = isDark ? "#94a3b8" : "#64748b";
  const gridColor = isDark ? "#1e293b" : "#e2e8f0";
  const sliceBorder = isDark ? "#111a2e" : "#ffffff";
  const pieTotal =
    stats.phishingDetected + stats.scamMessages + stats.safeDetections;

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload || !payload.length) return null;
    return (
      <div className="db-tooltip">
        {label !== undefined && (
          <div className="db-tooltip__label">{label}</div>
        )}
        {payload.map((entry, index) => (
          <div key={index} className="db-tooltip__row">
            <span
              className="db-tooltip__dot"
              style={{ background: entry.color || entry.payload?.color }}
            />
            <span>{entry.name}</span>
            <strong>{entry.value}</strong>
          </div>
        ))}
      </div>
    );
  };

  const EmptyChartState = ({
    icon: Icon,
    title,
    description,
    actionText,
    onAction,
  }) => (
    <div className="db-empty">
      <div className="db-empty__icon">
        <Icon size={26} />
      </div>
      <h3 className="db-empty__title">{title}</h3>
      <p className="db-empty__text">{description}</p>
      {onAction && (
        <button className="db-empty__btn" onClick={onAction}>
          {actionText}
        </button>
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="loading-premium">
        <div className="loading-spinner-premium"></div>
      </div>
    );
  }

  return (
    <div className={`dashboard-container ${isDark ? "db-dark" : ""}`}>
      {/* Header */}
      <div className="db-header">
        <div>
          <h1 className="db-title">
            {isAuthenticated
              ? `Welcome back, ${user?.firstName || "User"}`
              : "Welcome to SecureShield"}
          </h1>
          <p className="db-subtitle">
            {isAuthenticated
              ? "Your security overview and recent scan activity."
              : "Scan URLs and messages instantly. No account required."}
          </p>
          {!isAuthenticated && (
            <div className="db-guest-pill">
              <FaUserPlus size={12} />
              <span>Guest mode. Sign up to save your scan history.</span>
            </div>
          )}
        </div>
        <button
          className="db-refresh"
          onClick={handleRefresh}
          disabled={refreshing}
        >
          <FaSync className={refreshing ? "spinning" : ""} size={13} />
          <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
        </button>
      </div>

      {/* Hero CTA */}
      <div className="db-hero">
        <div className="db-hero__body">
          <div className="db-hero__badges">
            <span className="db-badge">
              <FaShieldAlt size={11} />
              AI-powered detection
            </span>
            <span className="db-badge db-badge--status">
              <span className="db-badge__dot" />
              {isAuthenticated ? "Protected" : "Guest mode"}
            </span>
          </div>
          <h2 className="db-hero__title">Check before you click or reply.</h2>
          <p className="db-hero__text">
            Scan suspicious URLs and messages in seconds, with clear
            explanations of why something is risky.
          </p>
        </div>
        <div className="db-hero__actions">
          <button
            className="db-cta db-cta--primary"
            onClick={() => navigate("/url-scan")}
          >
            <FaLink /> Scan URL
          </button>
          <button
            className="db-cta db-cta--ghost"
            onClick={() => navigate("/message-scan")}
          >
            <FaComment /> Scan Message
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="db-stats">
        <StatCard
          title="Total Scans"
          value={stats.totalScans}
          icon={FaShieldAlt}
          tone="blue"
          subtitle={isAuthenticated ? "All time" : "This session"}
          locked={!isAuthenticated}
        />
        <StatCard
          title="Phishing URLs"
          value={stats.phishingDetected}
          icon={FaExclamationTriangle}
          tone="red"
          percent={pct(stats.phishingDetected, totalThreats)}
          subtitle={`${pct(stats.phishingDetected, totalThreats).toFixed(1)}% of threats`}
          locked={!isAuthenticated}
        />
        <StatCard
          title="Scam Messages"
          value={stats.scamMessages}
          icon={FaEnvelope}
          tone="amber"
          percent={pct(stats.scamMessages, totalThreats)}
          subtitle={`${pct(stats.scamMessages, totalThreats).toFixed(1)}% of threats`}
          locked={!isAuthenticated}
        />
        <StatCard
          title="Safe Detections"
          value={stats.safeDetections}
          icon={FaCheckCircle}
          tone="green"
          percent={pct(stats.safeDetections, stats.totalScans)}
          subtitle={`${pct(stats.safeDetections, stats.totalScans).toFixed(1)}% of total`}
          locked={!isAuthenticated}
        />
      </div>

      {/* Charts Row */}
      <div className="db-charts">
        {/* Area Chart */}
        <div className="db-card">
          <div className="db-card__head">
            <span className="db-card__icon">
              <FaChartLine size={16} />
            </span>
            <span className="db-card__title">Detection Trends</span>
            <span className="db-card__hint">Last 7 days</span>
          </div>
          {hasWeeklyData ? (
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={weeklyData}>
                <defs>
                  <linearGradient
                    id="colorPhishing"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorScam" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorSafe" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke={gridColor}
                  vertical={false}
                />
                <XAxis
                  dataKey="day"
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke={axisColor}
                  fontSize={12}
                  tickLine={false}
                  axisLine={false}
                  allowDecimals={false}
                />
                <Tooltip
                  content={<CustomTooltip />}
                  cursor={{ stroke: gridColor }}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  wrapperStyle={{
                    fontSize: 13,
                    color: axisColor,
                    paddingTop: 8,
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="phishing"
                  stroke="#ef4444"
                  fill="url(#colorPhishing)"
                  name="Phishing URLs"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="scam"
                  stroke="#f59e0b"
                  fill="url(#colorScam)"
                  name="Scam Messages"
                  strokeWidth={2}
                />
                <Area
                  type="monotone"
                  dataKey="safe"
                  stroke="#10b981"
                  fill="url(#colorSafe)"
                  name="Safe"
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <EmptyChartState
              icon={FaInbox}
              title="No scan data yet"
              description="Start scanning URLs and messages to see detection trends over time."
              actionText="Start Scanning"
              onAction={() => navigate("/url-scan")}
            />
          )}
        </div>

        {/* Donut Chart */}
        <div className="db-card">
          <div className="db-card__head">
            <span className="db-card__icon">
              <FaChartPie size={16} />
            </span>
            <span className="db-card__title">Scan Results</span>
            <span className="db-card__hint">{totalThreats} threats</span>
          </div>
          {pieTotal > 0 ? (
            <>
              <div className="db-donut">
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie
                      data={pieData.filter((d) => d.value > 0)}
                      dataKey="value"
                      nameKey="name"
                      innerRadius={68}
                      outerRadius={98}
                      paddingAngle={3}
                    >
                      {pieData
                        .filter((d) => d.value > 0)
                        .map((entry) => (
                          <Cell
                            key={entry.name}
                            fill={entry.color}
                            stroke={sliceBorder}
                            strokeWidth={3}
                          />
                        ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="db-donut__center">
                  <strong>{pieTotal}</strong>
                  <span>scans</span>
                </div>
              </div>
              <div className="db-legend">
                {pieData.map((item) => (
                  <div key={item.name} className="db-legend__row">
                    <span
                      className="db-legend__dot"
                      style={{ background: item.color }}
                    />
                    <span>{item.name}</span>
                    <strong>{item.value}</strong>
                    <span className="db-legend__pct">
                      {pct(item.value, pieTotal).toFixed(1)}%
                    </span>
                  </div>
                ))}
              </div>
            </>
          ) : (
            <EmptyChartState
              icon={FaChartPie}
              title="No results yet"
              description="Run a scan to see how your results break down."
              actionText="Start Scanning"
              onAction={() => navigate("/message-scan")}
            />
          )}
        </div>
      </div>

      {/* Guest Mode Call to Action */}
      {!isAuthenticated && hasData && (
        <div className="db-banner">
          <span className="db-banner__icon">
            <FaUserPlus size={20} />
          </span>
          <div className="db-banner__body">
            <div className="db-banner__title">
              Want to save your scan history?
            </div>
            <p className="db-banner__text">
              Create a free account to keep your scans, access them from any
              device, and unlock more features.
            </p>
          </div>
          <button className="db-btn" onClick={() => setShowAuthModal(true)}>
            Sign Up Free
          </button>
        </div>
      )}

      {/* Recent Scans Table */}
      <div className="db-card">
        <div className="db-card__head">
          <span className="db-card__icon">
            <FaClock size={16} />
          </span>
          <span className="db-card__title">Recent Scans</span>
          <span className="db-card__hint" style={{ marginLeft: 0 }}>
            Latest {stats.recentScans?.length || 0}
          </span>
          <button
            className="db-btn db-btn--ghost"
            style={{ marginLeft: "auto" }}
            onClick={() => navigate("/history")}
          >
            View all <FaChevronRight size={11} />
          </button>
        </div>

        {stats.recentScans?.length > 0 ? (
          <div className="db-table-wrap">
            <table className="db-table">
              <thead>
                <tr>
                  <th>Reference</th>
                  <th>Type</th>
                  <th>Content</th>
                  <th>Result</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentScans.slice(0, 5).map((scan, index) => {
                  const typeInfo = getTypeInfo(scan.type);
                  return (
                    <tr key={scan.reference || index}>
                      <td className="db-ref">
                        {scan.reference
                          ? truncateText(scan.reference, 20)
                          : "N/A"}
                      </td>
                      <td>
                        <span className={`db-pill ${typeInfo.tone}`}>
                          {typeInfo.icon}
                          {typeInfo.label}
                        </span>
                      </td>
                      <td className="db-content" title={scan.content || ""}>
                        {truncateText(scan.content || "N/A", 50)}
                      </td>
                      <td>
                        <span
                          className={`db-pill ${getPredictionTone(scan.prediction)}`}
                        >
                          {scan.prediction || "UNKNOWN"}
                        </span>
                      </td>
                      <td className="db-date">
                        {formatDate(scan.date || scan.scannedAt || Date.now())}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <EmptyChartState
            icon={FaShieldAlt}
            title="No scans yet"
            description="Start scanning URLs or messages to see results here."
            actionText="Start Scanning"
            onAction={() => navigate("/url-scan")}
          />
        )}
      </div>

      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        initialMode="register"
        onSuccess={() => {
          setShowAuthModal(false);
          fetchDashboardStats();
        }}
      />

      <style>{`
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.3; } }
        @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
        .spinning { animation: spin 1s linear infinite; }
      `}</style>
    </div>
  );
};

const formatDate = (date) => {
  if (!date) return "N/A";
  return new Date(date).toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });
};

const getPredictionTone = (prediction) => {
  switch ((prediction || "").toUpperCase()) {
    case "PHISHING":
    case "DANGEROUS":
    case "MALICIOUS":
      return "db-pill--danger";
    case "SCAM":
    case "SUSPICIOUS":
    case "WARNING":
      return "db-pill--warn";
    case "SAFE":
    case "LEGITIMATE":
      return "db-pill--safe";
    default:
      return "db-pill--neutral";
  }
};

const getTypeInfo = (type) => {
  if (type === "url") {
    return { label: "URL", tone: "db-pill--url", icon: <FaLink size={11} /> };
  }
  if (type === "message") {
    return {
      label: "Message",
      tone: "db-pill--msg",
      icon: <FaComment size={11} />,
    };
  }
  return { label: "Unknown", tone: "db-pill--neutral", icon: null };
};

const truncateText = (text, maxLength = 100) => {
  if (!text) return "N/A";
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + "...";
};

export default Dashboard;
