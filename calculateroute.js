///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="serverajaxdata.ts"/>
///<reference path="application.ts"/>
var CalculateRoute;
(function (CalculateRoute) {
    var VehicleParams = (function () {
        function VehicleParams() {
            this.maxValue = 82;
            this.maxWeight = 20000;
            this.expences = 25;
            this.taxWeight = 125;
            this.taxValue = 30.5;
        }
        return VehicleParams;
    })();
    CalculateRoute.VehicleParams = VehicleParams;

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

            // TODO переделать на загрузку сохранённых данных из базы
            CalculateRoute.__currentComp.vehicleParams = new VehicleParams();
            CalculateRoute.__currentComp.fillVehicleParams();
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

            // помещаем данные в контролы
            CalculateRoute.__currentComp.drawTasksList();
            CalculateRoute.__currentComp.drawRouteTable();

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
            $("#i-calc-param-max-weight").val(CalculateRoute.__currentComp.vehicleParams.maxWeight);
            $("#i-calc-param-max-value").val(CalculateRoute.__currentComp.vehicleParams.maxValue);
            $("#i-calc-param-expense").val(CalculateRoute.__currentComp.vehicleParams.expences);
            $("#i-calc-param-tax-weight").val(CalculateRoute.__currentComp.vehicleParams.taxWeight);
            $("#i-calc-param-tax-value").val(CalculateRoute.__currentComp.vehicleParams.taxValue);
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
            CalculateRoute.__currentComp.routeData = (data.data).routePointList;
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
            CalculateRoute.__currentComp.routeData = (data.data).routePointList;
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

                // накопленная дистанция
                commulativeDistance = commulativeDistance + parseFloat(entry.routePointDistance);
                $("td.calc-table-col-sum-distance", row).text(commulativeDistance.toFixed(0));

                // текущий вес груза
                currentWeight = currentWeight + parseFloat(entry.weight);
                $("td.calc-table-col-sum-weight", row).text(currentWeight.toFixed(0));

                // подсветка текущего веса груза
                var currentWeightPrc = (currentWeight / CalculateRoute.__currentComp.vehicleParams.maxWeight) * 100;

                if (currentWeightPrc > 100) {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-res-empty");
                } else {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentWeightPrc + "% 100%");
                }

                // текущий объём груза
                currentValue = currentValue + parseFloat(entry.value);
                $("td.calc-table-col-sum-value", row).text(currentValue.toFixed(2));

                // подсветка текущего объёма груза
                var currentValuePrc = (currentValue / CalculateRoute.__currentComp.vehicleParams.maxValue) * 100;

                if (currentValuePrc > 100) {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-res-empty");
                } else {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentValuePrc + "% 100%");
                }

                // резерв веса
                var resWeight = CalculateRoute.__currentComp.vehicleParams.maxWeight - currentWeight;
                $("td.calc-table-col-res-weight", row).text(resWeight.toFixed(0));

                if (resWeight < 0) {
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-empty");
                } else {
                    var resWeightPrc = (resWeight / CalculateRoute.__currentComp.vehicleParams.maxWeight) * 100;
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-pc").css("background-size", resWeightPrc + "% 100%");
                }

                // резерв объёма
                var resValue = CalculateRoute.__currentComp.vehicleParams.maxValue - currentValue;
                $("td.calc-table-col-res-value", row).text(resValue.toFixed(2));

                if (resValue < 0) {
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-empty");
                } else {
                    var resValuePrc = (resValue / CalculateRoute.__currentComp.vehicleParams.maxValue) * 100;
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-pc").css("background-size", resValuePrc + "% 100%");
                }

                if (resWeight < 0 || resValue < 0 || true == traceStop) {
                    $("td.calc-table-col-trace", row).addClass("trace-stop");
                    traceStop = true;
                } else {
                    $("td.calc-table-col-trace", row).addClass("trace-pass");
                }

                // затраты
                var exprences = parseFloat(entry.routePointDistance) * CalculateRoute.__currentComp.vehicleParams.expences;
                $("td.calc-table-col-expense", row).text(exprences.toFixed(0));

                // прибыль
                var profit = parseFloat(entry.cost) - exprences;
                $("td.calc-table-col-profit", row).text(profit.toFixed(0));

                if (profit < 0)
                    $("td.calc-table-col-profit", row).addClass("calc-table-col-val-empty");

                // накопленная выручка
                commulativeCost += parseFloat(entry.cost);
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
                var lostProceedsForWeight = prevResWeight / 1000 * parseFloat(entry.routePointDistance) / 100 * CalculateRoute.__currentComp.vehicleParams.taxWeight;
                var lostProceedsForValue = prevResValue * parseFloat(entry.routePointDistance) / 100 * CalculateRoute.__currentComp.vehicleParams.taxValue;
                var lostProceeds = Math.max(lostProceedsForWeight, lostProceedsForValue);
                $("td.calc-table-col-lost-proceeds", row).text(lostProceeds.toFixed(0));

                // целевая прибыль
                var targetProfitForWeight = commulativeDistance / 100 * CalculateRoute.__currentComp.vehicleParams.maxWeight / 1000 * CalculateRoute.__currentComp.vehicleParams.taxWeight - commulativeExpences;
                var targetProfitForValue = commulativeDistance / 100 * CalculateRoute.__currentComp.vehicleParams.maxValue * CalculateRoute.__currentComp.vehicleParams.taxValue - commulativeExpences;
                var targetProfit = Math.max(targetProfitForWeight, targetProfitForValue);
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

            // заполняем данными строку
            row.attr("data-point-id", routeEntry.routePointId);
            row.attr("data-cargo-id", routeEntry.cargoId);
            row.attr("data-city-id", routeEntry.cityId);

            var num = routeEntry.cargoId.toString();

            if (routeEntry.cost > 0)
                num += ".2";
