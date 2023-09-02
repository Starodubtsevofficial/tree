function scrollToTop(speed) {
    $('body, html').animate({scrollTop: 0}, speed);
}

function scrollToElem(elem, speed) {
    if(document.getElementById(elem)) {
        var destination = jQuery('#' + elem).offset().top;
        if (destination < jQuery(window).scrollTop() + jQuery(window).height()) {
            destination -= jQuery('#header').height();
        }
        if (destination < 0) {
            destination = 0;
        }
        jQuery("html, body").animate({scrollTop: destination}, speed);
    }
}

function scrollModalToTop(modalSelector, speed) {
    $(modalSelector).animate({scrollTop: 0}, speed);
}

function scrollModalToBottom(modalSelector, speed) {
    var destination = $(modalSelector + ' .modal-content').height();
    $(modalSelector).animate({scrollTop: destination}, speed);
}

function modalPageUp(modalSelector) {
    var destination = $(modalSelector).scrollTop() - $(modalSelector).height();
    if (destination < 0) {
        destination = 0;
    }
    $(modalSelector).animate({scrollTop: destination}, 0);
}

function modalPageDown(modalSelector) {
    var destination = $(modalSelector).scrollTop() + $(modalSelector).height();
    if (destination > $(modalSelector + ' .modal-content').height()) {
        destination = $(modalSelector + ' .modal-content').height();
    }
    $(modalSelector).animate({scrollTop: destination}, 0);
}

