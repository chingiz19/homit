app.controller("catalogController", function($scope, $http) {
    $scope.selection = "Beers";
    $scope.types = ['ale', 'lager', 'pilsner', 'IPA'];
    $scope.packings = ['6-pack', '8-pack', '12-pack', '15-pack'];
    $scope.products = [
        { type: 'ale', packing: '6-pack', brand: 'Big Rock', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'lager', packing: '12-pack', brand: 'Canadian', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'IPA', packing: '8-pack', brand: 'Wild Rose', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'lager', packing: '6-pack', brand: 'Canadian', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'lager', packing: '15-pack', brand: 'Canadian', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'ale', packing: '12-pack', brand: 'Wild Rose', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'pilsner', packing: '6-pack', brand: 'Pilsner', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
        { type: 'lager', packing: '15-pack', brand: 'Old Milwaukee', url: 'http://www.totalwine.com/media/sys_master/twmmedia/h60/hcb/8804652056606.png', price: '15 CAD' },
    ];
    $scope.filter = [];

    $scope.stringfinder = function(str) {
        var j = 0;
        var k = 0;
        if ($scope.filter.length === 0) { return -1; } else {
            while (j < $scope.filter.length) {
                if ($scope.filter[j] == str) {
                    k = j;
                    j++;
                } else {
                    k = -1;
                    j++;
                }
            }
            return k;
        }


    }

    $scope.addtofilter = function(name) {
        alert('clicked');
        var a = $scope.stringfinder(name);
        console.log(a);

        if (a < 0) {
            $scope.filter.push(name);
            alert('addeditem');
            console.log($scope.filter);
        } else {
            delete $scope.filter[a];
            alert('itemdeleted');
            console.log($scope.filter);
        }

    };

});