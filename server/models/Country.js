const mongoose = require('mongoose');

const CountrySchema = mongoose.Schema({
    // days: [{
    //     date: String,
    //     confirmed: Number,
    //     deaths: Number
    //     recovered: Number
    // }],
    name: {},
    confirmed: {},
    deaths: {},
    recovered: {}

});
const Country = module.exports = mongoose.model('Country', CountrySchema);