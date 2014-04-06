///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var VehicleProfile;
(function (VehicleProfile) {
    var AjaxVehicle = (function () {
        function AjaxVehicle() {
        }
        return AjaxVehicle;
    })();
    VehicleProfile.AjaxVehicle = AjaxVehicle;

    var AjaxVehicleList = (function () {
        function AjaxVehicleList() {
            this.vehicles = [];
        }
        return AjaxVehicleList;
    })();
    VehicleProfile.AjaxVehicleList = AjaxVehicleList;

    var VehicleProfileController = (function () {
        function VehicleProfileController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.parent = null;
            this.vehicleData = null;
            this.errorData = null;
            this.currentVehicle = null;
            this.currentDeleteId = 0;
        }
        // вызовы от IApplication
        VehicleProfileController.prototype.onLoad = function (app, parent, state) {
            VehicleProfile.__currentVehProfile.application = app;
            VehicleProfile.__currentVehProfile.parent = parent;
            Dictionary.__currDictionary.init(app, VehicleProfile.__currentVehProfile);

            // цепляем обработчики событий
            $("#i-ctrl-vehicle-form-submit-btn").click(VehicleProfile.__currentVehProfile.onSubmitButtonClick);
            $("#i-ctrl-vehicle-form-cancel-btn").click(VehicleProfile.__currentVehProfile.onCancelButtonClick);
            $("#i-ctrl-vehicle-list-add-btn").click(VehicleProfile.__currentVehProfile.onAddButtonClick);

            $("#i-ctrl-vehicle-form-max-weight-txt").focusout(VehicleProfile.__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-max-value-txt").focusout(VehicleProfile.__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-expences-txt").focusout(VehicleProfile.__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-tax-weight-txt").focusout(VehicleProfile.__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-tax-value-txt").focusout(VehicleProfile.__currentVehProfile.onFormTxtFocusOut);

            // загружаем данные
            VehicleProfile.__currentVehProfile.queryData();

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("transporttype");
        };

        VehicleProfileController.prototype.onUpdate = function (state) {
        };

        VehicleProfileController.prototype.onShow = function (state) {
            Dictionary.__currDictionary.init(VehicleProfile.__currentVehProfile.application, VehicleProfile.__currentVehProfile);
            VehicleProfile.__currentVehProfile.queryData();
        };

        VehicleProfileController.prototype.onHide = function (state) {
        };

        // вызовы от child IComponent
        VehicleProfileController.prototype.dataLoaded = function (sender) {
        };

        VehicleProfileController.prototype.dataReady = function (sender) {
        };

        VehicleProfileController.prototype.dataError = function (sender, error) {
        };

        // вызовы от DictController
        VehicleProfileController.prototype.dictDataReady = function (name) {
            if ("transporttype" == name) {
                VehicleProfile.__currentVehProfile.drawTransportType(Dictionary.__currDictionary.transportTypes);
                VehicleProfile.__currentVehProfile.drawVehicleList();
            }
        };

        /////////////////////////////////////////
        // внутренние методы класса
        VehicleProfileController.prototype.addVehicleToList = function (vehicle) {
            if (null == VehicleProfile.__currentVehProfile.vehicleData) {
                VehicleProfile.__currentVehProfile.vehicleData = new AjaxVehicleList();
                VehicleProfile.__currentVehProfile.vehicleData.vehicles = [];
            }

            VehicleProfile.__currentVehProfile.vehicleData.vehicles.push(vehicle);
        };

        VehicleProfileController.prototype.drawTransportType = function (data) {
            var select = $("#i-ctrl-vehicle-form-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
            /*
            TODO отрисовываем типы машин в таблице
            
            if (null != __currentOrgProfile.orgData)
            {
            select.val(__currentOrgProfile.orgData.info.formId.toString());
            }
            */
        };

        VehicleProfileController.prototype.queryData = function () {
            if (null == VehicleProfile.__currentVehProfile.vehicleData && null == VehicleProfile.__currentVehProfile.errorData) {
                VehicleProfile.__currentVehProfile.getVehicleData();
            } else if (null != VehicleProfile.__currentVehProfile.errorData) {
                VehicleProfile.__currentVehProfile.parent.dataError(VehicleProfile.__currentVehProfile, VehicleProfile.__currentVehProfile.errorData);
            } else {
                VehicleProfile.__currentVehProfile.parent.dataReady(VehicleProfile.__currentVehProfile);
            }
        };

        VehicleProfileController.prototype.getVehicleData = function () {
            $.ajax({
                type: "GET",
                url: VehicleProfile.__currentVehProfile.application.getFullUri("api/vehicle"),
                success: VehicleProfile.__currentVehProfile.onAjaxGetVehicleDataSuccess,
                error: VehicleProfile.__currentVehProfile.onAjaxGetVehicleDataError
            });
        };

        VehicleProfileController.prototype.onAjaxGetVehicleDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            VehicleProfile.__currentVehProfile.errorData = JSON.parse(jqXHR.responseText);
            VehicleProfile.__currentVehProfile.parent.dataError(VehicleProfile.__currentVehProfile, VehicleProfile.__currentVehProfile.errorData);

            if (2 == parseInt(VehicleProfile.__currentVehProfile.errorData.code))
                VehicleProfile.__currentVehProfile.application.checkAuthStatus();
        };

        VehicleProfileController.prototype.onAjaxGetVehicleDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            VehicleProfile.__currentVehProfile.vehicleData = data.data;

            // помещаем данные в контролы
            VehicleProfile.__currentVehProfile.drawVehicleList();

            if (false == VehicleProfile.__currentVehProfile.isComponentLoaded) {
                VehicleProfile.__currentVehProfile.isComponentLoaded = true;
                VehicleProfile.__currentVehProfile.parent.dataLoaded(VehicleProfile.__currentVehProfile);
            } else {
                VehicleProfile.__currentVehProfile.parent.dataReady(VehicleProfile.__currentVehProfile);
            }
        };

        VehicleProfileController.prototype.clearVehicleList = function () {
            VehicleProfile.__currentVehProfile.currentDeleteId = 0;

            // удаляем все обработчики событий
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-edit").unbind("click", VehicleProfile.__currentVehProfile.onVehicleEditClick);
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-delete").unbind("click", VehicleProfile.__currentVehProfile.onVehicleDeleteClick);

            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-confirm-button").unbind("click", VehicleProfile.__currentVehProfile.onVehicleDeleteConfirmClick);
            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-cancel-button").unbind("click", VehicleProfile.__currentVehProfile.onVehicleDeleteCancelClick);

            // удаляем все строки таблицы
            $("#i-ctrl-vehicle-table > tbody > tr").remove();
        };

        VehicleProfileController.prototype.drawVehicleList = function () {
            VehicleProfile.__currentVehProfile.clearVehicleList();

            var tbody = $("#i-ctrl-vehicle-table > tbody");

            if (1 > VehicleProfile.__currentVehProfile.vehicleData.vehicles.length) {
                var rowEmpty = $("#i-ctrl-vehicle-table-row-empty-template").clone();
                rowEmpty.removeAttr("id").removeClass("hidden").appendTo(tbody);
            } else {
                var rowTempl = $("#i-ctrl-vehicle-table-row-template");

                for (var i = 0; i < VehicleProfile.__currentVehProfile.vehicleData.vehicles.length; i++) {
                    var vehicle = VehicleProfile.__currentVehProfile.vehicleData.vehicles[i];
                    var row = rowTempl.clone();
                    row.removeAttr("id").removeClass("hidden");

                    row.attr("data-id", vehicle.id);
                    $("td.c-ctrl-vehicle-table-cell-num", row).text(vehicle.id);
                    $("td.c-ctrl-vehicle-table-cell-name", row).text(vehicle.name);

                    if (null != Dictionary.__currDictionary.transportTypes) {
                        var typeName = Dictionary.__currDictionary.getNameById("transporttype", vehicle.typeId);
                        $("td.c-ctrl-vehicle-table-cell-type", row).text(typeName);
                    }

                    $("td.c-ctrl-vehicle-table-cell-max-weight", row).text(vehicle.maxWeight);
                    $("td.c-ctrl-vehicle-table-cell-max-value", row).text(vehicle.maxValue);
                    $("td.c-ctrl-vehicle-table-cell-expences", row).text(vehicle.expences);
                    $("td.c-ctrl-vehicle-table-cell-tax-weight", row).text(vehicle.taxWeight);
                    $("td.c-ctrl-vehicle-table-cell-tax-value", row).text(vehicle.taxValue);

                    // привязываем обработчики на кнопки
                    $("td.c-ctrl-vehicle-table-cell-action > span.c-ctrl-vehicle-table-cell-action-edit", row).attr("data-id", vehicle.id).click(VehicleProfile.__currentVehProfile.onVehicleEditClick);
                    $("td.c-ctrl-vehicle-table-cell-action > span.c-ctrl-vehicle-table-cell-action-delete", row).attr("data-id", vehicle.id).click(VehicleProfile.__currentVehProfile.onVehicleDeleteClick);

                    row.appendTo(tbody);
                }
            }
        };

        VehicleProfileController.prototype.getVehicleById = function (id) {
            var v = null;

            if (null != VehicleProfile.__currentVehProfile.vehicleData) {
                for (var i = 0; i < VehicleProfile.__currentVehProfile.vehicleData.vehicles.length; i++) {
                    var vehicle = VehicleProfile.__currentVehProfile.vehicleData.vehicles[i];

                    if (id == vehicle.id) {
                        v = vehicle;
                        break;
                    }
                }
            }

            return v;
        };

        VehicleProfileController.prototype.updateLocalVehicleData = function (vehicle) {
            if (null != VehicleProfile.__currentVehProfile.vehicleData) {
                for (var i = 0; i < VehicleProfile.__currentVehProfile.vehicleData.vehicles.length; i++) {
                    var v = VehicleProfile.__currentVehProfile.vehicleData.vehicles[i];

                    if (v.id == vehicle.id) {
                        VehicleProfile.__currentVehProfile.vehicleData.vehicles[i] = vehicle;
                        break;
                    }
                }
            }
        };

        VehicleProfileController.prototype.removeLocalVehicleById = function (id) {
            if (null != VehicleProfile.__currentVehProfile.vehicleData) {
                for (var i = 0; i < VehicleProfile.__currentVehProfile.vehicleData.vehicles.length; i++) {
                    var v = VehicleProfile.__currentVehProfile.vehicleData.vehicles[i];

                    if (v.id == id) {
                        VehicleProfile.__currentVehProfile.vehicleData.vehicles.splice(i, 1);
                        break;
                    }
                }
            }
        };

        VehicleProfileController.prototype.onVehicleEditClick = function (event) {
            VehicleProfile.__currentVehProfile.removeDeleteConfirmRow();

            var ctrl = $(event.delegateTarget);

            //window.console.log("onVehicleEditClick " + ctrl.attr("data-id"));
            var id = parseInt(ctrl.attr("data-id"));
            VehicleProfile.__currentVehProfile.currentVehicle = VehicleProfile.__currentVehProfile.getVehicleById(id);
            VehicleProfile.__currentVehProfile.showEditForm(true);
        };

        VehicleProfileController.prototype.onVehicleDeleteClick = function (event) {
            VehicleProfile.__currentVehProfile.removeDeleteConfirmRow();

            var ctrl = $(event.delegateTarget);
            var curRow = ctrl.parent().parent();
            var id = parseInt(ctrl.attr("data-id"));
            VehicleProfile.__currentVehProfile.currentDeleteId = id;

            var rowConfirm = $("#i-ctrl-vehicle-table-row-confirm-template").clone();
            rowConfirm.removeAttr("id").removeClass("hidden");

            $("button.c-ctrl-vehicle-table-row-delete-confirm-button", rowConfirm).click(VehicleProfile.__currentVehProfile.onVehicleDeleteConfirmClick);
            $("button.c-ctrl-vehicle-table-row-delete-cancel-button", rowConfirm).click(VehicleProfile.__currentVehProfile.onVehicleDeleteCancelClick);

            rowConfirm.insertAfter(curRow);
        };

        VehicleProfileController.prototype.onVehicleDeleteConfirmClick = function (event) {
            var vehicle = VehicleProfile.__currentVehProfile.getVehicleById(VehicleProfile.__currentVehProfile.currentDeleteId);

            // прячем сообщение об ошибке
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-table-row-confirm-error-message", "", false);

            // показываем иконку загрузки
            VehicleProfile.__currentVehProfile.application.showOverlay("#i-ctrl-vehicle-table-block-overlay", "#i-ctrl-vehicle-table-block");

            $.ajax({
                type: "DELETE",
                url: VehicleProfile.__currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(vehicle),
                contentType: "application/json",
                dataType: "json",
                success: VehicleProfile.__currentVehProfile.onAjaxDeleteVehicleSuccess,
                error: VehicleProfile.__currentVehProfile.onAjaxDeleteVehicleError
            });
        };

        VehicleProfileController.prototype.onAjaxDeleteVehicleError = function (jqXHR, status, message) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-table-block-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    VehicleProfile.__currentVehProfile.application.checkAuthStatus();
else
                    VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-table-row-confirm-error-message", errMsg[i], true);
            }
        };

        VehicleProfileController.prototype.onAjaxDeleteVehicleSuccess = function (data, status, jqXHR) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-table-block-overlay");

            var vehicle = data.data;

            // чистим данные об автомобиле
            VehicleProfile.__currentVehProfile.removeLocalVehicleById(vehicle.id);

            // удаляем строку подтверждения удаления
            VehicleProfile.__currentVehProfile.removeDeleteConfirmRow();

            // убираем из таблицы строку
            $("#i-ctrl-vehicle-table > tbody > tr[data-id=" + vehicle.id + "]").remove();
        };

        VehicleProfileController.prototype.onVehicleDeleteCancelClick = function (event) {
            VehicleProfile.__currentVehProfile.removeDeleteConfirmRow();
        };

        VehicleProfileController.prototype.removeDeleteConfirmRow = function () {
            VehicleProfile.__currentVehProfile.currentDeleteId = 0;
            $("#i-ctrl-vehicle-table > tbody > tr.c-ctrl-vehicle-table-row-delete-confirm-block").remove();
        };

        VehicleProfileController.prototype.onAddButtonClick = function (event) {
            VehicleProfile.__currentVehProfile.showEditForm(true);
        };

        VehicleProfileController.prototype.onFormTxtFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseFloat(ctrl.val().trim());
            var newVal;

            if (isNaN(val) || val < 0)
                newVal = "";
