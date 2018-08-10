/**
 * This service is for helper functions that are commonly used in many placesd
 * 
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('helpers', function () {
    var pub = {};

    pub.randomDigitGenerator = function () {
        return Math.floor(Math.random() * 90000000) + 10000000;
    };

    pub.buildProductPagePath = function (product) {
        let path;
        path = "/hub/product/" + product.store_type_name + "/" + _.toLower(pub.clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;
        return path;
    };

    pub.clearProductUrl = function (path) {
        var tempPath = path;
        tempPath = tempPath.replace(/[#&',.%/()]/g, "");
        tempPath = tempPath.replace(/---/g, "-");
        tempPath = tempPath.replace(/--/g, "-");
        return tempPath;
    };

    pub.urlReplaceSpaceWithDash = function (string) {
        return string.toLowerCase().replace(/ /g, "-");
    };

    /**
     * Builds product url
     * @param {key map} mainSpecials 
     */
    pub.buildProductUrl = function (mainSpecials) {
        let tmpProductList = mainSpecials;
        for (let key in tmpProductList) {
            for (let x = 0; x < tmpProductList[key].length; x++) {
                tmpProductList[key][x]["product_url"] = pub.buildProductPagePath(tmpProductList[key][x]);
            }
        }
        return tmpProductList;
    };

    /**
     * Builds category url
     * @param {array} categories store categories
     * @param {string} storeApiName 
     */
    pub.buildCategoryUrl = function(categories, storeApiName) {
        let tmpList = categories;
        for (let x = 0; x < tmpList.length; x++) {
            tmpList[x]["category_url"] = "/hub/" + storeApiName + "/" + pub.urlReplaceSpaceWithDash(tmpList[x].category_name);
        }
        return tmpList;
    };

    /**
     * Helper function to format received coupons array 
     * into representative wording and filter through 'null's 
     * @param {*} rawCoupons received coupons array from server
     */
    pub.formatCoupons = function (rawCoupons, appliedCoupons) {
        let localArray = [];

        for (let coupon in rawCoupons) {
            let localObject = {
                couponHeader: "Not Available",
                couponBody: "Description is not available",
                sign: "$",
                amount: 0.00,
                expiryDate: "dd/mm/yyyy",
                couponCode: "not available",
                assignedBy: "general"
            };

            if (rawCoupons[coupon].couponHeader) {
                localObject.couponHeader = rawCoupons[coupon].couponHeader;
            }

            if (rawCoupons[coupon].couponBody) {
                localObject.couponBody = rawCoupons[coupon].couponBody;
            }

            if (rawCoupons[coupon].percent != null) {
                localObject.sign = "%";
                localObject.amount = rawCoupons[coupon].percent;
            } else if (rawCoupons[coupon].amount != null) {
                localObject.sign = "$";
                localObject.amount = rawCoupons[coupon].amount;
            }

            if (rawCoupons[coupon].couponExpiry) {
                let tmpDate = new Date(rawCoupons[coupon].couponExpiry);
                localObject.expiryDate = tmpDate.getDay() + "/" + tmpDate.getMonth() + "/" + tmpDate.getFullYear();
            }

            if (rawCoupons[coupon].couponCode) {
                rawCoupons[coupon].storeType = (rawCoupons[coupon].storeType == null) ? "general" : rawCoupons[coupon].storeType;
                localObject.assignedBy = rawCoupons[coupon].storeType;
                localObject.couponCode = rawCoupons[coupon].couponCode;
                if (appliedCoupons) {
                    localObject.applied = (appliedCoupons[rawCoupons[coupon].storeType] == rawCoupons[coupon].couponCode);
                } else {
                    localObject.applied = rawCoupons[coupon].applied;
                }
            }

            localArray.push(localObject);
        }

        return localArray;
    };

    return pub;
});
