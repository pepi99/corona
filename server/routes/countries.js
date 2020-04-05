const express = require('express');
const router = express.Router();

let Country = require('../models/Country')
router.get('/countryData', function (req, res) {
    const name = req.query.country;
    Country.findOne({name: name}, function (err, country) {
        if (country) {
            res.status(200);
            res.send(country)
        } else if (err) {
            console.log('Error while trying to get country data: ' + err);
        }
    })
});
router.get('/getAllData', function (req, res) {
    Country.find({}, function (err, countries) {
        if (err) {
            console.log('Error while trying to fetch countries from database: ', err)
        } else {
            res.status(200)
            res.send(countries)
        }
    })
});
module.exports = router;