import { useState } from "react";

function Payment() {
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("upi");
  const [upiId, setUpiId] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCvv, setCardCvv] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  // ===== PLANS =====
  const plans = [
    { 
      id: 1, 
      name: "Monthly", 
      price: 199, 
      features: ["All Content", "Chat Access", "Stickers", "Likes"] 
    },
    { 
      id: 2, 
      name: "Quarterly", 
      price: 499, 
      features: ["All Content", "Chat Access", "Stickers", "Likes", "Save 33%"] 
    },
    { 
      id: 3, 
      name: "Yearly", 
      price: 1499, 
      features: ["All Content", "Chat Access", "Stickers", "Likes", "Save 50%"] 
    },
  ];

  const [selectedPlan, setSelectedPlan] = useState(plans[0]);

  // ===== HANDLE PAYMENT =====
  const handlePayment = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulate payment processing
    setTimeout(() => {
      setLoading(false);
      setShowSuccess(true);
      
      // Calculate expiry date based on plan
      const expiryDate = new Date();
      if (selectedPlan.name === "Monthly") {
        expiryDate.setMonth(expiryDate.getMonth() + 1);
      } else if (selectedPlan.name === "Quarterly") {
        expiryDate.setMonth(expiryDate.getMonth() + 3);
      } else if (selectedPlan.name === "Yearly") {
        expiryDate.setFullYear(expiryDate.getFullYear() + 1);
      }

      // Save subscription in localStorage
      const subscriptionData = {
        plan: selectedPlan.name,
        price: selectedPlan.price,
        date: new Date().toLocaleDateString(),
        expiry: expiryDate.toISOString(),
        status: 'active'
      };

      localStorage.setItem('subscription', JSON.stringify(subscriptionData));
      localStorage.setItem('isPremium', 'true');
      
      alert("✅ Payment successful! Welcome to Premium! 🎉");
    }, 2000);
  };

  // ===== SUCCESS PAGE =====
  if (showSuccess) {
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
          padding: "50px",
          borderRadius: "20px",
          maxWidth: "450px",
          width: "100%",
          border: "1px solid #22c55e",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(34, 197, 94, 0.2)",
        }}>
          <div style={{ fontSize: "80px", marginBottom: "20px" }}>🎉</div>
          <h1 style={{ color: "#22c55e", fontSize: "28px", margin: "0" }}>
            Payment Successful!
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "16px", margin: "10px 0" }}>
            Welcome to Premium! You now have access to all exclusive content.
          </p>
          <div style={{
            background: "#0a0a0f",
            padding: "15px",
            borderRadius: "10px",
            margin: "20px 0",
          }}>
            <p style={{ margin: "5px 0", color: "#fbbf24" }}>
              📋 {selectedPlan.name} Plan
            </p>
            <p style={{ margin: "5px 0", color: "#22c55e" }}>
              💰 ₹{selectedPlan.price}
            </p>
            <p style={{ margin: "5px 0", color: "#94a3b8", fontSize: "13px" }}>
              📅 Active from {new Date().toLocaleDateString()}
            </p>
          </div>
          <button
            onClick={() => window.location.href = "/dashboard"}
            style={{
              width: "100%",
              padding: "14px",
              borderRadius: "50px",
              border: "none",
              background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              color: "white",
              fontSize: "18px",
              fontWeight: "700",
              cursor: "pointer",
              transition: "all 0.3s",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "scale(1.02)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "scale(1)";
            }}
          >
            Go to Dashboard 🚀
          </button>
        </div>
      </div>
    );
  }

  // ===== PAYMENT PAGE =====
  return (
    <div style={{
      background: "#0a0a0f",
      color: "white",
      minHeight: "100vh",
      fontFamily: "'Segoe UI', Arial, sans-serif",
      padding: "20px",
      maxWidth: "500px",
      margin: "0 auto",
    }}>
      <div style={{
        background: "#1a1a2e",
        padding: "30px",
        borderRadius: "20px",
        border: "1px solid #2a2a4a",
        boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        marginTop: "20px",
      }}>
        <div style={{ textAlign: "center", marginBottom: "30px" }}>
          <div style={{ fontSize: "50px", marginBottom: "10px" }}>💳</div>
          <h1 style={{ fontSize: "28px", margin: "0", color: "#fbbf24" }}>
            Subscribe Now
          </h1>
          <p style={{ color: "#94a3b8", fontSize: "14px" }}>
            Get access to all exclusive content
          </p>
        </div>

        {/* ===== PLANS ===== */}
        <div style={{ display: "flex", gap: "10px", marginBottom: "25px", flexWrap: "wrap" }}>
          {plans.map((plan) => (
            <button
              key={plan.id}
              onClick={() => setSelectedPlan(plan)}
              style={{
                flex: 1,
                padding: "15px",
                borderRadius: "12px",
                border: selectedPlan.id === plan.id ? "2px solid #8b5cf6" : "1px solid #2a2a4a",
                background: selectedPlan.id === plan.id ? "rgba(139, 92, 246, 0.2)" : "#0a0a0f",
                color: "white",
                cursor: "pointer",
                transition: "all 0.3s",
                minWidth: "80px",
              }}
            >
              <div style={{ fontWeight: "bold", fontSize: "14px" }}>{plan.name}</div>
              <div style={{ color: "#fbbf24", fontSize: "18px", fontWeight: "bold" }}>
                ₹{plan.price}
              </div>
              {plan.features.map((feature, idx) => (
                <div key={idx} style={{ color: "#94a3b8", fontSize: "10px", marginTop: "2px" }}>
                  ✅ {feature}
                </div>
              ))}
            </button>
          ))}
        </div>

        {/* ===== PAYMENT FORM ===== */}
        <form onSubmit={handlePayment}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>
              💳 Payment Method
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                type="button"
                onClick={() => setPaymentMethod("upi")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: paymentMethod === "upi" ? "2px solid #8b5cf6" : "1px solid #2a2a4a",
                  background: paymentMethod === "upi" ? "rgba(139, 92, 246, 0.2)" : "#0a0a0f",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                📱 UPI
              </button>
              <button
                type="button"
                onClick={() => setPaymentMethod("card")}
                style={{
                  flex: 1,
                  padding: "10px",
                  borderRadius: "10px",
                  border: paymentMethod === "card" ? "2px solid #8b5cf6" : "1px solid #2a2a4a",
                  background: paymentMethod === "card" ? "rgba(139, 92, 246, 0.2)" : "#0a0a0f",
                  color: "white",
                  cursor: "pointer",
                }}
              >
                💳 Card
              </button>
            </div>
          </div>

          {/* ===== UPI ===== */}
          {paymentMethod === "upi" && (
            <div style={{ marginBottom: "20px" }}>
              <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>
                📱 UPI ID
              </label>
              <input
                type="text"
                placeholder="example@upi (e.g., example@paytm)"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
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
                Support: GPay, PhonePe, Paytm, BHIM
              </div>
            </div>
          )}

          {/* ===== CARD ===== */}
          {paymentMethod === "card" && (
            <>
              <div style={{ marginBottom: "15px" }}>
                <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>
                  💳 Card Number
                </label>
                <input
                  type="text"
                  placeholder="1234 5678 9012 3456"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  required
                  maxLength="19"
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

              <div style={{ display: "flex", gap: "10px", marginBottom: "15px" }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>
                    📅 Expiry
                  </label>
                  <input
                    type="text"
                    placeholder="MM/YY"
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    required
                    maxLength="5"
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
                <div style={{ flex: 1 }}>
                  <label style={{ display: "block", color: "#94a3b8", fontSize: "14px", marginBottom: "5px" }}>
                    🔒 CVV
                  </label>
                  <input
                    type="password"
                    placeholder="123"
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    required
                    maxLength="4"
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
              </div>
            </>
          )}

          {/* ===== PAY NOW BUTTON ===== */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              padding: "16px",
              borderRadius: "50px",
              border: "none",
              background: loading
                ? "#4a4a6a"
                : "linear-gradient(135deg, #22c55e, #16a34a)",
              color: "white",
              fontSize: "20px",
              fontWeight: "700",
              cursor: loading ? "not-allowed" : "pointer",
              transition: "all 0.3s",
              boxShadow: loading
                ? "none"
                : "0 8px 30px rgba(34, 197, 94, 0.4)",
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.target.style.transform = "scale(1.02)";
                e.target.style.boxShadow = "0 12px 40px rgba(34, 197, 94, 0.6)";
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.target.style.transform = "scale(1)";
                e.target.style.boxShadow = "0 8px 30px rgba(34, 197, 94, 0.4)";
              }
            }}
          >
            {loading ? "⏳ Processing..." : `Pay ₹${selectedPlan.price}`}
          </button>

          {/* ===== SECURE BADGE ===== */}
          <div style={{
            textAlign: "center",
            marginTop: "15px",
            color: "#64748b",
            fontSize: "12px",
          }}>
            🔒 Secure Payment • 100% Protected
          </div>
        </form>

        {/* ===== BACK TO DASHBOARD ===== */}
        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <a
            href="/dashboard"
            style={{
              color: "#64748b",
              textDecoration: "none",
              fontSize: "13px",
            }}
            onMouseEnter={(e) => (e.target.style.color = "#94a3b8")}
            onMouseLeave={(e) => (e.target.style.color = "#64748b")}
          >
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default Payment;