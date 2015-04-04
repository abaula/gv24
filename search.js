///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="serverajaxdata.ts"/>
///<reference path="application.ts"/>
var Search;
(function (Search) {
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
            $("#i-page-cargoselected-link").click(Search.__currentComp.onMainMenuLinkClick);
            $("#i-page-calculate-link").click(Search.__currentComp.onMainMenuLinkClick);

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
            // показываем иконку загрузки
            Search.__currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

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
            // скрываем иконку загрузки
            Search.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
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

            // скрываем иконку загрузки
            Search.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        SearchController.prototype.drawTasksList = function () {
            // Чистим строки в таблице
            Search.__currentComp.clearTasksList();

            // чистим панель навигации по страницам
            Search.__currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            Search.__currentComp.drawTableRows();

            // рисуем панель навигации по страницам
            Search.__currentComp.drawPageNavigation();
        };

        SearchController.prototype.drawTableRows = function () {
            var tbody = $("#i-ctrl-tasks-table > tbody");

            var rowTempl = $("#i-ctrl-tasks-table-row-template");

            for (var i = 0; i < Search.__currentComp.taskData.tasks.length; i++) {
                var task = Search.__currentComp.taskData.tasks[i];
                var row = rowTempl.clone();
                row.removeAttr("id").removeClass("hidden");

                row.attr("data-id", task.id);
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).prop("checked", task.selected);
                $("td.c-ctrl-tasks-table-cell-num", row).text(task.id);
                $("td.c-ctrl-tasks-table-cell-from", row).text(task.city1);
                $("td.c-ctrl-tasks-table-cell-to", row).text(task.city2);
                $("td.c-ctrl-tasks-table-cell-type", row).text(task.type);
                $("td.c-ctrl-tasks-table-cell-weight", row).text(task.weight);
                $("td.c-ctrl-tasks-table-cell-value", row).text(task.value);
                $("td.c-ctrl-tasks-table-cell-distance", row).text(task.distance);
                $("td.c-ctrl-tasks-table-cell-cost", row).text(task.cost);
                $("td.c-ctrl-tasks-table-cell-ready-date", row).text(task.readyDate);

                // привязываем обработчики на чекбоксы
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).click(Search.__currentComp.onTaskSelected);

                row.appendTo(tbody);
            }
        };

        SearchController.prototype.drawPageNavigation = function () {
            // рассчитываем данные панели навигации
            // ... отображаемое количество ссылок
            var displayPagesNumber = 10;

            // ... номер страницы в первой отображаемой ссылке
            var displayFirstPageNumber;

            // ... номер страницы в последней отображаемой ссылке
            var displayLastPageNumber;

            // ... общее количество страниц в выборке
            var allPagesNumber;

            // ... номер текущей страницы
            var currentPageNumber;

            // рассчитываем общее количество страниц в выборке
            allPagesNumber = Math.ceil(Search.__currentComp.taskData.allRowCount / Search.__currentComp.taskData.limit);

            // номер текущей страницы
            currentPageNumber = Search.__currentComp.taskData.page;

            // находим номер первой страницы в списке
            displayFirstPageNumber = currentPageNumber - Math.floor(displayPagesNumber / 2);
            displayFirstPageNumber = Math.max(displayFirstPageNumber, 1);

            // находим номер последней страницы в списке
            displayLastPageNumber = Math.min(allPagesNumber, displayFirstPageNumber + displayPagesNumber - 1);

            // корректируем номер первой страницы в списке
            displayFirstPageNumber = Math.max(displayLastPageNumber - displayPagesNumber + 1, 1);

            // рисуем панель навигации
            var container = $("#i-ctrl-tasks-navpage-container");
            var pageNumTempl = $("#i-ctrl-tasks-navpage-pagelink-template");

            for (var i = displayFirstPageNumber; i <= displayLastPageNumber; i++) {
                var pageNumContainer = pageNumTempl.clone();
                pageNumContainer.removeAttr("id");
                pageNumContainer.attr("data-page-num", i);
                pageNumContainer.text(i);
                pageNumContainer.appendTo(container);

                if (i == currentPageNumber) {
                    pageNumContainer.addClass("c-ctrl-tasks-navpage-panel-link-current");
                } else {
                    // привязываем обработчик события
                    pageNumContainer.click(Search.__currentComp.onPageNavigationClick);
                }
            }

            // расставляем обработчики и стили на сслыки быстрой навигации
            // ... отображаем ли ссылку на страницу назад
            var displayPrevLinkActive = (currentPageNumber > 1);

            // ... отображаем ли ссылку на страницу вперёд
            var displayNextLinkActive = (currentPageNumber < allPagesNumber);

            // ... отображаем ли ссылку на страницу назад
            var displayPrevPageLinkActive = (displayFirstPageNumber > 1);

            // ... отображаем ли ссылку на страницу вперёд
            var displayNextPageLinkActive = (displayLastPageNumber < allPagesNumber);

            // ... отображаем ли ссылку на первую страницу
            var displayFirstLinkActive = (currentPageNumber != 1);

            // ... отображаем ли ссылку на последнюю страницу
            var displayLastLinkActive = (currentPageNumber < allPagesNumber);

            var linkPageNumber;

            if (displayPrevLinkActive) {
                linkPageNumber = Math.max(currentPageNumber - 1, 1);
                $("#i-ctrl-tasks-navpage-prev").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + 1, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayPrevPageLinkActive) {
                linkPageNumber = Math.max(currentPageNumber - displayPagesNumber, 1);
                $("#i-ctrl-tasks-navpage-prev-page").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextPageLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + displayPagesNumber, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next-page").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayFirstLinkActive) {
                linkPageNumber = 1;
                $("#i-ctrl-tasks-navpage-first").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayLastLinkActive) {
                linkPageNumber = allPagesNumber;
                $("#i-ctrl-tasks-navpage-last").click(Search.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }
        };

        SearchController.prototype.onMainMenuLinkClick = function (event) {
            var elem = $(event.delegateTarget);
            var id = elem.attr("id");

            if ("i-page-cargoselected-link" == id)
                Search.__currentComp.application.navigateTo("cargoselected");
else if ("i-page-calculate-link" == id)
                Search.__currentComp.application.navigateTo("calculate");
        };

        SearchController.prototype.onTaskSelected = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            var taskId = parseInt(elem.parent().parent().attr("data-id"));

            // сохраняем выбор на сервере
            Search.__currentComp.saveTaskSelected(taskId, checked);
        };

        SearchController.prototype.saveTaskSelected = function (taskId, selected) {
            var ajaxMethod = selected ? "POST" : "DELETE";

            var taskInfo = new ServerData.AjaxTaskInfo();
            taskInfo.taskId = taskId;

            var taskInfoList = new ServerData.AjaxTaskInfoList();
            taskInfoList.tasks = [];
            taskInfoList.tasks.push(taskInfo);

            // показываем иконку загрузки
            Search.__currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

            $.ajax({
                type: ajaxMethod,
                url: Search.__currentComp.application.getFullUri("api/caregoselected"),
                data: JSON.stringify(taskInfoList),
                contentType: "application/json",
                dataType: "json",
                success: Search.__currentComp.onAjaxTaskSelectedDataSuccess,
                error: Search.__currentComp.onAjaxTaskSelectedDataError
            });
        };

        SearchController.prototype.onAjaxTaskSelectedDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            Search.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            Search.__currentComp.dataError(Search.__currentComp, Search.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            Search.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        SearchController.prototype.onAjaxTaskSelectedDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            Search.__currentComp.taskData = data.data;

            // скрываем иконку загрузки
            Search.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        SearchController.prototype.onPageNavigationClick = function (event) {
            var ctrl = $(event.delegateTarget);

            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));
            var pageNum = parseInt(ctrl.attr("data-page-num"));

            // загружаем данные указанной страницы
            Search.__currentComp.getTasksPageData(pageNum);
        };

        SearchController.prototype.clearTasksList = function () {
            // получаем все строки таблицы
            var rows = $("#i-ctrl-tasks-table > tbody > tr");

            // удаляем все обработчики событий
            $("#i-ctrl-tasks-table > tbody > tr > td > :checkbox").unbind("click", Search.__currentComp.onTaskSelected);

            // удаляем все строки таблицы
            rows.remove();
        };

        SearchController.prototype.clearPageNavigation = function () {
            // удаляем обработчики событий со ссылок быстрой навигации и ставим стили по умолчанию
            $("#i-ctrl-tasks-navpage-prev, #i-ctrl-tasks-navpage-next, #i-ctrl-tasks-navpage-prev-page, #i-ctrl-tasks-navpage-next-page, #i-ctrl-tasks-navpage-first, #i-ctrl-tasks-navpage-last").unbind("click", Search.__currentComp.onPageNavigationClick).addClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", "");

            // получаем коллекцию контролов с номерами страниц
            var divs = $("#i-ctrl-tasks-navpage-container > div");

            // удаляем все обработчики событий
            divs.unbind("click", Search.__currentComp.onPageNavigationClick);

            // удаляем все контейнеры навигации
            divs.remove();
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
