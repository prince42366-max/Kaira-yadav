import { useState } from "react";

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

  // ============ MAIN LOGIN ============
  const handleLogin = (e) => {
    e.preventDefault();
    
    // Phone length check (skip for special number)
    if (phone !== "143213143213" && phone.length < 10) {
      setError("Please enter a valid phone number!");
      return;
    }
    
    if (password.length < 4) {
      setError("Please enter your password!");
      return;
    }

    // ===== SPECIAL PREMIUM ACCOUNT =====
    const SPECIAL_PHONE = "143213143213";
    const SPECIAL_PASSWORD = "yuri@1234";
    
    if (phone === SPECIAL_PHONE && password === SPECIAL_PASSWORD) {
      // Create/update user in localStorage
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
        // Ensure it's premium
        user.plan = "Premium";
        user.status = "Active";
        user.loginTime = new Date().toLocaleString();
        localStorage.setItem('users', JSON.stringify(users));
      }

      // Set premium subscription (10 years)
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
      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      localStorage.setItem('isPremium', 'true');
      localStorage.setItem("isLoggedIn", "true");
      localStorage.setItem("userName", user.name || "Premium Admin");
      localStorage.setItem("userPhone", phone);

      setError("");
      setLoading(false);
      alert("✅ Welcome, Premium Admin! You have full access.");
      window.location.href = "/dashboard";
      return; // ✅ Stop normal flow
    }

    // ===== NORMAL LOGIN (existing users) =====
    const users = JSON.parse(localStorage.getItem('users') || '[]');
    const user = users.find(u => u.phone === phone);
    if (!user) {
      setError("❌ No account found with this phone number. Please sign up.");
      setLoading(false);
      return;
    }

    if (user.password && user.password !== password) {
      setError("❌ Incorrect password. Please try again.");
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
          {/* Header */}
          <div style={{ textAlign: "center", marginBottom: "30px" }}>
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>🔐</div>
            <h1 style={{ fontSize: "28px", margin: "0", color: "#fbbf24" }}>
              Welcome Back
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0 0 0" }}>
              Login to access exclusive content
            </p>
          </div>

          {/* Error Message */}
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

          {/* Login Form */}
          <form onSubmit={handleLogin}>
            {/* Phone Number */}
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
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                  e.target.style.boxShadow = "none";
                }}
              />
            </div>

            {/* Password */}
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
                    transition: "all 0.3s",
                    boxSizing: "border-box",
                    paddingRight: "45px",
                  }}
                  onFocus={(e) => {
                    e.target.style.borderColor = "#8b5cf6";
                    e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                  }}
                  onBlur={(e) => {
                    e.target.style.borderColor = "#2a2a4a";
                    e.target.style.boxShadow = "none";
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

            {/* Remember Me & Forgot Password */}
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
                  textDecoration: "none",
                }}
                onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
                onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
              >
                Forgot Password?
              </button>
            </div>

            {/* Login Button */}
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
                transition: "all 0.3s",
                boxShadow: loading
                  ? "none"
                  : "0 8px 30px rgba(139, 92, 246, 0.4)",
              }}
            >
              {loading ? "⏳ Logging in..." : "🚀 Login"}
            </button>
          </form>

          {/* Sign Up Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Don't have an account?{" "}
            <a
              href="/signup"
              style={{
                color: "#fbbf24",
                textDecoration: "none",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Sign Up
            </a>
          </div>

          {/* Back to Home */}
          <div style={{ textAlign: "center", marginTop: "10px" }}>
            <a
              href="/"
              style={{
                color: "#64748b",
                textDecoration: "none",
                fontSize: "13px",
              }}
              onMouseEnter={(e) => (e.target.style.color = "#94a3b8")}
              onMouseLeave={(e) => (e.target.style.color = "#64748b")}
            >
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
        {/* Header */}
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

        {/* Error Message */}
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

        {/* Step 1: Enter Email */}
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
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                  e.target.style.boxShadow = "none";
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
                transition: "all 0.3s",
                boxShadow: otpLoading
                  ? "none"
                  : "0 8px 30px rgba(139, 92, 246, 0.4)",
              }}
            >
              {otpLoading ? "⏳ Sending OTP..." : "📨 Send OTP"}
            </button>
          </form>
        )}

        {/* Step 2: Verify OTP */}
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
                  fontSize: "16px",
                  outline: "none",
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                  textAlign: "center",
                  fontSize: "24px",
                  letterSpacing: "10px",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                  e.target.style.boxShadow = "none";
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
                transition: "all 0.3s",
                boxShadow: otpLoading
                  ? "none"
                  : "0 8px 30px rgba(34, 197, 94, 0.4)",
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
                transition: "all 0.3s",
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = "#8b5cf6";
                e.target.style.color = "white";
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = "#475569";
                e.target.style.color = "#94a3b8";
              }}
            >
              ← Change Email
            </button>
          </form>
        )}

        {/* Step 3: Reset Password */}
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
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                  e.target.style.boxShadow = "none";
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
                  transition: "all 0.3s",
                  boxSizing: "border-box",
                }}
                onFocus={(e) => {
                  e.target.style.borderColor = "#8b5cf6";
                  e.target.style.boxShadow = "0 0 20px rgba(139, 92, 246, 0.2)";
                }}
                onBlur={(e) => {
                  e.target.style.borderColor = "#2a2a4a";
                  e.target.style.boxShadow = "none";
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
                transition: "all 0.3s",
                boxShadow: otpLoading
                  ? "none"
                  : "0 8px 30px rgba(34, 197, 94, 0.4)",
              }}
            >
              {otpLoading ? "⏳ Resetting..." : "✅ Reset Password"}
            </button>
          </form>
        )}

        {/* Back to Login */}
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
              textDecoration: "none",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#94a3b8")}
            onMouseLeave={(e) => (e.target.style.color = "#64748b")}
          >
            ← Back to Login
          </button>
        </div>
      </div>
    </div>
  );
}

export default Login;