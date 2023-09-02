ProjectData.system.states = {};

function initState() {
    for (var name in ProjectData.fields) {
        if (ProjectData.fields[name].type == 'checkboxlist') {
            ProjectData.system.states[name] = [];
            if (ProjectData.fields[name].defaultValue && !ProjectData.fields[name].ignoreAllChecked) {
                jQuery(ProjectData.fields[name]['class']).each(function () {
                    ProjectData.system.states[name].push(jQuery(this).val());
                });
            }
        } else {
            ProjectData.system.states[name] = ProjectData.fields[name].defaultValue !== undefined ? ProjectData.fields[name].defaultValue : '';
        }
    }
}

function saveState(currstate) {
    ProjectData.system.states = currstate !== undefined ? currstate : getState();
}

function stateToHash(currstate) {
    var data = [];
    for (var name in ProjectData.fields) {
        if (currstate[name] == ProjectData.fields[name].defaultValue) {
            // #new
            continue;
        }
        if (typeof(currstate[name]) == 'object') {
            for (var j = 0; j < currstate[name].length; j++) {
                if (currstate[name][j] !== undefined) {
                    data.push(ProjectData.fields[name].hashname + '=' + (ProjectData.fields[name].encode ? encodeURIComponent(currstate[name][j]) : currstate[name][j]));
                }
            }
        } else {
            if (currstate[name] !== undefined) {
                data.push(ProjectData.fields[name].hashname + '=' + (ProjectData.fields[name].encode ? encodeURIComponent(currstate[name]) : currstate[name]));
            }
        }
    }
    if (data.length) {
        if (ProjectData.system.updateHashFunc) {
            ProjectData.system.updateHashFunc(data.join('&'));
        } else {
            window.location.hash = data.join('&');
        }
    } else {
        history.pushState("", document.title, window.location.pathname);
    }
}

function hashToState() {
    var result = {};
    var hash = window.location.hash;
    hash = hash.substr(1).split('&');
    if (!hash.length) {
        return result;
    }

    for (var name in ProjectData.fields) {
        if (ProjectData.fields[name].type != 'checkboxlist' && ProjectData.fields[name].defaultValue !== undefined) {
            result[name] = ProjectData.fields[name].defaultValue;
        }
    }

    for (var i = 0; i < hash.length; i++) {
        tmp = hash[i].split('=');
        if (tmp.length != 2) {
            continue;
        }
        var currName = tmp[0], currVal = decodeURIComponent(tmp[1]);
        for (var name in ProjectData.fields) {
            if (ProjectData.fields[name].hashname != currName) {
                continue;
            }
            if (ProjectData.fields[name].type != 'checkboxlist') {
                if (ProjectData.fields[name].type=='checkbox') {
                    result[name] = currVal == 1 ? 1 : 0;
                } else {
                    result[name] = currVal;
                }
            } else {
                if (result[name] === undefined) {
                    result[name] = [];
                }
                result[name].push(currVal);
            }
            break;
        }
    }

    for (var name in ProjectData.fields) {
        if (result[name] === undefined && ProjectData.system.states[name]) {
            result[name] = ProjectData.system.states[name];
        }
    }

    return result;
}

function getState() {
    var result = {};
    for (var name in ProjectData.fields) {
        if (ProjectData.fields[name].type != 'checkboxlist') {
            var selector = ProjectData.fields[name].id !== undefined ? '#' + ProjectData.fields[name].id : 'input[name="' + name + '"]';
            if (ProjectData.fields[name].type == 'radio') {
                selector += ':checked';
            }
            var obj = $(selector);
            if (ProjectData.fields[name].type == 'checkbox') {
                result[name] = obj.prop('checked') ? 1 : 0;
            } else {
                result[name] = obj.val();
                if (ProjectData.fields[name].trim) {
                    result[name] = $.trim(result[name]);
                }
            }
        } else {
            result[name] = getCheckBoxArray(name, ProjectData.fields[name].ignoreAllChecked);
        }
    }
    return result;
}

