(function () {
    angular
        .module('stickup', [])
        .directive('stickup', stickup);

    function stickup ($rootScope) {
        return {
            restrict: 'A',
            scope   : {
                cfgElScroll: '@?',
                cfgDebug   : '@?'
            },
            link    : linkFunc
        };
        function linkFunc (scope, element, attrs, ctrl) {
            var stickup = new Stickup({
                $scroll: $(scope.cfgElScroll || window),
                $target: $(element),
                debug  : scope.cfgDebug || true
            });

            // 销毁事件
            scope.$on('$destroy', function () {
                stickup.destroy();
            });
        }
    }
})();