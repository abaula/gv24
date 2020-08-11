///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>

module TasksProfile
{

    export class AjaxCargo
    {
        id: number;
        name: string;
        description: string;

        cargoTypeId: number;
        bodyTypeId: number;
        cargoADRTypeId: number;

        weight: number;
        value: number;

        packingTypeId: number;
        numOfPackages: number;

        city1: Application.CityData;
        addr1: string;
        loadingTypeId1: number;

        city2: Application.CityData;
        addr2: string;
        loadingTypeId2: number;

        distance: number;

        readyDate: string;
        cost: number;

        contacts: string;


    }


    export class AjaxCargoList
    {
        cargo: AjaxCargo[]; 
    }



    export class TasksProfileController implements Application.IComponent, Application.ICitySelector
    {
        isComponentLoaded: boolean;
        application: Application.IApplication = null;
        parent: Application.IComponent = null

        cargoData: AjaxCargoList = null;
        errorData: ServerData.AjaxServerResponse = null;

        currentCargo: AjaxCargo = null;
        currentDeleteId: number = 0;
        cityTmpData1: Application.CityData = null;
        cityTmpData2: Application.CityData = null;
        cityBound1: boolean = false;
        cityBound2: boolean = false;

        // вызовы от IApplication
        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentTasksProfile.application = app;
            __currentTasksProfile.parent = parent;
            Dictionary.__currDictionary.init(app, __currentTasksProfile);

            // цепляем обработчики событий
            $("#i-ctrl-tasks-form-submit-btn").click(__currentTasksProfile.onSubmitButtonClick);
            $("#i-ctrl-tasks-form-cancel-btn").click(__currentTasksProfile.onCancelButtonClick);

            $("#i-ctrl-tasks-form-from-city-txt").focus(__currentTasksProfile.onCity1Focus);
            $("#i-ctrl-tasks-form-to-city-txt").focus(__currentTasksProfile.onCity2Focus);

            $("#i-ctrl-tasks-form-from-city-delete-btn").click(__currentTasksProfile.onCity1Delete);
            $("#i-ctrl-tasks-form-to-city-delete-btn").click(__currentTasksProfile.onCity2Delete);

            $("#i-ctrl-tasks-list-add-btn").click(__currentTasksProfile.onAddButtonClick);

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("cargotype");
            Dictionary.__currDictionary.queryDictData("packingtype");
            Dictionary.__currDictionary.queryDictData("cargoadrtype");
            Dictionary.__currDictionary.queryDictData("bodytype");
            Dictionary.__currDictionary.queryDictData("loadingtype");

            // получаем данные
            __currentTasksProfile.queryData();
        }

        onUpdate(state: Application.IState): void
        { }

        onShow(state: Application.IState): void
        {
            Dictionary.__currDictionary.init(__currentTasksProfile.application, __currentTasksProfile);
            __currentTasksProfile.queryData();
        }

        onHide(state: Application.IState): void
        { }

        onLogin(): void
        { }

        onLogout(): void
        { }


        // вызовы от child IComponent
        dataLoaded(sender: Application.IComponent): void
        { }

        dataReady(sender: Application.IComponent): void
        { }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        { }

        // вызовы от DictController
        dictDataReady(name: string): void
        {
            if ("cargotype" == name)
            {
                __currentTasksProfile.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            }
            else if ("packingtype" == name)
            {
                __currentTasksProfile.drawPackingType(Dictionary.__currDictionary.packingTypes);
            }
            else if ("cargoadrtype" == name)
            {
                __currentTasksProfile.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            }
            else if ("bodytype" == name)
            {
                __currentTasksProfile.drawBodyType(Dictionary.__currDictionary.bodyTypes);
            }
            else if ("loadingtype" == name)
            {
                __currentTasksProfile.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                __currentTasksProfile.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }

        }


