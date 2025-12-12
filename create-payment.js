export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { amount, description, clientName, clientEmail, clientPhone, quoteRef } = req.body;

    if (!amount || !quoteRef) {
      return res.status(400).json({ error: 'Missing required fields: amount, quoteRef' });
    }

    // Telr API credentials from environment variables
    const STORE_ID = process.env.TELR_STORE_ID;
    const AUTH_KEY = process.env.TELR_AUTH_KEY;

    if (!STORE_ID || !AUTH_KEY) {
      return res.status(500).json({ error: 'Telr credentials not configured' });
    }

    // Create Telr payment request
    const telrRequest = {
      method: 'create',
      store: STORE_ID,
      authkey: AUTH_KEY,
      order: {
        cartid: quoteRef,
        test: 0, // Set to 1 for testing, 0 for live
        amount: parseFloat(amount).toFixed(2),
        currency: 'AED',
        description: description || `Wall Deco Panel - ${quoteRef}`
      },
      customer: {
        name: {
          forenames: clientName || 'Customer',
          surname: ''
        },
        email: clientEmail || 'customer@email.com',
        phone: clientPhone || ''
      },
      return: {
        authorised: `https://defactomobili.com/payment-success?ref=${quoteRef}`,
        declined: `https://defactomobili.com/payment-failed?ref=${quoteRef}`,
        cancelled: `https://defactomobili.com/payment-cancelled?ref=${quoteRef}`
      }
    };

    // Call Telr API
    const telrResponse = await fetch('https://secure.telr.com/gateway/order.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(telrRequest)
    });

    const telrData = await telrResponse.json();

    if (telrData.order && telrData.order.url) {
      return res.status(200).json({
        success: true,
        paymentUrl: telrData.order.url,
        orderRef: telrData.order.ref,
        quoteRef: quoteRef
      });
    } else {
      console.error('Telr Error:', telrData);
      return res.status(400).json({
        success: false,
        error: telrData.error?.message || 'Failed to create payment link'
      });
    }

  } catch (error) {
    console.error('Server Error:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
}
