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
        
        // Telr API credentials from environment variables
        const storeId = process.env.TELR_STORE_ID;
        const authKey = process.env.TELR_AUTH_KEY;
        
        if (!storeId || !authKey) {
            throw new Error('Telr credentials not configured');
        }
        
        // Create Telr payment request
        const telrPayload = {
            method: 'create',
            store: storeId,
            authkey: authKey,
            order: {
                cartid: quoteRef || 'DFM-' + Date.now(),
                test: 1, // Set to 0 for production
                amount: amount,
                currency: 'AED',
                description: description || 'Wall Deco Panel Order'
            },
            customer: {
                ref: quoteRef || 'customer',
                email: clientEmail || 'customer@example.com',
                name: {
                    forenames: clientName ? clientName.split(' ')[0] : 'Customer',
                    surname: clientName ? clientName.split(' ').slice(1).join(' ') || 'Customer' : 'Customer'
                },
                phone: clientPhone || ''
            },
            return: {
                authorised: 'https://dfm-telr-api.vercel.app/payment-success.html',
                declined: 'https://dfm-telr-api.vercel.app/payment-failed.html',
                cancelled: 'https://dfm-telr-api.vercel.app/payment-cancelled.html'
            }
        };
        
        // Call Telr API
        const telrResponse = await fetch('https://secure.telr.com/gateway/order.json', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(telrPayload)
        });
        
        const telrData = await telrResponse.json();
        
        if (telrData.order && telrData.order.url) {
            res.status(200).json({
                success: true,
                paymentUrl: telrData.order.url,
                orderRef: telrData.order.ref
            });
        } else {
            throw new Error(telrData.error?.message || 'Failed to create payment');
        }
        
    } catch (error) {
        console.error('Payment creation error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
