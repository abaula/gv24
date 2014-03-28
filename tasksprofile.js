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
            this.loadsData = null;
            this.errorData = null;
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
            TasksProfile.__currentTasksProfile.loadsData = null;
            TasksProfile.__currentTasksProfile.errorData = null;

            //__currentLoadsProfile.getData();
            TasksProfile.__currentTasksProfile.queryData();
        };

        TasksProfileController.prototype.queryData = function () {
            if (false == TasksProfile.__currentTasksProfile.isComponentLoaded) {
                TasksProfile.__currentTasksProfile.isComponentLoaded = true;
                TasksProfile.__currentTasksProfile.parent.dataLoaded(TasksProfile.__currentTasksProfile);
            } else {
                TasksProfile.__currentTasksProfile.parent.dataReady(TasksProfile.__currentTasksProfile);
            }
        };

        TasksProfileController.prototype.getData = function () {
            /*$.ajax({
            type: "GET",
            url: __currentOrgProfile.application.getFullUri("api/org"),
            success: __currentOrgProfile.onAjaxGetOrgDataSuccess,
            error: __currentOrgProfile.onAjaxGetOrgDataError
            });*/
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
            $("#i-ctrl-tasks-form-block :text").val("");
            $("#i-ctrl-tasks-form-block textarea").val("");
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

            // подробно
            cargo.description = $("#i-ctrl-tasks-form-description-txt").val().trim();

            // опасный груз
            cargo.cargoADRTypeId = $("#i-ctrl-tasks-form-cargo-adr-type-select").val();

            // тип кузова
            cargo.bodyTypeId = $("#i-ctrl-tasks-form-body-type-select").val();

            // вес
            cargo.weight = parseInt($("#i-ctrl-tasks-form-weight-txt").val().trim());

            // объём
            cargo.value = parseInt($("#i-ctrl-tasks-form-value-txt").val().trim());

            // упаковка
            cargo.packingTypeId = $("#i-ctrl-tasks-form-packing-type-select").val();

            // кол-во мест
            cargo.numOfPackages = parseInt($("#i-ctrl-tasks-form-num-of-packages-txt").val().trim());

            if (null == TasksProfile.__currentTasksProfile.cityTmpData1) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-from-city-error-message", "Укажите город отправки груза", true);
            } else {
                cargo.city1 = TasksProfile.__currentTasksProfile.cityTmpData1.id;
            }

            // адрес 1
            cargo.addr1 = $("#i-ctrl-tasks-form-from-address-txt").val().trim();

            // погрузка 1
            cargo.loadingTypeId1 = $("#i-ctrl-tasks-form-loading-type-select").val();

            if (null == TasksProfile.__currentTasksProfile.cityTmpData2) {
                errors = true;
                TasksProfile.__currentTasksProfile.application.switchFormPropertyErrorVisibility("#i-ctrl-tasks-form-to-city-error-message", "Укажите город прибытия груза", true);
            } else {
                cargo.city2 = TasksProfile.__currentTasksProfile.cityTmpData2.id;
            }

            // адрес 2
            cargo.addr2 = $("#i-ctrl-tasks-form-to-address-txt").val().trim();

            // погрузка
            cargo.loadingTypeId2 = $("#i-ctrl-tasks-form-unloading-type-select").val();

            // дата готовности
            cargo.readyDate = $("#i-ctrl-tasks-form-ready-date-txt").val().trim();

            // стоимость
            cargo.cost = parseInt($("#i-ctrl-tasks-form-cost-txt").val().trim());

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
                // TODO отправка данных на сервер
            }
        };

        TasksProfileController.prototype.onCancelButtonClick = function (event) {
            // очистка формы
            TasksProfile.__currentTasksProfile.clearForm();
            // TODO закрытие формы
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
