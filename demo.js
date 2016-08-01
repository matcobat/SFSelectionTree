var app = angular.module('demo', ['selectionTree']);
app.controller('demoController', function($scope) {
    $scope.options = { value: null };
    $scope.data = [{
        text: 'Root 1',
        children: [
            { text: '1.1' },
            { text: '1.2' }
        ]
    }, { text: 'Root 2' }];
});
