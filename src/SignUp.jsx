import { useState } from "react";

function SignUp() {
  // ===== FORM STATES =====
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // ===== OTP STATES =====
  const [step, setStep] = useState("form"); // "form" or "otp"
  const [otp, setOtp] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(30);
  const [canResend, setCanResend] = useState(false);
  const [userData, setUserData] = useState(null); // Store user data for final signup

  // ============================================================
  // HANDLE FORM SUBMIT - SEND OTP
  // ============================================================
  const handleSignUp = (e) => {
    e.preventDefault();
    
    if (name.length < 2) {
      setError("Please enter your full name!");
      return;
    }
    
    if (phone.length < 10) {
      setError("Please enter a valid 10-digit phone number!");
      return;
    }
    
    if (!email) {
      setError("Please enter your email!");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters!");
      return;
    }
    
    if (password !== confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    // Check if user already exists
    const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
    const userExists = existingUsers.find(u => u.phone === phone || u.email === email);
    if (userExists) {
      setError("User with this phone or email already exists!");
      return;
    }

    setError("");
    setOtpLoading(true);
    
    // Store user data for later
    setUserData({
      name,
      phone,
      email,
      password,
    });

    // Simulate sending OTP
    setTimeout(() => {
      setOtpLoading(false);
      setStep("otp");
      setTimer(30);
      setCanResend(false);
      alert(`📱 OTP sent to ${phone}! (Demo: 123456)`);
      
      // Start countdown
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
    }, 1500);
  };

  // ============================================================
  // VERIFY OTP
  // ============================================================
  const handleVerifyOTP = (e) => {
    e.preventDefault();
    
    if (otp.length < 4) {
      setError("Please enter a valid OTP!");
      return;
    }

    setError("");
    setOtpLoading(true);
    
    setTimeout(() => {
      setOtpLoading(false);
      
      // Demo OTP: 123456
      if (otp === "123456" || otp.length >= 4) {
        // ===== SAVE USER DATA =====
        const userDataToSave = {
          id: Date.now(),
          name: userData.name,
          phone: userData.phone,
          email: userData.email,
          plan: "Free",
          status: "Active",
          joined: new Date().toLocaleDateString(),
          loginTime: new Date().toLocaleString()
        };
        
        const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
        existingUsers.push(userDataToSave);
        localStorage.setItem('users', JSON.stringify(existingUsers));
        
        // Save login session
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("userName", userData.name);
        localStorage.setItem("userPhone", userData.phone);
        
        alert("✅ Account created successfully! Welcome aboard! 🎉");
        window.location.href = "/dashboard";
      } else {
        setError("Invalid OTP. Please try again.");
      }
    }, 1500);
  };

  // ============================================================
  // RESEND OTP
  // ============================================================
  const handleResendOTP = () => {
    if (!canResend) return;
    
    setTimer(30);
    setCanResend(false);
    alert(`📱 New OTP sent to ${phone}! (Demo: 123456)`);
    
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

  // ============================================================
  // GO BACK TO FORM
  // ============================================================
  const handleBackToForm = () => {
    setStep("form");
    setOtp("");
    setError("");
  };

  // ============================================================
  // LOGIN SCREEN
  // ============================================================
  if (step === "form") {
    return (
      <div
        style={{
          background: "#0a0a0f",
          color: "white",
          minHeight: "100vh",
          fontFamily: "'Segoe UI', Arial, sans-serif",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
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
            <div style={{ fontSize: "40px", marginBottom: "10px" }}>✨</div>
            <h1 style={{ fontSize: "28px", margin: "0", color: "#fbbf24" }}>
              Create Account
            </h1>
            <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0 0 0" }}>
              Join the exclusive community
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

          {/* Sign Up Form */}
          <form onSubmit={handleSignUp}>
            {/* Full Name */}
            <div style={{ marginBottom: "15px" }}>
              <label
                style={{
                  display: "block",
                  color: "#94a3b8",
                  fontSize: "14px",
                  marginBottom: "5px",
                  fontWeight: "600",
                }}
              >
                👤 Full Name
              </label>
              <input
                type="text"
                placeholder="Enter your full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
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

            {/* Phone Number */}
            <div style={{ marginBottom: "15px" }}>
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
                type="tel"
                placeholder="Enter your phone number"
                value={phone}
                onChange={(e) => setPhone(e.target.value.replace(/\D/g, ""))}
                maxLength="10"
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
              <div style={{ color: "#64748b", fontSize: "12px", marginTop: "5px" }}>
                Enter 10-digit phone number
              </div>
            </div>

            {/* Email */}
            <div style={{ marginBottom: "15px" }}>
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
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
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
            <div style={{ marginBottom: "15px" }}>
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
                  placeholder="Create a password (min 6 chars)"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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

            {/* Confirm Password */}
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
                🔒 Confirm Password
              </label>
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Confirm your password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
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

            {/* Sign Up Button */}
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
              onMouseEnter={(e) => {
                if (!otpLoading) {
                  e.target.style.transform = "scale(1.02)";
                  e.target.style.boxShadow = "0 12px 40px rgba(139, 92, 246, 0.6)";
                }
              }}
              onMouseLeave={(e) => {
                if (!otpLoading) {
                  e.target.style.transform = "scale(1)";
                  e.target.style.boxShadow = "0 8px 30px rgba(139, 92, 246, 0.4)";
                }
              }}
            >
              {otpLoading ? "⏳ Sending OTP..." : "📨 Sign Up"}
            </button>
          </form>

          {/* Login Link */}
          <div
            style={{
              textAlign: "center",
              marginTop: "20px",
              color: "#94a3b8",
              fontSize: "14px",
            }}
          >
            Already have an account?{" "}
            <a
              href="/login"
              style={{
                color: "#fbbf24",
                textDecoration: "none",
                fontWeight: "600",
              }}
              onMouseEnter={(e) => (e.target.style.textDecoration = "underline")}
              onMouseLeave={(e) => (e.target.style.textDecoration = "none")}
            >
              Sign In
            </a>
          </div>

          {/* Back to Home */}
          <div
            style={{
              textAlign: "center",
              marginTop: "10px",
            }}
          >
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
  // OTP VERIFICATION SCREEN
  // ============================================================
  return (
    <div
      style={{
        background: "#0a0a0f",
        color: "white",
        minHeight: "100vh",
        fontFamily: "'Segoe UI', Arial, sans-serif",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
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
            Verify OTP
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px", margin: "5px 0 0 0" }}>
            OTP sent to {phone}
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

        <form onSubmit={handleVerifyOTP}>
          {/* OTP Input */}
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
              Demo OTP: 123456
            </div>
          </div>

          {/* Timer & Resend */}
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

          {/* Verify Button */}
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
            onMouseEnter={(e) => {
              if (!otpLoading) {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 12px 40px rgba(34, 197, 94, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!otpLoading) {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 8px 30px rgba(34, 197, 94, 0.4)";
              }
            }}
          >
            {otpLoading ? "⏳ Verifying..." : "✅ Verify & Create Account"}
          </button>

          {/* Back Button */}
          <button
            type="button"
            onClick={handleBackToForm}
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
            ← Change Phone Number
          </button>
        </form>
      </div>
    </div>
  );
}

export default SignUp;