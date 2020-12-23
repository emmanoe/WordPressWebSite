/**
 * Themify - Drag and Drop(iframe to iframe)
 */
;
(function ($,topWindow,document,api) {
    'use strict';
    var pluginName = 'ThemifyDraggable',
            mode = 'desktop',
            scrollDir,
            doScroll = false,
            fixedHeight,
            inIframe = true,
            placeHolderIframe = false,
            draggedEl,
            droppedEl,
            topFixed,
            bottomFixed,
            placeHolderBody,
            placeHolder,
            doc = $(topWindow.document),
            currentBody,
            defaults = {
                append: true,
                dropitems: null,
                elements:null,
                type:'',
                cancel:null,
                onDragStart: null,
                onDrag: null,
                onDragEnter: null,
                onDragLeave: null,
                onDragEnd: null,
                onDrop: null
            };
    function Plugin(element, options) {
        this.element = $(element);
        this.options = $.extend({}, defaults, options);
        this.init();
    }
    Plugin.prototype = {
        init() {
            if (placeHolderIframe === false) {
                //Init PlaceHolder
                placeHolderBody = $('<div/>', {
                    id: 'tb_placeholder_body',
                    class: 'tb_placeholder_helper'
                });

                placeHolderIframe = $('<div/>', {
                    id: 'tb_placeholder_iframe',
                    class: 'tb_placeholder_helper'
                });
                currentBody = $('body');
                currentBody.prepend(placeHolderIframe).on('themify_builder_change_mode', this.changeMode);

                //Init Scroll items
                topFixed = api.toolbar.$el;
                bottomFixed = $('#tb_fixed_bottom_scroll', doc);
                $('body', doc).append(placeHolderBody);
            }
            this.element.off('mousedown.tb_visual').on('mousedown.tb_visual', this.mouseDown.bind(this));
        },
        elpos: {},
        is_enter:false,
        first:null,
        size: {w: '', h: ''},
        mouseDown(e) {
            if (e.which === 1 && !e.target.classList.contains( 'tb_disable_sorting' ) ) {
                e.preventDefault();
                draggedEl = this.element;
                doScroll = false;
                this.first=null;
                inIframe = false;
                this.elpos = draggedEl.offset();
                doc.one('mousemove.tb_visual', this.firstMove.bind(this))
                    .one('mouseup.tb_visual', this.mouseUp.bind(this));
            }
            else {
                draggedEl = placeHolder = droppedEl = null;
            }
        },
        firstMove(e){
            e.preventDefault();
            e.stopPropagation();
            if(draggedEl){
                if ($.isFunction(this.options.onDragBefore)) {
                    this.options.onDragBefore.call(this, e, draggedEl);
                }
                var module = draggedEl[0].outerHTML;
                placeHolderIframe.removeClass('drop_animate').hide().html(module);
                placeHolderBody.removeClass('drop_animate').hide().html(module);

                var $body = $('body', doc);
                $body = $body.add($('body'));
                $body.addClass('tb_drag_start tb_drag_'+this.options.type);
                this.setCurrentPlaceHolder(e);
                placeHolder.show();
                this.size.w = (placeHolder.outerWidth() / 2);
                this.size.h = (placeHolder.outerHeight());
                // Init Events
                $(document)
                        .on('mousemove.tb_visual', this.mouseMove.bind(this))
                        .on('mouseup.tb_visual', this.mouseUp.bind(this))
                        .on('mouseenter.tb_visual', this.iframeEnter.bind(this))
                        .on('mouseleave.tb_visual', this.iframeLeave.bind(this))

                        // Init Droppable zones
                        .on('mouseenter.tb_visual', this.options.dropitems, this.mouseEnter.bind(this))
                        .on('mouseleave.tb_visual', this.options.dropitems, this.mouseLeave.bind(this));
                doc
                        .on('mousemove.tb_visual', this.mouseMove.bind(this))
                        .on('mouseup.tb_visual', this.mouseUp.bind(this));

                bottomFixed
                        .on('mouseenter.tb_visual', this.scroll.bind(this))
                        .on('mouseleave.tb_visual', this.scrollUp.bind(this));
                topFixed
                        .on('mouseenter.tb_visual', this.scroll.bind(this))
                        .on('mouseleave.tb_visual', this.scrollUp.bind(this));

                this.mouseMove(e);
                if ($.isFunction(this.options.onDragStart)) {
                    this.options.onDragStart.call(this, e, draggedEl);
                }
            }
        },
        mouseMove(e) {
            if (draggedEl && placeHolder) {
				
                if (doScroll) {
                    var self = this,
                        scrollEl = currentBody.add(currentBody.closest('html'));
                    scrollEl.stop().animate({
                        scrollTop: doScroll
                    },
                    {
                        duration: 800,
                        step(scroll) {
                            if (doScroll) {
                                var top = scrollDir === 'down' ? bottomFixed.offset().top - fixedHeight : topFixed.offset().top + fixedHeight;
                                placeHolder.css('top', top);
                            }
                            else {
                                scrollEl.stop();
                            }
                            if ($.isFunction(self.options.onDrag)) {
                                self.options.onDrag.call(self, e, draggedEl, droppedEl);
                            }
                        },
                        complete() {
                            if (!self.checkScrollEnd()) {
                                scrollEl.stop();
                                doScroll = scrollDir = false;
                                self.setPlaceHolder(e);
                            }
                        }
                    });

                }
                else {
                    if(this.is_enter && this.options.elements && droppedEl){
                        var self = this,
                        items = this.is_enter.find(this.options.dropitems+','+this.options.elements).get().reverse();
                        for(var i=0,len=items.length;i<len;++i){
                            var el = $(items[i]);
                            if (self.CheckIntersect(e, el) && (!self.options.cancel || el.closest(self.options.cancel).length===0)) {  
                                self.removeAttr();
                                droppedEl = el;
                                break;
                            }
                        }
                        
                    }
                    this.setPlaceHolder(e);
                }
            }
        },
        SetSide(e) {
            var rect = droppedEl[0].getBoundingClientRect(),
                side = ((e.clientY - rect.top)/(rect.bottom - rect.top-20)) > .5 ? 'bottom' : 'top';
                if(side==='top' && droppedEl[0].parentNode===this.is_enter[0] && droppedEl.index()===0){
                    droppedEl = this.is_enter;
                }
            if (droppedEl[0].dataset.pos !== side) {
                droppedEl.attr('data-pos', side);
            }
        },
        setCurrentPlaceHolder() {
            placeHolder = inIframe ? placeHolderIframe : placeHolderBody;
        },
        setPlaceHolder(e) {
            var ev = e.originalEvent!==undefined?e.originalEvent:e;
            placeHolder.css({top: ev.pageY - this.size.h - 12, left: ev.pageX - this.size.w});
            if (droppedEl) {
                this.SetSide(e);
            }
            if ($.isFunction(this.options.onDrag)) {
                this.options.onDrag.call(this, e, draggedEl, droppedEl);
            }
        },
        removeAttr(){
            var el = document.querySelectorAll('[data-pos]');
            for(var i=el.length-1;i>-1;--i){
                el[i].removeAttribute('data-pos');
            }
        },
        mouseUp(e) {
            // Remove Events
            $(document).off('.tb_visual');
            doc.off('.tb_visual');
            bottomFixed.off('.tb_visual');
            topFixed.off('.tb_visual');
            var drag;
            if (draggedEl && placeHolder && !e.isTrigger) {

                e.stopPropagation();
                var pos = {},
                    self = this;
                    drag = draggedEl.clone();
                if (droppedEl) {
                    pos.top = droppedEl.offset().top;
                    pos.left = droppedEl.offset().left;
                    if (droppedEl[0].dataset.pos === 'bottom') {
                        pos.top += droppedEl.outerHeight();
                    }
                }
                else {
                    pos.top = this.elpos.top;
                    pos.left = this.elpos.left;
                }
                doScroll = draggedEl = null;
                this.is_enter =null;
                placeHolder.addClass('drop_animate').css(pos).one(api.Utils.transitionPrefix(), function (e) {
                    var $body = $('body', doc);
                    $body = $body.add('body');
                    if(self.options.type==='row'){
                        setTimeout(function(){
                            api.toolbar.$el.find('.tb_zoom[data-zoom="100"]').trigger('click');
                        },1000);
                    }
                    $body.removeClass('tb_drag_start tb_drag_'+self.options.type);
                    if (droppedEl && droppedEl[0].dataset.pos) {
                        drag.hide();
                        if (droppedEl[0].dataset.pos === 'bottom') {
                            if (self.options.append && !droppedEl[0].classList.contains(self.options.elements.replace('.',''))) {
                                droppedEl.append(drag);
                            }
                            else {
                                droppedEl.after(drag);
                            }
                        }
                        else {
                            if (self.options.append && !droppedEl[0].classList.contains(self.options.elements.replace('.',''))) {
                                droppedEl.prepend(drag);
                            }
                            else {
                                droppedEl.before(drag);
                            }
                        }
                        self.removeAttr();
                        if ($.isFunction(self.options.onDrop)) {
                            self.options.onDrop.call(self, e, drag, droppedEl);
                        }
                        droppedEl = null;
                    }
                    placeHolderIframe.empty().removeAttr('style');
                    placeHolderBody.empty().removeAttr('style');
                });
            }
            if ($.isFunction(this.options.onDragEnd)) {
                this.options.onDragEnd.call(this, e, drag);
            }
        },
        mouseEnter(e) {
            if (draggedEl && placeHolder) {
                e.stopPropagation();
                $(document).triggerHandler('mouseenter.tb_visual');
                this.is_enter = $(e.currentTarget);
                droppedEl = this.is_enter;
                this.removeAttr();
                this.SetSide(e);
                if ($.isFunction(this.options.onDragEnter)) {
                    this.options.onDragEnter.call(this, e, draggedEl, droppedEl);
                }
            }
        },
        mouseLeave(e) {
            var el = $(e.currentTarget);
            if (draggedEl && droppedEl && !this.CheckIntersect(e, el)) {
                var parent = el.parent().closest(this.options.dropitems);
                if(parent.length>0 && this.CheckIntersect(e, parent)){
                    parent.trigger('mouseenter.tb_visual');
                   return;
                }
                this.is_enter = null;
                this.removeAttr();
                droppedEl = false;
                if ($.isFunction(this.options.onDragLeave)) {
                    this.options.onDragLeave.call(this, e, draggedEl, el);
                }
            }
        },
        scroll(e) {
            if (draggedEl && placeHolder) {
                var step = parseInt((currentBody.height() - $(topWindow).height()) / 5),
                    el = $(e.currentTarget);
                if (el.prop('id') === 'tb_fixed_bottom_scroll') {
                    doScroll = '+=' + step + 'px';
                    scrollDir = 'down';
                }
                else {
                    doScroll = '-=' + step + 'px';
                    scrollDir = 'up';
                }
                if (step > 0) {
                    fixedHeight = el.height();
                }
                else {
                    doScroll = false;
                }
            }
        },
        checkScrollEnd() {
            var top = currentBody.scrollTop();
            return (scrollDir === 'up' && top !== 0) || (scrollDir === 'down' && ($(topWindow).height() + top) !== currentBody.height());
        },
        CheckIntersect(e, item) {
            var offset = item.offset();
            return (e.pageX >= offset.left && e.pageX <= (offset.left + item.outerWidth())) && (e.pageY >= offset.top && e.pageY <= (offset.top + item.outerHeight()));
        },
        scrollUp(e) {
            if (draggedEl && placeHolder) {
                doScroll = scrollDir = false;
                var scrollEl = currentBody.add(currentBody.closest('html'));
                scrollEl.stop();
            }
        },
        iframeEnter(e) {
            if (draggedEl && placeHolder) {
                e.stopPropagation();
                inIframe = true;
                placeHolderBody.hide();
                placeHolderIframe.show();
                this.setCurrentPlaceHolder();
                if(this.first===null){
                    this.first=true;
                    this.mouseMove(e);
                }
            }
        },
        iframeLeave(e) {
            if (draggedEl && placeHolder) {
                e.stopPropagation();
                var self = this;
                setTimeout(function () {
                    inIframe = scrollDir ? ((mode === 'desktop' || placeHolderIframe.css('display') === 'block') && self.checkScrollEnd()) : false;
                    if (!inIframe) {
                        placeHolderIframe.hide();
                        placeHolderBody.show();
                        self.setCurrentPlaceHolder();
                    }
                }, 5);
            }
        },
        changeMode(e, prev, breakpoint) {
            mode = breakpoint;
            currentBody = mode === 'desktop' ? $('body') : $('body', doc);
        }
    };
    $.fn[pluginName] = function (options) {
        for(var i=this.length-1;i>-1;--i){
            if (!$.data(this[i], 'plugin_' + pluginName)) {
                $.data(this[i], 'plugin_' + pluginName, new Plugin(this[i], options));
            }
        }
        return this;
    };
})(jQuery,window.top,document,tb_app);
