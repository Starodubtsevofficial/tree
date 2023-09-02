/**
 * User: Troyanov Maxim (max)
 * Date: 03.05.12
 * Time: 14:08
 */
function getURLParameter(name, url) {
    return decodeURI(
        (RegExp(name + '=' + '(.+?)(&|$)').exec(url)||[,null])[1]
    );
}

function setCookie (name, value, expires, path, domain, secure) {
    var expiresDate = false;
    if (expires) {
        var today = new Date();
        today.setTime( today.getTime() );
        expiresDate = new Date( today.getTime() + (expires * 1000 * 60 * 60 * 24) ); //expires is days number
    }
    document.cookie = name + "=" + escape(value) +
        ((expiresDate) ? "; expires=" + expiresDate : "") +
        ((path) ? "; path=" + path : "") +
        ((domain) ? "; domain=" + domain : "; domain=.rsl.ru") +
        ((secure) ? "; secure" : "; SameSite=Lax");
}

function getCookie(name) {
    var cookie = " " + document.cookie;
    var search = " " + name + "=";
    var setStr = null;
    var offset = 0;
    var end = 0;
    if (cookie.length > 0) {
        offset = cookie.indexOf(search);
        if (offset != -1) {
            offset += search.length;
            end = cookie.indexOf(";", offset);
            if (end == -1) {
                end = cookie.length;
            }
            setStr = unescape(cookie.substring(offset, end));
        }
    }
    return(setStr);
}

