// frontend/api/create-order.js
export default function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    console.log("Amount:", amount);

    // ALWAYS return a valid order
    return res.status(200).json({
      id: 'order_' + Math.random().toString(36).substring(2, 15),
      amount: amount,
      currency: currency,
      receipt: receipt,
    });
  } catch (error) {
    return res.status(500).json({ 
      error: 'Error: ' + error.message 
    });
  }
}