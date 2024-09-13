var mongoose = require('mongoose')
var url = "mongodb+srv://w1509517798:T1509517798w@cluster0.lnmxp7l.mongodb.net/db?retryWrites=true&w=majority&appName=Cluster0"
mongoose.connect(url)

var db = mongoose.connection
db.on('error', console.error.bind(console, 'connection error:'))
db.once('open', function () {
  console.log("Successful connection to " + url)
});


module.exports = {
  db
}