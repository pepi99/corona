const express = require('express');
const router = express.Router();
const arguments = process.argv;
const fetch = require('node-fetch');
let Country = require('../models/Country');

let time = (parseInt(arguments[2] || 8) * 60 * 60 * 1000).toFixed(1);
console.log(time)

function fetchCountryData() {
    Country.deleteMany({}, function() {}); // clears the collection
    console.log('aaa')
    fetch('https://pomber.github.io/covid19/timeseries.json')
        .then(res => res.json())
        .then(data => {
            let countryNames = Object.keys(data)
            for (let j = 0; j < countryNames.length; j++) {
                let countryName = countryNames[j];
                let country = data[countryName];
                let confirmed = {};
                let deaths = {};
                let recovered = {};
                for (let i=0; i<country.length; i++) {
                    date = country[i].date;
                    confirmed[date] = country[i].confirmed;
                    deaths[date] = country[i].deaths;
                    recovered[date] = country[i].recovered;
                }
                let _Country =  new Country({
                    name: countryName,
                    confirmed: confirmed,
                    deaths: deaths,
                    recovered: recovered
                });
                _Country.save(function(error) {
                    if(error) {
                        console.log('Error saving country: ' + err)
                    }
                    else {
                        console.log('Country saved ' + j)
                    }
                })
            }
        })
}

fetchCountryData();
setInterval(fetchCountryData, time);

module.exports = router;