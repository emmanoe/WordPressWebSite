/**
 * infinite module
 */
;
(function ($, Themify, window, document) {
    'use strict';
    let isSafari = null,
            historyObserver = null;
    const Prefetched = [],
            self = Themify,
            _init = function (options) {
                return new window['IntersectionObserver'](function (entries, _self) {
                    for (let i = entries.length - 1; i > -1; --i) {
                        if (entries[i].isIntersecting === true) {
                            if (options['button'] === null) {
                                _self.disconnect();
                            } else {
                                _Load(options);
                            }
                        }
                    }
                }, {
                    threshold:.1
                });
            },
            _addHistoryPosition = function (item, path) {
                if (historyObserver === null) {
                    historyObserver = new window['IntersectionObserver'](function (entries, _self) {
                        for (let i = entries.length - 1; i > -1; --i) {
                            if (entries[i].isIntersecting === true) {
                                window.history.replaceState(null, null, entries[i].target.getAttribute('data-tf-history'));
                            }
                        }
                    }, {
                        rootMargin:'100% 0px -100% 0px'
                    });
                }
                item.setAttribute('data-tf-history', _removeQueryString(path));
                historyObserver.observe(item);
            },
            _removeQueryString = function (path) {
                return Themify.UpdateQueryString('tf-scroll',null,path);
            },
            _addQueryString = function (path) {
                return self.UpdateQueryString('tf-scroll', 1, path);
            },
            _beforeLoad = function (element, doc) {
                self.lazyScroll(Themify.selectWithParent('[data-lazy]',element), true);
                const $element = $(element);
                if (window['Isotope'] !== undefined) {
                    const isotop = window['Isotope'].data(element);
                    if (isotop) {
                        const postFilter = element.previousElementSibling;
                        if (postFilter !== null && postFilter.classList.contains('post-filter')) {
                            const active = postFilter.getElementsByClassName('active')[0];
                            if (active !== undefined) {
                                $(active).trigger('click.tf_isotop_filter');
                            }
                        }
                    }
                }
                $element.triggerHandler('infinitebeforeloaded.themify', doc);
                self.trigger('infinitebeforeloaded.themify', [$element, doc]);
                setTimeout(self.reLayoutIsoTop.bind(self), 1500);
            },
            _afterLoad = function (items, element, opt) {
                const len = items.length,
                        container = $(element),
                        isotop = window['Isotope'] !== undefined ? window['Isotope'].data(element) : null;
                if (isSafari === null) {
                    isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
                }
                items[0].className += ' tf_firstitem';
                var k = 0;
                for (let i = 0; i < len; ++i) {
                    items[i].style['opacity'] = 0;
                    self.imagesLoad(items[i], function (instance) {
                        const el = instance.elements[0];
                        // Fix Srcset in safari browser
                        if (isSafari) {
                            const imgSrcset = el.querySelector('img[srcset]');
                            if (null !== imgSrcset) {
                                imgSrcset.outerHTML = imgSrcset.outerHTML;
                            }
                        }
                        ++k;
                        if (isotop) {
                            isotop.appended(el);
                        }
                        el.style['opacity'] = '';
                        if (k === len) {
                            if (isotop || container[0].classList.contains('auto_tiles')) {
                                const postFilter = container[0].previousElementSibling;
                                if (postFilter !== null && postFilter.classList.contains('post-filter')) {
                                    // If new elements with new categories were added enable them in filter bar
                                    self.body.triggerHandler('themify_isotop_filter', [postFilter]);
                                }
                                if (container[0].classList.contains('auto_tiles')) {
                                    self.autoTiles(container[0]);
                                }
                            }
                            const $items = $(items);
							for (let i = 0; i < len; ++i) {
								self.lazyScroll(Themify.convert(Themify.selectWithParent('[data-lazy]',items[i])).reverse(),true);
							}
                            container.triggerHandler('infiniteloaded.themify', [$items]);
                            self.trigger('infiniteloaded.themify', [container, $items]);
                            if ('scroll' === opt['scrollToNewOnLoad']) {
                                let first = container[0].getElementsByClassName('tf_firstitem');
                                first = first[first.length - 1];
                                let to = $(first).offset().top;
                                const speed = to >= 800 ? (800 + Math.abs((to / 1000) * 100)) : 800,
                                        header = document.getElementById('headerwrap');
                                if (header !== null && (header.classList.contains('fixed-header') || self.body[0].classList.contains('fixed-header'))) {
                                    to -= $(header).outerHeight(true);
                                }
                                if (opt['scrollThreshold'] === false || (to - document.documentElement.scrollTop) > opt['scrollThreshold']) {
                                    self.scrollTo(to, speed);
                                }
                            }
							self.fontAwesome();
                        }
                    });
                }
            },
            _Load = function (opt) {
                if (opt['isWorking'] === true) {
                    return;
                }
                opt['isWorking'] = true;
                opt['status'].classList.add('tf_scroll_request');
                const request = new Headers({
                    'X-Requested-With': 'XMLHttpRequest'
                });

                fetch(_addQueryString(opt['button'].href), {
                    headers: request
                })
                        .then(function (response) {
                            return response.text();
                        })
                        .then(function (html) {
                            const doc = (new DOMParser()).parseFromString(html, 'text/html'),
                                    container = doc.querySelector(opt['id']),
                                    currentPath = _removeQueryString(opt['button'].getAttribute('href')),
                                    element = opt['container'];
									
                            let btn = null;
                            if (container !== null) {
                                _beforeLoad(element, doc);
                                const fr = document.createDocumentFragment(),
                                        childs = Themify.convert(container.children);
                                btn = container.getElementsByClassName('load-more-button')[0];
                                if(!btn){
                                    btn = container.nextElementSibling;
                                }
                                if (btn !== null) {
                                    if (!btn.classList.contains('load-more-button')) {
                                        btn = btn.children[0];
                                    }
                                    if (!btn || !btn.classList.contains('load-more-button')) {
                                        btn = null;
                                    }
                                }
								if(btn && btn.tagName!=='A'){
									btn = btn.children[0];
									if (!btn || btn.tagName!=='A') {
										btn = null;
									}
								}
                                if (childs[0] !== undefined) {
                                    for (let j = 0, len = childs.length; j < len; ++j) {
                                        fr.appendChild(childs[j]);
                                    }
                                    element.appendChild(fr);
                                    if (opt['history']) {
                                        _addHistoryPosition(childs[0], currentPath);
                                    }
                                    _afterLoad(childs, element, opt);
                                } else {
                                    btn = null;
                                }
                            }
                            if (btn === null) {
                                opt['button'].remove();
                                opt['button'] = null;
                            } else {
                                const nextHref = _addQueryString(btn.getAttribute('href'));
                                if (opt['prefetchBtn'] !== undefined && Prefetched[nextHref] === undefined) {
                                    Prefetched[nextHref] = true;
                                    opt['prefetchBtn'].setAttribute('href', nextHref);
                                }
                                opt['button'].href = nextHref;
                                window.addEventListener('scroll', function (opt, e) {
                                    opt['isWorking'] = null;
                                }.bind(null, opt), {passive: true, once: true});
                            }
                            /*Google Analytics*/
                            if (window['ga'] !== undefined) {
                                const link = document.createElement('a');
                                link.href = currentPath;
                                ga('set', 'page', link.pathname);
                                ga('send', 'pageview');
                            }
                            if (opt['history']) {
                                window.history.replaceState(null, null, currentPath);
                            }
                            opt['status'].classList.remove('tf_scroll_request');
                            return container;

                        }).catch(function (err) {
                    console.warn('InfiniteScroll error.', err);
                });
            };
    Themify.on('tf_infinite_init', function (container, opt) {
        if (container instanceof jQuery) {
            container = container[0];
        }
        let btn = container.getElementsByClassName('load-more-button')[0];
        if(!btn){
            btn = container.nextElementSibling;
        }
        if (!btn) {
            return;
        }
        let btn_wrap = btn;

        if (!btn.classList.contains('load-more-button')) {
            btn = btn.children[0];
            if (!btn || !btn.classList.contains('load-more-button')) {
                return;
            }
        }
        if(btn.tagName!=='A'){
            btn = btn.children[0];
            if (!btn || btn.tagName!=='A') {
                return;
            }
        }
        if (!opt['id']) {
            opt['id'] = container.getAttribute('id');
            if (!opt['id']) {
                opt['id'] = '.'+container.className.split(' ').join('.');
            } else {
                opt['id'] = '#' + opt['id'];
            }
            if (!opt['id']) {
                return;
            }
        }
        if (!Themify.cssLazy['tf_infinite']) {
            Themify.cssLazy['tf_infinite'] = true;
            Themify.LoadCss(Themify.url + '/css/modules/infinite.css');
        }
        const loaderWrap = document.createElement('div');
        loaderWrap.className = 'tf_load_status tf_loader tf_clear tf_hide';
        container.parentNode.insertBefore(loaderWrap, container.nextSibling);
        opt['status'] = loaderWrap;
        opt['button'] = btn;
        opt['container'] = container;
        if (opt['scrollThreshold'] !== false) {
            window.addEventListener('scroll', function (opt, btn_wrap) {
                const prefetch = document.createElement('link'),
                        nextHref = _addQueryString(opt['button'].getAttribute('href'));
                prefetch.setAttribute('as', 'document');
                prefetch.setAttribute('rel', 'prefetch');
                prefetch.setAttribute('href', nextHref);
                opt['button'].parentNode.insertBefore(prefetch, opt['button'].nextSibling);
                opt['prefetchBtn'] = prefetch;
                Prefetched[nextHref] = true;
                _addHistoryPosition(opt['container'].children[0], window.location.href);
                self.imagesLoad(null);
                _init(opt).observe(btn_wrap);
            }.bind(null, opt, btn_wrap), {passive: true, once: true});
        } else {
            _addHistoryPosition(container.children[0], window.location.href);
            btn.style['display'] = 'inline-block';
            btn.addEventListener('click', function (opt,e) {
                e.preventDefault();
                _Load(opt);
            }.bind(null, opt));
        }
    });

})(jQuery, Themify, window, document);
