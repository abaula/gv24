///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module CalculateRoute
{
    export class CalculateRouteController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;
        public errorData: ServerData.AjaxServerResponse = null;
        public taskData: ServerData.AjaxTaskList;


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
                url: __currentComp.application.getFullUri("api/calculateroute/" + pageNumber.toString()),
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
            __currentComp.taskData = <ServerData.AjaxTaskList>data.data;

            // помещаем данные в контролы
            __currentComp.drawTasksList();

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


        drawTasksList(): void
        {
            // Чистим строки в таблице
            __currentComp.clearTasksList();

            // чистим панель навигации по страницам
            __currentComp.clearPageNavigation();

            // отображаем в таблице полученные с сервера данные
            __currentComp.drawTableRows();

            // рисуем панель навигации по страницам
            __currentComp.drawPageNavigation();
        }

        drawTableRows(): void
        {
            var tbody: JQuery = $("#i-ctrl-tasks-table > tbody");

            var rowTempl: JQuery = $("#i-ctrl-tasks-table-row-template");

            for (var i: number = 0; i < __currentComp.taskData.tasks.length; i++)
            {
                var task: ServerData.AjaxTask = __currentComp.taskData.tasks[i];
                var row: JQuery = rowTempl.clone();
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

            // TODO добавляем задание в маршрут
        }


       
        onAjaxTaskSelectedDataError(jqXHR: JQueryXHR, status: string, message: string): void
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

        onAjaxTaskSelectedDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            __currentComp.taskData = <ServerData.AjaxTaskList>data.data;


            // скрываем иконку загрузки
            __currentComp.application.hideOverlay("#i-ctrl-tasks-table-overlay");
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