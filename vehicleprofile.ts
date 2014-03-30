///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>

module VehicleProfile
{
    export class AjaxVehicle
    {
        id: number;
        typeId: number;
        name: string;
        maxValue: number;
        maxWeight: number;
        expences: number;
        taxWeight: number;
        taxValue: number;
    }

    export class AjaxVehicleList
    {
        vehicles: AjaxVehicle[] = [];
    }

    export class VehicleProfileController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public parent: Application.IComponent = null;

        public vehicleData: AjaxVehicleList = null;
        public errorData: ServerData.AjaxServerResponse = null;
        public currentVehicle: AjaxVehicle = null;
        public currentDeleteId: number = 0;

        // вызовы от IApplication
        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentVehProfile.application = app;
            __currentVehProfile.parent = parent;
            Dictionary.__currDictionary.init(app, __currentVehProfile);

            // цепляем обработчики событий
            $("#i-ctrl-vehicle-form-submit-btn").click(__currentVehProfile.onSubmitButtonClick);
            $("#i-ctrl-vehicle-form-cancel-btn").click(__currentVehProfile.onCancelButtonClick);
            $("#i-ctrl-vehicle-list-add-btn").click(__currentVehProfile.onAddButtonClick);

            $("#i-ctrl-vehicle-form-max-weight-txt").focusout(__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-max-value-txt").focusout(__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-expences-txt").focusout(__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-tax-weight-txt").focusout(__currentVehProfile.onFormTxtFocusOut);
            $("#i-ctrl-vehicle-form-tax-value-txt").focusout(__currentVehProfile.onFormTxtFocusOut);

            // загружаем данные
            __currentVehProfile.queryData(); 

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("transporttype");
        }

        onUpdate(state: Application.IState): void { }

        onShow(state: Application.IState): void
        {
            Dictionary.__currDictionary.init(__currentVehProfile.application, __currentVehProfile);
            __currentVehProfile.queryData();
        }

        onHide(state: Application.IState): void { }

        // вызовы от child IComponent
        dataLoaded(sender: Application.IComponent): void { }

        dataReady(sender: Application.IComponent): void { }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void { }

        // вызовы от DictController
        dictDataReady(name: string): void
        {
            if ("transporttype" == name)
            {
                __currentVehProfile.drawTransportType(Dictionary.__currDictionary.transportTypes);
                __currentVehProfile.drawVehicleList();
            }
        }

        /////////////////////////////////////////
        // внутренние методы класса
        addVehicleToList(vehicle: AjaxVehicle): void
        {
            if (null == __currentVehProfile.vehicleData)
            {
                __currentVehProfile.vehicleData = new AjaxVehicleList();
                __currentVehProfile.vehicleData.vehicles = [];
            }

            __currentVehProfile.vehicleData.vehicles.push(vehicle); 
        }


        drawTransportType(data: Dictionary.DictionaryEntry[]): void
        {
            
            var select: JQuery = $("#i-ctrl-vehicle-form-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
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

        }



        queryData(): void
        {
            if (null == __currentVehProfile.vehicleData && null == __currentVehProfile.errorData)
            {
                __currentVehProfile.getVehicleData();
            }
            else if (null != __currentVehProfile.errorData)
            {
                __currentVehProfile.parent.dataError(__currentVehProfile, __currentVehProfile.errorData);
            }
            else
            {
                __currentVehProfile.parent.dataReady(__currentVehProfile);
            }

        }


        getVehicleData(): void
        {
            $.ajax({
                type: "GET",
                url: __currentVehProfile.application.getFullUri("api/vehicle"),
                success: __currentVehProfile.onAjaxGetVehicleDataSuccess,
                error: __currentVehProfile.onAjaxGetVehicleDataError
            });
        }



        onAjaxGetVehicleDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");
            
            __currentVehProfile.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentVehProfile.parent.dataError(__currentVehProfile, __currentVehProfile.errorData);

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            if (2 == parseInt(__currentVehProfile.errorData.code))
                __currentVehProfile.application.checkAuthStatus();
            
        }

        onAjaxGetVehicleDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            
            // загрузка компонента произведена успешно
            __currentVehProfile.vehicleData = <AjaxVehicleList>data.data;
            
            // помещаем данные в контролы
            __currentVehProfile.drawVehicleList();

