/**
 * @copyright Homit 2017
 */


var pub = {};


pub.refundAction = function (csrId, note, orderId) {
    insertData = {
        csr_id: csrId,
        note: note
    };
    return db.insertQuery(db.dbTables.csr_actions, insertData).then(function (inserted) {
        return inserted.insertId;
    });
};

module.exports = pub;
