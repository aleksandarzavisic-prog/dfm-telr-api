import { createClient } from '@supabase/supabase-js';

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
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        const quoteData = req.body;
        
        // Generate quote ID
        const quoteId = quoteData.ref || 'DFM-' + Date.now().toString().slice(-6);
        
        // Save to Supabase
        const { data, error } = await supabase
            .from('quotes')
            .insert({
                quote_id: quoteId,
                quote_data: {
                    ...quoteData,
                    ref: quoteId,
                    createdAt: new Date().toISOString()
                }
            });
        
        if (error) {
            throw new Error(error.message);
        }
        
        // Generate quote URL
        const baseUrl = 'https://dfm-telr-api.vercel.app';
        const quoteUrl = `${baseUrl}/quote.html?id=${quoteId}`;
        
        res.status(200).json({
            success: true,
            quoteId: quoteId,
            quoteUrl: quoteUrl
        });
        
    } catch (error) {
        console.error('Save quote error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
