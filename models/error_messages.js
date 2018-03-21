/**
 * @copyright Homit 2018
 */

var pub = {};

pub.sendMissingParams = function(res){
    var message = {
        success: false,
        "error": {
            "code": "U000",
            "dev_message": "Missing params"
        }
    };
    res.status(200).json(message);
}

// User already exists
pub.sendUserAlreadyExists = function(res){
    res.status(200).json({
        success: false,
        error: {
            code: "A002",
            "ui_message": "User already exists"
        }  
    });
}

// Invalid email, or password
pub.sendInvalidCredentials = function(res){
    res.json({
        success: false,
        error: {
            code: "A003",
            ui_message: "Invalid email, or password"
        }
    });
}
// passwords should match
pub.sendPasswordsMismatch = function(res){
    res.status(200).json({
        error: {
            dev_message: "new_password should match confirm_password"
        }
    });
}

// invalid token
pub.sendInvalidToken = function(res){
    res.status(200).json({
        success: false,
        ui_message: "Invalid token"
    });
}

// password update problem
pub.sendPasswordNotUpdated = function(res){
    res.json({
        success: false,
        ui_message: "Something went wrong while updating password, please try again. If error persists contact us at info@homit.ca or 403.800.3460"
    });
}

module.exports = pub;