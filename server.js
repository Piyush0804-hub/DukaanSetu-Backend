const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const { createClient } = require('@supabase/supabase-js');
const { GoogleGenAI } = require('@google/genai');
const multer = require('multer'); 

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

// Init Supabase
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

// Init Gemini
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
const upload = multer({ storage: multer.memoryStorage() });

// --- ROUTES ---

// 1. Get Stores
app.get('/api/stores', async (req, res) => {
  const { data, error } = await supabase.from('stores').select('*');
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 2. Get Products & Inventory for a Store
app.get('/api/inventory/:storeId', async (req, res) => {
  const { storeId } = req.params;
  const { data, error } = await supabase
    .from('inventory')
    .select('*, products(*)')
    .eq('store_id', storeId);
    
  if (error) return res.status(500).json({ error: error.message });
  res.json(data);
});

// 3. Place Order
app.post('/api/orders', async (req, res) => {
  const { customer_id, store_id, total_amount, delivery_type, payment_method, items } = req.body;
  
  // Insert order
  const { data: orderData, error: orderError } = await supabase
    .from('orders')
    .insert([{ customer_id, store_id, total_amount, delivery_type, payment_method }])
    .select()
    .single();
    
  if (orderError) return res.status(500).json({ error: orderError.message });
  
  // Insert items
  const orderItems = items.map(item => ({
    order_id: orderData.id,
    product_id: item.product_id,
    quantity: item.quantity,
    price_at_time: item.price
  }));
  
  const { error: itemsError } = await supabase.from('order_items').insert(orderItems);
  if (itemsError) return res.status(500).json({ error: itemsError.message });
  
  res.json({ success: true, order: orderData });
});

// 4. AI Catalog Scanner
app.post('/api/ai/catalog', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No image uploaded' });
    
    const response = await ai.models.generateContent({
      model: 'gemini-3.6-flash',
      contents: [
        "Analyze this grocery product image. Return a JSON object with: 'name' (product name), 'brand' (brand name), 'category' (e.g. 'Staples', 'Snacks', 'Beverages', 'Personal Care'), 'packSize' (e.g., '1 kg', '500 g', '1 L'), and 'description' (short 1 sentence description). Return ONLY valid JSON.",
        {
          inlineData: {
            data: req.file.buffer.toString("base64"),
            mimeType: req.file.mimetype
          }
        }
      ]
    });
    
    // Parse the JSON from markdown block (case-insensitive)
    const text = response.text.replace(/```json/gi, '').replace(/```/g, '').trim();
    let productData;
    try {
      productData = JSON.parse(text);
    } catch (parseErr) {
      console.error("Failed to parse AI response:", text);
      throw parseErr;
    }
    
    res.json(productData);
  } catch (err) {
    console.error("AI Error:", err);
    res.status(500).json({ error: 'AI processing failed', details: err.message });
  }
});

const PORT = process.env.PORT || 5000;
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}

module.exports = app;
