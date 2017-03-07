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
        return true;
    } catch(err) {
        //TODO: If expired, sign in, if wrong, send error
        return false;
    }
};

var destroyToken = function(token) {
    console.log("token destory");
};

module.exports.createToken = createToken;
module.exports.validateToken = validateToken;
module.exports.destroyToken = destroyToken;