/**
 * Установить значения фильтров согласно поисковому запросу документов
 *
 * @param {Object} currstate объект, который содержит данные применённых фильтров
 */
function setState(currstate) {
    for (var name in ProjectData.fields) {
        if (ProjectData.fields[name].type != 'checkboxlist') {
            var selector = ProjectData.fields[name].id !== undefined ? '#' + ProjectData.fields[name].id : 'input[name="' + name + '"]';
            var $obj = $(selector);
            switch (ProjectData.fields[name].type) {
                case 'checkbox':
                    $obj.prop('checked', currstate[name]);
                    break;
                case 'radio':
                    $obj.filter('[value="' + currstate[name] + '"]').prop('checked', true);
                    break;
                default:
                    switch (ProjectData.fields[name].plugin) {
                        case 'typeahead':
                            $obj.typeahead('val', currstate[name]);
                            break;
                        case 'datepicker':
                            if (currstate[name]) {
                                var filterDate = currstate[name].split('.').reverse().join('-');
                                $obj.datepicker('update', new Date(filterDate));
                            } else {
                                $obj.datepicker('update', '');
                            }
                            break;
                        default:
                            $obj.val(currstate[name]);
                    }
            }
        } else {
            if (!currstate[name].length) {
                clearCheckBoxList(name, ProjectData.fields[name].defaultValue);
            } else {
                clearCheckBoxList(name, false);
                for (var j = 0; j < currstate[name].length; j++) {
                    $('.' + ProjectData.fields[name]['class']).filter('[value="' + currstate[name][j] + '"]').prop('checked', true);
                }
            }
        }
    }
}

function getUpdated(currstate) {
    var res = [];
    if (currstate === undefined) {
        var currstate = getState();
    }
    for (var name in ProjectData.fields) {
        if (ProjectData.system.states[name] === undefined) {
            res.push(name);
            continue;
        }
        var cmp1, cmp2;
        cmp1 = typeof(ProjectData.system.states[name]) =='object' ? ProjectData.system.states[name].toString() : ProjectData.system.states[name];
        cmp2 = typeof(currstate[name]) =='object' ? currstate[name].toString() : currstate[name];
        if (cmp1 != cmp2) {
            res.push(name);
        }
    }
    return res;
}

function checkRequiredFields(currstate) {
    for (var name in ProjectData.fields) {
        if (ProjectData.fields[name].required && !currstate[name]) {
            return false;
        }
    }
    return true;
}

function checkSignificantFields(currstate) {
    for (var index in currstate.updatedFields) {
        if (!ProjectData.fields[currstate.updatedFields[index]].insignificant) {
            return true;
        }
    }
    return false;
}

/**
 * Сбросить значения чекбоксов поля формы к значению по умолчанию
 *
 * @param {string} name имя поля формы
 * @param {boolean} defaultValue значение, к которому будет сброшены чекбоксы
 */
function clearCheckBoxList(name, defaultValue) {
    var result = [];

    if (ProjectData.params.filterClass && ProjectData.fields[name]) {
        name = ProjectData.params.filterClass + '[' + name + ']';
    }

    $('input[name="' + name + '[]"]').each(function () {
        $(this).prop('checked', defaultValue);
    });

    return;
}

function getCheckBoxArray(name, ignoreAllChecked) {
    var result = [];
    var flag = false;
    if (ProjectData.params.filterClass && ProjectData.fields[name]) {
        name = ProjectData.params.filterClass + '[' + name + ']';
    }
    $('input[name="' + name + '[]"]').each(function () {
        if ($(this).prop('checked')) {
            result.push($(this).val());
        } else {
            flag = true;
        }
    });
    if (ignoreAllChecked && !flag) {
        result = [];
    }
    return result;
}

function getFormData(currstate) {
    var ajaxData = {};
    for (var i in currstate) {
        if (!currstate.hasOwnProperty(i)) {
            continue;
        }
        ajaxData[ProjectData.params.filterClass ? ProjectData.params.filterClass + '[' + i + ']' : i] = currstate[i];
    }
    return ajaxData;
}
