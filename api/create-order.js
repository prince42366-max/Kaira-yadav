// frontend/api/create-order.js
export default async function handler(req, res) {
  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, currency, receipt } = req.body;

    console.log("Amount received:", amount);

    // Return a mock order (ALWAYS works)
    res.status(200).json({
      id: 'order_mock_' + Date.now(),
      amount: amount,
      currency: currency,
      receipt: receipt,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ 
      error: 'Server error: ' + error.message 
    });
  }
}