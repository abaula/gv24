///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
var Search;
(function (Search) {
    var SearchController = (function () {
        function SearchController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
            this.cityTmpData1 = null;
            this.cityTmpData2 = null;
            this.cityBound1 = false;
            this.cityBound2 = false;
        }
        SearchController.prototype.onLoad = function (app, parent, state) {
            Search.__currentComp.application = app;
            Search.__currentComp.state = state;

            // настраиваем обработчики событий
            /*
            $("#i-ctrl-search-form-cargo-type-up-down-button").click(__currentComp.onCargoTypeUpDownButtonClick);
            */
            // проверяем авторизован ли пользователь
            var authentificated = Search.__currentComp.application.isAuthentificated();

            // Получаем первую страницу из списка грузов
            Search.__currentComp.getTasksPageData(1);

            // Сообщаем приложению, что компонент загружен.
            Search.__currentComp.onComponentLoaded();
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
            if ("cargotype" == name) {
                // __currentComp.drawCargoType(Dictionary.__currDictionary.cargoTypes);
            } else if ("cargoadrtype" == name) {
                //  __currentComp.drawCargoADRType(Dictionary.__currDictionary.cargoADRTypes);
            } else if ("loadingtype" == name) {
                // __currentComp.drawLoadingType(Dictionary.__currDictionary.loadingTypes);
                //  __currentComp.drawUnloadingType(Dictionary.__currDictionary.loadingTypes);
            }
        };

        SearchController.prototype.onComponentLoaded = function () {
            Search.__currentComp.isComponentLoaded = true;
            Search.__currentComp.application.componentReady();
        };

        SearchController.prototype.getTasksPageData = function (pageNumber) {
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
