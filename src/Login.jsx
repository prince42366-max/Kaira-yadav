import { useState } from "react";
import {
  auth,
  GoogleAuthProvider,
  signInWithPopup
} from "./firebase";

function Login() {
  // Login states
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Forgot Password states
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [step, setStep] = useState("phone");
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);

  // ===== DEDICATED PREMIUM ACCOUNT =====
  const SPECIAL_PHONE = "143213143213";
  const SPECIAL_PASSWORD = "yuri@1234";

  // ===== GOOGLE LOGIN =====
  const handleGoogleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user; // Firebase user
      const email = user.email;
      const name = user.displayName || "Fan";
      const googleUid = user.uid;

      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let existingUser = users.find(u => u.email === email || u.googleUid === googleUid);

      if (!existingUser) {
        const newUser = {
          id: Date.now(),
          name: name,
          phone: "google_" + googleUid,   // unique for chat
          email: email,
          password: "",                    // Google users don't have a password
          plan: "Free",
          status: "Active",
          joined: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleString(),
          googleUid: googleUid,
          isGoogle: true
        };
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        existingUser = newUser;
      } else {
        existingUser.loginTime = new Date().toLocaleString();
        existingUser.name = name;          // update name from Google
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Set session
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", existingUser.name);
      localStorage.setItem("userPhone", existingUser.phone);
      localStorage.removeItem("isSpecialUser");

      // Check subscription
      const sub = JSON.parse(localStorage.getItem(`subscription_${existingUser.phone}`) || 'null');
      if (sub) {
        const expiryDate = new Date(sub.expiry);
        if (expiryDate > new Date()) {
          localStorage.setItem('isPremium', 'true');
        } else {
          localStorage.removeItem(`subscription_${existingUser.phone}`);
          localStorage.removeItem('isPremium');
        }
      } else {
        localStorage.removeItem('isPremium');
      }

      alert(`✅ Welcome, ${name}!`);
      window.location.href = "/dashboard";
    } catch (error) {
      console.error("Google login error:", error);
      setError("❌ Google sign‑in failed. Please try again.");
    }
  };

  // ============ MAIN LOGIN ============
  const handleLogin = (e) => {
    e.preventDefault();

    if (phone !== SPECIAL_PHONE && phone.length < 10) {
      setError("Please enter a valid phone number!");
      return;
    }

    if (password.length < 4) {
      setError("Please enter your password!");
      return;
    }

    // ===== SPECIAL PREMIUM ACCOUNT =====
    if (phone === SPECIAL_PHONE && password === SPECIAL_PASSWORD) {
      const users = JSON.parse(localStorage.getItem('users') || '[]');
      let user = users.find(u => u.phone === phone);
      if (!user) {
        user = {
          id: Date.now(),
          name: "Premium Admin",
          phone: phone,
          email: "premium@admin.com",
          password: password,
          plan: "Premium",
          status: "Active",
          joined: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleString()
        };
        users.push(user);
        localStorage.setItem('users', JSON.stringify(users));
      } else {
        user.plan = "Premium";
        user.status = "Active";
        user.loginTime = new Date().toLocaleString();
        localStorage.setItem('users', JSON.stringify(users));
      }

      const expiryDate = new Date();
      expiryDate.setFullYear(expiryDate.getFullYear() + 10);
      const subscriptionData = {
        plan: "Lifetime Premium",
        price: 0,
        date: new Date().toLocaleDateString(),
        expiry: expiryDate.toISOString(),
        status: 'active',
        paymentId: 'admin_' + Date.now()
      };
      localStorage.setItem(`subscription_${phone}`, JSON.stringify(subscriptionData));
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.name || "Premium Admin");
      localStorage.setItem("userPhone", phone);
      localStorage.setItem("isSpecialUser", "true");

      setError("");
      setLoading(false);
      alert("✅ Welcome, Premium Admin! You have full access.");
      window.location.href = "/dashboard";
      return;
    }

    // ===== NORMAL LOGIN =====
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone);
    if (!user) {
      setError("❌ No account found with this phone number.");
      setLoading(false);
      return;
    }

    if (user.password && user.password !== password) {
      setError("❌ Incorrect password.");
      setLoading(false);
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      user.loginTime = new Date().toLocaleString();
      localStorage.setItem('users', JSON.stringify(users));

      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.name || "Fan");
      localStorage.setItem("userPhone", phone);
      localStorage.removeItem("isSpecialUser");
      localStorage.removeItem('subscription');

      const sub = JSON.parse(localStorage.getItem(`subscription_${phone}`) || 'null');
      if (sub) {
        const expiryDate = new Date(sub.expiry);
        if (expiryDate > new Date()) {
          localStorage.setItem('isPremium', 'true');
        } else {
          localStorage.removeItem(`subscription_${phone}`);
          localStorage.removeItem('isPremium');
        }
      } else {
        localStorage.removeItem('isPremium');
      }

      alert("✅ Login successful! Welcome back!");
      window.location.href = "/dashboard";
    }, 1500);
  };

  // ============ FORGOT PASSWORD - SEND OTP VIA EMAIL ============
  const handleSendOTP = async (e) => {
    e.preventDefault();

    if (!forgotEmail) {
      setError("Please enter your email!");
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = users.find(u => u.email === forgotEmail);
    if (!userExists) {
      setError("❌ No account found with this email.");
      setOtpLoading(false);
      return;
    }

    setError("");
    setOtpLoading(true);

    try {
      const response = await fetch('/api/send-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();

      if (data.success) {
        localStorage.setItem('otp_verification', JSON.stringify({
          email: forgotEmail,
          otp: data.otp,
          timestamp: Date.now()
        }));

        setStep("otp");
        setTimer(30);
        setCanResend(false);
        alert(`✅ OTP sent to ${forgotEmail}!`);

        const countdown = setInterval(() => {
          setTimer((prev) => {
            if (prev <= 1) {
              clearInterval(countdown);
              setCanResend(true);
              return 0;
            }
            return prev - 1;
          });
        }, 1000);
      } else {
        setError(data.error || "Failed to send OTP. Please try again.");
      }
    } catch (error) {
      setError("Network error. Please try again.");
    } finally {
      setOtpLoading(false);
    }
  };

  // ============ FORGOT PASSWORD - VERIFY OTP ============
  const handleVerifyOTP = (e) => {
    e.preventDefault();

    if (otp.length < 4) {
      setError("Please enter a valid OTP!");
      return;
    }

    setError("");
    setOtpLoading(true);

    const stored = JSON.parse(localStorage.getItem('otp_verification') || '{}');
    const storedOTP = stored.otp;
    const timestamp = stored.timestamp;

    if (!storedOTP || Date.now() - timestamp > 300000) {
      setError("OTP expired. Please request a new one.");
      setOtpLoading(false);
      return;
    }

    setTimeout(() => {
      setOtpLoading(false);
      if (otp === storedOTP) {
        setStep("reset");
        alert("✅ OTP verified! Please set your new password.");
      } else {
        setError("Invalid OTP. Please try again.");
      }
    }, 1500);
  };

  // ============ FORGOT PASSWORD - RESET PASSWORD ============
  const handleResetPassword = (e) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }

    if (newPassword !== confirmNewPassword) {
      setError("Passwords do not match!");
      return;
    }

    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const userIndex = users.findIndex(u => u.email === forgotEmail);
    if (userIndex !== -1) {
      users[userIndex].password = newPassword;
      localStorage.setItem('users', JSON.stringify(users));
    }

    setError("");
    setOtpLoading(true);

    setTimeout(() => {
      setOtpLoading(false);
      alert("✅ Password reset successfully! Please login with your new password.");
      setShowForgotPassword(false);
      setStep("phone");
      setForgotEmail("");
      setOtp("");
      setNewPassword("");
      setConfirmNewPassword("");
    }, 1500);
  };

  // ============ RESEND OTP ============
  const handleResendOTP = async () => {
    if (!canResend) return;

    setTimer(30);
    setCanResend(false);

    try {
      const response = await fetch('/api/send-otp-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: forgotEmail })
      });

      const data = await response.json();
      if (data.success) {
        localStorage.setItem('otp_verification', JSON.stringify({
          email: forgotEmail,
          otp: data.otp,
          timestamp: Date.now()
        }));
        alert(`✅ New OTP sent to ${forgotEmail}!`);
      } else {
        alert("Failed to resend OTP.");
      }
    } catch (error) {
      alert("Network error.");
    }

    const countdown = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(countdown);
          setCanResend(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ============ BACK TO LOGIN ============
  const handleBackToLogin = () => {
    setShowForgotPassword(false);
    setStep("phone");
    setForgotEmail("");
    setOtp("");
    setNewPassword("");
    setConfirmNewPassword("");
    setError("");
  };

  // ============================================================
  // MAIN LOGIN FORM
  // ============================================================
  if (!showForgotPassword) {
    return (
      <div
        style={{
          background: "#0a0a0f",
          color: "white",
          minHeight: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          padding: "20px",
        }}
      >
        <div
          style={{
            background: "#1a1a2e",
            padding: "40px",
            borderRadius: "20px",
            maxWidth: "400px",
            width: "100%",
            border: "1px solid #2a2a4a",
            boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
          }}
        >
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
            <h1 style={{ fontSize: "28px", margin: "0", color: "#fbbf24" }}>
              Welcome Back
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0 0 0" }}>
              Login to access exclusive content
            </p>
          </div>

          {error && (
            <div
              style={{
                background: "rgba(239, 68, 68, 0.2)",
                border: "1px solid #ef4444",
                color: "#ef4444",
                padding: "10px",
                borderRadius: "8px",
                marginBottom: "20px",
                fontSize: "14px",
                textAlign: "center",
              }}
            >
              {error}
            </div>
          )}

          {/* GOOGLE BUTTON */}
          <button
            onClick={handleGoogleLogin}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "10px",
              border: "1px solid #2a2a4a",
              background: "#ffffff",
              color: "#000000",
              fontSize: "16px",
              fontWeight: "600",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              marginBottom: "20px",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => { e.target.style.background = "#f3f4f6"; }}
            onMouseLeave={(e) => { e.target.style.background = "#ffffff"; }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#2a2a4a" }}></div>
            <span style={{ margin: "0 15px", color: "#94a3b8", fontSize: "14px" }}>or login with phone</span>
            <div style={{ flex: 1, height: "1px", background: "#2a2a4a" }}></div>
          </div>

          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                📞 Phone Number
              </label>
              <input
                type="text"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength="12"
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                🔑 Password
              </label>
              <div style={{ position: "relative" }}>
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  style={{
                    width: "100%",
                    padding: "12px 15px",
                    borderRadius: "10px",
                    border: "1px solid #2a2a4a",
                    background: "#0a0a0f",
                    color: "white",
                    fontSize: "16px",
                    outline: "none",
                    boxSizing: "border-box",
                    paddingRight: "45px",
                  }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{
                    position: "absolute",
                    right: "12px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "#94a3b8",
                    cursor: "pointer",
                    fontSize: "18px",
                  }}
                >
                  {showPassword ? "👁️" : "🙈"}
                </button>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "25px",
                fontSize: "14px",
              }}
            >
              <label style={{ color: "#94a3b8", cursor: "pointer" }}>
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  style={{
                    marginRight: "8px",
                    accentColor: "#8b5cf6",
                    cursor: "pointer",
                  }}
                />
                Remember Me
              </label>
              <button
                type="button"
                onClick={() => setShowForgotPassword(true)}
                style={{
                  background: "none",
                  border: "none",
                  color: "#8b5cf6",
                  cursor: "pointer",
                  fontWeight: "600",
                  fontSize: "14px",
                }}
              >
                Forgot Password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                background: loading
                  ? "#4a4a6a"
                  : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
                cursor: loading ? "not-allowed" : "pointer",
                boxShadow: loading ? "none" : "0 8px 30px rgba(139, 92, 246, 0.4)",
              }}
            >
              {loading ? "⏳ Logging in..." : "🚀 Login"}
            </button>
          </form>

          <div style={{ textAlign: "center", marginTop: "20px", color: "#94a3b8", fontSize: "14px" }}>
            Don't have an account?{" "}
            <a href="/signup" style={{ color: "#fbbf24", textDecoration: "none", fontWeight: "600" }}>
              Sign Up
            </a>
          </div>
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <a href="/" style={{ color: "#64748b", textDecoration: "none", fontSize: "13px" }}>
              ← Back to Home
            </a>
          </div>
        </div>
      </div>
    );
  }

  // ============================================================
  // FORGOT PASSWORD FLOW
  // ============================================================
  return (
    <div
      style={{
        background: "#0a0a0f",
        color: "white",
        minHeight: "100vh",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: "#1a1a2e",
          padding: "40px",
          borderRadius: "20px",
          maxWidth: "400px",
          width: "100%",
          border: "1px solid #2a2a4a",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}
      >
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "40px", marginBottom: "10px" }}>
            {step === "phone" ? "📱" : step === "otp" ? "🔐" : "🔄"}
          </div>
          <h1 style={{ fontSize: "28px", margin: "0", color: "#fbbf24" }}>
            {step === "phone" && "Forgot Password"}
            {step === "otp" && "Verify OTP"}
            {step === "reset" && "Reset Password"}
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0 0 0" }}>
            {step === "phone" && "Enter your email to receive OTP"}
            {step === "otp" && `OTP sent to ${forgotEmail}`}
            {step === "reset" && "Create your new password"}
          </p>
        </div>

        {error && (
          <div
            style={{
              background: "rgba(239,68,68,0.2)",
              border: "1px solid #ef4444",
              color: "#ef4444",
              padding: "10px",
              borderRadius: "8px",
              marginBottom: "20px",
              fontSize: "14px",
              textAlign: "center",
            }}
          >
            {error}
          </div>
        )}

        {step === "phone" && (
          <form onSubmit={handleSendOTP}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                ✉️ Email Address
              </label>
              <input
                type="email"
                placeholder="Enter your registered email"
                value={forgotEmail}
                onChange={(e) => setForgotEmail(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                background: otpLoading
                  ? "#4a4a6a"
                  : "linear-gradient(135deg, #8b5cf6, #ec4899)",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
                cursor: otpLoading ? "not-allowed" : "pointer",
                boxShadow: otpLoading ? "none" : "0 8px 30px rgba(139, 92, 246, 0.4)",
              }}
            >
              {otpLoading ? "⏳ Sending OTP..." : "📨 Send OTP"}
            </button>
          </form>
        )}

        {step === "otp" && (
          <form onSubmit={handleVerifyOTP}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                🔑 Enter OTP
              </label>
              <input
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                maxLength="6"
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                  color: "white",
                  fontSize: "24px",
                  outline: "none",
                  boxSizing: "border-box",
                  textAlign: "center",
                  letterSpacing: "10px",
                }}
              />
              <div
                style={{
                  color: "#64748b",
                  fontSize: "12px",
                  marginTop: "5px",
                  textAlign: "center",
                }}
              >
                Check your email for the OTP
              </div>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: "20px",
                fontSize: "14px",
              }}
            >
              <span style={{ color: "#94a3b8" }}>
                {timer > 0 ? (
                  <>⏱️ Resend in {timer}s</>
                ) : (
                  <span style={{ color: "#22c55e" }}>✅ Ready to resend</span>
                )}
              </span>
              <button
                type="button"
                onClick={handleResendOTP}
                disabled={!canResend}
                style={{
                  background: "none",
                  border: "none",
                  color: canResend ? "#8b5cf6" : "#475569",
                  cursor: canResend ? "pointer" : "not-allowed",
                  fontWeight: "600",
                  fontSize: "14px",
                  textDecoration: "underline",
                }}
              >
                {canResend ? "🔄 Resend OTP" : "⏳ Wait..."}
              </button>
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                background: otpLoading
                  ? "#4a4a6a"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
                cursor: otpLoading ? "not-allowed" : "pointer",
                boxShadow: otpLoading ? "none" : "0 8px 30px rgba(34, 197, 94, 0.4)",
              }}
            >
              {otpLoading ? "⏳ Verifying..." : "✅ Verify OTP"}
            </button>

            <button
              type="button"
              onClick={() => {
                setStep("phone");
                setOtp("");
                setError("");
              }}
              style={{
                width: "100%",
                padding: "10px",
                marginTop: "10px",
                borderRadius: "50px",
                border: "1px solid #475569",
                background: "transparent",
                color: "#94a3b8",
                fontSize: "14px",
                fontWeight: "600",
                cursor: "pointer",
              }}
            >
              ← Change Email
            </button>
          </form>
        )}

        {step === "reset" && (
          <form onSubmit={handleResetPassword}>
            <div style={{ marginBottom: "20px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                🔑 New Password
              </label>
              <input
                type="password"
                placeholder="Enter new password (min 6 chars)"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength="6"
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{ marginBottom: "25px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                🔒 Confirm New Password
              </label>
              <input
                type="password"
                placeholder="Confirm your new password"
                value={confirmNewPassword}
                onChange={(e) => setConfirmNewPassword(e.target.value)}
                required
                style={{
                  width: "100%",
                  padding: "12px 15px",
                  borderRadius: "10px",
                  border: "1px solid #2a2a4a",
                  background: "#0a0a0f",
                  color: "white",
                  fontSize: "16px",
                  outline: "none",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <button
              type="submit"
              disabled={otpLoading}
              style={{
                width: "100%",
                padding: "14px",
                borderRadius: "50px",
                border: "none",
                background: otpLoading
                  ? "#4a4a6a"
                  : "linear-gradient(135deg, #22c55e, #16a34a)",
                color: "white",
                fontSize: "18px",
                fontWeight: "700",
                cursor: otpLoading ? "not-allowed" : "pointer",
                boxShadow: otpLoading ? "none" : "0 8px 30px rgba(34, 197, 94, 0.4)",
              }}
            >
              {otpLoading ? "⏳ Resetting..." : "✅ Reset Password"}
            </button>
          </form>
        )}

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <button
            type="button"
            onClick={handleBackToLogin}
            style={{
              background: "none",
              border: "none",
              color: "#64748b",
              cursor: "pointer",
              fontSize: "13px",
            }}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;