///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>

module Search
{

    export class SearchController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;

        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentComp.application = app;
            __currentComp.state = state;

            // TODO загружаем словари



            __currentComp.onComponentLoaded();
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