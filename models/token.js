// Source: https://www.npmjs.com/package/jsonwebtoken

var jwt = require('jsonwebtoken');
const secretKey = "secretToken";


var createToken = function(userId) {
    var token = jwt.sign({data: userId},
        secretKey, { expiresIn: '1h' });
    return token;
};

var validateToken = function(userId, token) {
    try {
        var decoded = jwt.verify(token, secretKey);
        return "valid";
    } catch(err) {
        if (err == jwt.TokenExpiredError) {
            return "expired";
        } else {
            Logger.log(err);
            return "wrong";
        }
    }
};

var destroyToken = function(token) {
    //TODO: impement
    Logger.log("token destroy");
};

module.exports.createToken = createToken;
module.exports.validateToken = validateToken;
module.exports.destroyToken = destroyToken;