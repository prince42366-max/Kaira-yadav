// frontend/api/create-order.js
const Razorpay = require('razorpay');

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    console.log("Creating order for amount:", amount);

    const razorpay = new Razorpay({
      key_id: "rzp_test_T4cAGoIupg8XmO",
      key_secret: "5Ycgi7piH3zImcFp1uGqlT3u",
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