var pub = {};

pub.DEBUG = true; // to turn debugger on/off


pub.log = function(msg){
    if (pub.DEBUG){
        console.log(msg);
    }
}

pub.error = function(msg){
    if (pub.DEBUG){
        console.error("\x1b[31m%s\x1b[0m", msg);
    }
}

pub.warn = function(msg){
    if (pub.DEBUG){
        console.warn("\x1b[33m%s\x1b[0m", msg);
    }
}

module.exports = pub;