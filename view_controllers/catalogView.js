let router = require("express").Router();
let _ = require("lodash");

router.get("/product/:storeName/:productName/:productId", async function (req, res, next) {
    if (!req.query || Object.keys(req.query) > 0) {
        return res.redirect("/hub" + req.path);
    } 
    // else if (isNaN(req.params.productId)) {
    //     return res.redirect("/notfound");
    // }

    let product = await Catalog.getProductPageItemsByProductId(req.params.storeName, req.params.productId);
    let similarProducts = await Catalog.getSimilarProducts(req.params.productId);
    let validationUrl = "/product/" + product.store_type_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product._id.split("-")[1];

    if (!product || validationUrl != req.url) {
        return res.redirect("/notfound");
    }

    // Assign variables
    req.options.ejs.product_brand = product.brand;
    req.options.ejs.product_name = product.name;

    if (product.store_type_name == "linas-italian-market") {
        req.options.ejs.store_type_display_name = '<li><span class="bold">Sold By: </span><a href="' + "https://linasmarket.com/" + '" target="_blank" itemprop="additionalProperty">' + _.startCase(product.store_type_display_name, '-', ' ') + '</a></li>';
    } else {
        req.options.ejs.store_type_display_name = undefined;
    }

    if (product.details.country_of_origin) {
        req.options.ejs.country_of_origin = '<li><span class="bold">Country of Origin:</span><span itemprop="additionalProperty"> ' + product.details.country_of_origin + '</span></li>';
    } else {
        req.options.ejs.country_of_origin = "";
    }

    if (product.details.producer) {
        req.options.ejs.producer = '<li><span class="bold">Made by:</span><span itemprop="manufacturer"> ' + product.details.producer + '</span></li>';
    } else {
        req.options.ejs.producer = "";
    }

    if (product.details.alcohol_content) {
        req.options.ejs.alcohol_content = '<li><span class="bold">Alcohol/Vol:</span><span itemprop="additionalProperty"> ' + product.details.alcohol_content + '</span></li>';
    } else {
        req.options.ejs.alcohol_content = "";
    }

    if (product.details.preview) {
        req.options.ejs.preview = '<section class="preview-sec" itemprop="description"><div class="description"><h3 class="sub-header">Product Description:</h3><p> ' + HelperUtils.convertHomitTags(product.details.preview) + '</p></div></section>';
    } else {
        req.options.ejs.preview = "";
    }

    if (product.details.ingredients) {
        req.options.ejs.ingredients = '<section class="ingredients-sec" itemprop="disambiguatingDescription"><div class="ingredients"><h3 class="sub-header">Ingredients:</h3><span> ' + HelperUtils.convertHomitTags(product.details.ingredients) + '</span></div></section>';
    } else {
        req.options.ejs.ingredients = "";
    }

    if (product.details.serving_suggestions) {
        req.options.ejs.serving_suggestions = '<section class="preview-sec" itemprop="additionalProperty"><div class="description"><h3 class="sub-header">Serving Sugestions:</h3><p> ' + HelperUtils.convertHomitTags(product.details.serving_suggestions) + '</p></div></section>';
    } else {
        req.options.ejs.serving_suggestions = "";
    }

    if (product.images.length > 0) {
        req.options.ejs.product_image = '<img itemprop="image" width="0px" height="0px" src="' + product.images[0] + '">';
    }

    req.options.ejs.product_images = JSON.stringify({ "images": product.images });
    req.options.ejs.see_more_url = "/hub/" + product.store_type_name + "/" + product.category.category_name;
    if (similarProducts.length < 12) {
        let remainder = 12 - similarProducts.length;
        let tmpRecommended = recommended_products[product.category.category_name].slice(0, remainder);
        req.options.ejs.recommended_products = JSON.stringify(similarProducts.concat(tmpRecommended));
    } else {
        req.options.ejs.recommended_products = JSON.stringify(similarProducts);
    }

    req.options.ejs.og_image = product.images[0];

    req.options.ejs.title = _.trim(product.brand + _.trimEnd(" " + product.name) + " - Delivered to Your Doorstep | Homit");

    if (product.details.preview) {
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. " + HelperUtils.clearHomitTags(product.details.preview).split(".")[0]);
    } else {
        req.options.ejs.meta_description = _.trim(product.brand + _.trimEnd(" " + product.name) + " - 45 minutes delivery in Calgary. Let us Home It and liberate your precious time.");
    }

    product.selectedVolume = 0;
    product.selectedPack = 0;

    req.options.ejs.product = JSON.stringify(product);

    res.render("product.ejs", req.options.ejs);
});

router.get('/:parent/', async function (req, res) {
    let parent = req.params.parent;
    let union = await Catalog.isParentUnion(parent);

    if (union) {
        req.options.ejs.title = union.display_name + " | Homit";
        req.options.ejs.union_display_name = union.display_name || "Collection of Stores";
        req.options.ejs.union_description = union.description_text || "Collection of Stores";
        res.render("unions.ejs", req.options.ejs);
    } else {
        let categories = await Catalog.getCategoriesByStoreType(parent);
        if (categories.length==1) {
            return res.redirect(`${parent}/${categories[0].category_name}`);
        }
        req.options.ejs.title = _.startCase(req.params.parent) + " | Homit";
        //TODO: og image
        res.render("store.ejs", req.options.ejs);
    }
});

router.get('/:parent/:category', async function (req, res, next) {
    if (!await Catalog.verifyStoreCategory(req.params.parent, req.params.category)) {
        return res.redirect("/notfound");
    }

    try {
        req.options.ejs.title = _.startCase(req.params.category) + " Catalog | Homit";
        req.options.ejs.loadedStore = _.startCase(req.params.parent);
        req.options.ejs.selectedCategory = req.params.category.replace(/-/g, " ");
        res.render("catalog.ejs", req.options.ejs);
    } catch (e) {
        next();
    }
});

function clearProductUrl(path) {
    let tempPath = path;
    tempPath = tempPath.replace(/[#&',.%/()]/g, "");
    tempPath = tempPath.replace(/---/g, "-");
    tempPath = tempPath.replace(/--/g, "-");
    return tempPath;
}

module.exports = router;