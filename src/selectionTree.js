(function() {
    'use strict';
    var app = angular.module('selectionTree', [
        'ngMaterial'
    ]);

    app.directive('selectionTree', function($timeout) {
        var template = '<div ng-if="multiple" layout="row" layout-align="start center"> \
                            <div id="field" ng-class="{readonly: readonly, withData: data && !readonly, withoutData: !data && !readonly}" class="multiple-field form-control" ng-click="!readonly && search($event)" flex> \
                                <span class="chip" ng-if="multiple" ng-repeat="result in results">{{ result.text }} <i ng-if="!readonly" class="fa fa-remove" ng-click="remove(result)"/></span> \
                                <span class="chip" ng-if="!multiple && results.text">{{ results.text }} <i ng-if="!readonly" class="fa fa-remove" ng-click="remove()"/></span> \
                                <input ng-show="!data" id="textfield" type="text" style="border: 0 solid transparent; background-color: transparent"> \
                            </div> \
                            <md-button ng-if="data && false" class="md-primary md-fab md-mini" ng-click="search()"><i class="fa fa-search" /></md-button> \
                        </div> \
                        <div ng-if="!multiple" class="input-group" style="width: 100%"> \
                                <p class="form-control" id="field">{{ results.text }}</p> \
                                <span class="input-group-btn"> \
                            <button class="btn btn-danger" type="button" ng-click="remove()" ng-if="!required"><i class="fa fa-times"/></button> \
                            <button class="btn btn-primary" type="button" ng-click="search()"><i class="fa fa-search"/></button> \
                        </div>';


        return {
            restrict: 'E',
            template: template,
            require: 'ngModel',
            scope: {
                data: '=data',
                multiple: '=multiple',
                required: '=required',
                readonly: '=ngReadonly',
                filterText: '@filterText'
            },
            link: function(scope, element, attrs, ctrl) {
                var self = this;
                ctrl.$render = function() {
                    scope.results = ctrl.$modelValue;

                    if (scope.required && (!scope.results || scope.results.length == 0)) {
                        $timeout(function() {
                            $(element.find('#field')).addClass('ng-invalid').addClass('ng-invalid-required');
                        });
                    }
                };

                ctrl.$validators.selectionTree = function(modelValue, viewValue) {
                    if (scope.required) {
                        if (scope.multiple && modelValue && modelValue.length > 0) {
                            return true;
                        } else if (!scope.multiple && modelValue) {
                            return true;
                        }

                        return false;
                    } else {
                        return true;
                    }
                };



                var PanelController = ['data', 'maxHeight', 'width', function(data, maxHeight, width) {

                    scope._timeout(function() {
                        $('#STcontainer').css('min-width', width + 'px');
                        $('#STcontainer').css('max-height', maxHeight + 'px');

                        $('#STjstree').jstree({
                            "core": {
                                "themes": { "stripes": true },
                                "check_callback": true,
                                "force_text": true,
                                "data": data
                            },

                            "plugins": ["wholerow", "sort", "search"]
                        }).on('changed.jstree', function(e, data) {
                            if (scope.multiple) {
                                if (!scope.results) {
                                    scope.results = [];
                                    ctrl.$setViewValue(scope.results);
                                }
                                var trouve = false;
                                angular.forEach(scope.results, function(result) {
                                    if (result.id == data.node.id) {
                                        trouve = true;
                                    }
                                });
                                if (!trouve) {
                                    var node = angular.copy(data.node);
                                    delete node.children;
                                    delete node.children_d;
                                    delete node.a_attr;
                                    delete node.data;
                                    delete node.icon;
                                    delete node.li_attr;
                                    delete node.original;
                                    delete node.parent;
                                    delete node.parents;
                                    delete node.state;
                                    scope.results.push(node);
                                    ctrl.$setViewValue(scope.results);
                                    //ctrl.$render();
                                    $(element.find('#field')).removeClass('ng-invalid').removeClass('ng-invalid-required');
                                }
                            } else {
                                scope.results = angular.copy(data.node);
                                delete scope.results.children;
                                delete scope.results.children_d;
                                delete scope.results.a_attr;
                                delete scope.results.data;
                                delete scope.results.icon;
                                delete scope.results.li_attr;
                                delete scope.results.original;
                                delete scope.results.parent;
                                delete scope.results.parents;
                                delete scope.results.state;
                                ctrl.$setViewValue(scope.results);
                                //ctrl.$render();
                                $(element.find('#field')).removeClass('ng-invalid').removeClass('ng-invalid-required');
                                self.panelRef.close();
                            }
                        });

                        var to = false;
                        $('#STfilter').focus();
                        $('#STfilter').keyup(function() {
                            if (to) { clearTimeout(to); }
                            to = setTimeout(function() {
                                var v = $('#STfilter').val();
                                $('#STjstree').jstree(true).search(v);
                            }, 250);
                        });
                    }, 0);
                }];



                scope.remove = function(result) {
                    if (scope.multiple) {
                        scope.results.splice(scope.results.indexOf(result), 1);
                        ctrl.$setViewValue(scope.results);
                        //ctrl.$render();
                        if (scope.results.length == 0 && scope.required) {
                            $(element.find('#field')).addClass('ng-invalid').addClass('ng-invalid-required');
                        }
                    } else {
                        scope.results = null;
                        ctrl.$setViewValue(null);
                        //ctrl.$render();
                        if (scope.required) {
                            $(element.find('#field')).addClass('ng-invalid').addClass('ng-invalid-required');
                        }
                    }
                };

                $(element.find('#textfield')).keyup(function(e) {
                    if (e.keyCode == 13 && $(element.find('#textfield')).val().length != 0) {
                        if (!scope.results) {
                            scope.results = [];
                        }
                        var trouve = false;
                        angular.forEach(scope.results, function(result) {
                            if (result.text == $(element.find('#textfield')).val()) {
                                trouve = true;
                            }
                        });
                        if (!trouve) {
                            scope.results.push({ text: $(element.find('#textfield')).val() });
                            ctrl.$setViewValue(scope.results);
                            //ctrl.$render();
                            $(element.find('#field')).removeClass('ng-invalid').removeClass('ng-invalid-required');
                            $(element.find('#textfield')).val('');
                        }
                    }
                });

                if (!scope.filterText) {
                    scope.filterText = 'filter';
                }

                var templateMenu = '<div id="STcontainer" style="background-color: #e6e6e6; border: 2px solid #c5c5c5; overflow-y: auto; overflow-x: hidden; padding-right: 20px;"> \
            <input type="text" class="form-control" id="STfilter" placeholder="' + scope.filterText + '" style="margin-bottom:10px"> \
            <div id="STjstree"></div> \
        </div>';

                scope.search = function($event) {
                    if (!scope.data) {
                        element.find('#textfield').focus();
                        return;
                    }
                    if ($event) {
                        if ($($event.target).hasClass('chip') || $($event.target).hasClass('fa')) {
                            return;
                        }
                    }
                    var width = $(element.find('#field')).outerWidth();
                    var maxHeightBottom = $(window).height() - ($(element.find('#field')).offset().top + /*$(element.find('#field')).position().top + */ $(element.find('#field')).outerHeight()) - 20;
                    var maxHeightTop = $(element.find('#field')).offset().top - 20;
                    var maxHeight;
                    var position;
                    if (maxHeightBottom > 200 || maxHeightBottom > maxHeightTop) {
                        position = scope._mdPanel.newPanelPosition()
                            .relativeTo(element.find('#field'))
                            //.absolute()
                            .left($(element.find('#field')).offset().left + 'px')
                            .top(($(element.find('#field')).offset().top + $(element.find('#field')).outerHeight()) + 'px');


                        maxHeight = maxHeightBottom;
                    } else {
                        position = scope._mdPanel.newPanelPosition()
                            .relativeTo(element.find('#field'))
                            //.absolute()
                            .left($(element.find('#field')).offset().left + 'px')
                            .bottom(($(window).height() - $(element.find('#field')).offset().top) + 'px'); // + $(element.find('#field')).outerHeight());
                        maxHeight = maxHeightTop;
                    }


                    scope.width = width;
                    //console.log($(element.find('#field')).offset().top + $(element.find('#field')).position().top + $(element.find('#field')).height());
                    /*for(var key in position){
                        console.log(key + ' / ' + position[key]);
                    }*/
                    var config = {
                        attachTo: angular.element(document.body),
                        controller: PanelController,
                        locals: {
                            data: scope.data,
                            maxHeight: maxHeight,
                            width: width
                        },
                        template: templateMenu,
                        position: position,
                        clickOutsideToClose: true,
                        escapeToClose: true,
                        focusOnOpen: false,
                        zIndex: 100
                    };
                    self.panelRef = scope._mdPanel.create(config);
                    self.panelRef.open();
                };
            },
            controller: ['$scope', '$mdPanel', '$timeout', function($scope, $mdPanel, $timeout) {
                $scope._mdPanel = $mdPanel;
                $scope._timeout = $timeout;
            }]
        };
    });

})();
