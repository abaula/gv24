///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="page.ts"/>
///<reference path="ServerAjaxData.d.ts"/>

module Template
{
    /*
        == Шаблон класса ==
        Класс отвечает за внутреннюю логику работы отдельных компонентов страницы
        Отвечает за диспетчеризацию событий между компонентами 
        и визуализацию компонентов страницы
    */
    export class TemplateController
    {
        /*
        Обработка события успешной авторизации
        */
        onAuthorized(login: boolean): void
        {
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
        }


        onDocumentReady(): void
        {
            /////////////////////////////////////
            // цепляем обработчики событий
            //


            // настраиваем контролёр страницы
            //Page.PageController.prototype.Init(true, Template.TemplateController.prototype.onAuthorized);
            

        }

    }
}

$(document).ready(Template.TemplateController.prototype.onDocumentReady);