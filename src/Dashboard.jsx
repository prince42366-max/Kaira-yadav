import { useState, useEffect } from "react";
import { database, ref, push, onChildAdded } from "./firebase";

function Dashboard() {
  const [showChat, setShowChat] = useState(false);
  const [message, setMessage] = useState("");

  // ===== CHAT MESSAGES =====
  const [messages, setMessages] = useState(() => {
    const userPhone = localStorage.getItem('userPhone') || 'unknown';
    const saved = localStorage.getItem('chatMessages');
    if (saved) {
      const all = JSON.parse(saved);
      return all[userPhone] || [];
    }
    return [];
  });

  const [popupContent, setPopupContent] = useState(null);

  // ===== COUPONS =====
  const [coupons, setCoupons] = useState(() => {
    const saved = localStorage.getItem('userCoupons');
    return saved ? JSON.parse(saved) : 10;
  });

  const [showBuyCoupons, setShowBuyCoupons] = useState(false);

  // ===== CHECK IF SPECIAL USER =====
  const isSpecialUser = localStorage.getItem('isSpecialUser') === 'true';

  // ===== HARDCODED CONTENT =====
  const hardcodedContent = [
    {
      id: 1,
      type: "📸 Photo",
      title: "Exclusive Photo 1",
      date: new Date().toLocaleDateString(),
      file: "/photo1.jpg",
      fileType: "image",
      likes: 0,
      liked: false,
      views: 0,
      stickers: []
    },
    {
      id: 2,
      type: "📸 Photo",
      title: "Exclusive Photo 2",
      date: new Date().toLocaleDateString(),
      file: "/photo2.jpg",
      fileType: "image",
      likes: 0,
      liked: false,
      views: 0,
      stickers: []
    },
    {
      id: 3,
      type: "📸 Photo",
      title: "Exclusive Photo 3",
      date: new Date().toLocaleDateString(),
      file: "/photo3.jpg",
      fileType: "image",
      likes: 0,
      liked: false,
      views: 0,
      stickers: []
    },
    {
      id: 4,
      type: "🎬 Video",
      title: "Exclusive Video 1",
      date: new Date().toLocaleDateString(),
      file: "/video1.mp4",
      fileType: "video",
      likes: 0,
      liked: false,
      views: 0,
      stickers: []
    },
    {
      id: 5,
      type: "🎬 Video",
      title: "Exclusive Video 2",
      date: new Date().toLocaleDateString(),
      file: "/video2.mp4",
      fileType: "video",
      likes: 0,
      liked: false,
      views: 0,
      stickers: []
    },
  ];

  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('uploadedContent');
    const adminContent = saved ? JSON.parse(saved) : [];
    return [...hardcodedContent, ...adminContent];
  });

  useEffect(() => {
    const adminItems = content.filter(item => item.id > 5);
    localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
  }, [content]);

  const [unreadCount, setUnreadCount] = useState(0);

  const loadContent = () => {
    try {
      const saved = localStorage.getItem('uploadedContent');
      if (saved) {
        const parsed = JSON.parse(saved);
        const merged = [...hardcodedContent, ...parsed];
        setContent(merged);
      } else {
        setContent(hardcodedContent);
      }
    } catch (e) {
      console.error("Error loading content:", e);
    }
  };

  useEffect(() => {
    loadContent();
    window.addEventListener('focus', loadContent);
    return () => {
      window.removeEventListener('focus', loadContent);
    };
  }, []);

  // ===== CHECK UNREAD NOTIFICATIONS =====
  useEffect(() => {
    const checkUnread = () => {
      const saved = localStorage.getItem('notifications');
      if (saved) {
        const notifs = JSON.parse(saved);
        const unread = notifs.filter(n => !n.read).length;
        setUnreadCount(unread);
      }
    };
    checkUnread();
    window.addEventListener('focus', checkUnread);
    return () => {
      window.removeEventListener('focus', checkUnread);
    };
  }, []);

  // ===== SUBSCRIPTION =====
  const [subscription, setSubscription] = useState(null);

  const refreshSubscription = () => {
    const saved = localStorage.getItem('subscription');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        const expiryDate = new Date(data.expiry);
        const today = new Date();
        if (expiryDate > today) {
          setSubscription(data);
        } else {
          localStorage.removeItem('subscription');
          setSubscription(null);
        }
        return;
      } catch (e) {
        localStorage.removeItem('subscription');
        setSubscription(null);
      }
    }
    setSubscription(null);
  };

  useEffect(() => {
    refreshSubscription();
    window.addEventListener('focus', refreshSubscription);
    return () => {
      window.removeEventListener('focus', refreshSubscription);
    };
  }, []);

  const userName = localStorage.getItem('userName') || "Fan";

  const handleLogout = () => {
    window.location.href = "/login";
  };

  // ===== LOAD RAZORPAY SCRIPT =====
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  // ===== BUY COUPONS =====
  const buyCoupons = async (amount, price, couponCount) => {
    const isScriptLoaded = await loadRazorpayScript();
    if (!isScriptLoaded) {
      alert("❌ Payment gateway failed to load. Please try again.");
      return;
    }

    try {
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: amount * 100,
          currency: 'INR',
          receipt: `coupon_${Date.now()}`,
        }),
      });

      const order = await response.json();
      if (!order.id) {
        alert("❌ Failed to create order. Please try again.");
        return;
      }

      const options = {
        key: "rzp_live_T4fhMs1b6pXETJ",
        amount: amount * 100,
        currency: "INR",
        name: "Kaira Yadav Fan Platform",
        description: `${couponCount} Coupons`,
        order_id: order.id,
        handler: function(response) {
          const newCoupons = coupons + couponCount;
          setCoupons(newCoupons);
          localStorage.setItem('userCoupons', JSON.stringify(newCoupons));
          alert(`✅ Payment successful! ${couponCount} coupons added! 🎉`);
        },
        prefill: {
          name: "Fan",
          email: "fan@example.com",
          contact: "9876543210"
        },
        theme: {
          color: "#8b5cf6"
        }
      };

      const razorpay = new window.Razorpay(options);
      razorpay.open();

    } catch (error) {
      console.error("Payment error:", error);
      alert("❌ Something went wrong. Please try again.");
    }
  };

  // ===== HANDLE LIKE =====
  const handleLike = (contentId) => {
    if (isSpecialUser) {
      const updatedContent = content.map(c => 
        c.id === contentId 
          ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
          : c
      );
      setContent(updatedContent);
      const adminItems = updatedContent.filter(item => item.id > 5);
      localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
      return;
    }

    if (coupons < 2) {
      alert(`❌ You need 2 coupons to like! You have ${coupons} coupons.`);
      return;
    }

    const newCoupons = coupons - 2;
    setCoupons(newCoupons);
    localStorage.setItem('userCoupons', JSON.stringify(newCoupons));

    const updatedContent = content.map(c => 
      c.id === contentId 
        ? { ...c, liked: !c.liked, likes: c.liked ? c.likes - 1 : c.likes + 1 }
        : c
    );
    setContent(updatedContent);
    const adminItems = updatedContent.filter(item => item.id > 5);
    localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
  };

  // ===== SEND MESSAGE (FIREBASE) WITH read: false =====
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!message.trim()) return;

    if (!isSpecialUser && coupons < 5) {
      alert(`❌ You need 5 coupons to send a message! You have ${coupons} coupons.`);
      return;
    }

    if (!isSpecialUser) {
      const newCoupons = coupons - 5;
      setCoupons(newCoupons);
      localStorage.setItem('userCoupons', JSON.stringify(newCoupons));
    }

    const userPhone = localStorage.getItem('userPhone') || 'unknown';
    const userName = localStorage.getItem('userName') || 'Fan';

    // ✅ Send to Firebase with 'read: false' so admin sees unread badge
    const msgRef = ref(database, 'chatMessages');
    push(msgRef, {
      phone: userPhone,
      name: userName,
      text: message,
      from: "You",
      sender: 'fan',
      timestamp: Date.now(),
      read: false   // ← IMPORTANT: Marks as unread for admin
    });

    setMessage("");
  };

  // ===== SEND STICKER =====
  const sendStickerToContent = (contentId, sticker) => {
    if (isSpecialUser) {
      const updatedContent = content.map(c => 
        c.id === contentId 
          ? { ...c, stickers: [...(c.stickers || []), { sticker, from: "Fan", time: new Date().toLocaleTimeString() }] }
          : c
      );
      setContent(updatedContent);
      const adminItems = updatedContent.filter(item => item.id > 5);
      localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
      alert(`🎨 Sticker sent! (Free)`);
      return;
    }

    if (coupons < 2) {
      alert(`❌ You need 2 coupons to send a sticker! You have ${coupons} coupons.`);
      return;
    }

    const newCoupons = coupons - 2;
    setCoupons(newCoupons);
    localStorage.setItem('userCoupons', JSON.stringify(newCoupons));

    const updatedContent = content.map(c => 
      c.id === contentId 
        ? { ...c, stickers: [...(c.stickers || []), { sticker, from: "Fan", time: new Date().toLocaleTimeString() }] }
        : c
    );
    setContent(updatedContent);
    const adminItems = updatedContent.filter(item => item.id > 5);
    localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
    alert(`🎨 Sticker sent! (2 coupons used)`);
  };

  const stickers = ["😊", "😂", "❤️", "🔥", "🎉", "⭐", "💕", "🌟", "✨", "💪", "👏", "🙌", "🎊", "🥳", "💖", "🌈", "🦋", "🌺", "🌸", "🌻"];

  const cancelSubscription = () => {
    if (window.confirm("Are you sure you want to cancel your subscription?")) {
      localStorage.removeItem('subscription');
      setSubscription(null);
      alert("✅ Subscription cancelled successfully!");
    }
  };

  const openPopup = (item) => {
    if (item.fileType === 'video' && !subscription) {
      alert("🔒 This is premium content! Please upgrade to watch videos.");
      return;
    }
    setPopupContent(item);
    document.body.style.overflow = "hidden";
  };

  const closePopup = () => {
    setPopupContent(null);
    document.body.style.overflow = "auto";
  };

  const viewContent = (item) => {
    const updatedContent = content.map(c => 
      c.id === item.id 
        ? { ...c, views: (c.views || 0) + 1 }
        : c
    );
    setContent(updatedContent);
    const adminItems = updatedContent.filter(item => item.id > 5);
    localStorage.setItem('uploadedContent', JSON.stringify(adminItems));
  };

  const hasVideos = content && content.filter(item => item.fileType === 'video').length > 0;
  const hasPhotos = content && content.filter(item => item.fileType === 'image').length > 0;

  // ============================================================
  // LISTEN FOR FIREBASE MESSAGES (REAL-TIME)
  // ============================================================
  useEffect(() => {
    const msgRef = ref(database, 'chatMessages');
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const msg = snapshot.val();
      const userPhone = localStorage.getItem('userPhone') || 'unknown';
      if (msg.phone === userPhone || msg.sender === 'admin') {
        setMessages(prev => {
          const exists = prev.some(m => m.timestamp === msg.timestamp && m.text === msg.text);
          if (exists) return prev;
          return [...prev, msg];
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <div
      onContextMenu={(e) => { e.preventDefault(); alert("📸 Screenshots and screen recording are disabled."); return false; }}
      onKeyDown={(e) => {
        if (
          e.key === "PrintScreen" ||
          (e.ctrlKey && (e.key === "s" || e.key === "S")) ||
          (e.ctrlKey && e.shiftKey && (e.key === "s" || e.key === "S")) ||
          (e.ctrlKey && (e.key === "p" || e.key === "P"))
        ) {
          e.preventDefault();
          alert("📸 Screenshots and screen recording are disabled.");
          return false;
        }
      }}
      style={{
        background: "linear-gradient(180deg, #0a0a0f 0%, #1a1a2e 100%)",
        color: "white",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        padding: "20px",
        maxWidth: "500px",
        margin: "0 auto",
        userSelect: "none",
        WebkitUserSelect: "none",
        MozUserSelect: "none",
        msUserSelect: "none",
        position: "relative",
      }}
    >
      {/* WATERMARK */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          pointerEvents: "none",
          zIndex: 9999,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "center",
          alignItems: "center",
          opacity: 0.05,
          fontSize: "20px",
          fontWeight: "bold",
          color: "#8b5cf6",
          letterSpacing: "10px",
          transform: "rotate(-15deg)",
        }}
      >
        {Array.from({ length: 30 }).map((_, i) => (
          <span key={i} style={{ margin: "20px" }}>🔒 PRIVATE</span>
        ))}
      </div>

      {/* HEADER */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 0", borderBottom: "2px solid rgba(139, 92, 246, 0.3)", position: "relative", zIndex: 1 }}>
        <h2 style={{ margin: 0, color: "#fbbf24", fontSize: "20px", fontWeight: "700", letterSpacing: "1px" }}>👑 Fan Platform</h2>
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <a href="/notifications" style={{ color: "#94a3b8", fontSize: "22px", textDecoration: "none", position: "relative" }}>
            🔔
            {unreadCount > 0 && (
              <span style={{ position: "absolute", top: "-5px", right: "-8px", background: "#ef4444", color: "white", borderRadius: "50%", width: "18px", height: "18px", fontSize: "10px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "bold" }}>
                {unreadCount}
              </span>
            )}
          </a>
          <button onClick={handleLogout} style={{ padding: "8px 20px", borderRadius: "25px", border: "2px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.3s", position: "relative", zIndex: 1 }}
            onMouseEnter={(e) => { e.target.style.background = "#ef4444"; e.target.style.color = "white"; e.target.style.transform = "scale(1.05)"; }}
            onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#ef4444"; e.target.style.transform = "scale(1)"; }}>
            Logout
          </button>
        </div>
      </div>

      {/* WELCOME */}
      <div style={{ background: "linear-gradient(135deg, #1e1b4b, #312e81)", borderRadius: "20px", padding: "25px", marginTop: "20px", border: "1px solid rgba(139, 92, 246, 0.3)", boxShadow: "0 10px 40px rgba(139, 92, 246, 0.2)", position: "relative", zIndex: 1 }}>
        <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
          <div style={{ width: "55px", height: "55px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", boxShadow: "0 0 30px rgba(139, 92, 246, 0.4)" }}>👤</div>
          <div>
            <h3 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Welcome, {userName}! 👋</h3>
            <p style={{ margin: "4px 0 0 0", color: "#a5b4fc", fontSize: "13px", display: "flex", alignItems: "center", gap: "5px" }}>
              <span style={{ color: "#22c55e" }}>●</span> Online •
              <span style={{ color: "#fbbf24", fontWeight: "bold" }}>🎫 {coupons} coupons</span>
              {isSpecialUser && <span style={{ color: "#fbbf24", fontWeight: "bold", background: "#fbbf24", color: "#000", padding: "0 6px", borderRadius: "4px" }}>👑 Premium Admin</span>}
            </p>
          </div>
        </div>
        {!isSpecialUser && (
          <button onClick={() => setShowBuyCoupons(!showBuyCoupons)} style={{ marginTop: "15px", width: "100%", padding: "12px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #f59e0b, #d97706)", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", letterSpacing: "0.5px", boxShadow: "0 4px 20px rgba(245, 158, 11, 0.3)" }}
            onMouseEnter={(e) => { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = "0 6px 30px rgba(245, 158, 11, 0.5)"; }}
            onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(245, 158, 11, 0.3)"; }}>
            🎫 Buy Coupons
          </button>
        )}
        {isSpecialUser && (
          <div style={{ marginTop: "15px", padding: "10px", borderRadius: "10px", background: "rgba(251, 191, 36, 0.2)", border: "1px solid #fbbf24", textAlign: "center" }}>
            🎉 Unlimited Coupons & Premium Access
          </div>
        )}
      </div>

      {/* BUY COUPONS MODAL */}
      {!isSpecialUser && showBuyCoupons && (
        <div style={{ background: "#1a1a2e", borderRadius: "20px", padding: "25px", marginTop: "15px", border: "1px solid rgba(139, 92, 246, 0.3)", boxShadow: "0 10px 40px rgba(0,0,0,0.5)", animation: "slideDown 0.3s ease", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h4 style={{ margin: 0, color: "#fbbf24", fontSize: "18px" }}>🎫 Buy Coupons</h4>
            <button onClick={() => setShowBuyCoupons(false)} style={{ background: "rgba(255,255,255,0.1)", border: "none", color: "#94a3b8", fontSize: "20px", cursor: "pointer", width: "30px", height: "30px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}
              onMouseEnter={(e) => { e.target.style.background = "rgba(239,68,68,0.3)"; e.target.style.color = "#ef4444"; }}
              onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.color = "#94a3b8"; }}>
              ✕
            </button>
          </div>
          <p style={{ color: "#94a3b8", fontSize: "13px", margin: "10px 0" }}>💡 Like = 2 coupons • Chat = 5 coupons • Sticker = 2 coupons</p>
          <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "15px" }}>
            <button onClick={() => buyCoupons(15, 15, 10)} style={{ padding: "15px", borderRadius: "12px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s", fontSize: "15px" }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.background = "rgba(139, 92, 246, 0.1)"; e.target.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a4a"; e.target.style.background = "#0a0a0f"; e.target.style.transform = "scale(1)"; }}>
              <span style={{ fontSize: "16px" }}>🎫 10 Coupons</span>
              <span style={{ color: "#fbbf24", fontSize: "16px", fontWeight: "bold" }}>₹15</span>
            </button>
            <button onClick={() => buyCoupons(30, 30, 25)} style={{ padding: "15px", borderRadius: "12px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s", fontSize: "15px" }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.background = "rgba(139, 92, 246, 0.1)"; e.target.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a4a"; e.target.style.background = "#0a0a0f"; e.target.style.transform = "scale(1)"; }}>
              <span style={{ fontSize: "16px" }}>🎫 25 Coupons</span>
              <span style={{ color: "#fbbf24", fontSize: "16px", fontWeight: "bold" }}>₹30</span>
            </button>
            <button onClick={() => buyCoupons(50, 50, 50)} style={{ padding: "15px", borderRadius: "12px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", transition: "all 0.3s", fontSize: "15px" }}
              onMouseEnter={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.background = "rgba(139, 92, 246, 0.1)"; e.target.style.transform = "scale(1.02)"; }}
              onMouseLeave={(e) => { e.target.style.borderColor = "#2a2a4a"; e.target.style.background = "#0a0a0f"; e.target.style.transform = "scale(1)"; }}>
              <span style={{ fontSize: "16px" }}>🎫 50 Coupons</span>
              <span style={{ color: "#fbbf24", fontSize: "16px", fontWeight: "bold" }}>₹50</span>
            </button>
          </div>
        </div>
      )}

      {/* SUBSCRIPTION */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: subscription ? "linear-gradient(135deg, #064e3b, #065f46)" : "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "16px", padding: "18px 25px", marginTop: "15px", border: subscription ? "1px solid rgba(34, 197, 94, 0.3)" : "1px solid #2a2a4a", boxShadow: subscription ? "0 4px 20px rgba(34, 197, 94, 0.1)" : "none", position: "relative", zIndex: 1 }}>
        <div>
          <div style={{ fontSize: "13px", color: subscription ? "#6ee7b7" : "#94a3b8" }}>Subscription</div>
          <div style={{ fontWeight: "bold", color: subscription ? "#22c55e" : "#94a3b8", fontSize: "16px" }}>{subscription ? "✅ Active" : "❌ Inactive"}</div>
        </div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: "13px", color: subscription ? "#6ee7b7" : "#94a3b8" }}>Plan</div>
          <div style={{ fontWeight: "bold", color: subscription ? "#fbbf24" : "#94a3b8", fontSize: "16px" }}>{subscription ? subscription.plan : "Free"}</div>
        </div>
      </div>

      {subscription && (
        <button onClick={cancelSubscription} style={{ width: "100%", marginTop: "8px", padding: "8px", borderRadius: "10px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "12px", fontWeight: "600", transition: "all 0.3s", position: "relative", zIndex: 1 }}
          onMouseEnter={(e) => { e.target.style.background = "#ef4444"; e.target.style.color = "white"; }}
          onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#ef4444"; }}>
          Cancel Subscription
        </button>
      )}

      {!subscription && (
        <button onClick={() => window.location.href = "/payment"} style={{ width: "100%", marginTop: "8px", padding: "12px", borderRadius: "12px", border: "none", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", color: "white", fontSize: "15px", fontWeight: "700", cursor: "pointer", transition: "all 0.3s", boxShadow: "0 4px 20px rgba(139, 92, 246, 0.3)", position: "relative", zIndex: 1 }}
          onMouseEnter={(e) => { e.target.style.transform = "scale(1.02)"; e.target.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.5)"; }}
          onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)"; }}>
          💳 Upgrade to Premium
        </button>
      )}

      {/* TABS */}
      <div style={{ display: "flex", gap: "8px", marginTop: "20px", background: "#1a1a2e", borderRadius: "16px", padding: "6px", border: "1px solid rgba(139, 92, 246, 0.2)", position: "relative", zIndex: 1 }}>
        <button style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: !showChat ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "transparent", color: !showChat ? "white" : "#94a3b8", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.3s" }}
          onClick={() => setShowChat(false)}>📸 Content</button>
        <button style={{ flex: 1, padding: "12px", borderRadius: "12px", border: "none", background: showChat ? "linear-gradient(135deg, #8b5cf6, #7c3aed)" : "transparent", color: showChat ? "white" : "#94a3b8", cursor: "pointer", fontWeight: "600", fontSize: "14px", transition: "all 0.3s" }}
          onClick={() => setShowChat(true)}>💬 Chat</button>
      </div>

      {/* CONTENT */}
      {!showChat && (
        <div style={{ marginTop: "20px", position: "relative", zIndex: 1 }}>
          {!content || content.length === 0 ? (
            <div style={{ background: "linear-gradient(135deg, #1a1a2e, #16213e)", borderRadius: "20px", padding: "50px 20px", textAlign: "center", border: "1px solid rgba(139, 92, 246, 0.2)" }}>
              <div style={{ fontSize: "60px", marginBottom: "15px" }}>📭</div>
              <h4 style={{ color: "#94a3b8", margin: "10px 0", fontSize: "20px" }}>No Content Yet</h4>
              <p style={{ color: "#64748b", fontSize: "14px" }}>Check back later for exclusive photos and videos!</p>
            </div>
          ) : (
            <>
              {hasPhotos && (
                <div style={{ marginBottom: "25px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "700", fontSize: "18px", color: "#fbbf24" }}>📸 Photos</span>
                    <span style={{ color: "#8b5cf6", fontSize: "13px" }}>{content.filter(item => item.fileType === 'image').length} items</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin", scrollbarColor: "#8b5cf6 #1a1a2e" }}>
                    {content.filter(item => item.fileType === 'image').map((item) => (
                      <div key={item.id} onClick={() => { viewContent(item); openPopup(item); }} style={{ minWidth: "170px", height: "220px", borderRadius: "16px", overflow: "hidden", border: "1px solid rgba(139, 92, 246, 0.3)", flexShrink: 0, position: "relative", transition: "all 0.3s", background: "#1a1a2e", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", cursor: "pointer" }}
                        onMouseEnter={(e) => { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.3)"; }}
                        onMouseLeave={(e) => { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; }}>
                        <img src={item.file} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <div style={{ position: "absolute", bottom: "65px", left: 0, right: 0, padding: "8px", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", fontSize: "11px", textAlign: "center", fontWeight: "600", color: "white" }}>{item.title}</div>
                        <div style={{ position: "absolute", bottom: "8px", left: "8px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.7)", padding: "5px 12px", borderRadius: "20px", backdropFilter: "blur(5px)" }}>
                          <button onClick={(e) => { e.stopPropagation(); handleLike(item.id); }} style={{ background: "none", border: "none", color: item.liked ? "#ef4444" : "#94a3b8", fontSize: "16px", cursor: "pointer", padding: "0", transition: "all 0.3s" }}>{item.liked ? "❤️" : "🤍"}</button>
                          <span style={{ color: "white", fontSize: "12px", fontWeight: "600" }}>{item.likes || 0}</span>
                        </div>
                        <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.7)", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", color: "#94a3b8", backdropFilter: "blur(5px)" }}>👁️ {item.views || 0}</div>
                        <div style={{ position: "absolute", top: "8px", right: "8px", display: "flex", gap: "4px", flexWrap: "wrap", maxWidth: "90px", justifyContent: "flex-end" }}>
                          {stickers.slice(0,5).map((sticker, idx) => (
                            <button key={idx} onClick={(e) => { e.stopPropagation(); sendStickerToContent(item.id, sticker); }} style={{ fontSize: "14px", background: "rgba(0,0,0,0.6)", border: "none", cursor: "pointer", padding: "2px 4px", borderRadius: "4px", transition: "all 0.3s", backdropFilter: "blur(5px)" }}
                              onMouseEnter={(e) => { e.target.style.transform = "scale(1.3)"; }} onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}>{sticker}</button>
                          ))}
                        </div>
                        {item.stickers && item.stickers.length > 0 && (
                          <div style={{ position: "absolute", bottom: "40px", left: "8px", background: "rgba(0,0,0,0.7)", padding: "2px 10px", borderRadius: "12px", fontSize: "10px", color: "#fbbf24", backdropFilter: "blur(5px)" }}>🎨 {item.stickers.length}</div>
                        )}
                        <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "40px", opacity: 0, transition: "all 0.3s", textShadow: "0 0 30px rgba(0,0,0,0.9)", pointerEvents: "none" }} className="expand-icon">🔍</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {hasVideos && (
                <div style={{ marginTop: "25px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                    <span style={{ fontWeight: "700", fontSize: "18px", color: "#fbbf24" }}>🎬 Videos</span>
                    <span style={{ color: "#8b5cf6", fontSize: "13px" }}>{content.filter(item => item.fileType === 'video').length} items</span>
                  </div>
                  <div style={{ display: "flex", gap: "12px", overflowX: "auto", paddingBottom: "10px", scrollbarWidth: "thin", scrollbarColor: "#8b5cf6 #1a1a2e" }}>
                    {content.filter(item => item.fileType === 'video').map((item) => (
                      <div key={item.id} onClick={() => { if (!subscription) { alert("🔒 This is premium content! Please upgrade to watch videos."); return; } viewContent(item); openPopup(item); }} style={{ minWidth: "200px", height: "160px", borderRadius: "16px", overflow: "hidden", border: !subscription ? "2px solid #fbbf24" : "1px solid rgba(139, 92, 246, 0.3)", flexShrink: 0, position: "relative", transition: "all 0.3s", cursor: subscription ? "pointer" : "default", background: "#1a1a2e", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", opacity: subscription ? 1 : 0.6 }}
                        onMouseEnter={(e) => { if (subscription) { e.currentTarget.style.transform = "scale(1.03)"; e.currentTarget.style.borderColor = "#8b5cf6"; e.currentTarget.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.3)"; } }}
                        onMouseLeave={(e) => { if (subscription) { e.currentTarget.style.transform = "scale(1)"; e.currentTarget.style.borderColor = "rgba(139, 92, 246, 0.3)"; e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.3)"; } }}>
                        <video src={item.file} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted playsInline preload="metadata" key={item.id} />
                        {!subscription && (
                          <div style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.7)", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                            <div style={{ fontSize: "40px", marginBottom: "5px" }}>🔒</div>
                            <div style={{ fontSize: "12px", color: "#fbbf24", fontWeight: "bold" }}>Premium Only</div>
                          </div>
                        )}
                        {subscription && (
                          <>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "40px", opacity: 0.8, textShadow: "0 0 30px rgba(0,0,0,0.9)", pointerEvents: "none" }}>▶️</div>
                            <div style={{ position: "absolute", bottom: "65px", left: 0, right: 0, padding: "8px", background: "linear-gradient(transparent, rgba(0,0,0,0.9))", fontSize: "11px", textAlign: "center", fontWeight: "600", color: "white" }}>{item.title}</div>
                            <div style={{ position: "absolute", bottom: "8px", left: "8px", display: "flex", alignItems: "center", gap: "6px", background: "rgba(0,0,0,0.7)", padding: "5px 12px", borderRadius: "20px", backdropFilter: "blur(5px)" }}>
                              <button onClick={(e) => { e.stopPropagation(); handleLike(item.id); }} style={{ background: "none", border: "none", color: item.liked ? "#ef4444" : "#94a3b8", fontSize: "16px", cursor: "pointer", padding: "0", transition: "all 0.3s" }}>{item.liked ? "❤️" : "🤍"}</button>
                              <span style={{ color: "white", fontSize: "12px", fontWeight: "600" }}>{item.likes || 0}</span>
                            </div>
                            <div style={{ position: "absolute", bottom: "8px", right: "8px", background: "rgba(0,0,0,0.7)", padding: "5px 10px", borderRadius: "20px", fontSize: "11px", color: "#94a3b8", backdropFilter: "blur(5px)" }}>👁️ {item.views || 0}</div>
                            <div style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", fontSize: "40px", opacity: 0, transition: "all 0.3s", textShadow: "0 0 30px rgba(0,0,0,0.9)", pointerEvents: "none" }} className="expand-icon">🔍</div>
                          </>
                        )}
                      </div>
                    ))}
                  </div>
                  {!subscription && (
                    <div style={{ marginTop: "10px", padding: "12px", background: "rgba(251, 191, 36, 0.1)", borderRadius: "12px", border: "1px solid rgba(251, 191, 36, 0.2)", textAlign: "center" }}>
                      <span style={{ color: "#fbbf24", fontSize: "13px" }}>🔒 <strong>Videos are locked.</strong> Upgrade to Premium to watch!</span>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* CHAT SECTION */}
      {showChat && (
        <div style={{ marginTop: "20px", background: "#1a1a2e", borderRadius: "20px", padding: "20px", border: "1px solid rgba(139, 92, 246, 0.3)", boxShadow: "0 10px 40px rgba(0,0,0,0.3)", position: "relative", zIndex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: "15px", borderBottom: "1px solid rgba(139, 92, 246, 0.2)", marginBottom: "15px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "linear-gradient(135deg, #8b5cf6, #ec4899)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "20px", boxShadow: "0 0 30px rgba(139, 92, 246, 0.3)" }}>👩</div>
              <div>
                <div style={{ fontWeight: "700", fontSize: "15px" }}>Kaira Yadav</div>
                <div style={{ color: "#22c55e", fontSize: "12px", display: "flex", alignItems: "center", gap: "4px" }}>
                  <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: "#22c55e", display: "inline-block" }}></span>
                  Online
                </div>
              </div>
            </div>
            <div style={{ color: "#fbbf24", fontSize: "16px", fontWeight: "700", background: "rgba(251, 191, 36, 0.1)", padding: "6px 15px", borderRadius: "20px", border: "1px solid rgba(251, 191, 36, 0.2)" }}>🎫 {coupons}</div>
          </div>

          <div style={{ height: "320px", overflowY: "auto", padding: "15px", background: "#0a0a0f", borderRadius: "16px", marginBottom: "15px", border: "1px solid rgba(139, 92, 246, 0.1)" }}>
            {messages.map((msg, index) => {
              const isOwnMessage = msg.from === "You" || msg.sender === 'fan';
              return (
                <div
                  key={index}
                  style={{
                    textAlign: isOwnMessage ? "right" : "left",
                    marginBottom: "12px",
                    animation: "fadeIn 0.3s ease",
                  }}
                >
                  <div
                    style={{
                      display: "inline-block",
                      padding: "12px 18px",
                      borderRadius: "18px",
                      background: isOwnMessage
                        ? "linear-gradient(135deg, #8b5cf6, #7c3aed)"
                        : "linear-gradient(135deg, #fbbf24, #d97706)",
                      maxWidth: "80%",
                      border: isOwnMessage ? "none" : "1px solid #fbbf24",
                      boxShadow: isOwnMessage
                        ? "0 4px 15px rgba(139, 92, 246, 0.3)"
                        : "0 4px 15px rgba(251, 191, 36, 0.3)",
                    }}
                  >
                    <div
                      style={{
                        fontSize: "11px",
                        color: isOwnMessage ? "rgba(255,255,255,0.7)" : "#000000",
                        marginBottom: "4px",
                        fontWeight: "600",
                      }}
                    >
                      {isOwnMessage ? "You" : "Kaira"}
                    </div>
                    <div style={{ fontSize: "14px", lineHeight: "1.5", color: isOwnMessage ? "white" : "#000" }}>
                      {msg.text}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder={isSpecialUser ? "Send message (Unlimited)" : `Send message (${coupons} coupons left)`}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{
                flex: 1,
                padding: "12px 18px",
                borderRadius: "25px",
                border: "1px solid rgba(139, 92, 246, 0.3)",
                background: "#0a0a0f",
                color: "white",
                fontSize: "14px",
                outline: "none",
                transition: "all 0.3s",
              }}
              onFocus={(e) => { e.target.style.borderColor = "#8b5cf6"; e.target.style.boxShadow = "0 0 25px rgba(139, 92, 246, 0.2)"; }}
              onBlur={(e) => { e.target.style.borderColor = "rgba(139, 92, 246, 0.3)"; e.target.style.boxShadow = "none"; }}
            />
            <button
              type="submit"
              style={{
                padding: "12px 25px",
                borderRadius: "25px",
                border: "none",
                background: (isSpecialUser || coupons >= 5) ? "linear-gradient(135deg, #8b5cf6, #ec4899)" : "#4a4a6a",
                color: "white",
                cursor: (isSpecialUser || coupons >= 5) ? "pointer" : "not-allowed",
                fontWeight: "700",
                fontSize: "14px",
                transition: "all 0.3s",
                boxShadow: (isSpecialUser || coupons >= 5) ? "0 4px 20px rgba(139, 92, 246, 0.3)" : "none",
              }}
              onMouseEnter={(e) => { if (isSpecialUser || coupons >= 5) { e.target.style.transform = "scale(1.05)"; e.target.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.5)"; } }}
              onMouseLeave={(e) => { if (isSpecialUser || coupons >= 5) { e.target.style.transform = "scale(1)"; e.target.style.boxShadow = "0 4px 20px rgba(139, 92, 246, 0.3)"; } }}
            >
              {isSpecialUser ? "Send 💬 (Free)" : (coupons >= 5 ? "Send 💬" : "🔒 Need 5")}
            </button>
          </form>

          {!isSpecialUser && coupons < 5 && (
            <p style={{ color: "#ef4444", fontSize: "12px", marginTop: "12px", textAlign: "center", background: "rgba(239, 68, 68, 0.1)", padding: "8px", borderRadius: "10px" }}>
              ⚠️ You need 5 coupons to send a message! Buy more coupons.
            </p>
          )}
          {!isSpecialUser && coupons >= 5 && (
            <p style={{ color: "#22c55e", fontSize: "12px", marginTop: "12px", textAlign: "center", background: "rgba(34, 197, 94, 0.1)", padding: "8px", borderRadius: "10px" }}>
              ✅ 5 coupons will be used per message
            </p>
          )}
          {isSpecialUser && (
            <p style={{ color: "#fbbf24", fontSize: "12px", marginTop: "12px", textAlign: "center", background: "rgba(251, 191, 36, 0.1)", padding: "8px", borderRadius: "10px" }}>
              👑 Unlimited messages – no coupons needed!
            </p>
          )}
        </div>
      )}

      {/* POPUP */}
      {popupContent && (
        <div onClick={closePopup} style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0, 0, 0, 0.95)", zIndex: 99999, display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "center", padding: "20px", animation: "fadeIn 0.3s ease" }}>
          <button onClick={closePopup} style={{ position: "absolute", top: "20px", right: "20px", background: "rgba(255,255,255,0.1)", border: "1px solid #475569", color: "white", fontSize: "30px", width: "50px", height: "50px", borderRadius: "50%", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s", zIndex: 100000 }}
            onMouseEnter={(e) => { e.target.style.background = "rgba(255,0,0,0.3)"; e.target.style.borderColor = "#ef4444"; }}
            onMouseLeave={(e) => { e.target.style.background = "rgba(255,255,255,0.1)"; e.target.style.borderColor = "#475569"; }}>✕</button>
          <h2 style={{ color: "white", marginBottom: "20px", fontSize: "20px", textAlign: "center" }}>{popupContent.title}</h2>
          <div style={{ width: "100%", maxWidth: "800px", maxHeight: "80vh", background: "#000", borderRadius: "12px", overflow: "hidden", boxShadow: "0 20px 60px rgba(0,0,0,0.9)" }} onClick={(e) => e.stopPropagation()}>
            {popupContent.fileType === 'image' ? (
              <img src={popupContent.file} alt={popupContent.title} style={{ width: "100%", height: "100%", maxHeight: "80vh", objectFit: "contain", display: "block" }} />
            ) : (
              <video src={popupContent.file} style={{ width: "100%", height: "100%", maxHeight: "80vh", display: "block" }} controls autoPlay playsInline key={popupContent.id} />
            )}
          </div>
          <div style={{ display: "flex", gap: "20px", marginTop: "15px", color: "#94a3b8", fontSize: "14px" }}>
            <span>❤️ {popupContent.likes || 0} likes</span>
            <span>👁️ {popupContent.views || 0} views</span>
            {popupContent.stickers && <span>🎨 {popupContent.stickers.length} stickers</span>}
          </div>
          <p style={{ color: "#64748b", fontSize: "14px", marginTop: "10px", opacity: 0.7 }}>Click outside to close • Press ESC to exit</p>
        </div>
      )}

      <style>{`
        @keyframes slideDown { from { opacity: 0; transform: translateY(-20px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; transform: scale(0.95); } to { opacity: 1; transform: scale(1); } }
        ::-webkit-scrollbar { height: 4px; }
        ::-webkit-scrollbar-track { background: #1a1a2e; }
        ::-webkit-scrollbar-thumb { background: #8b5cf6; border-radius: 10px; }
        ::-webkit-scrollbar-thumb:hover { background: #7c3aed; }
        .expand-icon { opacity: 0 !important; transition: all 0.3s !important; }
        div:hover .expand-icon { opacity: 1 !important; }
        * { -webkit-touch-callout: none; -webkit-user-select: none; -moz-user-select: none; -ms-user-select: none; user-select: none; }
        img, video { -webkit-touch-callout: none; pointer-events: auto; }
      `}</style>
    </div>
  );
}

export default Dashboard;