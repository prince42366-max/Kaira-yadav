// frontend/api/create-order.js
import Razorpay from 'razorpay';

export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    console.log("Amount received:", amount);

    // Use hardcoded keys (since environment variables are not working)
    const razorpay = new Razorpay({
      key_id: "rzp_live_T4fhMs1b6pXETJ",
      key_secret: "kpLiXJWtPMowmAPkFyLSYbvK",
    });

    const order = await razorpay.orders.create({
      amount: amount,
      currency: currency,
      receipt: receipt,
      payment_capture: 1,
    });

    console.log("Order created:", order.id);
    res.status(200).json(order);

  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ 
      error: 'Failed to create order: ' + error.message 
    });
  }
}