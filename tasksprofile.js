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
                    // TODO заполняем форму данными
                    /*
                    var v: AjaxVehicle = __currentVehProfile.currentVehicle;
                    $("#i-ctrl-vehicle-form-name-txt").val(v.name);
                    $("#i-ctrl-vehicle-form-type-select").val(v.typeId);
                    $("#i-ctrl-vehicle-form-max-weight-txt").val(v.maxWeight);
                    $("#i-ctrl-vehicle-form-max-value-txt").val(v.maxValue);
                    $("#i-ctrl-vehicle-form-expences-txt").val(v.expences);
                    $("#i-ctrl-vehicle-form-tax-weight-txt").val(v.taxWeight);
                    $("#i-ctrl-vehicle-form-tax-value-txt").val(v.taxValue);
                    */
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
            /*
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
            
            */
        };

        TasksProfileController.prototype.clearTasksList = function () {
            /*
            __currentVehProfile.currentDeleteId = 0;
            
            // удаляем все обработчики событий
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-edit").unbind(__currentVehProfile.onVehicleEditClick);
            $("#i-ctrl-vehicle-table span.c-ctrl-vehicle-table-cell-action-delete").unbind(__currentVehProfile.onVehicleDeleteClick);
            
            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-confirm-button").unbind(__currentVehProfile.onVehicleDeleteConfirmClick);
            $("#i-ctrl-vehicle-table button.c-ctrl-vehicle-table-row-delete-cancel-button").unbind(__currentVehProfile.onVehicleDeleteCancelClick);
            
            // удаляем все строки таблицы
            $("#i-ctrl-vehicle-table > tbody > tr").remove();
            */
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
else
                    TasksProfile.__currentTasksProfile.updateCargo(cargo);
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

            var vehicle = data.data;
            // запоминаем данные о задании
            //__currentVehProfile.addVehicleToList(vehicle);
            // обновляем таблицу
            //__currentVehProfile.drawVehicleList();
            // прячем форму
            //__currentVehProfile.showEditForm(false);
        };

        TasksProfileController.prototype.updateCargo = function (data) {
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
