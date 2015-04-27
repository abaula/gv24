///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="serverajaxdata.ts"/>
///<reference path="application.ts"/>

module CalculateRoute
{
    export class VehicleParams
    {
        // максимальный объём груза (м3)
        maxValue: number;
        // максимальный вес груза (кг)
        maxWeight: number;
        // зартаты (руб за 1 км)
        expences: number;
        // свой тариф руб на 100 км за 1000 кг
        taxWeight: number;
        // свой тариф руб на 100 км за 1 м3
        taxValue: number;

        constructor()
        {
            this.maxValue = 82;
            this.maxWeight = 20000;
            this.expences = 25;
            this.taxWeight = 125;
            this.taxValue = 30.5;
        }
    }

    export class CalculateRouteController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;
        public errorData: ServerData.AjaxServerResponse = null;
        public taskData: ServerData.AjaxTaskList;
        public routeData: ServerData.AjaxRoutePointList;
        public vehicleParams: VehicleParams;

        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentComp.application = app;
            __currentComp.state = state;

            // настраиваем обработчики событий
            $("#i-page-search-link").click(__currentComp.onMainMenuLinkClick);
            $("#i-page-cargoselected-link").click(__currentComp.onMainMenuLinkClick);
            // проверяем авторизован ли пользователь
            var authentificated: boolean = __currentComp.application.isAuthentificated();

            // Получаем первую страницу из списка грузов
            __currentComp.getTasksPageData(1);

            // TODO переделать на загрузку сохранённых данных из базы
            __currentComp.vehicleParams = new VehicleParams();
            __currentComp.fillVehicleParams();

