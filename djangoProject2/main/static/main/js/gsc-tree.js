$(document).ready(function() {
    function openNodes(gscIdsPath, index, startSearchAfterChecked = false) {
        // последний загруженный узел, выставляем чекбокс
        if (index === gscIdsPath.length - 1) {
            $('#gsc-tree').jstree('check_node', gscIdsPath[index]);

            if (startSearchAfterChecked) {
                $('#gsc-select-btn').trigger('click');
            }

            return false;
        }

        // передана несуществующая тема
        if ($('#gsc-tree').jstree(true).get_node(gscIdsPath[index]) === false) {
            return false;
        }

        $('#gsc-tree').jstree(true).open_node(gscIdsPath[index], function() {
            index++;
            openNodes(gscIdsPath, index, startSearchAfterChecked);
        });
    }

    function switchToTree() {
        $('#gsc-modal-header').text(ProjectData.labels.gscModalDefaultHeader);
        $('#gsc-tree').removeClass('hidden');
        $('[data-group="gscSearchMode"]').addClass('hidden');
        $('#gsc-tree-form').trigger('reset');
        $('#gsc-search-results').empty();
    }

    function switchToSearch(type) {
        $('#gsc-modal-header').text(ProjectData.labels.gscModalSearchHeader);
        $('#gsc-search-results').empty();

        $('[data-group="gscSearchMode"]').addClass('hidden');
        $('#gsc-tree').addClass('hidden');

        switch (type) {
            case 'haveResults':
                $('#gsc-modal-header').text(ProjectData.labels.gscModalSearchResultsHeader);
                $('#gsc-search-results-wrapper').removeClass('hidden');
                break;
            case 'noResults':
                $('#gsc-search-no-results').removeClass('hidden');
                break;
            case 'waiting':
                $('#gsc-search-loading').removeClass('hidden');
                break;
        }
    }

    function initializeTree(functionToExecuteOnReadyState) {
        // Если дерево уже загружено, то не нужно повторно инициализировать события
        if ($('#gsc-tree').jstree(true)) {
            // Убираем выделение со всех элементов дерева (предполагается, что функция-обработчик,
            // передаваемая как параметр, позаботится о том, чтобы отметить нужные элементы)
            $('#gsc-tree').jstree(true).uncheck_all();

            if (typeof functionToExecuteOnReadyState === 'function') {
                functionToExecuteOnReadyState();
            }

            return;
        }

        $('#gsc-tree').jstree({
            'plugins': ['checkbox', 'wholerow'],
            'core': {
                'themes': {
                    'icons': false
                },
                'check_callback': false,
                'data': {
                    'url': '/ru/front-api/general-systematic-catalog-tree',
                    'dataType': 'JSON',
                    'data': function (node) {
                        // если первичная загрузка и узла не выбрано
                        if (node.id === '#') {
                            return {};
                        } else {
                            return { 'code': node.id };
                        }
                    },
                    // преобразуем ответ от API в правильный формат для дерева
                    'dataFilter': function(responseStr) {
                        var response = jQuery.parseJSON(responseStr);

                        if (!response.success) {
                            showAlertMessage('Не удалось загрузить узел дерева', 'danger');
                            return [];
                        }

                        var gsc = [];

                        $.each(response.data.children, function (index, value) {
                            gsc.push({
                                'id': value.code,
                                'idInternal': value.codeInternal,
                                'text': '<strong>' + value.code + '</strong> ' + value.name,
                                'children': value.hasChildren
                            });
                        });

                        return JSON.stringify(gsc);
                    }
                }
            },
            // настраиваем поведение чекбоксов
            'checkbox': {
                'keep_selected_style': false,
                'three_state': false,
                'tie_selection': false
            }
        })
            .on('check_node.jstree uncheck_node.jstree', function (e, data) { // событие нажатия чекбокса и снятия
                $('#gsc-tree').trigger('app:nodeStateChanged', data.node);
            })
            .on('ready.jstree', function (e) { // событие когда дерево загружено
                //сбрасываем все чекбоксы
                $('#gsc-tree').jstree(true).uncheck_all();

                if (typeof functionToExecuteOnReadyState === 'function') {
                    functionToExecuteOnReadyState();
                }
            });
    }

    $('#gsc-openmodal-btn').on('click', function () {
        var state = getState();
        var selectedGscItems = state['gscThemes'];
        initializeTree(function() {
            $.each(selectedGscItems, function(index, gscFullPath) {
                var gscIdsPath = gscFullPath.split("|");
                if (gscIdsPath.length) {
                    openNodes(gscIdsPath, 0);
                }
            });
        });
    });

    $('#gscModal').on('hide.bs.modal', function () {
        if (typeof delayedFilterRequest === 'function') {
            delayedFilterRequest();
        }
    });

    $('#gscModal').on('click', '.js-gsc-item', function (e) {
        e.preventDefault();

        switchToTree();

        var gscIdsPath = $(this).attr('data-code').split("|");

        if (gscIdsPath.length) {
            initializeTree(function () {
                openNodes(gscIdsPath, 0, true);
            });
        }
    });

    $('#gsc-tree').on('app:checkedOutside', function (e, data) {
        var gscElements = data.code.split('|');

        initializeTree(function () {
            if (data.checked) {
                openNodes(gscElements, 0);
            } else {
                $('#gsc-tree').jstree('uncheck_node', gscElements[gscElements.length - 1]);
            }
        });
    });

    $('#gsc-tree-form').on('submit', function (e) {
        e.preventDefault();

        var query = $('#gsc-search').val().trim();

        if (!query) {
            switchToTree();

            return;
        }

        switchToSearch('waiting');

        $.ajax({
            url: $(this).attr('action'),
            data: $(this).serialize(),
            dataType: 'json',
            success: function (response) {
                if (!response.resultItem || !response.resultItem.length) {
                    switchToSearch('noResults');

                    return;
                }

                switchToSearch('haveResults');

                for (var i = 0; i < response.resultItem.length; i++) {
                    var currentItem = response.resultItem[i];

                    var codes = [];
                    var labels = [];

                    for (var j = 0; j < currentItem.gsk.length; j++) {
                        codes.push(currentItem.gsk[j].code);
                        labels.push(currentItem.gsk[j].name);
                    }

                    var lastIndex = labels.length - 1;

                    labels[lastIndex] = '<a href="#" class="js-gsc-item" data-code="' + codes.join('|') + '">'
                        + labels[lastIndex]
                        + '</a>';

                    var $row = $(
                        '<div class="row mt20">'
                        + '<div class="col-xs-3 col-lg-2">' + currentItem.code + '</div>'
                        + '<div class="col-xs-9 col-lg-10">' + labels.join(' -- ') + '</div>'
                        + '</div>'
                    );

                    $('#gsc-search-results').append($row);
                }
            }
        });
    });

    $('#gsc-clear-btn').on('click', function () {
        switchToTree();
        initializeTree(function () {
            // сбрасываем все чекбоксы
            $('#gsc-tree').jstree(true).uncheck_all();
        });
        $('#gscModal').trigger('app:clearDone');
    });
});
