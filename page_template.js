///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="page.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
var Template;
(function (Template) {
    /*
    == Шаблон класса ==
    Класс отвечает за внутреннюю логику работы отдельных компонентов страницы
    Отвечает за диспетчеризацию событий между компонентами
    и визуализацию компонентов страницы
    */
    var TemplateController = (function () {
        function TemplateController() {
        }
        /*
        Обработка события успешной авторизации
        */
        TemplateController.prototype.onAuthorized = function (login) {
            /*
            if (login)
            {
            // выполнен вход в систему
            
            }
            else
            {
            // выполнен выход из системы
            
            }
            */
        };

        TemplateController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            //
            // настраиваем контролёр страницы
            //Page.PageController.prototype.Init(true, Template.TemplateController.prototype.onAuthorized);
        };
        return TemplateController;
    })();
    Template.TemplateController = TemplateController;
})(Template || (Template = {}));

$(document).ready(Template.TemplateController.prototype.onDocumentReady);
