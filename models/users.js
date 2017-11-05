/**
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
    var historyData = {
        user_id: key.id
    };

    return db.selectColumnsWhere(Object.keys(userData), db.dbTables.users_customers, key).then(function (users) {
        if (users != false) {
            historyData = Object.assign(historyData, users[0]);
            return db.insertQuery(db.dbTables.users_customers_history, historyData).then(function (historyInserted) {
                if (historyInserted != false) {
                    return db.updateQuery(db.dbTables.users_customers, data).then(function (dbResult) {
                        if (!dbResult) {
                            return false;
                        } else {
                            return true;
                        }
                    });
                } else {
                    return false;
                }
            });
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

/**
 * Find users by phone number including history table
 */
pub.findUsersByPhoneWithHistory = function (phone_number) {
    var data = { phone_number: phone_number };

    var sqlQuery = `SELECT users_customers.id AS id, users_customers.id_prefix AS id_prefix,
    users_customers.user_email AS user_email, users_customers.first_name AS first_name,
    users_customers.last_name AS last_name, users_customers.phone_number AS phone_number,
    users_customers.birth_date AS birth_date, users_customers.address1 AS address1,
    users_customers.address2 AS address2, users_customers.address3 AS address3
    
    FROM users_customers
    WHERE ? OR id IN (
        SELECT DISTINCT user_id FROM users_customers_history
        WHERE ?
    ) `;

    return db.runQuery(sqlQuery, [data, data]).then(function (dbResult) {
        return dbResult;
    });
};

/**
 * Finds guest users by email
 */
pub.findGuestUsersByEmail = function (user_email) {
    var result = [];
    return this.findGuestUser(user_email).then(function (guest) {
        if (guest != false) {
            result.push(addIsGuest(guest));
        }
        return result;
    });
};

/**
 * Find users by email including history table
 */
pub.findUsersByEmailWithHistory = function (user_email) {
    var data = { user_email: user_email };

    var sqlQuery = `SELECT users_customers.id AS id, users_customers.id_prefix AS id_prefix,
    users_customers.user_email AS user_email, users_customers.first_name AS first_name,
    users_customers.last_name AS last_name, users_customers.phone_number AS phone_number,
    users_customers.birth_date AS birth_date, users_customers.address1 AS address1,
    users_customers.address2 AS address2, users_customers.address3 AS address3
    
    FROM users_customers
    WHERE ? OR id IN (
        SELECT DISTINCT user_id FROM users_customers_history
        WHERE ?
    ) `;

    return db.runQuery(sqlQuery, [data, data]).then(function (dbResult) {
        return dbResult;
    });
};

pub.updatePassword = function (userId, oldPassword, newPassword) {
    var key = { id: userId };
    return db.selectColumnsWhere("password", db.dbTables.users_customers, key).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(oldPassword, user[0].password).then(function (match) {
                if (match) {
                    return Auth.hashPassword(newPassword).then(function (hashedPassword) {
                        var userData = { password: hashedPassword };
                        var data = [userData, key];
                        return db.updateQuery(db.dbTables.users_customers, data).then(function (dbResult) {
                            if (!dbResult) {
                                return false;
                            } else {
                                return true;
                            }
                        });
                    });
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