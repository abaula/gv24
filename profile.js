///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="application.ts"/>
///<reference path="accountprofile.ts"/>
///<reference path="orgprofile.ts"/>
///<reference path="vehicleprofile.ts"/>
///<reference path="tasksprofile.ts"/>
var Profile;
(function (Profile) {
    var ProfileController = (function () {
        function ProfileController() {
            this.isComponentLoaded = false;
            this.application = null;
            this.state = null;
        }
        ProfileController.prototype.onLoad = function (app, parent, state) {
            Profile.__currentComp.application = app;
            Profile.__currentComp.state = state;

            // отображаем компонент страницы по умолчанию
            Profile.__currentComp.showDefaultComponent();
            //__currentComp.application.componentError("Тестовое сообщение об ошибке");
            //__currentComp.application.componentReady();
        };

        ProfileController.prototype.onUpdate = function (state) {
            // получаем выделенный пункт меню
            var id = Profile.__currentComp.getSelectedMenuTargetId();

            // посылаем активному компоненту сообщение о необходимости обновить свои данные из БД
            Profile.__currentComp.hideComponent(id);
            Profile.__currentComp.updateComponentData(id);
        };

        ProfileController.prototype.onShow = function (state) {
            // отображаем компонент страницы по умолчанию
            Profile.__currentComp.showDefaultComponent();
        };

        ProfileController.prototype.onHide = function (state) {
            // посылаем сообщение Hide активному компоненту
            // получаем выделенный пункт меню
            var id = Profile.__currentComp.getSelectedMenuTargetId();

            if ("i-ctrl-profile-account-container" == id) {
                AccountProfile.__currentAccProfile.onHide(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-org-container" == id) {
                OrgProfile.__currentOrgProfile.onHide(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-tasks-container" == id) {
            } else if ("i-ctrl-profile-vehicle-container" == id) {
                VehicleProfile.__currentVehProfile.onHide(Profile.__currentComp.state);
            }
        };

        ProfileController.prototype.dataLoaded = function (sender) {
            Profile.__currentComp.drawComponentData(sender);
            Profile.__currentComp.isComponentLoaded = true;
            Profile.__currentComp.application.componentReady();
        };

        ProfileController.prototype.dataReady = function (sender) {
            Profile.__currentComp.drawComponentData(sender);
            Profile.__currentComp.application.componentReady();
        };

        ProfileController.prototype.dataError = function (sender, error) {
            Profile.__currentComp.drawComponentError(error.userMessage);
            Profile.__currentComp.application.componentReady();
        };

        ProfileController.prototype.dictDataReady = function (name) {
        };

        ProfileController.prototype.onProfileNavigationMenuItemClick = function (event) {
            // получаем елемент требующий выделения
            var compId = $(event.delegateTarget).attr("data-target-id");
            Profile.__currentComp.switchActiveComponent(compId, false);
        };

        ProfileController.prototype.onUpdateButtonClick = function (event) {
            // получаем выделенный пункт меню
            var id = Profile.__currentComp.getSelectedMenuTargetId();

            // обновляем данные активного компонента
            Profile.__currentComp.hideComponent(id);
            Profile.__currentComp.updateComponentData(id);
        };

        ProfileController.prototype.updateComponentData = function (id) {
            if ("i-ctrl-profile-account-container" == id) {
                AccountProfile.__currentAccProfile.onUpdate(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-org-container" == id) {
                OrgProfile.__currentOrgProfile.onUpdate(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-tasks-container" == id) {
                TasksProfile.__currentTasksProfile.onUpdate(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-vehicle-container" == id) {
                VehicleProfile.__currentVehProfile.onUpdate(Profile.__currentComp.state);
            }
        };

        ProfileController.prototype.switchActiveComponent = function (compId, force) {
            // получаем выделенный пункт меню
            var id = Profile.__currentComp.getSelectedMenuTargetId();

            if (false == force && compId == id) {
                // при множественных кликах на активный элемент ничего не делаем
                return;
            }

            // меняем активный пункт меню
            Profile.__currentComp.swithActiveMenuItem(compId);

            // прячем прежний активный раздел
            Profile.__currentComp.hideComponent(id);

            // отображаем новый активный раздел
            Profile.__currentComp.getComponentData(compId);
        };

        ProfileController.prototype.swithActiveMenuItem = function (id) {
            // сбрасываем выделение у всех пунктов меню
            $("#i-ctrl-profile-navigation-block > div.selected").removeClass("selected");

            // выделяем активное меню
            $("#i-ctrl-profile-navigation-block > div[data-target-id=" + id + "]").addClass("selected");
        };

        // скрываем компонент страницы
        ProfileController.prototype.hideComponent = function (id) {
            // прячем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("block").addClass("hidden");

            // отображаем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("hidden").addClass("block");

            if ("i-ctrl-profile-account-container" == id) {
                $("#i-ctrl-profile-account-container").removeClass("block").addClass("hidden");
                AccountProfile.__currentAccProfile.onHide(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-org-container" == id) {
                $("#i-ctrl-profile-org-container").removeClass("block").addClass("hidden");
                OrgProfile.__currentOrgProfile.onHide(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-tasks-container" == id) {
                $("#i-ctrl-profile-tasks-container").removeClass("block").addClass("hidden");
                TasksProfile.__currentTasksProfile.onHide(Profile.__currentComp.state);
            } else if ("i-ctrl-profile-vehicle-container" == id) {
                $("#i-ctrl-profile-vehicle-container").removeClass("block").addClass("hidden");
                VehicleProfile.__currentVehProfile.onHide(Profile.__currentComp.state);
            }
        };

        // отображаем компонент страницы
        ProfileController.prototype.getComponentData = function (id) {
            if ("i-ctrl-profile-account-container" == id) {
                if (AccountProfile.__currentAccProfile.isComponentLoaded)
                    AccountProfile.__currentAccProfile.onShow(Profile.__currentComp.state);
else
                    AccountProfile.__currentAccProfile.onLoad(Profile.__currentComp.application, Profile.__currentComp, Profile.__currentComp.state);
            } else if ("i-ctrl-profile-org-container" == id) {
                if (OrgProfile.__currentOrgProfile.isComponentLoaded)
                    OrgProfile.__currentOrgProfile.onShow(Profile.__currentComp.state);
else
                    OrgProfile.__currentOrgProfile.onLoad(Profile.__currentComp.application, Profile.__currentComp, Profile.__currentComp.state);
            } else if ("i-ctrl-profile-tasks-container" == id) {
                if (TasksProfile.__currentTasksProfile.isComponentLoaded)
                    TasksProfile.__currentTasksProfile.onShow(Profile.__currentComp.state);
else
                    TasksProfile.__currentTasksProfile.onLoad(Profile.__currentComp.application, Profile.__currentComp, Profile.__currentComp.state);
            } else if ("i-ctrl-profile-vehicle-container" == id) {
                if (VehicleProfile.__currentVehProfile.isComponentLoaded)
                    VehicleProfile.__currentVehProfile.onShow(Profile.__currentComp.state);
else
                    VehicleProfile.__currentVehProfile.onLoad(Profile.__currentComp.application, Profile.__currentComp, Profile.__currentComp.state);
            }
        };

        /*
        Отображаем компонент по умолчанию
        */
        ProfileController.prototype.showDefaultComponent = function () {
            // переключаемся
            Profile.__currentComp.switchActiveComponent("i-ctrl-profile-account-container", true);
        };

        /*
        Компонент готов для отображения на странице
        */
        ProfileController.prototype.drawComponentData = function (component) {
            // Перед отображением панели, мы должны быть уверены, что пользователь ещё ждёт.
            // Операция подготовки данных в панели проходит асинхронно
            // и пользователь может переключить панель во время ожидания
            // прячем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("block").addClass("hidden");

            // прячем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("block").addClass("hidden");

            // получаем выделенный пункт меню
            var id = Profile.__currentComp.getSelectedMenuTargetId();

            if ("i-ctrl-profile-account-container" == id && component == AccountProfile.__currentAccProfile) {
                // отображаем панель аккаунта
                $("#i-ctrl-profile-account-container").removeClass("hidden").addClass("block");
            } else if ("i-ctrl-profile-org-container" == id && component == OrgProfile.__currentOrgProfile) {
                // отображаем панель организации
                $("#i-ctrl-profile-org-container").removeClass("hidden").addClass("block");
            } else if ("i-ctrl-profile-tasks-container" == id && component == TasksProfile.__currentTasksProfile) {
                // отображаем панель заданий на перевозку
                $("#i-ctrl-profile-tasks-container").removeClass("hidden").addClass("block");
            } else if ("i-ctrl-profile-vehicle-container" == id && component == VehicleProfile.__currentVehProfile) {
                // отображаем панель машины
                $("#i-ctrl-profile-vehicle-container").removeClass("hidden").addClass("block");
            }
        };

        /*
        В компоненте произошла ошибка
        */
        ProfileController.prototype.drawComponentError = function (message) {
            // прячем панель загрузки
            $("#i-ctrl-profile-loading-container").removeClass("block").addClass("hidden");

            // отображаем панель ошибки
            $("#i-ctrl-profile-error-container").removeClass("hidden").addClass("block");
            $("#i-ctrl-profile-error-text").text(message);
        };

        ProfileController.prototype.getSelectedMenuTargetId = function () {
            var selectedItem = $("#i-ctrl-profile-navigation-block > div.selected");
            return selectedItem.attr("data-target-id");
        };

        ProfileController.prototype.onDocumentReady = function () {
            /////////////////////////////////////
            // цепляем обработчики событий
            // навигация по разделам профайла
            $("#i-ctrl-profile-navigation-block > div").click(Profile.__currentComp.onProfileNavigationMenuItemClick);
            $("#i-ctrl-profile-update-btn").click(Profile.__currentComp.onUpdateButtonClick);

            // настраиваем Application
            Application.__currentApp.init(Profile.__currentComp, true);
        };
        return ProfileController;
    })();
    Profile.ProfileController = ProfileController;

    Profile.__currentComp = new ProfileController();
})(Profile || (Profile = {}));

$(document).ready(Profile.__currentComp.onDocumentReady);
