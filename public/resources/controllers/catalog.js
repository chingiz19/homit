app.controller("catalogController", function($scope, $http) {
    $scope.selection = "Beers";
    // Determine product URL
    $scope.productUrl;
    if ($scope.selection == "Beers") {
        $scope.productUrl = '/api/catalog/beers';
    }
    // Get initial list of products
    $scope.products;
    $scope.subcategories;
    $scope.packings;
    $scope.brands;
    $http({
        method: 'GET',
        url: $scope.productUrl
    }).then(function successCallback(response) {
        if (response.data['success'] === "true") {
            $scope.products = response.data['products'];
            $scope.subcategories = response.data['subcategories'];
            $scope.packings = response.data['packagings'];
            $scope.brands = response.data['brands'];
        } else {

        }
    }, function errorCallback(response) {

    });

    $scope.userSelectedSubcategories = [];
    $scope.userSelectedTypes = [];
    $scope.userSelectedBrands = [];
    $scope.userSelectedPackings = [];

    $scope.checkSubcategories = function(subcategory) {
        if (!$scope.userSelectedSubcategories.includes(subcategory)) {
            $scope.userSelectedSubcategories.push(subcategory);
        } else {
            $scope.userSelectedSubcategories.splice($scope.userSelectedSubcategories.indexOf(subcategory), 1);
        }
        console.log("userSelectedSubcategories list is: " + $scope.userSelectedSubcategories);
    };

    $scope.checkTypes = function(type) {
        if (!$scope.userSelectedTypes.includes(type)) {
            $scope.userSelectedTypes.push(type);
        } else {
            $scope.userSelectedTypes.splice($scope.userSelectedTypes.indexOf(type), 1);
        }
        console.log("userSelectedTypes list is: " + $scope.userSelectedTypes);
    };

    $scope.checkBrands = function(brand) {
        if (!$scope.userSelectedBrands.includes(brand)) {
            $scope.userSelectedBrands.push(brand);
        } else {
            $scope.userSelectedBrands.splice($scope.userSelectedBrands.indexOf(brand), 1);
        }
        console.log("userSelectedBrands list is: " + $scope.userSelectedBrands);
    };

    $scope.checkPackings = function(packing) {
        if (!$scope.userSelectedPackings.includes(packing)) {
            $scope.userSelectedPackings.push(packing);
        } else {
            $scope.userSelectedPackings.splice($scope.userSelectedPackings.indexOf(packing), 1);
        }
        console.log("userSelectedPackings list is: " + $scope.userSelectedPackings);
    };

    $scope.isInSelectedSubcategories = function(subcategory) {
        if ($scope.userSelectedSubcategories.length === 0) {
            return true;
        } else {
            if ($scope.userSelectedSubcategories.includes(subcategory)) {
                return true;
            } else {
                return false;
            }
        }
    };

    $scope.isInSelectedTypes= function(type) {
        if ($scope.userSelectedTypes.length === 0) {
            console.log("truee");
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

});