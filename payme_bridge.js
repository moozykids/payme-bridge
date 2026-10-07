const express = require('express');
const axios = require('axios');
const app = express();
app.use(express.json());

// Main Payme endpoint route
app.post('/payme', async (req, res) => {
    const { method, params, id } = req.body;
    const storeName = process.env.SHOPIFY_STORE_NAME;
    const clientId = process.env.SHOPIFY_CLIENT_ID;
    const clientSecret = process.env.SHOPIFY_CLIENT_SECRET;

    // 1. Payme checks if the order is valid
    if (method === 'CheckPerformTransaction') {
        return res.json({ jsonrpc: "2.0", result: { allow: true }, id });
    }

    // 2. Payme processes the actual payment card
    if (method === 'CreateTransaction') {
        try {
            // Automatically authenticates with Shopify Dev system using Client ID & Secret
            const authResponse = await axios.post(`https://${storeName}://`, {
                client_id: clientId,
                client_secret: clientSecret,
                grant_type: 'client_credentials'
            });

            const accessToken = authResponse.data.access_token;
            const orderId = params.account.order_id || "12345";

            // Instantly marks your Shopify order status as Paid
            await axios.post(`https://${storeName}://{orderId}/transactions.json`, {
                transaction: { currency: "UZS", amount: params.amount / 100, kind: "capture", status: "success" }
            }, {
                headers: { 'X-Shopify-Access-Token': accessToken, 'Content-Type': 'application/json' }
            });

        } catch (error) {
            console.error("Shopify bridge sync update failed:", error.message);
        }

        return res.json({
            jsonrpc: "2.0",
            result: { create_time: Date.now(), transaction: params.id || "12345", state: 1 },
            id
        });
    }

    res.json({ jsonrpc: "2.0", result: { success: true }, id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Active server listening on port ${PORT}`));
