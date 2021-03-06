const express = require('express');
const path = require('path');
const app = express();

app.use('/public', express.static(path.join(__dirname, 'public')));

app.get('/', function (req, res) {
    res.redirect('public');
});

app.listen(8080);
