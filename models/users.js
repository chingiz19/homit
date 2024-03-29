/**
 * @copyright Homit 2018
 */

let pub = {};

pub.sanitizeUserObject = function (user) {
    delete user.password;
    return user;
};

function addIsGuest(user) {
    user.is_guest = 1;
    return user;
};

/**
 * Find user based on email
 */
pub.findUser = function (email) {
    var data = { user_email: email };
    return db.selectAllWhereLimitOne(db.tables.users_customers, data).then(function (dbResult) {
        if (dbResult.length > 0) {
            return pub.sanitizeUserObject(dbResult[0]);
        } else {
            return false;
        }
    });
};

/**
 * Changes flag on email_verified to 'true'
 * @param {*} userId user ID
 */
pub.verifyUserAccount = async function (userId, receivedEmail) {
    let user = await User.findUser(receivedEmail);

    if (user) {
        let whereData = { id: userId };
        let setData = { email_verified: true };

        let result = await db.updateQuery(db.tables.users_customers, [setData, whereData]);
        return (result && true);
    }

    return false;
};

/**
 * Find user based on id
 */
pub.findUserById = async function (id) {
    var data = { id: id };
    var dbResult = await db.selectAllWhereLimitOne(db.tables.users_customers, data);
    if (dbResult.length > 0) {
        return pub.sanitizeUserObject(dbResult[0]);
    } else {
        return false;
    }
};

/**
 * Add user to database based on data
 */
pub.addUser = function (userData) {
    return db.insertQuery(db.tables.users_customers, userData).then(function (dbResult) {
        if (dbResult.errno && typeof dbResult.errno === "number") {
            Logger.log.debug("Couldn't add user to db", {function: "Users.addUser"});
            return false;
        }
        Logger.log.debug("Successfully added user to db", {function: "Users.addUser"});
        return dbResult.insertId;
    });
};

/**
 * Authenticate a user based on the email and password
 */