jQuery(window).on('load', function() {
    var logoImage = jQuery('#logoImage');
    var logoBlock = jQuery('#logoBlock');
    var serviceMenuRu = jQuery('#service-menu-local-ru');
    var serviceMenuEn = jQuery('#service-menu-local-en');
    var currentLanguage = 'ru';
    var protocol = 'http://';
    if ("https:" == document.location.protocol) {
        protocol = 'https://';
    }

    if (logoBlock.length && logoImage.length) {
        logoImage.click(function() { return false; });

        //get language if exist
        if (serviceMenuRu.length) {
            currentLanguage = 'ru';
        } else if (serviceMenuEn.length) {
            currentLanguage = 'en';
        }

        var logoImageLeftMargin = parseInt(logoImage.css('margin-left'), 10) || 0;
        var logoImageTopMargin = parseInt(logoImage.css('margin-top'), 10) || 0;

        $('body').prepend('<div id="servicesMenu" style="display: none;">' +
                        '<div  id="servicesMenuArrowUp"></div>' +
                        '<div id="servicesMenuMain" style="float:left;"></div>' +
                        '</div>'
        );
        var servicesMenu= jQuery('#servicesMenu');
        jQuery('#servicesMenuArrowUp').css({
            width:0,
            height:0,
            borderLeft: '10px solid transparent',
            borderRight: '10px solid transparent',
            borderBottom:'10px solid #888',
            position: 'absolute',
            top:-12,
            left:logoImage.width()/2 - logoImageLeftMargin,
            margin:0
        });

        var services = {
            'rsl' : {
                name : {
                    'ru' : 'Официальный сайт',
                    'en' : 'Official site'
                },
                site : 'rsl.ru',
                url : 'https://rsl.ru',
                borderRadius: '5px 5px 0 0'
            },
            'vs' : {
                name : {
                    'ru' : 'Виртуальная справочная',
                    'en' : 'Virtual Reference'
                },
                site : 'rsl.ru/vs',
                url : 'https://www.rsl.ru/ru/4readers/virtualnaya-spravochnaya-sluzhba'
            },
            'search' : {
                name : {
                    'ru' : 'Поиск книг и документов',
                    'en' : 'Find books and documets'
                },
                site : 'search.rsl.ru',
                url : 'https://search.rsl.ru'
            },
            'udo' : {
                name : {
                    'ru' : 'Дополнительное обслуживание',
                    'en' : 'Additional service'
                },
                site : 'udo.rsl.ru',
                url : 'http://udo.rsl.ru'
            },
            'store' : {
                name : {
                    'ru' : 'Интернет-магазин услуг',
                    'en' : 'Services store'
                },
                site : 'store.rsl.ru',
                url : 'http://store.rsl.ru'
            },
            'presentation' : {
                name : {
                    'ru' : 'Виртуальные выставки',
                    'en' : 'Virtual exhibitions'
                },
                site : 'presentation.rsl.ru',
                url : 'http://presentation.rsl.ru',
                borderRadius: '0 0 5px 5px'
            }
        };

        var servicesHtmlSet = [];

        jQuery.each(services, function(i, service) {
              servicesHtmlSet.push('<a data-site="' + service.site + '" href="' + service.url + '" style="border-radius: ' + service.borderRadius + '">' + service.name[currentLanguage] + '</a>');
        });

        var servicesHtml = servicesHtmlSet.join('<div class="separator"></div>');

        servicesMenu.find('#servicesMenuMain').append(servicesHtml);

        servicesMenu.find('a').css({
            display: 'block',
            height: '50px',
            padding: '0 25px 0 15px',
            color: '#333',
            textDecoration: 'none',
            fontSize: '16px',
            fontFamily: 'tahoma, arial',
            lineHeight: '50px'
        });

        servicesMenu.find('.separator').css({ height: 0, borderTop : '1px solid #ccc' });

        var domainName = document.domain;
        if (domainName.indexOf('www.') != -1) {
            domainName = domainName.substring(4);
        }
        servicesMenu.find('a[data-site="' + domainName + '"]').css({color: '#B44E49'});
        //fix highlight for virtual reference
        if (document.location.href.indexOf('rsl.ru/' + currentLanguage + '/vs') != -1) {
            servicesMenu.find('a[data-site="rsl.ru/vs"]').css({color: '#B44E49'});
            servicesMenu.find('a[data-site="rsl.ru"]').css({color: '#333'});
        }

        var tooltipTopPosition = logoImage.position().top + logoImage.height() + logoImageTopMargin + 10;

        function hideTooltip() {
            servicesMenu.stop().animate({top : '-=25px', opacity : 0}, 200, function() { jQuery(this).hide(); });
        }

        function showTooltip() {
            servicesMenu.stop().css({opacity : 0, top : tooltipTopPosition - 25}).show().animate({top : '+=25px', opacity : 1}, 200);
        }

        servicesMenu.css({
            position: 'absolute',
            zIndex: 1000,
            top: tooltipTopPosition,
            margin: 0,
            left: logoImage.offset().left + logoImageLeftMargin - 3,
            border: '2px solid #ccc',
            borderRadius: '5px',
            boxShadow: '0px 13px 45px 0px rgba(0,0,0,0.31)',
            backgroundColor: '#fff',
            textAlign: 'left'
        });
        servicesMenu.find('#servicesMenuMain').css({
            backgroundColor: '#fff',
            borderRadius: '5px'
        });

        var hideMenuTimer = null;

        logoImage.on('mouseover', function() {
            if (servicesMenu.is(':visible')) {
                clearTimeout(hideMenuTimer);
            } else {
                servicesMenu.css({left: logoImage.offset().left + logoImageLeftMargin});
                jQuery('#servicesMenuArrowUp').css({left: logoImage.width()/2 - logoImageLeftMargin - 1});
                showTooltip();
            }

        }).mouseout(function(e) {
            hideMenuTimer = setTimeout(function() { hideTooltip(); }, 400)
        }).click(function() {
            location.href = jQuery(this).closest('a').attr('href');
        });

        servicesMenu.mouseenter(function() {
            clearTimeout(hideMenuTimer);
        }).mouseleave(function() {
            hideMenuTimer = setTimeout(function() { hideTooltip() }, 400)
        });

        servicesMenu.find('a').mouseover(function() {
            jQuery(this).css({background: '#ebebeb'});
        }).mouseout(function(e) {
            jQuery(this).css({background: 'none'});
        });

        //check if needed display service menu
        var isShowMenu = getCookie("show-menu");
        if (! isShowMenu) {
            logoImage.trigger('mouseover');
            hideMenuTimer = setTimeout(function() { hideTooltip(); }, 1500);
            setCookie("show-menu", '1', 60);
        }

    }

});
