app.controller("mainController", function ($scope, $http, sessionStorage, $cookies, $window, $location, $anchorScroll, mapServices, $timeout, googleAnalytics) {
    $scope.map = undefined;
    $scope.showMapMessage = false;
    $scope.trandingSelected = "popular";
    $scope.bounds = undefined;
    $scope.addressMessage = undefined;

    $scope.init = function () {

        $scope.screenIsMob = global_screenIsMob;
        $scope.subscribeClassBtn = "subscribe-button";
        $scope.subscribeClassInput = "subscribe-input";
        $scope.subscribeButtonText = "SUBSCRIBE";

        if (global_screenIsMob) {
            $(".full-screen").css({ "height": window.innerHeight });
        }

        // always scroll to the top, then later to defined hash
        var currentHash = $location.hash();
        if (!sessionStorage.getAddress()) {
            $scope.scrollTo("gettingstarted");
        }

        //TODO: change to dynamic
        $scope.bounds = new google.maps.LatLngBounds({ lat: 50.862122, lng: -114.173317 }, { lat: 51.172396, lng: -113.925171 });

        mapServices.createCoveragePolygon().then(function (polygon) {
            if (polygon) {
                $scope.coveragePolygon = polygon;
                $scope.coveragePolygon.setMap($scope.map);
            }
        });
    };

    /**
     * This function is called after autocomplete gets the address
     */
    $scope.gotAddressResults = function () {
        $("#autocompleteAddressInputBox").blur();
        var latLng = $scope.autocomplete.getLatLng();
        var place = $scope.autocomplete.getPlace();
        if (!latLng) return;
        if (mapServices.isPlaceInsidePolygon(latLng, $scope.coveragePolygon)) {
            sessionStorage.setAddress(place);
            sessionStorage.setAddressLat(latLng.lat());
            sessionStorage.setAddressLng(latLng.lng());
            if ($scope.screenIsMob) {
                $scope.scrollTo('address');
            }
            $timeout(function () {
                $(".loc-sucsess-msg").css({ 'opacity': '1', 'width': '100%', 'z-index': '2', 'transition': 'opacity 0.8s ease-out, width 0.6s ease-out' });
                $scope.addressMessage = "We Deliver!";
                clearLocSucMsg(3500);
            }, 200);
        } else {
            $timeout(function () {
                $(".loc-sucsess-msg").css({ 'opacity': '1', 'width': '100%', 'z-index': '2', 'transition': 'opacity 0.8s ease-out, width 0.6s ease-out' });
                $scope.addressMessage = "Out of Coverage Area.";
                clearLocSucMsg(3500);
            }, 200);
            googleAnalytics.addEvent('out_of_coverage', {
                "event_label": place.formatted_address,
                "event_category": googleAnalytics.eventCategories.address_actions
            });
        }
    };

    $scope.hrefTo = function (path) {
        $window.location.href = $window.location.origin + path;
        sessionStorage.setCategoryClicked("store-switched");
    };

    $scope.changeTranPrd = function(type){
        let old_type= $scope.trandingSelected;
        if(old_type == type) return;
        $('#' + old_type).addClass('tranding-type-btn');
        $('#' + type).removeClass('tranding-type-btn');
        $scope.trandingSelected = type;
    };

    $scope.hrefPrdPage = function (product) {
        var path;
        path = "/catalog/product/" + product.store_type_api_name + "/" + _.toLower(clearProductUrl(_.trim(_.toLower(_.trim(product.brand) + " " + _.trim(product.name))).replace(/ /g, "-"))) + "/" + product.product_id;

        $window.location.href = $window.location.origin + path;
    };

    function clearProductUrl(path){
        var tempPath = path;
        tempPath = tempPath.replace(/[#&',.%/()]/g, "");
        tempPath = tempPath.replace(/[---]/g, "-");
        tempPath = tempPath.replace(/[--]/g, "-");
        return tempPath;
    }

    function clearLocSucMsg(time) {
        setTimeout(() => {
            $(".loc-sucsess-msg").css({ 'opacity': '0', 'width': '0', 'z-index': '-1', 'transition': 'all 0.8s ease-out' });
            setTimeout(() => {
                $(".loc-sucsess-msg").removeAttr('style');
            }, 600);
        }, time);
    }

    /**
     * When called this method will scroll view to the element with 'id'
     * @param id - element id
     */
    $scope.scrollTo = function (id) {
        $location.hash(id.toLowerCase());
        Element.prototype.documentOffsetTop = function () {
            return this.offsetTop + (this.offsetParent ? this.offsetParent.documentOffsetTop() : 0);
        };
        var el = document.getElementById(id);
        if (el) {
            var top = document.getElementById(id).documentOffsetTop();
            animateScrollTo(top, { speed: 1000 });
        }
    };

    /**
     * When called this method will send request to BE to subscribe user to mailing list (Guest Users list)
     */
    $scope.subscribe = function () {
        let userEmail = $scope.subscribeEmail;
        if (userEmail) {
            $http({
                method: 'POST',
                url: '/api/marketing/subscribe',
                data: {
                    email: userEmail,
                }
            }).then(function successCallback(response) {
                if (response.data.success) {
                    $scope.subscribeClassBtn = "subscribe-button-suc";
                    $scope.subscribeClassInput = "subscribe-input-suc";
                    $timeout(function () {
                        $scope.subscribeButtonText = response.data.ui_message;
                    }, 400);
                } else {
                    $scope.subscribeClassBtn = "subscribe-button";
                    $scope.subscribeErrorMessage = response.data.ui_message;
                }
            }, function errorCallback(error) {
                $scope.subscribeClassBtn = "subscribe-button";
                console.log('errorCallback'); //error notification, on a side
            });
        } else {
            $scope.subscribeErrorMessage = "Valid email only";
        }
    };

    /**
    * When called this method will clear any warning messages
    */
    $scope.subscribeOnFocus = function () {
        $scope.subscribeErrorMessage = "";
    };

    $scope.trandingProducts ={
        "popular": [
            {
                "brand": "Rummo",
                "name": "Fusilli #48",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6506,
                "category": "pasta-and-baking",
                "image": "bx_11006.jpeg",
                "packaging": "1",
                "volume": "500g",
                "price": 2.69
            },
            {
                "brand": "Doritos",
                "name": "Zesty Cheese",
                "store_type_api_name": "snack-vendor",
                "product_id": 4529,
                "category": "snacks",
                "image": "p_9029.jpeg",
                "packaging": "1",
                "volume": "family",
                "price": 4.79
            },
            {
                "brand": "Dwarf Stars",
                "name": "Pumpkin Seed Butter Cups",
                "store_type_api_name": "dwarf-stars",
                "product_id": 7587,
                "category": "chocolate-and-bar",
                "image": "bg_1289.jpeg",
                "packaging": "1",
                "volume": "42g",
                "price": 5.00
            },
            {
                "brand": "Somersby",
                "name": "Apple Cider",
                "store_type_api_name": "liquor-station",
                "product_id": 87,
                "category": "cider-and-cooler",
                "image": "c_1063.jpeg",
                "packaging": "1",
                "volume": "500ml",
                "price": 4.79
            },
            {
                "brand": "Lina's Market",
                "name": "Beef Ravioli",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7614,
                "category": "frozen-food",
                "image": "bg_1316.jpeg",
                "packaging": "1",
                "volume": "regular",
                "price": 7.99
            },
            {
                "brand": "Kim Crawford",
                "name": "Sauvignon Blanc",
                "store_type_api_name": "liquor-station",
                "product_id": 1146,
                "category": "wine",
                "image": "b_3146.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 19.29
            },
            {
                "brand": "Shock Top",
                "name": "Belgian White",
                "store_type_api_name": "liquor-station",
                "product_id": 7468,
                "category": "beer",
                "image": "b_1173.jpeg",
                "packaging": "6",
                "volume": "341ml",
                "price": 15.39
            },
            {
                "brand": "Loacker",
                "name": "Coconut",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7300,
                "category": "confectionery",
                "image": "bx_11800.jpeg",
                "packaging": "1",
                "volume": "100g",
                "price": 4.49
            },
            {
                "brand": "Alamos",
                "name": "Ridge Malbec",
                "store_type_api_name": "liquor-station",
                "product_id": 1095,
                "category": "wine",
                "image": "b_3095.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 14.79
            },
            {
                "brand": "Tylenol",
                "name": "Regular",
                "store_type_api_name": "snack-vendor",
                "product_id": 6501,
                "category": "everyday-needs",
                "image": "p_11001.jpeg",
                "packaging": "",
                "volume": "24ct",
                "price": 11.99
            },
            {
                "brand": "Beatrice",
                "name": "2% Skimmed (Lactose free)",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7627,
                "category": "dairy",
                "image": "jg_1329.jpeg",
                "packaging": "1",
                "volume": "4L",
                "price": 6.99
            },
            {
                "brand": "Lavazza",
                "name": "Gran Selezione Dark Roast",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7197,
                "category": "coffee-and-tea",
                "image": "bg_11697.jpeg",
                "packaging": "1",
                "volume": "340g",
                "price": 11.49
            },
            {
                "brand": "Tostitos",
                "name": "Restaurant Style",
                "store_type_api_name": "snack-vendor",
                "product_id": 4530,
                "category": "snacks",
                "image": "p_9030.jpeg",
                "packaging": "1",
                "volume": "regular",
                "price": 4.49
            },
            {
                "brand": "MOTT's",
                "name": "Original Caeser",
                "store_type_api_name": "liquor-station",
                "product_id": 7368,
                "category": "cider-and-cooler",
                "image": "b_1069.jpeg",
                "packaging": "4",
                "volume": "355ml",
                "price": 12.39
            },
            {
                "brand": "Leoncini",
                "name": "Prosciutto Di Parma",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7619,
                "category": "deli-and-meat",
                "image": "wrp_1321.jpeg",
                "packaging": "1",
                "volume": "100g",
                "price": 5.49
            },
            {
                "brand": "Guinness",
                "name": "Draught",
                "store_type_api_name": "liquor-station",
                "product_id": 83,
                "category": "beer",
                "image": "c_1060.jpeg",
                "packaging": "4",
                "volume": "440ml",
                "price": 13.39
            },
            {
                "brand": "Tostitos",
                "name": "Medium Spicy Salsa",
                "store_type_api_name": "snack-vendor",
                "product_id": 4549,
                "category": "snacks",
                "image": "jr_9049.jpeg",
                "packaging": "1",
                "volume": "425g",
                "price": 4.59
            },
            {
                "brand": "Olivia",
                "name": "Extra Virgin Olive Oil",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7005,
                "category": "oil-and-vinegar",
                "image": "b_11355.jpeg",
                "packaging": "1",
                "volume": "1L",
                "price": 14.99
            }
        ],
        "homit_mix":[
            {
                "brand": "Anna's Country Kitchen",
                "name": "Fontina",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7612,
                "category": "dairy",
                "image": "wrp_1314.jpeg",
                "packaging": "1",
                "volume": "227g",
                "price": 11.99
            },
            {
                "brand": "Lindt",
                "name": "Hazelnut Chocolate",
                "store_type_api_name": "snack-vendor",
                "product_id": 4539,
                "category": "snacks",
                "image": "br_9039.jpeg",
                "packaging": "1",
                "volume": "100g",
                "price": 3.19
            },
            {
                "brand": "Dwarf Stars",
                "name": "Originals",
                "store_type_api_name": "dwarf-stars",
                "product_id": 7586,
                "category": "chocolate-and-bar",
                "image": "bg_1288.jpeg",
                "packaging": "1",
                "volume": "120g",
                "price": 11.99
            },
            {
                "brand": "Absolut",
                "name": "Vodka",
                "store_type_api_name": "liquor-station",
                "product_id": 2500,
                "category": "spirit",
                "image": "b_5000.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 26.49
            },
            {
                "brand": "Preservation",
                "name": "Bloody Mary mix",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7107,
                "category": "beverages",
                "image": "b_11607.jpeg",
                "packaging": "1",
                "volume": "946ml",
                "price": 11.99
            },
            {
                "brand": "Barefoot",
                "name": "Cabernet Sauvignon",
                "store_type_api_name": "liquor-station",
                "product_id": 1060,
                "category": "wine",
                "image": "b_3060.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 11.09
            },
            {
                "brand": "Palm Bay",
                "name": "Raspberry Starfruit Iced Tea",
                "store_type_api_name": "liquor-station",
                "product_id": 7429,
                "category": "cider-and-cooler",
                "image": "c_1134.jpeg",
                "packaging": "6",
                "volume": "355ml",
                "price": 13.59
            },
            {
                "brand": "Lina's Market",
                "name": "Smoked Beef Pepperoni",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7623,
                "category": "deli-and-meat",
                "image": "wrp_1325.jpeg",
                "packaging": "1",
                "volume": "168g",
                "price": 6.37
            },
            {
                "brand": "Blasted Church",
                "name": "Unorthodox Chardonnay",
                "store_type_api_name": "liquor-station",
                "product_id": 1011,
                "category": "wine",
                "image": "b_3022.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 29.99
            },
            {
                "brand": "Arctic Glacier",
                "name": "Ice",
                "store_type_api_name": "snack-vendor",
                "product_id": 5533,
                "category": "beverages",
                "image": "p_9528.jpeg",
                "packaging": "1",
                "volume": "5.95lb",
                "price": 3.59
            },
            {
                "brand": "Emma",
                "name": "Provolone",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7610,
                "category": "dairy",
                "image": "wrp_1312.jpeg",
                "packaging": "1",
                "volume": "300g",
                "price": 11.99
            },
            {
                "brand": "ITALISSIMA",
                "name": "Green Olives Manzanilla",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6898,
                "category": "canned-and-jarred",
                "image": "jr_11484.jpeg",
                "packaging": "1",
                "volume": "375ml",
                "price": 3.99
            },
            {
                "brand": "Jack Link's",
                "name": "Sweet & Hot",
                "store_type_api_name": "snack-vendor",
                "product_id": 4520,
                "category": "snacks",
                "image": "p_9020.jpeg",
                "packaging": "1",
                "volume": "80g",
                "price": 6.99
            },
            {
                "brand": "Alexander Keith's",
                "name": "IPA",
                "store_type_api_name": "liquor-station",
                "product_id": 75,
                "category": "beer",
                "image": "b_1054.jpeg",
                "packaging": "6",
                "volume": "341nl",
                "price": 16.99
            },
            {
                "brand": "Cirio",
                "name": "Pizza Sauce",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6757,
                "category": "condiments",
                "image": "c_11384.jpeg",
                "packaging": "1",
                "volume": "380ml",
                "price": 3.99
            },
            {
                "brand": "Strongbow",
                "name": "Dark Fruit Cider",
                "store_type_api_name": "liquor-station",
                "product_id": 80,
                "category": "cider-and-cooler",
                "image": "c_1057.jpeg",
                "packaging": "4",
                "volume": "440ml",
                "price": 15.99
            },
            {
                "brand": "Pringles",
                "name": "Sour Cream & Onion",
                "store_type_api_name": "snack-vendor",
                "product_id": 4501,
                "category": "snacks",
                "image": "p_9001.jpeg",
                "packaging": "1",
                "volume": "regular",
                "price": 3.69
            },
            {
                "brand": "Natur Puglia",
                "name": "Taralli with Pizza Flavour",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6830,
                "category": "baked-goods",
                "image": "btc_11262.jpeg",
                "packaging": "1",
                "volume": "250g",
                "price": 3.99
            }
        ],
        "new_on_homit":[
            {
                "brand": "Santa Lucia",
                "name": "Mini Bocconcini",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7633,
                "category": "dairy",
                "image": "cntr_1335.jpeg",
                "packaging": "1",
                "volume": "200g",
                "price": 7.99
            },
            {
                "brand": "Krave",
                "name": "Sweet Chipotle",
                "store_type_api_name": "snack-vendor",
                "product_id": 4525,
                "category": "snacks",
                "image": "p_9025.jpeg",
                "packaging": "1",
                "volume": "75g",
                "price": 7.99
            },
            {
                "brand": "Dwarf Stars",
                "name": "PumpKING Protein Balls",
                "store_type_api_name": "dwarf-stars",
                "product_id": 7588,
                "category": "chocolate-and-bar",
                "image": "bg_1290.jpeg",
                "packaging": "1",
                "volume": "60g",
                "price": 5.5
            },
            {
                "brand": "Nutella",
                "name": "Chocolate Spread",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7227,
                "category": "condiments",
                "image": "jr_11727.jpeg",
                "packaging": "1",
                "volume": "725g",
                "price": 9.99
            },
            {
                "brand": "Allessia's",
                "name": "Breadsticks with Olive Oil",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6815,
                "category": "baked-goods",
                "image": "bx_11247.jpeg",
                "packaging": "1",
                "volume": "100g",
                "price": 2.49
            },
            {
                "brand": "Molson",
                "name": "Canadian Cider Pear",
                "store_type_api_name": "liquor-station",
                "product_id": 34,
                "category": "cider-and-cooler",
                "image": "c_1022.jpeg",
                "packaging": "4",
                "volume": "473ml",
                "price": 15.99
            },
            {
                "brand": "Social Lite",
                "name": "Lime Ginger",
                "store_type_api_name": "liquor-station",
                "product_id": 7371,
                "category": "cider-and-cooler",
                "image": "c_1080.jpeg",
                "packaging": "4",
                "volume": "355ml",
                "price": 12.4
            },
            {
                "brand": "Lina's Market",
                "name": "Beef Sudjuck",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7625,
                "category": "deli-and-meat",
                "image": "wrp_1327.jpeg",
                "packaging": "1",
                "volume": "306g",
                "price": 11.6
            },
            {
                "brand": "Baileys",
                "name": "Irish Cream Original",
                "store_type_api_name": "liquor-station",
                "product_id": 3518,
                "category": "liqueur",
                "image": "b_7018.jpeg",
                "packaging": "1",
                "volume": "750ml",
                "price": 30.59
            },
            {
                "brand": "Hershey's",
                "name": "Cookies & Cream",
                "store_type_api_name": "snack-vendor",
                "product_id": 4541,
                "category": "snacks",
                "image": "br_9041.jpeg",
                "packaging": "1",
                "volume": "100g",
                "price": 3.19
            },
            {
                "brand": "Rummo",
                "name": "Tagliatelle all'uovo no.132",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7342,
                "category": "pasta-and-baking",
                "image": "bx_11842.jpeg",
                "packaging": "1",
                "volume": "250g",
                "price": 2.99
            },
            {
                "brand": "ITALISSIMA",
                "name": "Vodka Pasta Sauce",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6743,
                "category": "condiments",
                "image": "jr_11370.jpeg",
                "packaging": "1",
                "volume": "680ml",
                "price": 5.99
            },
            {
                "brand": "Smartfood",
                "name": "Gouda & Chive",
                "store_type_api_name": "snack-vendor",
                "product_id": 4513,
                "category": "snacks",
                "image": "p_9013.jpeg",
                "packaging": "1",
                "volume": "family",
                "price": 4.39
            },
            {
                "brand": "American Vintage",
                "name": "Iced Tea Raspberry",
                "store_type_api_name": "liquor-station",
                "product_id": 7416,
                "category": "cider-and-cooler",
                "image": "c_1122.jpeg",
                "packaging": "6",
                "volume": "355ml",
                "price": 15.06
            },
            {
                "brand": "Nektar",
                "name": "Hot Roasted Pepper Spread",
                "store_type_api_name": "linas-italian-market",
                "product_id": 6746,
                "category": "condiments",
                "image": "jr_11373.jpeg",
                "packaging": "1",
                "volume": "720ml",
                "price": 7.99
            },
            {
                "brand": "Martini",
                "name": "Extra Dry",
                "store_type_api_name": "liquor-station",
                "product_id": 1140,
                "category": "wine",
                "image": "b_3140.jpeg",
                "packaging": "1",
                "volume": "500ml",
                "price": 11.99
            },
            {
                "brand": "Jack Link's",
                "name": "Pork",
                "store_type_api_name": "snack-vendor",
                "product_id": 4517,
                "category": "snacks",
                "image": "p_9017.jpeg",
                "packaging": "1",
                "volume": "80g",
                "price": 6.99
            },
            {
                "brand": "Midi",
                "name": "Farci Fragola",
                "store_type_api_name": "linas-italian-market",
                "product_id": 7318,
                "category": "confectionery",
                "image": "bx_11818.jpeg",
                "packaging": "1",
                "volume": "280g",
                "price": 9.99
            }
        ]
    };

    $scope.init();
});