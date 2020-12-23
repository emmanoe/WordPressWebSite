/**
 * Search form module
 */
;
(function($,Themify){
    'use strict';
    const _init=function($search) {
        const cache = [],
            $input = $search.find('#searchform input'),
            $result_wrapper = $search.find('.search-results-wrap');
        let xhr;
            
            
        $('.search-button, #close-search-box').on('click', function (e) {
            e.preventDefault();
            if ($input.val().length) {
                    $search.addClass('search-active');
            } else {
                    $search.removeClass('search-active')
            }
            if ($(this).hasClass('search-button')) {
                    $search.fadeIn(function () {
                            $input.focus();
                            Themify.body.css('overflow-y', 'hidden');
                    });
                    Themify.body.addClass('searchform-slidedown');
            }
            else {
                    if (xhr) {
                            xhr.abort();
                    }
                    $search.fadeOut();
                    Themify.body.css('overflow-y', 'visible').removeClass('searchform-slidedown');
            }
        });

        $result_wrapper.on('click', '.search-option-tab a', function (e) {
            e.preventDefault();
            let $href = $(this).attr('href').replace('#', '');
            if ($href === 'all') {
                $href = 'item';
            }
            else {
                $result_wrapper.find('.result-item').stop().fadeOut();
            }
            if ($('#result-link-' + $href).length > 0) {
                $('.view-all-button').hide();
                $('#result-link-' + $href).show();
            }
            $result_wrapper.find('.result-' + $href).stop().fadeIn();
            $(this).closest('li').addClass('active').siblings('li').removeClass('active');
        });
        $input.prop('autocomplete', 'off').on('keyup', function (e) {
            if ($(this).val().length > 0) {
                $search.addClass('search-active');
            } else {
                $search.removeClass('search-active');
            }
            function set_active_tab(index) {
                if (index < 0) {
                    index = 0;
                }
                $result_wrapper.find('.search-option-tab li').eq(index).children('a').trigger('click');
                $result_wrapper.show();
            }
            if ((e.keyCode >= 48 && e.keyCode <= 57) || (e.keyCode >= 65 && e.keyCode <= 90) || e.keyCode === 8 || e.keyCode === 229) {
                let $v = $.trim($(this).val());
                if ($v) {
                    if (cache[$v]) {
                        var $tab = $result_wrapper.find('.search-option-tab li.active').index();
                        $result_wrapper.hide().html(cache[$v]);
                        set_active_tab($tab);
                        return;
                    }
                    setTimeout(function () {
                        $v = $.trim($input.val());
                        if (xhr) {
                            xhr.abort();
                        }
                        if (!$v) {
                            $result_wrapper.html('');
                            return;
                        }

                        xhr = $.ajax({
                            url: themify_vars.ajax_url,
                            type: 'POST',
                            data: {'action': 'themify_search_autocomplete', 'term': $v},
                            beforeSend: function () {
                                $search.addClass('themify-loading');
                            },
                            complete: function () {
                                $search.removeClass('themify-loading');
                            },
                            success: function (resp) {
                                if (!$v) {
                                    $result_wrapper.html('');
                                }
                                else if (resp) {
                                    const $tab = $result_wrapper.find('.search-option-tab li.active').index();
                                    $result_wrapper.hide().html(resp);
                                    set_active_tab($tab);
                                    $result_wrapper.find('.search-option-tab li.active')
                                    cache[$v] = resp;
                                }
                            }
                        });
                    }, 100);
                }
                else {
                    $result_wrapper.html('');
                }
            }
        });
    };
    Themify.on('themify_theme_search_init',function(search){
        _init(search);
    });
})(jQuery,Themify);