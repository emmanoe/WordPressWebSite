var TB_InlineEdit;
(function ($, window, document, undefined,api) {
    'use strict';
    var mdown,
        lastY,
        open=0,
        tab,
        forceEnable,
        cid,
        before,
        action_items=null,
        top_menu,
        linkWrapper,
        slider,
        sliderCallback,
        saving,
        undo=function(el){
            if(saving && before){
                var r = el.closest('.module_row');
                api.hasChanged = true;
                api.undoManager.push( r.data('cid'), before, r, 'row');  
                before = null;
            }
        };
    TB_InlineEdit = {
        is_editable:false,
        is_active:false,
        toolbar:null,
        tinymce:null,
        el:null,
        init:function(){
            Themify.LoadCss($('#dashicons-css',top_iframe).prop('href'),false);
            $('.themify_builder_content').on('click','[contenteditable]',this.enable);
            var oldMouseDown= $.ui.sortable.prototype._mouseDown,
                $doc = $(document);
            $.ui.sortable.prototype._mouseDown = function (e, overrideHandle, noActivation) {
                if(e.which===1){
                    if($(e.target).closest('[contenteditable]').length>0){
                        var self=this;
                        $doc.one('mousemove',function(ev){
                            if(ev.which===1){
                                oldMouseDown.apply(self, [e, overrideHandle, noActivation]);
                            }
                        });
                    }
                    else{
                        oldMouseDown.apply(this, [e, overrideHandle, noActivation]);
                    }
                }
            };
            this.toolbar = $('#tb_editor');
            linkWrapper = this.toolbar.on('click','.tb_editor_action',this._actionClicked).find('#tb_editor_link_edit');
            ThemifyBuilderCommon.Lightbox.$lightbox.on('themify_opened_lightbox',function(e){
                if(this.is_active){
                    mdown = null;
                    this.disable();
                }
            }.bind(this));
        },
        activate:function(el){
            if(el.prop('contenteditable')!=='false'){
                el = el.find('[contenteditable="false"]').first();
            }
            if(el.length>0){
                forceEnable = true;
                el.trigger('click');
                forceEnable = false;
                api.activeModel.unset('is_new', {silent: true});
                api.activeModel = null;
            }
        },
        selectStart:function(e){
            if(e.type==='selectstart'){
                mdown = true;
                $(this).off('keyup',TB_InlineEdit._selection).on('keyup',TB_InlineEdit._selection);
            }
            else if(e.which===1){
                mdown = true;
                lastY = e.pageY;
                $(document).one('mouseup',function(e2){
                    if(lastY>e2.pageY){
                        lastY = e2.pageY;
                    }
                    TB_InlineEdit._selection();
                });
            }
        },
        enable:function(e){
            e.stopImmediatePropagation();
            e.preventDefault();
            mdown = null;
            if(!forceEnable && api.activeModel){
               api.Forms.saveComponent(e); 
            }
            var $this = $(this),
                self = TB_InlineEdit,
                el = $this.closest('.active_module'),
                id = el.data('cid');
            if(id===cid && open===1){
                self.disable();
            }
            else if(this.contentEditable=='false'){
                open = 0;
                if(saving && self.el){
                    self.save();
                    undo(self.el);
                }
                if(self.el){
                    self.el[0].contentEditable = false;
                    self.el.closest('.active_module').removeClass('tb_editor_on');
                }
                $('#tb_editor_carret').remove();
                before = ThemifyBuilderCommon.clone(el.closest('.module_row'));
                el[0].classList.add('tb_editor_on');
                self.is_editable = this.classList.contains('tb_editor_enable');
                if(self.is_editable && e.target.nodeName!=='A' && e.target.nodeName!=='button' && $(e.target).closest('a').length===0){
                    var selection = window.getSelection();
                    if(selection.rangeCount>0){
                        var dummy = document.createElement('span');
                            dummy.id = 'tb_editor_carret';
                            selection.getRangeAt(0).cloneRange().surroundContents(dummy);
                    }
                }
                cid = id;
                self.is_active = true;
                this.contentEditable = true;
                if(!self.is_editable){
                    $this.focus();
                }
                saving = false;
                self.remove();
                var is_forced = forceEnable;
                api.undoManager.disable();
                setTimeout(function(){
                        if(self.is_active){
                            open = 0;
                            self.el = $this;
                            slider=$this.closest('.themify_builder_slider');
                            if(slider.length>0){
                                slider.trigger('pause',true);
                                if(slider.data('events').mousedown){
                                    sliderCallback = slider.data('events').mousedown;
                                    for(var i=0,len=sliderCallback.length;i<len;++i){
                                        slider.unbind('mousedown',sliderCallback[i].handler);
                                    }
                                }        
                            }
                            else{
                                slider =sliderCallback= null;
                            }
                            if(self.is_editable){
                                var settings = $.extend({},true,tinyMCEPreInit.mceInit.tb_lb_hidden_editor);
                                settings.menubar = false;
                                settings.inline = true;
                                settings.skin = false;
                                settings.target = $this[0];
                                settings.theme = false;
                                settings.plugins='lists';
                                settings.toolbar1=null;
                                settings.toolbar2=null;
                                settings.selector=false;
                                settings.body_class=false;
                                settings.content_css=null;
                                settings.external_plugins=null;
                                settings.wp_shortcut_labels=false;
                                settings.branding=false;
                                settings.auto_focus = false;
                                settings.hidden_input=false;
                                settings.setup = function(editor){
                                    self.tinymce = editor;
                                    editor.on('init', function () {
                                        var offset;
                                        if(is_forced){
                                            forceEnable = false;
                                            offset= $this.offset();
                                        }
                                        else if(dummy){    
                                            var carret = editor.dom.select('#tb_editor_carret')[0];
                                            editor.selection.select(carret,true);
                                            if (window.getSelection && selection.modify) {
                                                selection.collapseToStart();
                                                selection.modify('move', 'backward', 'word');
                                                selection.modify('extend', 'forward', 'word');
                                            } else if ( (selection = document.selection) && selection.type !== 'Control') {
                                                var range = selection.createRange();
                                                range.collapse(true);
                                                range.expand('word');
                                            }
                                            offset = $(carret).offset();
                                            dummy = null;
                                        }
                                        if(offset){
                                            e.pageX = offset.left;
                                            e.pageY = offset.top;
                                        }
                                        editor.focus();
                                        self._setSelectedButtons();
                                        self._setCarret(e);
                                        $this.on('mousedown selectstart',self.selectStart);
                                        editor.on('Undo Redo',self._setSelectedButtons.bind(self));
                                    });
                                };
                                window.tinymce.init(settings);
                            }
                            else{
                                
                                self.toolbar.removeClass('tb_show').hide();
                                self.reset();
                            }
                            $this.one('keydown',function(){saving=true;});
                            Themify.body[0].classList.add('tb_editor_active');
                            $(document).off('click',self.disable).on('click',self.disable);
                            if(api.activeBreakPoint === 'desktop'){
                                api.Mixins.Builder.updateModuleSort(null,'disable');
                            }
                        }
                        else{
                            el.find('.themify_module_options').first().trigger('click');
                        }
                },(forceEnable?1:250));
                ++open;
              }
        },
        remove:function(){
            this.save();
            api.undoManager.updateUndoBtns();
            if(this.tinymce){
                var el = this.tinymce.targetElm;
                //tinymce.EditorManager.execCommand('mceFocus', false, this.tinymce.id);                    
                tinymce.EditorManager.execCommand('mceRemoveEditor', true, this.tinymce.id);
                el.setAttribute('contenteditable','false');
                if(this.tinymce.id===$(el).off('mousedown selectstart',this.selectStart).off('keyup',this._selection).prop('id')){
                    el.removeAttribute ('id');
                }
                this.tinymce = null;
            }
        },
        disable:function(e){
            if(!mdown){
                var self = TB_InlineEdit;
                
                if(!e || !self.toolbar[0].contains(e.target)){
                    self.is_active  = tab = cid = null;
                    self.reset();
                    open = 0;
                    Themify.body[0].classList.remove('tb_editor_active');
                    $('.tb_editor_on').removeClass('tb_editor_on');
                    self.toolbar.removeClass('tb_show').hide();
                    self.remove();
                    if(api.activeBreakPoint === 'desktop'){
                        api.Mixins.Builder.updateModuleSort(null, 'enable');
                    }
                    $(document).off('click',self.disable);
                    $('.themify_builder_content').find('[contenteditable="true"]').prop('contenteditable','false');
                    if(slider && slider.data('auto-scroll')!=='off'){
                        if(sliderCallback){
                            for(var i=0,len=sliderCallback.length;i<len;++i){
                                slider.bind('mousedown',sliderCallback[i].handler);
                            }
                        }
                        slider.trigger('resume');
                    }
                    $('#tb_editor_carret').remove();
                    undo(self.el);
                   
                    self.el=before =slider = sliderCallback = lastY = null;
                    
                }
            }
            mdown = null;
        },
        _setCarret:function(e){
            var self = TB_InlineEdit;
            if(!mdown && e){
                lastY = e.pageY;
            }
            var range =self.tinymce.selection?self.tinymce.selection.getRng().getBoundingClientRect():null,
                left = range?(range.left+(range.width)/2):e.pageX,
                top = self.toolbar.height(),
                width = self.toolbar.width(),
                w = $(window).width();
                left-=(width/2);
                if(left<0){
                    left=15;
                }
                else if((left+width)>=w){
                    left = w-1-width;
                }
                top=lastY-top-40;
                if(top<0){
                    top=15;
                }
                self.toolbar.css({'top':top,left:left});
                if(!self.toolbar[0].classList.contains('tb_show')){
                    self.toolbar.show()[0].classList.add('tb_show');
                }
                
        },
        _selection:function(e){
            TB_InlineEdit._setSelectedButtons();
            TB_InlineEdit._setCarret(e);
        },
        _setSelectedButtons:function(){
                var init = false;
                if(action_items===null){
                    action_items = this.toolbar[0].getElementsByClassName('tb_editor_action');
                    top_menu = [];
                    init = true;
                }
                for(var i=0,len=action_items.length;i<len;++i){
                    var action = action_items[i].dataset.action;
                       if(action!=='top'){
                        var type = action_items[i].dataset.type,
                            $item = $(action_items[i]),
                            el = $item.closest('li');
                        if(!type){
                            type = $item.closest('ul').data('type');
                        }
                        el[0].classList.remove('tb_selected');
                        if(this['_actions'][type]['state']){
                            this['_actions'][type]['state'](action,$item);
                        }
                        else if(this.state(type)){
                            el[0].classList.add('tb_selected');
                        }
                    }
                    else if(init){
                        top_menu.push(action_items[i]);
                    }
                }
                for(var i=0,len=top_menu.length;i<len;++i){
                    var selected = top_menu[i].getElementsByClassName('tb_selected'),
                        list = top_menu[i].classList,
                        cl;
                        for(var j=0,len2=list.length;j<len2;++j){
                            if(list[j].indexOf('ti-')===0){
                                top_menu[i].classList.remove(list[j]);
                                break;
                            }
                        }
                        if(selected.length>0){
                            list = selected[0].classList;
                            for(var j=0,len2=list.length;j<len2;++j){
                                if(list[j].indexOf('ti-')===0){
                                    cl = list[j];
                                    break;
                                }
                            }
                        }
                        else{
                            cl = top_menu[i].dataset.default;
                            $(top_menu[i]).find('.tb_editor_selected_text').remove();
                        }
                        list =null;
                        if(cl){
                            top_menu[i].classList.add(cl);
                        }
                        else if(selected.length>0){
                            var txt = top_menu[i].getElementsByClassName('tb_editor_selected_text'),
                                v = selected[0].getElementsByTagName('button')[0].dataset.action;
                            if(txt.length>0){
                                txt[0].innerHTML = v;
                            }
                            else{
                                top_menu[i].insertAdjacentHTML('afterbegin','<span class="tb_editor_selected_text">'+v+'</span>');
                            }
                           
                        }
                }
                
        },
        _actionClicked:function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            var self = TB_InlineEdit;
            if($(this).closest('.tb_editor_active_tab').length===0){
                var $this = $(this),
                    type=$this.data('type'), 
                    act = $this.data('action');
                if(act==='top'){
                    var ul = $this.find('ul'),
                        el = ul.find('.tb_selected').next();
                    if(el.length===0 || el[0].classList.contains('ti-control-skip-forward') || el[0].classList.contains('ti-control-skip-backward')){
                        el = ul.find('li').first();
                    }
                    el.find('.tb_editor_action').trigger('click');
                    return;
                }
                if(!type){
                    var ul = $(this).closest('ul');
                        type = ul.data('type');
                }
                var options = self.toolbar.find('#tb_editor_'+type+'_wrapper'),
                    callback = function(){
                        if(type!=='expand'){
                            saving = true;
                        }
                        tab = type;
                        self['_actions'][type]['result'](act,$this,options);
                        if(type!=='expand'){
                            self._setSelectedButtons();
                            if(options.length>0){
                                self._setCarret();
                            }
                        }
                    };
                
                if(options.length>0){
                    self.reset();
                    self._setCarret();
                    self.toolbar.one('transitionend',function(){
                        
                        $(this).one('transitionend',function(){ 
                            options[0].classList.add('tb_editor_active_tab');
                            setTimeout(callback,15);
                        })[0].classList.add('tb_show');
                        
                        self._close();
                    })[0].classList.remove('tb_show');
                }
                else{
                    callback();
                }
                
            }
        },
        reset:function(){
            var el = this.toolbar.find('.tb_editor_active_tab');
            if(el.length>0){
                el[0].classList.remove('tb_editor_active_tab');
            }
        },
        exec:function(command){
            var value = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
            api.hasChanged  = true;
            var obj = this.tinymce || document;
            obj.execCommand(command,false,value);
        },
        state:function(command){
            var st = this.tinymce.queryCommandState(command);
            return st===-1?false:st;  
        },
        _close:function(){
            this.toolbar.one('click','.tf_close',function(e){
                e.preventDefault(); 
                e.stopPropagation();
                TB_InlineEdit.reset();
                TB_InlineEdit['_actions']['link']['state']();
                TB_InlineEdit._setCarret();
                tab=false;
            });
        },
        _actions:{
            bold:{
                result:function(type,el){
                    return TB_InlineEdit.exec('bold');
                }
            },
            text_align:{
                result:function(type,el){
                    return TB_InlineEdit.exec(type);
                },
                state:function(type,el){
                    if(TB_InlineEdit.state(type)){
                        el.closest('li')[0].classList.add('tb_selected');
                    }
                }
            },
            underline:{
                result:function(type,el){
                    return TB_InlineEdit.exec('underline');
                }
            },
            paragraph:{
                result:function(type,el){
                    return TB_InlineEdit.exec('formatBlock',type);
                },
                state: function(type,el){
                    if($(window.getSelection().focusNode).closest(type).length>0){
                        el.closest('li')[0].classList.add('tb_selected');
                    }
                }
            },
            list:{
                result:function(type,el){
                    return TB_InlineEdit.exec(type);
                },
                state: function(type,el){
                    if(type!=='Indent' && type!=='Outdent' && TB_InlineEdit.state(type)===true){
                        el.closest('li')[0].classList.add('tb_selected');
                    }
                }
            },
            italic:{
                result:function(type,el){
                    return TB_InlineEdit.exec('italic');
                }
            },
            link:{
                loaded:null,
                result:function(type,$this,el){
                    var self = TB_InlineEdit,
                        _this = this,
                        toolbar = self.toolbar,
                        down = el.find('.ti-angle-double-up'),
                        additional = down.next('.tb_editor_link_options').hide(),
                        select = additional.find('#tb_editor_link_type'),
                        url = el.find('.tb_link_input'),
                        insertLink = function(e){
                            if(e.type==='keydown' && e.which!==13){
                                return;
                            }
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            var v = $.trim(url.val());
                            if(v){
                                url.off('keydown', insertLink);
                                var link_type,
                                    vals = {href:v};
                                if(down.hasClass('ti-angle-double-down')){
                                    link_type = select.val();
                                    if(link_type==='lightbox'){
                                        var w = additional.find('#tb_editor_lightbox_w'),
                                            h = additional.find('#tb_editor_lightbox_h');
                                        if(w.val()>0 || h.val()>0){
                                            if(w.val()>0){
                                                var u = w.next().find('select').val();
                                                vals['data-w'] = +w.val() +(u==='px'?'':u);
                                            }
                                            if(h.val()>0){
                                                var u = h.next().find('select').val();
                                                vals['data-h'] = +h.val() +(u==='px'?'':u);
                                            }
                                        }
                                    }
                                }
                                if(link_type==='blank'){
                                   vals.target ='_blank';
                                }
                                else if(link_type==='lightbox'){
                                    vals.class ='themify_lightbox';
                                }
                                self.exec('mceInsertLink', vals);
                                self.reset();
                                _this.state();
                                api.hasChanged  = true;
                                url.val('');
                                self._setCarret();
                            }
                        };
                    url.off('keydown', insertLink).on('keydown', insertLink);
                    down.off('click').on('click',function(e){
                        e.preventDefault(); 
                        e.stopPropagation();
                        additional.one('transitionend',function(){
                            self._setCarret();
                        });
                        $(this).toggleClass('ti-angle-double-down');
                    });
                    toolbar.one('click','.ti-check',insertLink);
                    
                    var is_lightbox,is_target,
                        act = additional.find('.tb_editor_lightbox_actions').css('display','');
                    select.off('change').on('change',function(e){
                        act.one('transitionend',function(){
                            self._setCarret();
                        }).css('display','').toggleClass('tb_editor_lightbox_actions_open',$(this).val()==='lightbox');
                        self._setCarret();
                    });
                    var is_lightbox,is_target;
                    if(url.val()){
                        var a = $(self.tinymce.selection.getNode()).closest('a');
                        if(a.length>0){
                            is_lightbox = a[0].classList.contains('themify_lightbox'),
                            is_target = !is_lightbox && a.prop('target')==='_blank';
                            a = null;
                        }
                    }
                    else{
                        select.val('');
                    }
                    if(!is_lightbox && !is_target){
                        act.removeClass('tb_editor_lightbox_actions_open');
                        down.removeClass('ti-angle-double-down');
                    }
                    else{
                        act.addClass('tb_editor_lightbox_actions_open');
                        down.addClass('ti-angle-double-down');
                    }
                    additional.css('display','');
                    self._setCarret();
                    url.focus();
                },
                state: function(action,el){
                    var self = TB_InlineEdit,
                        v='',
                        a = self.tinymce.selection.getNode();
                        if(a.nodeName==='A'){
                            v = a.getAttribute('href');
                            if(!self.toolbar.find('#tb_editor_link_wrapper')[0].classList.contains('tb_editor_active_tab')){
                                linkWrapper.addClass('tb_editor_active_tab').find('a').prop('href',v);
                                linkWrapper.one('click','.ti-unlink',function(e){
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    self.exec('unlink');
                                    self.reset();
                                }).find('.tb_editor_link_value button').text(v).one('click',function(e){
                                    e.preventDefault();
                                    e.stopImmediatePropagation();
                                    self.toolbar.find('.tb_link_input').val(v);
                                    self.reset();
                                    $('.tb_editor_action',$('.tb_editor_link',self.toolbar)).trigger('click');
                                });
                            }
                        }
                    self.toolbar.find('.tb_link_input').val(v);
                    var select = self.toolbar.find('#tb_editor_link_type'),
                        link_type='',
                        act = self.toolbar.find('.tb_editor_lightbox_actions');
                    if(v!==''){
                        if(a.classList.contains('themify_lightbox')){
                            link_type = 'lightbox';
                            act.show();
                        }
                        else if(a.target==='_blank'){
                            link_type = 'blank';
                        }
                        
                        if(link_type!=='lightbox'){
                            self.toolbar.find('#tb_editor_lightbox_w,#tb_editor_lightbox_h').val('');
                            act.hide();
                        }
                        else{
                            var units = ['w','h'];
                            for(var i=0;i<2;++i){
                                var lv = a.dataset[units[i]],
                                    u = $('#tb_editor_lightbox_'+units[i]+'_unit');
                                if(lv){
                                    var v1 = parseFloat(lv);
                                    if(!v1 || v1<0){
                                        v1 = '';
                                    }
                                    u.val((lv.indexOf('%')!==-1?'%':''));
                                    self.toolbar.find('#tb_editor_lightbox_'+units[i]).val(v1);
                                }
                                else{
                                    u.val('');
                                }
                            }
                        }
                        select.val(link_type);
                    }
                    else if(linkWrapper.hasClass('tb_editor_active_tab')){
                        linkWrapper.removeClass('tb_editor_active_tab');
                        self.toolbar.find('#tb_editor_lightbox_w,#tb_editor_lightbox_h').val('');
                    }
                    return v!=='';
                }
            },
            color:{
                input:null,
                is_trigger:false,
                result:function(type,el,options){
                    var self = TB_InlineEdit;
                    if(!this.input){
                        var url = $('link[href*="jquery.minicolors.css"]',top_iframe).prop('href');
                        Themify.LoadCss(url,false);
                        api.Utils.setColorPicker(options);
                        this.input = options.find('.minicolors-input');
                        var id = this.input.prop('id'),
                            _this = this,
                            is_focused = false;
                        Themify.body.on('themify_builder_color_picker_change',function(e,input_id, $el, hex){
                            if(id===input_id && hex!=='' && !_this.is_trigger){
                                self.exec('foreColor',  hex);
                                api.hasChanged  = true;
                                if(is_focused){
                                    is_focused = false;
                                    this.input.focus();
                                }
                            }
                            _this.is_trigger = false;
                        });
                        this.input.on('mousedown',function(e){
                            is_focused = true;
                        }).next('.minicolors-swatch').trigger('click');
                    }
                },
                state: function(){
                    if(tab==='color' && this.input){
                        var v = TB_InlineEdit.tinymce.queryCommandValue('foreColor');
                        if(v!=='' && v!==false){
                            this.is_trigger = true;
                            this.input.minicolors('value',v);
                        }
                    }
                }
            },
            fonts:{
                loaded:null,
                getValue:function(key,node,remove){
                    while(node.parentNode.id!==TB_InlineEdit.tinymce.id){
                        if(node.style[key]){
                            if(remove){
                               node.style[key] = '';
                            }
                            return node.style[key];
                        }
                        node = node.parentNode;
                    }
                    return false;
                },
                result:function(type,el,options){
                   
                    if(!this.loaded){
                        var self = TB_InlineEdit,
                            sfonts,gfonts,is_object = false;
                        
                        if(themifyBuilder.fonts){
                            sfonts = themifyBuilder.fonts.safe;
                            gfonts = themifyBuilder.fonts.google;
                            is_object = true;
                        }
                        else{
                            sfonts = ThemifyBuilderCommon.safe_fonts;
                            gfonts = ThemifyBuilderCommon.google_fonts;
                        }
                        this.loaded = options;
                        var select = options.find('#tb_editor_font_select optgroup'),
                            ranges = options.find('.tb_range'),
                            _this = this,
                            opt = '';
                    
                        for(var i in sfonts){
                            if(!is_object || i>1){
                                opt+='<option value="'+(is_object?sfonts[i].value:i).replace(/\'/g,'')+'">'+(is_object?sfonts[i].name:sfonts[i])+'</option>';
                            }
                        }
                        select[0].innerHTML = opt;
                        opt = '';
                        for(var i in gfonts){
                            if(!is_object || i>1){
                                opt+='<option value="'+(is_object?gfonts[i].value:i)+'">'+(is_object?gfonts[i].name:gfonts[i])+'</option>';
                            }
                        }
                        select.last()[0].innerHTML = opt;
                        select.first().closest('select').change(function(e){
                            var v = $.trim($(this).val());
                                if($(this).find('[value="'+v+'"]').closest('optgroup').data('type')==='google'){
                                    ThemifyBuilderCommon.loadGoogleFonts(v);
                                }
                            self.exec('fontName', v);
                        });
                        ranges.each(function(){
                            
                            var unit = $(this).next().find('.tb_unit')[0],
                                id = $(this).prop('id'),
                                is_size = id==='tb_editor_font_size',
                                is_focused = false,
                                k = id==='tb_editor_line_height'?'line-height':'letter-spacing',
                                timer;
                            
                            $(this).keyup(function(e){
                                    var _self = this;
                                    if(timer){
                                        clearTimeout(timer);
                                    }
                                    timer = setTimeout(function(){
                                        var v = _self.value;
                                        if(v!==''){
                                                v+=unit.value;
                                                if(is_size){
                                                        self.exec('fontSize', v);
                                                }
                                                else{
                                                    var setting = {};
                                                    setting[k] = v;
                                                    tinymce.activeEditor.formatter.register(id, {
                                                            inline : 'span',
                                                            styles : setting
                                                    });
                                                    self.tinymce.formatter.apply(id);
                                                }
                                        }
                                        else{
                                            _this.getValue(is_size?'fontSize':(id==='tb_editor_line_height'?'lineHeight':'letterSpacing'),self.tinymce.selection.getNode(),true);
                                        }
                                        if(is_focused){
                                            is_focused = false;
                                            $(_self).focus();
                                        }
                                    },8);
                                
                            }).focus(function(){
                                is_focused = true;
                            });
                            api.Utils.createRange( $(this),document );
                        });
                    }
                },
                state: function(){
                    
                    if(this.loaded && tab==='fonts'){
                        var self = TB_InlineEdit,
                            f = self.tinymce.queryCommandValue('fontName'),
                            sel = self.toolbar.find('#tb_editor_font_select');
                        if(!f){
                            sel.val('');
                        }
                        else{
                            var opt = sel[0].getElementsByTagName('option'),
                                is_selected=false;
                                f = f.replace(/\"/g,'');
                            for(var i=0,len=opt.length;i<len;++i){
                                if(opt[i].value===f){
                                    opt[i].selected =true;  
                                    is_selected = true;
                                    break;
                                }
                            }
                            if(!is_selected){
                                f = false;
                                sel.val('');
                            }
                            
                        }
                        var _this = this,
                            node = self.tinymce.selection.getNode();
                        this.loaded.find('.tb_range').each(function(){
                            var id = this.id,
                                k = id==='tb_editor_font_size'?'fontSize':(id==='tb_editor_line_height'?'lineHeight':'letterSpacing'),
                                v=_this.getValue(k,node),
                                u = 'px';
                               
                                if(v===false){
                                    v = '';
                                }
                                else{
                                    u= v.indexOf('em')!==-1?'em':(v.indexOf('%')!==-1?'%':'px');
                                    v = parseFloat(v);
                                }
                                
                                self.toolbar.find('#'+id+'_unit').val(u);
                                $(this).val(v);
                        });
                        return f;
                    }
                }
            },
            expand:{ 
                result:function(type,el,options){
                    TB_InlineEdit.save();
                    TB_InlineEdit.disable();
                    TB_InlineEdit.el.closest('.active_module').find('.themify_module_options').first().trigger('click');
                }
            }
        },
        save:function(){
            if(saving && this.el){
                $('#tb_editor_carret').remove();
                var cid = this.el.closest('.active_module').data('cid'),
                    val = this.tinymce?this.tinymce.getContent():this.el[0].innerText,
                    m = api.Models.Registry.lookup(cid),
                    n = this.el.data('name'),
                    repeat = this.el.data('repeat');
                    if(m && n){
                        var v = m.get('mod_settings');
                        if(repeat!==undefined){
                            if(v[repeat]){
                                v[repeat][this.el.data('index')][n] = val; 
                            }
                        }
                        else{
                           v[n] =  val; 
                        }
                        api.Models.setValue(cid,v,true);
                    }
            }
            
        }
    };
    
}(jQuery, window, document,tb_app));