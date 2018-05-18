var express = require('express');
var bodyParser = require('body-parser');
var methodOverride = require('method-override');
var path = require('path');
var mongoose = require('mongoose');

var router = express.Router();

var app = express();
app.use('/users',router);

var uri = 'mongodb://node-school:s_007@cluster0-shard-00-00-jkbun.mongodb.net:27017,cluster0-shard-00-01-jkbun.mongodb.net:27017,cluster0-shard-00-02-jkbun.mongodb.net:27017/test?ssl=true&replicaSet=Cluster0-shard-0&authSource=admin';
//var url = 'mongodb+srv://mongo-school_1:<PASSWORD>@cluster0-jkbun.mongodb.net/test';
// all environments
app.set('port',process.env.PORT || 3000);
app.set('views',__dirname+'/views');
app.set('view engine','jade');

// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());
// override with the X-HTTP-Method-Override header in the request
app.use(methodOverride('X-HTTP-Method-Override'));

app.use(express.static(path.join(__dirname,'public')));

const options = {
  autoIndex: false, // Don't build indexes
  reconnectTries: Number.MAX_VALUE, // Never stop trying to reconnect
  reconnectInterval: 500, // Reconnect every 500ms
  poolSize: 10, // Maintain up to 10 socket connections
  // If not connected, return errors immediately rather than waiting for reconnect
  bufferMaxEntries: 0
};

//Set up default mongoose connection
mongoose.connect(uri, options).then(
  () => {console.log('Connecting to the mongoose...');},
  err => {console.log('Database Connection Error');}
);
/* function(error) {
  console.log('Connection Error: '+error);
});*/

// Get Mongoose to use the global promise library
mongoose.Promise = global.Promise;
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

var Schema = new mongoose.Schema({
  email : String,
  name : String,
  age : Number
});

var user = mongoose.model('emp',Schema);

app.post('/new',function(req,res){
  new user({
    email : req.body.email,
    name : req.body.name,
    age  : req.body.age
  }).save(function(err,doc){
    if(err) {
      console.log(err);
    } else {
      res.send('Succesfully Inserted..');
    }
  });
});

app.post('/delete',function(req,res){
  var email = req.body.email;
  console.log('Id: '+email);
  user.findOneAndRemove({email: email},function(err){
    if(err) {
      console.log(err);
    } else {
      console.log('Succecfully deleted the id: '+email);
      res.end(email);
    }
  });

});

app.get('/find',function(req,res){
  user.find({},function(err,doc){
    if(err) {
      console.log(err);
    } else {
      doc.forEach(result => {        
        console.log('\x1b[36m%s\x1b[0m','[ Email= '+result.email+' || Name= '+result.name+' ]');
      });
      res.end(JSON.stringify(doc));
    }
  });
});

app.listen(3000, () => console.log('\x1b[33m%s\x1b[0m','App listening on port 3000!'));