import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
    
    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }
    
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }
    
    try {
        const { id } = req.query;
        
        if (!id) {
            return res.status(400).json({ error: 'Quote ID required' });
        }
        
        // Initialize Supabase client
        const supabase = createClient(
            process.env.SUPABASE_URL,
            process.env.SUPABASE_ANON_KEY
        );
        
        // Get quote from Supabase
        const { data, error } = await supabase
            .from('quotes')
            .select('quote_data')
            .eq('quote_id', id)
            .single();
        
        if (error || !data) {
            return res.status(404).json({ 
                success: false, 
                error: 'Quote not found' 
            });
        }
        
        res.status(200).json({
            success: true,
            quote: data.quote_data
        });
        
    } catch (error) {
        console.error('Get quote error:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message 
        });
    }
}
