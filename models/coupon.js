/**
 * @copyright Homit 2018
 */

var pub = {};

const GENERAL_COUPON_TYPE = "general";

pub.privacy_types = {
    public: 0,
    private: 1,
    private_guest: 2
};

pub.GENERAL_COUPON_TYPE = GENERAL_COUPON_TYPE;
pub.CODES = { DEFAULT_SIGNUP: "signup706" };

/**
 * Checks if coupon not expired and not public
 */
pub.applyKeyedCoupon = async function (code, userId) {
    let applied = false;
    let canBeApplied = true;
    let coupon = await getCouponByCode(code);
    let isOk = coupon && coupon.privacy_type != this.privacy_types.private && !coupon.visible;
    let couponAssignedBy;

    if (coupon.store_type_id) {
        let storeTypeInfo = await Catalog.getStoreTypeInfoById(coupon.store_type_id);
        if (storeTypeInfo) {
            couponAssignedBy = storeTypeInfo.name;
        }
    } else if (coupon.union_id) {
        let unionInfo = await Catalog.getUnionInfoById(coupon.union_id);
        if (unionInfo) {
            couponAssignedBy = unionInfo.name;
        }
    }

    if (userId && isOk) {
        canBeApplied = await canApplyCoupon(code, userId);
        let userCoupon = await db.selectAllWhere2(db.tables.user_coupons, [{ "user_id": userId }, { "coupon_id": coupon.id }]);
        let updateResult = false;

        if (canBeApplied && userCoupon && userCoupon.length > 0) {
            updateResult = await db.runQuery('UPDATE ' + db.tables.user_coupons + ' SET trials_limit = 1, applied = true WHERE ? AND ?', [{ "user_id": userId }, { "coupon_id": coupon.id }]);
        } else if (canBeApplied) {
            updateResult = await db.insertQuery(db.tables.user_coupons, { "trials_limit": 1, "user_id": userId, "coupon_id": coupon.id, "applied": true });
        }

        applied = (updateResult && updateResult.affectedRows > 0);
    }

    return {
        "isApplied": applied,
        "canBeApplied": canBeApplied,
        "isOk": isOk,
        "assignedBy": couponAssignedBy
    }
}

/**
 * Get the amount offered with coupon
 * 
 * @param {*} storeType - which store type coupon applies to
 * @param {*} couponCode - coupon code
 * @param {*} totalAmount - total amount coupon to see if coupon valid
 * @param {*} userId - user id to verify if user has private coupons
 * @param {*} isUnion - if it is union store
 */
pub.getCouponOff = async function (isUnion, storeType, couponCode, totalAmount, userId) {
    let off = 0;
    let message = undefined;
    let couponId = undefined;
    let privacyType = undefined;
    if (couponCode != undefined) {
        let storeTypeId = false;
        if (storeType != GENERAL_COUPON_TYPE) {
            let tmpStoreTypeInfo;

            if (isUnion) {
                tmpStoreTypeInfo = await Catalog.getUnionInfoByName(storeType);
            } else {
                tmpStoreTypeInfo = await Catalog.getStoreTypeInfo(storeType);
            }

            storeTypeId = tmpStoreTypeInfo.id;
        }
        let coupon = await pub.getCoupon(couponCode, storeTypeId, isUnion);
        if (coupon) {
            if (totalAmount >= coupon.if_total_more) {
                let privacyVerified = false;
                if (coupon.privacy_type == pub.privacy_types.public) {
                    privacyVerified = true;
                } else if (userId && coupon.privacy_type == pub.privacy_types.private) {
                    privacyVerified = await verifyPrivateCoupon(coupon, userId);
                } else if (coupon.privacy_type == pub.privacy_types.private_guest) {
                    privacyVerified = true;
                }

                if (privacyVerified) {
                    // if store and percentage
                    if (storeTypeId && coupon.total_percentage_off) {
                        off = totalAmount * coupon.total_percentage_off / 100;
                        off = parseFloat(off.toFixed(2));
                    } else if (coupon.total_price_off) {
                        off = coupon.total_price_off;
                    }
                    couponId = coupon.id;
                    privacyType = coupon.privacy_type;
                    message = coupon.message_invoice;
                } else {
                    Logger.log.error("Failed to verify coupon privacy.");
                }
            }
        }
    }

    return {
        off: off,
        coupon_id: couponId,
        privacy_type: privacyType,
        message: message
    }
}

/**
 * Gets coupon which is valid as of now
 * and works for store type passed
 * 
 * If no store type is passed, then
 * will try to find general coupon
 * 
 * @param {*} code - coupon code
 * @param {*} storeTypeId - defaults to false which is generic coupon
 * @param {*} isUnion - if it is union
 */