        onCitySelected(city: Application.CityData): void
        {
            if (true == __currentTasksProfile.cityBound1)
            {
                __currentTasksProfile.cityTmpData1 = city;
            }
            else
            {
                __currentTasksProfile.cityTmpData2 = city;
            }

            __currentTasksProfile.applyCityData();
        }

        onCitySelectedAbort(): void
        {
            __currentTasksProfile.applyCityData();
        }

        onAddButtonClick(event: JQueryEventObject): void
        {
            __currentTasksProfile.showEditForm(true);
        }


        showEditForm(visible: boolean): void
        {
            if (visible)
            {
                if (null != __currentTasksProfile.currentCargo)
                {
                    // заполняем форму данными
                    var c: AjaxCargo = __currentTasksProfile.currentCargo;

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
                    __currentTasksProfile.setCargoDate(c.readyDate);
                    $("#i-ctrl-tasks-form-cost-txt").val(c.cost);
                    $("#i-ctrl-tasks-form-contacts-txt").val(c.contacts);

                    __currentTasksProfile.cityTmpData1 = c.city1;
                    __currentTasksProfile.cityTmpData2 = c.city2;
                    __currentTasksProfile.applyCityData();
                }
                else
                {
                    __currentTasksProfile.setDefaultCargoDate();
                }
            }
            else
            {
                __currentTasksProfile.currentCargo = null;
                __currentTasksProfile.clearForm();
            }

            __currentTasksProfile.switchFormVisibility(visible);
        }

        switchFormVisibility(visible: boolean): void
        {
            if (visible)
            {
                $("#i-ctrl-tasks-edit-form-container").removeClass("hidden").addClass("block");
                $("#i-ctrl-tasks-list-container").removeClass("block").addClass("hidden");
            }
            else
            {
                $("#i-ctrl-tasks-edit-form-container").removeClass("block").addClass("hidden");
                $("#i-ctrl-tasks-list-container").removeClass("hidden").addClass("block");
            }
        }


        applyCityData(): void
        {
            var city: Application.CityData = null;
            var fullName: string = "";

            if (null != __currentTasksProfile.cityTmpData1)
            {
                city = __currentTasksProfile.cityTmpData1;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-from-city-txt").val(fullName);

            fullName = "";

            if (null != __currentTasksProfile.cityTmpData2)
            {
                city = __currentTasksProfile.cityTmpData2;
                fullName = city.fullname;
            }

            $("#i-ctrl-tasks-form-to-city-txt").val(fullName);
        }

        // обновление данных с сервера
        uploadData()
        {
            __currentTasksProfile.cargoData = null;
            __currentTasksProfile.errorData = null;
            __currentTasksProfile.getData();
            //__currentTasksProfile.queryData();
        }

        queryData(): void
        {
            if (null == __currentTasksProfile.cargoData && null == __currentTasksProfile.errorData)
            {
                __currentTasksProfile.getData();
            }
            else if (null != __currentTasksProfile.errorData)
            {
                __currentTasksProfile.parent.dataError(__currentTasksProfile, __currentTasksProfile.errorData);
            }
            else
            {
                __currentTasksProfile.parent.dataReady(__currentTasksProfile);
            }
        }


        getData(): void
        {
            $.ajax({
                type: "GET",
                url: __currentTasksProfile.application.getFullUri("api/cargo"),
                success: __currentTasksProfile.onAjaxGetTasksDataSuccess,
                error: __currentTasksProfile.onAjaxGetTasksDataError
            });
        }

        onAjaxGetTasksDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");

            __currentTasksProfile.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentTasksProfile.parent.dataError(__currentTasksProfile, __currentTasksProfile.errorData);

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            if (2 == parseInt(__currentTasksProfile.errorData.code))
                __currentTasksProfile.application.checkAuthStatus();
        }

        onAjaxGetTasksDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            __currentTasksProfile.cargoData = <AjaxCargoList>data.data;

            // помещаем данные в контролы
            __currentTasksProfile.drawTasksList();