            if (false == __currentVehProfile.isComponentLoaded)
            {
                __currentVehProfile.isComponentLoaded = true;
                __currentVehProfile.parent.dataLoaded(__currentVehProfile);
            }
            else
            {
                __currentVehProfile.parent.dataReady(__currentVehProfile);
            }            
        }


        clearVehicleList(): void
        {
            __currentVehProfile.currentDeleteId = 0;

            // удаляем все обработчики событий
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-edit").unbind(__currentVehProfile.onVehicleEditClick);
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-delete").unbind(__currentVehProfile.onVehicleDeleteClick);

            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-confirm-button").unbind(__currentVehProfile.onVehicleDeleteConfirmClick);
            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-cancel-button").unbind(__currentVehProfile.onVehicleDeleteCancelClick);

            // удаляем все строки таблицы
            $("#i-ctrl-vehicle-table > tbody > tr").remove();
        }

        drawVehicleList(): void
        {
            __currentVehProfile.clearVehicleList();

            var tbody: JQuery = $("#i-ctrl-vehicle-table > tbody");

            if (1 > __currentVehProfile.vehicleData.vehicles.length)
            {
                var rowEmpty: JQuery = $("#i-ctrl-vehicle-table-row-empty-template").clone();
                rowEmpty.removeAttr("id").removeClass("hidden").appendTo(tbody);
            }
            else
            {
                var rowTempl: JQuery = $("#i-ctrl-vehicle-table-row-template");

                for (var i: number = 0; i < __currentVehProfile.vehicleData.vehicles.length; i++)
                {
                    var vehicle: AjaxVehicle = __currentVehProfile.vehicleData.vehicles[i];
                    var row: JQuery = rowTempl.clone();
                    row.removeAttr("id").removeClass("hidden");

                    row.attr("data-id", vehicle.id);
                    $("td.c-ctrl-vehicle-table-cell-num", row).text(vehicle.id);
                    $("td.c-ctrl-vehicle-table-cell-name", row).text(vehicle.name);

                    if (null != Dictionary.__currDictionary.transportTypes)
                    {
                        var typeName: string = Dictionary.__currDictionary.getNameById("transporttype", vehicle.typeId);
                        $("td.c-ctrl-vehicle-table-cell-type", row).text(typeName);
                    }

                    $("td.c-ctrl-vehicle-table-cell-max-weight", row).text(vehicle.maxWeight);
                    $("td.c-ctrl-vehicle-table-cell-max-value", row).text(vehicle.maxValue);
                    $("td.c-ctrl-vehicle-table-cell-expences", row).text(vehicle.expences);
                    $("td.c-ctrl-vehicle-table-cell-tax-weight", row).text(vehicle.taxWeight);
                    $("td.c-ctrl-vehicle-table-cell-tax-value", row).text(vehicle.taxValue);

                    // привязываем обработчики на кнопки
                    $("td.c-ctrl-vehicle-table-cell-action > span.c-ctrl-vehicle-table-cell-action-edit", row).attr("data-id", vehicle.id).click(__currentVehProfile.onVehicleEditClick);
                    $("td.c-ctrl-vehicle-table-cell-action > span.c-ctrl-vehicle-table-cell-action-delete", row).attr("data-id", vehicle.id).click(__currentVehProfile.onVehicleDeleteClick);

                    row.appendTo(tbody);
                }

            }
        }


        getVehicleById(id: number): AjaxVehicle
        {
            var v: AjaxVehicle = null;

            if (null != __currentVehProfile.vehicleData)
            {
                for (var i: number = 0; i < __currentVehProfile.vehicleData.vehicles.length; i++)
                {
                    var vehicle: AjaxVehicle = __currentVehProfile.vehicleData.vehicles[i];

                    if (id == vehicle.id)
                    {
                        v = vehicle;
                        break;
                    }
                }
            }

            return v;
        }

        updateLocalVehicleData(vehicle: AjaxVehicle): void
        {
            if (null != __currentVehProfile.vehicleData)
            {
                for (var i: number = 0; i < __currentVehProfile.vehicleData.vehicles.length; i++)
                {
                    var v: AjaxVehicle = __currentVehProfile.vehicleData.vehicles[i];

                    if (v.id == vehicle.id)
                    {
                        __currentVehProfile.vehicleData.vehicles[i] = vehicle;
                        break;
                    }
                }
            }

        }

        removeLocalVehicleById(id: number): void
        {
            if (null != __currentVehProfile.vehicleData)
            {
                for (var i: number = 0; i < __currentVehProfile.vehicleData.vehicles.length; i++)
                {
                    var v: AjaxVehicle = __currentVehProfile.vehicleData.vehicles[i];

                    if (v.id == id)
                    {
                        __currentVehProfile.vehicleData.vehicles.splice(i, 1);
                        break;
                    }
                }
            }
        }


        onVehicleEditClick(event: JQueryEventObject): void
        {
            __currentVehProfile.removeDeleteConfirmRow();

            var ctrl: JQuery = $(event.delegateTarget);
            //window.console.log("onVehicleEditClick " + ctrl.attr("data-id"));

            var id: number = parseInt(ctrl.attr("data-id"));
            __currentVehProfile.currentVehicle = __currentVehProfile.getVehicleById(id);
            __currentVehProfile.showEditForm(true);
        }

        onVehicleDeleteClick(event: JQueryEventObject): void
        {
            __currentVehProfile.removeDeleteConfirmRow();

            var ctrl: JQuery = $(event.delegateTarget);
            var curRow: JQuery = ctrl.parent().parent();
            var id: number = parseInt(ctrl.attr("data-id"));
            __currentVehProfile.currentDeleteId = id;

            var rowConfirm: JQuery = $("#i-ctrl-vehicle-table-row-confirm-template").clone();
            rowConfirm.removeAttr("id").removeClass("hidden");

            $("button.c-ctrl-vehicle-table-row-delete-confirm-button", rowConfirm).click(__currentVehProfile.onVehicleDeleteConfirmClick);
            $("button.c-ctrl-vehicle-table-row-delete-cancel-button", rowConfirm).click(__currentVehProfile.onVehicleDeleteCancelClick);

            rowConfirm.insertAfter(curRow);
        }

        onVehicleDeleteConfirmClick(event: JQueryEventObject): void
        {
            var vehicle: AjaxVehicle = __currentVehProfile.getVehicleById(__currentVehProfile.currentDeleteId);
            // прячем сообщение об ошибке
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-table-row-confirm-error-message", "", false);
            // показываем иконку загрузки
            __currentVehProfile.application.showOverlay("#i-ctrl-vehicle-table-block-overlay", "#i-ctrl-vehicle-table-block");

            $.ajax({
                type: "DELETE",
                url: __currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(vehicle),
                contentType: "application/json",
                dataType: "json",
                success: __currentVehProfile.onAjaxDeleteVehicleSuccess,
                error: __currentVehProfile.onAjaxDeleteVehicleError
            });

        }

        onAjaxDeleteVehicleError(jqXHR: JQueryXHR, status: string, message: string): void
        {            
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-table-block-overlay");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxVehicle = <AjaxVehicle>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentVehProfile.application.checkAuthStatus();
                else
                    __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-table-row-confirm-error-message", errMsg[i], true);
            }
            
        }

        onAjaxDeleteVehicleSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-table-block-overlay");

            var vehicle: AjaxVehicle = <AjaxVehicle>data.data;
            // чистим данные об автомобиле
            __currentVehProfile.removeLocalVehicleById(vehicle.id);

            // удаляем строку подтверждения удаления
            __currentVehProfile.removeDeleteConfirmRow();

            // убираем из таблицы строку
            $("#i-ctrl-vehicle-table > tbody > tr[data-id=" + vehicle.id + "]").remove();
        }


        onVehicleDeleteCancelClick(event: JQueryEventObject): void
        {
            __currentVehProfile.removeDeleteConfirmRow();
        }

        removeDeleteConfirmRow(): void
        {
            __currentVehProfile.currentDeleteId = 0;
            $("#i-ctrl-vehicle-table > tbody > tr.c-ctrl-vehicle-table-row-delete-confirm-block").remove();
        }

        onAddButtonClick(event: JQueryEventObject): void
        {
            __currentVehProfile.showEditForm(true);
        }

        onFormTxtFocusOut(event: JQueryEventObject): void
        {
            var ctrl: JQuery = $(event.delegateTarget);
            var val: number = parseFloat(ctrl.val().trim());
            var newVal: string;

            if (isNaN(val) || val < 0)
                newVal = "";
            else
                newVal = val.toString();

            ctrl.val(newVal);
        }

        clearFormErrors(): void
        {
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-type-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-weight-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-value-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-expences-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-weight-error-message", "", false);
            __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-value-error-message", "", false);
        }

        onSubmitButtonClick(event: JQueryEventObject): void
        {
            // убираем все ошибки
            __currentVehProfile.clearFormErrors();


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

            var result: boolean = true;

            //////////////////////////////////
            // проверка данных (все поля должны быть заполнены)
            if (1 > vehicle.name.length)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", "Необходимо указать название машины.", true);
            }

            if (1 > vehicle.typeId)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-type-error-message", "Необходимо указать тип кузова машины.", true);
            }

            if (isNaN(vehicle.maxWeight) || 1 > vehicle.maxWeight)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-weight-error-message", "Необходимо указать максимальный вес груза.", true);
            }

            if (isNaN(vehicle.maxValue) || 1 > vehicle.maxValue)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-max-value-error-message", "Необходимо указать максимальный объём груза.", true);
            }

            if (isNaN(vehicle.expences) || 1 > vehicle.expences)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-expences-error-message", "Необходимо указать затраты на проезд.", true);
            }

            if (isNaN(vehicle.taxWeight) || 1 > vehicle.taxWeight)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-weight-error-message", "Необходимо указать свой тариф за вес.", true);
            }

            if (isNaN(vehicle.taxValue) || 1 > vehicle.taxValue)
            {
                result = false;
                __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-tax-value-error-message", "Необходимо указать свой тариф за объём.", true);
            }

            // отправка данных на сервер
            if (true == result)
            {
                __currentVehProfile.application.showOverlay("#i-ctrl-vehicle-form-overlay", "#i-ctrl-vehicle-edit-form");

                if (null == __currentVehProfile.currentVehicle)
                    __currentVehProfile.createNewVehicle(vehicle);
                else
                {
                    vehicle.id = __currentVehProfile.currentVehicle.id;
                    __currentVehProfile.updateVehicle(vehicle);
                }
            }
        }

        createNewVehicle(data: AjaxVehicle): void
        {
            $.ajax({
                type: "POST",
                url: __currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentVehProfile.onAjaxCreateVehicleSuccess,
                error: __currentVehProfile.onAjaxCreateVehicleError
            });
        }

        onAjaxCreateVehicleError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");
            
            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxVehicle = <AjaxVehicle>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentVehProfile.application.checkAuthStatus();
                else
                    __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", errMsg[i], true);
            }
        }

        onAjaxCreateVehicleSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");
            
            var vehicle: AjaxVehicle = <AjaxVehicle>data.data;

            // запоминаем данные об автомобиле
            __currentVehProfile.addVehicleToList(vehicle);

            // обновляем таблицу
            __currentVehProfile.drawVehicleList();

            // прячем форму
            __currentVehProfile.showEditForm(false);
        }

        updateVehicle(data: AjaxVehicle): void
        {
            $.ajax({
                type: "PUT",
                url: __currentVehProfile.application.getFullUri("api/vehicle"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentVehProfile.onAjaxUpdateVehicleSuccess,
                error: __currentVehProfile.onAjaxUpdateVehicleError
            });

        }

        onAjaxUpdateVehicleError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxVehicle = <AjaxVehicle>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentVehProfile.application.checkAuthStatus();
                else
                    __currentVehProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-vehicle-form-name-error-message", errMsg[i], true);
            }
        }

        onAjaxUpdateVehicleSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentVehProfile.application.hideOverlay("#i-ctrl-vehicle-form-overlay");

            var vehicle: AjaxVehicle = <AjaxVehicle>data.data;
            
            // обновляем данные об автомобиле
            __currentVehProfile.updateLocalVehicleData(vehicle);

            // обновляем таблицу
            __currentVehProfile.drawVehicleList();
            
            // прячем форму
            __currentVehProfile.showEditForm(false);
        }

        onCancelButtonClick(event: JQueryEventObject): void
        {
            // убираем все ошибки
            __currentVehProfile.clearFormErrors();

            __currentVehProfile.showEditForm(false);
        }

        showEditForm(visible: boolean): void
        {
            if (visible)
            {
                if (null != __currentVehProfile.currentVehicle)
                {
                    var v: AjaxVehicle = __currentVehProfile.currentVehicle;
                    $("#i-ctrl-vehicle-form-name-txt").val(v.name);
                    $("#i-ctrl-vehicle-form-type-select").val(v.typeId);
                    $("#i-ctrl-vehicle-form-max-weight-txt").val(v.maxWeight);
                    $("#i-ctrl-vehicle-form-max-value-txt").val(v.maxValue);
                    $("#i-ctrl-vehicle-form-expences-txt").val(v.expences);
                    $("#i-ctrl-vehicle-form-tax-weight-txt").val(v.taxWeight);
                    $("#i-ctrl-vehicle-form-tax-value-txt").val(v.taxValue);
                }
            }
            else
            {
                __currentVehProfile.currentVehicle = null;
                $("#i-ctrl-vehicle-form-name-txt").val("");
                //$("#i-ctrl-vehicle-form-type-select").val();
                $("#i-ctrl-vehicle-form-max-weight-txt").val("");
                $("#i-ctrl-vehicle-form-max-value-txt").val("");
                $("#i-ctrl-vehicle-form-expences-txt").val("");
                $("#i-ctrl-vehicle-form-tax-weight-txt").val("");
                $("#i-ctrl-vehicle-form-tax-value-txt").val("");
            }

            __currentVehProfile.switchFormVisibility(visible);
        }

        switchFormVisibility(visible: boolean): void
        {
            if (visible)
            {
                $("#i-ctrl-vehicle-edit-form-container").removeClass("hidden").addClass("block");
                $("#i-ctrl-vehicle-list-container").removeClass("block").addClass("hidden");
            }
            else
            {
                $("#i-ctrl-vehicle-edit-form-container").removeClass("block").addClass("hidden");
                $("#i-ctrl-vehicle-list-container").removeClass("hidden").addClass("block");
            }
        }

    }

    export var __currentVehProfile: VehicleProfileController = new VehicleProfileController();
}