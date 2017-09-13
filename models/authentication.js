var cookiee = require('cookie-encryption');
global.vault = cookiee(global.secretKey, {
    cookie: "homit",
    maxAge: 60 * 60 * 1000, // 1 hour
    signed: true,
    httpOnly: true
});


function sign(req, res, obj){
    try{
        res.cookie("user", obj, {maxAge: 60 * 60 * 1000, httpOnly: false});
        vault.write(req, JSON.stringify(obj));
        return true;
    } catch(e){
        console.log(e);
        return false;
    }
}

function clear(res){
    res.clearCookie('homit');
    res.clearCookie('user');
    vault.flush();
}

function validate(options){
    return function(req, res, next){
        if (req.session){
            var user = vault.read(req);
            if (user && user.startsWith("{")){
                user = JSON.parse(user);
                if (user.user_email == req.cookies.user.user_email){
                    next();
                    return;
                }
            }
        }
        if (options && options.redirect){
            res.redirect("/");
        } else {
            res.status(400).send("Not Authorized");
        }
    }
}

module.exports.validate = validate;
module.exports.clear = clear;
module.exports.sign = sign;
