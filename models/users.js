/**
 * @author Jeyhun Gurbanov, Zaman Zamanli
 * @copyright Homit 2017
 */

var pub = {};

function sanitizeUserObject(user) {
    delete user.password;
    return user;
}

function addIsGuest(user) {
    user.is_guest = true;
    return user;
}

/**
 * Finds user based on the email
 */
pub.findUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/**
 * Adds user to database based on the data
 */
pub.addUser = function (userData) {
    return db.insertQuery(db.dbTables.users_customers, userData).then(function (dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Authenticates a user based on the email and password
 */
pub.authenticateUser = function (email, password) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return sanitizeUserObject(user[0]);
                } else {
                    return false;
                }
            });
        } else {
            return false;
        }
    });
};

/**
 * Finds guest user based on the email
 */
pub.findGuestUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/**
 * Adds guest user to database based on the data
 */
pub.addGuestUser = function (userData) {
    return db.insertQuery(db.dbTables.users_customers_guest, userData).then(function (dbResult) {
        return dbResult.insertId;
    });
};

/**
 * Updates guest user data
 */
pub.updateGuestUser = function (userData, key) {
    var data = [userData, key];
    return db.updateQuery(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        if (!dbResult) {
            return false;
        } else {
            return true;
        }
    });
};

/**
 * Updates user data
 */
pub.updateUser = function (userData, key) {
    var data = [userData, key];
    return db.updateQuery(db.dbTables.users_customers, data).then(function (dbResult) {
        if (!dbResult) {
            return false;
        } else {
            return true;
        }
    });
};

/**
 * Authenticate csr user
 */
pub.authenticateCsrUser = function (email, password) {
    var sqlQuery = `
    SELECT *
    FROM users_employees
    WHERE role_id = 2 AND ?`
    var data = {
        user_email: email,
    };
    return db.runQuery(sqlQuery, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return sanitizeUserObject(user[0]);
                } else {
                    return false;
                }
            });
        }
        return false;
    });
};

/**
 * Finds users by phone number
 */
pub.findUsersByPhone = function (phone_number) {
    var data = { phone_number: phone_number };
    var result = [];
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            result.push(sanitizeUserObject(dbResult[i]));
        }
        return result;
    });
};

/**
 * Finds guest users by phone number
 */
pub.findGuestUsersByPhone = function (phone_number) {
    var data = { phone_number: phone_number };
    var result = [];
    return db.selectAllWhere(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            result.push(addIsGuest(sanitizeUserObject(dbResult[i])));
        }
        return result;
    });
};


module.exports = pub;