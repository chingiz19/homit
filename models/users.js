/**
 * @author Jeyhun Gurbanov, Zaman Zamanli
 * @copyright Homit 2017
 */

var pub = {};

function sanitizeUserObject(user) {
    delete user["password"];
    return user;
}

/**
 * Finds user based on the email
 */
pub.findUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return sanitizeUserObject(dbResult);
        } else {
            // TODO: Admin
            // return db.selectAllWhere('esl_users', data).then(function (results) {
            //     if (results.length > 0)
            //         return results[0];
            //     else
            //         return false;
            // });
            return false;
        }
    });
};

/**
 * Adds user to database based on the data
 */
pub.addUser = function (userData) {
    return db.insertQuery(db.dbTables.users_customers, userData).then(function (dbResult) {
        return sanitizeUserObject(dbResult);
    });
};

/**
 * Authenticates a user based on the email and password
 */
pub.authenticateUser = function (email, password) {
    var data = { user_email: email };    
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (user) {
        if (user.length > 0) {
            Auth.comparePassword(password, user["password"]).then(function (match) {
                if (match) {
                    return sanitizeUserObject(user);
                } else {
                    return false;
                }
            });
        } else {
            return false;
        }
    });
};

module.exports = pub;