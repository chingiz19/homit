app.controller("catalogController", ["$location", "$scope", "$cookies", "$http", "$rootScope", "$timeout", "$mdSidenav", "$log",
    function($location, $scope, $cookies, $http, $rootScope ,$timeout, $mdSidenav, $log) {
        var catalogCtrl = this;

$scope.selection = $location.path();

$scope.isBeers = false;
$scope.isWines= false;
$scope.isSpirits= false;
$scope.isOthers= false;

$scope.selectedCategory = undefined;
$scope.loadedStore = "Store";

// Determine product URL
$scope.productUrl;
    if ($scope.selection == "/catalog/liquor/beer") {
        $scope.productUrl = '/api/catalog/beers';
        $scope.isBeers = true;
        $scope.selectedCategory = "beer";
        $scope.loadedStore = "Liquor";
    } else if ($scope.selection == "/catalog/liquor/wine") {
        $scope.productUrl = '/api/catalog/wines';
        $scope.isWines=true;
        $scope.selectedCategory = "wine";
        $scope.loadedStore = "Liquor";
    } else if ($scope.selection == "/catalog/liquor/spirit") {
        $scope.productUrl = '/api/catalog/spirits';
        $scope.isSpirits=true;
        $scope.selectedCategory = "spirit";
        $scope.loadedStore = "Liquor";
    } else if ($scope.selection == "/catalog/snacks") {
        $scope.productUrl = '/api/catalog/others';
        $scope.isOthers=true;
        $scope.selectedCategory = "snack";
        $scope.loadedStore = "Snacks";
    } else {
        $scope.productUrl = '/api/catalog/notfound';
    }        

        $scope.selection = $location.search().product;
        $scope.isBeers = false;
        $scope.isWines= false;
        $scope.isSpirits= false;
        $scope.isOthers= false;

        $scope.searchedBrand = "";
 
            // User selected variables
            $scope.userSelectedSubcategories = null;
            $scope.userSelectedTypes = [];
            $scope.userSelectedBrands = [];
            $scope.userSelectedPackings = [];

            // Get initial list of products
            $scope.products;
            $scope.subcategories = [];
            $scope.availableTypes = [];
            $scope.availableBrands = [];  
            $scope.allBrands=[];  
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

                    $scope.allBrands=response.data['all_brands'];
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
                console.log(subcategory);
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

            // Used for mobile version
            // Start
            // $scope.$on("checkTypes", function (event, type) {
            //     $scope.checkTypes(type);
            // });

            // $scope.$on("checkSubcategories", function (event, subcategory_name) {
            //     $scope.checkSubcategories(subcategory_name);
            // });
            // $scope.$on("emptySubcategories", function(event){
            //     $scope.emptySubcategories();
            // })
            // End

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
                if ($scope.userSelectedSubcategories == null) {
                    return true;
                } else if ($scope.userSelectedSubcategories === subcategory) {
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
                        return true;
                    } else {
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

            catalogCtrl.scope = $scope;

            // TODO switch to Subcategories box when Category selected
            $scope.showCategories=false;
            $scope.filterCategories=function(){
                if($scope.showCategories)
                    $scope.showCategories=false;
                else
                    $scope.showCategories=true;
            }

            $scope.clearBrandSearch=function(){
                $scope.searchedBrand = "";
                console.log($scope.searchedBrand);
            }

            $scope.emptySubcategories = function() {
                $scope.userSelectedSubcategories = null;
            }
            // USer Cart right-SideNav functionality
            // Start
            $scope.toggleNavLeft = buildToggler('navigateMobSN');
            $scope.NavigateOpen = function(){
            return $mdSidenav('navigateMobSN').isOpen();
            };
            function debounce(func, wait, context) {
            var timer;
            return function debounced() {
                var context = $scope,
                    args = Array.prototype.slice.call(arguments);
                $timeout.cancel(timer);
                timer = $timeout(function() {
                timer = undefined;
                func.apply(context, args);
                }, wait || 10);
            };
            }
            function buildToggler(navID) {
            return function() {
                $mdSidenav(navID)
                .toggle()
                .then(function () {
                    $log.debug("toggle " + navID + " is done");
                });
            };
            }
            $scope.close = function () {
            $mdSidenav('navigateMobSN').close()
                .then(function () {
                $log.debug("close NAVIGATE is done");
                });
            };
            // End
     }
]);

