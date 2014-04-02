///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var TasksProfile;
(function (TasksProfile) {
    var AjaxCargo = (function () {
        function AjaxCargo() {
        }
        return AjaxCargo;
    })();
    TasksProfile.AjaxCargo = AjaxCargo;

    var AjaxCargoList = (function () {
        function AjaxCargoList() {
        }
        return AjaxCargoList;
    })();
    TasksProfile.AjaxCargoList = AjaxCargoList;

    var TasksProfileController = (function () {
        function TasksProfileController() {
            this.application = null;
            this.parent = null;
            this.cargoData = null;
            this.errorData = null;
            this.currentCargo = null;
            this.currentDeleteId = 0;
            this.cityTmpData1 = null;
            this.cityTmpData2 = null;
            this.cityBound1 = false;
            this.cityBound2 = false;
        }
        // вызовы от IApplication
        TasksProfileController.prototype.onLoad = function (app, parent, state) {
            TasksProfile.__currentTasksProfile.application = app;
            TasksProfile.__currentTasksProfile.parent = parent;
            Dictionary.__currDictionary.init(app, TasksProfile.__currentTasksProfile);

            // цепляем обработчики событий
            $("#i-ctrl-tasks-form-submit-btn").click(TasksProfile.__currentTasksProfile.onSubmitButtonClick);
            $("#i-ctrl-tasks-form-cancel-btn").click(TasksProfile.__currentTasksProfile.onCancelButtonClick);

            $("#i-ctrl-tasks-form-from-city-txt").focus(TasksProfile.__currentTasksProfile.onCity1Focus);
            $("#i-ctrl-tasks-form-to-city-txt").focus(TasksProfile.__currentTasksProfile.onCity2Focus);

            $("#i-ctrl-tasks-form-from-city-delete-btn").click(TasksProfile.__currentTasksProfile.onCity1Delete);
            $("#i-ctrl-tasks-form-to-city-delete-btn").click(TasksProfile.__currentTasksProfile.onCity2Delete);

            $("#i-ctrl-tasks-list-add-btn").click(TasksProfile.__currentTasksProfile.onAddButtonClick);

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("cargotype");
            Dictionary.__currDictionary.queryDictData("packingtype");
            Dictionary.__currDictionary.queryDictData("cargoadrtype");
            Dictionary.__currDictionary.queryDictData("bodytype");
            Dictionary.__currDictionary.queryDictData("loadingtype");

            // получаем данные
            TasksProfile.__currentTasksProfile.queryData();
        };

        TasksProfileController.prototype.onUpdate = function (state) {
        };

        TasksProfileController.prototype.onShow = function (state) {
            Dictionary.__currDictionary.init(TasksProfile.__currentTasksProfile.application, TasksProfile.__currentTasksProfile);
            TasksProfile.__currentTasksProfile.queryData();
        };

        TasksProfileController.prototype.onHide = function (state) {
        };

        // вызовы от child IComponent
        TasksProfileController.prototype.dataLoaded = function (sender) {
        };

        TasksProfileController.prototype.dataReady = function (sender) {
        };

        TasksProfileController.prototype.dataError = function (sender, error) {
        };

        // вызовы от DictController
        TasksProfileController.prototype.dictDataReady = function (name) {
            if ("cargotype" == name) {
                TasksProfile.__currentTasksProfile.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            } else if ("packingtype" == name) {
                TasksProfile.__currentTasksProfile.drawPackingType(Dictionary.__currDictionary.packingTypes);
            } else if ("cargoadrtype" == name) {
                TasksProfile.__currentTasksProfile.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            } else if ("bodytype" == name) {
                TasksProfile.__currentTasksProfile.drawBodyType(Dictionary.__currDictionary.bodyTypes);
            } else if ("loadingtype" == name) {
                TasksProfile.__currentTasksProfile.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                TasksProfile.__currentTasksProfile.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }
        };

        TasksProfileController.prototype.onCitySelected = function (city) {
            if (true == TasksProfile.__currentTasksProfile.cityBound1) {
                TasksProfile.__currentTasksProfile.cityTmpData1 = city;
            } else {
                TasksProfile.__currentTasksProfile.cityTmpData2 = city;
            }

            TasksProfile.__currentTasksProfile.applyCityData();
        };

        TasksProfileController.prototype.onCitySelectedAbort = function () {
            TasksProfile.__currentTasksProfile.applyCityData();
        };

        TasksProfileController.prototype.onAddButtonClick = function (event) {
            TasksProfile.__currentTasksProfile.showEditForm(true);
        };

        TasksProfileController.prototype.showEditForm = function (visible) {
            if (visible) {
                if (null != TasksProfile.__currentTasksProfile.currentCargo) {
                    // заполняем форму данными
                    var c = TasksProfile.__currentTasksProfile.currentCargo;

                    $("#i-ctrl-tasks-form-name-txt").val(c.name);
                    $("#i-ctrl-tasks-form-cargo-type-select").val(c.cargoTypeId);
                    $("#i-ctrl-tasks-form-description-txt").val(c.description);
                    $("#i-ctrl-tasks-form-cargo-adr-type-select").val(c.cargoADRTypeId);
                    $("#i-ctrl-tasks-form-body-type-select").val(c.bodyTypeId);
                    $("#i-ctrl-tasks-form-weight-txt").val(c.weight);
                    $("#i-ctrl-tasks-form-value-txt").val(c.value);
                    $("#i-ctrl-tasks-form-packing-type-select").val(c.packingTypeId);
                    $("#i-ctrl-tasks-form-num-of-packages-txt").val(c.numOfPackages);
                    $("#i-ctrl-tasks-form-from-address-txt").val(c.addr1);
                    $("#i-ctrl-tasks-form-loading-type-select").val(c.loadingTypeId1);
                    $("#i-ctrl-tasks-form-to-address-txt").val(c.addr2);
                    $("#i-ctrl-tasks-form-unloading-type-select").val(c.loadingTypeId2);
                    $("#i-ctrl-tasks-form-ready-date-txt").val(c.readyDate);
                    $("#i-ctrl-tasks-form-cost-txt").val(c.cost);
                    $("#i-ctrl-tasks-form-contacts-txt").val(c.contacts);

                    TasksProfile.__currentTasksProfile.cityTmpData1 = c.city1;
                    TasksProfile.__currentTasksProfile.cityTmpData2 = c.city2;
                    TasksProfile.__currentTasksProfile.applyCityData();
                }
            } else {
                TasksProfile.__currentTasksProfile.currentCargo = null;
                TasksProfile.__currentTasksProfile.clearForm();
            }

            TasksProfile.__currentTasksProfile.switchFormVisibility(visible);
        };

        TasksProfileController.prototype.switchFormVisibility = function (visible) {
            if (visible) {
                $("#i-ctrl-tasks-edit-form-container").removeClass("hidden").addClass("block");
                $("#i-ctrl-tasks-list-container").removeClass("block").addClass("hidden");
            } else {
                $("#i-ctrl-tasks-edit-form-container").removeClass("block").addClass("hidden");
                $("#i-ctrl-tasks-list-container").removeClass("hidden").addClass("block");
            }
        };

        TasksProfileController.prototype.applyCityData = function () {
            var city = null;
            var fullName = "";

            if (null != TasksProfile.__currentTasksProfile.cityTmpData1) {
                city = TasksProfile.__currentTasksProfile.cityTmpData1;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-from-city-txt").val(fullName);

            fullName = "";

            if (null != TasksProfile.__currentTasksProfile.cityTmpData2) {
                city = TasksProfile.__currentTasksProfile.cityTmpData2;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-to-city-txt").val(fullName);
        };

        // обновление данных с сервера
        TasksProfileController.prototype.uploadData = function () {
            TasksProfile.__currentTasksProfile.cargoData = null;
            TasksProfile.__currentTasksProfile.errorData = null;
            TasksProfile.__currentTasksProfile.getData();
            //__currentTasksProfile.queryData();
        };

        TasksProfileController.prototype.queryData = function () {
            if (null == TasksProfile.__currentTasksProfile.cargoData && null == TasksProfile.__currentTasksProfile.errorData) {
                TasksProfile.__currentTasksProfile.getData();
            } else if (null != TasksProfile.__currentTasksProfile.errorData) {
                TasksProfile.__currentTasksProfile.parent.dataError(TasksProfile.__currentTasksProfile, TasksProfile.__currentTasksProfile.errorData);
            } else {
                TasksProfile.__currentTasksProfile.parent.dataReady(TasksProfile.__currentTasksProfile);
            }
        };

        TasksProfileController.prototype.getData = function () {
            $.ajax({
                type: "GET",
                url: TasksProfile.__currentTasksProfile.application.getFullUri("api/tasks"),
                success: TasksProfile.__currentTasksProfile.onAjaxGetTasksDataSuccess,
                error: TasksProfile.__currentTasksProfile.onAjaxGetTasksDataError
            });
        };

        TasksProfileController.prototype.onAjaxGetTasksDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            TasksProfile.__currentTasksProfile.errorData = JSON.parse(jqXHR.responseText);
            TasksProfile.__currentTasksProfile.parent.dataError(TasksProfile.__currentTasksProfile, TasksProfile.__currentTasksProfile.errorData);

            if (2 == parseInt(TasksProfile.__currentTasksProfile.errorData.code))
                TasksProfile.__currentTasksProfile.application.checkAuthStatus();
        };

        TasksProfileController.prototype.onAjaxGetTasksDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            TasksProfile.__currentTasksProfile.cargoData = data.data;

            // помещаем данные в контролы
            TasksProfile.__currentTasksProfile.drawTasksList();

            if (false == TasksProfile.__currentTasksProfile.isComponentLoaded) {
                TasksProfile.__currentTasksProfile.isComponentLoaded = true;
                TasksProfile.__currentTasksProfile.parent.dataLoaded(TasksProfile.__currentTasksProfile);
            } else {
                TasksProfile.__currentTasksProfile.parent.dataReady(TasksProfile.__currentTasksProfile);
            }
        };

        TasksProfileController.prototype.drawTasksList = function () {
            TasksProfile.__currentTasksProfile.clearTasksList();

            var tbody = $("#i-ctrl-tasks-table > tbody");

            if (1 > TasksProfile.__currentTasksProfile.cargoData.cargo.length) {
                var rowEmpty = $("#i-ctrl-tasks-table-row-empty-template").clone();
                rowEmpty.removeAttr("id").removeClass("hidden").appendTo(tbody);
            } else {
                var rowTempl = $("#i-ctrl-tasks-table-row-template");

                for (var i = 0; i < TasksProfile.__currentTasksProfile.cargoData.cargo.length; i++) {
                    var cargo = TasksProfile.__currentTasksProfile.cargoData.cargo[i];
                    var row = rowTempl.clone();
                    row.removeAttr("id").removeClass("hidden");

                    row.attr("data-id", cargo.id);
                    $("td.c-ctrl-tasks-table-cell-num", row).text(cargo.id);
                    $("td.c-ctrl-tasks-table-cell-name", row).text(cargo.name);

                    if (null != Dictionary.__currDictionary.cargoTypes) {
                        var typeName = Dictionary.__currDictionary.getNameById("cargotype", cargo.cargoTypeId);
                        $("td.c-ctrl-tasks-table-cell-type", row).text(typeName);
                    }

                    $("td.c-ctrl-tasks-table-cell-weight", row).text(cargo.weight);
                    $("td.c-ctrl-tasks-table-cell-value", row).text(cargo.value);
                    $("td.c-ctrl-tasks-table-cell-from", row).text(cargo.city1.name);
                    $("td.c-ctrl-tasks-table-cell-to", row).text(cargo.city2.name);
                    $("td.c-ctrl-tasks-table-cell-distance", row).text(cargo.distance);
                    $("td.c-ctrl-tasks-table-cell-ready-date", row).text(cargo.readyDate);
                    $("td.c-ctrl-tasks-table-cell-cost", row).text(cargo.cost);

                    // привязываем обработчики на кнопки
                    $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-edit", row).attr("data-id", cargo.id).click(TasksProfile.__currentTasksProfile.onTaskEditClick);
                    $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-delete", row).attr("data-id", cargo.id).click(TasksProfile.__currentTasksProfile.onTaskDeleteClick);

                    row.appendTo(tbody);
                }
            }
        };

        /*safeUnbindEvent(id: string, handler: any): void
        {
        var coll: JQuery = $(id);
        
        if (0 < coll.length)
        coll.unbind(handler);
        }*/
        TasksProfileController.prototype.clearTasksList = function () {
            TasksProfile.__currentTasksProfile.currentDeleteId = 0;

            var row = $("#i-ctrl-tasks-table > tbody > tr");

            // удаляем все обработчики событий
            $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-edit", row).unbind("click", TasksProfile.__currentTasksProfile.onTaskEditClick);
            $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-delete", row).unbind("click", TasksProfile.__currentTasksProfile.onTaskDeleteClick);
            $("#i-ctrl-tasks-table tbody button.c-ctrl-tasks-table-row-delete-confirm-button").unbind("click", TasksProfile.__currentTasksProfile.onTaskDeleteConfirmClick);
            $("#i-ctrl-tasks-table tbody button.c-ctrl-tasks-table-row-delete-cancel-button").unbind("click", TasksProfile.__currentTasksProfile.onTaskDeleteCancelClick);

            // удаляем все строки таблицы
            row.remove();
        };

        TasksProfileController.prototype.onTaskEditClick = function (event) {
            TasksProfile.__currentTasksProfile.removeDeleteConfirmRow();

            var ctrl = $(event.delegateTarget);

            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));
            var id = parseInt(ctrl.attr("data-id"));
            TasksProfile.__currentTasksProfile.currentCargo = TasksProfile.__currentTasksProfile.getCargoById(id);
            TasksProfile.__currentTasksProfile.showEditForm(true);
        };

        TasksProfileController.prototype.onTaskDeleteClick = function (event) {
            TasksProfile.__currentTasksProfile.removeDeleteConfirmRow();

            var ctrl = $(event.delegateTarget);
            var curRow = ctrl.parent().parent();
            var id = parseInt(ctrl.attr("data-id"));
            TasksProfile.__currentTasksProfile.currentDeleteId = id;

            var rowConfirm = $("#i-ctrl-tasks-table-row-confirm-template").clone();
            rowConfirm.removeAttr("id").removeClass("hidden");

            $("button.c-ctrl-tasks-table-row-delete-confirm-button", rowConfirm).click(TasksProfile.__currentTasksProfile.onTaskDeleteConfirmClick);
            $("button.c-ctrl-tasks-table-row-delete-cancel-button", rowConfirm).click(TasksProfile.__currentTasksProfile.onTaskDeleteCancelClick);

            rowConfirm.insertAfter(curRow);
        };

        TasksProfileController.prototype.getCargoById = function (id) {
            var v = null;

            if (null != TasksProfile.__currentTasksProfile.cargoData) {
                for (var i = 0; i < TasksProfile.__currentTasksProfile.cargoData.cargo.length; i++) {
                    var cargo = TasksProfile.__currentTasksProfile.cargoData.cargo[i];

                    if (id == cargo.id) {
                        v = cargo;
                        break;
                    }
                }
            }

            return v;
        };

        TasksProfileController.prototype.onTaskDeleteConfirmClick = function (event) {
            var cargo = TasksProfile.__currentTasksProfile.getCargoById(TasksProfile.__currentTasksProfile.currentDeleteId);

            // прячем сообщение об ошибке
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-table-row-confirm-error-message", "", false);

            // показываем иконку загрузки
            TasksProfile.__currentTasksProfile.application.showOverlay("#i-ctrl-tasks-table-block-overlay", "#i-ctrl-tasks-table-block");

            $.ajax({
                type: "DELETE",
                url: TasksProfile.__currentTasksProfile.application.getFullUri("api/tasks"),
                data: JSON.stringify(cargo),
                contentType: "application/json",
                dataType: "json",
                success: TasksProfile.__currentTasksProfile.onAjaxDeleteTaskSuccess,
                error: TasksProfile.__currentTasksProfile.onAjaxDeleteTaskError
            });
        };

        TasksProfileController.prototype.onAjaxDeleteTaskError = function (jqXHR, status, message) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-table-block-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    TasksProfile.__currentTasksProfile.application.checkAuthStatus();
else
                    TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-table-row-confirm-error-message", errMsg[i], true);
            }
        };

        TasksProfileController.prototype.onAjaxDeleteTaskSuccess = function (data, status, jqXHR) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-table-block-overlay");

            var vehicle = data.data;

            // чистим данные об автомобиле
            TasksProfile.__currentTasksProfile.removeLocalCargoById(vehicle.id);

            // удаляем строку подтверждения удаления
            TasksProfile.__currentTasksProfile.removeDeleteConfirmRow();

            // убираем из таблицы строку
            $("#i-ctrl-tasks-table > tbody > tr[data-id=" + vehicle.id + "]").remove();
        };

        TasksProfileController.prototype.removeLocalCargoById = function (id) {
            if (null != TasksProfile.__currentTasksProfile.cargoData) {
                for (var i = 0; i < TasksProfile.__currentTasksProfile.cargoData.cargo.length; i++) {
                    var c = TasksProfile.__currentTasksProfile.cargoData.cargo[i];

                    if (c.id == id) {
                        TasksProfile.__currentTasksProfile.cargoData.cargo.splice(i, 1);
                        break;
                    }
                }
            }
        };

        TasksProfileController.prototype.updateLocalCargoData = function (cargo) {
            if (null != TasksProfile.__currentTasksProfile.cargoData) {
                for (var i = 0; i < TasksProfile.__currentTasksProfile.cargoData.cargo.length; i++) {
                    var c = TasksProfile.__currentTasksProfile.cargoData.cargo[i];

                    if (c.id == cargo.id) {
                        TasksProfile.__currentTasksProfile.cargoData.cargo[i] = cargo;
                        break;
                    }
                }
            }
        };

        TasksProfileController.prototype.onTaskDeleteCancelClick = function (event) {
            TasksProfile.__currentTasksProfile.removeDeleteConfirmRow();
        };

        TasksProfileController.prototype.removeDeleteConfirmRow = function () {
            TasksProfile.__currentTasksProfile.currentDeleteId = 0;
            $("#i-ctrl-tasks-table > tbody > tr.c-ctrl-tasks-table-row-delete-confirm-block").remove();
        };

        TasksProfileController.prototype.drawCargoType = function (data) {
            var select = $("#i-ctrl-tasks-form-cargo-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.drawCargoADRType = function (data) {
            var select = $("#i-ctrl-tasks-form-cargo-adr-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.drawBodyType = function (data) {
            var select = $("#i-ctrl-tasks-form-body-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.drawPackingType = function (data) {
            var select = $("#i-ctrl-tasks-form-packing-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.drawLoadingType = function (data) {
            var select = $("#i-ctrl-tasks-form-loading-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.drawUnloadingType = function (data) {
            var select = $("#i-ctrl-tasks-form-unloading-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        };

        TasksProfileController.prototype.clearFormErrors = function () {
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-description-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-num-of-packages-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-address-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-address-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "", false);
            TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-contacts-error-message", "", false);
        };

        TasksProfileController.prototype.clearForm = function () {
            TasksProfile.__currentTasksProfile.clearFormErrors();
            $("#i-ctrl-tasks-edit-form :text").val("");
            $("#i-ctrl-tasks-edit-form textarea").val("");
            $("#i-ctrl-tasks-form-cargo-type-select").val(0);
            $("#i-ctrl-tasks-form-cargo-adr-type-select").val(0);
            $("#i-ctrl-tasks-form-body-type-select").val(0);
            $("#i-ctrl-tasks-form-packing-type-select").val(0);
            $("#i-ctrl-tasks-form-loading-type-select").val(0);
            $("#i-ctrl-tasks-form-unloading-type-select").val(0);
            TasksProfile.__currentTasksProfile.onCity1Delete(null);
            TasksProfile.__currentTasksProfile.onCity2Delete(null);
        };

        TasksProfileController.prototype.createAjaxCargoFromForm = function () {
            var cargo = new AjaxCargo();
            var errors = false;

            // название
            cargo.name = $("#i-ctrl-tasks-form-name-txt").val().trim();

            if (1 > cargo.name.length) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "Введите название груза", true);
            }

            // тип груза
            cargo.cargoTypeId = $("#i-ctrl-tasks-form-cargo-type-select").val();

            if (1 > cargo.cargoTypeId) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "Укажите тип груза", true);
            }

            // подробно
            cargo.description = $("#i-ctrl-tasks-form-description-txt").val().trim();

            // опасный груз
            cargo.cargoADRTypeId = $("#i-ctrl-tasks-form-cargo-adr-type-select").val();

            if (1 > cargo.cargoADRTypeId) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "Укажите класс опасного груза", true);
            }

            // тип кузова
            cargo.bodyTypeId = $("#i-ctrl-tasks-form-body-type-select").val();

            if (1 > cargo.bodyTypeId) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "Укажите тип кузова", true);
            }

            // вес
            cargo.weight = parseInt($("#i-ctrl-tasks-form-weight-txt").val().trim());

            if (isNaN(cargo.weight) || 1 > cargo.weight) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "Укажите вес груза", true);
            }

            // объём
            cargo.value = parseInt($("#i-ctrl-tasks-form-value-txt").val().trim());

            if (isNaN(cargo.value) || 1 > cargo.value) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "Укажите объём груза", true);
            }

            // упаковка
            cargo.packingTypeId = $("#i-ctrl-tasks-form-packing-type-select").val();

            if (1 > cargo.packingTypeId) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "Укажите тип упаковки", true);
            }

            // кол-во мест
            cargo.numOfPackages = parseInt($("#i-ctrl-tasks-form-num-of-packages-txt").val().trim());

            if (null == TasksProfile.__currentTasksProfile.cityTmpData1) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "Укажите город отправки груза", true);
            } else {
                cargo.city1 = TasksProfile.__currentTasksProfile.cityTmpData1;
            }

            // адрес 1
            cargo.addr1 = $("#i-ctrl-tasks-form-from-address-txt").val().trim();

            // погрузка 1
            cargo.loadingTypeId1 = $("#i-ctrl-tasks-form-loading-type-select").val();

            if (1 > cargo.loadingTypeId1) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "Укажите способ погрузки", true);
            }

            if (null == TasksProfile.__currentTasksProfile.cityTmpData2) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "Укажите город прибытия груза", true);
            } else {
                cargo.city2 = TasksProfile.__currentTasksProfile.cityTmpData2;
            }

            // адрес 2
            cargo.addr2 = $("#i-ctrl-tasks-form-to-address-txt").val().trim();

            // разгрузка
            cargo.loadingTypeId2 = $("#i-ctrl-tasks-form-unloading-type-select").val();

            if (1 > cargo.loadingTypeId2) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "Укажите способ разгрузки", true);
            }

            // дата готовности
            cargo.readyDate = $("#i-ctrl-tasks-form-ready-date-txt").val().trim();

            if (false == Validators.Validator.prototype.validateDate(cargo.readyDate)) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "Укажите дату готовности груза", true);
            }

            // стоимость
            cargo.cost = parseInt($("#i-ctrl-tasks-form-cost-txt").val().trim());

            if (isNaN(cargo.cost) || 1 > cargo.cost) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "Укажите стоимость за перевозку", true);
            }

            // контакты
            cargo.contacts = $("#i-ctrl-tasks-form-contacts-txt").val().trim();

            return errors ? null : cargo;
        };

        TasksProfileController.prototype.onSubmitButtonClick = function (event) {
            // чистим ошибки на форме
            TasksProfile.__currentTasksProfile.clearFormErrors();

            // проверка данных
            var cargo = TasksProfile.__currentTasksProfile.createAjaxCargoFromForm();

            if (null != cargo) {
                // отправка данных на сервер
                TasksProfile.__currentTasksProfile.application.showOverlay("#i-ctrl-tasks-form-overlay", "#i-ctrl-tasks-edit-form");

                if (null == TasksProfile.__currentTasksProfile.currentCargo)
                    TasksProfile.__currentTasksProfile.createNewCargo(cargo);
else {
                    cargo.id = TasksProfile.__currentTasksProfile.currentCargo.id;
                    TasksProfile.__currentTasksProfile.updateCargo(cargo);
                }
            }
        };

        TasksProfileController.prototype.createNewCargo = function (data) {
            $.ajax({
                type: "POST",
                url: TasksProfile.__currentTasksProfile.application.getFullUri("api/tasks"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: TasksProfile.__currentTasksProfile.onAjaxCreateTasksSuccess,
                error: TasksProfile.__currentTasksProfile.onAjaxCreateTasksError
            });
        };

        TasksProfileController.prototype.onAjaxCreateTasksError = function (jqXHR, status, message) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    TasksProfile.__currentTasksProfile.application.checkAuthStatus();
else
                    TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", errMsg[i], true);
            }
        };

        TasksProfileController.prototype.onAjaxCreateTasksSuccess = function (data, status, jqXHR) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            var cargo = data.data;

            // запоминаем данные о задании
            TasksProfile.__currentTasksProfile.addCargoToList(cargo);

            // обновляем таблицу
            TasksProfile.__currentTasksProfile.drawTasksList();

            // прячем форму
            TasksProfile.__currentTasksProfile.showEditForm(false);
        };

        TasksProfileController.prototype.addCargoToList = function (cargo) {
            if (null == TasksProfile.__currentTasksProfile.cargoData) {
                TasksProfile.__currentTasksProfile.cargoData = new AjaxCargoList();
                TasksProfile.__currentTasksProfile.cargoData.cargo = [];
            }

            TasksProfile.__currentTasksProfile.cargoData.cargo.push(cargo);
        };

        TasksProfileController.prototype.updateCargo = function (data) {
            $.ajax({
                type: "PUT",
                url: TasksProfile.__currentTasksProfile.application.getFullUri("api/tasks"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: TasksProfile.__currentTasksProfile.onAjaxUpdateTasksSuccess,
                error: TasksProfile.__currentTasksProfile.onAjaxUpdateTasksError
            });
        };

        TasksProfileController.prototype.onAjaxUpdateTasksError = function (jqXHR, status, message) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    TasksProfile.__currentTasksProfile.application.checkAuthStatus();
else
                    TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", errMsg[i], true);
            }
        };

        TasksProfileController.prototype.onAjaxUpdateTasksSuccess = function (data, status, jqXHR) {
            TasksProfile.__currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            var cargo = data.data;

            // обновляем данные о задании
            TasksProfile.__currentTasksProfile.updateLocalCargoData(cargo);

            // обновляем таблицу
            TasksProfile.__currentTasksProfile.drawTasksList();

            // прячем форму
            TasksProfile.__currentTasksProfile.showEditForm(false);
        };

        TasksProfileController.prototype.onCancelButtonClick = function (event) {
            // закрытие формы
            TasksProfile.__currentTasksProfile.showEditForm(false);
        };

        TasksProfileController.prototype.onCity1Focus = function (event) {
            TasksProfile.__currentTasksProfile.cityBound1 = true;
            TasksProfile.__currentTasksProfile.cityBound2 = false;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-from-city-txt"), TasksProfile.__currentTasksProfile);
        };

        TasksProfileController.prototype.onCity2Focus = function (event) {
            TasksProfile.__currentTasksProfile.cityBound1 = false;
            TasksProfile.__currentTasksProfile.cityBound2 = true;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-to-city-txt"), TasksProfile.__currentTasksProfile);
        };

        TasksProfileController.prototype.onCity1Delete = function (event) {
            TasksProfile.__currentTasksProfile.cityTmpData1 = null;
            TasksProfile.__currentTasksProfile.applyCityData();
        };

        TasksProfileController.prototype.onCity2Delete = function (event) {
            TasksProfile.__currentTasksProfile.cityTmpData2 = null;
            TasksProfile.__currentTasksProfile.applyCityData();
        };
        return TasksProfileController;
    })();
    TasksProfile.TasksProfileController = TasksProfileController;

    TasksProfile.__currentTasksProfile = new TasksProfileController();
})(TasksProfile || (TasksProfile = {}));
