var express = require('express');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var cors = require('cors');

var structure = require('./routes/structure');
var upload = require('./routes/upload');

var app = express();
app.use('/sg',express.static('zip_output'));
app.use(cors())
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser())

app.use('/api/v1/structure', structure);
app.use('/api/v1/upload', upload);

module.exports = app;