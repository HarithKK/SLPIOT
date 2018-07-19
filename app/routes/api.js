var User = require('../models/login/users');
var config = require('../../config');
var Guid = require('guid');
var jwt = require('jsonwebtoken');
var Story = require('../models/login/story');
var secratKey = config.secretkey;

module.exports= function(app,express){
    var api=express.Router();

    // sign up
    api.post('/signup',function(req,res){

        // new user
        var user = new User({
            userId : Guid.create(),
            name : req.body.name,
            username : req.body.username,
            password:req.body.password
        });

        // saving
        user.save(function(err){
            if(err){
                res.send(err);
                return;
            }

            res.json({
                message:"User Saved"
            })
        });
    });


    // read users
    api.get('/users',function(req,res){

        User.find({},function(err,users){
            if(err){
                res.send(err);
                return;
            }
            res.json(users);
        });
        
    });

    api.post('/login',function(req,res){
        
        User.findOne({
            username:req.body.username  
        }).select('password name username userId').exec(function(err,user){
            if(err){
                res.send(err);
                return;
            }

            if(!user) {
                res.send("User Doesn't Exist");
                return;
            }else if(user){
                var pass = user.comparePassword(req.body.password);
                if(!pass){
                    res.send("Password Incorrected");
                    return;
                }else{
                     var token = createToken(user);
                     
                    res.json({
                        success:true,
                        message:"Successfully login",
                        token:token
                    }); 
                }
            }
        });
        
    });

    api.use(function(req,res,next){
        
            console.log("System requested");
        
             var token = req.body.token || req.param('token') || req.headers['x-access-token'];
        
            if(token){
                
                jwt.verify(token,secratKey,function(err,decoded){
                    if(err){
                        res.status(402).send({success:false,message:"Authentication Error"});
                        return;
                    }else{
                        req.decoded = decoded;
                        console.log(req.decoded);
                        next();
                    }
                });
        
            }else{
                res.status(402).send({success:false,message:"Token Error"});
            }
        
    });

    // routers
    api.route('/Stories')
        .post(function(req,res){
            // home page
    
            var story = new Story({
                creator: req.decoded._id,
                content: req.body.content
            });
    
            story.save(function(err){
                if(err){
                    res.send('Error');
                    return;
                }
                res.json("Story Created");
            });
        })

        .get(function(req,res){
            Story.find({creator:req.decoded._id},function(err,story){
                res.json(story);
            });
        })
    
    api.get('/me',function(req,res){
        res.json(req.decoded);
    });    

    return api;
}


function createToken(user){
    var token = jwt.sign({
        _id:user._id,
        userid:user.userid,
        name:user.name,
        username:user.username,
        password:user.password
    },secratKey);
    return token;
}
