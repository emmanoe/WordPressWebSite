/*ThemifyGradient*/
(function ($,document,api) {
	'use strict';
    $.ThemifyGradient = function (element, options) {
        const defaults = {
            gradient: $.ThemifyGradient.default,
            width: 173,
            height: 15,
            point: 8,
            angle: 180,
            circle: false,
            type: 'linear', // [linear / radial]
            onChange() {
            },
            onInit() {
            }
        },
        $element = $(element);
		let $pointsContainer,
        $pointsInfosContent, 
        $pointColor,
        $pointPosition, 
        $btnPointDelete,
        _context, 
        _selPoint,
        points = new Array();
        this.isInit = false;
        this.initSwatchesFlag = false;
        this.settings = {};
        this.__constructor = function () {
            this.settings = $.extend({}, defaults, options);
            this.update();
            this.settings.onInit();
            this.isInit = true;
            return this;
        };
        this.updateSettings = function (options) {
            this.settings = $.extend({}, defaults, options);
            this.update();
            return this;
        };
        this.update = function () {
            this._setupPoints();
            this._setup();
            this._render();
        };
        this.getCSSvalue = function () {
			const defCss = [],
                defDir = this.settings.type === 'radial'?(this.settings.circle ? 'circle,' : ''):this.settings.angle + 'deg,';
            for (let i = 0, len = points.length; i < len; ++i) {
                defCss.push(points[i][1] + ' ' + points[i][0]);
            }
            return this.settings.type + '-gradient(' + defDir + defCss.join(', ') + ')';
        };
        this.getString = function () {
            let out = '';
            for (let i = 0, len = points.length; i < len; ++i) {
                out += points[i][0] + ' ' + points[i][1] + '|';
            }
            return out.substr(0, out.length - 1);
        };
        this.setType = function (type) {
            this.settings.type = type;
            this.settings.onChange(this.getString(), this.getCSSvalue());
        };
        this.setAngle = function (angle) {
            this.settings.angle = angle;
            this.settings.onChange(this.getString(), this.getCSSvalue());
        };
        this.setRadialCircle = function (circle) {
            this.settings.circle = circle;
            this.settings.onChange(this.getString(), this.getCSSvalue());
        };
        this._setupPoints = function () {
            points = new Array();
            if ($.isArray(this.settings.gradient)) {
                points = this.settings.gradient;
            }
            else {
                points = this._getGradientFromString(this.settings.gradient);
            }
        };
        this._setup = function () {
            const self = this,
            fragment = document.createDocumentFragment(),
            _container = document.createElement('div'),
            pointsInfos = document.createElement('div'),
            delimiter = document.createElement('span'),
            percent = document.createElement('span'),
			tmpDiv1=document.createElement('div'),
            tmpDiv2=document.createElement('div');
			
            $btnPointDelete = document.createElement('a');
            $pointColor = document.createElement('div');
            $pointPosition = document.createElement('input');
            $pointsContainer =  document.createElement('div');
            $pointsInfosContent = document.createElement('div');
            
			
            let _canvas = document.createElement('canvas');
			
            _container.className = 'themifyGradient tf_rel';
            _canvas.width = this.settings.width;
            _canvas.height = this.settings.height;
            $pointsContainer.style['width'] = this.settings.width + Math.round(this.settings.point / 2 + 1)+'px';
            $pointsContainer.className = 'points';
            $pointColor.className = 'point-color';
            delimiter.className='gradient_delimiter';
            percent.className='gradient_percent';
            percent.innerHTML = '%';
            $pointPosition.type = 'text';
            $pointPosition.className = 'point-position';
            $btnPointDelete.className ='gradient-point-delete tf_close';
            $btnPointDelete.href ='#';
            pointsInfos.className = 'gradient-pointer-info';
            $pointsInfosContent.className = 'content';
			tmpDiv1.style['backgroundColor']='#00ff00';
            tmpDiv2.className='gradient-pointer-arrow';
			$pointColor.appendChild(tmpDiv1);
			pointsInfos.appendChild(tmpDiv2);
            $pointsInfosContent.appendChild($pointColor);
            $pointsInfosContent.appendChild(delimiter);
            $pointsInfosContent.appendChild($pointPosition);
            $pointsInfosContent.appendChild(percent);
            $pointsInfosContent.appendChild($btnPointDelete);
            fragment.appendChild($pointsContainer);
            fragment.appendChild(_canvas);
            pointsInfos.appendChild($pointsInfosContent);
            
            fragment.appendChild(pointsInfos);
            _container.appendChild(fragment);
            
            while (element.firstChild) {
                element.removeChild(element.firstChild);
            }
            element.appendChild(_container);
            // Add swatches HTML
            if(!this.initSwatchesFlag){
                element.parentNode.appendChild(this.swatchesHTML());
                this.initSwatches();
                this.initSwatchesFlag = true;
            }
            
            $pointsInfosContent = $($pointsInfosContent);
            $pointColor = $($pointColor);
            $pointPosition = $($pointPosition);
            $btnPointDelete = $($btnPointDelete);
            $pointsContainer = $($pointsContainer);
            _context = _canvas.getContext('2d');
            
            _canvas = $(_canvas);
            
            _canvas.off('click').on('click', function (e) {
                const offset = _canvas.offset();
                let defaultColor = 'rgba(0,0,0, 1)', 
                minDist = 999999999999,
                clickPosition = e.pageX - offset.left;
                clickPosition = Math.round((clickPosition * 100) / self.settings.width);
                for (let i = 0, len = points.length; i < len; ++i) {
                    points[i][0] = parseInt(points[i][0]);
                    if ((points[i][0] < clickPosition) && (clickPosition - points[i][0] < minDist)) {
                        minDist = clickPosition - points[i][0];
                        defaultColor = points[i][1];
                    }
                    else if ((points[i][0] > clickPosition) && (points[i][0] - clickPosition < minDist)) {
                        minDist = points[i][0] - clickPosition;
                        defaultColor = points[i][1];
                    }
                }
                points.push([clickPosition + '%', defaultColor]);
                points.sort(self._sortByPosition);
                self._render();
                for (let i = 0, len = points.length; i < len; ++i) {
                    if (points[i][0] === clickPosition + '%') {
                        self._selectPoint($pointsContainer.find('.point:eq(' + i + ')'));
                    }
                }
                if (api.mode === 'visual') {
                    setTimeout(self._colorPickerPosition, 315);
                }

            });
            this.pointEvents();
            $element[0].addEventListener('keyup',function(e){
                const key = e.keyCode || e.which || 0;
                if (( key === 8 || key === 46 ) && window.top.document.activeElement.tagName !== 'INPUT') {
                    $pointColor.siblings('.point-position').focus();
                    self.removePoint(e);
                }
            },{passive: false});
        };
        this.pointEvents = function () {
            const self = this,
            items = element.getElementsByClassName('point-position'),
            listener =  function (e) {
                let v = parseInt($.trim(this.value));
                if (isNaN(v)) {
                    v = 0;
                }
                else if (v < 0) {
                    v = Math.abs(v);
                }
                else if (v >= 98) {
                    v = 98;
                }
                if (e.type !== 'focusout') {
                    v = Math.round((v * self.settings.width) / 100);
                    $(this).closest('.themifyGradient').find('.themify_current_point').css('left', v);
                    self._renderCanvas();
                }
                else {
                    this.value = v;
                }
            };
            for(let i=items.length-1;i>-1;--i){
                items[i].addEventListener('focusout',listener,{passive: true});
                items[i].addEventListener('keyup',listener,{passive: true});
            }
        };
        this._render = function () {
            this._initGradientPoints();
            this._renderCanvas();
        };
        this._colorPickerPosition = function () {
            const lightbox = ThemifyBuilderCommon.Lightbox.$lightbox,
				p = $pointsInfosContent.find('.minicolors'),
				el = p.find('.minicolors-panel');
			if(el.length>0){
				if ((lightbox.offset().left + lightbox.width()) <= el.offset().left + el.width()) {
					p.addClass('tb_minicolors_right');
				}
				else {
					p.removeClass('tb_minicolors_right');
				}
			}
        };
        this._initGradientPoints = function () {
            const self = this,
                fragment = document.createDocumentFragment(),
                el = [],
                listener = function(){
                    self._selectPoint(this);
                    if (api.mode === 'visual') {//fix drag/drop window focus
                        self._colorPickerPosition();
                        $(document).trigger('mouseup');
                    }
                };
                while ($pointsContainer[0].firstChild) {
                    $pointsContainer[0].removeChild($pointsContainer[0].firstChild);
                }
            for (let i = 0, len = points.length; i < len; ++i) {
                let p=document.createElement('div');
                p.className = 'point';
                p.style['backgroundColor'] = points[i][1];
                p.style['left'] =  ((parseInt(points[i][0]) * self.settings.width) / 100)+'px';

                p.removeEventListener('click',listener,{passive: true});
                p.addEventListener('click',listener,{passive: true});
                fragment.appendChild(p);
                el[i] = p;
            }
            $pointsContainer[0].appendChild(fragment);
            for (let i =el.length-1; i>-1;--i) {
                $(el[i]).draggable({
                    axis: 'x',
                    containment: 'parent',
                    start(e, ui) {
                        $element.addClass('tb_gradient_drag').focus();
                    },
                    stop(e, ui) {
                        $element.removeClass('tb_gradient_drag').focus();
                        if (api.mode === 'visual') {
                            $(document).trigger('mouseup');
                        }
                    },
                    drag(e, ui) {
                        self._selectPoint(this, true);
                        self._renderCanvas();
                    }
                });
            }
        };
        this.hexToRgb = function (hex) {
            // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
            const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
            hex = hex.replace(shorthandRegex, function (m, r, g, b) {
                return r + r + g + g + b + b;
            });

            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : null;
        };
        this._selectPoint = function (el, is_drag) {
            const self = this;
            _selPoint = $(el);
            let left = parseInt(_selPoint.css('left'));
            $pointPosition.val(Math.round((left / this.settings.width) * 100));
            left -= 30;
            if (left < 0 && window.top.document.body.classList.contains('tb_module_panel_docked')) {
                left = 3;
            }
            $element.find('.gradient-pointer-info').css('marginLeft', left + 'px');
            if (is_drag) {
                return false;
            }
            $element.focus();
            _selPoint.addClass('themify_current_point').siblings().removeClass('themify_current_point');
            let bgColor = _selPoint.css('backgroundColor'),
                color = bgColor.substr(4, bgColor.length);
                color = color.substr(0, color.length - 1);
                $element.find('.point-color .minicolors').remove();

            // create the color picker element
            let $input = $pointColor.find('.themify-color-picker');
            if ($input.length === 0) {
                $input = $('<input type="text" class="themify-color-picker" />');
                $input.appendTo($pointColor).minicolors({
                    opacity: true,
                    changeDelay: 10,
                    change(value, opacity) {
                        let rgb = self.hexToRgb(value);
                        if (!rgb) {
                            rgb = {r: 255, g: 255, b: 255};
                            opacity = 1;
                        }
                        _selPoint.css('backgroundColor', 'rgba(' + rgb.r + ',' + rgb.g + ',' + rgb.b + ',' + opacity + ')');
                        self._renderCanvas();
                    }
                });
                $element.find('.minicolors').first().addClass('minicolors-focus');
                $btnPointDelete.off('click').on('click', this.removePoint.bind(this));
            }
            let rgb = bgColor.replace(/^rgba?\(|\s+|\)$/g, '').split(','),
                    opacity = rgb.length === 4 ? rgb.pop() : 1; // opacity is the last item in the array
            rgb = this._rgbToHex(rgb);
            // set the color for colorpicker
            $input.val(rgb).attr('data-opacity', opacity).data('opacity', opacity).minicolors('settings', {value: rgb});
        };
        this._renderCanvas = function () {
            const self = this,
            items = element.getElementsByClassName('point');
            points = new Array();
            for (let i = 0, len = items.length; i < len; ++i) {
                let position = Math.round((parseInt(items[i].style['left']) / self.settings.width) * 100);
                points.push([position + '%', items[i].style['backgroundColor']]);
            }
            points.sort(self._sortByPosition);
            this._renderToCanvas();
            if (this.isInit) {
                this.settings.onChange(this.getString(), this.getCSSvalue());
            }
        };
        this._renderToCanvas = function () {
            const gradient = _context.createLinearGradient(0, 0, this.settings.width, 0);
            for (let i = 0, len = points.length; i < len; ++i) {
                gradient.addColorStop(parseInt(points[i][0]) / 100, points[i][1]);
            }
            _context.clearRect(0, 0, this.settings.width, this.settings.height);
            _context.fillStyle = gradient;
            _context.fillRect(0, 0, this.settings.width, this.settings.height);
        };
        this._getGradientFromString = function (gradient) {
            const arr = new Array(),
                    points = gradient.split('|');
            for (let i = 0, len = points.length; i < len; ++i) {
                let position,
                        el = points[i],
                        index = el.indexOf('%'),
                        sub = el.substr(index - 3, index);
                if (sub === '100' || sub === '100%') {
                    position = '100%';
                }
                else if (index > 1) {
                    position = parseInt(el.substr(index - 2, index));
                    position += '%';
                }
                else {
                    position = parseInt(el.substr(index - 1, index));
                    position += '%';
                }
                arr.push([position, el.replace(position, '')]);
            }
            return arr;
        };
        this._rgbToHex = function (rgb) {
            const R = rgb[0], G = rgb[1], B = rgb[2];
            function toHex(n) {
                n = parseInt(n, 10);
                if (isNaN(n)) {
                    return '00';
                }
                n = Math.max(0, Math.min(n, 255));
                return '0123456789ABCDEF'.charAt((n - n % 16) / 16) + '0123456789ABCDEF'.charAt(n % 16);
            }
            return '#' + toHex(R) + toHex(G) + toHex(B);
        };
        this._sortByPosition = function (data_A, data_B) {
            data_A = parseInt(data_A[0]);
            data_B = parseInt(data_B[0]);
            return data_A < data_B ? -1 : (data_A > data_B ? 1 : 0);
        };
        this.removePoint = function(e){
            e.preventDefault();
            if (points.length > 1) {
                points.splice(_selPoint.index(), 1);
				const p=$pointsInfosContent[0].parentNode;
				p.style['display']='none';
				setTimeout(function(){
					p.style['display']='';
				},50);
                this._render();
            }
        };
        this.swatchesHTML = function(){
            const fr = document.createDocumentFragment(),
				dropdownIcon = document.createElement('div'),
				swatchesContainer = document.createElement('ul'),
				dropdown = themifyColorManager.makeImportExportDropdown(),
                addBtn = document.createElement('a');
            addBtn.className = 'tb_gradient_add_swatch tf_plus_icon';
            let tooltip=document.createElement('span');
            tooltip.className='themify_tooltip';
            tooltip.innerText=ThemifyConstructor.label.save_gradient;
            addBtn.appendChild(tooltip);
            addBtn.href = '#';
            addBtn.addEventListener('click',this.saveSwatch.bind(this));
            
            dropdownIcon.className = 'tb_cm_dropdown_icon';
            dropdownIcon.tabIndex = 1;
            tooltip=document.createElement('span');
            tooltip.className='themify_tooltip';
            tooltip.innerText=ThemifyConstructor.label.ie_gradient;
            dropdownIcon.appendChild(tooltip);
            dropdown.addEventListener('click',this.swatchesDropdownClicked.bind(this));
			dropdownIcon.appendChild(api.Utils.getIcon('ti-import'));
            dropdownIcon.appendChild(dropdown);
            swatchesContainer.className = 'tb_gradient_swatches';
            swatchesContainer.addEventListener('click',this.swatchClicked.bind(this));
			
			fr.appendChild(addBtn);
            fr.appendChild(dropdownIcon);
            fr.appendChild(swatchesContainer);
            return fr;
        };
        this.swatchesDropdownClicked = function ( e ) {
            e.preventDefault();
            e.stopPropagation();
            const target = e.target,
                classList = target.classList;
            if(classList.contains('tb_cm_export')){
                target.parentNode.parentNode.parentNode.blur();
                document.location.assign(themifyCM.exportGradientsURL);
            }
			else if(classList.contains('tb_cm_import')){
                target.parentNode.parentNode.parentNode.blur();
                themifyColorManager.importColors('gradients');
            }
        };
        this.saveSwatch = function () {
            if('' === this.getString() || '' === this.getCSSvalue())return false;
			
            const swatches = Object.keys(themifyCM.gradients),
                css = this.getCSSvalue();
            for(let i = swatches.length-1; i>-1; --i) {
                if ( themifyCM.gradients[swatches[i]].css === css ){
                    return null;
                }
            }
            const id = themifyColorManager.UID(),
                swatch = {
                    id : id,
                    setting : JSON.parse(JSON.stringify(this.settings)),
                    gradient : this.getString(),
                    css : css,
                    points : points
                };
            themifyCM.gradients[id] = swatch;
            this.addSwatch(swatch);
            themifyColorManager.updateColorSwatches('gradients');
        };
        this.addSwatch = function ( swatch, init ) {
            const sw = document.createElement('li'),
				deleteIcon = document.createElement('span');
            sw.className = 'tb_gradient_swatch';
            sw.style.background = swatch.css;
            sw.dataset.id = swatch.id;
             
            deleteIcon.className = 'tb_delete_swatch tf_close';
            sw.appendChild(deleteIcon);
            if(init){
                const container = element.parentElement.getElementsByClassName('tb_gradient_swatches')[0];
                container.insertBefore(sw, container.firstChild);
            }
			else{
                const gradients = ThemifyBuilderCommon.Lightbox.$lightbox[0].getElementsByClassName('tb_gradient_swatches');
                for(let i=0,len=gradients.length; i <len;++i){
                    gradients[i].insertBefore(sw.cloneNode(true), gradients[i].firstChild);
                }
            }
        };
        this.swatchClicked = function(e){
            e.preventDefault();
            const target = e.target,
                classList = target.classList;
            if(classList.contains('tb_gradient_swatch')){
                this.selectSwatch(target.dataset.id);
            }
			else if(classList.contains('tb_delete_swatch')){
                this.removeSwatch(target.parentNode.dataset.id);
                themifyColorManager.updateColorSwatches('gradients');
            }
        };
        this.removeSwatch = function(id){
            const swatches = ThemifyBuilderCommon.Lightbox.$lightbox[0].querySelectorAll('.tb_gradient_swatch[data-id="'+id+'"]');
            for(let i=swatches.length-1;i>-1; --i){
                swatches[i].parentNode.removeChild(swatches[i]);
            }
            delete themifyCM.gradients[id];
        };
        this.selectSwatch = function (id) {
            const swatch = themifyCM.gradients[id];
            this.setAngle(swatch.setting.angle);
            this.setRadialCircle(swatch.setting.circle);
            this.setType(swatch.setting.type);
            this.settings.gradient = swatch.gradient;
            this.update();
            const container = element.parentElement,
                type = container.getElementsByClassName('themify-gradient-type')[0],
                circle = container.querySelector('input[type="checkbox"]'),
                angle = container.getElementsByClassName('themify-gradient-angle')[0];
            type.value = swatch.setting.type;
            Themify.triggerEvent(type, 'change');
            circle.checked = swatch.setting.circle;
            Themify.triggerEvent(circle, 'change');
            angle.value = swatch.setting.angle;
            Themify.triggerEvent(angle, 'change');
        };
        this.initSwatches = function(){
            const swatches = Object.keys(themifyCM.gradients);
            themifyCM.gradients = swatches.length ? themifyCM.gradients : {};
            for(let i = 0,len=swatches.length; i <len ; i++) {
                this.addSwatch(themifyCM.gradients[swatches[i]],true);
            }
        };
        return this.__constructor();
    };
    $.ThemifyGradient.default = '0% rgba(0,0,0, 1)|100% rgba(255,255,255,1)';
    $.fn.ThemifyGradient = function (options) {
        return this.each(function () {
            if ($(this).data('themifyGradient') === undefined) {
                $(this).data('themifyGradient', new $.ThemifyGradient(this, options));
            }
        });
    };
})(jQuery,document,tb_app);
