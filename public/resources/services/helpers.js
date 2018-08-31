/**
 * This service is for helper functions that are commonly used in many placesd
 * 
 * @copyright Homit
 * @author Jeyhun Gurbanov
 */
app.service('helpers', function () {
    var pub = {};

    const homit_tags = {
        "d_ht_em": "</em>",
        "ht_em": "<em>",
        "d_ht_b": "</b>",
        "ht_b": "<b>",
        "d_ht_ul": "</ul>",
        "ht_ul": "<ul>",
        "d_ht_li": "</li>",
        "ht_li": "<li>"
    }

    pub.convertHomitTags = function (string) {
        let tmpString = string;
        for (tag in homit_tags) {
            tmpString = tmpString.replace(new RegExp(tag, 'g'), homit_tags[tag]);
        }
        return tmpString;
    }
    
    pub.clearHomitTags = function (string) {
        if(!string) return;
        let tmpString = string;
        for (tag in homit_tags) {
            tmpString = tmpString.replace(new RegExp(tag, 'g'), "");
        }
        return tmpString;
    }

    pub.randomDigitGenerator = function () {
        return Math.floor(Math.random() * 90000000) + 10000000;
    };

    pub.buildProductPagePath = function (product) {
        let path;
        path = "/hub/product/" + product.store.name + "/" + _.toLower(pub.clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product._id.split("-")[1];
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

    pub.mm_dd_yyyy = function(inDate) {
        if (inDate) {
            return parseInt(inDate.slice(5, 7), 10) + "/" + parseInt(inDate.slice(8, 10), 10) + "/" + parseInt(inDate.slice(0, 4), 10);
        }
    }

    pub.hh_mm = function(inDate) {
        if (inDate) {
            return parseInt(inDate.slice(12, 13), 10) + ":" + parseInt(inDate.slice(15, 16), 10);
        }
    }

    /**
     * Builds product url
     * @param {key map} mainSpecials 
     */
    pub.buildProductUrl = function (mainSpecials, storeType) {
        let tmpProductList = mainSpecials;
        for (let key in tmpProductList) {
            for (let x = 0; x < tmpProductList[key].length; x++) {
                tmpProductList[key][x]["product_url"] = pub.buildProductPagePath(tmpProductList[key][x], storeType);
            }
        }
        return tmpProductList;
    };

    /**
     * Builds category url
     * @param {array} categories store categories
     * @param {string} storeApiName 
     */
    pub.buildCategoryUrl = function (categories, storeApiName) {
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
                localObject.expiryDate = pub.getMonthString(tmpDate.getMonth()) + " " + tmpDate.getDate() + ", " + tmpDate.getFullYear();
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

    /**
     * Converts month int to 3 letters month name
     * @param {string} data 
     */
    pub.getMonthString = function(data) {
        switch (data) {
            case 0:
                return "Jan";
            case 1:
                return "Feb";
            case 2:
                return "Mar";
            case 3:
                return "Apr";
            case 4:
                return "May";
            case 5:
                return "Jun";
            case 6:
                return "Jul";
            case 7:
                return "Aug";
            case 8:
                return "Sep";
            case 9:
                return "Oct";
            case 10:
                return "Nov";
            case 11:
                return "Dec";
            default:
                return "Invalid Month";
        }
    };

    /**
     * Used to convert SI unit to other displayed units
     * @param {object} product_variant 
     */
    pub.unitConverter = function (product_variant) {
        let unit_list = {
            "kg": {
                "g": 1000,
                "lb": 2.20462
            },
            "m3": {
                "oz": 33814,
                "ml": 1000000,
                "L": 1000
            },
            "m": {
                "in": 39.3701,
                "ft": 3.28084,
                "cm": 100
            }
        }

        return (Math.round(product_variant.size * unit_list[product_variant.unit][product_variant.preffered_unit]));

    };

    return pub;
});
