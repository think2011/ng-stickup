(function () {
    /**
     * 让元素可视时固定在一个位置
     *
     * @param options
     * @param options.$target {selector} 要设置的元素
     * @param [options.$scroll] {selector} 滚动元素,默认:$(window)
     * @param [options.offset] {number} 偏移量 默认:0
     * @param [options.position=bottom] {string} 方向
     * @param [options.targetFollow=false] {boolean} target根据scroll的scrollTop
     * @param [options.debug=false] {boolean} 显示debug信息
     *
     * @requires jQuery
     * @constructor
     */
    function Stickup (options) {
        var defaults = {
            $scroll     : $(window),
            offset      : 0,
            position    : 'bottom',
            targetFollow: false,
            debug       : false
        };

        options = $.extend(defaults, options);

        this.options         = options;
        this.targetInitStyle = options.$target.attr('style') || '';

        this.init();
    }

    Stickup.prototype.init = function () {
        var that    = this;
        var options = this.options;
        var $target = options.$target;
        var $scroll = options.$scroll;
        var offset  = options.offset;
        var $wrap   = $('<div class="stickup-wrap"></div>');

        $target.wrap($wrap);

        var $targetWrap = $target.parent();

        this.onStatic(function triStatic () {
            // 取消占位
            $targetWrap.css({
                marginTop: 0
            });
            $target.attr('style', this.targetInitStyle).removeClass('stickup-show').addClass('stickup-hide');
        });

        this.onShow(function triShow () {
            var scrolTop = options.position === 'top' ? $scroll.scrollTop() : -$scroll.scrollTop();

            // 占位
            $targetWrap.css({
                marginTop: $target.outerHeight(true)
            });

            $target.css({
                position          : 'fixed',
                width             : $targetWrap.width(),
                [options.position]: options.targetFollow ? scrolTop : 0,
                zIndex            : 999999
            }).removeClass('stickup-hide').addClass('stickup-show');
        });

        this.onScroll(function () {
            if (that.busying) return false;

            that.busying = true;
            setTimeout(function () {
                onScrollFn();
                that.busying = false;
            }, 0);
        });

        // 预先触发一次
        setTimeout(function () {
            onScrollFn();
        }, 1000);

        // onScrollFn
        function onScrollFn () {
            var targetWrapTop     = $targetWrap[0].getBoundingClientRect().top;
            var scrollHeight      = $scroll.height();
            var targetOuterHeight = $target.outerHeight(true);
            var dist              = targetWrapTop - scrollHeight - offset;
            var isStickup         = dist > 0;

            // 发送事件
            $scroll.trigger('stickup:' + isStickup);

            if (options.debug) {
                console.log('=== stickup ===');
                console.log('targetWrapTop', targetWrapTop);
                console.log('targetOuterHeight', targetOuterHeight);
                console.log('scrollHeight', scrollHeight);
                console.log('dist', dist);
                console.log('offset', offset);
                console.log('isStickup', isStickup);
                console.log('=== stickup ===');
            }
        }
    };

    /**
     * onScroll事件
     * @param fn
     */
    Stickup.prototype.onScroll = function (fn) {
        this.options.$scroll.on('scroll', fn.bind(this));
    };

    /**
     * onStatic事件
     * @param fn
     */
    Stickup.prototype.onStatic = function (fn) {
        this.options.$scroll.on('stickup:false', fn.bind(this));
    };

    /**
     * onShow事件
     * @param fn
     */
    Stickup.prototype.onShow = function (fn) {
        this.options.$scroll.on('stickup:true', fn.bind(this));
    };

    /**
     * 恢复状态
     */
    Stickup.prototype.destroy = function () {
        try {
            this.options.$scroll.off('stickup:true').off('stickup:false').off('scroll');
            this.$target.attr('style', this.targetInitStyle).removeClass('stick-hide').removeClass('stick-show');
        } catch (err) {
            // do nothing..
        }
    };


    // 暴露接口
    window.Stickup = Stickup;

    var isCmd = typeof module !== 'undefined' && typeof exports === 'object' && define.cmd;
    var isAmd = typeof define === 'function' && define.amd;

    if (isCmd) {
        module.exports = Stickup;
    } else if (isAmd) {
        define(function () {
            return Stickup;
        });
    }
})();