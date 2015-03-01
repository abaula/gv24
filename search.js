///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
var Search;
(function (Search) {
    var AjaxTask = (function () {
        function AjaxTask() {
        }
        return AjaxTask;
    })();
    Search.AjaxTask = AjaxTask;

    var AjaxTaskList = (function () {
        function AjaxTaskList() {
        }
        return AjaxTaskList;
    })();
    Search.AjaxTaskList = AjaxTaskList;

    var SearchController = (function () {
        function SearchController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
            this.errorData = null;
        }
        SearchController.prototype.onLoad = function (app, parent, state) {
            Search.__currentComp.application = app;
            Search.__currentComp.state = state;

            // настраиваем обработчики событий
            /*
            $("#i-ctrl-search-form-cargo-type-up-down-button").click(__currentComp.onCargoTypeUpDownButtonClick);
            */
            // проверяем авторизован ли пользователь
            var authentificated = Search.__currentComp.application.isAuthentificated();

            // Получаем первую страницу из списка грузов
            Search.__currentComp.getTasksPageData(1);
            // Сообщаем приложению, что компонент загружен.
            //__currentComp.onComponentLoaded();
        };

        SearchController.prototype.onUpdate = function (state) {
            // TODO Чистим список результатов поиска
            Search.__currentComp.onComponentLoaded();
        };

        SearchController.prototype.onShow = function (state) {
            // Ничего не делаем
        };

        SearchController.prototype.onHide = function (state) {
            // Ничего не делаем
        };

        SearchController.prototype.onLogin = function () {
            //__currentComp.switchSaveQuerySectionVisible(true);
        };

        SearchController.prototype.onLogout = function () {
            //__currentComp.switchSaveQuerySectionVisible(false);
        };

        SearchController.prototype.dataLoaded = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dataReady = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dataError = function (sender, error) {
            // Дочерних компонентов нет, ничего не делаем
        };

        SearchController.prototype.dictDataReady = function (name) {
        };

        SearchController.prototype.onComponentLoaded = function () {
            Search.__currentComp.isComponentLoaded = true;
            Search.__currentComp.application.componentReady();
        };

        SearchController.prototype.getTasksPageData = function (pageNumber) {
            $.ajax({
                type: "GET",
                url: Search.__currentComp.application.getFullUri("api/searchtasks/" + pageNumber.toString()),
                success: Search.__currentComp.onAjaxGetTasksPageDataSuccess,
                error: Search.__currentComp.onAjaxGetTasksPageDataError
            });
        };

        SearchController.prototype.onAjaxGetTasksPageDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            Search.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            Search.__currentComp.dataError(Search.__currentComp, Search.__currentComp.errorData);
            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
        };

        SearchController.prototype.onAjaxGetTasksPageDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            Search.__currentComp.taskData = data.data;

            // помещаем данные в контролы
            Search.__currentComp.drawTasksList();

            if (false == Search.__currentComp.isComponentLoaded) {
                Search.__currentComp.onComponentLoaded();
                Search.__currentComp.dataLoaded(Search.__currentComp);
            } else {
                Search.__currentComp.dataReady(Search.__currentComp);
            }
        };

        SearchController.prototype.drawTasksList = function () {
            // Чистим строки в таблице
            Search.__currentComp.clearTasksList();

            // отображаем в таблице полученные с сервера данные
            var tbody = $("#i-ctrl-tasks-table > tbody");

            var rowTempl = $("#i-ctrl-tasks-table-row-template");

            for (var i = 0; i < Search.__currentComp.taskData.tasks.length; i++) {
                var task = Search.__currentComp.taskData.tasks[i];
                var row = rowTempl.clone();
                row.removeAttr("id").removeClass("hidden");

                row.attr("data-id", task.id);
                $("td.c-ctrl-tasks-table-cell-num", row).text(task.id);
                $("td.c-ctrl-tasks-table-cell-from", row).text(task.city1);
                $("td.c-ctrl-tasks-table-cell-to", row).text(task.city2);
                $("td.c-ctrl-tasks-table-cell-type", row).text(task.type);
                $("td.c-ctrl-tasks-table-cell-weight", row).text(task.weight);
                $("td.c-ctrl-tasks-table-cell-value", row).text(task.value);
                $("td.c-ctrl-tasks-table-cell-distance", row).text(task.distance);
                $("td.c-ctrl-tasks-table-cell-cost", row).text(task.cost);
                $("td.c-ctrl-tasks-table-cell-ready-date", row).text(task.readyDate);

                // TODO привязываем обработчики на кнопки
                //$("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-edit", row).attr("data-id", cargo.id).click(__currentTasksProfile.onTaskEditClick);
                //$("td.c-ctrl-tasks-table-cell-action > span.c-ctrl-tasks-table-cell-action-delete", row).attr("data-id", cargo.id).click(__currentTasksProfile.onTaskDeleteClick);
                row.appendTo(tbody);
            }
        };

        SearchController.prototype.clearTasksList = function () {
            // удаляем все строки таблицы
            var row = $("#i-ctrl-tasks-table > tbody > tr");
            row.remove();
        };

        SearchController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            // настраиваем Application
            Application.__currentApp.init(Search.__currentComp, false);
        };
        return SearchController;
    })();
    Search.SearchController = SearchController;

    Search.__currentComp = new SearchController();
})(Search || (Search = {}));

$(document).ready(Search.__currentComp.onDocumentReady);
