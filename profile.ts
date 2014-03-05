///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="accountprofile.ts"/>
///<reference path="orgprofile.ts"/>
///<reference path="vehicleprofile.ts"/>
///<reference path="tasksprofile.ts"/>

module Profile
{
  
    export class ProfileController implements Application.IComponent
    {
        public isComponentLoaded: boolean = false;
        public application: Application.IApplication = null;
        public state: Application.IState = null;

        onLoad(app: Application.IApplication, parent: Application.IComponent, state: Application.IState): void
        {
            __currentComp.application = app;
            __currentComp.state = state;

            // отображаем компонент страницы по умолчанию
            __currentComp.showDefaultComponent();

            //__currentComp.application.componentError("Тестовое сообщение об ошибке");
            //__currentComp.application.componentReady();
        }

        onUpdate(state: Application.IState): void
        {
            // получаем выделенный пункт меню
            var id: string = __currentComp.getSelectedMenuTargetId();            
            // посылаем активному компоненту сообщение о необходимости обновить свои данные из БД
            __currentComp.hideComponent(id);
            __currentComp.updateComponentData(id);
        }

        onShow(state: Application.IState): void
        {
            // отображаем компонент страницы по умолчанию
            __currentComp.showDefaultComponent();
        }

        onHide(state: Application.IState): void
        {
            // посылаем сообщение Hide активному компоненту

            // получаем выделенный пункт меню
            var id: string = __currentComp.getSelectedMenuTargetId();

            if ("i-ctrl-profile-account-container" == id)
            {
                AccountProfile.__currentAccProfile.onHide(__currentComp.state);
            }
            else if ("i-ctrl-profile-org-container" == id)
            {
                OrgProfile.__currentOrgProfile.onHide(__currentComp.state);
            }
            else if ("i-ctrl-profile-tasks-container" == id)
            {

            }
            else if ("i-ctrl-profile-vehicle-container" == id)
            {
                VehicleProfile.__currentVehProfile.onHide(__currentComp.state); 
            }
        }

        dataLoaded(sender: Application.IComponent): void
        {
            __currentComp.drawComponentData(sender);
            __currentComp.isComponentLoaded = true;
            __currentComp.application.componentReady();            
        }

        dataReady(sender: Application.IComponent): void
        {
            __currentComp.drawComponentData(sender);
            __currentComp.application.componentReady();
        }

        dataError(sender: Application.IComponent, error: ServerData.AjaxServerResponse): void
        {
            __currentComp.drawComponentError(error.userMessage);
            __currentComp.application.componentReady();
        }
        
        dictDataReady(name: string): void
        {
        }

        onProfileNavigationMenuItemClick(event: JQueryEventObject): void
        {
            // получаем елемент требующий выделения
            var compId: string = $(event.delegateTarget).attr("data-target-id");
            __currentComp.switchActiveComponent(compId, false);
        }

        onUpdateButtonClick(event: JQueryEventObject): void
        {
            // получаем выделенный пункт меню
            var id: string = __currentComp.getSelectedMenuTargetId();
            // обновляем данные активного компонента
            __currentComp.hideComponent(id);
            __currentComp.updateComponentData(id);
        }

        updateComponentData(id: string): void
        {
            if ("i-ctrl-profile-account-container" == id)
            {
                AccountProfile.__currentAccProfile.onUpdate(__currentComp.state);
            }
            else if ("i-ctrl-profile-org-container" == id)
            {
                OrgProfile.__currentOrgProfile.onUpdate(__currentComp.state);
            }
            else if ("i-ctrl-profile-tasks-container" == id)
            {
                TasksProfile.__currentTasksProfile.onUpdate(__currentComp.state);
            }
            else if ("i-ctrl-profile-vehicle-container" == id)
            {
                VehicleProfile.__currentVehProfile.onUpdate(__currentComp.state); 
            }
        }

        switchActiveComponent(compId: string, force: boolean): void
        {
            // получаем выделенный пункт меню
            var id: string = __currentComp.getSelectedMenuTargetId();

            if (false == force && compId == id)
            {
                // при множественных кликах на активный элемент ничего не делаем
                return;
            }

            // меняем активный пункт меню
            __currentComp.swithActiveMenuItem(compId);

            // прячем прежний активный раздел
            __currentComp.hideComponent(id);

            // отображаем новый активный раздел
            __currentComp.getComponentData(compId);            
        }

        swithActiveMenuItem(id: string): void
        {
            // сбрасываем выделение у всех пунктов меню
            $("#i-ctrl-profile-navigation-block > div.selected").removeClass("selected");
            // выделяем активное меню
            $("#i-ctrl-profile-navigation-block > div[data-target-id=" + id + "]").addClass("selected");
        }

