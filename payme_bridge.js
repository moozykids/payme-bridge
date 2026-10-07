const express = require('express');
const app = express();
app.use(express.json());

app.post('/payme', (req, res) => {
    const { method, params, id } = req.body;

    if (method === 'CheckPerformTransaction') {
        return res.json({
            jsonrpc: "2.0",
            result: { allow: true },
            id: id
        });
    }

    if (method === 'CreateTransaction') {
        return res.json({
            jsonrpc: "2.0",
            result: {
                create_time: Date.now(),
                transaction: params.id || "12345",
                state: 1
            },
            id: id
        });
    }

    res.json({ jsonrpc: "2.0", result: { success: true }, id: id });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
