// frontend/api/create-order.js
const Razorpay = require('razorpay');

export default async function handler(req, res) {
  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    // Get keys from environment OR use fallback hardcoded keys
    const keyId = process.env.RAZORPAY_KEY_ID || "rzp_test_T4cAGoIupg8XmO";
    const keySecret = process.env.RAZORPAY_KEY_SECRET || "5Ycgi7piH3zImcFp1uGqlT3u";

    // Create Razorpay instance
    const razorpay = new Razorpay({
      key_id: keyId,
      key_secret: keySecret,
    });

    // Create order
    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: receipt,
      payment_capture: 1,
    });

    // Send order back to client
    res.status(200).json(order);

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create order: ' + error.message 
    });
  }
}