/**
 * @copyright Homit 2018
 */

var pub = {};

pub.sanitizeUserObject = function (user) {
    delete user.password;
    return user;
};

function addIsGuest(user) {
    user.is_guest = true;
    return user;
};

/**
 * Find user based on email
 */
pub.findUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return pub.sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/**
 * Find user based on id
 */
pub.findUserById = function (id) {
    var data = { id: id };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return pub.sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/**
 * Add user to database based on data
 */
pub.addUser = function (userData) {
    return db.insertQuery(db.dbTables.users_customers, userData).then(function (dbResult) {
        if (dbResult.errno && typeof dbResult.errno === "number"){
            return false;
        }
        return dbResult.insertId;
    });
};

/**
 * Authenticate a user based on the email and password
 */
pub.authenticateUser = function (email, password) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return pub.sanitizeUserObject(user[0]);
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
 * Find guest user based on the email
 */
pub.findGuestUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhere(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return addIsGuest(pub.sanitizeUserObject(dbResult[0]));
        } else {
            return false;
        }
    });
};

/**
 * Find guest user based on the id
 */
pub.findGuestUserById = function (id) {
    var data = { id: id };
    return db.selectAllWhere(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return addIsGuest(pub.sanitizeUserObject(dbResult[0]));
        } else {
            return false;
        }
    });
};

/**
 * Add guest user to database based on the data
 */
pub.addGuestUser = function (userData) {
    return db.insertQuery(db.dbTables.users_customers_guest, userData).then(function (dbResult) {
        if (dbResult.errno && typeof dbResult.errno === "number"){
            return false;
        }
        return dbResult.insertId;
    });
};

/**
 * Update guest user data
 */
pub.updateGuestUser = function (userData, key) {
    var data = [userData, key];
    return db.updateQuery(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        if (dbResult != false) {
            return true;
        } else {
            return false;
        }
    });
};

function ifNewInfo(newData, user) {
    for (var key in newData) {
        if (newData[key] != user[key]) {
            return true;
        }
    }
    return false;
}

function isHistoryNull(user) {
    for (var key in user) {
        if (user[key] != null) {
            return false;
        }
    }
    return true;
}

/**
 * Update user data
 */
pub.updateUser = function (userData, key) {
    var data = [userData, key];
    var historyData = {
        user_id: key.id
    };

    return db.selectColumnsWhere(Object.keys(userData), db.dbTables.users_customers, key).then(function (users) {
        if (users != false) {
            if (ifNewInfo(userData, users[0])) {
                return db.updateQuery(db.dbTables.users_customers, data).then(function (dbResult) {
                    if (dbResult != false) {
                        if (!isHistoryNull(users[0])) {
                            historyData = Object.assign(historyData, users[0]);
                            return db.insertQuery(db.dbTables.users_customers_history, historyData).then(function (historyInserted) {
                                if (historyInserted != false) {
                                    return true;
                                } else {
                                    return false;
                                }
                            });
                        } else {
                            return true;
                        }
                    } else {
                        return false;
                    }
                });
            } else {
                return true;
            }
        } else {
            return false;
        }
    });
};

pub.updateCreditCard = function (userKey, cardToken, cardDigits, cardType) {
    var updateDate = {
        card_token: cardToken,
        card_type: cardType,
        card_digits: cardDigits
    };

    var data = [updateDate, userKey];

    return db.updateQuery(db.dbTables.users_customers, data).then(function (dbResult) {
        return true;
    });
};

/**
 * Authenticate csr user
 */
pub.authenticateCsrUser = function (email, password) {
    var sqlQuery = `
    SELECT *
    FROM users_employees
    WHERE role_id = 2 AND ?`;
    var data = {
        user_email: email,
    };
    return db.runQuery(sqlQuery, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return pub.sanitizeUserObject(user[0]);
                } else {
                    return false;
                }
            });
        }
        return false;
    });
};

/**
 * Find users by phone number
 */
pub.findUsersByPhone = function (phone_number) {
    var data = { phone_number: phone_number };
    var result = [];
    return db.selectAllWhere(db.dbTables.users_customers, data).then(function (dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            result.push(pub.sanitizeUserObject(dbResult[i]));
        }
        return result;
    });
};

/**
 * Find guest users by phone number
 */
pub.findGuestUsersByPhone = function (phone_number) {
    var data = { phone_number: phone_number };
    var result = [];
    return db.selectAllWhere(db.dbTables.users_customers_guest, data).then(function (dbResult) {
        for (i = 0; i < dbResult.length; i++) {
            result.push(addIsGuest(pub.sanitizeUserObject(dbResult[i])));
        }
        return result;
    });
};

/**
 * Find users by phone number including history table
 */
pub.findUsersByPhoneWithHistory = function (phone_number) {
    var data = { phone_number: phone_number };

    return findUsersWithHistory(data).then(function (result) {
        return result;
    });
};

/**
 * Find guest users by email
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

    return findUsersWithHistory(data).then(function (result) {
        return result;
    });
};

function findUsersWithHistory(data) {
    var sqlQuery = `SELECT users_customers.id AS id, users_customers.id_prefix AS id_prefix,
        users_customers.user_email AS user_email, users_customers.first_name AS first_name,
        users_customers.last_name AS last_name, users_customers.phone_number AS phone_number,
        users_customers.birth_date AS birth_date, users_customers.address1 AS address1,
        users_customers.address1_latitude AS address1_latitude,
        users_customers.address1_longitude AS address1_longitude
        
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
                            if (dbResult != false) {
                                return true;
                            } else {
                                return false;
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


/**
 * Returns hash or undefined
 * @param {*String} email 
 */
pub.getUserPasswordHash = async function (email) {
    var query = "Select password from " + db.dbTables.users_customers + " where ?";
    var data = { user_email: email };
    var pHash = await db.runQuery(query, data);
    if (!pHash[0]) {
        return false;
    }
    return pHash[0].password; 
}

pub.resetPassword = async function (email, newPassword) {
    var key = { user_email: email };
    var hashedPassword = await Auth.hashPassword(newPassword);
    var userData = { password: hashedPassword };
    var result = await db.updateQuery(db.dbTables.users_customers, [userData, key]);
    if (result != false) {
        return true;
    } else {
        return false;
    }
};

module.exports = pub;