        // скрываем компонент страницы
        hideComponent(id: string): void
        {
            // прячем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("block").addClass("hidden");
            // отображаем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("hidden").addClass("block");

            if ("i-ctrl-profile-account-container" == id)
            {
                $("#i-ctrl-profile-account-container").removeClass("block").addClass("hidden");
                AccountProfile.__currentAccProfile.onHide(__currentComp.state);
            }
            else if ("i-ctrl-profile-org-container" == id)
            {
                $("#i-ctrl-profile-org-container").removeClass("block").addClass("hidden");
                OrgProfile.__currentOrgProfile.onHide(__currentComp.state);
            }
            else if ("i-ctrl-profile-tasks-container" == id)
            {
                $("#i-ctrl-profile-tasks-container").removeClass("block").addClass("hidden");
                TasksProfile.__currentTasksProfile.onHide(__currentComp.state);
            }
            else if ("i-ctrl-profile-vehicle-container" == id)
            {
                $("#i-ctrl-profile-vehicle-container").removeClass("block").addClass("hidden");
                VehicleProfile.__currentVehProfile.onHide(__currentComp.state); 
            }
        }

        // отображаем компонент страницы
        getComponentData(id: string): void
        {
            // сообщаем контроллеру компонента, о необходимости отобразить данные
            if ("i-ctrl-profile-account-container" == id)
            {
                if (AccountProfile.__currentAccProfile.isComponentLoaded)
                    AccountProfile.__currentAccProfile.onShow(__currentComp.state);
                else
                    AccountProfile.__currentAccProfile.onLoad(__currentComp.application, __currentComp, __currentComp.state);
            }
            else if ("i-ctrl-profile-org-container" == id)
            {
                if (OrgProfile.__currentOrgProfile.isComponentLoaded)
                    OrgProfile.__currentOrgProfile.onShow(__currentComp.state);
                else
                    OrgProfile.__currentOrgProfile.onLoad(__currentComp.application, __currentComp, __currentComp.state);
            }
            else if ("i-ctrl-profile-tasks-container" == id)
            {                
                if (TasksProfile.__currentTasksProfile.isComponentLoaded)
                    TasksProfile.__currentTasksProfile.onShow(__currentComp.state);
                else
                    TasksProfile.__currentTasksProfile.onLoad(__currentComp.application, __currentComp, __currentComp.state);
            }
            else if ("i-ctrl-profile-vehicle-container" == id)
            {                
                if (VehicleProfile.__currentVehProfile.isComponentLoaded)
                    VehicleProfile.__currentVehProfile.onShow(__currentComp.state);
                else
                    VehicleProfile.__currentVehProfile.onLoad(__currentComp.application, __currentComp, __currentComp.state);
            }
        }

        /*
            Отображаем компонент по умолчанию
        */
        showDefaultComponent(): void
        {
            // переключаемся
            __currentComp.switchActiveComponent("i-ctrl-profile-account-container", true);
        }


        /*
            Компонент готов для отображения на странице
        */
        drawComponentData(component: Application.IComponent): void
        {
            // Перед отображением панели, мы должны быть уверены, что пользователь ещё ждёт.
            // Операция подготовки данных в панели проходит асинхронно 
            // и пользователь может переключить панель во время ожидания

            // прячем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("block").addClass("hidden");
            // прячем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("block").addClass("hidden");

            // получаем выделенный пункт меню
            var id: string = __currentComp.getSelectedMenuTargetId();

            if ("i-ctrl-profile-account-container" == id
                && component == AccountProfile.__currentAccProfile)
            {                
                // отображаем панель аккаунта
                $("#i-ctrl-profile-account-container").removeClass("hidden").addClass("block");
            }
            else if ("i-ctrl-profile-org-container" == id
                && component == OrgProfile.__currentOrgProfile)
            {
                // отображаем панель организации
                $("#i-ctrl-profile-org-container").removeClass("hidden").addClass("block");
            }
            else if ("i-ctrl-profile-tasks-container" == id
                && component == TasksProfile.__currentTasksProfile)
            {
                // отображаем панель заданий на перевозку
                $("#i-ctrl-profile-tasks-container").removeClass("hidden").addClass("block");
            }

            else if ("i-ctrl-profile-vehicle-container" == id
                && component == VehicleProfile.__currentVehProfile)
            {
                // отображаем панель машины
                $("#i-ctrl-profile-vehicle-container").removeClass("hidden").addClass("block");
            }

        


        }

        /*
            В компоненте произошла ошибка
        */
        drawComponentError(message: string): void
        {
            // прячем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("block").addClass("hidden");
            // отображаем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("hidden").addClass("block");
            $("#i-ctrl-profile-error-text").text(message);
        }

        getSelectedMenuTargetId(): string
        {
            var selectedItem: JQuery = $("#i-ctrl-profile-navigation-block > div.selected");
            return selectedItem.attr("data-target-id");
        }


        onDocumentReady(): void
        {
            /////////////////////////////////////
            // цепляем обработчики событий

            // навигация по разделам профайла
            $("#i-ctrl-profile-navigation-block > div").click(__currentComp.onProfileNavigationMenuItemClick);
            $("#i-ctrl-profile-update-btn").click(__currentComp.onUpdateButtonClick);


            // настраиваем Application
            Application.__currentApp.init(__currentComp, true);            
        }

    }

    export var __currentComp: ProfileController = new ProfileController();
}

$(document).ready(Profile.__currentComp.onDocumentReady);