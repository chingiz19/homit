app.controller("catalogController", function($scope, $http) {
    $scope.selection = "Beers"
    $scope.types = ['ale', 'lager', 'pilsner', 'IPA']
    $scope.packings = ['6-pack', '8-pack', '12-pack', '15-pack']
    $scope.products = [
        { type: 'ale', packing: '6-pack', brand: 'Big Rock' },
        { type: 'lager', packing: '12-pack', brand: 'Canadian' },
        { type: 'IPA', packing: '8-pack', brand: 'Wild Rose' },
        { type: 'lager', packing: '6-pack', brand: 'Canadian' },
        { type: 'lager', packing: '15-pack', brand: 'Canadian' },
        { type: 'ale', packing: '12-pack', brand: 'Wild Rose' },
        { type: 'pilsner', packing: '6-pack', brand: 'Pilsner' },
        { type: 'lager', packing: '15-pack', brand: 'Old Milwaukee' },
    ]


});