﻿///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
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
        }
        // вызовы от IApplication
        TasksProfileController.prototype.onLoad = function (app, parent, state) {
            TasksProfile.__currentTasksProfile.application = app;
            TasksProfile.__currentTasksProfile.parent = parent;
            Dictionary.__currDictionary.init(app, TasksProfile.__currentTasksProfile);

            // получаем данные справочников
            Dictionary.__currDictionary.queryDictData("transporttype");
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
            if ("transporttype" == name) {
            } else if ("cargotype" == name) {
                TasksProfile.__currentTasksProfile.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            } else if ("packingtype" == name) {
            } else if ("cargoadrtype" == name) {
            } else if ("bodytype" == name) {
            } else if ("loadingtype" == name) {
            }
        };

        TasksProfileController.prototype.onCitySelected = function (city) {
        };

        TasksProfileController.prototype.onCitySelectedAbort = function () {
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
            /*
            TODO отрисовываем типы машин в таблице
            
            if (null != __currentOrgProfile.orgData)
            {
            select.val(__currentOrgProfile.orgData.info.formId.toString());
            }
            */
        };
        return TasksProfileController;
    })();
    TasksProfile.TasksProfileController = TasksProfileController;

    TasksProfile.__currentTasksProfile = new TasksProfileController();
})(TasksProfile || (TasksProfile = {}));
