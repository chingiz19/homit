/**
 * This directive is used to add dropdown to UI
 * 
 * Example usage:
 * <dropdown 
 *          options="<Array>"           REQUIRED - options to show in dropdown
 *          onSelect="<Function>"       REQUIRED - function to trigger after selecting an option
 *          default="<String>"          OPTIONAL - option to select by default
 * </dropdown>
 * 
 */
app.directive("dropdown", function () {
    return {
        restrict: "E",
        scope: {
            options: "<options",
            onSelect: "=onSelect",
            defaultOption: "<?default"
        },
        templateUrl: '/resources/templates/dropdown.html',
        link: function (scope, element, attrs) {
            scope.init = function(){
                // convert objects to arrays of keys
                if (scope.options && typeof scope.options === 'object' && scope.options.constructor === Object){
                    scope.keys = Object.keys(scope.options);
                } else {
                    scope.keys = scope.options;
                }

                if (scope.defaultOption){
                    scope.select(scope.defaultOption);
                }

                scope._active = "";
            };

            scope.select = function(key){
                scope.selected = key;
                scope.onSelect(key);
                scope.toggleDropdown();
            };

            scope.toggleDropdown = function(){
                scope._active = (scope._active == "") ? "active" : "";
            };   

            scope.init();
        }
    };
});
