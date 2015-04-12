///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="serverajaxdata.ts"/>
///<reference path="application.ts"/>
var CargoSelected;
(function (CargoSelected) {
    var CargoSelectedController = (function () {
        function CargoSelectedController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
            this.errorData = null;
        }
        CargoSelectedController.prototype.onLoad = function (app, parent, state) {
            CargoSelected.__currentComp.application = app;
            CargoSelected.__currentComp.state = state;

            // настраиваем обработчики событий
            $("#i-page-search-link").click(CargoSelected.__currentComp.onMainMenuLinkClick);
            $("#i-page-calculate-link").click(CargoSelected.__currentComp.onMainMenuLinkClick);

            // проверяем авторизован ли пользователь
            var authentificated = CargoSelected.__currentComp.application.isAuthentificated();

            // Получаем первую страницу из списка грузов
            CargoSelected.__currentComp.getTasksPageData(1);
            // Сообщаем приложению, что компонент загружен.
            //__currentComp.onComponentLoaded();
        };

        CargoSelectedController.prototype.onUpdate = function (state) {
            // TODO Чистим список результатов поиска
            CargoSelected.__currentComp.onComponentLoaded();
        };

        CargoSelectedController.prototype.onShow = function (state) {
            // Ничего не делаем
        };

        CargoSelectedController.prototype.onHide = function (state) {
            // Ничего не делаем
        };

        CargoSelectedController.prototype.onLogin = function () {
            //__currentComp.switchSaveQuerySectionVisible(true);
        };

        CargoSelectedController.prototype.onLogout = function () {
            //__currentComp.switchSaveQuerySectionVisible(false);
        };

        CargoSelectedController.prototype.dataLoaded = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CargoSelectedController.prototype.dataReady = function (sender) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CargoSelectedController.prototype.dataError = function (sender, error) {
            // Дочерних компонентов нет, ничего не делаем
        };

        CargoSelectedController.prototype.dictDataReady = function (name) {
        };

        CargoSelectedController.prototype.onComponentLoaded = function () {
            CargoSelected.__currentComp.isComponentLoaded = true;
            CargoSelected.__currentComp.application.componentReady();
        };

        CargoSelectedController.prototype.getTasksPageData = function (pageNumber) {
            // показываем иконку загрузки
            CargoSelected.__currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

            $.ajax({
                type: "GET",
                url: CargoSelected.__currentComp.application.getFullUri("api/caregoselected/" + pageNumber.toString()),
                success: CargoSelected.__currentComp.onAjaxGetTasksPageDataSuccess,
                error: CargoSelected.__currentComp.onAjaxGetTasksPageDataError
            });
        };

        CargoSelectedController.prototype.onAjaxGetTasksPageDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            CargoSelected.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CargoSelected.__currentComp.dataError(CargoSelected.__currentComp, CargoSelected.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CargoSelected.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CargoSelectedController.prototype.onAjaxGetTasksPageDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // загрузка компонента произведена успешно
            CargoSelected.__currentComp.taskData = data.data;

            // помещаем данные в контролы
            CargoSelected.__currentComp.drawTasksList();

            if (false == CargoSelected.__currentComp.isComponentLoaded) {
                CargoSelected.__currentComp.onComponentLoaded();
                CargoSelected.__currentComp.dataLoaded(CargoSelected.__currentComp);
            } else {
                CargoSelected.__currentComp.dataReady(CargoSelected.__currentComp);
            }

            // скрываем иконку загрузки
            CargoSelected.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CargoSelectedController.prototype.drawTasksList = function () {
            // Чистим строки в таблице
            CargoSelected.__currentComp.clearTasksList();

            // чистим панель навигации по страницам
            CargoSelected.__currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            CargoSelected.__currentComp.drawTableRows();

            // рисуем панель навигации по страницам
            CargoSelected.__currentComp.drawPageNavigation();
        };

        CargoSelectedController.prototype.drawTableRows = function () {
            var tbody = $("#i-ctrl-tasks-table > tbody");

            var rowTempl = $("#i-ctrl-tasks-table-row-template");

            for (var i = 0; i < CargoSelected.__currentComp.taskData.tasks.length; i++) {
                var task = CargoSelected.__currentComp.taskData.tasks[i];
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
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).click(CargoSelected.__currentComp.onTaskSelected);

                row.appendTo(tbody);
            }
        };

        CargoSelectedController.prototype.drawPageNavigation = function () {
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
            allPagesNumber = Math.ceil(CargoSelected.__currentComp.taskData.allRowCount / CargoSelected.__currentComp.taskData.limit);

            // номер текущей страницы
            currentPageNumber = CargoSelected.__currentComp.taskData.page;

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
                    pageNumContainer.click(CargoSelected.__currentComp.onPageNavigationClick);
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
                $("#i-ctrl-tasks-navpage-prev").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + 1, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayPrevPageLinkActive) {
                linkPageNumber = Math.max(currentPageNumber - displayPagesNumber, 1);
                $("#i-ctrl-tasks-navpage-prev-page").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextPageLinkActive) {
                linkPageNumber = Math.min(currentPageNumber + displayPagesNumber, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next-page").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayFirstLinkActive) {
                linkPageNumber = 1;
                $("#i-ctrl-tasks-navpage-first").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayLastLinkActive) {
                linkPageNumber = allPagesNumber;
                $("#i-ctrl-tasks-navpage-last").click(CargoSelected.__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }
        };

        CargoSelectedController.prototype.onMainMenuLinkClick = function (event) {
            var elem = $(event.delegateTarget);
            var id = elem.attr("id");

            if ("i-page-search-link" == id)
                CargoSelected.__currentComp.application.navigateTo("search");
            if ("i-page-calculate-link" == id)
                CargoSelected.__currentComp.application.navigateTo("calculate");
        };

        CargoSelectedController.prototype.onTaskSelected = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            var taskId = parseInt(elem.parent().parent().attr("data-id"));

            // сохраняем выбор на сервере
            CargoSelected.__currentComp.saveTaskSelected(taskId, checked);
        };

        CargoSelectedController.prototype.saveTaskSelected = function (taskId, selected) {
            var ajaxMethod = selected ? "POST" : "DELETE";

            var taskInfo = new ServerData.AjaxTaskInfo();
            taskInfo.taskId = taskId;

            var taskInfoList = new ServerData.AjaxTaskInfoList();
            taskInfoList.tasks = [];
            taskInfoList.tasks.push(taskInfo);

            // показываем иконку загрузки
            CargoSelected.__currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

            $.ajax({
                type: ajaxMethod,
                url: CargoSelected.__currentComp.application.getFullUri("api/caregoselected"),
                data: JSON.stringify(taskInfoList),
                contentType: "application/json",
                dataType: "json",
                success: CargoSelected.__currentComp.onAjaxTaskSelectedDataSuccess,
                error: CargoSelected.__currentComp.onAjaxTaskSelectedDataError
            });
        };

        CargoSelectedController.prototype.onAjaxTaskSelectedDataError = function (jqXHR, status, message) {
            //window.console.log("_onAjaxError");
            CargoSelected.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CargoSelected.__currentComp.dataError(CargoSelected.__currentComp, CargoSelected.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CargoSelected.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CargoSelectedController.prototype.onAjaxTaskSelectedDataSuccess = function (data, status, jqXHR) {
            //window.console.log("_onAjaxGetAccountDataSuccess");
            // скрываем иконку загрузки
            CargoSelected.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CargoSelectedController.prototype.onPageNavigationClick = function (event) {
            var ctrl = $(event.delegateTarget);

            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));
            var pageNum = parseInt(ctrl.attr("data-page-num"));

            // загружаем данные указанной страницы
            CargoSelected.__currentComp.getTasksPageData(pageNum);
        };

        CargoSelectedController.prototype.clearTasksList = function () {
            // получаем все строки таблицы
            var rows = $("#i-ctrl-tasks-table > tbody > tr");

            // удаляем все обработчики событий
            $("#i-ctrl-tasks-table > tbody > tr > td > :checkbox").unbind("click", CargoSelected.__currentComp.onTaskSelected);

            // удаляем все строки таблицы
            rows.remove();
        };

        CargoSelectedController.prototype.clearPageNavigation = function () {
            // удаляем обработчики событий со ссылок быстрой навигации и ставим стили по умолчанию
            $("#i-ctrl-tasks-navpage-prev, #i-ctrl-tasks-navpage-next, #i-ctrl-tasks-navpage-prev-page, #i-ctrl-tasks-navpage-next-page, #i-ctrl-tasks-navpage-first, #i-ctrl-tasks-navpage-last").unbind("click", CargoSelected.__currentComp.onPageNavigationClick).addClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", "");

            // получаем коллекцию контролов с номерами страниц
            var divs = $("#i-ctrl-tasks-navpage-container > div");

            // удаляем все обработчики событий
            divs.unbind("click", CargoSelected.__currentComp.onPageNavigationClick);

            // удаляем все контейнеры навигации
            divs.remove();
        };

        CargoSelectedController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            // настраиваем Application
            Application.__currentApp.init(CargoSelected.__currentComp, false);
        };
        return CargoSelectedController;
    })();
    CargoSelected.CargoSelectedController = CargoSelectedController;

    CargoSelected.__currentComp = new CargoSelectedController();
})(CargoSelected || (CargoSelected = {}));

$(document).ready(CargoSelected.__currentComp.onDocumentReady);