else
                newVal = val.toString();

            ctrl.val(newVal);
        };

        VehicleProfileController.prototype.clearFormErrors = function () {
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-type-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-weight-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-value-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-expences-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-weight-error-message", "", false);
            VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-value-error-message", "", false);
        };

        VehicleProfileController.prototype.onSubmitButtonClick = function (event) {
            // убираем все ошибки
            VehicleProfile.__currentVehProfile.clearFormErrors();

            //////////////////////////////////
            // собираем данные
            var vehicle = new AjaxVehicle();
            vehicle.name = $("#i-ctrl-vehicle-form-name-txt").val().trim();
            vehicle.typeId = parseInt($("#i-ctrl-vehicle-form-type-select").val());
            vehicle.maxWeight = parseInt($("#i-ctrl-vehicle-form-max-weight-txt").val().trim());
            vehicle.maxValue = parseInt($("#i-ctrl-vehicle-form-max-value-txt").val().trim());
            vehicle.expences = parseInt($("#i-ctrl-vehicle-form-expences-txt").val().trim());
            vehicle.taxWeight = parseFloat($("#i-ctrl-vehicle-form-tax-weight-txt").val().trim());
            vehicle.taxValue = parseFloat($("#i-ctrl-vehicle-form-tax-value-txt").val().trim());

            var result = true;

            if (1 > vehicle.name.length) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", "Необходимо указать название машины.", true);
            }

            if (1 > vehicle.typeId) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-type-error-message", "Необходимо указать тип кузова машины.", true);
            }

            if (isNaN(vehicle.maxWeight) || 1 > vehicle.maxWeight) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-weight-error-message", "Необходимо указать максимальный вес груза.", true);
            }

            if (isNaN(vehicle.maxValue) || 1 > vehicle.maxValue) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-value-error-message", "Необходимо указать максимальный объём груза.", true);
            }

            if (isNaN(vehicle.expences) || 1 > vehicle.expences) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-expences-error-message", "Необходимо указать затраты на проезд.", true);
            }

            if (isNaN(vehicle.taxWeight) || 1 > vehicle.taxWeight) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-weight-error-message", "Необходимо указать свой тариф за вес.", true);
            }

            if (isNaN(vehicle.taxValue) || 1 > vehicle.taxValue) {
                result = false;
                VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-value-error-message", "Необходимо указать свой тариф за объём.", true);
            }

            if (true == result) {
                VehicleProfile.__currentVehProfile.application.showOverlay("#i-ctrl-vehicle-form-overlay", "#i-ctrl-vehicle-edit-form");

                if (null == VehicleProfile.__currentVehProfile.currentVehicle)
                    VehicleProfile.__currentVehProfile.createNewVehicle(vehicle);
else {
                    vehicle.id = VehicleProfile.__currentVehProfile.currentVehicle.id;
                    VehicleProfile.__currentVehProfile.updateVehicle(vehicle);
                }
            }
        };

        VehicleProfileController.prototype.createNewVehicle = function (data) {
            $.ajax({
                type: "POST",
                url: VehicleProfile.__currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: VehicleProfile.__currentVehProfile.onAjaxCreateVehicleSuccess,
                error: VehicleProfile.__currentVehProfile.onAjaxCreateVehicleError
            });
        };

        VehicleProfileController.prototype.onAjaxCreateVehicleError = function (jqXHR, status, message) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    VehicleProfile.__currentVehProfile.application.checkAuthStatus();
