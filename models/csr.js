/**
 * @copyright Homit 2018
 */

var pub = {};

/**
 * Authenticate csr user
 */
pub.authenticateCsrUser = async function (email, password) {
    var sqlQuery = `
        SELECT *
        FROM users_employees
        WHERE role_id = 2 AND ?
        LIMIT 1`;
    var data = {
        user_email: email,
    };
    var users = await db.runQuery(sqlQuery, data);
    if (users.length > 0) {
        var match = await Auth.comparePassword(password, users[0].password);
        if (match) {
            return User.sanitizeUserObject(users[0]);
        } else {
            return false;
        }
    }
    return false;
}

/* Saving record from CSR to database */
pub.recordAction = function (csrId, note, orderId) {
    insertData = {
        csr_id: csrId,
        note: note
    };
    return db.insertQuery(db.tables.csr_actions, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};

module.exports = pub;