            // Сообщаем приложению, что компонент загружен.
            //__currentComp.onComponentLoaded();
        }

        onUpdate(state: Application.IState): void
        {
            // TODO Чистим список результатов поиска


            __currentComp.onComponentLoaded();
        }

        onShow(state: Application.IState): void
        {
            // Ничего не делаем
        }

        onHide(state: Application.IState): void
        {
            // Ничего не делаем
        }

        onLogin(): void
        {
            //__currentComp.switchSaveQuerySectionVisible(true);
        }

        onLogout(): void
        {
            //__currentComp.switchSaveQuerySectionVisible(false);
        }

        dataLoaded(sender: Application.IComponent): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dataReady(sender: Application.IComponent): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        {
            // Дочерних компонентов нет, ничего не делаем
        }

        dictDataReady(name: string): void
        {
        }

        onComponentLoaded(): void
        {
            __currentComp.isComponentLoaded = true;
            __currentComp.application.componentReady();
        }


        getTasksPageData(pageNumber: number): void
        {
            // показываем иконку загрузки
            __currentComp.application.showOverlay("#i-ctrl-tasks-table-overlay", "#i-ctrl-tacks-container");

            $.ajax({
                type: "GET",
                url: __currentComp.application.getFullUri("api/route/" + pageNumber.toString()),
                success: __currentComp.onAjaxGetTasksPageDataSuccess,
                error: __currentComp.onAjaxGetTasksPageDataError
            });
        }


        onAjaxGetTasksPageDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("_onAjaxError");

            __currentComp.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentComp.dataError(__currentComp, __currentComp.errorData);

            // TODO обрабатываем ошибки сервера

            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");

        }

        onAjaxGetTasksPageDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            var resp: ServerData.AjaxRoutePointListAndAjaxTaskList = <ServerData.AjaxRoutePointListAndAjaxTaskList>data.data;
            __currentComp.taskData = resp.ajaxTaskList;
            __currentComp.routeData = resp.routePointList;
            

            // помещаем данные в контролы
            __currentComp.drawTasksList();
            __currentComp.drawRouteTable();

            if (false == __currentComp.isComponentLoaded)
            {
                __currentComp.onComponentLoaded();
                __currentComp.dataLoaded(__currentComp);
            }
            else
            {
                __currentComp.dataReady(__currentComp);
            }

            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
        }

        fillVehicleParams(): void
        {
            $("#i-calc-param-max-weight").val(__currentComp.vehicleParams.maxWeight);
            $("#i-calc-param-max-value").val(__currentComp.vehicleParams.maxValue);
            $("#i-calc-param-expense").val(__currentComp.vehicleParams.expences);
            $("#i-calc-param-tax-weight").val(__currentComp.vehicleParams.taxWeight);
            $("#i-calc-param-tax-value").val(__currentComp.vehicleParams.taxValue);

        }

        drawTasksList(): void
        {
            // Чистим строки в таблице
            __currentComp.clearTasksList();

            // чистим панель навигации по страницам
            __currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            __currentComp.drawTaskTableRows();

            // рисуем панель навигации по страницам
            __currentComp.drawPageNavigation();
        }

        drawTaskTableRows(): void
        {
            var tbody: JQuery = $("#i-ctrl-tasks-table > tbody");

            var rowTempl: JQuery = $("#i-ctrl-tasks-table-row-template");

            for (var i: number = 0; i < __currentComp.taskData.tasks.length; i++)
            {
                var task: ServerData.AjaxTask = __currentComp.taskData.tasks[i];
                var row: JQuery = rowTempl.clone();
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
                $("td.c-ctrl-tasks-table-cell-chk > :checkbox", row).click(__currentComp.onTaskSelected);

                row.appendTo(tbody);
            }
        }

        drawPageNavigation(): void
        {
            // рассчитываем данные панели навигации
            // ... отображаемое количество ссылок
            var displayPagesNumber: number = 10;
            // ... номер страницы в первой отображаемой ссылке
            var displayFirstPageNumber: number;
            // ... номер страницы в последней отображаемой ссылке
            var displayLastPageNumber: number;
            // ... общее количество страниц в выборке
            var allPagesNumber: number;
            // ... номер текущей страницы
            var currentPageNumber: number;

            // рассчитываем общее количество страниц в выборке
            allPagesNumber = Math.ceil(__currentComp.taskData.allRowCount / __currentComp.taskData.limit);

            // номер текущей страницы
            currentPageNumber = __currentComp.taskData.page;

            // находим номер первой страницы в списке
            displayFirstPageNumber = currentPageNumber - Math.floor(displayPagesNumber / 2);
            displayFirstPageNumber = Math.max(displayFirstPageNumber, 1);
            // находим номер последней страницы в списке
            displayLastPageNumber = Math.min(allPagesNumber, displayFirstPageNumber + displayPagesNumber - 1);
            // корректируем номер первой страницы в списке
            displayFirstPageNumber = Math.max(displayLastPageNumber - displayPagesNumber + 1, 1);

            // рисуем панель навигации
            var container: JQuery = $("#i-ctrl-tasks-navpage-container");
            var pageNumTempl: JQuery = $("#i-ctrl-tasks-navpage-pagelink-template");

            for (var i: number = displayFirstPageNumber; i <= displayLastPageNumber; i++)
            {
                var pageNumContainer: JQuery = pageNumTempl.clone();
                pageNumContainer.removeAttr("id");
                pageNumContainer.attr("data-page-num", i);
                pageNumContainer.text(i);
                pageNumContainer.appendTo(container);

                if (i == currentPageNumber)
                {
                    pageNumContainer.addClass("c-ctrl-tasks-navpage-panel-link-current");
                }
                else
                {
                    // привязываем обработчик события
                    pageNumContainer.click(__currentComp.onPageNavigationClick);
                }
            }

            // расставляем обработчики и стили на сслыки быстрой навигации
            // ... отображаем ли ссылку на страницу назад
            var displayPrevLinkActive: boolean = (currentPageNumber > 1);
            // ... отображаем ли ссылку на страницу вперёд
            var displayNextLinkActive: boolean = (currentPageNumber < allPagesNumber);
            // ... отображаем ли ссылку на страницу назад
            var displayPrevPageLinkActive: boolean = (displayFirstPageNumber > 1);
            // ... отображаем ли ссылку на страницу вперёд
            var displayNextPageLinkActive: boolean = (displayLastPageNumber < allPagesNumber);
            // ... отображаем ли ссылку на первую страницу
            var displayFirstLinkActive: boolean = (currentPageNumber != 1);
            // ... отображаем ли ссылку на последнюю страницу
            var displayLastLinkActive: boolean = (currentPageNumber < allPagesNumber);

            var linkPageNumber: number;

            if (displayPrevLinkActive)
            {
                linkPageNumber = Math.max(currentPageNumber - 1, 1);
                $("#i-ctrl-tasks-navpage-prev").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextLinkActive)
            {
                linkPageNumber = Math.min(currentPageNumber + 1, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayPrevPageLinkActive)
            {
                linkPageNumber = Math.max(currentPageNumber - displayPagesNumber, 1);
                $("#i-ctrl-tasks-navpage-prev-page").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayNextPageLinkActive)
            {
                linkPageNumber = Math.min(currentPageNumber + displayPagesNumber, allPagesNumber);
                $("#i-ctrl-tasks-navpage-next-page").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayFirstLinkActive)
            {
                linkPageNumber = 1;
                $("#i-ctrl-tasks-navpage-first").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }

            if (displayLastLinkActive)
            {
                linkPageNumber = allPagesNumber;
                $("#i-ctrl-tasks-navpage-last").click(__currentComp.onPageNavigationClick).removeClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", linkPageNumber);
            }


        }


        onMainMenuLinkClick(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var id: string = elem.attr("id");

            if ("i-page-search-link" == id)
                __currentComp.application.navigateTo("search");
            else if ("i-page-cargoselected-link" == id)
                __currentComp.application.navigateTo("cargoselected");
        }

        onTaskSelected(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var checked: boolean = elem.is(":checked");
            var taskId: number = parseInt(elem.parent().parent().attr("data-id"));
            var taskSelectedId: number = parseInt(elem.parent().parent().attr("data-selected-id"));

            // создаём список ID обрабатываемых узлов
            var taskIdsList = new ServerData.AjaxIdsList();
            taskIdsList.ids = [];

            // показываем иконку загрузки
            __currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // добавляем задание в маршрут
            if (checked)
            {
                taskIdsList.ids.push(taskId); 

                $.ajax({
                    type: "POST",
                    url: __currentComp.application.getFullUri("api/route"),
                    data: JSON.stringify(taskIdsList),
                    contentType: "application/json",
                    dataType: "json",
                    success: __currentComp.onAjaxTaskSelectedDataSuccess,
                    error: __currentComp.onAjaxTaskSelectedDataError
                });
            }
            // удаляем задание из маршрута
            else
            {
                taskIdsList.ids.push(taskSelectedId); 

                $.ajax({
                    type: "DELETE",
                    url: __currentComp.application.getFullUri("api/route"),
                    data: JSON.stringify(taskIdsList),
                    contentType: "application/json",
                    dataType: "json",
                    success: __currentComp.onAjaxTaskUnselectedDataSuccess,
                    error: __currentComp.onAjaxTaskUnselectedDataError
                });
            }

        }


       
        onAjaxTaskSelectedDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("onAjaxTaskSelectedDataError");

            __currentComp.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentComp.dataError(__currentComp, __currentComp.errorData);

            // TODO обрабатываем ошибки сервера



            // TODO снимаем галочку у узла в списке


            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");

        }

        onAjaxTaskSelectedDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("onAjaxTaskSelectedDataSuccess");

            // добавление задания в маршрут произведена успешно - необходимо скорректировать таблицу маршрута
            __currentComp.routeData = (<ServerData.AjaxIdsListAndRoutePointList>data.data).routePointList;
            __currentComp.drawRouteTable();

            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");
        }


        onAjaxTaskUnselectedDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("onAjaxTaskSelectedDataError");

            __currentComp.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentComp.dataError(__currentComp, __currentComp.errorData);

            // TODO обрабатываем ошибки сервера



            // TODO возвращаем галочку у узла в списке


            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");

        }

        onAjaxTaskUnselectedDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("onAjaxTaskSelectedDataSuccess");

            // удаление задания из маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            __currentComp.routeData = (<ServerData.AjaxIdsListAndRoutePointList>data.data).routePointList;
            __currentComp.drawRouteTable();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");
        }





        onPageNavigationClick(event: JQueryEventObject): void
        {
            var ctrl: JQuery = $(event.delegateTarget);
            //window.console.log("onTaskEditClick " + ctrl.attr("data-id"));

            var pageNum: number = parseInt(ctrl.attr("data-page-num"));

            // загружаем данные указанной страницы
            __currentComp.getTasksPageData(pageNum);
        }


        clearTasksList(): void
        {
            // получаем все строки таблицы
            var rows: JQuery = $("#i-ctrl-tasks-table > tbody > tr");
            // удаляем все обработчики событий
            $("#i-ctrl-tasks-table > tbody > tr > td > :checkbox").unbind("click", __currentComp.onTaskSelected);
            // удаляем все строки таблицы
            rows.remove();
        }

        clearPageNavigation(): void
        {
            // удаляем обработчики событий со ссылок быстрой навигации и ставим стили по умолчанию
            $("#i-ctrl-tasks-navpage-prev, #i-ctrl-tasks-navpage-next, #i-ctrl-tasks-navpage-prev-page, #i-ctrl-tasks-navpage-next-page, #i-ctrl-tasks-navpage-first, #i-ctrl-tasks-navpage-last").unbind("click", __currentComp.onPageNavigationClick).addClass("c-ctrl-tasks-navpage-panel-link-disabled").attr("data-page-num", "");
            
            // получаем коллекцию контролов с номерами страниц
            var divs: JQuery = $("#i-ctrl-tasks-navpage-container > div");
            // удаляем все обработчики событий
            divs.unbind("click", __currentComp.onPageNavigationClick);
            // удаляем все контейнеры навигации
            divs.remove();
        }

        drawRouteTable(): void
        {
            var route: ServerData.AjaxRoutePoint[] = __currentComp.routeData.routePoints;

            // очищаем таблицу маршрута
            __currentComp.clearRouteTable();

            if (route.length < 1)
            {
                __currentComp.showHideRouteTableAbsentRow(true);
                return;
            }

            // рисуем строки маршрута
            __currentComp.showHideRouteTableAbsentRow(false);

            var tbody: JQuery = $("#i-calc-routes-table > tbody");
            var commulativeDistance: number = 0;
            var commulativeCost: number = 0;
            var commulativeExpences: number = 0;
            var commulativeProfit: number = 0;
            var currentWeight: number = 0;
            var currentValue: number = 0;
            var prevResWeight: number = 0;
            var prevResValue: number = 0;
            var traceStop: boolean = false;

            for (var i: number = 0; i < route.length; i++)
            {
                var entry: ServerData.AjaxRoutePoint = route[i];
                var row: JQuery = __currentComp.createRouteEntryRow(entry);

                // накопленная дистанция
                commulativeDistance = commulativeDistance + parseFloat(entry.routePointDistance);
                $("td.calc-table-col-sum-distance", row).text(commulativeDistance.toFixed(0));
                
                // текущий вес груза
                currentWeight = currentWeight + parseFloat(entry.weight);
                $("td.calc-table-col-sum-weight", row).text(currentWeight.toFixed(0));

                // подсветка текущего веса груза
                var currentWeightPrc: number = (currentWeight / __currentComp.vehicleParams.maxWeight) * 100;

                if (currentWeightPrc > 100)
                {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-res-empty");
                }
                else
                {
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentWeightPrc + "% 100%");
                }

                // текущий объём груза
                currentValue = currentValue + parseFloat(entry.value);
                $("td.calc-table-col-sum-value", row).text(currentValue.toFixed(2));

                // подсветка текущего объёма груза
                var currentValuePrc: number = (currentValue / __currentComp.vehicleParams.maxValue) * 100;

                if (currentValuePrc > 100)
                {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-res-empty");
                }
                else
                {
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-weight-value-pc").css("background-size", currentValuePrc + "% 100%");
                }


                // резерв веса
                var resWeight: number = __currentComp.vehicleParams.maxWeight - currentWeight;
                $("td.calc-table-col-res-weight", row).text(resWeight.toFixed(0));

                // подсветка резерва веса
                if (resWeight < 0)
                {
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-empty");
                }
                else
                {
                    var resWeightPrc: number = (resWeight / __currentComp.vehicleParams.maxWeight) * 100;
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-pc").css("background-size", resWeightPrc + "% 100%"); 
                }

                // резерв объёма
                var resValue: number = __currentComp.vehicleParams.maxValue - currentValue;
                $("td.calc-table-col-res-value", row).text(resValue.toFixed(2));

                // подсветка резерва объёма
                if (resValue < 0)
                {
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-empty");
                }
                else
                {
                    var resValuePrc: number = (resValue / __currentComp.vehicleParams.maxValue) * 100;
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-pc").css("background-size", resValuePrc + "% 100%");
                }


                // подсветка трассировки
                if (resWeight < 0 || resValue < 0 || true == traceStop)
                {
                    $("td.calc-table-col-trace", row).addClass("trace-stop");
                    traceStop = true;
                }
                else
                {
                    $("td.calc-table-col-trace", row).addClass("trace-pass");
                }


                // затраты
                var exprences: number = parseFloat(entry.routePointDistance) * __currentComp.vehicleParams.expences;
                $("td.calc-table-col-expense", row).text(exprences.toFixed(0));

                // прибыль
                var profit: number = parseFloat(entry.cost) - exprences;
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
                var lostProceedsForWeight: number = prevResWeight / 1000 * parseFloat(entry.routePointDistance) / 100 * __currentComp.vehicleParams.taxWeight;
                var lostProceedsForValue: number = prevResValue * parseFloat(entry.routePointDistance) / 100 * __currentComp.vehicleParams.taxValue;
                var lostProceeds: number = Math.max(lostProceedsForWeight, lostProceedsForValue);
                $("td.calc-table-col-lost-proceeds", row).text(lostProceeds.toFixed(0));

                // целевая прибыль
                var targetProfitForWeight: number = commulativeDistance / 100 * __currentComp.vehicleParams.maxWeight / 1000 * __currentComp.vehicleParams.taxWeight - commulativeExpences;
                var targetProfitForValue: number = commulativeDistance / 100 * __currentComp.vehicleParams.maxValue * __currentComp.vehicleParams.taxValue - commulativeExpences;
                var targetProfit: number = Math.max(targetProfitForWeight, targetProfitForValue);
                $("td.calc-table-col-target-profit", row).text(targetProfit.toFixed(0));


                // сохраняем данные о резерве загрузки машины в прошлой точке маршрута
                prevResWeight = resWeight;
                prevResValue = resValue;

                // Добавляем строку в таблицу
                row.appendTo(tbody);
            }
            

        }

        createRouteEntryRow(routeEntry: ServerData.AjaxRoutePoint): JQuery
        {
            var rowTemplate: JQuery = $("#i-calc-routes-table-tr-template");
            // создаём новую строку 
            var row: JQuery = rowTemplate.clone();
            row.removeAttr("id");
            row.removeClass("hidden");

            // заполняем данными строку
            row.attr("data-point-id", routeEntry.routePointId);
            row.attr("data-cargo-id", routeEntry.cargoId);
            row.attr("data-city-id", routeEntry.cityId);

            var num: string = routeEntry.cargoId.toString();
            
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
            $("td.calc-table-col-up", row).click(__currentComp.onRoutePointUpDownClick);
            $("td.calc-table-col-down", row).click(__currentComp.onRoutePointUpDownClick);

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
        }


        clearRouteTable(): void
        {
            $("#i-calc-routes-table > tbody > tr[data-point-id] > td > span").unbind();
            $("#i-calc-routes-table > tbody > tr[data-point-id]").unbind().remove();
        }

        showHideRouteTableAbsentRow(show: boolean): void
        {
            var rowRouteAbsent: JQuery = $("#i-calc-routes-table-tr-absent");
            var rowTotal: JQuery = $("#i-calc-routes-table-foot-total");

            if (show)
            {
                rowRouteAbsent.removeClass("hidden");
                rowTotal.addClass("hidden");
            }
            else
            {
                rowRouteAbsent.addClass("hidden");
                rowTotal.removeClass("hidden");
            }
        }


        onRoutePointUpDownClick(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var className: string = elem.attr("class");
            var row: JQuery = elem.parent();
            var rowInsertAfter: JQuery = null;

            if ("calc-table-col-up" == className)
            {
                // нужно переместить строку вверх через 1 строку
                rowInsertAfter = row.prev();

                if (null != rowInsertAfter)
                    rowInsertAfter = rowInsertAfter.prev();
            }

            if ("calc-table-col-down" == className)
            {
                // нужно переместить строку вниз на 1 строку
                rowInsertAfter = row.next();
            }


            // подготавливаем структуцру данных для отправки на сервер
            var place: ServerData.AjaxRoutePointPlace = new ServerData.AjaxRoutePointPlace();
            place.routePointId = parseInt(row.attr("data-point-id"));
            place.afterRoutePointId = 0;

            if (null != rowInsertAfter)
                place.afterRoutePointId = parseInt(rowInsertAfter.attr("data-point-id"));

            // показываем иконку загрузки
            __currentComp.application.showOverlay("#i-ctrl-overlay", "#i-calc-contents");

            // отправляем данные на сервер
            $.ajax({
                type: "PUT",
                url: __currentComp.application.getFullUri("api/route"),
                data: JSON.stringify(place),
                contentType: "application/json",
                dataType: "json",
                success: __currentComp.onAjaxPointUpDownSuccess,
                error: __currentComp.onAjaxPointUpDownError
            });


        }


        onAjaxPointUpDownError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            //window.console.log("onAjaxTaskSelectedDataError");

            __currentComp.errorData = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
            __currentComp.dataError(__currentComp, __currentComp.errorData);

            // TODO обрабатываем ошибки сервера



            // если ошибка "Требуется авторизация", то требуем у Application проверить текущий статус авторизации
            //if (2 == parseInt(__currentTasksProfile.errorData.code))
            //    __currentTasksProfile.application.checkAuthStatus();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");

        }

        onAjaxPointUpDownSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("onAjaxTaskSelectedDataSuccess");

            // удаление задания из маршрута произведено успешно - необходимо скорректировать таблицу маршрута
            __currentComp.routeData = (<ServerData.AjaxRoutePointPlaceAndRoutePointList>data.data).routePointList;
            __currentComp.drawRouteTable();


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-overlay");
        }







        onDocumentReady(): void
        {
            /////////////////////////////////////
            // цепляем обработчики событий
            

            // настраиваем Application
            Application.__currentApp.init(__currentComp, false);
        }





    }

    export var __currentComp: CalculateRouteController = new CalculateRouteController();
}

$(document).ready(CalculateRoute.__currentComp.onDocumentReady);