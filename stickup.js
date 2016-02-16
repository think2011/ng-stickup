(function () {
    /**
     * 让元素可视时固定在一个位置
     *
     * @param options
     * @param options.$target {selector} 要设置的元素
     * @param [options.$scroll] {selector} 滚动元素,默认:$(window)
     * @param [options.offset] {number} 偏移量 默认:0
     * @param [options.debug=false] {boolean} 显示debug信息
     *
     * @requires jQuery
     * @constructor
     */
    function Stickup (options) {
        var defaults = {
            $scroll: $(window),
            offset : 0,
            debug  : false
        };

        options = $.extend(defaults, options);

        this.options         = options;
        this.targetInitStyle = options.$target.attr('style') || '';

        this.init();
    }

    // TODO aHao 16/2/16 边界时抖动
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
            $target.attr('style', this.targetInitStyle).addClass('stickup-hide');
        });

        this.onShow(function triShow () {
            $target.css({
                position: 'fixed',
                width   : '100%',
                bottom  : 0,
                zIndex  : 999999
            }).addClass('stickup-show');
        });

        this.onScroll(function () {
            if (that.busying) return false;

            that.busying = true;
            setTimeout(function () {
                onScrollFn();
                that.busying = false;
            }, 100);
        });

        // 预先触发一次
        setTimeout(function () {
            onScrollFn();
        }, 1500);

        // onScrollFn
        function onScrollFn () {
            var targetWrapTop = $targetWrap[0].getBoundingClientRect().top;
            var scrollHeight  = $scroll.height();
            var dist          = targetWrapTop - scrollHeight - offset;
            var isStatic      = dist >= 0;

            // 发送事件
            $scroll.trigger('stickup:' + isStatic);

            if (options.debug) {
                console.log('targetWrapTop', targetWrapTop);
                console.log('scrollHeight', scrollHeight);
                console.log('dist', dist);
                console.log('offset', offset);
                console.log('isStatic', isStatic);
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