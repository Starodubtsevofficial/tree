$(function () {

    var searchFields = [
        'title:',
        'author:',
        'content:',
        'keyword:',
        'note:',
        'theme:',
        'person_name:',
        'pub_place:',
        'pub_house:',
        'persona:',
        'series:',
        'storage_code:',
        'diss_council_code:',
        'regnum:',
        'invnum:',
        'kpnum:',
        'isbn:',
        'issn:',
        'bbk:',
        'id:',
        'col:',
        'siglafund:'
    ];

    for (var i in searchFields) {
        searchFields[i] = {displayString: '<b><i>' + searchFields[i] + '</i></b>', value: searchFields[i]};
    }

    var params = {
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 3,
    };

    var localEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: searchFields,
    });

    localEngine.initialize();

    var urlSeparator = ProjectData.urls.ajaxSuggest.indexOf('?') === -1 ? '?' : '&';
    var gscUrlSeparator = ProjectData.urls.searchGscThemes.indexOf('?') === -1 ? '?' : '&';
    var gakUrlSeparator = ProjectData.urls.searchGakSeparator.indexOf('?') === -1 ? '?' : '&';

    params.remote = ProjectData.urls.ajaxSuggest + urlSeparator + "dict=author&term=%QUERY";
    var authorEngine = new Bloodhound(params);
    authorEngine.initialize();

    params.remote = ProjectData.urls.ajaxSuggest + urlSeparator + "dict=title&term=%QUERY";
    var titleEngine = new Bloodhound(params);
    titleEngine.initialize();

    params.remote = ProjectData.urls.ajaxSuggest + urlSeparator + "dict=theme%2Bkeyword&term=%QUERY";
    var contentEngine = new Bloodhound(params);
    contentEngine.initialize();

    var themeEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('gscName'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 3,
        remote: {
            url: ProjectData.urls.searchGscThemes + gscUrlSeparator + "query=%QUERY",
            filter: function(response) {
                var items = response.resultItem;
                var transformItems = [];
                $.each(items, function(index, item) {
                    var code = item['code'];
                    var name = '';
                    var gscName = '';
                    var gscFullCode = '';

                    if (Array.isArray(item.gsk)) {
                        var gskNamesCount = item.gsk.length;
                        $.each(item.gsk, function(i, value) {
                            if (i != 0) {
                                gscFullCode += '|';
                                gscName += ' -- ';
                            }
                            gscFullCode += value['code'];
                            gscName += value['name'];
                            if (i == gskNamesCount - 1) {
                                name = value['name'];
                            }
                        });
                    } else {
                        gscName = item.gsk.name;
                        gscFullCode = item.gsk.code;
                    }
                    transformItems.push({
                        code: code,
                        name: name,
                        gscName: gscName,
                        gscFullCode: gscFullCode
                    });
                });
                return transformItems;
            }
        }
    });
    themeEngine.initialize();

    var gakEngine = new Bloodhound({
        datumTokenizer: Bloodhound.tokenizers.obj.whitespace('value'),
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        limit: 3,
        remote: {
            url: ProjectData.urls.searchGakSeparator + gakUrlSeparator + "query=%QUERY",
        }
    });
    gakEngine.initialize();

    $('#searchquery').typeahead({
        hint: true,
        highlight: true,
        minLength: 2,
    }, {
        name: 'field-suggest',
        displayKey: 'value',
        valueKey: 'value',
        source: localEngine.ttAdapter(),
    }, {
        name: 'author-suggest',
        displayKey: 'searchQuery',
        valueKey: 'searchQuery',
        source: authorEngine.ttAdapter(),
        templates: {
          header: '<h5 class="rsl-typeahead-header">' + ProjectData.labels['author'] + '</h5>',
          suggestion: function(item) { return item['value']; }
        },
    }, {
        name: 'title-suggest',
        displayKey: 'searchQuery',
        valueKey: 'searchQuery',
        source: titleEngine.ttAdapter(),
        templates: {
            header: '<h5 class="rsl-typeahead-header">' + ProjectData.labels['title'] + '</h5>',
            suggestion: function(item) { return item['value']; }
        },
    }, {
        name: 'theme-suggest',
        displayKey: 'code',
        valueKey: 'code',
        source: themeEngine.ttAdapter(),
        templates: {
            header: '<h5 class="rsl-typeahead-header">' + ProjectData.labels.gscTheme + '</h5>',
            suggestion: function(item) {
                return '<div class="row"><div class="col-xs-3 col-lg-2" style="word-wrap: break-word;">' + item['code'] + '</div>' + '<div class="col-xs-9 col-lg-10">' + item['gscName'] + '</div></div>';
            }
        }
    }, {
        name: 'gak-suggest',
        displayKey: 'id',
        valueKey: 'id',
        source: gakEngine.ttAdapter(),
        templates: {
            header: '<h5 class="rsl-typeahead-header">' + ProjectData.labels.gak + '</h5>',
            suggestion: function(item) { return item['name']; }
        }
    }, {
        name: 'content-suggest',
        displayKey: 'searchQuery',
        valueKey: 'searchQuery',
        source: contentEngine.ttAdapter(),
        templates: {
            header: '<h5 class="rsl-typeahead-header">' + ProjectData.labels['content'] + '</h5>',
            suggestion: function(item) { return item['value']; }
        },
    });

    $('#prof-query').typeahead({
        hint: true,
        highlight: true,
        minLength: 1,
    }, {
        name: 'profsuggest',
        displayKey: 'value',
        valueKey: 'value',
        source: localEngine.ttAdapter()
    });

    $('#collapse-link').on('click', function(e){
        e.preventDefault();
        var target = $('#' + $(this).data('target'));
        if (!target.length) return;
        if (target.is(':visible')) {
            target.fadeOut(300);
            $(this).text(ProjectData.labels.show);
        } else {
            target.fadeIn(300);
            $(this).text(ProjectData.labels.hide);
        }
    });

    $('.js-prof-field').on('click', function(e){
        e.preventDefault();
        if ($('#prof-query').val()) {
            $('#prof-query').typeahead('val', $('#prof-query').val() + ' AND ' + $(this).text());
        } else {
            $('#prof-query').typeahead('val', $(this).text());
        }
    });

    function completeByEnd(e) {
        if (e.keyCode == 35) {
            var ttWr = $(this).closest('.twitter-typeahead');
            if (ttWr.find('.tt-suggestion.tt-cursor:first').length) {
                var suggestion = ttWr.find('.tt-dataset-field-suggest .tt-suggestion.tt-cursor:first').text();
            } else {
                var suggestion = ttWr.find('.tt-dataset-field-suggest .tt-suggestion:first').text();
            }
            if (suggestion) {
                $(this).typeahead('val', suggestion);
                $(this).typeahead('close');
            }
        }
    }

    $('#searchquery, #prof-query').on('typeahead:opened', function(){
        $(this).on('keyup', completeByEnd);
    });

    $('#searchquery, #prof-query').on('typeahead:closed', function(){
        $(this).off('keyup', completeByEnd);
    });

    $('.js-login').on('click', function(e){
        e.preventDefault();
        if (ProjectData.pages.login == ProjectData.pages.current) {
            return;
        }
        var url = $(this).attr('href');
        url += (url.indexOf('?') != -1 ? '&' : '?') + 'return=' + encodeURIComponent(location.href);
        location.href = url;
    });

    $('.js-logout').on('click', function(e){
        e.preventDefault();
        if (ProjectData.pages.logout == ProjectData.pages.current) {
            return;
        }
        var url = $(this).attr('href');
        url += (url.indexOf('?') != -1 ? '&' : '?') + 'return=' + encodeURIComponent(location.href);
        $(this).attr('href', url);
    });

    $('body').on('change', 'input[id="needTableOfContents"]', function (e) {
        $('.field-fragmentrequestform-pagesorchapter').toggle(!$("#needTableOfContents").prop('checked'));
    });

    $('body').on('change', 'input[id="acceptAgreement"]', function (e) {
        $('.js-submit-fragment').attr("disabled", !$("#acceptAgreement").prop('checked') || !$("#acceptPersonalDataProcess").prop('checked'));
    });

    $('body').on('change', 'input[id="acceptPersonalDataProcess"]', function (e) {
        $('.js-submit-fragment').attr("disabled", !$("#acceptAgreement").prop('checked') || !$("#acceptPersonalDataProcess").prop('checked'));
    });

    // Инициализация подсказок на странице
    $("[data-toggle='tooltip']").tooltip();
});