else
                    VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", errMsg[i], true);
            }
        };

        VehicleProfileController.prototype.onAjaxCreateVehicleSuccess = function (data, status, jqXHR) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var vehicle = data.data;

            // запоминаем данные об автомобиле
            VehicleProfile.__currentVehProfile.addVehicleToList(vehicle);

            // обновляем таблицу
            VehicleProfile.__currentVehProfile.drawVehicleList();

            // прячем форму
            VehicleProfile.__currentVehProfile.showEditForm(false);
        };

        VehicleProfileController.prototype.updateVehicle = function (data) {
            $.ajax({
                type: "PUT",
                url: VehicleProfile.__currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: VehicleProfile.__currentVehProfile.onAjaxUpdateVehicleSuccess,
                error: VehicleProfile.__currentVehProfile.onAjaxUpdateVehicleError
            });
        };

        VehicleProfileController.prototype.onAjaxUpdateVehicleError = function (jqXHR, status, message) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var response = JSON.parse(jqXHR.responseText);
            var data = response.data;

            var errCode = response.code.split(";");
            var errMsg = response.userMessage.split(";");

            for (var i = 0; i < errCode.length; i++) {
                var code = parseInt(errCode[i]);

                if (2 == code)
                    VehicleProfile.__currentVehProfile.application.checkAuthStatus();
else
                    VehicleProfile.__currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", errMsg[i], true);
            }
        };

        VehicleProfileController.prototype.onAjaxUpdateVehicleSuccess = function (data, status, jqXHR) {
            VehicleProfile.__currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var vehicle = data.data;

            // обновляем данные об автомобиле
            VehicleProfile.__currentVehProfile.updateLocalVehicleData(vehicle);

            // обновляем таблицу
            VehicleProfile.__currentVehProfile.drawVehicleList();

            // прячем форму
            VehicleProfile.__currentVehProfile.showEditForm(false);
        };

        VehicleProfileController.prototype.onCancelButtonClick = function (event) {
            // убираем все ошибки
            VehicleProfile.__currentVehProfile.clearFormErrors();

            VehicleProfile.__currentVehProfile.showEditForm(false);
        };

        VehicleProfileController.prototype.showEditForm = function (visible) {
            if (visible) {
                if (null != VehicleProfile.__currentVehProfile.currentVehicle) {
                    var v = VehicleProfile.__currentVehProfile.currentVehicle;
                    $("#i-ctrl-vehicle-form-name-txt").val(v.name);
                    $("#i-ctrl-vehicle-form-type-select").val(v.typeId);
                    $("#i-ctrl-vehicle-form-max-weight-txt").val(v.maxWeight);
                    $("#i-ctrl-vehicle-form-max-value-txt").val(v.maxValue);
                    $("#i-ctrl-vehicle-form-expences-txt").val(v.expences);
                    $("#i-ctrl-vehicle-form-tax-weight-txt").val(v.taxWeight);
                    $("#i-ctrl-vehicle-form-tax-value-txt").val(v.taxValue);
                }
            } else {
                VehicleProfile.__currentVehProfile.currentVehicle = null;
                $("#i-ctrl-vehicle-form-name-txt").val("");

                //$("#i-ctrl-vehicle-form-type-select").val();
                $("#i-ctrl-vehicle-form-max-weight-txt").val("");
                $("#i-ctrl-vehicle-form-max-value-txt").val("");
                $("#i-ctrl-vehicle-form-expences-txt").val("");
                $("#i-ctrl-vehicle-form-tax-weight-txt").val("");
                $("#i-ctrl-vehicle-form-tax-value-txt").val("");
            }

            VehicleProfile.__currentVehProfile.switchFormVisibility(visible);
        };

        VehicleProfileController.prototype.switchFormVisibility = function (visible) {
            if (visible) {
                $("#i-ctrl-vehicle-edit-form-container").removeClass("hidden").addClass("block");
                $("#i-ctrl-vehicle-list-container").removeClass("block").addClass("hidden");
            } else {
                $("#i-ctrl-vehicle-edit-form-container").removeClass("block").addClass("hidden");
                $("#i-ctrl-vehicle-list-container").removeClass("hidden").addClass("block");
            }
        };
        return VehicleProfileController;
    })();
    VehicleProfile.VehicleProfileController = VehicleProfileController;

    VehicleProfile.__currentVehProfile = new VehicleProfileController();
})(VehicleProfile || (VehicleProfile = {}));
