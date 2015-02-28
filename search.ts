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

        cityTmpData1: Application.CityData = null;
        cityTmpData2: Application.CityData = null;
        cityBound1: boolean = false;
        cityBound2: boolean = false;

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
            if ("cargotype" == name)
            {
               // __currentComp.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            }
            else if ("cargoadrtype" == name)
            {
              //  __currentComp.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            }
            else if ("loadingtype" == name)
            {
               // __currentComp.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
              //  __currentComp.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }
        }

        onComponentLoaded(): void
        {
            __currentComp.isComponentLoaded = true;
            __currentComp.application.componentReady();
        }


        getTasksPageData(pageNumber: number): void
        {




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