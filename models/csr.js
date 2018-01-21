/**
 * @copyright Homit 2018
 */

var pub = {};

/* Saving record from CSR to database */
pub.recordAction = function (csrId, note, orderId) {
    insertData = {
        csr_id: csrId,
        note: note
    };
    return db.insertQuery(db.dbTables.csr_actions, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};

module.exports = pub;
