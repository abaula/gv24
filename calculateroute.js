///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="serverajaxdata.ts"/>
///<reference path="application.ts"/>
var CalculateRoute;
(function (CalculateRoute) {
    var CalculateRouteController = (function () {
        function CalculateRouteController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
            this.errorData = null;
        }
        CalculateRouteController.prototype.onLoad = function (app, parent, state) {
            CalculateRoute.__currentComp.application = app;
            CalculateRoute.__currentComp.state = state;

            // настраиваем обработчики событий
            $("#i-page-search-link").click(CalculateRoute.__currentComp.onMainMenuLinkClick);
            $("#i-page-cargoselected-link").click(CalculateRoute.__currentComp.onMainMenuLinkClick);

            // проверяем авторизован ли пользователь
            var authentificated = CalculateRoute.__currentComp.application.isAuthentificated();

            // Получаем первую страницу из списка грузов
            CalculateRoute.__currentComp.getTasksPageData(1);
            // Сообщаем приложению, что компонент загружен.
            //__currentComp.onComponentLoaded();
        };

        CalculateRouteController.prototype.onUpdate = function (state) {
            // TODO Чистим список результатов поиска
            CalculateRoute.__currentComp.onComponentLoaded();
        };

        CalculateRouteController.prototype.onShow = function (state) {
            // Ничего не делаем
        };

        CalculateRouteController.prototype.onHide = function (state) {
            // Ничего не делаем
        };

        CalculateRouteController.prototype.onLogin = function () {
            //__currentComp.switchSaveQuerySectionVisible(true);
        };

        CalculateRouteController.prototype.onLogout = function () {
            //__currentComp.switchSaveQuerySectionVisible(false);
        };

        CalculateRouteController.prototype.dataLoaded = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CalculateRouteController.prototype.dataReady = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CalculateRouteController.prototype.dataError = function (sender, error) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CalculateRouteController.prototype.dictDataReady = function (name) {
        };

        CalculateRouteController.prototype.onComponentLoaded = function () {
            CalculateRoute.__currentComp.isComponentLoaded = true;
            CalculateRoute.__currentComp.application.componentReady();
        };

        CalculateRouteController.prototype.getTasksPageData = function (pageNumber) {
            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

            $.ajax({
                type: "GET",
                url: CalculateRoute.__currentComp.application.getFullUri("api/route/" + pageNumber.toString()),
                success: CalculateRoute.__currentComp.onAjaxGetTasksPageDataSuccess,
                error: CalculateRoute.__currentComp.onAjaxGetTasksPageDataError
            });
        };

        CalculateRouteController.prototype.onAjaxGetTasksPageDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CalculateRouteController.prototype.onAjaxGetTasksPageDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            CalculateRoute.__currentComp.taskData = data.data;

            // помещаем данные в контролы
            CalculateRoute.__currentComp.drawTasksList();

            if (false == CalculateRoute.__currentComp.isComponentLoaded) {
                CalculateRoute.__currentComp.onComponentLoaded();
                CalculateRoute.__currentComp.dataLoaded(CalculateRoute.__currentComp);
            } else {
                CalculateRoute.__currentComp.dataReady(CalculateRoute.__currentComp);
            }

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CalculateRouteController.prototype.drawTasksList = function () {
            // Чистим строки в таблице
            CalculateRoute.__currentComp.clearTasksList();

            // чистим панель навигации по страницам
            CalculateRoute.__currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            CalculateRoute.__currentComp.drawTableRows();

            // рисуем панель навигации по страницам
            CalculateRoute.__currentComp.drawPageNavigation();
        };

        CalculateRouteController.prototype.drawTableRows = function () {
            var tbody = $("#i-ctrl-tasks-table > tbody");

            var rowTempl = $("#i-ctrl-tasks-table-row-template");

            for (var i = 0; i < CalculateRoute.__currentComp.taskData.tasks.length; i++) {
                var task = CalculateRoute.__currentComp.taskData.tasks[i];
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
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).click(CalculateRoute.__currentComp.onTaskSelected);

                row.appendTo(tbody);
            }
        };

        CalculateRouteController.prototype.drawPageNavigation = function () {
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
            allPagesNumber = Math.ceil(CalculateRoute.__currentComp.taskData.allRowCount / CalculateRoute.__currentComp.taskData.limit);

            // номер текущей страницы
            currentPageNumber = CalculateRoute.__currentComp.taskData.page;

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
                    pageNumContainer.click(CalculateRoute.__currentComp.onPageNavigationClick);
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
                $("#i-ctrl-tasks-navpage-prev").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + 1, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayPrevPageLinkActive) {
                linkPageNumber = Math.max(currentPageNumber - displayPagesNumber, 1);
                $("#i-ctrl-tasks-navpage-prev-page").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextPageLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + displayPagesNumber, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next-page").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayFirstLinkActive) {
                linkPageNumber = 1;
                $("#i-ctrl-tasks-navpage-first").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayLastLinkActive) {
                linkPageNumber = allPagesNumber;
                $("#i-ctrl-tasks-navpage-last").click(CalculateRoute.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }
        };

        CalculateRouteController.prototype.onMainMenuLinkClick = function (event) {
            var elem = $(event.delegateTarget);
            var id = elem.attr("id");

            if ("i-page-search-link" == id)
                CalculateRoute.__currentComp.application.navigateTo("search");
else if ("i-page-cargoselected-link" == id)
                CalculateRoute.__currentComp.application.navigateTo("cargoselected");
        };

        CalculateRouteController.prototype.onTaskSelected = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            var taskId = parseInt(elem.parent().parent().attr("data-id"));

            // создаём список ID обрабатываемых узлов
            var taskIdsList = new ServerData.AjaxIdsList();
            taskIdsList.ids = [];
            taskIdsList.ids.push(taskId);

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            if (checked) {
                $.ajax({
                    type: "POST",
                    url: CalculateRoute.__currentComp.application.getFullUri("api/route"),
                    data: JSON.stringify(taskIdsList),
                    contentType: "application/json",
                    dataType: "json",
                    success: CalculateRoute.__currentComp.onAjaxTaskSelectedDataSuccess,
                    error: CalculateRoute.__currentComp.onAjaxTaskSelectedDataError
                });
            } else {
                $.ajax({
                    type: "DELETE",
                    url: CalculateRoute.__currentComp.application.getFullUri("api/route"),
                    data: JSON.stringify(taskIdsList),
                    contentType: "application/json",
                    dataType: "json",
                    success: CalculateRoute.__currentComp.onAjaxTaskUnselectedDataSuccess,
                    error: CalculateRoute.__currentComp.onAjaxTaskUnselectedDataError
                });
            }
        };

        CalculateRouteController.prototype.onAjaxTaskSelectedDataError = function (jqXHR, status, message) {
            //window.console.log("onAjaxTaskSelectedDataError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // TODO снимаем галочку у узла в списке
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxTaskSelectedDataSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            // TODO добавление задания в маршрут произведена успешно - необходимо скорректировать таблицу маршрута
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxTaskUnselectedDataError = function (jqXHR, status, message) {
            //window.console.log("onAjaxTaskSelectedDataError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // TODO возвращаем галочку у узла в списке
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxTaskUnselectedDataSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            // TODO удаление задания из маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onPageNavigationClick = function (event) {
            var ctrl = $(event.delegateTarget);

            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));
            var pageNum = parseInt(ctrl.attr("data-page-num"));

            // загружаем данные указанной страницы
            CalculateRoute.__currentComp.getTasksPageData(pageNum);
        };

        CalculateRouteController.prototype.clearTasksList = function () {
            // получаем все строки таблицы
            var rows = $("#i-ctrl-tasks-table > tbody > tr");

            // удаляем все обработчики событий
            $("#i-ctrl-tasks-table > tbody > tr > td > :checkbox").unbind("click", CalculateRoute.__currentComp.onTaskSelected);

            // удаляем все строки таблицы
            rows.remove();
        };

        CalculateRouteController.prototype.clearPageNavigation = function () {
            // удаляем обработчики событий со ссылок быстрой навигации и ставим стили по умолчанию
            $("#i-ctrl-tasks-navpage-prev, #i-ctrl-tasks-navpage-next, #i-ctrl-tasks-navpage-prev-page, #i-ctrl-tasks-navpage-next-page, #i-ctrl-tasks-navpage-first, #i-ctrl-tasks-navpage-last").unbind("click", CalculateRoute.__currentComp.onPageNavigationClick).addClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", "");

            // получаем коллекцию контролов с номерами страниц
            var divs = $("#i-ctrl-tasks-navpage-container > div");

            // удаляем все обработчики событий
            divs.unbind("click", CalculateRoute.__currentComp.onPageNavigationClick);

            // удаляем все контейнеры навигации
            divs.remove();
        };

        CalculateRouteController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            // настраиваем Application
            Application.__currentApp.init(CalculateRoute.__currentComp, false);
        };
        return CalculateRouteController;
    })();
    CalculateRoute.CalculateRouteController = CalculateRouteController;

    CalculateRoute.__currentComp = new CalculateRouteController();
})(CalculateRoute || (CalculateRoute = {}));

$(document).ready(CalculateRoute.__currentComp.onDocumentReady);