pub.getCoupon = async function (code, storeTypeId = false, isUnion) {
    let sqlQuery = `
        SELECT * FROM catalog_coupons
        WHERE date_expiry > NOW() AND NOW() > date_start  AND ? AND `;

    let data = [{ "code": code }];
    if (storeTypeId) {
        sqlQuery = sqlQuery + `?;`;
        if (isUnion) {
            data.push({ "union_id": storeTypeId });
        } else {
            data.push({ "store_type_id": storeTypeId });
        }
    } else {
        sqlQuery = sqlQuery + ` store_type_id IS NULL;`;
    }

    let tmpResult = await db.runQuery(sqlQuery, data);

    if (tmpResult && tmpResult.length > 0) {
        return tmpResult[0];
    }

    return false;
}

/**
 * Tries to update user_coupons table if unsuccessdfull
 * then inserts a new row
 * @param {*} code coupon code 
 * @param {*} userId user id
 * @param {*} isForLogin boolean to indicate if caller is from login api_controller
 */
pub.updateUserCoupons = async function (couponsObject, userId, isForLogin) {
    if (couponsObject && userId) {
        let couponsArray = Object.keys(couponsObject);
        let showMessage = "Successfully updated!"

        for (let coupon in couponsArray) {
            let itIsOk = true;
            let couponCode = couponsArray[coupon];
            let applied = couponsObject[couponCode];
            showMessage = (couponsArray.length == 1 && applied) ? "Applied! Will be used upon checkout" : "Successfully removed!";

            if (applied) { itIsOk = await canApplyCoupon(couponCode, userId); }

            if (itIsOk) {
                let data = {
                    "applied": applied
                };

                let couponObject = await getCouponByCode(couponCode);
                let couponId = couponObject.id;
                let publicType = (couponObject.privacy_type == this.privacy_types.public);
                if (publicType) data["trials_limit"] = 1;

                let updateResult = await db.updateQueryWhereAnd(db.tables.user_coupons, [data, { "user_id": userId }, { "coupon_id": couponId }]);

                if (!(updateResult && updateResult.affectedRows > 0) && publicType) {
                    data["user_id"] = userId;
                    data["coupon_id"] = couponId;
                    let insertResult = await db.insertQuery(db.tables.user_coupons, data);

                    if (!insertResult) {
                        return { success: false, ui_message: "Could not update!" };
                    }
                }
            } else if (!isForLogin) {
                return { success: false, ui_message: "One coupon per store!" };
            }
        }
        return { success: true, ui_message: showMessage };
    }
    return { success: false, ui_message: "Could not update!" };
}

/**
 * Decrement private coupon for user
 * 
 * @param {*} coupon 
 */
pub.decrementUserCoupon = async function (couponId, userId) {
    if (couponId && userId) {
        let sqlQuery = `
        UPDATE  
            user_coupons
        SET 
            trials_limit = trials_limit - 1
        WHERE 
            trials_limit>0
        AND
            ?
        AND
            ?;`;

        let data = [{ "coupon_id": couponId }, { "user_id": userId }];

        return await db.runQuery(sqlQuery, data);
    }
    return false;
}

/**
 * Changes private guest coupon validity date
 * 
 * @param {*} coupon 
 */
pub.invalidatePrivateGuestCoupon = async function (couponId) {
    // move expire date to now
    let sqlQuery = `
        UPDATE catalog_coupons
        SET date_expiry = CURRENT_TIMESTAMP
        WHERE ?;
    `;
    let data = { id: couponId };
    db.runQuery(sqlQuery, data);
    return true;
}

/**
 * Assigns existing user an existing coupon id and trial limit
 * It won't assign coupon if user already has it or coupon code does not exist
 * @param {*} userId user ID 
 * @param {*} couponCode coupon code (e.g. signup706)
 * @param {*} trialsLimit number of times this coupon will be used by user
 */
pub.assignCouponToUser = async function (userId, couponCode, trialsLimit) {
    let couponId = await getCouponByCode(couponCode);
    let userHaveIt = await doesUserHaveCoupon(couponId, userId);

    if (userId && couponId && trialsLimit && !userHaveIt) {
        let data = {
            user_id: userId,
            coupon_id: couponId.id,
            trials_limit: trialsLimit
        }

        let result = await db.insertQuery(db.tables.user_coupons, data);
        return (result && true);
    }
    return false;
}

/**
 * Retrieves user coupons 
 * @param {*} userId user id
 * @param {*} onlyApplied is to get only applied coupons
 */
