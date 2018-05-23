/**
 * This directive is used to add google address autocomplete input box
 * 
 * Example usage:
 * <address-autocomplete 
 *      autocomplete="autocomplete"                     // REQUIRED - This is the scope object that will contain methods to access autocomplete data  
 *      on-address-selected="gotAddressResults">        // REQUIRED - This is callback function that contains the logic for when address is selected
 *      autocomplete-bounds="map.getBounds()"           // REQUIRED - This is bounds which autocomplete should put in priority when showing results
 *      input-class="address-input"                      // OPTIONAL - input element class
 *      icon-class="address-input-icon"                      // OPTIONAL - 'x' icon element class
 *      button-class="address-input-btn"                     // OPTIONAL - 'x' button element class
 *      show-coverage-map="true | false"                // OPTIONAL - Show/Hide coverage map
 * </address-autocomplete>
 * 
 */
app.directive("addressAutocomplete", function (sessionStorage, $interval, $timeout) {

    var publicFunctions = {};
    var autoComplete;
    var privScopeAccess;
    var selectedPlace;

    /**
     * Clear input box, also remove selected address from session storage
     */
    function clearText() {
        sessionStorage.setAddress(undefined);
        sessionStorage.setAddressUnitNumber("");
        publicFunctions.modified = true;
        privScopeAccess._searchedAddress = "";
        privScopeAccess._unitNumber = "";
        privScopeAccess.showCoverageMap = false;
    }

    /**
     * Returns Google Place object
     */
    publicFunctions.getPlace = function () {
        if (privScopeAccess._unitNumber) {
            selectedPlace.formatted_address = privScopeAccess._unitNumber + " " + selectedPlace.formatted_address;
        }
        return selectedPlace;
    };

    /**
     * Returns Google LatLng object
     */
    publicFunctions.getLatLng = function () {
        if (!selectedPlace) return false;
        var lat = selectedPlace.geometry.location.lat,
            lng = selectedPlace.geometry.location.lng;
        if (typeof lat !== "number") {
            lat = lat();
        }

        if (typeof lng !== "number") {
            lng = lng();
        }

        return new google.maps.LatLng(lat, lng);
    };

    /**
     * Returns text inside input element
     */
    publicFunctions.getText = function () {
        return privScopeAccess._searchedAddress;
    };

    /**
     * Returns text inside input element
     */
    publicFunctions.setText = function (text) {
        privScopeAccess._searchedAddress = text;
    };

    return {
        restrict: "E", // restrict to element
        scope: {
            _searchedAddress: "@", // itself, only used locally
            addressChangeEvent: "<onAddressSelected", // required addressChanged event (one way binding)
            autocomplete: "=", // public functions (two way binding)
            inputClass: "@?inputClass",  // optional input element class(es) (as is biding)
            iconClass: "@?iconClass", // optional x icon class(es) (as is biding)
            inputDisabled: "=?inputDisabled", // optional input element
            buttonClass: "@?buttonClass", // optional x button class(es) (as is biding)
            bounds: "<autocompleteBounds", // autocomplete results in these bounds are shown first
            showCoverageMap: "=?" // Show/Hide coverage map
        },
        templateUrl: '/resources/templates/addressAutocomplete.html',
        link: function (scope, element, attrs) {
            // waits for DOM load
            // Need let google APIs to load
            $timeout(function () {
                scope._predictions = [];
                scope._unitNumber = "";
                var service = new google.maps.places.AutocompleteService();
                var places = new google.maps.places.PlacesService(document.getElementById('placesServiceNode'));

                //variable assignment
                publicFunctions.modified = false;
                scope.autocomplete = publicFunctions;
                scope.clearText = clearText;
                privScopeAccess = scope;
                var elementNumber = 0;

                var addrSelected = sessionStorage.getAddress();
                if (addrSelected) {
                    scope._searchedAddress = addrSelected.formatted_address;
                    // if address is already selected, set that address
                    selectedPlace = addrSelected;
                }

                scope.searchedStringLength = 0;

                /* Helper functions */

                /**
                 * Called on keypress event in address input box
                 */
                scope._addressTyped = function () {
                    publicFunctions.modified = true;
                    var tmpSearchedAddress;
                    elementNumber = 0;
                    if (!scope._searchedAddress) {
                        scope._predictions = [];
                        sessionStorage.setAddressUnitNumber("");
                        scope._unitNumber = "";
                        return;
                    } else {
                        tmpSearchedAddress = scope._searchedAddress;
                    }

                    if(scope.searchedStringLength < scope._searchedAddress.length){
                        scope.searchedStringLength = scope._searchedAddress.length;
                    } else if(scope.searchedStringLength > scope._searchedAddress.length){
                        sessionStorage.setAddressUnitNumber("");
                        scope._unitNumber = "";
                    }

                    if (scope._unitNumber) {
                        tmpSearchedAddress = _.trim(_.trimStart(tmpSearchedAddress, scope._unitNumber));
                    }

                    if (!tmpSearchedAddress || _.isEmpty(tmpSearchedAddress)) return;

                    service.getPlacePredictions({
                        input: tmpSearchedAddress,
                        bounds: scope.bounds,
                        types: ['geocode'],
                        componentRestrictions: { country: 'ca' }
                    }, function (predictions, status) {

                        if (predictions == null || predictions.length <= 2) {
                            scope._unitNumber = _.escapeRegExp(_.split(tmpSearchedAddress, " ", 1));
                        }
                        var cut_characters = 0;
                        // Takes into account characters of each word in the input
                        if (predictions) {
                            for (var j = 0; j < predictions[0].matched_substrings.length; j++) {
                                cut_characters = cut_characters + predictions[0].matched_substrings[j].length;
                            }
                            // Takes into account 'space' in the input
                            cut_characters = cut_characters + (predictions[0].matched_substrings.length - 1);

                            for (var i = 0; i < predictions.length; i++) {
                                predictions[i].description = predictions[i].description.substring(cut_characters);
                            }
                            scope._matched_part = _.startCase(_.toLower(scope._searchedAddress));
                            scope._predictions = predictions;
                            scope.$apply();
                        }
                    });
                };

                scope._inptFocused = function () {
                    if(scope._searchedAddress) return;
                    $('.address-input-sec').css('box-shadow', '0 0px 10px 0px rgba(0, 0, 0, 0.8)');
                    $('.place-icon').css('fill', 'rgba(42,81,145,0.9)');
                    $('#autocompleteAddressInputBox').css({'border': '1px solid rgba(42,81,145,0.5)', 'border-radius': '3px'});
                };

                scope._inptBlured = function () {
                    if(scope._searchedAddress) return;
                    $('.address-input-sec').css('box-shadow', 'none');
                    $('.place-icon').css('fill', 'rgba(0,0,0,0.6)');
                    $('#autocompleteAddressInputBox').css({'border': '1px solid rgba(200,200,200,0.8)', 'border-radius': '1px'});
                };

                function navigatePredictions(evt) {
                    //event key "down"
                    if (evt.keyCode == 40) {
                        if (elementNumber == 0) {
                            elementNumber = elementNumber + 1;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        } else if (elementNumber == scope._predictions.length) {
                            document.getElementById("prediction_" + (elementNumber)).classList.remove('address-selected');
                            elementNumber = 1;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        } else {
                            document.getElementById("prediction_" + (elementNumber)).classList.remove('address-selected');
                            elementNumber = elementNumber + 1;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        }
                    }
                    //event key "up"
                    else if (evt.keyCode == 38) {
                        if (elementNumber == 0) {
                            elementNumber = scope._predictions.length;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        } else if (elementNumber == 1) {
                            document.getElementById("prediction_" + (1)).classList.remove('address-selected');
                            elementNumber = scope._predictions.length;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        } else {
                            document.getElementById("prediction_" + (elementNumber)).classList.remove('address-selected');
                            elementNumber = elementNumber - 1;
                            document.getElementById("prediction_" + (elementNumber)).classList.add('address-selected');
                            updateAddressinput(elementNumber);
                        }
                    }
                    //event key "enter"
                    else if (evt.keyCode == 13) {
                        scope._addressSelected(scope._predictions[elementNumber - 1]);
                    }
                    //event key "escape"
                    else if (evt.keyCode == 27) {
                        scope._searchedAddress = "";
                        scope._predictions = [];
                        scope.$apply();
                    }
                }

                function updateAddressinput(elementNumber) {
                    scope._searchedAddress = scope._matched_part + scope._predictions[elementNumber - 1].description;
                    scope.$apply();
                }

                function addEvLisToAddressInput() {
                    var addressInput = document.getElementById('autocompleteAddressInputBox');
                    addressInput.addEventListener('keyup', navigatePredictions, false);
                }

                addEvLisToAddressInput();

                /**
                 * Called when dropdown item is selected
                 * @param {GooglePredictionValue} address 
                 */
                scope._addressSelected = function (address) {
                    places.getDetails({ placeId: address.place_id }, function (place, status) {
                        if (scope._unitNumber) {
                            sessionStorage.setAddressUnitNumber(scope._unitNumber);
                            scope._searchedAddress = scope._unitNumber + " " + place.formatted_address;
                        } else {
                            scope._searchedAddress = place.formatted_address;
                        }
                        selectedPlace = place;
                        scope._predictions = []; // clean predictions
                        scope.addressChangeEvent();
                        scope.$apply();
                    });
                };
            }, 0);
        }
    };
});
