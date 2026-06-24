import { useState, useEffect } from "react";
import { database, ref, push, onChildAdded, auth, signInAnonymously } from "./firebase";

function Admin() {
  // ===== ANONYMOUS AUTH =====
  useEffect(() => {
    signInAnonymously(auth).catch(err => console.error("Admin auth error:", err));
  }, []);

  // ===== LOGIN =====
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  // ===== TABS =====
  const [activeTab, setActiveTab] = useState("dashboard");

  // ===== USERS =====
  const [users, setUsers] = useState(() => {
    const saved = localStorage.getItem('users');
    return saved ? JSON.parse(saved) : [];
  });

  // ===== CONTENT =====
  const [content, setContent] = useState(() => {
    const saved = localStorage.getItem('uploadedContent');
    return saved ? JSON.parse(saved) : [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newType, setNewType] = useState("photo");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  // ===== COUPONS =====
  const [couponPacks] = useState([
    { id: 1, amount: 10, price: 15, label: "🎫 10 Coupons" },
    { id: 2, amount: 25, price: 30, label: "🎫 25 Coupons" },
    { id: 3, amount: 50, price: 50, label: "🎫 50 Coupons" },
  ]);

  // ===== CHAT =====
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState({});
  const [newMessage, setNewMessage] = useState("");
  const [chatUsers, setChatUsers] = useState([]); // list of users with messages

  // ============================================================
  // LOAD CHAT USERS AND MESSAGES FROM FIREBASE
  // ============================================================
  useEffect(() => {
    const msgRef = ref(database, 'chatMessages');
    const unsubscribe = onChildAdded(msgRef, (snapshot) => {
      const msg = snapshot.val();
      console.log("📩 New message:", msg);

      // Update messages state
      setMessages(prev => {
        const phone = msg.phone;
        const userMsgs = prev[phone] || [];
        // Avoid duplicate
        const exists = userMsgs.some(m => m.timestamp === msg.timestamp && m.text === msg.text);
        if (exists) return prev;
        return { ...prev, [phone]: [...userMsgs, msg] };
      });

      // Update chat users list (for sidebar)
      setChatUsers(prev => {
        const exists = prev.some(u => u.phone === msg.phone);
        if (exists) {
          // Update last message time
          return prev.map(u => 
            u.phone === msg.phone 
              ? { ...u, lastMessage: msg.text, lastTimestamp: msg.timestamp, lastSender: msg.sender }
              : u
          );
        } else {
          // New user – find their name from users list
          const user = users.find(u => u.phone === msg.phone);
          return [...prev, {
            phone: msg.phone,
            name: user ? user.name : msg.name || "Unknown",
            lastMessage: msg.text,
            lastTimestamp: msg.timestamp,
            lastSender: msg.sender
          }];
        }
      });
    });

    return () => unsubscribe();
  }, [users]);

  // ============================================================
  // COMPUTE UNREAD COUNT FOR A USER
  // ============================================================
  const getUnreadCount = (phone) => {
    const msgs = messages[phone] || [];
    return msgs.filter(m => m.sender === 'fan' && m.read !== true).length;
  };

  // ============================================================
  // MARK MESSAGES AS READ WHEN ADMIN SELECTS A USER
  // ============================================================
  const markAsRead = (phone) => {
    const msgs = messages[phone] || [];
    const unreadMsgs = msgs.filter(m => m.sender === 'fan' && m.read !== true);
    if (unreadMsgs.length === 0) return;

    // Quick workaround: we'll store read status in localStorage per user.
    const key = `admin_read_${phone}`;
    localStorage.setItem(key, Date.now().toString());

    // Update local state
    setMessages(prev => {
      const updated = { ...prev };
      updated[phone] = updated[phone].map(m => {
        if (m.sender === 'fan') return { ...m, read: true };
        return m;
      });
      return updated;
    });
  };

  // ============================================================
  // SELECT USER
  // ============================================================
  const selectUser = (user) => {
    setSelectedUser(user);
    // Mark messages as read
    markAsRead(user.phone);
  };

  // ============================================================
  // ADMIN LOGIN
  // ============================================================
  const handleLogin = (e) => {
    e.preventDefault();
    if (password === "9090823982") {
      setIsLoggedIn(true);
      setError("");
    } else {
      setError("❌ Invalid password.");
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setPassword("");
  };

  // ============================================================
  // ADD CONTENT
  // ============================================================
  const handleAddContent = (e) => {
    e.preventDefault();
    if (!newTitle) {
      alert("Please enter a title!");
      return;
    }

    let fileUrl = "";
    let fileType = "";

    if (selectedFile) {
      fileUrl = URL.createObjectURL(selectedFile);
      fileType = selectedFile.type.startsWith('video/') ? 'video' : 'image';
    } else {
      if (newType === "photo") {
        if (!imageUrl) {
          alert("Please enter a photo URL or select a file!");
          return;
        }
        fileUrl = imageUrl;
        fileType = "image";
      } else {
        if (!videoUrl) {
          alert("Please enter a video URL or select a file!");
          return;
        }
        fileUrl = videoUrl;
        fileType = "video";
      }
    }

    setUploading(true);

    setTimeout(() => {
      const newItem = {
        id: Date.now(),
        type: newType === "photo" ? "📸 Photo" : "🎬 Video",
        title: newTitle,
        date: new Date().toLocaleDateString(),
        file: fileUrl,
        fileType: fileType,
        likes: 0,
        liked: false,
        views: 0,
        stickers: []
      };

      const updatedContent = [...content, newItem];
      setContent(updatedContent);
      localStorage.setItem('uploadedContent', JSON.stringify(updatedContent));
      
      const newNotif = {
        id: Date.now(),
        title: "📸 New Content Added!",
        message: `${newTitle} has been posted! Check it out now!`,
        type: "content",
        read: false,
        time: new Date().toLocaleString(),
        date: new Date().toISOString()
      };
      const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
      existing.unshift(newNotif);
      localStorage.setItem('notifications', JSON.stringify(existing));
      
      setNewTitle("");
      setImageUrl("");
      setVideoUrl("");
      setSelectedFile(null);
      setShowAddForm(false);
      setUploading(false);
      
      alert("✅ Content added! Notification sent to fans!");
    }, 500);
  };

  // ============================================================
  // DELETE CONTENT
  // ============================================================
  const handleDeleteContent = (id) => {
    if (window.confirm("Are you sure you want to delete this?")) {
      const updatedContent = content.filter(item => item.id !== id);
      setContent(updatedContent);
      localStorage.setItem('uploadedContent', JSON.stringify(updatedContent));
      alert("🗑️ Content deleted!");
    }
  };

  // ============================================================
  // SEND NOTIFICATION
  // ============================================================
  const sendNotification = () => {
    const title = prompt("Notification Title:", "New Content Alert!");
    if (title) {
      const message = prompt("Notification Message:", "Check out my new post!");
      if (message) {
        const newNotif = {
          id: Date.now(),
          title: title,
          message: message,
          type: "info",
          read: false,
          time: new Date().toLocaleString(),
          date: new Date().toISOString()
        };
        const existing = JSON.parse(localStorage.getItem('notifications') || '[]');
        existing.unshift(newNotif);
        localStorage.setItem('notifications', JSON.stringify(existing));
        alert("✅ Notification sent to all fans!");
      }
    }
  };

  // ============================================================
  // ADMIN SEND MESSAGE (TO FIREBASE)
  // ============================================================
  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    const phone = selectedUser.phone;
    const name = selectedUser.name || 'Admin';

    const msgRef = ref(database, 'chatMessages');
    push(msgRef, {
      phone: phone,
      name: name,
      text: newMessage,
      sender: 'admin',
      timestamp: Date.now(),
      read: true // admin messages are always read
    });

    setNewMessage("");
  };

  // ============================================================
  // STATS
  // ============================================================
  const totalLikes = content.reduce((sum, item) => sum + (item.likes || 0), 0);
  const totalViews = content.reduce((sum, item) => sum + (item.views || 0), 0);

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (!isLoggedIn) {
    return (
      <div style={{
        background: "#0a0a0f",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "20px",
      }}>
        <div style={{
          background: "#1a1a2e",
          padding: "40px",
          borderRadius: "20px",
          maxWidth: "400px",
          width: "100%",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ fontSize: "50px" }}>🛡️</div>
            <h1 style={{ color: "#fbbf24", fontSize: "28px", margin: "10px 0 5px 0" }}>
              Admin Panel
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px" }}>
              Enter password to continue
            </p>
          </div>

          {error && (
            <div style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
              textAlign: "center",
              fontSize: "14px",
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleLogin}>
            <input
              type="password"
              placeholder="Enter admin password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: "100%",
                padding: "12px",
                borderRadius: "10px",
                border: "1px solid #2a2a4a",
                background: "#0a0a0f",
                color: "white",
                fontSize: "16px",
                outline: "none",
                boxSizing: "border-box",
              }}
            />

            <button
              type="submit"
              style={{
                width: "100%",
                padding: "14px",
                marginTop: "20px",
                borderRadius: "50px",
                border: "none",
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
                cursor: "pointer",
              }}
            >
              🚀 Login
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "15px" }}>
            <a href="/" style={{ color: "#64748b", fontSize: "13px", textDecoration: "none" }}>
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // ADMIN DASHBOARD
  // ============================================================
  return (
    <div style={{
      background: "#0a0a0f",
      color: "white",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "20px",
      maxWidth: "1000px",
      margin: "0 auto",
    }}>
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "10px 0",
        borderBottom: "1px solid #1a1a2e",
      }}>
        <h2 style={{ color: "#fbbf24", margin: 0 }}>🛡️ Admin Panel</h2>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 20px",
            borderRadius: "20px",
            border: "1px solid #ef4444",
            background: "transparent",
            color: "#ef4444",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "600",
          }}
          onMouseEnter={(e) => {
            e.target.style.background = "#ef4444";
            e.target.style.color = "white";
          }}
          onMouseLeave={(e) => {
            e.target.style.background = "transparent";
            e.target.style.color = "#ef4444";
          }}
        >
          Logout
        </button>
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(120px, 1fr))",
        gap: "15px",
        marginTop: "20px",
      }}>
        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>👥</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>{users.length}</div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Total Users</div>
        </div>

        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>⭐</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>
            {users.filter(u => u.plan === "Premium").length}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Premium Users</div>
        </div>

        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>💰</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#22c55e" }}>
            ₹{users.filter(u => u.plan === "Premium").length * 199}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Revenue</div>
        </div>

        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>📸</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fbbf24" }}>{content.length}</div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Total Content</div>
        </div>

        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>❤️</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#ef4444" }}>
            {totalLikes}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Total Likes</div>
        </div>

        <div style={{
          background: "#1a1a2e",
          padding: "20px",
          borderRadius: "12px",
          textAlign: "center",
          border: "1px solid #2a2a4a",
        }}>
          <div style={{ fontSize: "30px" }}>👁️</div>
          <div style={{ fontSize: "24px", fontWeight: "bold", color: "#60a5fa" }}>
            {totalViews}
          </div>
          <div style={{ color: "#94a3b8", fontSize: "12px" }}>Total Views</div>
        </div>
      </div>

      <div style={{
        display: "flex",
        gap: "5px",
        marginTop: "25px",
        background: "#1a1a2e",
        borderRadius: "12px",
        padding: "5px",
        flexWrap: "wrap",
      }}>
        {["dashboard", "users", "content", "coupons", "chat"].map(tab => (
          <button
            key={tab}
            onClick={() => {
              setActiveTab(tab);
              if (tab === "chat") {
                // Refresh chat users list from messages
                const msgRef = ref(database, 'chatMessages');
                // We'll rely on the existing listener
              }
            }}
            style={{
              flex: 1,
              padding: "10px",
              borderRadius: "8px",
              border: "none",
              background: activeTab === tab ? "#8b5cf6" : "transparent",
              color: activeTab === tab ? "white" : "#94a3b8",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "14px",
              minWidth: "70px",
            }}
          >
            {tab === "dashboard" && "📊 Dashboard"}
            {tab === "users" && "👥 Users"}
            {tab === "content" && "📸 Content"}
            {tab === "coupons" && "🎫 Coupons"}
            {tab === "chat" && "💬 Chat"}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{
            background: "#1a1a2e",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #2a2a4a",
          }}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 15px 0" }}>📊 Quick Actions</h3>
            <div style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}>
              <button onClick={() => setActiveTab("content")} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#8b5cf6", color: "white", cursor: "pointer", fontWeight: "600" }}>📸 Add Content</button>
              <button onClick={sendNotification} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#f59e0b", color: "white", cursor: "pointer", fontWeight: "600" }}>🔔 Send Notification</button>
              <button onClick={() => setActiveTab("chat")} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#22c55e", color: "white", cursor: "pointer", fontWeight: "600" }}>💬 Chat with Fans</button>
              <button onClick={() => setActiveTab("users")} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: "#f59e0b", color: "white", cursor: "pointer", fontWeight: "600" }}>👥 View Users</button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "users" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{
            background: "#1a1a2e",
            padding: "20px",
            borderRadius: "12px",
            border: "1px solid #2a2a4a",
            overflowX: "auto",
          }}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 15px 0" }}>👥 All Users ({users.length})</h3>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "14px" }}>
              <thead>
                <tr style={{ color: "#94a3b8", borderBottom: "1px solid #2a2a4a" }}>
                  <th style={{ padding: "10px", textAlign: "left" }}>Name</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Phone</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Plan</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Status</th>
                  <th style={{ padding: "10px", textAlign: "left" }}>Joined</th>
                </tr>
              </thead>
              <tbody>
                {users.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #1a1a2e" }}>
                    <td style={{ padding: "10px", color: "white" }}>{user.name || "Fan"}</td>
                    <td style={{ padding: "10px", color: "#94a3b8" }}>{user.phone}</td>
                    <td style={{ padding: "10px", color: user.plan === "Premium" ? "#22c55e" : "#94a3b8" }}>{user.plan || "Free"}</td>
                    <td style={{ padding: "10px", color: user.status === "Active" ? "#22c55e" : "#ef4444" }}>{user.status || "Active"}</td>
                    <td style={{ padding: "10px", color: "#94a3b8" }}>{user.joined || "Today"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === "content" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "15px" }}>
            <h3 style={{ color: "#fbbf24", margin: 0 }}>📸 All Content ({content.length})</h3>
            <button onClick={() => setShowAddForm(!showAddForm)} style={{ padding: "10px 20px", borderRadius: "10px", border: "none", background: showAddForm ? "#ef4444" : "#22c55e", color: "white", cursor: "pointer", fontWeight: "600" }}>{showAddForm ? "❌ Cancel" : "➕ Add Content"}</button>
          </div>

          {showAddForm && (
            <div style={{ background: "#1a1a2e", padding: "25px", borderRadius: "16px", border: "1px solid #2a2a4a", marginBottom: "20px" }}>
              <h4 style={{ color: "#fbbf24", margin: "0 0 20px 0", fontSize: "18px" }}>📤 Add New Content</h4>
              <form onSubmit={handleAddContent}>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px", fontWeight: "600" }}>📝 Title</label>
                  <input type="text" placeholder="Enter title" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <div style={{ marginBottom: "15px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px", fontWeight: "600" }}>📂 Type</label>
                  <select value={newType} onChange={(e) => setNewType(e.target.value)} style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }}>
                    <option value="photo">📸 Photo</option>
                    <option value="video">🎬 Video</option>
                  </select>
                </div>
                <div style={{ marginBottom: "10px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px", fontWeight: "600" }}>📎 Choose File</label>
                  <input type="file" accept={newType === "photo" ? "image/*" : "video/*"} onChange={(e) => setSelectedFile(e.target.files[0])} style={{ width: "100%", padding: "10px", borderRadius: "10px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", fontSize: "14px", outline: "none", boxSizing: "border-box", cursor: "pointer" }} />
                  {selectedFile && <div style={{ color: "#22c55e", fontSize: "12px", marginTop: "5px" }}>✅ Selected: {selectedFile.name}</div>}
                </div>
                <div style={{ textAlign: "center", color: "#64748b", fontSize: "14px", margin: "10px 0", fontWeight: "600" }}>——— OR ———</div>
                <div style={{ marginBottom: "20px" }}>
                  <label style={{ display: "block", color: "#94a3b8", marginBottom: "5px", fontWeight: "600" }}>{newType === "photo" ? "📎 Photo URL" : "📎 Video URL"}</label>
                  <input type="text" placeholder={newType === "photo" ? "Enter photo URL" : "Enter video URL"} value={newType === "photo" ? imageUrl : videoUrl} onChange={(e) => { if (newType === "photo") setImageUrl(e.target.value); else setVideoUrl(e.target.value); }} style={{ width: "100%", padding: "12px 15px", borderRadius: "10px", border: "1px solid #2a2a4a", background: "#0a0a0f", color: "white", fontSize: "15px", outline: "none", boxSizing: "border-box" }} />
                </div>
                <button type="submit" disabled={uploading} style={{ width: "100%", padding: "14px", borderRadius: "12px", border: "none", background: uploading ? "#4a4a6a" : "linear-gradient(135deg, #22c55e, #16a34a)", color: "white", fontSize: "16px", fontWeight: "700", cursor: uploading ? "not-allowed" : "pointer" }}>{uploading ? "⏳ Adding..." : "✅ Add Content"}</button>
              </form>
            </div>
          )}

          <div style={{ background: "#1a1a2e", padding: "20px", borderRadius: "12px", border: "1px solid #2a2a4a" }}>
            {content.length === 0 ? (
              <p style={{ color: "#94a3b8", textAlign: "center", padding: "20px 0" }}>📭 No content yet. Add your first photo or video!</p>
            ) : (
              content.map(item => (
                <div key={item.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px", borderBottom: "1px solid #1a1a2e" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
                    <div style={{ width: "60px", height: "60px", borderRadius: "8px", overflow: "hidden", background: "#2a2a4a", flexShrink: 0 }}>
                      {item.fileType === 'video' ? <video src={item.file} style={{ width: "100%", height: "100%", objectFit: "cover" }} muted /> : <img src={item.file} alt={item.title} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
                    </div>
                    <div>
                      <div style={{ fontWeight: "600", fontSize: "15px" }}>{item.type} {item.title}</div>
                      <div style={{ color: "#94a3b8", fontSize: "12px" }}>{item.date} • ❤️ {item.likes || 0} likes • 👁️ {item.views || 0} views</div>
                    </div>
                  </div>
                  <button onClick={() => handleDeleteContent(item.id)} style={{ padding: "6px 14px", borderRadius: "6px", border: "1px solid #ef4444", background: "transparent", color: "#ef4444", cursor: "pointer", fontSize: "13px", fontWeight: "600", transition: "all 0.3s" }}
                    onMouseEnter={(e) => { e.target.style.background = "#ef4444"; e.target.style.color = "white"; }}
                    onMouseLeave={(e) => { e.target.style.background = "transparent"; e.target.style.color = "#ef4444"; }}>Delete</button>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === "coupons" && (
        <div style={{ marginTop: "20px" }}>
          <div style={{ background: "#1a1a2e", padding: "20px", borderRadius: "12px", border: "1px solid #2a2a4a" }}>
            <h3 style={{ color: "#fbbf24", margin: "0 0 15px 0" }}>🎫 Coupon Management</h3>
            {couponPacks.map((pack) => (
              <div key={pack.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px", borderRadius: "10px", border: "1px solid #2a2a4a", background: "#0a0a0f", marginBottom: "10px" }}>
                <div>
                  <div style={{ fontWeight: "600", fontSize: "16px" }}>{pack.label}</div>
                  <div style={{ color: "#94a3b8", fontSize: "12px" }}>{pack.amount} coupons • ₹{pack.price}</div>
                </div>
                <div><span style={{ color: "#22c55e", fontWeight: "600" }}>✅ Active</span></div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ========================================================== */}
      {/* CHAT TAB – WHATSAPP/INSTAGRAM STYLE */}
      {/* ========================================================== */}
      {activeTab === "chat" && (
        <div style={{ marginTop: "20px", display: "flex", gap: "20px", flexWrap: "wrap", height: "600px" }}>
          {/* Chat List */}
          <div style={{
            flex: "1",
            minWidth: "250px",
            background: "#1a1a2e",
            borderRadius: "12px",
            border: "1px solid #2a2a4a",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
          }}>
            <div style={{
              padding: "15px",
              borderBottom: "1px solid #2a2a4a",
              background: "#0a0a0f",
            }}>
              <h4 style={{ margin: 0, color: "#fbbf24" }}>💬 Chats</h4>
            </div>
            <div style={{ overflowY: "auto", flex: 1 }}>
              {chatUsers.length === 0 ? (
                <div style={{ padding: "20px", textAlign: "center", color: "#64748b" }}>
                  No messages yet
                </div>
              ) : (
                chatUsers
                  .sort((a, b) => (b.lastTimestamp || 0) - (a.lastTimestamp || 0))
                  .map(user => {
                    const unread = getUnreadCount(user.phone);
                    return (
                      <div
                        key={user.phone}
                        onClick={() => {
                          const fullUser = users.find(u => u.phone === user.phone) || { name: user.name, phone: user.phone };
                          selectUser(fullUser);
                        }}
                        style={{
                          padding: "12px 15px",
                          borderBottom: "1px solid #1a1a2e",
                          cursor: "pointer",
                          background: selectedUser?.phone === user.phone ? "#2a2a4a" : "transparent",
                          transition: "background 0.2s",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                        onMouseEnter={(e) => {
                          if (selectedUser?.phone !== user.phone) {
                            e.currentTarget.style.background = "#1e1e3a";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (selectedUser?.phone !== user.phone) {
                            e.currentTarget.style.background = "transparent";
                          }
                        }}
                      >
                        <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1, minWidth: 0 }}>
                          <div style={{
                            width: "40px",
                            height: "40px",
                            borderRadius: "50%",
                            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "18px",
                            flexShrink: 0,
                          }}>
                            {user.name ? user.name[0].toUpperCase() : "U"}
                          </div>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontWeight: "600", fontSize: "14px" }}>{user.name || "Unknown"}</div>
                            <div style={{
                              fontSize: "12px",
                              color: unread > 0 ? "white" : "#94a3b8",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              fontWeight: unread > 0 ? "600" : "normal",
                            }}>
                              {user.lastMessage || "No messages"}
                            </div>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "4px" }}>
                          {user.lastTimestamp && (
                            <div style={{ fontSize: "10px", color: "#64748b" }}>
                              {new Date(user.lastTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          )}
                          {unread > 0 && (
                            <div style={{
                              background: "#ef4444",
                              color: "white",
                              borderRadius: "50%",
                              minWidth: "20px",
                              height: "20px",
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              fontSize: "11px",
                              fontWeight: "bold",
                              padding: "0 6px",
                            }}>
                              {unread}
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </div>

          {/* Chat Window */}
          <div style={{
            flex: "2",
            minWidth: "300px",
            background: "#1a1a2e",
            borderRadius: "12px",
            border: "1px solid #2a2a4a",
            display: "flex",
            flexDirection: "column",
            height: "100%",
          }}>
            {selectedUser ? (
              <>
                <div style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  padding: "15px",
                  borderBottom: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                }}>
                  <div style={{
                    width: "35px",
                    height: "35px",
                    borderRadius: "50%",
                    background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}>
                    {selectedUser.name ? selectedUser.name[0].toUpperCase() : "U"}
                  </div>
                  <div>
                    <div style={{ fontWeight: "600" }}>{selectedUser.name}</div>
                    <div style={{ color: "#22c55e", fontSize: "12px" }}>🟢 Online</div>
                  </div>
                </div>

                <div style={{ flex: 1, overflowY: "auto", padding: "15px", display: "flex", flexDirection: "column", gap: "8px" }}>
                  {(messages[selectedUser.phone] || []).map((msg, idx) => {
                    const isAdmin = msg.sender === 'admin';
                    return (
                      <div
                        key={idx}
                        style={{
                          alignSelf: isAdmin ? "flex-end" : "flex-start",
                          maxWidth: "80%",
                          background: isAdmin ? "#8b5cf6" : "#2a2a4a",
                          padding: "10px 14px",
                          borderRadius: "18px",
                          borderBottomRightRadius: isAdmin ? "4px" : "18px",
                          borderBottomLeftRadius: isAdmin ? "18px" : "4px",
                          boxShadow: "0 2px 5px rgba(0,0,0,0.2)",
                        }}
                      >
                        <div style={{ fontSize: "13px", color: isAdmin ? "white" : "#e2e8f0" }}>
                          {msg.text}
                        </div>
                        <div style={{ fontSize: "10px", color: isAdmin ? "rgba(255,255,255,0.7)" : "#94a3b8", marginTop: "4px", textAlign: "right" }}>
                          {msg.timestamp ? new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>

                <form onSubmit={handleSendMessage} style={{ display: "flex", gap: "10px", padding: "15px", borderTop: "1px solid #2a2a4a", background: "#0a0a0f" }}>
                  <input
                    type="text"
                    placeholder={`Message ${selectedUser.name}...`}
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    style={{
                      flex: 1,
                      padding: "10px 15px",
                      borderRadius: "25px",
                      border: "1px solid #2a2a4a",
                      background: "#1a1a2e",
                      color: "white",
                      fontSize: "14px",
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      padding: "10px 20px",
                      borderRadius: "25px",
                      border: "none",
                      background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
                      color: "white",
                      cursor: "pointer",
                      fontWeight: "600",
                    }}
                  >
                    Send
                  </button>
                </form>
              </>
            ) : (
              <div style={{
                flex: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#64748b",
                fontSize: "16px",
              }}>
                👈 Select a chat to start messaging
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default Admin;