pub.getUserCoupons = async function (userId, onlyApplied) {
    if (userId) {
        let onlyAppliedSql = ``;

        if (onlyApplied) {
            onlyAppliedSql = `
        AND 
            coupons.applied
        `;
        }

        let sqlQuery = `
    SELECT 
        coupons.coupon_id AS id, catalog_coupons.message AS couponBody, catalog_coupons.total_percentage_off AS percent, coupons.applied,
        catalog_coupons.total_price_off AS amount, catalog_coupons.code AS couponCode, catalog_coupons.message_invoice AS couponHeader, 
        catalog_coupons.date_expiry AS couponExpiry, catalog_coupons.if_total_more AS totalMore, storeTypes.name AS storeType, storeUnions.name as storeUnion
    FROM
        user_coupons AS coupons
    JOIN
        catalog_coupons ON (coupons.coupon_id = catalog_coupons.id)
    LEFT JOIN
        catalog_store_types AS storeTypes ON (catalog_coupons.store_type_id = storeTypes.id)
    LEFT JOIN
        catalog_store_unions AS storeUnions ON (catalog_coupons.union_id = storeUnions.id)
    WHERE
        coupons.trials_limit > 0`
            + onlyAppliedSql + `
    AND 
        catalog_coupons.date_expiry>CURRENT_TIMESTAMP
    AND
        catalog_coupons.date_start<CURRENT_TIMESTAMP
    AND
        ?;
    `;

        let result = await db.runQuery(sqlQuery, { user_id: userId });
        return result;
    }
    return false;
}

/**
 * Retrieves coupons that aren't expired and pertain to this store
 * @param {*} storeType store type
 */
pub.getStoreCoupons = async function (storeType) {
    if (storeType) {
        let sqlQuery = `
    SELECT 
        coupons.id AS id, coupons.message AS couponBody, coupons.total_percentage_off AS percent, 
        coupons.total_price_off AS amount, coupons.code AS couponCode, coupons.message_invoice AS couponHeader, 
        coupons.date_expiry AS couponExpiry, storeTypes.name AS storeType
    FROM
        catalog_coupons AS coupons
    JOIN
        catalog_store_types AS storeTypes ON (coupons.store_type_id = storeTypes.id)
    WHERE
        coupons.date_expiry>CURRENT_TIMESTAMP
    AND
        coupons.date_start<CURRENT_TIMESTAMP
    AND
        coupons.visible
    AND
        coupons.privacy_type = 0
    AND
        ?;
    `;

        return await db.runQuery(sqlQuery, { "storeTypes.name": storeType });
    }
    return false;
}

/**
 * Returns true if user already has coupon with given ID
 * otherwise false
 * @param {*} coupon
 * @param {*} userId
 */
async function doesUserHaveCoupon(coupon, userId) {
    if (coupon) {
        let data1 = { "coupon_id": coupon.id };
        let data2 = { "user_id": userId };

        let result = await db.selectAllWhere2(db.tables.user_coupons, [data1, data2]);

        return (result.length > 0);
    }
    return true;
}

/**
 * Retrieves coupond ID with given coupon code
 * @param {*} couponCode  coupon code (e.g. signup706)
 */
async function getCouponByCode(couponCode) {
    if (couponCode) {
        let data = {
            "code": couponCode
        };

        let result = await db.selectAllWhereLimitOne(db.tables.catalog_coupons, data);

        if (result.length != 0 && result[0].date_expiry > Date.now()) {
            return result[0];
        }

        return false;
    }
    return false;
}

/**
 * Helper function. Checks if we can apply coupon for user.
 * Returns false if coupon with given store_type already exisists (including general type)
 */
async function canApplyCoupon(couponCode, userId) {
    let coupon = await getCouponByCode(couponCode);

    let innerData = coupon.union_id ? { "coupons.union_id": coupon.union_id } : { "coupons.store_type_id": coupon.store_type_id };

    let sqlQuery = `
    SELECT 
        *
    FROM
        catalog_coupons AS coupons
    JOIN
        user_coupons AS users ON (coupons.id = users.coupon_id) AND ?
    WHERE
        ?
    AND 
        users.applied
    AND 
	    coupons.date_expiry>now();
`;

    let result = await db.runQuery(sqlQuery, [{ "user_id": userId }, innerData]);

    return (result.length == 0);
}

/**
 * Verify private coupon
 * 
 * @param {*} coupon 
 * @param {*} userId 
 */
async function verifyPrivateCoupon(coupon, userId) {
    if (!userId) {
        Logger.log.error("Private coupon has been used by non-user.");
        return false;
    }

    let data = [
        { user_id: userId },
        { coupon_id: coupon.id }
    ];

    let tmpResult = await db.selectAllWhere2(db.tables.user_coupons, data);

    if (tmpResult == false) {
        Logger.log.error("Error while checking for private coupon.");
        return false;
    }

    if (tmpResult[0].trials_limit <= 0) {
        Logger.log.error("Private coupon is valid, but no limit left.");
        return false;
    }

    if (tmpResult.length > 0) {
        return true;
    } else {
        Logger.log.error("User provided wrong private coupon.");
        return false;
    }
}

module.exports = pub;
