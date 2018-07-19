var express = require("express");
var bodyparser = require("body-parser");
var morgan = require('morgan');
var config =require('./config');
var mongoose = require('mongoose');

var app = express();

//connect mongoos
mongoose.connect(config.database,function(err){
    if(err){
        console.log("Error");
    }else{
        console.log("connected to DB");
    }
});

app.use(bodyparser.urlencoded({extended:true}))
app.use(bodyparser.json());
app.use(morgan('dev'));

app.use(express.static(__dirname+'/public'));

var api = require('./app/routes/api')(app,express);
app.use('/api',api);

app.get("*",function(req,res){
    res.sendFile(__dirname + '/public/src/index.html');
});


app.listen(config.port,function(err){
    if(err){
        console.log(err);

    }else{
        console.log('listening to port '+ config.port);
        
    }
})


