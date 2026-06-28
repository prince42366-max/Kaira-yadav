import { useState, useEffect } from "react";
import { Analytics } from "@vercel/analytics/react";
import { auth, signInAnonymously } from "./firebase";

function App() {
  // ===== ANONYMOUS AUTH =====
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Fan auth error:", err));
  }, []);

  // Timer state
  const [time, setTime] = useState({
    hours: 1,
    minutes: 19,
    seconds: 0,
  });

  // Video popup state
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Timer effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTime((prev) => {
        let { hours, minutes, seconds } = prev;

        if (seconds > 0) {
          return { ...prev, seconds: seconds - 1 };
        } else if (minutes > 0) {
          return { hours, minutes: minutes - 1, seconds: 59 };
        } else if (hours > 0) {
          return { hours: hours - 1, minutes: 59, seconds: 59 };
        } else {
          return { hours: 1, minutes: 19, seconds: 0 };
        }
      });
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  const formatNumber = (num) => String(num).padStart(2, "0");

  const videos = [
    {
      id: 1,
      title: "Exclusive Content 1",
      src: "prevew 1.mp4",
    },
    {
      id: 2,
      title: "Exclusive Content 2",
      src: "prevew 2.mp4",
    },
    {
      id: 3,
      title: "Exclusive Content 3",
      src: "prevew 3.mp4",
    },
    {
      id: 4,
      title: "Exclusive Content 4",
      src: "prevew 4.mp4",
    },
  ];

  const openVideo = (video) => {
    setSelectedVideo(video);
    document.body.style.overflow = "hidden";
  };

  const closeVideo = () => {
    setSelectedVideo(null);
    document.body.style.overflow = "auto";
  };

  return (
    <>
      <Analytics />
      <div
        style={{
          background: "#0a0a0f",
          color: "white",
          minHeight: "100vh",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          padding: "20px",
          maxWidth: "480px",
          margin: "0 auto",
        }}
      >
        {/* Status Bar */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "10px 0",
            borderBottom: "1px solid #1a1a2e",
            fontSize: "14px",
            color: "#22c55e",
          }}
        >
          <span>🟢 ONLINE</span>
          <span style={{ color: "#94a3b8", fontSize: "12px" }}>
            PRIVATE CHAT & VIDEO CALL
          </span>
        </div>

        {/* Profile Section */}
        <div style={{ textAlign: "center", marginTop: "25px" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              margin: "0 auto",
              border: "3px solid #8b5cf6",
              boxShadow: "0 0 40px rgba(139, 92, 246, 0.3)",
              overflow: "hidden",
              background: "#1a1a2e",
            }}
          >
            <img
              src="profile.jpg.jpeg"
              alt="Profile"
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
              }}
            />
          </div>

          <h1
            style={{
              fontSize: "24px",
              margin: "15px 0 5px 0",
              fontWeight: "700",
              color: "#fbbf24",
            }}
          >
            KAIRA YADAV
          </h1>

          <p
            style={{
              color: "#94a3b8",
              fontSize: "14px",
              margin: "0",
            }}
          >
            Exclusive Content & Private Access
          </p>

          <p
            style={{
              color: "#8b5cf6",
              fontSize: "13px",
              margin: "5px 0",
              fontWeight: "600",
            }}
          >
            ⭐ Private Group
          </p>
        </div>

        {/* Special Price Timer */}
        <div
          style={{
            background: "linear-gradient(135deg, #1a1a2e, #16213e)",
            borderRadius: "16px",
            padding: "20px",
            marginTop: "25px",
            textAlign: "center",
            border: "1px solid #2a2a4a",
          }}
        >
          <p
            style={{
              color: "#fbbf24",
              fontSize: "14px",
              fontWeight: "600",
              margin: "0 0 5px 0",
            }}
          >
            ⚡ SPECIAL PRICE
          </p>
          <p
            style={{
              color: "#94a3b8",
              fontSize: "12px",
              margin: "0 0 10px 0",
            }}
          >
            ENDS IN
          </p>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: "20px",
              fontSize: "28px",
              fontWeight: "bold",
              fontFamily: "monospace",
            }}
          >
            <div>
              <div style={{ color: "#fbbf24" }}>{formatNumber(time.hours)}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>HRS</div>
            </div>
            <div style={{ color: "#8b5cf6", fontSize: "28px" }}>:</div>
            <div>
              <div style={{ color: "#fbbf24" }}>{formatNumber(time.minutes)}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>MIN</div>
            </div>
            <div style={{ color: "#8b5cf6", fontSize: "28px" }}>:</div>
            <div>
              <div style={{ color: "#fbbf24" }}>{formatNumber(time.seconds)}</div>
              <div style={{ fontSize: "10px", color: "#94a3b8" }}>SEC</div>
            </div>
          </div>
          <div
            style={{
              marginTop: "10px",
              background: "#22c55e",
              color: "white",
              padding: "4px 12px",
              borderRadius: "20px",
              display: "inline-block",
              fontSize: "13px",
              fontWeight: "bold",
            }}
          >
            Save 83% · ₹899
          </div>
        </div>

        {/* VIDEO PREVIEWS */}
        <div style={{ marginTop: "25px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <span style={{ fontWeight: "600", fontSize: "16px" }}>
              📸 PREVIEWS
            </span>
            <span style={{ color: "#8b5cf6", fontSize: "14px" }}>Click to expand →</span>
          </div>

          <div
            style={{
              display: "flex",
              gap: "10px",
              overflowX: "auto",
              paddingBottom: "10px",
              scrollbarWidth: "thin",
              scrollbarColor: "#8b5cf6 #1a1a2e",
            }}
          >
            {videos.map((video) => (
              <div
                key={video.id}
                onClick={() => openVideo(video)}
                style={{
                  minWidth: "150px",
                  height: "200px",
                  borderRadius: "12px",
                  overflow: "hidden",
                  border: "1px solid #2a2a4a",
                  flexShrink: 0,
                  background: "#1a1a2e",
                  cursor: "pointer",
                  position: "relative",
                  transition: "all 0.3s",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "scale(1.05)";
                  e.currentTarget.style.borderColor = "#8b5cf6";
                  e.currentTarget.style.boxShadow = "0 0 30px rgba(139, 92, 246, 0.3)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "scale(1)";
                  e.currentTarget.style.borderColor = "#2a2a4a";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                <video
                  src={video.src}
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                  muted
                  playsInline
                />
                <div
                  style={{
                    position: "absolute",
                    top: "50%",
                    left: "50%",
                    transform: "translate(-50%, -50%)",
                    fontSize: "40px",
                    opacity: 0.7,
                    textShadow: "0 0 20px rgba(0,0,0,0.8)",
                  }}
                >
                  ▶️
                </div>
                <div
                  style={{
                    position: "absolute",
                    bottom: 0,
                    left: 0,
                    right: 0,
                    padding: "10px",
                    background: "linear-gradient(transparent, rgba(0,0,0,0.8))",
                    fontSize: "12px",
                    fontWeight: "600",
                  }}
                >
                  {video.title}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* SIGN IN BUTTON */}
        <button
          onClick={() => window.location.href = "/login"}
          style={{
            width: "100%",
            padding: "16px",
            borderRadius: "50px",
            border: "none",
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
            color: "white",
            fontSize: "18px",
            fontWeight: "700",
            marginTop: "25px",
            cursor: "pointer",
            boxShadow: "0 8px 30px rgba(139, 92, 246, 0.4)",
            transition: "all 0.3s",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "scale(1.02)";
            e.target.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.6)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "scale(1)";
            e.target.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.4)";
          }}
        >
          🔐 SIGN IN
        </button>

        {/* Price */}
        <div
          style={{
            textAlign: "center",
            marginTop: "10px",
            fontSize: "14px",
          }}
        >
          <span style={{ color: "#94a3b8", textDecoration: "line-through" }}>
            ₹899
          </span>
          <span
            style={{
              color: "#22c55e",
              fontWeight: "bold",
              fontSize: "20px",
              marginLeft: "10px",
            }}
          >
            ₹199
          </span>
          <span
            style={{
              background: "#22c55e",
              color: "white",
              padding: "2px 10px",
              borderRadius: "12px",
              fontSize: "12px",
              marginLeft: "10px",
              fontWeight: "bold",
            }}
          >
            83% OFF
          </span>
        </div>

        {/* Payment Methods */}
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            gap: "15px",
            marginTop: "20px",
            fontSize: "20px",
          }}
        >
          <span>💳</span>
          <span>📱</span>
          <span>🟣</span>
          <span>🟡</span>
        </div>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "11px",
            marginTop: "5px",
          }}
        >
          Payments processed via manager
        </p>
        <p
          style={{
            textAlign: "center",
            color: "#64748b",
            fontSize: "12px",
            marginTop: "15px",
          }}
        >
          Shriya
        </p>

        {/* FULL SCREEN VIDEO POPUP */}
        {selectedVideo && (
          <div
            onClick={closeVideo}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: "rgba(0, 0, 0, 0.95)",
              zIndex: 9999,
              display: "flex",
              flexDirection: "column",
              justifyContent: "center",
              alignItems: "center",
              padding: "20px",
              animation: "fadeIn 0.3s ease",
            }}
          >
            <button
              onClick={closeVideo}
              style={{
                position: "absolute",
                top: "20px",
                right: "20px",
                background: "rgba(255,255,255,0.1)",
                border: "1px solid #475569",
                color: "white",
                fontSize: "30px",
                width: "50px",
                height: "50px",
                borderRadius: "50%",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "all 0.3s",
                zIndex: 10000,
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "rgba(255,0,0,0.3)";
                e.target.style.borderColor = "#ef4444";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "rgba(255,255,255,0.1)";
                e.target.style.borderColor = "#475569";
              }}
            >
              ✕
            </button>

            <h2
              style={{
                color: "white",
                marginBottom: "20px",
                fontSize: "20px",
                textAlign: "center",
              }}
            >
              {selectedVideo.title}
            </h2>

            <div
              style={{
                width: "100%",
                maxWidth: "800px",
                maxHeight: "80vh",
                background: "#000",
                borderRadius: "12px",
                overflow: "hidden",
                boxShadow: "0 20px 60px rgba(0,0,0,0.9)",
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <video
                src={selectedVideo.src}
                style={{
                  width: "100%",
                  height: "100%",
                  maxHeight: "80vh",
                  display: "block",
                }}
                controls
                autoPlay
                playsInline
              />
            </div>

            <p
              style={{
                color: "#64748b",
                fontSize: "14px",
                marginTop: "20px",
                opacity: 0.7,
              }}
            >
              Click outside to close • Press ESC to exit
            </p>
          </div>
        )}

        <style>
          {`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
          `}
        </style>
      </div>
    </>
  );
}

export default App;