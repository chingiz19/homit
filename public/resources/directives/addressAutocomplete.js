/**
 * This directive is used to add google address autocomplete input box
 * 
 * Example usage:
 * <address-autocomplete 
 *      autocomplete="autocomplete"                     // REQUIRED - This is the scope object that will contain methods to access autocomplete data  
 *      on-address-selected="gotAddressResults">        // REQUIRED - This is callback function that contains the logic for when address is selected
 *      autocomplete-bounds="map.getBounds()"           // REQUIRED - This is bounds which autocomplete should put in priority when showing results
 *      input-class="srchAddrsCAB"                      // OPTIONAL - input element class
 *      icon-class="srchAddrsCACA"                      // OPTIONAL - 'x' icon element class
 *      button-class="srchAddrsCAC"                     // OPTIONAL - 'x' button element class
 * </address-autocomplete>
 * 
 */
app.directive("addressAutocomplete", function(sessionStorage, $interval, $timeout){
    
        var publicFunctions = {};
        var autoComplete;
        var privScopeAccess;
        var selectedPlace;

        /**
         * Clear input box, also remove selected address from session storage
         */
        function clearText(){
            sessionStorage.setAddress(undefined);
            privScopeAccess._searchedAddress = "";
        }
    
        /**
         * Returns Google Place object
         */
        publicFunctions.getPlace = function(){
            return selectedPlace;
        };
    
        /**
         * Returns Google LatLng object
         */
        publicFunctions.getLatLng = function(){
            if (!selectedPlace) return false;
            var lat = selectedPlace.geometry.location.lat, 
                lng = selectedPlace.geometry.location.lng;
            if (typeof lat !== "number"){
                lat = lat();
            }

            if (typeof lng !== "number"){
                lng = lng();
            }

            return new google.maps.LatLng(lat, lng);
        };

        /**
         * Returns text inside input element
         */
        publicFunctions.getText = function(){
            return privScopeAccess._searchedAddress;
        };
    
        return {
            restrict: "E", // restrict to element
            scope: {
                _searchedAddress: "@", // itself, only used locally
                addressChangeEvent: "<onAddressSelected", // required addressChanged event (one way binding)
                autocomplete: "=", // public functions (two way binding)
                inputClass: "@?inputClass",  // optional input element class(es) (as is biding)
                iconClass: "@?iconClass", // optional x icon class(es) (as is biding)
                inputDisabled: "@?inputDisabled", // optional input element
                buttonClass: "@?buttonClass", // optional x button class(es) (as is biding)
                bounds: "<autocompleteBounds" // autocomplete results in these bounds are shown first
            },
            templateUrl: '/resources/templates/addressAutocomplete.html',
            link: function(scope, element, attrs){
                // waits for DOM load
                // Need let google APIs to load
                $timeout(function(){
                    scope._predictions = [];
                    var service = new google.maps.places.AutocompleteService();
                    var places = new google.maps.places.PlacesService(document.getElementById('placesServiceNode'));
                            
                    //variable assignment
                    scope.autocomplete = publicFunctions;
                    scope.clearText = clearText;
                    privScopeAccess = scope;
    
                    var addrSelected = sessionStorage.getAddress();
                    if (addrSelected){
                        scope._searchedAddress = addrSelected.formatted_address;
                        // if address is already selected, set that address
                        selectedPlace = addrSelected;
                        
                    }
                      
                    /* Helper functions */
                    

                    /**
                     * Called on keypress event in address input box
                     */
                    scope._addressTyped = function(){           
                        if (!scope._searchedAddress){ 
                            scope._predictions = [];
                            return;
                        }


                        service.getPlacePredictions({ 
                                input: scope._searchedAddress,
                                bounds: scope.bounds,
                                types: ['geocode'],
                                componentRestrictions: { country: 'ca' }
                            }, function(predictions, status){

                            var cut_characters = 0;
                            
                            // Takes into account characters of each word in the input
                            for(var j = 0; j < predictions[0].matched_substrings.length; j++){
                                cut_characters = cut_characters + predictions[0].matched_substrings[j].length;
                            }
                            // Takes into account 'space' in the input
                            cut_characters = cut_characters + (predictions[0].matched_substrings.length - 1 );

                            for (var i = 0; i < predictions.length; i++){
                                predictions[i].description = predictions[i].description.substring(cut_characters);
                            }
                            scope._matched_part = _.startCase(_.toLower(scope._searchedAddress));
                            scope._predictions = predictions;
                            scope.$apply();
                        });
                    }

                    /**
                     * Called when dropdown item is selected
                     * @param {GooglePredictionValue} address 
                     */
                    scope._addressSelected = function(address){
                        places.getDetails({placeId: address.place_id}, function(place, status){
                            scope._searchedAddress = place.formatted_address;
                            selectedPlace = place;
                            scope._predictions = []; // clean predictions
                            scope.addressChangeEvent();
                            scope.$apply();
                        });
                    }

                }, 0);  
            }            
        };
    });