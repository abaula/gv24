﻿///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
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
            $("#i-calc-auto-param-compute").click(CalculateRoute.__currentComp.onRouteComputeClick);
            $("#i-calc-option-use-cargo-from-route").click(CalculateRoute.__currentComp.onUseCargoFromRouteClick);
            $("#i-calc-vehicle-param-refresh").click(CalculateRoute.__currentComp.onVehicleParamsRefreshClick);
            $("#i-calc-vehicle-param-save").click(CalculateRoute.__currentComp.onVehicleParamsSaveClick);
            $("#i-calc-param-max-weight").focusout(CalculateRoute.__currentComp.onVehicleParamsMaxWeightFocusOut);
            $("#i-calc-param-max-value").focusout(CalculateRoute.__currentComp.onVehicleParamsMaxValueFocusOut);
            $("#i-calc-param-tax").focusout(CalculateRoute.__currentComp.onVehicleParamsTaxFocusOut);
            $("#i-calc-param-expences").focusout(CalculateRoute.__currentComp.onVehicleParamsExpencesFocusOut);

            $("#i-route-options-start-city-add").click(CalculateRoute.__currentComp.onRouteOptionsStartCityAddClick);
            $("#i-route-options-way-back-add").click(CalculateRoute.__currentComp.onRouteOptionsWayBackAddClick);

            // проверяем авторизован ли пользователь
            var authentificated = CalculateRoute.__currentComp.application.isAuthentificated();

            // загружаем опции из базы
            CalculateRoute.__currentComp.updateCalculateOptions();

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
            var resp = data.data;
            CalculateRoute.__currentComp.taskData = resp.ajaxTaskList;
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.startCities = resp.startCitiesList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;

            // помещаем данные в контролы
            CalculateRoute.__currentComp.updateStartCity();
            CalculateRoute.__currentComp.updateCalculateParamsStartCity();

            if (null != CalculateRoute.__currentComp.calculateOptions) {
                CalculateRoute.__currentComp.drawTasksList();
                CalculateRoute.__currentComp.drawRouteTable();
            }

            if (false == CalculateRoute.__currentComp.isComponentLoaded) {
                CalculateRoute.__currentComp.onComponentLoaded();
                CalculateRoute.__currentComp.dataLoaded(CalculateRoute.__currentComp);
            } else {
                CalculateRoute.__currentComp.dataReady(CalculateRoute.__currentComp);
            }

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        };

        CalculateRouteController.prototype.fillVehicleParams = function () {
            $("#i-calc-param-max-weight").val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight);
            $("#i-calc-param-max-value").val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue);
            $("#i-calc-param-expences").val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.expences);
            $("#i-calc-param-tax").val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax);
        };

        CalculateRouteController.prototype.drawTasksList = function () {
            // Чистим строки в таблице
            CalculateRoute.__currentComp.clearTasksList();

            // чистим панель навигации по страницам
            CalculateRoute.__currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            CalculateRoute.__currentComp.drawTaskTableRows();

            // рисуем панель навигации по страницам
            CalculateRoute.__currentComp.drawPageNavigation();
        };

        CalculateRouteController.prototype.drawTaskTableRows = function () {
            var tbody = $("#i-ctrl-tasks-table > tbody");

            var rowTempl = $("#i-ctrl-tasks-table-row-template");

            for (var i = 0; i < CalculateRoute.__currentComp.taskData.tasks.length; i++) {
                var task = CalculateRoute.__currentComp.taskData.tasks[i];
                var row = rowTempl.clone();
                row.removeAttr("id").removeClass("hidden");

                row.attr("data-id", task.id);
                row.attr("data-selected-id", task.selectedId);
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

                // стоимость по собственному тарифу
                var costTax = CalculateRoute.__currentComp._getTaskCost(parseFloat(task.distance), parseFloat(task.weight), parseFloat(task.value), CalculateRoute.__currentComp.calculateOptions.vehicleParams);
                $("td.c-ctrl-tasks-table-cell-cost-tax", row).text(costTax.toFixed(0));

                // рассчётные показатели стоимости
                var costKmCell = $("td.c-ctrl-tasks-table-cell-cost-km", row);
                var costKmPrCell = $("td.c-ctrl-tasks-table-cell-cost-pr-km", row);

                // получаем значение цены для дальнейших расчётов
                var cost = parseFloat(task.cost);

                if (0.01 > cost) {
                    cost = costTax;

                    // выделяем показатели стоимости другим стилем
                    costKmCell.removeClass("c-ctrl-tasks-table-cell-cost-km").addClass("c-ctrl-tasks-table-cell-cost-km-tax");
                    costKmPrCell.removeClass("c-ctrl-tasks-table-cell-cost-pr-km").addClass("c-ctrl-tasks-table-cell-cost-pr-km-tax");
                }

                // стоимость на 1 км
                var costKm = parseFloat(cost) / parseFloat(task.distance);
                costKmCell.text(costKm.toFixed(2));

                // приведённая (к параметрам машины - вес, объём) стоимость на 1 км
                var costPrKmWeight = parseFloat(cost) / parseFloat(task.distance) * (parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight) / parseFloat(task.weight));
                var costPrKmValue = parseFloat(cost) / parseFloat(task.distance) * (parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue) / parseFloat(task.value));
                var costPrKm = Math.min(costPrKmWeight, costPrKmValue);
                costKmPrCell.text(costPrKm.toFixed(2));

                // привязываем обработчики на чекбоксы
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).click(CalculateRoute.__currentComp.onTaskSelected);

                row.appendTo(tbody);
            }
        };

        CalculateRouteController.prototype._getTaskCost = function (distance, weight, value, vehicleParams) {
            var fullTax = distance * parseFloat(vehicleParams.tax);
            var costTaxWeight = (weight / parseFloat(vehicleParams.maxWeight)) * fullTax;
            var costTaxValue = (value / parseFloat(vehicleParams.maxValue)) * fullTax;
            var costTax = Math.max(costTaxWeight, costTaxValue);

            return costTax;
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

        CalculateRouteController.prototype.onVehicleParamsRefreshClick = function (event) {
            CalculateRoute.__currentComp.updateCalculateOptions();
        };

        CalculateRouteController.prototype.onUseCargoFromRouteClick = function (event) {
            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
        };

        CalculateRouteController.prototype.onRouteComputeClick = function (event) {
            // TODO Переделать, чтобы отредактированные опции сразу сохранялись в данных класса, после чего их можно будет сразу использовать не считывая опции с формы
            // опции пересчёта
            var conflictResolveCriteria = $('#i-calc-option-conflict-resolve-criteria input[type=radio]:checked').val();
            var loadingStrategy = $("#i-calc-option-loading-strategy input[type=radio]:checked").val();
            var startCityId = $("#i-calc-auto-param-start-city :selected").val();
            var useCargoFromRoute = $("#i-calc-option-use-cargo-from-route").is(":checked");
            var buildWayBack = $("#i-calc-option-apply-return-path").is(":checked");

            CalculateRoute.__currentComp.calculateOptions.conflictResolveCriteria = conflictResolveCriteria;
            CalculateRoute.__currentComp.calculateOptions.loadingStrategy = loadingStrategy;
            CalculateRoute.__currentComp.calculateOptions.startCityId = startCityId;
            CalculateRoute.__currentComp.calculateOptions.useCargoFromRoute = useCargoFromRoute;
            CalculateRoute.__currentComp.calculateOptions.buildWayBack = buildWayBack;

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // отправляем запрос на сервер
            $.ajax({
                type: "POST",
                url: CalculateRoute.__currentComp.application.getFullUri("api/calculateroute"),
                data: JSON.stringify(CalculateRoute.__currentComp.calculateOptions),
                contentType: "application/json",
                dataType: "json",
                success: CalculateRoute.__currentComp.onAjaxCalculateRouteSuccess,
                error: CalculateRoute.__currentComp.onAjaxCalculateRouteError
            });
        };

        CalculateRouteController.prototype.onAjaxCalculateRouteError = function (jqXHR, status, message) {
            //window.console.log("onAjaxTaskSelectedDataError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxCalculateRouteSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            // добавление задания в маршрут произведена успешно - необходимо скорректировать таблицу маршрута
            var resp = data.data;
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;

            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();
            CalculateRoute.__currentComp.updateSelectedTasksFromRouteData();

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.updateSelectedTasksFromRouteData = function () {
            // снимаем выбор со всех задач в таблице
            var tbody = $("#i-ctrl-tasks-table > tbody");
            $("tr > td.c-ctrl-tasks-table-cell-chk > input[type=checkbox]", tbody).prop("checked", false);

            var routePoints = CalculateRoute.__currentComp.routeData.routePoints;

            for (var i = 0; i < routePoints.length; i++) {
                var routePoint = routePoints[i];
                $("tr[data-id=" + routePoint.cargoId + "] > td.c-ctrl-tasks-table-cell-chk > input[type=checkbox]", tbody).prop("checked", true);
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
            var taskSelectedId = parseInt(elem.parent().parent().attr("data-selected-id"));

            // создаём список ID обрабатываемых узлов
            var taskIdsList = new ServerData.AjaxIdsList();
            taskIdsList.ids = [];

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            if (checked) {
                taskIdsList.ids.push(taskId);

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
                taskIdsList.ids.push(taskSelectedId);

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
            // добавление задания в маршрут произведена успешно - необходимо скорректировать таблицу маршрута
            var resp = data.data;
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;

            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();

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
            // удаление задания из маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            var resp = data.data;
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;

            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();

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

        CalculateRouteController.prototype.drawRouteTable = function () {
            var route = CalculateRoute.__currentComp.routeData.routePoints;

            // очищаем таблицу маршрута
            CalculateRoute.__currentComp.clearRouteTable();

            if (route.length < 1) {
                CalculateRoute.__currentComp.showHideRouteTableAbsentRow(true);
                return;
            }

            // рисуем строки маршрута
            CalculateRoute.__currentComp.showHideRouteTableAbsentRow(false);

            var tbody = $("#i-calc-routes-table > tbody");
            var commulativeDistance = 0;
            var commulativeCost = 0;
            var commulativeExpences = 0;
            var commulativeProfit = 0;
            var currentWeight = 0;
            var currentValue = 0;
            var prevResWeight = 0;
            var prevResValue = 0;
            var traceStop = false;

            for (var i = 0; i < route.length; i++) {
                var entry = route[i];
                var row = CalculateRoute.__currentComp.createRouteEntryRow(entry);
                var isBackWayRow = (entry.cargoId < 1);

                if (!isBackWayRow) {
                    var num = entry.cargoId.toString();

                    if (entry.isFirstPoint)
                        num += ".1";
else
                        num += ".2";

                    $("td.calc-table-col-num", row).text(num);
                }

                $("td.calc-table-col-from", row).text(entry.cityName);
                $("td.calc-table-col-ready-date", row).text(entry.readyDate);
                $("td.calc-table-col-weight-load", row).text(parseFloat(entry.weight).toFixed(0));
                $("td.calc-table-col-value-load", row).text(parseFloat(entry.value).toFixed(2));
                $("td.calc-table-col-distance", row).text(parseFloat(entry.routePointDistance).toFixed(0));

                // 2. стоимость
                var cost = parseFloat(entry.cost);
                var proceedsCell = $("td.calc-table-col-proceeds", row);

                if (!isBackWayRow && !entry.isFirstPoint && 0.01 > cost) {
                    cost = CalculateRoute.__currentComp._getTaskCost(parseFloat(entry.cargoDistance), parseFloat(entry.cargoWeight), parseFloat(entry.cargoValue), CalculateRoute.__currentComp.calculateOptions.vehicleParams);

                    // отображаем рассчитанную цену иным стилем
                    proceedsCell.removeClass("calc-table-col-proceeds").addClass("calc-table-col-proceeds-tax");
                }

                proceedsCell.text(cost.toFixed(0));

                // 3. накопленная дистанция
                commulativeDistance = commulativeDistance + parseFloat(entry.routePointDistance);
                $("td.calc-table-col-sum-distance", row).text(commulativeDistance.toFixed(0));

                // 4. текущий вес груза
                currentWeight = currentWeight + parseFloat(entry.weight);
                $("td.calc-table-col-sum-weight", row).text(currentWeight.toFixed(0));

                // 5. подсветка текущего веса груза
                var currentWeightPrc = (currentWeight / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight) * 100;

                if (currentWeightPrc > 100) {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-res-empty");
                } else {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentWeightPrc + "% 100%");
                }

                // 6. текущий объём груза
                currentValue = currentValue + parseFloat(entry.value);
                $("td.calc-table-col-sum-value", row).text(currentValue.toFixed(2));

                // подсветка текущего объёма груза
                var currentValuePrc = (currentValue / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue) * 100;

                if (currentValuePrc > 100) {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-res-empty");
                } else {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentValuePrc + "% 100%");
                }

                // резерв веса
                var resWeight = CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight - currentWeight;
                $("td.calc-table-col-res-weight", row).text(resWeight.toFixed(0));

                if (resWeight < 0) {
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-empty");
                } else {
                    var resWeightPrc = (resWeight / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight) * 100;
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-pc").css("background-size", resWeightPrc + "% 100%");
                }

                // резерв объёма
                var resValue = CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue - currentValue;
                $("td.calc-table-col-res-value", row).text(resValue.toFixed(2));

                if (resValue < 0) {
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-empty");
                } else {
                    var resValuePrc = (resValue / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue) * 100;
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-pc").css("background-size", resValuePrc + "% 100%");
                }

                if (resWeight < 0 || resValue < 0 || true == traceStop) {
                    $("td.calc-table-col-trace", row).addClass("trace-stop");
                    traceStop = true;
                } else {
                    $("td.calc-table-col-trace", row).addClass("trace-pass");
                }

                // затраты
                var exprences = parseFloat(entry.routePointDistance) * CalculateRoute.__currentComp.calculateOptions.vehicleParams.expences;
                $("td.calc-table-col-expense", row).text(exprences.toFixed(0));

                // прибыль
                var profit = parseFloat(cost) - exprences;
                $("td.calc-table-col-profit", row).text(profit.toFixed(0));

                if (profit < 0)
                    $("td.calc-table-col-profit", row).addClass("calc-table-col-val-empty");

                // накопленная выручка
                commulativeCost += parseFloat(cost);
                $("td.calc-table-col-sum-proceeds", row).text(commulativeCost.toFixed(0));

                // накопленные затраты
                commulativeExpences += exprences;
                $("td.calc-table-col-sum-expense", row).text(commulativeExpences.toFixed(0));

                // накопленная прибыль
                commulativeProfit += profit;
                $("td.calc-table-col-sum-profit", row).text(commulativeProfit.toFixed(0));

                if (commulativeProfit < 0)
                    $("td.calc-table-col-sum-profit", row).addClass("calc-table-col-val-empty");

                // упущенная выручка
                var fullTax = parseFloat(entry.routePointDistance) * CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax;
                var lostProceedsForWeight = fullTax * (prevResWeight / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight);
                var lostProceedsForValue = fullTax * (prevResValue / CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue);
                var lostProceeds = Math.min(lostProceedsForWeight, lostProceedsForValue);
                $("td.calc-table-col-lost-proceeds", row).text(lostProceeds.toFixed(0));

                // целевая прибыль
                var targetProfit = commulativeDistance * CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax - commulativeExpences;
                $("td.calc-table-col-target-profit", row).text(targetProfit.toFixed(0));

                // сохраняем данные о резерве загрузки машины в прошлой точке маршрута
                prevResWeight = resWeight;
                prevResValue = resValue;

                // Добавляем строку в таблицу
                row.appendTo(tbody);
            }
        };

        CalculateRouteController.prototype.createRouteEntryRow = function (routeEntry) {
            var rowTemplate = $("#i-calc-routes-table-tr-template");

            // создаём новую строку
            var row = rowTemplate.clone();
            row.removeAttr("id");
            row.removeClass("hidden");

            // присваиваем идентификаторы строке маршрута
            row.attr("data-point-id", routeEntry.routePointId);
            row.attr("data-cargo-id", routeEntry.cargoId);
            row.attr("data-city-id", routeEntry.cityId);

            if (routeEntry.cargoId > 0) {
                $("td.calc-table-col-up", row).click(CalculateRoute.__currentComp.onRoutePointUpDownClick);
                $("td.calc-table-col-down", row).click(CalculateRoute.__currentComp.onRoutePointUpDownClick);
            }

            return row;
        };

        CalculateRouteController.prototype.clearRouteTable = function () {
            $("#i-calc-routes-table > tbody > tr[data-point-id] > td > span").unbind();
            $("#i-calc-routes-table > tbody > tr[data-point-id]").unbind().remove();
        };

        CalculateRouteController.prototype.showHideRouteTableAbsentRow = function (show) {
            var rowRouteAbsent = $("#i-calc-routes-table-tr-absent");
            var rowTotal = $("#i-calc-routes-table-foot-total");

            if (show) {
                rowRouteAbsent.removeClass("hidden");
                rowTotal.addClass("hidden");
            } else {
                rowRouteAbsent.addClass("hidden");
                rowTotal.removeClass("hidden");
            }
        };

        CalculateRouteController.prototype.onRoutePointUpDownClick = function (event) {
            var elem = $(event.delegateTarget);
            var className = elem.attr("class");
            var row = elem.parent();
            var rowInsertAfter = null;

            if ("calc-table-col-up" == className) {
                // нужно переместить строку вверх через 1 строку
                rowInsertAfter = row.prev();

                if (null != rowInsertAfter)
                    rowInsertAfter = rowInsertAfter.prev();
            }

            if ("calc-table-col-down" == className) {
                // нужно переместить строку вниз на 1 строку
                rowInsertAfter = row.next();
            }

            // подготавливаем структуцру данных для отправки на сервер
            var place = new ServerData.AjaxRoutePointPlace();
            place.routePointId = parseInt(row.attr("data-point-id"));
            place.afterRoutePointId = 0;

            if (null != rowInsertAfter)
                place.afterRoutePointId = parseInt(rowInsertAfter.attr("data-point-id"));

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // отправляем данные на сервер
            $.ajax({
                type: "PUT",
                url: CalculateRoute.__currentComp.application.getFullUri("api/route"),
                data: JSON.stringify(place),
                contentType: "application/json",
                dataType: "json",
                success: CalculateRoute.__currentComp.onAjaxPointUpDownSuccess,
                error: CalculateRoute.__currentComp.onAjaxPointUpDownError
            });
        };

        CalculateRouteController.prototype.onAjaxPointUpDownError = function (jqXHR, status, message) {
            //window.console.log("onAjaxTaskSelectedDataError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxPointUpDownSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            // изменение порядка заданий маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            var resp = data.data;
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;

            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.clearStartCity = function () {
            var sel = $("#i-route-options-start-city");
            sel.empty();

            // добавляем опцию по умолчанию
            sel.append($('<option value="-1">-</option>'));
        };

        CalculateRouteController.prototype.updateStartCity = function () {
            var sel = $("#i-route-options-start-city");

            // запоминаем выбранный город
            var startCityId = $(":selected", sel).val();

            // очищаем список городов
            CalculateRoute.__currentComp.clearStartCity();

            // выбираем список городов
            var cities = CalculateRoute.__currentComp.startCities.cities;

            if (cities != null && cities.length > 0) {
                sel.empty();

                for (var i = 0; i < cities.length; i++) {
                    var cityInfo = cities[i];
                    sel.append($('<option value="' + cityInfo.id + '">' + cityInfo.name + '</option>'));
                }
            }

            // пытаемся восстановить выбранный ранее город
            $("[value=" + startCityId + "]", sel).attr("selected", "selected");
        };

        CalculateRouteController.prototype.clearCalculateParamsStartCity = function () {
            var sel = $("#i-calc-auto-param-start-city");
            sel.empty();

            // добавляем опцию по умолчанию
            sel.append($('<option value="-1">-</option>'));
        };

        CalculateRouteController.prototype.updateCalculateParamsStartCity = function () {
            var sel = $("#i-calc-auto-param-start-city");

            // запоминаем выбранный город
            var startCityId = $(":selected", sel).val();

            // очищаем список городов
            CalculateRoute.__currentComp.clearCalculateParamsStartCity();

            // выбираем источник для списка городов
            var useCargoFromRoute = $("#i-calc-option-use-cargo-from-route").is(":checked");
            var cities = null;

            if (useCargoFromRoute)
                cities = CalculateRoute.__currentComp.routeStartCities.cities;
else
                cities = CalculateRoute.__currentComp.startCities.cities;

            if (cities != null && cities.length > 0) {
                sel.empty();

                for (var i = 0; i < cities.length; i++) {
                    var cityInfo = cities[i];
                    sel.append($('<option value="' + cityInfo.id + '">' + cityInfo.name + '</option>'));
                }
            }

            // пытаемся восстановить выбранный ранее город
            $("[value=" + startCityId + "]", sel).attr("selected", "selected");
        };

        CalculateRouteController.prototype.updateCalculateOptions = function () {
            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-vehicle-params-overlay", "#i-calc-vehicle-params-container");

            $.ajax({
                type: "GET",
                url: CalculateRoute.__currentComp.application.getFullUri("api/vehicleparams"),
                success: CalculateRoute.__currentComp.onAjaxVehicleParamsDataGetSuccess,
                error: CalculateRoute.__currentComp.onAjaxVehicleParamsDataGetError
            });
        };

        CalculateRouteController.prototype.onAjaxVehicleParamsDataGetError = function (jqXHR, status, message) {
            //window.console.log("onAjaxCalculateOptionsDataGetError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-vehicle-params-overlay");
        };

        CalculateRouteController.prototype.onAjaxVehicleParamsDataGetSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            var vehicleParams = data.data;

            CalculateRoute.__currentComp.calculateOptions = new ServerData.AjaxCalculateOptions();
            CalculateRoute.__currentComp.calculateOptions.vehicleParams = vehicleParams;
            CalculateRoute.__currentComp.fillVehicleParams();

            if (null != CalculateRoute.__currentComp.taskData) {
                CalculateRoute.__currentComp.drawTasksList();
                CalculateRoute.__currentComp.drawRouteTable();
            }

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-vehicle-params-overlay");
        };

        CalculateRouteController.prototype.onVehicleParamsSaveClick = function (event) {
            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-vehicle-params-overlay", "#i-calc-vehicle-params-container");

            // отправляем запрос на сервер
            $.ajax({
                type: "POST",
                url: CalculateRoute.__currentComp.application.getFullUri("api/vehicleparams"),
                data: JSON.stringify(CalculateRoute.__currentComp.calculateOptions.vehicleParams),
                contentType: "application/json",
                dataType: "json",
                success: CalculateRoute.__currentComp.onAjaxVehicleParamsDataSaveSuccess,
                error: CalculateRoute.__currentComp.onAjaxVehicleParamsDataSaveError
            });
        };

        CalculateRouteController.prototype.onAjaxVehicleParamsDataSaveError = function (jqXHR, status, message) {
            //window.console.log("onAjaxCalculateOptionsDataGetError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-vehicle-params-overlay");
        };

        CalculateRouteController.prototype.onAjaxVehicleParamsDataSaveSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxTaskSelectedDataSuccess");
            var vehicleParams = data.data;

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-vehicle-params-overlay");
        };

        CalculateRouteController.prototype.onRouteOptionsStartCityAddClick = function (event) {
            var startCityId = $("#i-route-options-start-city :selected").val();
            var requestData = new ServerData.AjaxVirtualRoutePoint();
            requestData.startCityId = startCityId;
            requestData.addBackWayEntry = false;

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // отправляем запрос на сервер
            $.ajax({
                type: "POST",
                url: CalculateRoute.__currentComp.application.getFullUri("api/routeext"),
                data: JSON.stringify(requestData),
                contentType: "application/json",
                dataType: "json",
                success: CalculateRoute.__currentComp.onAjaxOnRouteOptionsStartCityAddSuccess,
                error: CalculateRoute.__currentComp.onAjaxOnRouteOptionsStartCityAddError
            });
        };

        CalculateRouteController.prototype.onAjaxOnRouteOptionsStartCityAddError = function (jqXHR, status, message) {
            //window.console.log("onAjaxOnRouteOptionsStartCityAddError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onAjaxOnRouteOptionsStartCityAddSuccess = function (data, status, jqXHR) {
            //window.console.log("onAjaxOnRouteOptionsStartCityAddSuccess");
            // ответ сервера - AjaxVirtualRoutePointAndRoutePointList
            var resp = data.data;

            // обновляем таблицу маршрута
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;
            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onRouteOptionsWayBackAddClick = function (event) {
            var requestData = new ServerData.AjaxVirtualRoutePoint();
            requestData.startCityId = 0;
            requestData.addBackWayEntry = true;

            // показываем иконку загрузки
            CalculateRoute.__currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // отправляем запрос на сервер
            $.ajax({
                type: "POST",
                url: CalculateRoute.__currentComp.application.getFullUri("api/routeext"),
                data: JSON.stringify(requestData),
                contentType: "application/json",
                dataType: "json",
                success: CalculateRoute.__currentComp.onRouteOptionsWayBackAddSuccess,
                error: CalculateRoute.__currentComp.onRouteOptionsWayBackAddError
            });
        };

        CalculateRouteController.prototype.onRouteOptionsWayBackAddError = function (jqXHR, status, message) {
            //window.console.log("onRouteOptionsWayBackAddError");
            CalculateRoute.__currentComp.errorData = JSON.parse(jqXHR.responseText);
            CalculateRoute.__currentComp.dataError(CalculateRoute.__currentComp, CalculateRoute.__currentComp.errorData);

            // TODO обрабатываем ошибки сервера
            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onRouteOptionsWayBackAddSuccess = function (data, status, jqXHR) {
            //window.console.log("onRouteOptionsWayBackAddSuccess");
            // ответ сервера - AjaxVirtualRoutePointAndRoutePointList
            var resp = data.data;

            // обновляем таблицу маршрута
            CalculateRoute.__currentComp.routeData = resp.routePointList;
            CalculateRoute.__currentComp.routeStartCities = resp.routeStartCitiesList;
            CalculateRoute.__currentComp.updateCalculateParamsStartCity();
            CalculateRoute.__currentComp.drawRouteTable();

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
        };

        CalculateRouteController.prototype.onVehicleParamsMaxWeightFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseInt(ctrl.val());

            if (isNaN(val) || val < 0) {
                ctrl.val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight);
                return;
            }

            var currentVal = CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight;

            if (val == currentVal)
                return;

            // сохраняем новое значение
            CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxWeight = val;

            // обновляем таблицы заданий и маршрута
            CalculateRoute.__currentComp.drawTasksList();
            CalculateRoute.__currentComp.drawRouteTable();
        };

        CalculateRouteController.prototype.onVehicleParamsMaxValueFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseInt(ctrl.val());

            if (isNaN(val) || val < 0) {
                ctrl.val(CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue);
                return;
            }

            var currentVal = CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue;

            if (val == currentVal)
                return;

            // сохраняем новое значение
            CalculateRoute.__currentComp.calculateOptions.vehicleParams.maxValue = val;

            // обновляем таблицы заданий и маршрута
            CalculateRoute.__currentComp.drawTasksList();
            CalculateRoute.__currentComp.drawRouteTable();
        };

        CalculateRouteController.prototype.onVehicleParamsTaxFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseFloat(ctrl.val()).toFixed(2);

            if (isNaN(val) || val < 0) {
                ctrl.val(parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax).toFixed(2));
                return;
            }

            var currentVal = parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax).toFixed(2);

            if (val == currentVal)
                return;

            // сохраняем новое значение
            CalculateRoute.__currentComp.calculateOptions.vehicleParams.tax = val;

            // обновляем таблицы заданий и маршрута
            CalculateRoute.__currentComp.drawTasksList();
            CalculateRoute.__currentComp.drawRouteTable();
        };

        CalculateRouteController.prototype.onVehicleParamsExpencesFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseFloat(ctrl.val()).toFixed(2);

            if (isNaN(val) || val < 0) {
                ctrl.val(parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.expences).toFixed(2));
                return;
            }

            var currentVal = parseFloat(CalculateRoute.__currentComp.calculateOptions.vehicleParams.expences).toFixed(2);

            if (val == currentVal)
                return;

            // сохраняем новое значение
            CalculateRoute.__currentComp.calculateOptions.vehicleParams.expences = val;

            // обновляем таблицы заданий и маршрута
            CalculateRoute.__currentComp.drawTasksList();
            CalculateRoute.__currentComp.drawRouteTable();
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
