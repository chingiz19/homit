// Source: https://www.npmjs.com/package/jsonwebtoken

var jwt = require('jsonwebtoken');
const secretKey = "secretToken";


var createToken = function(data) {
    var token = jwt.sign(data, secretKey, { expiresIn: '10h' });
    return token;
};

var validateToken = function(token) {
    try {
        var decoded = jwt.verify(token, secretKey);
        return decoded;
    } catch(err) {
        if (err == jwt.TokenExpiredError) {
            return false;
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