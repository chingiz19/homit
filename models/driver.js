/**
 * @copyright Homit 2017
 */

var pub = {};

/**
 * Authenticate driver
 */
pub.authenticateDriver = function (email, password) {
    var sqlQuery = `
    SELECT drivers.id_prefix AS id_prefix, drivers.id AS id, employees.user_email AS email, employees.first_name AS first_name, employees.last_name AS last_name, employees.password AS password
    FROM users_employees AS employees, drivers 
    WHERE drivers.employee_id = employees.id AND employees.role_id=3 AND ?`;

    var data = {
        user_email: email
    };
    return db.runQuery(sqlQuery, data).then(function (user) {
        if (user.length > 0) {
            return Auth.comparePassword(password, user[0].password).then(function (match) {
                if (match) {
                    return User.sanitizeUserObject(user[0]);
                } else {
                    return false;
                }
            });
        }
        return false;
    });
};

module.exports = pub;
