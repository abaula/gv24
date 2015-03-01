///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module Search
{
    export class AjaxTask
    {
        public id: number;
        public city1: string;
        public city2: string;
        public type: string;
        public weight: number;
        public value: number;
        public distance: number;
        public cost: number;
        public readyDate: string;
    }

    export class AjaxTaskList
    {
        public offset: number;
        public limit: number;
        public allRowCount: number;
        public page: number;
        public tasks: AjaxTask[];
    }

    export class SearchController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;
        public errorData: ServerData.AjaxServerResponse = null;
        public taskData: AjaxTaskList;


        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentComp.application = app;
            __currentComp.state = state;

            // настраиваем обработчики событий

/*
            $("#i-ctrl-search-form-cargo-type-up-down-button").click(__currentComp.onCargoTypeUpDownButtonClick);
*/


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
            $.ajax({
                type: "GET",
                url: __currentComp.application.getFullUri("api/searchtasks/" + pageNumber.toString()),
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
        }

        onAjaxGetTasksPageDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //window.console.log("_onAjaxGetAccountDataSuccess");

            // загрузка компонента произведена успешно
            __currentComp.taskData = <AjaxTaskList>data.data;

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
        }


        drawTasksList(): void
        {
            // Чистим строки в таблице
            __currentComp.clearTasksList();


            // отображаем в таблице полученные с сервера данные
            var tbody: JQuery = $("#i-ctrl-tasks-table > tbody");

            var rowTempl: JQuery = $("#i-ctrl-tasks-table-row-template");

            for (var i: number = 0; i < __currentComp.taskData.tasks.length; i++)
            {
                var task: AjaxTask = __currentComp.taskData.tasks[i];
                var row: JQuery = rowTempl.clone();
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



        }

        clearTasksList(): void
        {
            // удаляем все строки таблицы
            var row: JQuery = $("#i-ctrl-tasks-table > tbody > tr");
            row.remove();
        }

        onDocumentReady(): void
        {
            /////////////////////////////////////
            // цепляем обработчики событий
            

            // настраиваем Application
            Application.__currentApp.init(__currentComp, false);
        }





    }

    export var __currentComp: SearchController = new SearchController();
}

$(document).ready(Search.__currentComp.onDocumentReady);