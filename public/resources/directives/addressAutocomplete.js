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
            return autoComplete.getPlace();
        };
    
        /**
         * Returns Google LatLng object
         */
        publicFunctions.getLatLng = function(){
            if (!autoComplete.getPlace()) return false;
            var lat = autoComplete.getPlace().geometry.location.lat, 
                lng = autoComplete.getPlace().geometry.location.lng;
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
            template: '<input id="autocompleteAddressInputBox" name="address" ng-model="_searchedAddress" ng-disbaled="{{inputDisabled}}" placeholder="Address" type="text" class="{{inputClass}}" required>' +
                        '<md-button aria-label="address" ng-if="_searchedAddress" class="{{buttonClass}}" ng-click="clearText()">' + 
                            '<ng-md-icon icon="clear" class="{{iconClass}}"></ng-md-icon>' + 
                        '</md-button>',
            link: function(scope, element, attrs){
                // waits for DOM load
                // Need let google APIs to load
                $timeout(function(){
                    autoComplete = new google.maps.places.Autocomplete(
                        document.getElementById("autocompleteAddressInputBox"), {
                            types: ['geocode'],
                            componentRestrictions: { country: 'ca' }
                        }
                    );
                            
                    //variable assignment
                    scope.autocomplete = publicFunctions;
                    scope.clearText = clearText;
                    privScopeAccess = scope;
    
                    var addrSelected = sessionStorage.getAddress();
                    if (addrSelected){
                        scope._searchedAddress = addrSelected.formatted_address;
                        // if address is already selected, set that address
                        setTimeout(function(){
                            autoComplete.set("place", addrSelected);
                        }, 500);
                    }
    
                    // need this interval to make sure map bounds are properly set before assigning to autocomplete
                    var interval = $interval(function(){
                        if (scope.bounds){
                            $interval.cancel(interval);
                            autoComplete.setBounds(scope.bounds);
                        }
                    }, 500);

                    autoComplete.addListener('place_changed', function(){
                        scope._searchedAddress = publicFunctions.getPlace().formatted_address;
                        scope.addressChangeEvent();
                    });
                }, 0);  
            }            
        };
    });