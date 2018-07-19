var db = require('mongoose');
var guid = require('guid');
var bcrypt = require('bcrypt-nodejs');

var User = new db.Schema({
    userId : {type: String, required:true, index: {unique: true}},
    name : String,
    username : {type: String, required:true, index: {unique: true}},
    password : {type: String, required:true,select:false, index: {unique: true}}
});

User.pre('save',function(next){
    var user = this;

    if(!user.isModified('password')) return next();

    bcrypt.hash(user.password,null,null,function(err,hash){
        if(err){
            return next(err);
        }else{
            user.password = hash;
            next();
        }
    });
})

User.methods.comparePassword = function comparePassword(pass){
    return bcrypt.compareSync(pass,this.password);
}

module.exports = db.model("User",User);