pub.authenticateUser = function (email, password) {
    var data = { user_email: email };
    return db.selectAllWhereLimitOne(db.tables.users_customers, data).then(function (user) {
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
    return db.selectAllWhereLimitOne(db.tables.users_customers_guest, data).then(function (dbResult) {
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
    return db.selectAllWhereLimitOne(db.tables.users_customers_guest, data).then(function (dbResult) {
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
    return db.insertQuery(db.tables.users_customers_guest, userData).then(function (dbResult) {
        if (dbResult.errno && typeof dbResult.errno === "number") {
            Logger.log.debug("Couldn't add guest user", {function: "Users.addGuestUser"});
            return false;
        }
        Logger.log.debug("Successfully added guest user", {function: "Users.addGuestUser"});
        return dbResult.insertId;
    });
};

/**
 * Update guest user data
 */
pub.updateGuestUser = function (userData, key) {
    var data = [userData, key];
    return db.updateQuery(db.tables.users_customers_guest, data).then(function (dbResult) {
        if (dbResult != false) {
            return true;
        } else {
            return false;
        }
    });
};

/**
 * Update user data from checkout.
 * Updates user's birth_date and saves previous birth_date in history.
 * Updates address, address latitude, longitude, unit_number, and phone number, if they were empty
 * 
 * @param {*} newData 
 * @param {*} key 
 */
pub.updateCheckoutUser = async function (newData, key) {
    // if user has birth date update it and save in history
    if (newData.birth_date) {
        let newData2 = {
            birth_date: newData.birth_date
        };
        await pub.updateUser(newData2, key);
    }

    // update the fields which are null in user table
    delete newData.birth_date;

    let users = await db.selectColumnsWhereLimitOne(Object.keys(newData), db.tables.users_customers, key);
    if (users.length > 0) {
        var user = users[0];
        var updateData = {};
        for (let column in user) {
            if (user[column] == null || user[column] == "") {
                updateData[column] = newData[column];
            }
        }

        if (Object.keys(updateData).length != 0) {
            var data = [updateData, key];
            db.updateQuery(db.tables.users_customers, data);
        }
    }
}

/**
 * Update user data. Will save old data in history.
 * 
 * @param {*} newData 
 * @param {*} key 
 */
pub.updateUser = async function (newData, key) {
    //TODO: weird, no error path?
    let users = await db.selectColumnsWhereLimitOne(Object.keys(newData), db.tables.users_customers, key);
    if (users.length > 0) {
        let user = users[0];
        if (ifNewInfo(newData, user)) {
            let data = [newData, key];
            await db.updateQuery(db.tables.users_customers, data);
            if (!isHistoryNull(user)) {
                let historyData = {
                    user_id: key.id
                };
                // No need to update address_latitude and address_longitude in history
                delete user.address_latitude;
                delete user.address_longitude;
                historyData = Object.assign(historyData, user);
                await db.insertQuery(db.tables.users_customers_history, historyData);
                Logger.log.debug("Successfully updated user", {function: "Users.updateUser"});
            }
        }
    }
    return true;
}

pub.updateCreditCard = function (userKey, cardToken, cardDigits, cardType) {
    var updateDate = {
        card_token: cardToken,
        card_type: cardType,
        card_digits: cardDigits
    };

    var data = [updateDate, userKey];

    return db.updateQuery(db.tables.users_customers, data).then(function (dbResult) {
        return true;
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
pub.findUsersByEmailWithHistory = async function (email) {
    var data = { user_email: email };
    var result = await findUsersWithHistory(data);
    return result;
}

pub.updatePassword = function (userId, oldPassword, newPassword) {
    var key = { id: userId };
    return db.selectColumnsWhereLimitOne("password", db.tables.users_customers, key).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(oldPassword, user[0].password).then(function (match) {
                if (match) {
                    return Auth.hashPassword(newPassword).then(function (hashedPassword) {
                        var userData = { password: hashedPassword };
                        var data = [userData, key];
                        return db.updateQuery(db.tables.users_customers, data).then(function (dbResult) {
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
    var query = `
        SELECT password
        FROM users_customers
        WHERE ?
        LIMIT 1`;
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
    var result = await db.updateQuery(db.tables.users_customers, [userData, key]);
    if (result != false) {
        return true;
    } else {
        return false;
    }
};

pub.makeStripeCustomer = async function (userEmail) {
    Logger.log.debug("Making stripe customer", {function: "Users.makeStripeCustomer"});

    return await MP.createCustomer(userEmail);
}

/**
 * Checks if given email is not used by another user
 * Used in account/update call to verify email is available before user can change to it
 * @param {*String} email 
 */
pub.isEmailAvailable = async function (email) {
    Logger.log.debug("Checking email availablity", {function: "Users.isEmailAvailable"});
    let result = await db.selectAllWhere(db.tables.users_customers, { user_email: email });
    return (result.length == 0);
}

pub.sendVerificationEmail = async function (signedUser) {
    let link = machineHostname + "/verify/" + JWTToken.createToken({
        verify_email: true,
        email: signedUser.user_email,
        first_name: signedUser.first_name,
        id: signedUser.id
    }, '1d');

    return Email.sendAccountVerificationEmail(signedUser.first_name, signedUser.user_email, link).then(function (result) {
        return result;
    });
}

var findUsersWithHistory = async function (data) {
    var sqlQuery = `SELECT users_customers.id AS id, users_customers.id_prefix AS id_prefix,
        users_customers.user_email AS user_email, users_customers.first_name AS first_name,
        users_customers.last_name AS last_name, users_customers.phone_number AS phone_number,
        users_customers.birth_date AS birth_date, users_customers.address AS address, false AS is_guest
        
        FROM users_customers
        WHERE ? OR id IN (
            SELECT DISTINCT user_id FROM users_customers_history
            WHERE ?
        ) `;

    var dbResult = await db.runQuery(sqlQuery, [data, data]);
    return dbResult;
}

function ifNewInfo(newData, user) {
    for (let key in newData) {
        if (user[key] == null) {
            return true;
        }

        if (key == "birth_date") {
            let newDate = new Date(newData[key] + " 00:00:00");
            if (newDate.getTime() != user[key].getTime()) {
                return true;
            }
        } else {
            if (newData[key] != user[key]) {
                if (key == "user_email") {
                    newData.email_verified = false;
                }
                return true;
            }
        }
    }
    return false;
}

function isHistoryNull(user) {
    for (let key in user) {
        if (user[key] != null) {
            return false;
        }
    }
    return true;
}

module.exports = pub;