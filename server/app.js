const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const mongoose = require('mongoose');
const config = require('./config/database');
const cors = require('cors');
const morgan = require('morgan');
const app = express();
const serveStatic = require('serve-static');


let countries = require('./routes/countries');
let api = require('./routes/api');
app.use(morgan('combine'));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect(config.database, {useNewUrlParser: true, useUnifiedTopology: true});
let db = mongoose.connection;


db.once('open', function () {
    console.log('Connected to MongoDB');
});
db.on('error', function (error) {
    console.log('DB Error: ', error);
});
app.use('/', serveStatic(path.join(__dirname, '../client/dist')));
app.use(bodyParser.urlencoded({extended: false}));
app.use('/countries', countries);
app.use('/api', api);

app.get('/', function (req, res) {
    res.send({
        message: 'Home page'
    })
});

app.listen(process.env.PORT || 8081, '0.0.0.0', () => {
    console.log('listening')
});