else
                num += ".1";

            $("td.calc-table-col-num", row).text(num);

            $("td.calc-table-col-from", row).text(routeEntry.cityName);

            $("td.calc-table-col-weight-load", row).text(parseFloat(routeEntry.weight).toFixed(0));
            $("td.calc-table-col-value-load", row).text(parseFloat(routeEntry.value).toFixed(2));

            /*
            if (routeEntry.sumWeightPc == Number.POSITIVE_INFINITY || routeEntry.sumValuePc == Number.POSITIVE_INFINITY
            || isNaN(routeEntry.sumWeightPc) || isNaN(routeEntry.sumValuePc))
            {
            $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight);
            $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue);
            }
            else
            {
            $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight + " (" + routeEntry.sumWeightPc + "%)");
            $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue + " (" + routeEntry.sumValuePc + "%)");
            }
            
            
            if (routeEntry.resWeightPc == Number.NEGATIVE_INFINITY || routeEntry.resValuePc == Number.NEGATIVE_INFINITY
            || isNaN(routeEntry.resWeightPc) || isNaN(routeEntry.resValuePc))
            {
            $("td.calc-table-col-res-weight", row).text(routeEntry.resWeight);
            $("td.calc-table-col-res-value", row).text(routeEntry.resValue);
            }
            else
            {
            $("td.calc-table-col-res-weight", row).text(routeEntry.resWeight + " (" + routeEntry.resWeightPc + "%)");
            $("td.calc-table-col-res-value", row).text(routeEntry.resValue + " (" + routeEntry.resValuePc + "%)");
            }
            */
            $("td.calc-table-col-distance", row).text(parseFloat(routeEntry.routePointDistance).toFixed(0));

            $("td.calc-table-col-proceeds", row).text(parseFloat(routeEntry.cost).toFixed(0));

            /*
            $("td.calc-table-col-sum-distance", row).text(routeEntry.sumDistance);
            
            $("td.calc-table-col-expense", row).text(routeEntry.expense.toFixed(0));
            $("td.calc-table-col-sum-expense", row).text(routeEntry.sumExpense.toFixed(0));
            
            if (null != routeEntry.task && routeEntry.task.customTaxUsed)
            $("td.calc-table-col-proceeds", row).text(routeEntry.proceeds.toFixed(0)).addClass("calc-table-col-val-custom");
            else
            $("td.calc-table-col-proceeds", row).text(routeEntry.proceeds.toFixed(0));
            
            $("td.calc-table-col-sum-proceeds", row).text(routeEntry.sumProceeds.toFixed(0));
            
            $("td.calc-table-col-profit", row).text(routeEntry.profit.toFixed(0));
            $("td.calc-table-col-sum-profit", row).text(routeEntry.sumProfit.toFixed(0));
            
            $("td.calc-table-col-lost-proceeds", row).text(routeEntry.lostProceeds.toFixed(0));
            $("td.calc-table-col-target-profit", row).text(routeEntry.targetProfit.toFixed(0));
            */
            // подключаем обработчики событий
            $("td.calc-table-col-up", row).click(CalculateRoute.__currentComp.onRoutePointUpDownClick);
            $("td.calc-table-col-down", row).click(CalculateRoute.__currentComp.onRoutePointUpDownClick);

            /*
            
            if (isBackWayRow)
            {
            $("td.calc-table-col-up > span.icon-button", row).remove();
            $("td.calc-table-col-down > span.icon-button", row).remove();
            $("td.calc-table-col-show-details > span.icon-button", row).remove();
            }
            else
            {
            $("td.calc-table-col-up > span.icon-button", row).click("up", CalcController.prototype._onUpDownClick);
            $("td.calc-table-col-down > span.icon-button", row).click("down", CalcController.prototype._onUpDownClick);
            //$("td.calc-table-col-show-details > span.icon-button", row).click(CalcController.prototype._onDetailsClick);
            }
            
            row.click(CalcController.prototype._onRouteTableRowClick);
            */
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
            // удаление задания из маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            CalculateRoute.__currentComp.routeData = (data.data).routePointList;
            CalculateRoute.__currentComp.drawRouteTable();

            // скрываем иконку загрузки
            CalculateRoute.__currentComp.application.hideOverlay("#i-ctrl-overlay");
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