            if (false == __currentTasksProfile.isComponentLoaded)
            {
                __currentTasksProfile.isComponentLoaded = true;
                __currentTasksProfile.parent.dataLoaded(__currentTasksProfile);
            }
            else
            {
                __currentTasksProfile.parent.dataReady(__currentTasksProfile);
            }
        }

        drawTasksList(): void
        {
            __currentTasksProfile.clearTasksList();
            
            var tbody: JQuery = $("#i-ctrl-tasks-table > tbody");

            if (1 > __currentTasksProfile.cargoData.cargo.length)
            {
                var rowEmpty: JQuery = $("#i-ctrl-tasks-table-row-empty-template").clone();
                rowEmpty.removeAttr("id").removeClass("hidden").appendTo(tbody);
            }
            else
            {
                var rowTempl: JQuery = $("#i-ctrl-tasks-table-row-template");

                for (var i: number = 0; i < __currentTasksProfile.cargoData.cargo.length; i++)
                {
                    var cargo: AjaxCargo = __currentTasksProfile.cargoData.cargo[i];
                    var row: JQuery = rowTempl.clone();
                    row.removeAttr("id").removeClass("hidden");

                    row.attr("data-id", cargo.id);
                    $("td.c-ctrl-tasks-table-cell-num", row).text(cargo.id);
                    $("td.c-ctrl-tasks-table-cell-name", row).text(cargo.name);

                    if (null != Dictionary.__currDictionary.cargoTypes)
                    {
                        var typeName: string = Dictionary.__currDictionary.getNameById("cargotype", cargo.cargoTypeId);
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
                    $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-edit", row).attr("data-id", cargo.id).click(__currentTasksProfile.onTaskEditClick);
                    $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-delete", row).attr("data-id", cargo.id).click(__currentTasksProfile.onTaskDeleteClick);

                    row.appendTo(tbody);
                }

            }            
            
            
        }

        /*safeUnbindEvent(id: string, handler: any): void
        {
            var coll: JQuery = $(id);

            if (0 < coll.length)
                coll.unbind(handler);
        }*/

        clearTasksList(): void
        {
            __currentTasksProfile.currentDeleteId = 0;

            var row: JQuery = $("#i-ctrl-tasks-table > tbody > tr");

            // удаляем все обработчики событий
            $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-edit", row).unbind("click", __currentTasksProfile.onTaskEditClick);
            $("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-delete", row).unbind("click", __currentTasksProfile.onTaskDeleteClick);            
            $("#i-ctrl-tasks-table tbody button.c-ctrl-tasks-table-row-delete-confirm-button").unbind("click", __currentTasksProfile.onTaskDeleteConfirmClick);
            $("#i-ctrl-tasks-table tbody button.c-ctrl-tasks-table-row-delete-cancel-button").unbind("click", __currentTasksProfile.onTaskDeleteCancelClick);
            
            // удаляем все строки таблицы
            row.remove();
            
        }

        onTaskEditClick(event: JQueryEventObject): void
        {
            __currentTasksProfile.removeDeleteConfirmRow();

            var ctrl: JQuery = $(event.delegateTarget);
            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));

            var id: number = parseInt(ctrl.attr("data-id"));
            __currentTasksProfile.currentCargo = __currentTasksProfile.getCargoById(id);
            __currentTasksProfile.showEditForm(true);
        }

        onTaskDeleteClick(event: JQueryEventObject): void
        {
            __currentTasksProfile.removeDeleteConfirmRow();

            var ctrl: JQuery = $(event.delegateTarget);
            var curRow: JQuery = ctrl.parent().parent();
            var id: number = parseInt(ctrl.attr("data-id"));
            __currentTasksProfile.currentDeleteId = id;

            var rowConfirm: JQuery = $("#i-ctrl-tasks-table-row-confirm-template").clone();
            rowConfirm.removeAttr("id").removeClass("hidden");

            $("button.c-ctrl-tasks-table-row-delete-confirm-button", rowConfirm).click(__currentTasksProfile.onTaskDeleteConfirmClick);
            $("button.c-ctrl-tasks-table-row-delete-cancel-button", rowConfirm).click(__currentTasksProfile.onTaskDeleteCancelClick);

            rowConfirm.insertAfter(curRow);
        }


        getCargoById(id: number): AjaxCargo
        {
            var v: AjaxCargo = null;

            if (null != __currentTasksProfile.cargoData)
            {
                for (var i: number = 0; i < __currentTasksProfile.cargoData.cargo.length; i++)
                {
                    var cargo: AjaxCargo = __currentTasksProfile.cargoData.cargo[i];

                    if (id == cargo.id)
                    {
                        v = cargo;
                        break;
                    }
                }
            }

            return v;
        }

        onTaskDeleteConfirmClick(event: JQueryEventObject): void
        {
            var cargo: AjaxCargo = __currentTasksProfile.getCargoById(__currentTasksProfile.currentDeleteId);
            // прячем сообщение об ошибке
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-table-row-confirm-error-message", "", false);
            // показываем иконку загрузки
            __currentTasksProfile.application.showOverlay("#i-ctrl-tasks-table-block-overlay", "#i-ctrl-tasks-table-block");

            $.ajax({
                type: "DELETE",
                url: __currentTasksProfile.application.getFullUri("api/tasks"),
                data: JSON.stringify(cargo),
                contentType: "application/json",
                dataType: "json",
                success: __currentTasksProfile.onAjaxDeleteTaskSuccess,
                error: __currentTasksProfile.onAjaxDeleteTaskError
            });

        }

        onAjaxDeleteTaskError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-table-block-overlay");

            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxCargo = <AjaxCargo>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentTasksProfile.application.checkAuthStatus();
                else
                    __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-table-row-confirm-error-message", errMsg[i], true);
            }

        }

        onAjaxDeleteTaskSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-table-block-overlay");

            var vehicle: AjaxCargo = <AjaxCargo>data.data;
            // чистим данные об автомобиле
            __currentTasksProfile.removeLocalCargoById(vehicle.id);

            // удаляем строку подтверждения удаления
            __currentTasksProfile.removeDeleteConfirmRow();

            // убираем из таблицы строку
            $("#i-ctrl-tasks-table > tbody > tr[data-id=" + vehicle.id + "]").remove();
        }

        removeLocalCargoById(id: number): void
        {
            if (null != __currentTasksProfile.cargoData)
            {
                for (var i: number = 0; i < __currentTasksProfile.cargoData.cargo.length; i++)
                {
                    var c: AjaxCargo = __currentTasksProfile.cargoData.cargo[i];

                    if (c.id == id)
                    {
                        __currentTasksProfile.cargoData.cargo.splice(i, 1);
                        break;
                    }
                }
            }
        }

        updateLocalCargoData(cargo: AjaxCargo): void
        {
            if (null != __currentTasksProfile.cargoData)
            {
                for (var i: number = 0; i < __currentTasksProfile.cargoData.cargo.length; i++)
                {
                    var c: AjaxCargo = __currentTasksProfile.cargoData.cargo[i];

                    if (c.id == cargo.id)
                    {
                        __currentTasksProfile.cargoData.cargo[i] = cargo;
                        break;
                    }
                }
            }

        }

        onTaskDeleteCancelClick(event: JQueryEventObject): void
        {
            __currentTasksProfile.removeDeleteConfirmRow();
        }

        removeDeleteConfirmRow(): void
        {
            __currentTasksProfile.currentDeleteId = 0;
            $("#i-ctrl-tasks-table > tbody > tr.c-ctrl-tasks-table-row-delete-confirm-block").remove();
        }


        drawCargoType(data: Dictionary.DictionaryEntry[]): void
        {

            var select: JQuery = $("#i-ctrl-tasks-form-cargo-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        drawCargoADRType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-cargo-adr-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        drawBodyType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-body-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        drawPackingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-packing-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        drawLoadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-loading-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        drawUnloadingType(data: Dictionary.DictionaryEntry[]): void
        {
            var select: JQuery = $("#i-ctrl-tasks-form-unloading-type-select");

            for (var i: number = 0; i < data.length; i++)
            {
                var entry: Dictionary.DictionaryEntry = data[i];
                var opt: JQuery = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }

            select.val(0);
        }

        clearFormErrors(): void
        {
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-description-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-num-of-packages-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-address-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-address-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "", false);
            __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-contacts-error-message", "", false);
        }

        clearForm(): void
        {
            __currentTasksProfile.clearFormErrors();
            $("#i-ctrl-tasks-edit-form :text").val("");
            $("#i-ctrl-tasks-edit-form textarea").val("");
            $("#i-ctrl-tasks-form-cargo-type-select").val(0);
            $("#i-ctrl-tasks-form-cargo-adr-type-select").val(0);
            $("#i-ctrl-tasks-form-body-type-select").val(0);
            $("#i-ctrl-tasks-form-packing-type-select").val(0);
            $("#i-ctrl-tasks-form-loading-type-select").val(0);
            $("#i-ctrl-tasks-form-unloading-type-select").val(0);
            __currentTasksProfile.onCity1Delete(null);
            __currentTasksProfile.onCity2Delete(null);
            __currentTasksProfile.clearCargoDate();
        }

        clearCargoDate(): void
        {
            $("#i-ctrl-tasks-form-ready-date-day-select option").remove();
            $("#i-ctrl-tasks-form-ready-date-month-select option").remove();
            $("#i-ctrl-tasks-form-ready-date-year-select option").remove();
        }

        setDefaultCargoDate(): void
        {
            var date: Date = new Date();
            //window.console.log(date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear());
            var dateString: string = date.getDate() + "-" + (date.getMonth() + 1) + "-" + date.getFullYear();
            //__currentTasksProfile.setCargoDate("12-06-1997");
            __currentTasksProfile.setCargoDate(dateString);
        }

        getCargoDate(): string
        {
            var day: string = $("#i-ctrl-tasks-form-ready-date-day-select").val();
            var month: string = $("#i-ctrl-tasks-form-ready-date-month-select").val();
            var year: string = $("#i-ctrl-tasks-form-ready-date-year-select").val();

            return day + "-" + (parseInt(month) < 10 ? ("0" + month) : month) + "-" + year;
        }

        setCargoDate(date: string): void
        {
            var arr: string[] = date.split("-");
            var day: number = parseInt(arr[0]);
            var month: number = parseInt(arr[1]);
            var year: number = parseInt(arr[2]);

            var opt: JQuery = null;
            var select: JQuery = null;

            // заполняем дни
            select = $("#i-ctrl-tasks-form-ready-date-day-select");

            for (var i: number = 1; i <= 31; i++)
            {
                opt = $("<option></option>");
                opt.val(i).text(i);
                select.append(opt);
            } 

            select.val(day);

            // заполняем месяца
            var monthArr: string[] = ["января","февраля","марта","апреля","мая","июня","июля","августа","сентября","октября","ноября","декабря"];
            select = $("#i-ctrl-tasks-form-ready-date-month-select");

            for (var i: number = 0; i < 12; i++)
            {
                opt = $("<option></option>");
                opt.val(i + 1).text(monthArr[i]);
                select.append(opt);
            }

            select.val(month);

            // заполняем года
            select = $("#i-ctrl-tasks-form-ready-date-year-select");

            var d: Date = new Date();
            var currentYear: number = d.getFullYear();

            if (year != currentYear)
            {
                opt = $("<option></option>");
                opt.val(year).text(year);
                select.append(opt);
            }

            for (var i: number = 0; i < 2; i++)
            {
                opt = $("<option></option>");
                opt.val(currentYear + i).text(currentYear + i);
                select.append(opt);
            }

        }

        

        createAjaxCargoFromForm(): AjaxCargo
        {
            var cargo: AjaxCargo = new AjaxCargo();
            var errors: boolean = false;

            // название
            cargo.name = $("#i-ctrl-tasks-form-name-txt").val().trim();

            if (1 > cargo.name.length)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", "Введите название груза", true);
            }


            // тип груза
            cargo.cargoTypeId = $("#i-ctrl-tasks-form-cargo-type-select").val();

            if (1 > cargo.cargoTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-type-error-message", "Укажите тип груза", true);
            }

            // подробно
            cargo.description = $("#i-ctrl-tasks-form-description-txt").val().trim();

            // опасный груз
            cargo.cargoADRTypeId = $("#i-ctrl-tasks-form-cargo-adr-type-select").val();

            if (1 > cargo.cargoADRTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cargo-adr-type-error-message", "Укажите класс опасного груза", true);
            }
              
            // тип кузова
            cargo.bodyTypeId = $("#i-ctrl-tasks-form-body-type-select").val();

            if (1 > cargo.bodyTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-body-type-error-message", "Укажите тип кузова", true);
            }
                

            // вес
            cargo.weight = parseInt($("#i-ctrl-tasks-form-weight-txt").val().trim());

            if (isNaN(cargo.weight) || 1 > cargo.weight)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-weight-error-message", "Укажите вес груза", true);
            }

            // объём
            cargo.value = parseInt($("#i-ctrl-tasks-form-value-txt").val().trim());

            if (isNaN(cargo.value) || 1 > cargo.value)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-value-error-message", "Укажите объём груза", true);
            }

            // упаковка 
            cargo.packingTypeId = $("#i-ctrl-tasks-form-packing-type-select").val();

            if (1 > cargo.packingTypeId)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-packing-type-error-message", "Укажите тип упаковки", true);
            }


            // кол-во мест
            cargo.numOfPackages = parseInt($("#i-ctrl-tasks-form-num-of-packages-txt").val().trim());

            // откуда
            if (null == __currentTasksProfile.cityTmpData1)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "Укажите город отправки груза", true);
            }
            else
            {
                cargo.city1 = __currentTasksProfile.cityTmpData1;
            }

            // адрес 1
            cargo.addr1 = $("#i-ctrl-tasks-form-from-address-txt").val().trim();

            // погрузка 1
            cargo.loadingTypeId1 = $("#i-ctrl-tasks-form-loading-type-select").val();

            if (1 > cargo.loadingTypeId1)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-loading-type-error-message", "Укажите способ погрузки", true);
            }

            // куда 
            if (null == __currentTasksProfile.cityTmpData2)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "Укажите город прибытия груза", true);
            }
            else
            {
                cargo.city2 = __currentTasksProfile.cityTmpData2;
            }

            // адрес 2
            cargo.addr2 = $("#i-ctrl-tasks-form-to-address-txt").val().trim();

            // разгрузка
            cargo.loadingTypeId2 = $("#i-ctrl-tasks-form-unloading-type-select").val();

            if (1 > cargo.loadingTypeId2)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-unloading-type-error-message", "Укажите способ разгрузки", true);
            }


            // дата готовности
            cargo.readyDate = __currentTasksProfile.getCargoDate();

            if (false == Validators.Validator.prototype.validateDate(cargo.readyDate))
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-ready-date-error-message", "Укажите дату готовности груза", true);
            }

            // стоимость
            cargo.cost = parseInt($("#i-ctrl-tasks-form-cost-txt").val().trim());

            if (isNaN(cargo.cost) || 1 > cargo.cost)
            {
                errors = true;
                __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-cost-error-message", "Укажите стоимость за перевозку", true);
            }

            // контакты
            cargo.contacts = $("#i-ctrl-tasks-form-contacts-txt").val().trim();



            return errors ? null : cargo;
        }


        onSubmitButtonClick(event: JQueryEventObject): void
        {
            // чистим ошибки на форме
            __currentTasksProfile.clearFormErrors();

            // проверка данных
            var cargo: AjaxCargo = __currentTasksProfile.createAjaxCargoFromForm();

            if (null != cargo)
            {
                // отправка данных на сервер
                __currentTasksProfile.application.showOverlay("#i-ctrl-tasks-form-overlay", "#i-ctrl-tasks-edit-form");

                if (null == __currentTasksProfile.currentCargo)
                    __currentTasksProfile.createNewCargo(cargo);
                else
                {
                    cargo.id = __currentTasksProfile.currentCargo.id;
                    __currentTasksProfile.updateCargo(cargo);
                }
            }
        }

        createNewCargo(data: AjaxCargo): void
        {
            $.ajax({
                type: "POST",
                url: __currentTasksProfile.application.getFullUri("api/cargo"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentTasksProfile.onAjaxCreateTasksSuccess,
                error: __currentTasksProfile.onAjaxCreateTasksError
            });
        }

        onAjaxCreateTasksError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            
            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxCargo = <AjaxCargo>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentTasksProfile.application.checkAuthStatus();
                else
                    __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", errMsg[i], true);
            }
            
        }

        onAjaxCreateTasksSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");

            
            var cargo: AjaxCargo = <AjaxCargo>data.data;

            // запоминаем данные о задании
            __currentTasksProfile.addCargoToList(cargo);

            // обновляем таблицу
            __currentTasksProfile.drawTasksList();

            // прячем форму
            __currentTasksProfile.showEditForm(false);
            
        }

        addCargoToList(cargo: AjaxCargo): void
        {
            if (null == __currentTasksProfile.cargoData)
            {
                __currentTasksProfile.cargoData = new AjaxCargoList();
                __currentTasksProfile.cargoData.cargo = [];
            }

            __currentTasksProfile.cargoData.cargo.push(cargo);
        }


        updateCargo(data: AjaxCargo): void
        {
            $.ajax({
                type: "PUT",
                url: __currentTasksProfile.application.getFullUri("api/cargo"),
                data: JSON.stringify(data),
                contentType: "application/json",
                dataType: "json",
                success: __currentTasksProfile.onAjaxUpdateTasksSuccess,
                error: __currentTasksProfile.onAjaxUpdateTasksError
            });
        }

        onAjaxUpdateTasksError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");


            var response: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            var data: AjaxCargo = <AjaxCargo>response.data;

            var errCode: string[] = response.code.split(";");
            var errMsg: string[] = response.userMessage.split(";");

            for (var i: number = 0; i < errCode.length; i++)
            {
                var code: number = parseInt(errCode[i]);

                if (2 == code)
                    __currentTasksProfile.application.checkAuthStatus();
                else
                    __currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-name-error-message", errMsg[i], true);
            }

        }

        onAjaxUpdateTasksSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentTasksProfile.application.hideOverlay("#i-ctrl-tasks-form-overlay");


            var cargo: AjaxCargo = <AjaxCargo>data.data;

            // обновляем данные о задании
            __currentTasksProfile.updateLocalCargoData(cargo);

            // обновляем таблицу
            __currentTasksProfile.drawTasksList();

            // прячем форму
            __currentTasksProfile.showEditForm(false);

        }


        onCancelButtonClick(event: JQueryEventObject): void
        {
            // закрытие формы
            __currentTasksProfile.showEditForm(false);
        }

        onCity1Focus(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityBound1 = true;
            __currentTasksProfile.cityBound2 = false;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-from-city-txt"), __currentTasksProfile);
        }


        onCity2Focus(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityBound1 = false;
            __currentTasksProfile.cityBound2 = true;

            // подключаем контрол выбора города
            Application.__currentCitySelector.init($("#i-ctrl-tasks-form-to-city-txt"), __currentTasksProfile);
        }

        onCity1Delete(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityTmpData1 = null;
            __currentTasksProfile.applyCityData();
        }

        onCity2Delete(event: JQueryEventObject): void
        {
            __currentTasksProfile.cityTmpData2 = null;
            __currentTasksProfile.applyCityData();
        }
    }

    export var __currentTasksProfile = new TasksProfileController();
}