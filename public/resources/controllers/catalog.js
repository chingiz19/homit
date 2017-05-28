app.controller("catalogController", function($scope, $http, $location) {

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

    $scope.addToCart = function() {
        console.log("add to cart in catalog.js");
        $rootScope.$broadcast("addNotification", {type: "alert-success", message: "It works!!!"});
    };

});

    
