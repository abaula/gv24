///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="profile.ts"/>
///<reference path="validators.ts"/>
var TasksProfile;
(function (TasksProfile) {
    var AjaxTasksData = (function () {
        function AjaxTasksData() {
        }
        return AjaxTasksData;
    })();
    TasksProfile.AjaxTasksData = AjaxTasksData;

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
        };

        TasksProfileController.prototype.drawCargoADRType = function (data) {
            var select = $("#i-ctrl-tasks-form-cargo-adr-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        };

        TasksProfileController.prototype.drawBodyType = function (data) {
            var select = $("#i-ctrl-tasks-form-body-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        };

        TasksProfileController.prototype.drawPackingType = function (data) {
            var select = $("#i-ctrl-tasks-form-packing-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        };

        TasksProfileController.prototype.drawLoadingType = function (data) {
            var select = $("#i-ctrl-tasks-form-loading-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        };

        TasksProfileController.prototype.drawUnloadingType = function (data) {
            var select = $("#i-ctrl-tasks-form-unloading-type-select");

            for (var i = 0; i < data.length; i++) {
                var entry = data[i];
                var opt = $("<option></option>");
                opt.val(entry.id).text(entry.name);
                select.append(opt);
            }
        };

        TasksProfileController.prototype.onSubmitButtonClick = function (event) {
            // проверка данных
            // отправка данных на сервер
        };

        TasksProfileController.prototype.onCancelButtonClick = function (event) {
            // очистка формы
            // закрытие формы
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
