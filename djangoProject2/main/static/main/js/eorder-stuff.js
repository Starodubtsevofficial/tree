$(document).on('afterReady', function () {
    $('body').on('click', '.js-eorder-request-link', function (e) {
        if (!ProjectData.flags.isAuthenticated) {
            e.preventDefault();
            e.stopPropagation();
            showAlertMessage(ProjectData.labels.eorderNotAuthenticated, 'danger');

            return;
        }

        if (!ProjectData.flags.hasReaderNumber) {
            e.preventDefault();
            e.stopPropagation();
            showAlertMessage(ProjectData.labels.eorderHasntReaderNumber, 'danger');

            return;
        }

        if (!ProjectData.flags.hasActualReaderNumber) {
            e.preventDefault();
            e.stopPropagation();
            showAlertMessage(ProjectData.labels.eorderExpiredReaderNumber, 'danger');

            return;
        }
    });

    // код обработки электронного заказа через Планфикс
    $('body').on("click", ".js-eorder-favorite-link", function (e) {
        e.preventDefault();

        var documentId = $(e.target).data('documentid');

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
                    showAlertMessage(ProjectData.labels.favoritesDocumentAdded, 'success');
                } else {
                    showAlertMessage(ProjectData.labels.favoritesDocumentAddError, 'danger');
                }

                $('#eorderPlanfixModal').modal('hide');
            },
        });

        return false;
    });

    $('body').on("click", ".js-submit-eorder", function (e) {
        e.preventDefault();

        $('.js-submit-eorder').prop('disabled', true);
        $('.js-fragment-loader-img').removeClass('hidden');

        var $requestEorderModalForm = $('#requestEorderModalForm');

        var readingRoomId = parseInt($(e.target).data('room'), 10) || 0;

        if (readingRoomId > 0) {
            $('#eorderrequestform-readingroom').val(readingRoomId);
        }

        $.ajax({
            url: $requestEorderModalForm.attr('action'),
            type: 'POST',
            data: $requestEorderModalForm.serialize(),
            success: function (response) {
                $('.js-submit-eorder').prop('disabled', false);
                $('.js-fragment-loader-img').addClass('hidden');

                if (response.errors) {
                    $.each(response.errors, function(index, value) {
                        $requestEorderModalForm.yiiActiveForm(
                            'updateAttribute',
                            ProjectData.fieldIds.eorderForm[index],
                            value
                        );
                    });
                } else {
                    $('#eorderPlanfixModal').modal('hide');
                }

                showAlertMessage(response.message, response.success ? 'success' : 'danger');

                if (response.notificationAfterAction !== undefined && response.notificationAfterAction !== null) {
                    showNotificationAfterAction(response.notificationAfterAction);
                }
            },
            error: function(jqXHR, errorMessage) {
                $('.js-submit-eorder').prop('disabled', false);
                $('.js-fragment-loader-img').addClass('hidden');

                $('#eorderPlanfixModal').modal('hide');
                showAlertMessage(errorMessage, 'danger');
            }
        });

        return false;
    });

    // код обработки электронного заказа через Алеф
    $('body').on('click', '.js-eorder-get-order', function (e) {
        e.preventDefault();
        var $obj = $(this);
        var $loaderImg = $('.js-eorder-loader-img[data-index="' + $obj.attr('data-index') + '"]');

        $obj.addClass('disabled');
        $loaderImg.removeClass('hidden');

        $.ajax({
            url: ProjectData.urls.eorderRequestDetails,
            type: 'GET',
            data: {
                id: $obj.attr('data-id'),
                index: $obj.attr('data-index')
            },
            success: function (response) {
                $('#eorder-container').html(response);
            },
            error: function () {
                $obj.removeClass('disabled');
                $loaderImg.addClass('hidden');
            }
        });
    });

    $('body').on('click', '.js-eorder-confirm-order', function (e) {
        e.preventDefault();
        var $obj = $(this);
        var $loaderImg = $('#eorder-loader-img');

        $obj.addClass('disabled');
        $loaderImg.removeClass('hidden');

        $.ajax({
            url: ProjectData.urls.eorderConfirmOrder,
            type: 'POST',
            dataType: 'json',
            data: {
                id: $obj.attr('data-id'),
                index: $obj.attr('data-index')
            },
            success: function (response) {
                if (!response.error) {
                    $('#eorderModal').modal('hide');
                    showAlertMessage(ProjectData.labels.eorderConfirmed, 'success');
                } else {
                    $('#eorderModal .modal-content').html(response.content);
                }
            },
            error: function () {
                $obj.removeClass('disabled');
                $loaderImg.addClass('hidden');
            }
        });
    });

    $('body').on('click', '.js-eorder-access-check', function (e) {
        if (!ProjectData.flags.isAuthenticated) {
            e.preventDefault();
            e.stopPropagation();
            showAlertMessage(ProjectData.labels.eorderNotAuthenticated, 'danger');
            return;
        }

        if (!ProjectData.flags.hasReaderNumber) {
            e.preventDefault();
            e.stopPropagation();
            showAlertMessage(ProjectData.labels.eorderHasntReaderNumber, 'danger');
            return;
        }
    });

    $('body').on('change', 'input[name="eorderStorageCode"]', function (e) {
        var identifier = $(this).closest('div[data-id]').attr('data-id');
        var index = $(this).val();
        var $container = $('#eorderDetails');

        $('.js-eorder-confirm-order:first').attr('data-index', index);
        $container.text(ProjectData.labels.eorderDataIsUpdating);

        $.ajax({
            url: ProjectData.urls.eorderRequestDetails,
            type: 'GET',
            data: {
                id: identifier,
                index: index
            },
            success: function (response) {
                $container.html(response);
            },
            error: function () {
                $container.text(ProjectData.labels.eorderLoadDataError);
            }
        });
    });

    $('body').on('click', 'input[name="order-type"]', function () {
        $('.js-eorder-action-btn').addClass('hidden');
        $('.js-eorder-info-block').addClass('hidden');
        $('#eorder-reading-room-select-block').addClass('hidden');
        $('#eorder-storage-code-select-block').addClass('hidden');

        if ($(this).val() === 'digitized') {
            $('#eorder-favorite-btn').removeClass('hidden');
            $('#eorder-digitized-info-block').removeClass('hidden');
        } else if ($(this).val() === 'utility' || $(this).val() === 'periodical') {
            $('#eorder-selfservice-btn').removeClass('hidden');
            $('#eorder-selfservice-info-block').removeClass('hidden');
        } else {
            $('#eorder-confirm-btn').removeClass('hidden');
            $('#eorder-room-info-block').removeClass('hidden');
            $('#eorder-reading-room-select-block').removeClass('hidden');

            if ($('input[name="order-fund"]').length) {
                if ($('input[name="order-fund"]:checked').length === 0) {
                    $('#eorder-confirm-btn').attr("disabled", true);
                } else {
                    $('input[name="order-fund"]:checked').click();
                }
            } else {
                $('#eorder-storage-code-select-block').removeClass('hidden');
            }
        }
    });

    $('body').on('click', 'input[name="order-fund"]', function () {
        $('#eorder-room-time-block').text($(this).data('time'));
        $('#eorder-room-place-block').html(decodeURIComponent($(this).data('place')));
        $('#eorder-confirm-btn').attr("disabled", false);

        $('#eorder-storage-code-select-block').addClass('hidden');
        $('select[name="storage-code"] > option:not(:first)').remove();

        var codes = JSON.parse(decodeURIComponent($(this).data('codes')));

        if (codes && codes.length >= 2) {
            for (var i = 0; i < codes.length; i++) {
                $('select[name="storage-code"]').append('<option value="' + codes[i] + '">' + codes[i] + '</option>');
            }

            $('#eorder-storage-code-select-block').removeClass('hidden');
        }
    });

    $('body').on('loaded.bs.modal', '#newEorderModal', function () {
        if ($('input[name="order-type"]').length) {
            $('input[name="order-type"]:first').trigger('click');
        }

        if ($('input[name="order-fund"]').length) {
            $('#eorder-room-time-block').text('');
            $('#eorder-room-place-block').text('');
        }

        if (typeof $("#eorder-room-time-block").data('eorder-unavailable') !== 'undefined') {
            $('#eorder-confirm-btn').attr("disabled", true);
        }
    });

    $('body').on('submit', '#newEorderForm', function (e) {
        e.preventDefault();

        $('.js-eorder-loader-img').removeClass('hidden');
        $('#eorder-confirm-btn').attr("disabled", true);

        var $form = $(this);

        var storageCodeSelectedIndex = 0;

        if ($('select[name="storage-code"]').length) {
            storageCodeSelectedIndex = $('select[name="storage-code"]').prop('selectedIndex');
        }

        $.ajax({
            url: $form.attr('action'),
            type: $form.attr('method'),
            data: $form.serialize() + '&storage-code-selected-index=' + storageCodeSelectedIndex,
            dataType: 'json',
            success: function (response) {
                $('.js-eorder-loader-img').addClass('hidden');
                $('#eorder-confirm-btn').attr("disabled", false);

                if (response.success) {
                    showAlertMessage(response.message, 'success');

                    $('#newEorderModal').modal('hide');
                    showNotificationAfterAction('notificationForSuccessfulEorderModal');
                } else {
                    showAlertMessage(response.message, 'danger');
                }
            },
            error: function (xhr, message) { console.log(xhr); console.log(message);
                $('.js-eorder-loader-img').addClass('hidden');
                $('#eorder-confirm-btn').attr("disabled", false);

                showAlertMessage('Ошибка при оформлении электронного заказа!', 'danger');
            }
        });
    });

    $('body').on('click', '#eorder-favorite-btn', function (e) {
        e.preventDefault();

        addBookmark($(this).data('document-id'));

        $('#newEorderModal').modal('hide');
    });

    $('body').on('click', '.js-free-access-alert', function () {
        $('#freeAccessAlertLink').attr('href', $(this).data('url'));
    });
});