var isMobile = {
    Android: function () {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function () {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function () {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function () {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function () {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function () {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};

// --------------------------------------------------------------
// -- Common alert messages function
// --------------------------------------------------------------

function showAlertMessage(msg, status) {
    if (ProjectData.system.messageTimer) {
        clearTimeout(ProjectData.system.messageTimer);
    }
    if (!$('#alert-msg').hasClass('alert-' + status)) {
        $('#alert-msg').removeClass('alert-success alert-warning alert-danger').addClass('alert-' + status);
    }
    $('#alert-msg').html(msg);
    $('#alert-msg').show();
    $('#alert-msg').css({
        top: ($(window).height() / 2) + 'px',
        opacity: '0.0',
    }).animate({
        top: '10px',
        opacity: '1.0',
    }, 500);
    ProjectData.system.messageTimer = setTimeout("$('#alert-msg').fadeOut(300)", 3000);
}

/**
 * Показать уведомление после выполнения действия.
 * Будет показано модальное окно с уведомлением, идентификатор которого был передан
 *
 * @param {string} identifier идентификатор модального окна, которое нужно показать
 */
function showNotificationAfterAction(identifier)
{
    let $currentModal = $('#' + identifier);

    if ($currentModal.length !== 0) {
        $currentModal.modal('show');
    }
}

$(document).on('afterReady', function () {

    $(document).on('show.bs.modal', function (e) {
        $('html').css('overflow-y', 'hidden');
    });

    $(document).on('hide.bs.modal', function (e) {
        $('html').css('overflow-y', '');
    });

    $('.col-sidebar:first').on('smooth-scroll', function (e, data) {
        // работает только для размеров экрана, на которых sidebar умещается слева
        if ($(window).width() < 992) {
            return;
        }
        var $sidebar = $(this);
        // проверка высоты sidebar'а: вмещается ли он в экран?
        if ($sidebar.height() > $(window).height() - $('#header').height() - $('#footer').height()) {
            // возможно, раньше он вмещался, но потом экран уменьшили
            if ($sidebar.css('margin-top')) {
                $sidebar.css('margin-top', 0);
            }
            return;
        }
        if (!$sidebar.attr('data-offset-initial')) {
            $sidebar.attr('data-offset-initial', $sidebar.offset().top);
        }
        if (data.top > $sidebar.attr('data-offset-initial') || $sidebar.css('margin-top')) {
            var m = data.top - $sidebar.attr('data-offset-initial');
            if (!data.direction) {
                m += $('#header').height();
            }
            m += 15;
            if (m < 10) {
                m = 0;
            }
            if (m >= 0) {
                $sidebar.css('margin-top', m > 0 ? m + 'px' : 0);
            }
        }
    });

    $(window).on('scroll touchmove', function (event) {

        // не будем задействовать функцию в случае незначительного отличия высоты окна и документа, т.е. минимального количества прокрутки
        if (event.type == 'scroll' && $(document).height() - $(window).height() < $('#header').height() + $('#footer').height()) {
            $('#header, #footer').css('transform', 'none');
            $('#footer').css('transform', 'none');
            $('#infinite-pagination').css('bottom', 50);
            $('.col-sidebar:first').trigger('smooth-scroll', {direction: false, top: 0});
            return;
        }

        if (ProjectData.system.scrollLastPosition === undefined) {
            ProjectData.system.scrollLastPosition = 0;
        }
        if (ProjectData.system.scrollLastDirection === undefined) {
            ProjectData.system.scrollLastDirection = false;
        }
        if (ProjectData.system.scrollDirectionPull === undefined) {
            ProjectData.system.scrollDirectionPull = 0;
        }

        // true = down, false = up
        var scrollDirection = $(window).scrollTop() > 20 && $(window).scrollTop() > ProjectData.system.scrollLastPosition;
        if (scrollDirection != ProjectData.system.scrollLastDirection) {
            ProjectData.system.scrollDirectionPull = 0;
        }
        ProjectData.system.scrollDirectionPull += Math.abs($(window).scrollTop() - ProjectData.system.scrollLastPosition);
        if (ProjectData.system.scrollDirectionPull > 20) {
            if (scrollDirection) {
                // По неясной причине в случае сокрытия этих объектов Opera зависает; но если убрать за пределы экрана, то всё ок
                $('#header, #footer').css('transform', 'translate3d(0, -200%, 0)');
                $('#footer').css('transform', 'translate3d(0, 200%, 0)');
                $('#searchquery').typeahead('close');
                $('#infinite-pagination').css('bottom', 2);
            } else {
                $('#header, #footer').css('transform', 'none');
                $('#footer').css('transform', 'none');
                $('#infinite-pagination').css('bottom', 50);
            }
        }

        ProjectData.system.scrollLastPosition = $(window).scrollTop();
        ProjectData.system.scrollLastDirection = scrollDirection;

        // прокрутка sidebar'а

        $('.col-sidebar:first').trigger('smooth-scroll', {
            direction: scrollDirection,
            top: $(window).scrollTop()
        });

    });

});


function startAdvancedSearch() {
    // подготовка запроса
    var request = '';
    var prevOp = '', prevVal = '';
    if ($('#adv-search-identity').val()) {
        // id+regnum+isbn+issn+storage_code
        var id = $('#adv-search-identity').val();
        if (id.indexOf(' ') != -1) {
            id = '"' + id + '"';
        }
        request = 'identity:(' + id + ')';
    } else {
        $('.adv-group').each(function () {
            var field = $(this).find('.adv-field').val();
            var mod = $(this).find('.adv-mod').val();
            var val = !$(this).find('.adv-val').prop('disabled') ? $(this).find('.adv-val').val() : '';
            var op = $(this).find('.adv-op').val();
            if (val) {
                if (prevVal) {
                    switch (prevOp) {
                        case 'AND':
                            request += ' AND ';
                            break;
                        case 'OR':
                            request += ' OR ';
                            break;
                        case 'NOT':
                            request += ' NOT ';
                            break;
                        default:
                            request += ' AND ';
                    }
                }
                request += field + ':(';
                if (mod == 'morph-off') {
                    request += '$';
                }
                if (mod == 'phrase') {
                    request += '"';
                }
                request += val.replace('(', '\\(').replace(')', '\\)');
                if (mod == 'prefix') {
                    request += '*';
                }
                if (mod == 'phrase') {
                    request += '"';
                }
                request += ')';
                prevVal = val;
            }
            prevOp = op;
        });
    }


    // запись запроса
    if (typeof($('#searchquery').typeahead) == 'function') {
        $('#searchquery').typeahead('val', request);
    } else {
        $('#searchquery').val(request);
    }

    if ((ProjectData.pages === undefined || ProjectData.pages.search == ProjectData.pages.current) && typeof(delayedRequest) == 'function') {
        delayedRequest();
    } else {
        $('#searchquery-form').trigger('submit');
    }
}

function startProfessionalSearch() {
    if (typeof($('#searchquery').typeahead) == 'function') {
        $('#searchquery').typeahead('val', $('#prof-query').val());
    } else {
        $('#searchquery').val($('#prof-query').val());
    }
    $('#searchquery-form').trigger('submit');
}

/**
 * Корректировка внешнего вида ссылки на добавление/удаление из "избранного" на основе данных этой ссылки
 *
 * @param {jQuery} $link ссылка
 */
function renderBookmarkLink($link)
{
    if ($link.data('in-favorites')) {
        $link.children('.rsl-favorite-add').removeClass('rsl-favorite-add').addClass('rsl-favorite-in');
        $link.children('.rsl-favorite-text-add').hide();
        $link.children('.rsl-favorite-text-in').show();
    } else {
        $link.children('.rsl-favorite-in').removeClass('rsl-favorite-in').addClass('rsl-favorite-add');
        $link.children('.rsl-favorite-text-add').show();
        $link.children('.rsl-favorite-text-in').hide();
    }
}

function checkBookmarks(documentIds, onSuccess) {
    if (!ProjectData.flags.isAuthenticated) {
        return;
    }

    $.ajax({
        url: ProjectData.urls.getBookmarks,
        type: 'POST',
        data: {docIds: documentIds},
        dataType: 'json',
        success: function (response) {
            var result = response.result;

            if (result.docIds) {
                for (var i in result.docIds) {
                    var $link = $('.js-favorite-link[data-id="' + result.docIds[i] + '"]');

                    $link.data('in-favorites', true);
                    renderBookmarkLink($link);
                }
            }

            if (typeof onSuccess === 'function') {
                onSuccess(result.docIds);
            }
        }
    });
}

function addBookmark(documentId)
{
    var $link = $('.js-favorite-link[data-id="' + documentId + '"]');

    if ($link.data('in-favorites')) {
        return;
    }

    if (!ProjectData.flags.isAuthenticated) {
        showAlertMessage(ProjectData.labels.favoritesNotAuthenticated, 'danger');
        return;
    }

    $.ajax({
        url: ProjectData.urls.addBookmark + '&docId=' + documentId,
        dataType: 'json',
        type: 'GET',
        success: function (response) {
            if (response.result) {
                $link.data('in-favorites', true);
                renderBookmarkLink($link);
                $('.search-subitem[data-id="' + documentId + '"]').data('in-favorites', true);
                showAlertMessage(ProjectData.labels.favoritesDocumentAdded, 'success');
            } else {
                showAlertMessage(ProjectData.labels.favoritesDocumentAddError, 'danger');
            }
        },
    });
}

function removeBookmark(documentId)
{
    var $link = $('.js-favorite-link[data-id="' + documentId + '"]');

    if (!$link.data('in-favorites')) {
        return;
    }

    if (!ProjectData.flags.isAuthenticated) {
        showAlertMessage(ProjectData.labels.favoritesNotAuthenticated, 'danger');
        return;
    }

    $.ajax({
        url: ProjectData.urls.removeBookmark + '&docId=' + documentId,
        type: 'GET',
        dataType: 'json',
        success: function (response) {
            if (response.result) {
                $link.data('in-favorites', false);
                renderBookmarkLink($link);
                $('.search-subitem[data-id="' + documentId + '"]').data('in-favorites', false);
                showAlertMessage(ProjectData.labels.favoritesDocumentRemoved, 'success');
            } else {
                showAlertMessage(ProjectData.labels.favoritesDocumentRemoveError, 'danger');
            }
        },
    });
}

$(document).on('afterReady', function () {
    $('#searchquery').on('keyup', function (event) {
        if (event.keyCode === 13) {
            $('#searchquery-form').trigger('submit');
        }
    });

    $('#searchquery').on('typeahead:selected typeahead:autocompleted', function (e, suggest) {
        $('#searchquery').typeahead('close');

        // Выбрана подсказка темы
        if (suggest.gscFullCode !== undefined) {
            if (typeof($('#searchquery').typeahead) == 'function') {
                $('#searchquery').typeahead('val', '');
            } else {
                $('#searchquery').val('');
            }

            if (ProjectData.pages.current != ProjectData.pages.search) {
                location.href = ProjectData.pages.search + '#t=' + encodeURIComponent(suggest.gscFullCode);
                return;
            }

            if ($('.gsc-checkbox').filter('[value="' + suggest.gscFullCode + '"]').length) {
                $('.gsc-checkbox').filter('[value="' + suggest.gscFullCode + '"]').prop("checked", true);
            } else {
                var inputTag = $(document.createElement('input')).addClass('gsc-checkbox').prop('type', 'checkbox');
                inputTag.prop('name', 'SearchFilterForm[gscThemes][]');
                inputTag.prop('id', 'gsc_' + $('.gsc-checkbox').length);
                inputTag.prop('checked', true);
                inputTag.val(suggest.gscFullCode);

                var label = '<label for="' + inputTag.attr('id') + '"><span></span><b>' + suggest.code + '</b> ' + suggest.name + '</label>';
                var tableCell = inputTag.wrap('<td>').parent().addClass('caption-cell').append(label);
                var tableString = tableCell.wrap('<tr>').parent();
                tableString.append('<td class="badge-cell"></td>');

                var table = $('#gsc-wr tbody').length ? $('#gsc-wr tbody') : $('#gsc-wr table');
                if (!table.length) {
                    table = $(document.createElement('table')).addClass('filter-table');
                    table.append(tableString);
                    $('#gsc-wr').html(table);
                } else {
                    table.append(tableString);
                }
            }
        }

        // Выбрана подсказка ГАК
        if (suggest.gakType !== undefined) {
            if (typeof($('#searchquery').typeahead) == 'function') {
                $('#searchquery').typeahead('val', '');
            } else {
                $('#searchquery').val('');
            }

            location.href = ProjectData.urls.gak + '#separator_id=' + suggest.id;
            return;
        }

        $('#searchquery-form').trigger('submit');
    });

    if (ProjectData.pages.current != ProjectData.pages.search) {
        $('#searchquery-form').on('submit', function (e) {
            e.preventDefault();

            var hash = 'q=' + encodeURIComponent($('#searchquery').val());
            var fulltext = $('#fulltext').prop('checked');
            hash += fulltext ? '&f=1' : '&f=0';
            location.href = ProjectData.pages.search + '#' + hash;
        });
    }

    $('#adv-search-identity').on('keyup', function (e) {
        $('.adv-field, .adv-mod, .adv-val, .adv-op').prop('disabled', !!this.value);
    });

    $('.adv-val').on('keyup', function (e) {
        $('#adv-search-identity').prop(
            'disabled',
            $('.adv-val').filter(function () { return !!this.value }).length > 0
        );
    });

    $('.adv-val, #adv-search-identity, #prof-query').on('keypress', function (e) {
        if (e.keyCode == 13) {
            $('#adv-search-start').trigger('click');
        }
    });

    $('#adv-search-start').click(function () {

        // пробуем определить, какая вкладка была активной
        var tabHash = $('#adv-search-tabs li.active a').attr('href');
        if (tabHash == '#tab_adv') {
            return startAdvancedSearch();
        } else if (tabHash == '#tab_prof') {
            return startProfessionalSearch();
        }

        // не вышло, смотрим, есть ли содержимое в строке профессионального поиска
        if ($('#prof-query').val()) {
            startProfessionalSearch();
        } else {
            startAdvancedSearch();
        }

    });

    $('#adv-search-reset').click(function (e) {
        e.preventDefault();
        advSearchReset();
    });

    $('.clear-btn').on('click', function () {
        var target = $(this).data('target');
        if (!target || !$(target).length) {
            return;
        }
        if (typeof($(target).typeahead) == 'function') {
            $(target).typeahead('val', '');
        } else {
            $(target).val('');
        }
        $(target).trigger('keypress');
    });

    $('body').on('click', '.js-download-unauth-check', function (e) {
        e.preventDefault();

        if (!ProjectData.flags.isAuthenticated) {
            showAlertMessage(ProjectData.labels.downloadNotAuthenticated, 'danger');
            return;
        }

        location.href = $(this).attr('href');
    });

    $('body').on('click', '.js-favorite-link', function (e) {
        e.preventDefault();

        var eventLink = $(this);
        var documentId = eventLink.attr('data-id');

        if (eventLink.hasClass('disabled')) {
            return;
        }

        if (eventLink.children('.rsl-favorite-in').length) {
            removeBookmark(documentId);
        } else {
            addBookmark(documentId);
        }
    });
});

function advSearchReset() {
    $('.adv-group').each(function (index) {
        $(this).find('.adv-field :nth-child(' + (index + 1) + ')').attr('selected', 'selected');
        $(this).find('.adv-mod').val('morph-on');
        $(this).find('.adv-val').val('');
        if ($(this).find('.adv-op').length) {
            $(this).find('.adv-op').val('AND');
        }
    });
    $('#adv-search-identity').val('');
    $('.adv-field, .adv-mod, .adv-val, .adv-op, #adv-search-identity').prop('disabled', false);
    $('#prof-query').val('');
}


function preloadImage(src, callback) {
    var obj = new Image();
    obj.src = src;
    if (obj.complete) {
        callback();
        obj.onload = function () {};
    } else {
        obj.onload = function () {
            callback();
            obj.onload = function () {};
        }
    }
}

function moreLink(obj, showLabel = ProjectData.labels.more, hideLabel = ProjectData.labels.hide) {
    var targetElem = obj.next().next();
    if (!targetElem) {
        return;
    }
    if (targetElem.is(':visible')) {
        obj.html(showLabel);
        targetElem.fadeOut(300);
    } else {
        obj.html(hideLabel);
        targetElem.fadeIn(300);
    }
}

function updatePagination(parentSelector, current, total) {
    if (!current || !total) {
        return;
    }
    current = Number(current);
    total = Number(total);
    var target = $(parentSelector + ' ul.pagination');
    if (!target.length) {
        return;
    }
    if (typeof(ProjectData.system.PaginationUrlPrefix) == 'undefined') {
        var paginationUrl = null;
        ProjectData.system.PaginationUrlPrefix = null;
    } else {
        var paginationUrl = ProjectData.system.PaginationUrlPrefix;
        paginationUrl += paginationUrl.indexOf('?') != -1 ? '&p=' : '?p=';
    }
    var html = '<li' + (current == 1 ? ' class="disabled"' : '') + '><a href="' + (paginationUrl ? paginationUrl + 1 : 'javascript://') + '" data-page="1" class="pagination-link">&laquo;</a></li>';
    var rangeMin = (current > 2 ? current - 2 : 1);
    var rangeMax = (current < total - 2 ? current + 2 : total);
    for (var i = rangeMin; i <= rangeMax; i++) {
        html += '<li' + (current == i ? ' class="active"' : '') + '><a href="' + (paginationUrl ? paginationUrl + i : 'javascript://') + '" data-page="' + i + '" class="pagination-link">' + i + '</a></li>';
    }
    html += '<li' + (current == total ? ' class="disabled"' : '') + '><a href="' + (paginationUrl ? paginationUrl + total : 'javascript://') + '" data-page="' + total + '" class="pagination-link">&raquo;</a></li>';
    target.html(html);
}
