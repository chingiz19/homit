app.controller("catalogController", ["$location", "$scope", "$cookies", "$http", "$rootScope", 
    function($location, $scope, $cookies, $http, $rootScope) {

$scope.selection = $location.search().product;

$scope.isBeers = false;
$scope.isWines= false;
$scope.isSpirits= false;
$scope.isOthers= false;

// Determine product URL
$scope.productUrl;
    if ($scope.selection == "beers") {
        $scope.productUrl = '/api/catalog/beers';
        $scope.isBeers = true;
    } else if ($scope.selection == "wines") {
        $scope.productUrl = '/api/catalog/wines';
        $scope.isWines=true;
    } else if ($scope.selection == "spirits") {
        $scope.productUrl = '/api/catalog/spirits';
        $scope.isSpirits=true;
    } else if ($scope.selection == "others") {
        $scope.productUrl = '/api/catalog/others';
        $scope.isOthers=true;
    } else {
        $scope.productUrl = '/api/catalog/notfound';
    }        
    // User selected variables
    $scope.userSelectedSubcategories;
    $scope.userSelectedTypes = [];
    $scope.userSelectedBrands = [];
    $scope.userSelectedPackings = [];

    // Get initial list of products
    $scope.products;
    $scope.subcategories = [];
    $scope.availableTypes = [];
    $scope.availableBrands = [];    
    $scope.packings;
    $http({
        method: 'GET',
        url: $scope.productUrl
    }).then(function successCallback(response) {
        if (response.data['success'] === "true") {
            $scope.products = response.data['products'];
            $scope.products.forEach(function(product){
                product.selectedVolume = product.product_variants.all_volumes[0];
                product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];
                product.volumeI=0;
                product.packJ=0;
                
            })
            $scope.subcategories = response.data['subcategories'];
            $scope.packings = response.data['packagings'];

            $scope.userSelectedSubcategories = $scope.subcategories[0]['subcategory_name'];
            $scope.availableTypes = $scope.subcategories[0]['types'];
            $scope.availableBrands = $scope.subcategories[0]['brands'];      
        } else {

        }
    }, function errorCallback(response) {

    });

    function getElementIdByName(subcategory) {
        var result = -1;
        for (i=0; i<$scope.subcategories.length; i++) {
            if ($scope.subcategories[i]['subcategory_name'] == subcategory) {
                result = i;
                break;
            }
        }
        return result;
    }

    $scope.checkSubcategories = function(subcategory) {
        if (subcategory == $scope.userSelectedSubcategories){
            return;
        }
        $scope.userSelectedSubcategories = subcategory;
        var i = getElementIdByName(subcategory);
        $scope.availableTypes = $scope.subcategories[i]['types'];
        $scope.userSelectedTypes = [];
        $scope.availableBrands = $scope.subcategories[i]['brands'];
        $scope.userSelectedBrands = [];
    };

    $scope.checkTypes = function(type) {
        if (!$scope.userSelectedTypes.includes(type)) {
            $scope.userSelectedTypes.push(type);
        } else {
            $scope.userSelectedTypes.splice($scope.userSelectedTypes.indexOf(type), 1);
        }
    };

    $scope.checkBrands = function(brand) {
        if (!$scope.userSelectedBrands.includes(brand)) {
            $scope.userSelectedBrands.push(brand);
        } else {
            $scope.userSelectedBrands.splice($scope.userSelectedBrands.indexOf(brand), 1);
        }
    };

    $scope.checkPackings = function(packing) {
        if (!$scope.userSelectedPackings.includes(packing)) {
            $scope.userSelectedPackings.push(packing);
        } else {
            $scope.userSelectedPackings.splice($scope.userSelectedPackings.indexOf(packing), 1);
        }
    };

    $scope.isInSelectedSubcategories = function(subcategory) {
        if ($scope.userSelectedSubcategories === subcategory) {
            return true;
        } else {
            return false;
        }
    };

    $scope.isInSelectedTypes= function(type) {
        if ($scope.userSelectedTypes.length === 0) {
            return true;
        } else {
            if ($scope.userSelectedTypes.includes(type)) {
                console.log("in the list");
                return true;
            } else {
                console.log("NOT IN THE LIST");
                return false;
            }
        }
    };

    $scope.isInSelectedBrands = function(brand) {
        if ($scope.userSelectedBrands.length === 0) {
            return true;
        } else {
            if ($scope.userSelectedBrands.includes(brand)) {
                return true;
            } else {
                return false;
            }
        }
    };

    $scope.isInSelectedPackings = function(packing) {
        if ($scope.userSelectedPackings.length === 0) {
            return true;
        } else {
            if ($scope.userSelectedPackings.includes(packing)) {
                return true;
            } else {
                return false;
            }
        }
    };

    $scope.isBrandCheckboxChecked = function(brand) {
        if ($scope.userSelectedBrands.includes(brand)) {
            return true;
        } else {
            return false;
        }
    };

    $scope.addToCart = function(product) {
        var p = jQuery.extend(true, {}, product);
        
        //prepare product for cart
        p.volume = p.selectedVolume;
        p.packaging = p.selectedPack;
        p.price = p.product_variants[p.volume][p.packaging].price;
        p.depot_id = p.product_variants[p.volume][p.packaging].depot_id;

        delete p["description"];
        delete p["listing_id"];
        delete p["product_id"];
        delete p["product_variants"];
        delete p["subcategory"];
        delete p["type"];
        delete p["selectedVolume"];
        delete p["selectedPack"];
        delete p["category"];
        delete p["container"];

        $rootScope.$broadcast("addToCart", p);
    };
    
    $scope.nextVolume=function(product){
        $scope.numberOfVolumes=product.product_variants.all_volumes.length;
        $scope.volumeI=product.volumeI;
        if(product.volumeI<$scope.numberOfVolumes-1){
            $scope.volumeI=$scope.volumeI+1;
        }
        product.volumeI=$scope.volumeI;
        product.selectedVolume = product.product_variants.all_volumes[product.volumeI];
        product.packJ=0;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];
    }

    $scope.previousVolume=function(product){
        $scope.volumeI=product.volumeI;
        if($scope.volumeI>0){
            $scope.volumeI=$scope.volumeI-1;
        }
        product.volumeI=$scope.volumeI;
        product.selectedVolume = product.product_variants.all_volumes[product.volumeI];
        product.packJ=0;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[0];
    }

    $scope.nextPack=function(product){
        $scope.numberOfPacks=product.product_variants[product.product_variants.all_volumes[product.volumeI]].all_packagings.length;
        $scope.packJ=product.packJ;
        if(product.packJ<$scope.numberOfPacks-1){
            $scope.packJ=$scope.packJ+1;
        }
        product.packJ=$scope.packJ;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[product.packJ];
    }

    $scope.previousPack=function(product){
        $scope.packJ=product.packJ;
        if($scope.packJ>0){
            $scope.packJ=$scope.packJ-1;
        }
        product.packJ=$scope.packJ;
        product.selectedPack = product.product_variants[product.selectedVolume].all_packagings[product.packJ];
    }

}]);

    
