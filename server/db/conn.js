const { MONGO_URL } = require('../config.js')

let mongoose = require('mongoose')
let url = MONGO_URL
mongoose.connect(url)

let db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log("Successful connection to " + url)
});

module.exports = {
  db
}