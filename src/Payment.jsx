import { useState } from "react";

function Payment() {
  const [loading, setLoading] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showSuccess, setShowSuccess] = useState(false);
  const [paymentId, setPaymentId] = useState("");

  // ===== PLANS =====
  const plans = [
    { 
      id: 1, 
      name: "Monthly", 
      price: 199,
      amount: 19900,
      features: ["All Content", "Chat Access", "Stickers", "Likes"] 
    },
    { 
      id: 2, 
      name: "Quarterly", 
      price: 499,
      amount: 49900,
      features: ["All Content", "Chat Access", "Stickers", "Likes", "Save 33%"] 
    },
    { 
      id: 3, 
      name: "Yearly", 
      price: 1499,
      amount: 149900,
      features: ["All Content", "Chat Access", "Stickers", "Likes", "Save 50%"] 
    },
  ];

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

  // ===== HANDLE PAYMENT =====
  const handlePayment = async (plan) => {
    setSelectedPlan(plan);
    setLoading(true);

    try {
      // 1. Load Razorpay script
      const isScriptLoaded = await loadRazorpayScript();
      if (!isScriptLoaded) {
        alert("❌ Payment gateway failed to load. Please try again.");
        setLoading(false);
        return;
      }

      // 2. Create order via Vercel API
      const response = await fetch('/api/create-order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: plan.amount,
          currency: 'INR',
          receipt: `receipt_${Date.now()}`,
        }),
      });

      const order = await response.json();
      if (!order.id) {
        alert("❌ Failed to create order. Please try again.");
        setLoading(false);
        return;
      }

      // 3. Open Razorpay Checkout
      const options = {
        key: "rzp_test_T4cAGoIupg8XmO", // ✅ CORRECT KEY
        amount: plan.amount,
        currency: "INR",
        name: "Kaira Yadav Fan Platform",
        description: `${plan.name} Subscription`,
        order_id: order.id,
        handler: function(response) {
          setPaymentId(response.razorpay_payment_id);
          setShowSuccess(true);
          setLoading(false);
          
          // Save subscription
          const expiryDate = new Date();
          if (plan.name === "Monthly") {
            expiryDate.setMonth(expiryDate.getMonth() + 1);
          } else if (plan.name === "Quarterly") {
            expiryDate.setMonth(expiryDate.getMonth() + 3);
          } else if (plan.name === "Yearly") {
            expiryDate.setFullYear(expiryDate.getFullYear() + 1);
          }

          const subscriptionData = {
            plan: plan.name,
            price: plan.price,
            date: new Date().toLocaleDateString(),
            expiry: expiryDate.toISOString(),
            status: 'active',
            paymentId: response.razorpay_payment_id
          };

          localStorage.setItem('subscription', JSON.stringify(subscriptionData));
          localStorage.setItem('isPremium', 'true');
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
      setLoading(false);
    }
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
            Payment ID: {paymentId}
          </p>
          <div style={{
            background: "#0a0a0f",
            padding: "15px",
            borderRadius: "10px",
            margin: "20px 0",
          }}>
            <p style={{ margin: "5px 0", color: "#fbbf24" }}>
              📋 {selectedPlan?.name} Plan
            </p>
            <p style={{ margin: "5px 0", color: "#22c55e" }}>
              💰 ₹{selectedPlan?.price}
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
                border: selectedPlan?.id === plan.id ? "2px solid #8b5cf6" : "1px solid #2a2a4a",
                background: selectedPlan?.id === plan.id ? "rgba(139, 92, 246, 0.2)" : "#0a0a0f",
                color: "white",
                cursor: "pointer",
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

        {/* ===== PAY NOW BUTTON ===== */}
        <button
          onClick={() => {
            if (!selectedPlan) {
              alert("Please select a plan first!");
              return;
            }
            handlePayment(selectedPlan);
          }}
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
            boxShadow: loading ? "none" : "0 8px 30px rgba(34, 197, 94, 0.4)",
          }}
        >
          {loading ? "⏳ Processing..." : selectedPlan ? `Pay ₹${selectedPlan.price}` : "Select a Plan"}
        </button>

        <div style={{ textAlign: "center", marginTop: "15px", color: "#64748b", fontSize: "12px" }}>
          🔒 Secure Payment • UPI • Cards • Net Banking
        </div>

        <div style={{ textAlign: "center", marginTop: "15px" }}>
          <a href="/dashboard" style={{ color: "#64748b", textDecoration: "none", fontSize: "13px" }}>
            ← Back to Dashboard
          </a>
        </div>
      </div>
    </div>
  );
}

export default Payment;