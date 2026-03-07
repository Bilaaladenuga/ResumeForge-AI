const express = require('express');
const app = express();
const port = 5001;

app.get('/', (req, res) => {
    res.send('Server is running');
});

app.listen(port, () => {
    console.log(`Diagnostic server running on http://localhost:${port}`);
});
