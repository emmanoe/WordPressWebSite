(function ($, Themify, window, topWindow, document, api, Common) {
    'use strict';

    const tb_shorcodes = [],
        module_cache = [],
        propNames = {},
        cssModules={};

    api.mode = 'visual';
    api.iframe = '';
    api.id = '';
    api.is_ajax_call = false;

    api.Mixins.Frontend = {
        render_visual(callback) {
            // collect all jobs
            const constructData = {},
                    batch = Themify.convert(this.el.querySelectorAll('[data-cid]'));
            batch.unshift(this.el);
            for (let i = 0, len = batch.length; i < len; ++i) {
                let model = api.Models.Registry.lookup(batch[i].getAttribute('data-cid'));
                if (model) {
                    constructData[model.cid] = model.toJSON();
                }
            }
            api.bootstrap(constructData, callback);
        },
        change_callback() {
            const el = this.$el;
            el[0].insertAdjacentHTML('afterbegin', '<span class="tf_lazy tb_preview_component"></span>');
            this.render_visual(function () {
                el.find('.tb_preview_component').remove();
                api.Utils.setCompactMode(el[0].getElementsByClassName('module_column'));
                const cid = api.eventName === 'row' ? el.data('cid') : api.beforeEvent.data('cid');
                api.undoManager.push(cid, api.beforeEvent, el, api.eventName);
                api.Mixins.Builder.update(el);
            });
        },
        createEl(markup) {
            const type = this.model.get('elType'),
                    temp = document.createElement('div');
            temp.innerHTML = markup;
            markup = null;
            const item = temp.getElementsByClassName('module_' + type)[0],
                cl = item.classList,
                attr = item.attributes;
            for (var i = 0, len = cl.length; i < len; ++i) {
                this.el.classList.add(cl[i]);
            }
            for (i = attr.length - 1; i > -1; --i) {
                if (attr[i].name !== 'class') {
                    let n = attr[i].name;
                    this.el.setAttribute(n, attr[i].value);
                    if (n.indexOf('data-') === 0) {
                        this.$el.data(n.replace('data-', ''), attr[i].value);
                    }
                }
            }
            const cover = item.getElementsByClassName('builder_row_cover')[0],
                    dc = item.getElementsByClassName('tbp_dc_styles')[0],
                    slider = item.getElementsByClassName(type + '-slider')[0],
                    frame = item.getElementsByClassName('tb_row_frame');
            if (frame[0] !== undefined && frame[0].parentNode === item) {
                const fragment = document.createDocumentFragment(),
                        _frame = this.el.getElementsByClassName('tb_row_frame');
                for (i = _frame.length - 1; i > -1; --i) {
                    _frame[i].parentNode.removeChild(_frame[i]);
                }
                for (i = frame.length - 1; i > -1; --i) {
                    if (frame[i].parentNode === item) {
                        fragment.appendChild(frame[i].cloneNode());
                    }
                }
                this.el.insertBefore(fragment, this.el.firstChild);
            }
            if (dc !== undefined && dc.parentNode === item) {
                const _dc = this.el.getElementsByClassName('tbp_dc_styles')[0];
                if (_dc !== undefined) {
                    this.el.replaceChild(dc, _dc);
                } else {
                    this.el.appendChild(dc);
                }
            }
            if (cover !== undefined && cover.parentNode === item) {
                const _cover = this.el.getElementsByClassName('builder_row_cover')[0];
                if (_cover !== undefined) {
                    this.el.replaceChild(cover, _cover);
                } else {
                    this.el.insertAdjacentElement('afterbegin', cover);
                }
            }
            if (slider !== undefined && slider.parentNode === item) {
                const _slider = this.el.getElementsByClassName(type + '-slider')[0];
                if (_slider !== undefined) {
                    this.el.replaceChild(slider, _slider);
                } else {
                    this.el.insertAdjacentElement('afterbegin', slider);
                }
            }
        },
        restoreHtml(rememberedEl) {
            const tmp = document.createElement('div');
            tmp.innerHTML = rememberedEl;
            rememberedEl = $(tmp.firstChild);
            const $currentEl = api.liveStylingInstance.$liveStyledElmt,
                batch = Themify.convert(rememberedEl[0].querySelectorAll('[data-cid]'));
            batch.unshift(rememberedEl[0]);
            for (let i = batch.length - 1; i > -1; --i) {
                let model = api.Models.Registry.lookup(batch[i].getAttribute('data-cid'));
                if (model) {
                    model.trigger('change:view', batch[i]);
                }
            }
            $currentEl.replaceWith(rememberedEl);
            api.Mixins.Builder.update(rememberedEl);
        }
    };


    api.previewVisibility = function () {
        const $el = this.$el,
                visible = 'row' === this.model.get('elType') ? this.model.get('styling') : this.model.get('mod_settings');

        if (api.isPreview) {
            if ('hide_all' === visible['visibility_all']) {
                $el.addClass('hide-all');
            } else {
                if ('hide' === visible['visibility_desktop']) {
                    $el.addClass('hide-desktop');
                }

                if ('hide' === visible['visibility_tablet']) {
                    $el.addClass('hide-tablet');
                }

                if ('hide' === visible['visibility_tablet_landscape']) {
                    $el.addClass('hide-tablet_landscape');
                }

                if ('hide' === visible['visibility_mobile']) {
                    $el.addClass('hide-mobile');
                }
            }
            let init_rellax = false;
            if (!_.isEmpty(visible['custom_parallax_scroll_speed'])) {
                init_rellax = true;
                $el[0].dataset.parallaxElementSpeed = parseInt(visible['custom_parallax_scroll_speed']);
            }

            if (!_.isEmpty(visible['custom_parallax_scroll_reverse'])) {
                $el[0].dataset.parallaxElementReverse = true;
            }

            if (!_.isEmpty(visible['custom_parallax_scroll_fade'])) {
                $el[0].dataset.parallaxFade = true;
            }

            if (init_rellax) {
                Themify.parallaxScrollingInit($el, true);
            }

        } else {
            $el.removeClass('hide-desktop hide-tablet hide-tablet_landscape hide-mobile hide-all');
        }
    };

    _.extend(api.Views.BaseElement.prototype, api.Mixins.Frontend);

    api.Views.register_row({
        initialize() {
            this.listenTo(this.model, 'create:element', this.createEl);
            this.listenTo(this.model, 'visual:change', this.change_callback);
            this.listenTo(this.model, 'custom:restorehtml', this.restoreHtml);

            api.vent.on('dom:preview', api.previewVisibility.bind(this));
        }
    });

    api.Views.register_subrow({
        initialize() {
            this.listenTo(this.model, 'create:element', this.createEl);
            this.listenTo(this.model, 'visual:change', this.change_callback);
            this.listenTo(this.model, 'custom:restorehtml', this.restoreHtml);
        }
    });

    api.Views.register_column({
        initialize() {
            this.listenTo(this.model, 'create:element', this.createEl);
            this.listenTo(this.model, 'visual:change', this.change_callback);
            this.listenTo(this.model, 'custom:restorehtml', this.restoreHtml);
        }
    });

    api.Views.register_module({
        _jqueryXhr: false,
        templateVisual(settings) {
            const tpl = wp.template('builder-' + this.model.get('mod_name') + '-content');
            return tpl(settings);
        },
        initialize() {
            this.listenTo(this.model, 'create:element', this.createEl);
            this.listenTo(this.model, 'visual:change', this.change_callback);
            this.listenTo(this.model, 'custom:restorehtml', this.restoreHtml);
            this.listenTo(this.model, 'custom:preview:live', this.previewLive);
            this.listenTo(this.model, 'custom:preview:refresh', this.previewReload);

            api.vent.on('dom:preview', api.previewVisibility.bind(this));
        },
        createEl(markup) {
            const temp = document.createElement('div'),
                    mod_name = document.createElement('div'),
                    actionBtn = document.createElement('div'),
                    actionWrap = document.createElement('div'),
                    visibilityLabel = document.createElement('div'),
                    slug = this.model.get('mod_name');
            temp.innerHTML = markup;
            const module = temp.getElementsByClassName('module')[0],
                    css = temp.querySelector('#tb_module_styles');
            markup = null;
            if (module === undefined) {
                if (!api.is_ajax_call) {
                    api.Models.Registry.remove(this.model.cid);
                    this.model.destroy();
                }
                return false;
            }
            if (css !== null) {
                const cssList = JSON.parse(css.innerText);
                for (let i in cssList) {
                    if (!Themify.cssLazy[i] && cssList[i].s) {
                        Themify.cssLazy[i] = true;
                        Themify.LoadCss(cssList[i].s, cssList[i].v);
                    }
                }
            }
            // Visibility Label
            visibilityLabel.className = 'tb_visibility_hint';
            visibilityLabel.appendChild(api.Utils.getIcon('ti-eye'));
            this.el.innerHTML = module.innerHTML;
            this.el.appendChild(visibilityLabel);
            api.Utils.visibilityLabel(this.el);
            mod_name.className = 'tb_data_mod_name';
            mod_name.innerHTML = themifyBuilder.modules[slug].name;
            actionBtn.className = 'tf_plus_icon tb_column_btn_plus tb_module_btn_plus tb_disable_sorting';
            actionWrap.className = 'tb_action_wrap tb_module_action';
            this.el.appendChild(actionWrap);
            this.el.appendChild(mod_name);
            this.el.appendChild(actionBtn);
            const attr = module.attributes;
            this.el.className = this.attributes().class;
            const element_id = 'tb_' + this.model.get('element_id');
            for (let i = attr.length - 1; i > -1; --i) {
                if (attr[i].name === 'class') {
                    let cl = attr[i].value.split(' ');
                    for (let j = cl.length - 1; j > -1; --j) {
                        cl[j] = cl[j].trim();
                        if (element_id !== cl[j] && cl[j] !== '') {
                            this.el.classList.add(cl[j]);
                        }
                    }
                } else {
                    let k = attr[i].name;
                    this.el.setAttribute(k, attr[i].value);
                    if (k.indexOf('data-') === 0) {
                        this.$el.data(k.replace('data-', ''), attr[i].value);
                    }
                }
            }
            if (slug === 'image' && Themify.is_builder_loaded === true && api.id === false) {
                const el = this.el;
                setTimeout(function () {
                    api.Utils.checkImageSize(el);
                    api.Utils.calculateHeight();
                }, 500);
            }
        },
        shortcodeToHTML(content) {
            const self = this;
            function previewShortcode(shorcodes) {
                if (self._shortcodeXhr !== undefined && 4 !== self._shortcodeXhr) {
                    self._shortcodeXhr.abort();
                }
                self._shortcodeXhr = $.ajax({
                    type: "POST",
                    url: themifyBuilder.ajaxurl,
                    dataType: 'json',
                    data: {
                        action: 'tb_render_element_shortcode',
                        shortcode_data: JSON.stringify(shorcodes),
                        tb_load_nonce: themifyBuilder.tb_load_nonce
                    },
                    success(data) {
                        if (data.success) {
                            const shortcodes = data.data.shortcodes,
                                    styles = data.data.styles;
                            if (styles) {
                                for (let i = 0, len = styles.length; i < len; ++i) {
                                    Themify.LoadCss(styles[i].s, styles[i].v, null, styles[i].m);
                                }
                            }
                            for (let i = 0, len = shortcodes.length; i < len; ++i) {
                                let k = Themify.hash(shortcodes[i].key);
                                self.$el.find('.tmp' + k).replaceWith(shortcodes[i].html);
                                tb_shorcodes[k] = shortcodes[i].html;
                                if (Themify.is_builder_loaded) {
                                    api.Utils.loadContentJs(self.$el, 'module');
                                }
                            }
                        }
                    }
                });
            }
            const found = [],
                shorcode_list = themifyBuilder.available_shortcodes;
            let is_shortcode = false;
            for (let i = 0, len = shorcode_list.length; i < len; ++i) {
                content = wp.shortcode.replace(shorcode_list[i], content, function (atts) {
                    let sc_string = wp.shortcode.string(atts),
                            k = Themify.hash(sc_string),
                            replace = '';
                    if (tb_shorcodes[k] === undefined) {
                        found.push(sc_string);
                        replace = '<span class="tmp' + k + '">[loading shortcode...]</span>'
                    } else {
                        replace = tb_shorcodes[k];
                    }
                    is_shortcode = true;
                    return replace;
                });
            }
            if (is_shortcode && found.length > 0) {
                previewShortcode(found);
            }
            return  {'content': content, 'found': is_shortcode};
        },
        previewLive(data, is_shortcode, cid, selector, value) {
            api.is_ajax_call = false;
            if (this._jqueryXhr && 4 !== this._jqueryXhr) {
                this._jqueryXhr.abort();
            }
            let is_selector = api.activeModel !== null && selector,
                    tmpl,
                    timer = 300;
            data['cid'] = cid ? cid : api.activeModel.cid;
            if (!is_selector || is_shortcode === true) {
                tmpl = this.templateVisual(data);
                if (api.is_ajax_call) {//if previewReload is calling from visual template 
                    return;
                }
                if (is_shortcode === true) {
                    const shr = this.shortcodeToHTML(tmpl);
                    if (shr.found) {
                        timer = 1000;
                        tmpl = shr.content;
                        is_selector = null;
                    }
                }
            }
            if (is_selector) {
                const len = selector.length;
                if (len === undefined) {
                    selector.innerHTML = value;
                } else {
                    for (let i = 0; i < len; ++i) {
                        selector[i].innerHTML = value;
                    }
                }
                api.Utils.calculateHeight();
            } else {
                this.createEl(tmpl);
                if (!cid) {
                    api.liveStylingInstance.$liveStyledElmt = this.$el;
                    const self = this;
                    if (this.timeout) {
                        clearTimeout(this.timeout);
                    }
                    this.timeout = setTimeout(function () {
                        api.Utils.loadContentJs(self.$el, 'module');
                        api.Utils.calculateHeight();
                    }, timer);
                } else {
                    api.Utils.calculateHeight();
                }
            }
        },
        previewReload(settings, selector, value) {
            if (selector && api.activeModel.cid && value) {
                const len = selector.length;
                if (len === undefined) {
                    selector.innerHTML = value;
                } else {
                    for (var i = 0; i < len; ++i) {
                        selector[i].innerHTML = value;
                    }
                }
                api.Utils.calculateHeight();
                return;
            }

            const that = this;
            if (this._jqueryXhr && 4 !== this._jqueryXhr) {
                this._jqueryXhr.abort();
            }
            api.is_ajax_call = true;
            function callback(data) {
                that.createEl(data);
                api.liveStylingInstance.$liveStyledElmt = that.$el;
                api.Utils.loadContentJs(that.$el, 'module');
                that.$el.find('.tb_preview_component').remove();
                api.Utils.calculateHeight();
            }

            const name = this.model.get('mod_name'),
                    unsetKey = settings['unsetKey'];

            that.el.insertAdjacentHTML('afterbegin', '<span class="tb_preview_component tf_lazy"></span>');
            delete settings['cid'];
            delete settings['unsetKey'];
            delete settings['element_id'];

            settings = api.Utils.clear(settings);
            settings['module_' + name + '_slug'] = 1; //unique settings
            settings = JSON.stringify(settings);
            const key = Themify.hash(settings);
            if (module_cache[key] !== undefined && !unsetKey) {
                callback(module_cache[key]);
                return;
            }
            this._jqueryXhr = $.ajax({
                type: 'POST',
                url: themifyBuilder.ajaxurl,
                data: {
                    action: 'tb_load_module_partial',
                    tb_post_id: themifyBuilder.post_ID,
                    tb_cid: this.model.cid,
                    element_id: this.model.get('element_id'),
                    tb_module_slug: name,
                    tb_module_data: settings,
                    tb_load_nonce: themifyBuilder.tb_load_nonce
                },
                success(data) {
                    module_cache[key] = data;
                    callback(data);
                    api.is_ajax_call = that._jqueryXhr = false;
                },
                error() {
                    that.$el.removeClass('tb_preview_loading');
                }
            });
            return this;
        }
    });

    api.bootstrap = function (settings, callback, gsData) {
        // collect all jobs
        const jobs = [];
            let set_rules = true;
        if (!settings) {
            set_rules = false;
            settings = api.Models.Registry.items;
        }
        for (let cid in settings) {
            let model = api.Models.Registry.items[cid],
                    data = model.toJSON(),
                    type = data.elType,
                    key = type === 'module' ? 'mod_settings' : 'styling',
                    styles = data[key];
            if (styles && Object.keys(styles).length > 0) {
                if (set_rules === true) {
                    api.liveStylingInstance.setCss([data], (type === 'module' ? data['mod_name'] : type));
                }
            } else if ('module' !== type) {
                continue;
            }
            if ('module' === type && 'tile' !== data['mod_name'] && data['mod_settings']['__dc__'] === undefined && themifyBuilder.modules[data['mod_name']].type !== 'ajax') {
                const is_shortcode = 'accordion' === data['mod_name'] || 'box' === data['mod_name'] || 'feature' === data['mod_name'] || 'tab' === data['mod_name'] || 'text' === data['mod_name'] || 'plain-text' === data['mod_name'] || 'pointers' === data['mod_name'] || 'pro-image' === data['mod_name'] || 'countdown' === data['mod_name'] || 'button' === data['mod_name'] || 'pro-slider' === data['mod_name'] || 'timeline' === data['mod_name'];

                model.trigger('custom:preview:live', data['mod_settings'], is_shortcode, cid);
                continue;
            }
            if ('column' === type) {
                delete data.modules;
            } else if ('row' === type || 'module' === type || type === 'subrow') {
                if (type === 'row' && styles['custom_css_row'] === 'tb-page-break') {
                    continue;
                }
                delete data.cols;
            }
            jobs.push({jobID: cid, data: data});

        }
        settings = null;
        this.batch_rendering(jobs, 0, 360, callback, gsData);
    };

    api.batch_rendering = function (jobs, current, size, callback, gsData) {
        if (current >= jobs.length) {
            // load callback
            if (typeof callback === 'function') {
                callback.call(this);
            }
            api.toolbar.pageBreakModule.countModules();
			Themify.trigger('tb_css_visual_modules_load');
            return;
        } else {
            const smallerJobs = jobs.slice(current, current + size);
            this.render_element(smallerJobs, gsData).done(function () {
                api.batch_rendering(jobs, current += size, size, callback);
            });
        }
    };

    api.render_element = function (constructData, gsData) {
        const data = {
            action: 'tb_render_element',
            tmpGS: gsData ? JSON.stringify(gsData) : '',
            batch: JSON.stringify(constructData),
            tb_load_nonce: themifyBuilder.tb_load_nonce,
            tb_post_id: themifyBuilder.post_ID
        };
        return $.ajax({
            type: 'POST',
            url: themifyBuilder.ajaxurl,
            dataType: 'json',
            data: data,
            success(data) {
                for (let cid in data) {
                    if (cid !== 'tb_module_styles' && cid !== 'gs') {
                        api.Models.Registry.lookup(cid).trigger('create:element', data[cid]);
                    }
                }
                if (data['tb_module_styles']) {
                    const cssList = data['tb_module_styles'];
                    for (let i in cssList) {
						let href=cssList[i].s;
                        if (!Themify.cssLazy[i] && href) {
                            Themify.cssLazy[i] = true;
							cssModules[href]=true;
                            Themify.LoadCss(href, cssList[i].v,null,null,function(){
								delete cssModules[href];
								if(Object.keys(cssModules).length===0){
									Themify.trigger('tb_css_visual_modules_load');
								}
							});
                        }
                    }
                }
				else{
					Themify.trigger('tb_css_visual_modules_load');
				}
            }
        });
    };

    function get_visual_templates(callback) {
        if (api.Forms.LayoutPart.init) {
            if (callback) {
                callback();
            }
            return;
        }
        const key = 'tb_visual_templates';
        function getData() {
            if (themifyBuilder.debug) {
                return false;
            }
            try {
                let record = localStorage.getItem(key),
                    m='';
                if (!record) {
                    return false;
                }
                record = JSON.parse(record);
                for (let s in themifyBuilder.modules) {
                    m += s;
                }
                if (record.ver.toString() !== themify_vars.version.toString() || record.h !== Themify.hash(m)) {
                    return false;
                }
                return record.val;
            } catch (e) {
                return false;
            }
            return false;
        }
        function setData(value) {
            try {
                let m = '';
                for (var s in themifyBuilder.modules) {
                    m += s;
                }
                const record = {val: value, ver: themify_vars.version, h: Themify.hash(m)};
                localStorage.setItem(key, JSON.stringify(record));
                return true;
            } catch (e) {
                return false;
            }
        }

        function insert(data) {
            let insert = '';
            for (let i in data) {
                insert += data[i];
            }
            document.body.insertAdjacentHTML('beforeend', insert);
            if (callback) {
                callback();
            }
        }
        const data = getData();
        if (data) {//cache visual templates)
            insert(data);
            return;
        }
        $.ajax({
            type: 'POST',
            url: themifyBuilder.ajaxurl,
            dataType: 'json',
            data: {
                action: 'tb_load_visual_templates',
                tb_load_nonce: themifyBuilder.tb_load_nonce
            },
            success(resp) {
                if (resp) {
                    insert(resp);
                    setData(resp);
                }
            }
        });
    }
    ;

    api.render = function () {
        get_visual_templates(function () {
            const items = document.getElementsByClassName('themify_builder_content'),
                    id = themifyBuilder.post_ID;
                let builder = null;
            for (let i = items.length - 1; i > -1; --i) {
                if (items[i].getAttribute('data-postid') != id) {
                    items[i].classList.add('not_editable_builder');
                } 
                else if (builder === null) {
                    builder = items[i];
                    builder.setAttribute('id', 'themify_builder_content-' + id);
                    builder.setAttribute('data-postid', id);
                    builder.classList.remove('not_editable_builder');
                    builder.classList.add('tb_active_builder');
                }
            }
            let data = window['builderdata_' + id] ? window['builderdata_' + id].data : [];
            if (!Array.isArray(data) || data.length === 0) {
                data = {};
            } else {
                data = data.filter(function (e) {
                    return e && Object.keys(e).length > 0;
                });
            }
            window['builderdata_' + id] = null;
            api.id = id;
            api.Instances.Builder[api.builderIndex] = new api.Views.Builder({el: builder, collection: new api.Collections.Rows(data), type: api.mode});
            api.Instances.Builder[api.builderIndex].render();
            data = null;
            api.bootstrap(null, function () {
                ThemifyStyles.init(ThemifyConstructor.data, ThemifyConstructor.breakpointsReverse, id);
                api.liveStylingInstance = new ThemifyLiveStyling();
                api.liveStylingInstance.setCss(api.Mixins.Builder.toJSON(api.Instances.Builder[0].el));
                setTimeout(verticalResponsiveBars, 2000);
                Themify.on('tb_css_visual_modules_load',function(){
                    
                        const topSvg=topWindow.document.getElementById('tf_svg'),
                            svg=document.getElementById('tf_svg');
                        topSvg.parentNode.replaceChild(svg,topSvg);
                        api.toolbar.el.style.display = 'block';
                        topWindow.jQuery('body').trigger('themify_builder_ready');
                        api.Utils.loadContentJs();
                        Themify.is_builder_loaded = true;
                        api.Instances.Builder[api.builderIndex].$el.triggerHandler('tb_init');
                        //TB_Inline.init();		
                        api.id = false;
                        setTimeout(function () {
                                api.Utils.checkAllimageSize();
                                api.EdgeDrag.init();
                        }, 500);
                },true);
            });
        });
    };
    // Initialize Builder
    Themify.body.one('builderiframeloaded.themify', function (e, iframe) {
        api.iframe = $(iframe);
        setTimeout(function () {
            Themify.loadAnimateCss();
        }, 1);
        Common.setToolbar();
        api.toolbar = new api.Views.Toolbar({el: '#tb_toolbar'});
        api.toolbar.render();
        api.GS.init();
        Themify.LoadAsync(tbLocalScript.builder_url + '/js/editor/themify-constructor.js', function () {
            //use top iframe js files
            window.wp.media = window.top.wp.media;
            window.MediaElementPlayer = window.top.MediaElementPlayer;
            jQuery.fn.mediaelementplayer = window.top.jQuery(window.top.document).mediaelementplayer;
            window.wp.mediaelement = window.top.wp.mediaelement;
            window.tinyMCE = window.top.tinyMCE;
            window.tinyMCEPreInit = window.top.tinyMCEPreInit;
            window.tinymce = window.top.tinymce;
            window.switchEditors = window.top.switchEditors;
            // Used in WP widgets
            window.wpApiSettings = window.top.wpApiSettings;
            
            ThemifyConstructor.getForms(api.render);
        }, null, null, function () {
            return typeof ThemifyConstructor !== 'undefined';
        });
    });

    const ThemifyLiveStyling = (function ($) {

        function ThemifyLiveStyling() {
            this.$context = $('#tb_lightbox_parent', topWindow.document);
            this.prefix;
            this.type;
            this.group;
            this.styleTab;
            this.styleTabId;
            this.currentField = null;
            this.isChanged = null;
            this.$liveStyledElmt = null;
            this.module_rules = {};
            this.rulesCache = {};
            this.tempData;
            this.undoData;
            this.currentStyleObj = {};
            this.currentSheet;
        }
        ThemifyLiveStyling.prototype.init = function (isInline, isGlobal) {
            var type,
                    elId = api.activeModel.get('element_id');
            this.type = api.activeModel.get('elType');
            this.group = this.type === 'module' ? api.activeModel.get('mod_name') : this.type;
            if (isGlobal === true && api.GS.previousModel !== null) {
                var tmp_m = api.Models.Registry.lookup(api.GS.previousModel);
                type = tmp_m.get('elType');
                if (type === 'module') {
                    type = tmp_m.get('mod_name');
                }
                elId = tmp_m.get('element_id');
            } else {
                type = this.group;
            }
            this.prefix = ThemifyStyles.getBaseSelector(type, elId);
            this.$liveStyledElmt = $(document.querySelector(this.prefix));
            this.currentStyleObj = {};
            this.tempData = {};
            this.undoData = {};
            this.undoData[api.activeBreakPoint] = {};
            this.tempData[api.activeBreakPoint] = {};
            if (this.rulesCache[api.activeBreakPoint] === undefined) {
                this.rulesCache[api.activeBreakPoint] = {};
            }
            this.currentSheet = this.getSheet(api.activeBreakPoint, isGlobal);
            if (isInline !== true) {
                if (this.type !== 'column' && this.type !== 'subrow') {
                    this.bindAnimation();
                }
                this.bindTabsSwitch();
                this.initModChange();
            }
        };


        ThemifyLiveStyling.prototype.setCss = function (data, type, isGlobal) {
            const css = api.GS.createCss(data, type, undefined),
                    fonts = [];
            for (let p in  css) {
                if ('fonts' === p || 'cf_fonts' === p) {
                    for (var f in css[p]) {
                        var v = f;
                        if (css[p][f].length > 0) {
                            v += ':' + css[p][f].join(',');
                        }
                        fonts.push(v);
                    }
                } else if ('gs' === p) {
                    let st = css[p];
                    for (let bp in st) {
                        let sheet = this.getSheet(bp, true),
                                rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                        for (let k in st[bp]) {
                            if (this.findIndex(rules, k) === false) {
                                sheet.insertRule(k + '{' + st[bp][k].join('') + ';}', rules.length);
                            }
                        }
                    }
                } else if (p !== 'bg') {
                    let sheet = this.getSheet(p, isGlobal),
                            rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                    for (let k in css[p]) {
                        if (this.findIndex(rules, k) === false) {
                            sheet.insertRule(k + '{' + css[p][k].join('') + ';}', rules.length);
                        }
                    }
                }
            }
            ThemifyConstructor.font_select.loadGoogleFonts(fonts.join('|'));
            return css;
        };

        ThemifyLiveStyling.prototype.findIndex = function (rules, selector) {
            for (let i = rules.length - 1; i > -1; --i) {
                if (selector === rules[i].selectorText.replace(/\s*>\s*/g, '>').replace(/\,\s/g, ',')) {
                    return i;
                }
            }
            return false;
        };

        ThemifyLiveStyling.prototype.renameProp = function (p) {
            if (propNames[p] === undefined) {
                const old_p = p;
                if (p.indexOf('-') !== -1) {
                    const temp = p.toLowerCase().split('-');
                    p = temp[0] + temp[1].charAt(0).toUpperCase() + temp[1].slice(1);
                    if (temp[2] !== undefined) {
                        p += temp[2].charAt(0).toUpperCase() + temp[2].slice(1);
                    }
                    if (temp[3] !== undefined) {
                        p += temp[3].charAt(0).toUpperCase() + temp[3].slice(1);
                    }
                }
                propNames[old_p] = p;
                return p;
            }
            return propNames[p];
        };
        /**
         * Apply CSS rules to the live styled element.
         *
         * @param {string} containing CSS rules for the live styled element.
         * @param {mixed) 
         * @param {Array} selectors List of selectors to apply the newStyleObj to (e.g., ['', 'h1', 'h2']).
         */
        ThemifyLiveStyling.prototype.setLiveStyle = function (prop, val, selectors) {
            if (!selectors) {
                selectors = [''];
            } else if (typeof selectors === 'string') {
                selectors = [selectors];
            }
            selectors = ThemifyStyles.getNestedSelector(selectors);
            let fullSelector = '';
            const rules = this.currentSheet.cssRules ? this.currentSheet.cssRules : this.currentSheet.rules;
            for (let i = 0, len = selectors.length; i < len; ++i) {
                let isPseudo = this.styleTabId === 'h' ? selectors[i].endsWith(':after') || selectors[i].endsWith(':before') : true;
                if (isPseudo === false && selectors[i].indexOf(':hover') === -1) {
                    selectors[i] += ':hover';
                }
                fullSelector += this.prefix + selectors[i];
                if (isPseudo === false) {
                    fullSelector += ',' + this.prefix + selectors[i].replace(':hover', '.tb_visual_hover');
                }
                if (i !== (len - 1)) {
                    fullSelector += ',';
                }
            }
            if (this.isChanged === true) {
                let hover_items;
                if (this.styleTabId === 'h') {
                    var hover_selectors = fullSelector.split(',');
                    for (let i = hover_selectors.length - 1; i > -1; --i) {
                        if (hover_selectors[i].indexOf('tb_visual_hover') === -1) {
                            hover_items = document.querySelectorAll(hover_selectors[i].split(':hover')[0]);
                            for (let j = hover_items.length - 1; j > -1; --j) {
                                hover_items[j].classList.add('tb_visual_hover');
                            }
                        }
                    }
                    hover_selectors = null;
                } else {
                    this.$liveStyledElmt[0].classList.remove('tb_visual_hover');
                    hover_items = this.$liveStyledElmt[0].getElementsByClassName('tb_visual_hover');
                    for (let i = hover_items.length - 1; i > -1; --i) {
                        hover_items[i].classList.remove('tb_visual_hover');
                    }
                }
                hover_items = null;
            }
            fullSelector = fullSelector.replace(/\s{2,}/g, ' ').replace(/\s*>\s*/g, '>').replace(/\,\s/g, ',');
            const hkey = Themify.hash(fullSelector),
                orig_v = val,
                old_prop = prop;
                let index = this.rulesCache[api.activeBreakPoint][hkey] !== undefined ? this.rulesCache[api.activeBreakPoint][hkey] : this.findIndex(rules, fullSelector);
            if (val === false) {
                val = '';
            }
            prop = this.renameProp(prop);
            if (index === false || !rules[index]) {
                index = rules.length;
                this.currentSheet.insertRule(fullSelector + '{' + old_prop + ':' + val + ';}', index);
                if (this.tempData[api.activeBreakPoint][index] === undefined) {
                    this.tempData[api.activeBreakPoint][index] = {};
                }
                this.tempData[api.activeBreakPoint][index][prop] = '';
            } else {
                if (this.tempData[api.activeBreakPoint][index] === undefined) {
                    this.tempData[api.activeBreakPoint][index] = {};
                }
                if (this.tempData[api.activeBreakPoint][index][prop] === undefined) {
                    this.tempData[api.activeBreakPoint][index][prop] = rules[index].style[prop];
                }
                rules[index].style[prop] = val;

            }
            this.rulesCache[api.activeBreakPoint][hkey] = index;
            if (this.undoData[api.activeBreakPoint][index] === undefined) {
                this.undoData[api.activeBreakPoint][index] = {};
            }
            this.undoData[api.activeBreakPoint][index][prop] = {'a': val, 'b': this.tempData[api.activeBreakPoint][index][prop]};
            Themify.body.triggerHandler('tb_' + this.type + '_styling', [this.group, prop, val, orig_v, this.$liveStyledElmt]);
            if (api.activeBreakPoint !== 'desktop' && (prop.indexOf('padding') === 0 || prop.indexOf('margin') === 0 || prop === 'height' || prop === 'width')) {
                api.Utils.calculateHeight();
            }
        };


        ThemifyLiveStyling.prototype.initModChange = function (off) {
            if (off === true) {
                Themify.body.off('themify_builder_change_mode.tb_visual_mode');
                return;
            }
            const self = this;
            Themify.body.on('themify_builder_change_mode.tb_visual_mode', function (e, prevbreakpoint, breakpoint) {
                self.setMode(breakpoint, api.GS.activeGS !== null);
            });
        };

        ThemifyLiveStyling.prototype.setMode = function (breakpoint, isGlobal) {
            if (this.tempData[breakpoint] === undefined) {
                this.tempData[breakpoint] = {};
            }
            if (this.rulesCache[breakpoint] === undefined) {
                this.rulesCache[breakpoint] = {};
            }
            if (this.undoData[breakpoint] === undefined) {
                this.undoData[breakpoint] = {};
            }
            this.currentSheet = this.getSheet(breakpoint, isGlobal);
        };

        ThemifyLiveStyling.prototype.revertRules = function (isGlobal) {
            for (let points in this.tempData) {
                let sheet = this.getSheet(points, isGlobal),
                        rules = sheet.cssRules ? sheet.cssRules : sheet.rules;
                for (let i in this.tempData[points]) {
                    if (rules[i]) {
                        for (let j in this.tempData[points][i]) {
                            rules[i].style[j] = this.tempData[points][i][j];
                        }
                    }
                }
            }
            this.undoData = {};
            this.tempData = {};
        };
        ThemifyLiveStyling.prototype.getSheet = function (breakpoint, isGlobal) {
            return  ThemifyStyles.getSheet(breakpoint, isGlobal);
        };

        ThemifyLiveStyling.prototype.reset = function () {
            this.rulesCache = {};
            this.tempData = {};
            this.undoData = {};
            var points = ThemifyConstructor.breakpointsReverse;
            for (let i = points.length - 1; i > -1; --i) {
                let sheet = this.getSheet(points[i]),
                        rules = sheet.cssRules;
                for (let j = rules.length - 1; j > -1; --j) {
                    sheet.deleteRule(j);
                }
                sheet = this.getSheet(points[i], true);
                rules = sheet.cssRules;
                for (let j = rules.length - 1; j > -1; --j) {
                    sheet.deleteRule(j);
                }
            }
        };


        //closing lightbox
        ThemifyLiveStyling.prototype.clear = function () {
            const self = this,
                    el = this.$liveStyledElmt[0];
            if (el !== undefined) {
                el.classList.remove('animated','hover-wow','tb_visual_hover');
            }
            self.module_rules = {};
            this.styleTab = this.styleTabId = this.currentField = this.isChanged = null;
            if (!api.saving && api.hasChanged) {
                self.revertRules(api.GS.activeGS !== null);
                if (self.type && self.type !== 'module' && api.GS.activeGS === null) {
                    const styling = api.activeModel.get('styling');
                    if (styling && (styling['background_type'] === 'slider' && styling['background_slider'])) {
                        self.bindBackgroundSlider();
                    }
                }
            } else {
                const hover_items = el.getElementsByClassName('tb_visual_hover');
                for (let k = hover_items.length - 1; k > -1; --k) {
                    hover_items[k].classList.remove('tb_visual_hover');
                }
            }
            self.bindAnimation(true);
            self.bindTabsSwitch(true);
            self.initModChange(true);
            self.undoData = {};
            self.tempData = {};
            this.$liveStyledElmt = this.currentStyleObj = this.currentSheet = null;
        };
        ThemifyLiveStyling.prototype.addOrRemoveFrame = function (_this, settings) {
            if (this.type === 'module') {
                return;
            }
            var self = this,
                    $el = this.$liveStyledElmt,
                    isLive = typeof _this === 'string',
                    side = isLive ? _this : _this.closest('.tb_tab').id.split('_').pop(),
                    $frame = $el.children('.tb_row_frame_' + side);
            if (undefined === settings) {
                settings = {};
                var selector = this.getValue(side + '-frame_type').selector,
                        options = ['custom', 'location', 'width', 'height', 'width_unit', 'height_unit', 'repeat', 'type', 'layout', 'color'];
                for (var i = 0, len = options.length; i < len; ++i) {
                    var item = topWindow.document.getElementById(side + '-frame_' + options[i]),
                            v;
                    if (options[i] === 'type') {
                        v = item.querySelector('input:checked').value;
                    } else if (options[i] === 'layout') {
                        v = item.getElementsByClassName('selected')[0].id;
                    } else if (options[i] === 'color') {
                        v = api.Utils.getColor(item);
                        if (v === '') {
                            continue;
                        }
                    } else {
                        v = item.value;
                    }
                    settings[options[i]] = v;
                }
            }
            if (settings.type === side + '-presets' || settings.type === side + '-custom') {
                if ((settings.type === side + '-presets' && (!settings.layout || settings.layout === 'none')) || (settings.type === side + '-custom' && !settings.custom)) {
                    if (api.activeBreakPoint === 'desktop') {
                        if (!isLive) {
                            this.setLiveStyle('background-image', '', selector);
                        }
                    } else if (settings.layout === 'none') {
                        this.setLiveStyle('background-image', 'none', selector);
                    }
                    return;
                }
                if ($frame.length === 0) {
                    $frame = document.createElement('div');
                    $frame.className = 'tf_abs tb_row_frame tb_row_frame_' + side;
                    if (settings.location !== undefined) {
                        $frame.className += ' ' + settings.location;
                    }
                    $el.children('.tb_action_wrap').after($frame);
                } else {
                    $frame.removeClass('behind_content in_front');
                    if (settings.location !== undefined) {
                        $frame.addClass(settings.location);
                    }
                }
            }
            if (!isLive) {
                if (settings.type === side + '-presets') {
                    var layout = (side === 'left' || side === 'right') ? settings.layout + '-l' : settings.layout,
                            key = Themify.hash(layout),
                            callback = function (svg) {
                                if (settings.color) {
                                    svg = svg.replace(/\#D3D3D3/ig, settings.color);
                                }
                                self.setLiveStyle('background-image', 'url("data:image/svg+xml;utf8,' + encodeURIComponent(svg) + '")', selector);
                            };
                    if (ThemifyStyles.fields.frameCache[key] !== undefined) {
                        callback(ThemifyStyles.fields.frameCache[key]);
                    } else {
                        var frame = document.getElementById('tmpl-frame_' + layout);
                        if (frame !== null) {
                            ThemifyStyles.fields.frameCache[key] = frame.textContent.trim();
                            frame = null;
                            callback(ThemifyStyles.fields.frameCache[key]);
                        } else {
                            $.ajax({
                                dataType: 'text',
                                url: tbLocalScript.builder_url + '/img/row-frame/' + layout + '.svg',
                                success(svg) {
                                    ThemifyStyles.fields.frameCache[key] = svg;
                                    callback(svg);
                                }
                            });
                        }
                    }

                } else {
                    self.setLiveStyle('background-image', 'url("' + settings.custom + '")', selector);
                }
                self.setLiveStyle('width', (settings.width ? (settings.width + settings.width_unit) : ''), selector);
                self.setLiveStyle('height', (settings.height ? (settings.height + settings.height_unit) : ''), selector);
                if (settings.repeat) {
                    if (side === 'left' || side === 'right') {
                        self.setLiveStyle('background-size', '100% ' + (100 / settings.repeat) + '%', selector);
                    } else {
                        self.setLiveStyle('background-size', (100 / settings.repeat) + '% 100%', selector);
                    }
                } else {
                    self.setLiveStyle('background-size', '', selector);
                }
            }
        };


        ThemifyLiveStyling.prototype.overlayType = function (val) {
            if (this.type === 'module') {
                return;
            }
            var is_color = val === 'color' || val === 'hover_color',
                    cl = is_color ? 'minicolors-input' : 'themify-gradient-type',
                    el = this.styleTab.getElementsByClassName('tb_group_element_' + val)[0].getElementsByClassName(cl)[0];
            if (is_color) {
                var v = el.value;
                if (v) {
                    v = api.Utils.getColor(el);
                }
                Themify.triggerEvent(el, 'themify_builder_color_picker_change', {val: v});
            } else {
                Themify.triggerEvent(el, 'change');

            }
        };

        ThemifyLiveStyling.prototype.addOrRemoveComponentOverlay = function (type, id, v) {
            if (this.type === 'module') {
                return;
            }
            var overlayElmt = this.getComponentBgOverlay(),
                    data = this.getValue(id),
                    selector = data.selector,
                    isset = overlayElmt.length !== 0;
            if (this.styleTabId === 'h') {
                this.$liveStyledElmt[0].classList.add('tb_visual_hover');
            } else {
                this.$liveStyledElmt[0].classList.remove('tb_visual_hover');
            }
            if (v === '' && id) {
                this.setLiveStyle('backgroundImage', '', selector);
                this.setLiveStyle('backgroundColor', '', selector);
            } else {
                if (!isset) {
                    overlayElmt = document.createElement('div');
                    overlayElmt.className = 'tf_abs builder_row_cover';
                    this.$liveStyledElmt.children('.tb_action_wrap').before(overlayElmt);
                }
                // To prevent error if runs from GS
                if (!data) {
                    return;
                }
                if (type === 'color') {
                    this.setLiveStyle('backgroundImage', 'none', selector);
                } else {
                    this.setLiveStyle('backgroundColor', false, selector);
                }
                this.setLiveStyle(data.prop, v, selector);
            }
        };

        ThemifyLiveStyling.prototype.bindMultiFields = function (_this, data) {
            var self = this;
            function setFullWidth(val, prop) {
                if (is_border === false && is_border_radius === false) {
                    if (self.type === 'row' && tbLocalScript.fullwidth_support === undefined && ((is_checked && (prop === 'padding' || prop === 'margin')) || prop === 'padding-left' || prop === 'padding-right' || prop === 'margin-left' || prop === 'margin-right')) {
                        var type = prop.split('-'),
                                k = api.activeBreakPoint + '-' + type[0];
                        if (is_checked) {
                            val = val + ',' + val;
                        } else {
                            var old_val = self.$liveStyledElmt.data(k);
                            if (!old_val) {
                                old_val = [];
                            } else {
                                old_val = old_val.split(',');
                            }
                            if (type[1] === 'left') {
                                old_val[0] = val;
                            } else {
                                old_val[1] = val;
                            }
                            val = old_val.join(',');
                        }
                        self.$liveStyledElmt.attr('data-' + k, val).data(k, val);
                        ThemifyBuilderModuleJs.setupFullwidthRows(self.$liveStyledElmt);
                    }
                    if ((is_checked && prop === 'padding') || prop.indexOf('padding') === 0) {
                        setTimeout(function () {
                           Themify.trigger('tfsmartresize');
                        }, 600);
                    }
                }
            }

            var prop_id = _this.id,
                    data = self.getValue(prop_id);

            if (data) {
                var parent = _this.closest('.tb_seperate_items'),
                        prop = data.prop.split('-'),
                        is_border_radius = prop[3] !== undefined,
                        is_border = is_border_radius === false && prop[0] === 'border',
                        is_checked = parent.hasAttribute('data-checked'),
                        items = parent.getElementsByClassName('tb_multi_field'),
                        getCssValue = function (el) {
                            var getBorderValue = function () {
                                var parent = el.closest('li'),
                                        width = parseFloat(parent.getElementsByClassName('border_width')[0].value.trim()),
                                        style = parent.getElementsByClassName('border_style')[0].value,
                                        v = '',
                                        color_val = api.Utils.getColor(parent.getElementsByClassName('minicolors-input')[0]);
                                if (style === 'none') {
                                    v = style;
                                } else if (isNaN(width) || width === '' || color_val === '') {
                                    v = '';
                                } else {
                                    v = width + 'px ' + style + ' ' + color_val;
                                }
                                return v;
                            },
                                    v;
                            if (is_border === true) {
                                v = getBorderValue();
                            } else {
                                v = el.value.trim();
                                if (v !== '') {
                                    v = parseFloat(v);
                                    if (isNaN(v)) {
                                        v = '';
                                    } else {
                                        v += el.closest('.tb_input').querySelector('#' + el.id + '_unit').value;
                                    }
                                }
                            }
                            return v;
                        },
                        val = is_checked === true ? getCssValue(_this) : null;
                prop = prop[0];
                for (var i = items.length - 1; i > -1; --i) {
                    if (is_checked === false) {
                        val = getCssValue(items[i]);
                    }
                    prop = self.getValue(items[i].id).prop;
                    self.setLiveStyle(prop, val, data.selector);
                    setFullWidth(val, prop);
                }
                if (is_border === false) {
                    api.ActionBar.hoverCid = null;
                }

                items = null;
            }
        };

        ThemifyLiveStyling.prototype.bindRowWidthHeight = function (id, val, el) {
            if (!el) {
                el = this.$liveStyledElmt;
            }
            if (id === 'row_height') {
                if (val === 'fullheight') {
                    el[0].classList.add(val);
                } else {
                    el[0].classList.remove('fullheight');
                }
            } else {
                if (val === 'fullwidth') {
                    el.removeClass('fullwidth').addClass('fullwidth_row_container');
                    ThemifyBuilderModuleJs.setupFullwidthRows(el);
                } else if (val === 'fullwidth-content') {
                    el.removeClass('fullwidth_row_container').addClass('fullwidth');
                    ThemifyBuilderModuleJs.setupFullwidthRows(el);
                } else {
                    el.removeClass('fullwidth fullwidth_row_container')
                            .css({
                                'margin-left': '',
                                'margin-right': '',
                                'padding-left': '',
                                'padding-right': '',
                                'width': ''
                            });
                }
            }
            Themify.trigger('tfsmartresize');
        };
        ThemifyLiveStyling.prototype.bindAnimation = function (off) {
            var self = this;
            if (off === true) {
                this.$context.off('change.tb_animation');
                return;
            }
            this.$context.on('change.tb_animation', '#animation_effect,#animation_effect_delay,#animation_effect_repeat,#hover_animation_effect', function () {
                var is_hover = this.id === 'hover_animation_effect',
                        key = is_hover ? 'hover_animation_effect' : 'animation_effect',
                        effect = is_hover ? $(this).val() : self.$context.find('#animation_effect').val(),
                        animationEffect = self.currentStyleObj[key] !== undefined ? self.currentStyleObj[key] : ThemifyConstructor.values[key],
                        el = self.$liveStyledElmt;
                if (animationEffect) {
                    if (is_hover) {
                        animationEffect = animationEffect + ' hover-wow hover-animation-' + animationEffect;
                    }
                    el.removeClass(animationEffect + ' wow').css({'animation-name': '', 'animation-delay': '', 'animation-iteration-count': ''});
                }
                el.removeClass('animated tb_hover_animate');
                self.currentStyleObj[key] = effect;
                if (effect) {
                    if (!is_hover) {
                        var delay = parseFloat(self.$context.find('#animation_effect_delay').val()),
                                repeat = parseInt(self.$context.find('#animation_effect_repeat').val());
                        el.css({'animation-delay': delay > 0 && !isNaN(delay) ? delay + 's' : '', 'animation-iteration-count': repeat > 0 && !isNaN(repeat) ? repeat : ''});
                    } else {
                        effect = 'hover-wow hover-animation-' + effect;
                    }
                    setTimeout(function () {
                        el.addClass(effect + ' animated');
                        if (is_hover) {
                            el.trigger('mouseover');
                        }
                    }, 1);
                }
            });
        };
        ThemifyLiveStyling.prototype.getRowAnchorClass = function (rowAnchor) {
            return rowAnchor.length > 0 ? 'tb_has_section tb_section-' + rowAnchor : '';
        };

        ThemifyLiveStyling.prototype.getStylingVal = function (stylingKey) {
            return this.currentStyleObj[stylingKey] !== undefined ? this.currentStyleObj[stylingKey] : '';
        };

        ThemifyLiveStyling.prototype.setStylingVal = function (stylingKey, val) {
            this.currentStyleObj[stylingKey] = val;
        };

        ThemifyLiveStyling.prototype.bindBackgroundMode = function (val, id) {

            var bgValues = {
                'repeat': 'repeat',
                'repeat-x': 'repeat-x',
                'repeat-y': 'repeat-y',
                'repeat-none': 'no-repeat',
                'no-repeat': 'no-repeat',
                'fullcover': 'cover',
                'best-fit-image': 'contain',
                'builder-parallax-scrolling': 'cover',
                'builder-zoom-scrolling': '100%',
                'builder-zooming': '100%'
            };
            if (bgValues[val] !== undefined) {
                var propCSS = {},
                        data = this.getValue(id),
                        item = topWindow.document.getElementById(data.origId);
                if (item !== null && item.value.trim() === '') {
                    val = null;
                    propCSS = {
                        'background-repeat': '',
                        'background-size': '',
                        'background-position': '',
                        'background-attachment': ''
                    };
                } else {
                    if (val.indexOf('repeat') !== -1) {
                        propCSS['background-repeat'] = bgValues[val];
                        propCSS['background-size'] = 'auto';
                    } else {
                        propCSS['background-size'] = bgValues[val];
                        propCSS['background-repeat'] = 'no-repeat';

                        if (bgValues[val] === 'best-fit-image' || bgValues[val] === 'builder-zooming') {
                            propCSS['background-position'] = 'center center';
                        } else if (bgValues[val] === 'builder-zoom-scrolling') {
                            propCSS['background-position'] = '50%';
                        }
                    }
                }
                this.$liveStyledElmt[0].classList.remove('builder-parallax-scrolling');
                this.$liveStyledElmt[0].classList.remove('builder-zooming');
                this.$liveStyledElmt[0].classList.remove('builder-zoom-scrolling');
                this.$liveStyledElmt[0].style['backgroundSize'] = this.$liveStyledElmt[0].style['backgroundPosition'] = '';
                if (this.type === 'module' && (val === 'builder-parallax-scrolling' || val === 'builder-zooming' || val === 'builder-zoom-scrolling' || val === 'best-fit-image')) {
                    return;
                }
                if (val === 'builder-parallax-scrolling') {
                    this.$liveStyledElmt[0].classList.add('builder-parallax-scrolling');
                } else if (val === 'builder-zooming') {
                    this.$liveStyledElmt[0].classList.add('builder-zooming');
                } else if (val === 'builder-zoom-scrolling') {
                    this.$liveStyledElmt[0].classList.add('builder-zoom-scrolling');
                }
                for (var key in propCSS) {
                    this.setLiveStyle(key, propCSS[key], data.selector);
                }
                if (val === 'builder-zoom-scrolling') {
                    ThemifyBuilderModuleJs.backgroundZoom(this.$liveStyledElmt);
                } else if (val === 'builder-zooming') {
                    ThemifyBuilderModuleJs.backgroundZooming(this.$liveStyledElmt);
                } else if (val === 'builder-parallax-scrolling') {
                    ThemifyBuilderModuleJs.backgroundScrolling(this.$liveStyledElmt);
                }
            }
        };

        ThemifyLiveStyling.prototype.bindBackgroundPosition = function (val, id) {
            if (val && val.length > 0) {
                var data = this.getValue(id);
                if (data) {
                    var v2 = val.split(',')
                    this.setLiveStyle(data.prop, v2[0] + '% ' + v2[1] + '%', data.selector);
                }
            }
        };

        ThemifyLiveStyling.prototype.bindBackgroundSlider = function (data) {
            if (this.type === 'module') {
                return;
            }
            var self = this,
                    images = self.$context.find('#' + data.id).val().trim();
            self.removeBgSlider();

            function callback(slider) {
                var $bgSlider = $(slider),
                        bgCover = self.getComponentBgOverlay();
                if (bgCover.length > 0) {
                    bgCover.after($bgSlider);
                } else {
                    self.$liveStyledElmt.prepend($bgSlider);
                }
                ThemifyBuilderModuleJs.backgroundSlider($bgSlider[0].parentNode);
            }
            if (images) {

                if (this.cahce === undefined) {
                    this.cahce = {};
                }


                var options = {
                    shortcode: encodeURIComponent(images),
                    mode: self.$context.find('#background_slider_mode').val(),
                    speed: self.$context.find('#background_slider_speed').val(),
                    size: self.$context.find('#background_slider_size').val()
                },
                        hkey = '';

                for (var i in options) {
                    hkey += Themify.hash(i + options[i]);
                }
                if (this.cahce[hkey] !== undefined) {
                    callback(this.cahce[hkey]);
                    return;
                }
                options['type'] = self.type;

                $.post(themifyBuilder.ajaxurl, {
                    nonce: themifyBuilder.tb_load_nonce,
                    action: 'tb_slider_live_styling',
                    tb_background_slider_data: options
                },
                        function (slider) {
                            if (slider.length < 10) {
                                return;
                            }
                            self.cahce[hkey] = slider;
                            callback(slider);
                        }
                );
            }
        };
        ThemifyLiveStyling.prototype.VideoOptions = function (item, val) {
            if (this.type === 'module') {
                return;
            }
            var video = this.$liveStyledElmt.find('.big-video-wrap').first(),
                    el = '',
                    is_checked = item.checked === true,
                    type = '';
            if (video[0] === undefined) {
                return;
            }
            if (video[0].classList.contains('themify_ytb_wrapper')) {
                el = this.$liveStyledElmt;
                type = 'ytb';
            } else if (video[0].classList.contains('themify-video-vmieo')) {
                el = $f(video.children('iframe')[0]);
                if (el) {
                    type = 'vimeo';
                }
            } else {
                el = this.$liveStyledElmt.data('plugin_ThemifyBgVideo');
                type = 'local';
            }

            if (val === 'mute') {
                if (is_checked) {
                    if (type === 'ytb') {
                        el.ThemifyYTBMute();
                    } else if (type === 'vimeo') {
                        el.api('setVolume', 0);
                    } else if (type === 'local') {
                        el.muted(true);
                    }
                    this.$liveStyledElmt.data('mutevideo', 'mute');
                } else {
                    if (type === 'ytb') {
                        el.ThemifyYTBUnmute();
                    } else if (type === 'vimeo') {
                        el.api('setVolume', 1);
                    } else if (type === 'local') {
                        el.muted(false);
                    }
                    this.$liveStyledElmt.data('mutevideo', '');
                }
            } else if (val === 'unloop') {
                if (is_checked) {
                    if (type === 'vimeo') {
                        el.api('setLoop', 0);
                    } else if (type === 'local') {
                        el.loop(false);
                    }
                    this.$liveStyledElmt.data('unloopvideo', '');
                } else {
                    if (type === 'vimeo') {
                        el.api('setLoop', 1);
                    } else if (type === 'local') {
                        el.loop(true);
                    }
                    this.$liveStyledElmt.data('unloopvideo', 'loop');

                }
            }
        };
        ThemifyLiveStyling.prototype.bindBackgroundTypeRadio = function (bgType) {
            var el = 'tb_uploader_input';
            if (this.type !== 'module') {
                if (bgType !== 'slider') {
                    if (this.styleTabId === 'n') {
                        this.removeBgSlider();
                    }
                } else {
                    el = 'tb_shortcode_input';
                }
                if (bgType !== 'video' && this.styleTabId === 'n') {
                    this.removeBgVideo();
                }
            }
            if (bgType !== 'gradient') {
                this.setLiveStyle('backgroundImage', 'none');
            } else {
                el = 'themify-gradient-type';
            }
            var group = this.styleTab.getElementsByClassName('tb_group_element_' + bgType)[0];
            Themify.triggerEvent(group.getElementsByClassName(el)[0], 'change');
            if (bgType === 'image' && this.type === 'module') {
                el = group.getElementsByClassName('minicolors-input')[0];
                if (el !== undefined) {
                    Themify.triggerEvent(el, 'themify_builder_color_picker_change', {val: el.value});
                }
            }
        };

        ThemifyLiveStyling.prototype.bindFontColorType = function (v, id, type) {
            if (type === 'radio') {
                var is_color = v.indexOf('_solid') !== -1,
                        el = is_color === true ? v.replace(/_solid$/ig, '') : v.replace(/_gradient$/ig, '-gradient-type');
                el = topWindow.document.getElementById(el);
                if (is_color === true) {
                    var v = api.Utils.getColor(el);
                    if (v === undefined || v === '') {
                        v = '';
                    }
                    Themify.triggerEvent(el, 'themify_builder_color_picker_change', {val: v});
                } else {
                    Themify.triggerEvent(el, 'change');
                }
                return;
            }
            var prop = type,
                    selector = this.getValue(id).selector;
            if (prop === 'color') {


                if (v === undefined || v === '') {
                    v = '';
                    this.setLiveStyle('WebkitBackgroundClip', '', selector);
                    this.setLiveStyle('backgroundClip', '', selector);
                    this.setLiveStyle('backgroundImage', '', selector);
                } else {
                    this.setLiveStyle('WebkitBackgroundClip', 'border-box', selector);
                    this.setLiveStyle('backgroundClip', 'border-box', selector);
                    this.setLiveStyle('backgroundImage', 'none', selector);
                }
            } else if (v !== '') {
                prop = 'backgroundImage';
                this.setLiveStyle('color', 'transparent', selector);
                this.setLiveStyle('WebkitBackgroundClip', 'text', selector);
                this.setLiveStyle('backgroundClip', 'text', selector);
            }
            if (v !== '' || prop === 'color')
                this.setLiveStyle(prop, v, selector);
        };

        ThemifyLiveStyling.prototype.shadow = function (el, id, prop) {
            var data = this.getValue(id);
            if (data) {
                var items = el.closest('.tb_seperate_items').getElementsByClassName('tb_shadow_field'),
                        inset = '',
                        allisEmpty = true,
                        val = '';
                for (var i = 0, len = items.length; i < len; ++i) {
                    if (items[i].classList.contains('tb-checkbox')) {
                        inset = items[i].checked ? 'inset ' : '';
                    } else {
                        var v = items[i].value.trim();
                        if (ThemifyConstructor.styles[items[i].id].type === 'color') {
                            v = api.Utils.getColor(items[i]);
                        } else {
                            if (v === '') {
                                v = 0;
                            } else {
                                allisEmpty = false;
                                v += items[i].closest('.tb_input').querySelector('#' + items[i].id + '_unit').value;
                            }

                        }
                        val += v + ' ';
                    }
                }
                val = allisEmpty === true ? '' : inset + val;
                this.setLiveStyle(data.prop, val, data.selector);
            }
        };
        ThemifyLiveStyling.prototype.filters = function (el, id) {
            var items = el.closest('.tb_filters_fields').getElementsByClassName('tb_filters_field'),
                    val = '',
                    data;
            for (var i = 0, len = items.length; i < len; ++i) {
                var v = items[i].value.trim();
                if ('' === v) {
                    continue;
                }
                data = this.getValue(items[i].id);
                v += items[i].closest('.tb_seperate_items').querySelector('#' + items[i].id + '_unit').textContent;
                v = 'hue' === data.prop ? 'hue-rotate(' + v + ')' : data.prop + '(' + v + ')';
                val += v + ' ';
            }
            data = this.getValue(id);
            this.setLiveStyle('filter', val, data.selector);
        };
        ThemifyLiveStyling.prototype.setData = function (id, prop, val) {
            var data = this.getValue(id);

            if (data) {
                if (prop === '') {
                    prop = data.prop;
                }
                this.setLiveStyle(prop, val, data.selector);
            }
        };

        ThemifyLiveStyling.prototype.bindEvents = function (el, data) {
            if (el.classList.contains('style_apply_all')) {
                return;
            }
            var self = this;
            function getTab(el) {
                if (self.currentField !== el.id || '' === self.currentField) {
                    self.currentField = el.type === 'radio' ? false : el.id;
                    self.isChanged = true;
                    self.styleTab = null;
                    self.styleTabId = 'n';
                    var tab = el.closest('.tb_tab');
                    if (tab === null) {
                        tab = el.closest('.tb_expanded_opttions');
                        if (tab === null) {
                            tab = topWindow.document.getElementById('tb_options_styling');
                        }
                    } else {
                        self.styleTabId = tab.id.split('_').pop();
                    }
                    self.styleTab = tab;
                } else {
                    self.isChanged = false;
                }
            }
            (function () {
                var event,
                        type = data['type'],
                        prop = data['prop'],
                        id = data['id'];
                if (type === 'color') {
                    event = 'themify_builder_color_picker_change';
                } else if (type === 'gradient') {
                    event = 'themify_builder_gradient_change';
                } else {
                    event = type === 'text' || type === 'range' ? 'keyup' : 'change';
                }
                el.addEventListener(event, function (e) {
                    var cl = this.classList,
                            val,
                            is_select = this.tagName === 'SELECT',
                            is_radio = !is_select && this.type === 'radio';
                    getTab(this);
                    api.hasChanged = true;
                    if (e.detail && e.detail.val) {
                        val = e.detail.val;
                    } else if (type === 'frame') {
                        val = this.id;
                    } else {
                        val = this.value;
                    }
                    val = val !== undefined && val !== 'undefined' ? val.trim() : '';
                    if ((type === 'color' && cl.contains('border_color')) || (is_select === true && cl.contains('border_style')) || (event === 'keyup' && (cl.contains('border_width') || cl.contains('tb_multi_field')))) {
                        self.bindMultiFields(this);
                        return;
                    } else if (prop === 'frame-custom' || type === 'frame' || cl.contains('tb_frame')) {
                        if (self.type !== 'module') {
                            self.addOrRemoveFrame(this);

                        }
                        return;
                    } else if (cl.contains('tb_shadow_field')) {
                        self.shadow(this, id);
                        return;
                    } else if (cl.contains('tb_filters_field')) {
                        self.filters(this, id);
                        return;
                    }
                    if (event === 'keyup') {
                        if (val !== '') {
                            if (prop === 'column-rule-width') {
                                val += 'px';
                                var bid = id.replace('_width', '_style'),
                                        border = topWindow.document.getElementById(bid);
                                if (border !== null) {
                                    self.setData(bid, '', border.value);
                                }
                            } else if (prop === 'column-gap') {
                                val += 'px';
                            } else {
                                var unit = topWindow.document.getElementById(id + '_unit');
                                if (unit !== null) {
                                    val += unit.value ? unit.value : 'px';
                                }
                            }
                        }
                        self.setData(id, '', val);
                        return;
                    }
                    if (data.isFontColor === true) {
                        self.bindFontColorType(val, id, type);
                        return;
                    }
                    if (is_select === true) {
                        if (prop === 'font-weight') {
                            // load the font variant
                            var font = this.getAttribute('data-selected');
                            if (font !== null && font !== '' && font !== 'default' && ThemifyConstructor.font_select.safe[font] === undefined) {
                                ThemifyConstructor.font_select.loadGoogleFonts(font + ':' + val);
                            }

                            // if the fontWeight has "italic" style, toggle the font_style option
                            var wrap = self.styleTab.getElementsByClassName('tb_multi_fonts')[0],
                                    el;
                            if (val.indexOf('italic') !== -1) {
                                val = parseInt(val.replace('italic', ''));
                                el = wrap.querySelector('[value="italic"]');
                            } else {
                                el = wrap.querySelector('[value="normal"]');
                            }
                            if (el.checked === false) {
                                el.parentNode.click();
                            }
                        } else if (type === 'font_select') {
                            if (val !== '' && val !== 'default' && ThemifyConstructor.font_select.safe[val] === undefined) {
                                var weight = this.closest('.tb_tab').getElementsByClassName('font-weight-select')[0],
                                        request;

                                request = val;
                                if (weight !== undefined) {
                                    request += ':' + weight.value;
                                } else {
                                    self.setLiveStyle('font-weight', '', data.selector);
                                }
                                ThemifyConstructor.font_select.loadGoogleFonts(request);
                            } else if (val === 'default') {
                                val = '';
                            }
                            if (val !== '') {
                                val = ThemifyStyles.parseFontName(val);
                            }
                        } else if (cl.contains('tb_unit')) {
                            Themify.triggerEvent(self.$context.find('#' + id.replace('_unit', ''))[0], 'keyup');
                            return;
                        } else if (prop === 'background-mode') {
                            self.bindBackgroundMode(val, id);
                            return;
                        } else if (prop === 'column-count' && val == 0) {
                            val = '';
                        } else if (cl.contains('tb_position_field')) {
                            var pos = ['top', 'right', 'bottom', 'left'],
                                    wrap = this.closest('.tb_input');
                            var getPosVal = function (id) {
                                var selector = '#' + id,
                                        is_auto = wrap.querySelector(selector + '_auto input').checked;
                                return true !== is_auto ? wrap.querySelector(selector).value.trim() + wrap.querySelector(selector + '_unit').value.trim() : 'auto';
                            };
                            for (var i = pos.length - 1; i > -1; --i) {
                                var posVal = 'absolute' === val || 'fixed' === val ? getPosVal(data.id + '_' + pos[i]) : '';
                                self.setLiveStyle(pos[i], posVal, data.selector);
                            }
                        } else if (prop === 'display') {
                            if ('none' === val) {
                                return false;
                            } else if ('inline-block' === val) {
                                self.setLiveStyle('width', 'auto', data.selector);
                            } else {
                                self.setLiveStyle('width', '100%', data.selector);
                            }
                        } else if (prop === 'vertical-align') {
                            if ('' !== val) {
                                var flexVal;
                                if ('top' === val) {
                                    flexVal = 'flex-start';
                                } else if ('middle' === val) {
                                    flexVal = 'center';
                                } else {
                                    flexVal = 'flex-end';
                                }
                                self.setLiveStyle('align-self', flexVal, data.selector);
                            }
                        }
                    } else if (type === 'gallery' && self.type !== 'module') {
                        self.bindBackgroundSlider(data);
                        return;
                    } else if (is_radio === true) {
                        id = this.closest('.tb_lb_option').id;
                        if (this.checked === false) {
                            val = '';
                        }
                        if (type === 'imageGradient' || data.is_background === true) {
                            self.bindBackgroundTypeRadio(val);
                            return;
                        } else if (data.is_overlay === true) {
                            if (self.type !== 'module') {
                                self.overlayType(val);
                            }
                            return;
                        }
                    } else if (type === 'color' || type === 'gradient') {
                        if (type === 'gradient') {
                            id = this.dataset['id'];
                        }

                        if (data.is_overlay === true) {
                            if (self.type !== 'module') {
                                self.addOrRemoveComponentOverlay(type, id, val);
                            }
                            return;
                        }
                        if (type === 'color') {
                            var image = null;
                            //for modules
                            if (self.type === 'module' && data.colorId !== undefined && data.origId !== undefined) {
                                image = topWindow.document.getElementById(data.origId);
                                if (image !== null && image.closest('.tb_input').querySelector('input:checked').value !== 'image') {
                                    image = null;
                                }
                            }//for rows/column
                            else if (self.type !== 'module' && self.styleTabId === 'h') {
                                image = self.styleTab.getElementsByClassName('tb_uploader_input')[0];
                            }
                            if (image && image.value.trim() === '') {
                                self.setLiveStyle('background-image', (val !== '' ? 'none' : ''), data.selector);
                            }
                        }

                    } else if (type === 'image' || type === 'video') {
                        if (type === 'video') {
                            if (val.length > 0) {
                                if (self.type !== 'module') {
                                    self.$liveStyledElmt.data('fullwidthvideo', val).attr('data-fullwidthvideo', val);
                                    if (_.isEmpty(self.$liveStyledElmt.data('mutevideo')) && self.$context.find('#background_video_options_mute').is(':checked')) {
                                        self.$liveStyledElmt.data('mutevideo', 'mute');
                                    }
                                    ThemifyBuilderModuleJs.fullwidthVideo(self.$liveStyledElmt);
                                }
                            } else {
                                self.removeBgVideo();
                            }
                            return false;
                        } else {
                            if (val) {
                                val = 'url(' + val + ')';
                            } else {
                                val = '';
                                if (data.colorId !== undefined && self.styleTabId === 'h') {
                                    var color = topWindow.document.getElementById(data.colorId);
                                    if (color !== null && color.value.trim() !== '') {
                                        val = 'none';
                                    }
                                }
                            }
                            var group = self.styleTab.getElementsByClassName('tb_image_options');
                            for (var i = group.length - 1; i > -1; --i) {
                                var opt = group[i].getElementsByClassName('tb_lb_option');
                                for (var j = opt.length - 1; j > -1; --j) {
                                    Themify.triggerEvent(opt[j], 'change');

                                }
                            }
                            group = null;
                        }
                    } else if (prop === 'background-position') {
                        self.bindBackgroundPosition(val, id);
                        return;
                    } else if (type === 'checkbox') {
                        if (this.closest('#background_video_options') !== null) {
                            self.VideoOptions(this, val);
                            return;
                        } else if (('height' === prop && id.indexOf('_auto_height') !== -1) || ('width' === prop && id.indexOf('_auto_width') !== -1)) {
                            var mainID = 'height' === prop ? data.heightID : data.widthID;
                            if (this.checked) {
                                self.setData(mainID, prop, 'auto');
                            } else {
                                var mainValue = self.styleTab.querySelector('#' + mainID).value.trim();
                                if (mainValue !== '') {
                                    self.setData(mainID, prop, mainValue + $(self.styleTab).find('#' + mainID + '_unit').val());
                                } else {
                                    self.setData(mainID, prop, '');
                                }
                            }
                            return;
                        } else if (true === data.is_position) {
                            var selector = '#' + data.posId,
                                    wrap = this.closest('.tb_input');
                            if (this.checked) {
                                val = 'auto';
                            } else {
                                val = wrap.querySelector(selector).value.trim();
                                val = '' !== val && !isNaN(val) ? val + wrap.querySelector(selector + '_unit').value : '';
                            }
                            self.setLiveStyle(data.prop, val, data.selector);
                            return;
                        }
                    }
                    self.setData(id, '', val);
                }, {passive: true});
            })();
        };

        ThemifyLiveStyling.prototype.getValue = function (id) {
            return this.module_rules[id] !== undefined ? this.module_rules[id] : false;

        };

        ThemifyLiveStyling.prototype.bindTabsSwitch = function (off) {
            var self = this;
            if (off === true) {
                Themify.body.off('themify_builder_tabsactive.hoverTabs');
                return;
            }

            Themify.body.on('themify_builder_tabsactive.hoverTabs', function (e, id, container) {
                if (ThemifyConstructor.clicked === 'styling') {
                    var tab_id = id.split('_').pop(),
                            hover_items;
                    if (tab_id !== 'h') {
                        self.$liveStyledElmt[0].classList.remove('tb_visual_hover');
                        hover_items = self.$liveStyledElmt[0].getElementsByClassName('tb_visual_hover');
                        for (var i = hover_items.length - 1; i > -1; --i) {
                            hover_items[i].classList.remove('tb_visual_hover');
                        }
                    } else {
                        if (self.type !== 'module') {
                            var radio = container.previousElementSibling.getElementsByClassName('background_type')[0];
                            if (radio !== undefined) {
                                radio = radio.querySelector('input:checked').value;
                                if (radio === 'image' || radio === 'gradient') {
                                    container.classList.remove('tb_disable_hover');
                                } else {
                                    container.classList.add('tb_disable_hover');
                                }
                            }
                        }
                        setTimeout(function () {
                            hover_items = container.getElementsByClassName('tb_lb_option');
                            var selectors = [];
                            for (var i = hover_items.length - 1; i > -1; --i) {
                                var elId = hover_items[i].id,
                                        is_gradient = hover_items[i].classList.contains('themify-gradient');
                                if (is_gradient === true) {
                                    elId = hover_items[i].dataset['id'];
                                }
                                if (self.module_rules[elId] !== undefined && (is_gradient || hover_items[i].offsetParent !== null)) {
                                    if (self.module_rules[elId]['is_overlay'] !== undefined) {
                                        self.$liveStyledElmt[0].classList.add('tb_visual_hover');
                                    }
                                    var select = Array.isArray(self.module_rules[elId].selector) ? self.module_rules[elId].selector : [self.module_rules[elId].selector];
                                    for (var j = select.length - 1; j > -1; --j) {
                                        var k = select[j].split(':hover')[0];
                                        selectors[k] = 1;
                                    }
                                }
                            }
                            hover_items = null;
                            selectors = Object.keys(selectors);
                            if (selectors.length > 0) {
                                for (var i = selectors.length - 1; i > -1; --i) {
                                    hover_items = document.querySelectorAll(self.prefix + selectors[i]);
                                    for (var j = hover_items.length - 1; j > -1; --j) {
                                        hover_items[j].classList.add('tb_visual_hover');
                                    }
                                }
                            }

                        }, 10);

                    }
                }
            });
        };


        /**
         * Returns component's background cover element wrapped in jQuery.
         */
        ThemifyLiveStyling.prototype.getComponentBgOverlay = function () {
            return this.$liveStyledElmt.children('.builder_row_cover');
        };

        /**
         * Returns component's background slider element wrapped in jQuery.
         */
        ThemifyLiveStyling.prototype.getComponentBgSlider = function () {
            var type = this.type === 'colum' && api.activeModel.get('component_name') === 'sub-column' ? 'sub-col' : (this.type === 'colum' ? 'col' : this.type);
            return this.$liveStyledElmt.children('.' + type + '-slider');
        };

        /**
         * Removes background slider if there is any in $component.
         */
        ThemifyLiveStyling.prototype.removeBgSlider = function () {
            this.getComponentBgSlider().add(this.$liveStyledElmt.children('.tb_backstretch')).remove();
            this.$liveStyledElmt.css({
                'position': '',
                'background': '',
                'z-index': ''
            });
        };




        /**
         * Removes background video if there is any in $component.
         */
        ThemifyLiveStyling.prototype.removeBgVideo = function () {
            this.$liveStyledElmt.removeAttr('data-fullwidthvideo').data('fullwidthvideo', '').children('.big-video-wrap').remove();
        };

        return ThemifyLiveStyling;
    })(jQuery);



    function verticalResponsiveBars() {
        var items = topWindow.document.getElementsByClassName('tb_middle_bar'),
                resizeBarMousedownHandler = function (e) {
                    var start_x = e.clientX,
                            bar = this.id === 'tb_right_bar' ? 'right' : 'left',
                            breakpoints = tbLocalScript.breakpoints,
                            max_width = api.toolbar.$el.width(),
                            start_with = api.iframe.css('transition', 'none').width(),
                            tooltip = topWindow.document.getElementsByClassName('tb_vertical_change_tooltip')[0],
                            vertical_bars = topWindow.document.getElementsByClassName('tb_vertical_bars')[0],
                            cover = document.createElement('div');
                    cover.className = 'tb_mousemove_cover';
                    if (tooltip !== undefined) {
                        tooltip.parentNode.removeChild(tooltip);
                    }
                    tooltip = document.createElement('div');
                    tooltip.className = 'tb_vertical_change_tooltip';
                    this.appendChild(tooltip);
                    vertical_bars.appendChild(cover);
                    vertical_bars.className += ' tb_resizing_start';
                    api.iframe[0].classList.add('tb_resizing_start');
                    var $window = $(window),
                            _move = function (e) {


                                var diff = e.clientX - start_x;
                                diff *= 2;
                                if (bar === 'left') {
                                    diff = -diff;
                                }
                                var min_width = 320,
                                        breakpoint = api.activeBreakPoint,
                                        w = (start_with + diff) < min_width ? min_width : (start_with + diff),
                                        breakpoint;

                                if (w <= breakpoints.mobile)
                                    breakpoint = 'mobile';
                                else if (w <= breakpoints.tablet[1])
                                    breakpoint = 'tablet';
                                else if (w <= breakpoints.tablet_landscape[1])
                                    breakpoint = 'tablet_landscape';
                                else {
                                    breakpoint = 'desktop';
                                    if (w > (max_width - 17)) {
                                        w = max_width;
                                    }
                                }
                                tooltip.textContent = w + 'px';
                                api.iframe.css('width', w);
                                if (api.activeBreakPoint !== breakpoint) {
                                    ThemifyConstructor.lightboxSwitch(breakpoint);
                                }
                            };

                    cover.addEventListener('mousemove', _move, {passive: true});
                    cover.addEventListener('mouseup', function _up(e) {

                        cover.removeEventListener('mousemove', _move, {passive: true});
                        cover.removeEventListener('mouseup', _up, {once: true, passive: true});

                        cover.parentNode.removeChild(cover);
                        tooltip.parentNode.removeChild(tooltip);

                        api.iframe.css('transition', '');
                        vertical_bars.classList.remove('tb_resizing_start');
                        api.iframe[0].classList.remove('tb_resizing_start');


                        api.Utils._onResize(true);

                    }, {once: true, passive: true});
                };

        for (var i = items.length - 1; i > -1; --i) {
            items[i].addEventListener('mousedown', resizeBarMousedownHandler, {passive: true});
        }
        items = null;
    }

    api.EdgeDrag = {
        modules: null,
        oneTag: ['AREA', 'EMBED', 'IMG', 'INPUT'],
        disableDrag: null,
        liveinstance: null,
        _onDrag: null,
        init() {
            if (null === this._onDrag) {
                this._onDrag = api.EdgeDrag.drag.bind(this);
            }
            if (!localStorage.getItem('tb_disable_padding_dragging')) {
                api.Instances.Builder[api.builderIndex].el.addEventListener('mousedown', this._onDrag);
                Themify.body[0].classList.remove('tb_disable_padding_dragging');
            } else {
                Themify.body[0].classList.add('tb_disable_padding_dragging');
                api.Instances.Builder[api.builderIndex].el.removeEventListener('mousedown', this._onDrag);
                api.toolbar.el.getElementsByClassName('tb_padding_dragging_mode')[0].checked = false;

            }
        },
        addEdgesOptions(item) {
            var el = item.closest('.tb_dragger');
            if (el.getElementsByClassName('tb_dragger_lightbox')[0] === undefined) {
                var type = el.classList.contains('tb_dragger_margin') ? 'margin' : 'padding',
                        units = ['px', 'em', '%'],
                        applyTypes = ['opposite', 'all'],
                        items = el.parentNode.children,
                        cid = $(el).closest('[data-cid]')[0].getAttribute('data-cid'),
                        realId = null,
                        isAllChecked = null,
                        hasValue = null,
                        self = this,
                        model = api.Models.Registry.lookup(cid),
                        component = model.get('elType'),
                        style = component === 'module' ? model.get('mod_settings') : model.get('styling'),
                        hide_apply_all = type === 'margin' && (component === 'column' || component === 'row');
                el = null;
                for (var i = items.length - 1; i > -1; --i) {
                    if (items[i].classList.contains('tb_dragger_' + type)) {
                        var wrap = document.createElement('div'),
                                apply = document.createElement('ul'),
                                ul = document.createElement('ul'),
                                opt = items[i].getElementsByClassName('tb_dragger_options')[0],
                                id = items[i].getAttribute('data-id'),
                                dir = items[i].classList.contains('tb_dragger_top') || items[i].classList.contains('tb_dragger_bottom') ? 's' : 'e',
                                u = items[i].getAttribute('data-u');
                        wrap.className = 'tb_dragger_lightbox';
                        ul.className = 'tb_dragger_units';
                        apply.className = 'tb_dragger_types';
                        if (hide_apply_all === true) {
                            apply.className += ' tb_dragger_hide_apply_all';
                        }
                        for (var j = 0, len = units.length; j < len; ++j) {
                            var li = document.createElement('li');
                            li.textContent = units[j];
                            if (units[j] === u) {
                                li.className = 'current';
                            }
                            ul.appendChild(li);
                        }
                        if (realId === null) {
                            realId = id.replace(/_left|_right|_bottom|_top$/ig, '');
                            isAllChecked = this.getCurrentStyling(style, 'checkbox_' + realId + '_apply_all', model);
                        }
                        if (hasValue === null && items[i].getAttribute('data-v')) {
                            hasValue = 1;
                        }
                        for (j = 0, len = applyTypes.length; j < len; ++j) {
                            var li = document.createElement('li'),
                                    span = document.createElement('span'),
                                    isChecked = false;
                            li.className = applyTypes[j] === 'opposite' ? 'tb_apply_opposite' : 'tb_apply_all';
                            li.className += ' tb_apply';
                            if (applyTypes[j] === 'opposite') {
                                if (!isAllChecked) {
                                    var checkId = dir === 's' ? realId + '_opp_top' : realId + '_opp_left';
                                    isChecked = this.getCurrentStyling(style, checkId, model);
                                }
                            } else {
                                isChecked = isAllChecked;
                            }
                            if (isChecked) {
                                li.className += ' current';
                            }
                            li.appendChild(span);
                            apply.appendChild(li);
                        }
                        wrap.appendChild(ul);
                        wrap.appendChild(apply);
                        opt.appendChild(wrap);
                        var focus = function (e) {
                            e.preventDefault();
                            e.stopPropagation();
                            if (api.ActionBar.isHoverMode !== true) {
                                api.ActionBar.el.classList.remove('tb_show_toolbar');
                            } else {
                                var actionBar = Themify.body[0].getElementsByClassName('tb_clicked');
                                if (actionBar.length) {
                                    actionBar[0].style.display = 'none';
                                }
                            }
                            var dragger = this.closest('.tb_dragger');
                            dragger.classList.add('tb_dragger_focus');
                            document.body.classList.add('tb_dragger_options_open');
                            var blur = function (e) {
                                if (api.ActionBar.isHoverMode !== true) {
                                    api.ActionBar.el.classList.add('tb_show_toolbar');
                                } else {
                                    var actionBar = Themify.body[0].getElementsByClassName('tb_clicked');
                                    if (actionBar.length) {
                                        actionBar[0].style.display = 'block';
                                    }
                                }
                                if (e.type === 'mouseout' || (!e.target.classList.contains('tb_dragger_lightbox') && !e.target.parentNode.classList.contains('tb_dragger_lightbox'))) {
                                    e.stopPropagation();
                                    e.preventDefault();
                                    document.removeEventListener('click', blur);
                                    topWindow.document.removeEventListener('click', blur);
                                    dragger.removeEventListener('mouseleave', blur, {once: true});
                                    if (dragger.classList.contains('tb_dragger_padding') && dragger.classList.contains('tb_dragger_top')) {
                                        self.setModulePosition(dragger);
                                    }
                                    dragger.classList.remove('tb_dragger_focus');
                                    document.body.classList.remove('tb_dragger_options_open');
                                    dragger = null;
                                }
                            };
                            dragger.addEventListener('mouseleave', blur, {once: true});
                            document.addEventListener('click', blur);
                            topWindow.document.addEventListener('click', blur);
                        };
                        opt.getElementsByClassName('tb_dragger_arrow')[0].addEventListener('click', focus);
                    }
                }
                if (hasValue === null && isAllChecked) {
                    for (var i = items.length - 1; i > -1; --i) {
                        if (items[i].classList.contains('tb_dragger_' + type)) {
                            items[i].getElementsByClassName('tb_apply_all')[0].classList.remove('current');
                        }
                    }
                    this.setData(model, 'checkbox_' + realId + '_apply_all', false);
                }
            }
        },
        clearEdges() {
            var selected = api.Instances.Builder[0].el.getElementsByClassName('tb_dragger');
            for (var i = selected.length - 1; i > -1; --i) {
                selected[i].parentNode.removeChild(selected[i]);
            }
        },
        addGutters(slug, el) {

        },
        getTabId(styling, id, label) {
            for (var i in styling) {
                if (styling[i]['options'] !== undefined) {
                    for (var j = styling[i]['options'].length - 1; j > -1; --j) {
                        if (styling[i]['options'][j]['label'] === label && styling[i]['options'][j]['type'] === 'expand') {
                            var tabOption = styling[i]['options'][j]['options'];
                            if (tabOption !== undefined) {
                                for (var k = tabOption.length - 1; k > -1; --k) {
                                    if (tabOption[k]['options'] !== undefined && tabOption[k]['options']['n'] !== undefined) {
                                        var paddingOptions = tabOption[k]['options']['n']['options'];
                                        for (var p = paddingOptions.length - 1; p > -1; --p) {
                                            if (paddingOptions[p].id === id) {
                                                return i;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
            return null;
        },
        addEdges(slug, model, el, base, notClear) {
            if (notClear !== true) {
                this.clearEdges();
            }
            if (slug === 'divider') {
                return;
            }
            var styling = slug === 'row' || slug === 'column' || slug === 'subrow' ? model.get('styling') : model.get('mod_settings'),
                    types = ['padding', 'margin'],
                    edge = ['top', 'left', 'bottom', 'right'],
                    len = edge.length,
                    oneTagLen = this.oneTag.length,
                    items = {};
            for (var i = types.length - 1; i > -1; --i) {
                if (this.modules[slug] !== undefined && this.modules[slug][types[i]] !== undefined) {
                    for (var j in this.modules[slug][types[i]]) {
                        items[j] = {'s': this.modules[slug][types[i]][j], 't': types[i]};
                    }
                } else {
                    items[types[i]] = {'s': '', 't': types[i]};
                }
            }
            for (var id in items) {
                var f = document.createDocumentFragment(),
                        type = items[id].t,
                        realId = id.replace('_' + edge[i], ''),
                        v,
                        u,
                        isAllChecked = this.getCurrentStyling(styling, 'checkbox_' + realId + '_apply_all', model);
                if (!isAllChecked) {
                    isAllChecked = false;
                } else {
                    v = this.getCurrentStyling(styling, realId + '_top', model),
                            u = this.getCurrentStyling(styling, realId + '_top_unit', model) || 'px';
                    if (v === undefined || v === null) {
                        v = '';
                    }
                }
                for (var i = len - 1; i > -1; --i) {
                    if (type === 'margin' && (slug === 'column' || slug === 'row') && (edge[i] === 'right' || edge[i] === 'left')) {
                        continue;
                    }
                    var ed = document.createElement('div'),
                            edgeOptions = document.createElement('div'),
                            unit = document.createElement('span'),
                            arrow = document.createElement('span'),
                            prop = type + '-' + edge[i],
                            propId = type === 'margin' && (slug === 'column' || slug === 'row') ? prop : id + '_' + edge[i];

                    if (isAllChecked === false) {
                        v = this.getCurrentStyling(styling, propId, model),
                                u = this.getCurrentStyling(styling, propId + '_unit', model) || 'px';
                        if (v === undefined || v === null) {
                            v = '';
                        }
                    }
                    unit.className = 'tb_dragger_value';
                    arrow.className = 'tb_dragger_arrow';
                    edgeOptions.className = 'tb_dragger_options';
                    ed.setAttribute('data-v', v);
                    ed.setAttribute('data-u', u);
                    ed.setAttribute('data-id', propId);
                    ed.setAttribute('data-prop', prop);
                    if (v !== '') {
                        unit.textContent = v + u;
                    }
                    ed.className = 'tb_dragger tb_disable_sorting tb_dragger_' + edge[i] + ' tb_dragger_' + type;
                    if (u !== '%') {
                        this.setValueByType(ed);
                    }
                    edgeOptions.appendChild(unit);
                    edgeOptions.appendChild(arrow);
                    ed.appendChild(edgeOptions);
                    f.appendChild(ed);
                }
                var item = items[id].s === '' ? [el] : el.querySelectorAll(items[id].s);
                for (var i = item.length - 1; i > -1; --i) {
                    var tagName = item[i].tagName,
                            w = null,
                            foundItem = item[i];
                    if (tagName === 'DIV' || tagName === 'SPAN' || tagName === 'A') {
                        foundItem.classList.add('tb_has_edge');
                        foundItem.appendChild(f);
                    } else {
                        var found = null;
                        for (var j = oneTagLen - 1; j > -1; --j) {
                            if (this.oneTag[j] === tagName) {
                                foundItem = item[i].parentNode;
                                foundItem.classList.add('tb_has_edge');
                                foundItem.appendChild(f);
                                found = true;
                                w = item[i].offsetWidth;
                                break;
                            }
                        }
                        if (found === null) {
                            foundItem.classList.add('tb_has_edge');
                            foundItem.appendChild(f);
                        }
                    }

                    var edges = foundItem.children;
                    for (var j = edges.length - 1; j > -1; --j) {
                        if (edges[j].getAttribute('data-u') === '%') {
                            this.setValueByType(edges[j]);
                        }
                        if (w !== null && (edges[j].classList.contains('tb_dragger_top') || edges[j].classList.contains('tb_dragger_bottom'))) {
                            edges[j].style['width'] = w + 'px';
                        }
                    }
                }
            }
            styling = null;
            if (api.ActionBar.isHoverMode === true) {
                if (slug !== 'row') {
                    var next = null;
                    if (slug === 'column') {
                        if (base !== 'module') {
                            next = el.classList.contains('sub_column') ? el.closest('.module_subrow') : el.closest('.module_row');
                        }
                    } else if (slug === 'subrow' || base === 'module' || el.classList.contains('tb_module_front')) {
                        next = el.closest('.module_column');
                    } else {
                        next = el.closest('.tb_module_front');
                    }
                    if (next !== null) {
                        if (base === undefined) {
                            base = slug !== 'row' && slug !== 'column' && slug !== 'subrow' ? 'module' : null;
                        }
                        var m = api.Models.Registry.lookup(next.getAttribute('data-cid')),
                                nextType = m.get('elType');
                        if (nextType === 'module') {
                            nextType = m.get('mod_name');
                        }
                        this.addEdges(nextType, m, next, base, true);
                    }
                }
            }
        },
        optionsClick(e) {
            api.ActionBar.disable = true;
            e.preventDefault();
            e.stopPropagation();
            this.addEdgesOptions(e.target.closest('.tb_dragger_options'));
            var target = e.target.nodeName === 'LI' ? e.target : e.target.parentNode;
            if (target.nodeName === 'LI') {
                if (!target.classList.contains('current') && target.parentNode.classList.contains('tb_dragger_units')) {
                    this.changeUnit(target);
                } else if (target.parentNode.classList.contains('tb_dragger_types')) {
                    this.changeApply(target);
                }
            }
            api.ActionBar.disable = null;
        },
        changeUnit(el) {
            var lightbox = el.closest('.tb_dragger_lightbox'),
                    edge = lightbox.closest('.tb_dragger'),
                    type = edge.classList.contains('tb_dragger_padding') ? 'padding' : 'margin',
                    dir = edge.classList.contains('tb_dragger_top') || edge.classList.contains('tb_dragger_bottom') ? 's' : 'e',
                    apply = edge.getElementsByClassName('tb_dragger_types')[0].getElementsByClassName('current')[0],
                    u = el.textContent,
                    baseEl = edge.parentNode,
                    cid = baseEl.getAttribute('data-cid'),
                    items = baseEl.children;
            apply = apply === undefined ? false : (apply.classList.contains('tb_apply_all') ? 'all' : 'opposite');
            if (!cid) {
                cid = $(baseEl).closest('[data-cid]')[0].getAttribute('data-cid');
            }
            var model = api.Models.Registry.lookup(cid),
                    elType = model.get('elType');
            if (elType === 'module') {
                elType = model.get('mod_name');
            }
            var selector = this.getSelector(elType, type, edge.getAttribute('data-id').replace(/_left|_right|_bottom|_top$/ig, ''));
            document.body.classList.add('tb_dragger_drag');
            edge.classList.add('tb_dragger_dragged');
            for (var i = items.length - 1; i > -1; --i) {
                if (items[i].classList.contains('tb_dragger_' + type)) {
                    if (apply === 'opposite') {
                        if (!((dir === 's' && (items[i].classList.contains('tb_dragger_top') || items[i].classList.contains('tb_dragger_bottom'))) || ((dir === 'e' && (items[i].classList.contains('tb_dragger_left') || items[i].classList.contains('tb_dragger_right')))))) {
                            continue;
                        }
                    } else if (apply !== 'all' && items[i] !== edge) {
                        continue;
                    }
                    var v = items[i].getAttribute('data-v'),
                            res = v !== '' ? this.convert(type, items[i], items[i].getAttribute('data-u'), u, v) : '',
                            units = items[i].getElementsByClassName('tb_dragger_units')[0].children;
                    items[i].setAttribute('data-v', res);
                    items[i].setAttribute('data-u', u);
                    this.setLivePreview(model, items[i].getAttribute('data-prop'), res + u, selector);
                    this.setData(model, items[i].getAttribute('data-id'), res, u, items[i].getAttribute('data-prop'));
                    this.setValueByType(items[i]);
                    items[i].getElementsByClassName('tb_dragger_value')[0].textContent = res === '' ? '' : (res + u);
                    for (var j = units.length - 1; j > -1; --j) {
                        if (units[j].textContent === u) {
                            units[j].classList.add('current');
                        } else {
                            units[j].classList.remove('current');
                        }
                    }
                }
            }
            setTimeout(function () {
                for (var i = items.length - 1; i > -1; --i) {
                    items[i].classList.remove('tb_dragger_dragged');
                }
                document.body.classList.remove('tb_dragger_drag');
            }, 500);
        },
        changeApply(el) {
            var select = el.classList.contains('tb_apply_all') ? 'all' : 'opposite',
                    remove = el.classList.contains('current'),
                    edge = el.closest('.tb_dragger'),
                    isFromAll = remove === false ? edge.getElementsByClassName('tb_apply_all')[0].classList.contains('current') : null,
                    base = edge.parentNode,
                    items = base.children,
                    realId = edge.getAttribute('data-id').replace(/_left|_right|_bottom|_top$/ig, ''),
                    baseV = edge.getAttribute('data-v'),
                    baseU = edge.getAttribute('data-u'),
                    type = edge.classList.contains('tb_dragger_padding') ? 'padding' : 'margin',
                    dir = edge.classList.contains('tb_dragger_top') || edge.classList.contains('tb_dragger_bottom') ? 's' : 'e',
                    before = Common.clone(base),
                    cid = base.getAttribute('data-cid');
            if (!cid) {
                cid = $(base).closest('[data-cid]')[0].getAttribute('data-cid');
            }
            var model = api.Models.Registry.lookup(cid),
                    before_settings = $.extend(true, {}, model.get(model.get('elType') === 'module' ? 'mod_settings' : 'styling'));
            if (select === 'all') {
                this.setData(model, 'checkbox_' + realId + '_apply_all', remove === false ? '1' : false);
                if (remove === false) {
                    this.setData(model, realId + '_opp_left', false);
                    this.setData(model, realId + '_opp_top', false);
                }
            } else {
                this.setData(model, 'checkbox_' + realId + '_apply_all', false);
                this.setData(model, (dir === 's' ? realId + '_opp_top' : realId + '_opp_left'), remove === false ? '1' : false);
            }
            for (var i = items.length - 1; i > -1; --i) {
                if (items[i].classList.contains('tb_dragger_' + type)) {
                    var apply = items[i].getElementsByClassName('tb_dragger_lightbox')[0];
                    apply.parentNode.removeChild(apply);
                    this.addEdgesOptions(items[i]);
                    if (remove === true) {
                        if (!baseU) {
                            baseU = 'px';
                        }
                        if (baseV === null || baseV === undefined) {
                            baseV = '';
                        }
                    }
                    if (select === 'all' || isFromAll === true) {
                        items[i].setAttribute('data-v', baseV);
                        items[i].setAttribute('data-u', baseU);
                    }
                    if (select !== 'all') {
                        if ((dir === 's' && (items[i].classList.contains('tb_dragger_top') || items[i].classList.contains('tb_dragger_bottom'))) || ((dir === 'e' && (items[i].classList.contains('tb_dragger_left') || items[i].classList.contains('tb_dragger_right'))))) {

                            items[i].setAttribute('data-v', baseV);
                            items[i].setAttribute('data-u', baseU);
                        } else {
                            continue;
                        }
                    }

                    var units = items[i].getElementsByClassName('tb_dragger_units')[0].children,
                            found;
                    for (var j = units.length - 1; j > -1; --j) {
                        if (units[j].textContent === baseU) {
                            units[j].classList.add('current');
                            found = units[j];
                        } else {
                            units[j].classList.remove('current');
                        }
                    }
                    units = null;
                    this.changeUnit(found);
                }
            }
            this.onChange();
            if (api.activeModel === null || api.activeModel.cid !== cid) {
                this.addUndo(before, before_settings);
                before_settings = null;
            }
        },
        setValueByType(el) {
            var prop = el.getAttribute('data-prop'),
                    type = el.classList.contains('tb_dragger_margin') ? 'margin' : 'padding',
                    v = el.getAttribute('data-v'),
                    u = el.getAttribute('data-u');

            if (u === '%') {
                v = this.getRealPercent(el, v);
                u = 'px';
            }
            if (type === 'padding') {
                el.style[prop] = v === '' ? '' : (v + u);
            } else {
                if (v === '') {
                    el.style['height'] = el.style['width'] = el.style[prop] = '';
                } else {
                    var p = el.classList.contains('tb_dragger_top') || el.classList.contains('tb_dragger_bottom') ? 'height' : 'width';
                    el.style[p] = (v > 0 ? v : (-v)) + u;
                    el.style[prop] = (-v) + u;
                }
            }
        },
        getRealPercent(el, v) {
            return parseFloat((v * el.closest('.tb_has_edge').parentNode.offsetWidth) / 100);
        },
        convert(type, el, prevU, u, v) {
            if (v == 0) {
                return 0;
            }
            if (prevU === u) {
                return v;
            }
            var res,
                    p = el.closest('.tb_has_edge');
            var emSize = u === 'em' || prevU === 'em' ? parseFloat(window.getComputedStyle(p).fontSize) : null,
                    pWidth = u === '%' || prevU === '%' ? p.parentNode.offsetWidth : null;
            if (prevU === 'px') {
                if (u === 'em') {
                    res = +(parseFloat(v / emSize)).toFixed(2);
                } else if (u === '%') {
                    res = parseInt((v * 100) / pWidth);
                }
            } else if (prevU === '%') {
                res = parseFloat((v * pWidth) / 100);
                res = u === 'em' ? (+(parseFloat(res / emSize)).toFixed(2)) : parseInt(res);
            } else {
                res = parseFloat(v * emSize);
                if (u === '%') {
                    res = parseFloat((res * 100) / pWidth);
                }
                res = parseInt(res);
            }
            return res;
        },
        getCurrentStyling(styling, id, model) {
            var v = null;
            if (api.activeModel !== null && api.activeModel.cid === model.cid) {
                var field = Common.Lightbox.$lightbox[0].querySelector('#' + id);
                if (field !== null) {
                    if (field.classList.contains('themify-checkbox')) {
                        field = field.getElementsByClassName('tb-checkbox')[0];
                        if (field !== undefined) {
                            v = field.checked === true ? field.value : false;
                        }
                    } else {
                        v = field.value;
                    }
                }
            }
            if (v === null) {
                var oldModel = api.activeModel,
                        oldValues = ThemifyConstructor.values,
                        oldClicked = ThemifyConstructor.clicked;

                api.activeModel = model;
                ThemifyConstructor.clicked = 'styling';
                ThemifyConstructor.values = styling;

                v = ThemifyConstructor.getStyleVal(id);

                api.activeModel = oldModel;
                ThemifyConstructor.clicked = oldClicked;
                ThemifyConstructor.values = oldValues;
            }
            return v;
        },
        setData(model, id, v, u, prop) {
            var k = model.get('elType') === 'module' ? 'mod_settings' : 'styling',
                    st = $.extend(true, {}, model.get(k)),
                    data = {};
            if (!st) {
                st = {};
            }
            if (api.activeModel !== null && model.cid === api.activeModel.cid) {
                var field = Common.Lightbox.$lightbox[0].querySelector('#' + id);
                if (prop !== undefined) {
                    if (api.liveStylingInstance.tempData[api.activeBreakPoint] === undefined) {
                        api.liveStylingInstance.tempData[api.activeBreakPoint] = {};
                    }
                    prop = api.liveStylingInstance.renameProp(prop);
                    var tmp = api.liveStylingInstance.tempData[api.activeBreakPoint];
                    for (var i in tmp) {
                        for (var j in tmp[i]) {
                            if (j === prop) {
                                api.liveStylingInstance.tempData[api.activeBreakPoint][i][j] = v + u;
                                break;
                            }
                        }
                    }
                    tmp = null;
                }
                ThemifyConstructor.values[id] = v;
                ThemifyConstructor.values[id + '_unit'] = u;
                if (field !== null) {
                    api.hasChanged = true;
                    if (field.classList.contains('themify-checkbox')) {
                        field = field.getElementsByClassName('tb-checkbox')[0];
                        if (field !== undefined) {
                            field.checked = v ? true : false;
                            Themify.triggerEvent(field, 'change');
                        }
                    } else {
                        field.value = v;
                        field = Common.Lightbox.$lightbox[0].querySelector('#' + id + '_unit');
                        if (field !== null) {
                            field.value = u;
                        }
                    }

                    return;
                }
            }
            if (api.activeBreakPoint !== 'desktop') {
                if (st['breakpoint_' + api.activeBreakPoint] === undefined) {
                    st['breakpoint_' + api.activeBreakPoint] = {};
                }
                st['breakpoint_' + api.activeBreakPoint][id] = v;
                if (u) {
                    st['breakpoint_' + api.activeBreakPoint][id + '_unit'] = u;
                }
            } else {
                st[id] = v;
                if (u) {
                    st[id + '_unit'] = u;
                }
            }
            data[k] = st;
            model.set(data, {silent: true});
            data = st = null;
        },
        getSelector(elType, prop, id) {
            return this.modules[elType] !== undefined && this.modules[elType][prop] !== undefined ? this.modules[elType][prop][id] : undefined;
        },
        setLivePreview(model, prop, v, selector) {
            if (api.activeModel !== null && model.cid === api.activeModel.cid) {
                api.liveStylingInstance.setLiveStyle(prop, v, selector);
            } else {
                var prevModel = api.activeModel,
                        prevComponent = ThemifyConstructor.component;
                api.activeModel = model;
                ThemifyConstructor.component = model.get('elType');
                this.liveinstance = new ThemifyLiveStyling();
                this.liveinstance.init(true);
                this.liveinstance.setLiveStyle(prop, v, selector);
                api.activeModel = prevModel;
                ThemifyConstructor.component = prevComponent;
                prevModel = prevComponent = null;
            }
        },
        onChange() {
            setTimeout(function () {
                api.Utils._onResize(true);
            }, 1500);
        },
        addUndo(before, before_settings) {
            var isChanged = api.hasChanged === true;
            api.hasChanged = true;
            var cid = before[0].getAttribute('data-cid'),
                    m = api.Models.Registry.lookup(cid),
                    styles = $.extend(true, {}, this.liveinstance.undoData),
                    after_settings = $.extend(true, {}, m.get('elType') === 'module' ? m.get('mod_settings') : m.get('styling')),
                    after = Common.clone(document.getElementsByClassName('tb_element_cid_' + cid)[0]);

            before[0].classList.remove('tb_element_clicked');
            after[0].classList.remove('tb_element_clicked');

            api.undoManager.push(cid, before, after, 'save', {bsettings: before_settings, asettings: after_settings, styles: styles, 'column': false});
            styles = before = m = after = this.liveinstance = before_settings = after_settings = null;
            api.hasChanged = isChanged;
        },
        setModulePosition(dragger) {
            var expand = api.ActionBar.prevExpand;
            if (expand !== null) {
                var dragVal = dragger.getElementsByClassName('tb_dragger_value')[0];
                expand.style['top'] = '';
                if (dragVal !== undefined && dragVal.firstChild !== null) {
                    var drOffset = dragVal.getBoundingClientRect(),
                            expandOffset = expand.getBoundingClientRect();
                    if (expandOffset.bottom >= drOffset.top) {
                        expand.style['top'] = (dragger.offsetHeight / 2) + drOffset.height + 'px';
                    }
                }
            }
        },
        drag(ev) {
            if (ev.which === 1 && this.disableDrag === null && !ev.target.classList.contains('tb_dragger_value') && (ev.target.classList.contains('tb_dragger') || ev.target.closest('.tb_dragger') !== null)) {
                api.ActionBar.hideContextMenu();
                var el = ev.target.closest('.tb_dragger'),
                        baseEl = $(el).closest('[data-cid]')[0];
                this.addEdgesOptions(el);
                if (baseEl === undefined) {
                    return;
                }
                var model = api.Models.Registry.lookup(baseEl.getAttribute('data-cid'));
                if (!model) {
                    return;
                }
                var elType = model.get('elType'),
                        componentName = elType === 'module' ? model.get('mod_name') : elType;

                var items = [],
                        selector = null,
                        baseProp = null,
                        isPadding = null,
                        type = null,
                        prevY = ev.pageY,
                        prevX = ev.pageX,
                        current = 0,
                        u = null,
                        isMoved = null,
                        dir = null,
                        text = [],
                        type = null,
                        self = this,
                        before = null,
                        before_settings,
                        getSpeed = function (x, y) {
                            var k = u === 'px' || u === '%' ? 1 : .1,
                                    box = el.getBoundingClientRect(),
                                    diff = 0;
                            if (type === 'left') {
                                diff = x - box.right;
                            } else if (type === 'right') {
                                diff = box.left - x;
                            } else if (type === 'top') {
                                diff = y - box.bottom;
                            } else if (type === 'bottom') {
                                diff = box.top - y;
                            }
                            if (diff > 0) {
                                k *= 2;
                            }
                            return k;
                        },
                        _move = function (e) {
                            if (isMoved === null) {
                                ev.stopPropagation();
                                isMoved = true;
                                api.ActionBar.disable = true;
                                var apply = el.getElementsByClassName('tb_dragger_types')[0].getElementsByClassName('current')[0];
                                apply = apply === undefined ? false : (apply.classList.contains('tb_apply_all') ? 'all' : 'opposite');
                                dir = el.classList.contains('tb_dragger_top') || el.classList.contains('tb_dragger_bottom') ? 's' : 'e';
                                type = dir === 's' ? (el.classList.contains('tb_dragger_top') ? 'top' : 'bottom') : (el.classList.contains('tb_dragger_left') ? 'left' : 'right');
                                baseProp = el.classList.contains('tb_dragger_padding') ? 'padding' : 'margin';
                                before_settings = $.extend(true, {}, model.get(elType === 'module' ? 'mod_settings' : 'styling'));
                                before = Common.clone(baseEl),
                                        current = parseFloat(el.dataset['v']) || 0;
                                u = el.dataset['u'];
                                selector = self.getSelector(componentName, baseProp, el.getAttribute('data-id').replace('_' + type, ''));

                                if (selector !== undefined && selector !== '') {
                                    baseEl = baseEl.querySelectorAll(selector);
                                    if (baseEl.length === 0) {
                                        baseEl = null;
                                    }
                                }
                                if (baseEl !== null) {
                                    document.body.classList.add('tb_drag_start');
                                    document.body.classList.add('tb_dragger_drag');
                                    document.body.classList.add('tb_dragger_drag_' + dir);
                                    topWindow.document.body.classList.add('tb_drag_start');
                                    if (baseEl[0] === undefined) {
                                        baseEl = [baseEl];
                                    }
                                    for (var i = baseEl.length - 1; i > -1; --i) {
                                        var tmp = baseEl[i].getAttribute('data-cid') ? baseEl[i] : baseEl[i].parentNode;
                                        tmp = tmp.children;
                                        for (var j = tmp.length - 1; j > -1; --j) {
                                            if (tmp[j].classList.contains('tb_dragger_' + baseProp)) {
                                                if (apply === 'opposite') {
                                                    if ((dir === 's' && (tmp[j].classList.contains('tb_dragger_left') || tmp[j].classList.contains('tb_dragger_right'))) || (dir === 'e' && (tmp[j].classList.contains('tb_dragger_top') || tmp[j].classList.contains('tb_dragger_bottom')))) {
                                                        continue;
                                                    }
                                                } else if (apply !== 'all' && !tmp[j].classList.contains('tb_dragger_' + type)) {
                                                    continue;
                                                }
                                                tmp[j].classList.add('tb_dragger_dragged');
                                                text.push(tmp[j].getElementsByClassName('tb_dragger_value')[0]);
                                                items.push(tmp[j]);
                                            }
                                        }
                                    }
                                }
                            }
                            if (baseEl !== null) {
                                var x = e.clientX,
                                        y = e.clientY,
                                        koef = getSpeed(x, y);
                                if (dir === 'e') {
                                    if (x !== prevX) {
                                        if (x > prevX) {
                                            if (type === 'left') {
                                                current += koef;
                                            } else {
                                                current -= koef;
                                            }
                                        } else {
                                            if (type === 'left') {
                                                current -= koef;
                                            } else {
                                                current += koef;
                                            }
                                        }
                                    }
                                } else if (y !== prevY) {
                                    if (y > prevY) {
                                        current += koef;
                                    } else {
                                        current -= koef;
                                    }
                                }
                                prevX = x;
                                prevY = y;
                                if (current < 0 && baseProp === 'padding') {
                                    current = 0;
                                } else if (current % 1 !== 0) {
                                    current = parseFloat(current.toFixed(1));
                                }
                                var v = current + u;
                                for (var i = items.length - 1; i > -1; --i) {
                                    var prop = items[i].getAttribute('data-prop');
                                    for (var j = baseEl.length - 1; j > -1; --j) {
                                        baseEl[j].style[prop] = v;
                                    }
                                    if (baseProp === 'margin') {
                                        var p = items[i].classList.contains('tb_dragger_top') || items[i].classList.contains('tb_dragger_bottom') ? 'height' : 'width',
                                                v2 = current,
                                                u2 = u;
                                        if (u === '%') {
                                            v2 = self.getRealPercent(items[i], current);
                                            u2 = 'px';
                                        }
                                        items[i].style[p] = current < 0 ? ((-v2) + u2) : (v2 + u2);
                                        items[i].style[prop] = (-v2) + u2;
                                    } else {
                                        items[i].style[prop] = u === '%' ? self.getRealPercent(items[i], current) + 'px' : v;
                                    }
                                    text[i].textContent = current === 0 ? '' : v;
                                }
                            }
                        },
                        _up = function (e) {
                            if (isMoved === true && baseEl !== null) {
                                var topIndex = null;
                                for (var i = items.length - 1; i > -1; --i) {
                                    var prop = items[i].getAttribute('data-prop');
                                    self.setLivePreview(model, prop, current + u, selector);
                                    for (var j = baseEl.length - 1; j > -1; --j) {
                                        baseEl[j].style[prop] = '';
                                    }
                                    if (current === 0 && baseProp === 'margin') {
                                        items[i].style['width'] = items[i].style['height'] = items[i].style[prop] = '';
                                    }

                                    items[i].setAttribute('data-v', current);
                                    items[i].setAttribute('data-u', u);
                                    items[i].classList.remove('tb_dragger_dragged');
                                    self.setData(model, items[i].getAttribute('data-id'), current, u, prop);
                                    if (baseProp === 'padding' && type === 'top' && elType === 'module') {
                                        topIndex = i;
                                    }
                                }

                                document.body.classList.remove('tb_dragger_drag_' + dir);
                                document.body.classList.remove('tb_drag_start');
                                topWindow.document.body.classList.remove('tb_drag_start');
                                document.body.classList.remove('tb_dragger_drag');
                                if (topIndex !== null) {
                                    self.setModulePosition(items[topIndex]);
                                }
                            }
                            document.removeEventListener('mousemove', _move, {passive: true});
                            document.removeEventListener('mouseup', _up, {once: true, passive: true});
                            topWindow.removeEventListener('mouseup', _up, {once: true, passive: true});
                            if (ev.target.closest('.tb_dragger_lightbox') !== null && e.target.closest('.tb_dragger_lightbox') !== null) {
                                ev.stopPropagation();
                                self.optionsClick(ev);
                            } else if (isMoved === true) {
                                self.onChange();
                                if (api.activeModel === null || api.activeModel.cid !== model.cid) {
                                    self.addUndo(before, before_settings);
                                }
                                api.ActionBar.hoverCid = api.ActionBar.disable = null;
                            }
                            el = model = items = before_settings = self = selector = text = dir = baseProp = prop = type = isMoved = baseEl = isPadding = type = u = current = null;
                        };
                if (model) {
                    document.addEventListener('mousemove', _move, {passive: true});
                    document.addEventListener('mouseup', _up, {once: true, passive: true});
                    topWindow.addEventListener('mouseup', _up, {once: true, passive: true});
                }
            }
        }
    };
    api.createStyleInstance = function () {
        return new ThemifyLiveStyling();
    };


}(jQuery, Themify, window, window.top, document, tb_app, ThemifyBuilderCommon));
