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
        }
        SearchController.prototype.onLoad = function (app, parent, state) {
            Search.__currentComp.application = app;
            Search.__currentComp.state = state;

            // TODO загружаем словари
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
        };

        SearchController.prototype.onComponentLoaded = function () {
            Search.__currentComp.isComponentLoaded = true;
            Search.__currentComp.application.componentReady();
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
