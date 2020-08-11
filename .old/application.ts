///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="Dictionary.ts"/>

module Application
{

    export class CityData
    {
        id: number;
        latitude: number;
        longitude: number;
        name: string;
        fullname: string;
        district: string;
        region: string;
        suffix: string;
        cladrCode: string;
        postCode: string;
    }


    export class AjaxCityAutoComplete
    {
        searchString: string;
        cities: CityData[];
    }

    export interface ICitySelector
    {
        onCitySelected(city: CityData): void;
        onCitySelectedAbort(): void;
    }

    export class CitySelector
    {
        control: JQuery = null;
        component: ICitySelector = null;
        timer: number = 0;
        searchValue: string = null;
        busy: boolean = false;
        timeoutMs: number = 1000;
        currentRequest: JQueryXHR = null;
        listBlockHtml: JQuery = null;
        listData: AjaxCityAutoComplete = null;

        init(control: JQuery, component: ICitySelector): void
        {
            __currentCitySelector.clear();
            __currentCitySelector.component = component;
            __currentCitySelector.control = control;
            __currentCitySelector.control.bind("cut paste", __currentCitySelector.onTextChange);
            __currentCitySelector.control.bind("keydown", __currentCitySelector.onKeyDown);
            __currentCitySelector.control.bind("blur", __currentCitySelector.onLostFocus);
        }

        clear(): void
        {
            __currentCitySelector.clearListBlock();

            if (0 < __currentCitySelector.timer)
                clearTimeout(__currentCitySelector.timer);

            if (null != __currentCitySelector.control)
            {
                __currentCitySelector.control.unbind("cut paste", __currentCitySelector.onTextChange);
                __currentCitySelector.control.unbind("keydown", __currentCitySelector.onKeyDown);
                __currentCitySelector.control.unbind("blur", __currentCitySelector.onLostFocus);
            }

            // сбрасываем отправленные на сервер запросы
            if (null != __currentCitySelector.currentRequest)
                __currentCitySelector.currentRequest.abort();

            __currentCitySelector.currentRequest = null;
            __currentCitySelector.busy = false;
            __currentCitySelector.listData = null;
            __currentCitySelector.component = null;
        }

        clearListBlock(): void
        {
            if (null != __currentCitySelector.listBlockHtml)
            {
                $("div", __currentCitySelector.listBlockHtml).unbind("click mouseenter mouseleave");
                __currentCitySelector.listBlockHtml.remove();
                __currentCitySelector.listBlockHtml = null;
            }
        }

        onMouseEnter(event: JQueryEventObject): void
        {
            $("div.c-page-city-select-item", __currentCitySelector.listBlockHtml).removeClass("c-page-city-select-item-selected");
            $(event.delegateTarget).addClass("c-page-city-select-item-selected");
        }

        onMouseLeave(event: JQueryEventObject): void
        {
            $("div.c-page-city-select-item", __currentCitySelector.listBlockHtml).removeClass("c-page-city-select-item-selected");
        }

        onKeyDown(event: JQueryEventObject): void
        {
            if (null != __currentCitySelector.listBlockHtml)
            {
                if (40 == event.keyCode)
                // arrow down
                {
                    __currentCitySelector.onArrowDown();
                    return;
                }
                else if (38 == event.keyCode)
                // arrow up
                {
                    __currentCitySelector.onArrowUp();
                    return;
                }
                else if (13 == event.keyCode)
                // enter
                {
                    __currentCitySelector.onEnter(); 
                    return;
                }
                else if (27 == event.keyCode)
                // escape
                {
                    __currentCitySelector.onEscape(); 
                    return;
                }
            }

            __currentCitySelector.onTextChange(event);
        }

        onArrowDown(): void
        {
            var selectedItem: JQuery = __currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length)
            {
                var nextItem: JQuery = selectedItem.next();

                if (0 < nextItem.length)
                {
                    selectedItem.removeClass("c-page-city-select-item-selected");
                    nextItem.addClass("c-page-city-select-item-selected");
                }
            }
            else
            {
                $("div.c-page-city-select-item", __currentCitySelector.listBlockHtml).first().addClass("c-page-city-select-item-selected");
            }
        }

        onArrowUp(): void
        {
            var selectedItem: JQuery = __currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length)
            {
                var prevItem: JQuery = selectedItem.prev();

                if (0 < prevItem.length)
                {
                    selectedItem.removeClass("c-page-city-select-item-selected");
                    prevItem.addClass("c-page-city-select-item-selected");
                }
            }
        }

        onEnter(): void
        {
            var selectedItem: JQuery = __currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length)
            {
                var id: number = parseInt(selectedItem.attr("data-id"));
                __currentCitySelector.onItemClicked(id);
            }
        }

        onEscape(): void
        {
            __currentCitySelector.clearListBlock();
        }


        getSelectedItem(): JQuery
        {
            return $("div.c-page-city-select-item-selected", __currentCitySelector.listBlockHtml);
        }

        onTextChange(event: JQueryEventObject): void
        {
            if (0 < __currentCitySelector.timer)
                clearTimeout(__currentCitySelector.timer);

            if (true == __currentCitySelector.busy)
                return;

            __currentCitySelector.timer = setTimeout(__currentCitySelector.onTimeout, __currentCitySelector.timeoutMs);
        }

        onTimeout(): void
        {
            var value: string = __currentCitySelector.control.val().trim();

            if (value == __currentCitySelector.searchValue)
                return;

            __currentCitySelector.searchValue = value;

            if (3 > value.length)
            {
                __currentCitySelector.clearListBlock();
                return;
            }

            //window.console.log(__currentCitySelector.searchValue);
            // выставляем флаг блокировки поиска и отправляем поисковый запрос на сервер
            __currentCitySelector.busy = true;
            __currentCitySelector.getData(value);
        }


        getData(query: string): void
        {
            __currentCitySelector.currentRequest = $.ajax({
                type: "GET",
                url: __currentApp.getFullUri("api/cityautocomplete/" + query),
                success: __currentCitySelector.onAjaxGetOrgDataSuccess,
                error: __currentCitySelector.onAjaxGetOrgDataError
            });
        }

        onAjaxGetOrgDataError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentCitySelector.busy = false;
            __currentCitySelector.currentRequest = null;
            //window.console.log("_onAjaxError");
        }

        onAjaxGetOrgDataSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentCitySelector.busy = false;
            __currentCitySelector.currentRequest = null;
            //window.console.log("_onAjaxGetAccountDataSuccess");

            __currentCitySelector.listData = <AjaxCityAutoComplete>data.data;
            // данные получены рисуем выпадающий список выбора
            __currentCitySelector.drawList();
        }

        drawList(): void
        {
            __currentCitySelector.clearListBlock();
            var data: AjaxCityAutoComplete = __currentCitySelector.listData;

            // если контрол уже потерял фокус, то ничего не отображаем
            if (false == __currentCitySelector.control.is(":focus"))
                return;

            if (null == data.cities || 1 > data.cities.length)
                return;

            __currentCitySelector.listBlockHtml = $('<div class="c-page-city-select-block"></div>');

            for (var i: number = 0; i < data.cities.length; i++)
            {
                var city: CityData = data.cities[i];
                var item: JQuery = $('<div class="c-page-city-select-item"></div>');
                item.text(city.fullname);
                item.attr("data-id", city.id);
                item.bind("click", __currentCitySelector.onItemClick);
                item.bind("mouseenter", __currentCitySelector.onMouseEnter);
                item.bind("mouseleave", __currentCitySelector.onMouseLeave);
                __currentCitySelector.listBlockHtml.append(item);
            }

            // вычисляем положение списка на экране
            var top: number = __currentCitySelector.control.offset().top;
            top += __currentCitySelector.control.height();
            var left: number = __currentCitySelector.control.offset().left;

            __currentCitySelector.listBlockHtml.appendTo($("body"));
            __currentCitySelector.listBlockHtml.css({ top: top, left: left });
        }

        onItemClick(event: JQueryEventObject): void
        {
            __currentCitySelector.searchValue = null;
            var elem: JQuery = $(event.delegateTarget);
            //window.console.log("__currentCitySelector.onItemClick(" + elem.attr("data-id") + ")");
            __currentCitySelector.onItemClicked(parseInt(elem.attr("data-id")));
        }

        onItemClicked(id: number): void
        {
            var city = __currentCitySelector.getCityById(id);
            __currentCitySelector.component.onCitySelected(city);
            __currentCitySelector.clearListBlock();
        }

        getCityById(id: number): CityData
        {
            var city: CityData = null;

            if (null != __currentCitySelector.listData && null != __currentCitySelector.listData.cities)
            {
                for (var i: number = 0; i < __currentCitySelector.listData.cities.length; i++)
                {
                    var c: CityData = __currentCitySelector.listData.cities[i];

                    if (id == c.id)
                    {
                        city = c;
                        break;
                    }
                }
            }

            return city;
        }

        onLostFocus(event: JQueryEventObject): void
        {
            if (null != __currentCitySelector.listBlockHtml)
            {
                if ($(__currentCitySelector.listBlockHtml).is(':hover'))
                    setTimeout(__currentCitySelector.clearListBlock, 500);
                else
                    __currentCitySelector.clearListBlock();
            }

            __currentCitySelector.searchValue = null;
            __currentCitySelector.component.onCitySelectedAbort();
        }
    }

    export var __currentCitySelector = new CitySelector();












    class AjaxRegistrationRequest
    {
        public login: string;
        public email: string;

        constructor(login: string, email: string)
        {
            this.login = login;
            this.email = email;
        }
    }

    class AjaxAuthRequest
    {
        public login: string;
        public pass: string;

        constructor(login: string, pass: string)
        {
            this.login = login;
            this.pass = pass;
        }
    }

    interface AjaxAuthResponse
    {
        name: string;
        banDate: Date;
    }

    export interface IState
    {
        getState(id: string): string[];
        saveState(id: string, state: string[]): void;
    }

    export interface IComponent
    {
        isComponentLoaded: boolean;
        // вызовы от IApplication
        onLoad(app: IApplication, parent: IComponent, state: IState): void;
        onUpdate(state: IState): void;
        onShow(state: IState): void;
        onHide(state: IState): void;
        onLogin(): void;
        onLogout(): void;

        // вызовы от child IComponent
        dataLoaded(sender: IComponent): void;
        dataReady(sender: IComponent): void;
        dataError(sender: IComponent, error: ServerData.AjaxServerResponse): void;
        // вызовы от DictController
        dictDataReady(name: string): void;
    }


    export interface IApplication
    {
        init(component: IComponent, isPrivate: boolean): void;
        checkAuthStatus(): void;
        getFullUri(path: string): string;
        navigateTo(path: string): void;
        componentReady(): void;
        componentError(message: string): void;

        // вспомогательные методы
        showOverlay(overlayId: string, parentId: string): void;
        hideOverlay(overlayId: string): void;
        switchFormPropertyErrorVisibility(id: string, error: string, visible: boolean): void;
        switchFormInfoMessageVisibility(id: string, message: string, visible: boolean): void;

        isAuthentificated(): boolean;

    }

    export class ApplicationController implements IApplication, IState
    {
        public component: IComponent;
        public isPrivate: boolean;
        public userName: string;

        init(component: IComponent, isPrivate: boolean): void
        {
            __currentApp.component = component;
            __currentApp.isPrivate = isPrivate;

            ///////////////
            // прикрепляем обработчики событий

            // переключение вкладорк на панели авторизации
            $("#i-page-auth-tabs > span").click(__currentApp.onAuthTabClick);

            // кнопка отправки логина и пароля
            $("#i-page-auth-login-submit-btn").click(__currentApp.onLoginClick);

            // кнопка регистрации
            $("#i-page-auth-reg-submit-btn").click(__currentApp.onRegisterButtonClick);

            // изменение текста в полях
            $("#i-page-auth-login-container input").keyup(__currentApp.onTextChange);

            // ссылка входа в систему
            $("#i-page-top-login-link").click(__currentApp.onEnterClick);

            // ссылка регистрации в системе
            $("#i-page-top-reg-link").click(__currentApp.onRegisterClick);

            // ссылка выхода из системы
            $("#i-page-top-logout-link").click(__currentApp.onLogoutClick);

            // ссылка по имени пользователя
            $("#i-page-top-login-user-info").click(__currentApp.onUserNameClick);

            // кнопка обновления при ошибке компонента
            $("#i-page-main-section-error-btn").click(__currentApp.onUpdateClick);

            // событие показа информационных блоков
            $("div.c-page-info-message-header-block").click(__currentApp.onInfoMessageBlockClick);

            // событие переключение панелей ListView
            $("div.c-page-lv-list-item").click(__currentApp.onListViewItemClick); 

            __currentApp.checkAuthStatus();


            if (false == __currentApp.isPrivate)
                __currentApp.component.onLoad(__currentApp, null, __currentApp);

        }

        isAuthentificated(): boolean
        {
            if (null != __currentApp.userName)
                return true;

            return false;
        }

        checkAuthStatus(): void
        {
            $.ajax({
                type: "GET",
                url: __currentApp.getFullUri("api/auth"),
                success: __currentApp.onAjaxCheckAuthStatusSuccess,
                error: __currentApp.onAjaxCheckAuthStatusError
            });
        }

        getFullUri(path: string): string
        {
            return document.location.protocol + "//" + document.location.host + "/" + path; 
        }

        navigateTo(path: string): void
        {
            window.location.href = __currentApp.getFullUri(path);
        }

        componentReady(): void
        {
            __currentApp.switchToMainSection();
        }

        componentError(message: string): void
        {
            __currentApp.switchToComponentErrorSection(message);
        }

        getState(id: string): string[]
        {
            return null;
        }

        saveState(id: string, state: string[]): void
        {
        }


        showOverlay(overlayId: string, parentId: string): void
        {
            var overlay: JQuery = $(overlayId);
            var parent: JQuery = $(parentId);
            var icon: JQuery = $("div.fa-spinner", overlay);

            overlay.css({
                top: 0,
                width: parent.outerWidth(true),
                height: parent.outerHeight(true)
            });

            var iconWidth: number = 64; //icon.width() = 0 ???;
            var iconHeight: number = 64; //icon.height() = 0 ???;

            icon.css({
                top: (parent.height() / 2 - (iconHeight / 2)),
                left: (parent.width() / 2 - (iconWidth / 2))
            });

            //overlay.fadeIn(100);
            overlay.show();
        }

        hideOverlay(overlayId: string): void
        {
            var overlay: JQuery = $(overlayId);
            //overlay.fadeOut(100);
            overlay.hide();
        }

        switchFormPropertyErrorVisibility(id: string, error: string, visible: boolean): void
        {
            var container: JQuery = $(id);

            if (visible)
                container.removeClass("hidden").addClass("cell");
            else
                container.removeClass("cell").addClass("hidden");

            $("span", container).text(error);

        }

        switchFormInfoMessageVisibility(id: string, message: string, visible: boolean): void
        {
            var container: JQuery = $(id);

            if (visible)
                container.removeClass("hidden").addClass("block");
            else
                container.removeClass("block").addClass("hidden");

            $("span", container).text(message);
        }



        onTextChange(event: JQueryEventObject): void
        {
            $("#i-page-auth-login-container input").removeClass("c-page-auth-panel-block-ctrl-red");
        }

        onAuthTabClick(event: JQueryEventObject): void
        {
            var tab: JQuery = $(event.delegateTarget);
            var tabs: JQuery = tab.parent();

            if (tab.hasClass("selected"))
                // повторные клики не обрабатываем
                return;

            // получаем id выбранного элемента
            var containerId: string = tab.attr("data-target-id");
            var container: JQuery = $("#" + containerId);

            // получаем id (прежнего) выделенного элемента
            var selectedTab: JQuery = $("span.selected", tabs);
            var selectedContainerId: string = selectedTab.attr("data-target-id");
            var selectedContainer: JQuery = $("#" + selectedContainerId);

            // переключаем выделенный пункт меню
            selectedTab.removeClass("selected");
            tab.addClass("selected");

            // переключаем видимость контейнеров
            container.removeClass("hidden").addClass("block");
            selectedContainer.removeClass("block").addClass("hidden");
        }


        onUpdateClick(event: JQueryEventObject): void
        {
            __currentApp.switchToLoadingSection();
            __currentApp.component.onUpdate(__currentApp);
        }

        onUserNameClick(event: JQueryEventObject): void
        {
            __currentApp.navigateTo("profile");
        }

        onListViewItemClick(event: JQueryEventObject): void
        {
            var item: JQuery = $(event.delegateTarget);
            var items: JQuery = item.parent();
            var listView: JQuery = items.parent();
            var views: JQuery = $("div.c-page-lv-view-block", listView);

            if (item.hasClass("selected"))
                // повторные клики не обрабатываем
                return;

            // получаем id выбранного элемента
            var containerId: string = item.attr("data-target-id");
            var container: JQuery = $("#" + containerId, views);

            // получаем id (прежнего) выделенного элемента
            var selectedItem: JQuery = $("div.c-page-lv-list-item.selected", items);
            var selectedContainerId: string = selectedItem.attr("data-target-id");
            var selectedContainer: JQuery = $("#" + selectedContainerId, views);

            // TODO отправляем события о скрытии и показе контейнеров

            // переключаем выделенный пункт меню
            selectedItem.removeClass("selected");
            item.addClass("selected");

            // переключаем видимость контейнеров
            container.removeClass("hidden").addClass("block");
            selectedContainer.removeClass("block").addClass("hidden");
        }

        onInfoMessageBlockClick(event: JQueryEventObject): void
        {
            var block: JQuery = $(event.delegateTarget).parent();
            var icon: JQuery = $("div.c-page-info-message-header-block > div.fa", block);
            var container: JQuery = $("div.c-page-info-message-text-container", block);
            var hidden: boolean = container.hasClass("hidden");

            if (hidden)
            {
                icon.removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
                container.removeClass("hidden").addClass("block");
            }
            else
            {
                icon.removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
                container.removeClass("block").addClass("hidden");
            }
        }

        onAjaxCheckAuthStatusSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            if (null == data.data)
            {
                $("#i-page-top-login-container").removeClass("hidden").addClass("block");
                $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
                $("#i-page-top-login-user-info > span").text("");

                if (__currentApp.isPrivate)
                    __currentApp.switchToAuthSection();

            }
            else
            {
                $("#i-page-top-login-container").removeClass("block").addClass("hidden");
                $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
                var authResp: AjaxAuthResponse = <AjaxAuthResponse>data.data;
                $("#i-page-top-login-user-info > span").text(authResp.name);

                __currentApp.userName = authResp.name;

                if (__currentApp.isPrivate)
                {
                    if (__currentApp.component.isComponentLoaded)
                        __currentApp.component.onShow(__currentApp);
                    else
                        __currentApp.component.onLoad(__currentApp, null, __currentApp);
                }
            }
        }

        onAjaxCheckAuthStatusError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            if (__currentApp.isPrivate)
                __currentApp.switchToErrorSection("Произошла ошибка на сервере. Попробуйте перегрузить страницу позже.");
        }


        onEnterClick(event: JQueryEventObject): void
        {
            if (false == __currentApp.isPrivate)
            {
                var state: boolean = $("#i-page-auth-container").hasClass("hidden");
                __currentApp.switchAuthSectionVisability(state);
            }
        }

        onRegisterClick(event: JQueryEventObject): void
        {
            if (false == __currentApp.isPrivate)
            {
                var state: boolean = $("#i-page-auth-container").hasClass("hidden");
                __currentApp.switchAuthSectionVisability(state);
            }

            $("#i-page-auth-tabs > span").removeClass("selected");
            $("#i-page-auth-tabs > span[data-target-id=i-page-auth-reg-container]").addClass("selected");
            
            $("#i-page-auth-login-container, #i-page-auth-remind-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-reg-container").removeClass("hidden").addClass("block");
        }

        onLogoutClick(event: JQueryEventObject): void
        {
            $.ajax({
                type: "DELETE",
                url: __currentApp.getFullUri("api/auth"),
                success: __currentApp.onAjaxLogoutSuccess,
                error: __currentApp.onAjaxLogoutError
            });
        }

        onAjaxLogoutSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            $("#i-page-top-login-container").removeClass("hidden").addClass("block");
            $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
            $("#i-page-top-login-user-info > span").text("");

            // сообщаем компоненту о выходе пользователя из системы
            __currentApp.component.onLogout();

            if (__currentApp.isPrivate)
            {
                __currentApp.switchToAuthSection();
                // вызываем метод onHide компонента страницы
                __currentApp.component.onHide(__currentApp);
            }
        }

        onAjaxLogoutError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            // ничего не делаем
        }

        onLoginClick(event: JQueryEventObject): void
        {
            __currentApp.showLoginError(false, "");
            __currentApp.switchAuthLoadingState(true);

            var login: string = $("#i-page-auth-login-login-txt").val();
            var pass: string = $("#i-page-auth-login-pass-txt").val();

            var request: AjaxAuthRequest = new AjaxAuthRequest(login.trim(), pass.trim());

            $.ajax({
                type: "POST",
                url: __currentApp.getFullUri("api/auth"),
                data: JSON.stringify(request),
                contentType: "application/json",
                dataType: "json",
                success: __currentApp.onAjaxLoginSuccess,
                error: __currentApp.onAjaxLoginError
            });
        }


        onAjaxLoginSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentApp.switchAuthLoadingState(false);            
            __currentApp.switchAuthSectionVisability(false);

            // обработка ответа сервера
            var authResp: AjaxAuthResponse = <AjaxAuthResponse>data.data;
            
            // отображаем имя в строке приветствия
            $("#i-page-top-login-container").removeClass("block").addClass("hidden");
            $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
            $("#i-page-top-login-user-info > span").text(authResp.name);

            // сообщаем компоненту о авторизации пользователя
            __currentApp.component.onLogin();

            if (__currentApp.isPrivate)
            {
                __currentApp.switchToLoadingSection();

                if (__currentApp.component.isComponentLoaded)
                    __currentApp.component.onShow(__currentApp);
                else
                    __currentApp.component.onLoad(__currentApp, null, __currentApp);
            }


        }

        onAjaxLoginError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentApp.switchAuthLoadingState(false);

            if (1 > jqXHR.responseText.length)
            {
                var message: string = "Сервер не отвечает. Попробуйте повторить попытку позже.";
                __currentApp.showLoginError(true, message);
            }
            else
            {
                // обработка ответа сервера
                var data: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);
                var authResp: AjaxAuthResponse = <AjaxAuthResponse>data.data;
                var errorCode: number = parseInt(data.code);

                if (3 == errorCode)
                {
                    // Логин или пароль указаны неверно
                    $("#i-page-auth-login-container input").addClass("c-page-auth-panel-block-ctrl-red");
                    var message: string = "Неправильно указан email или пароль. Повторите попытку.";
                    __currentApp.showLoginError(true, message);
                }
                else if (4 == errorCode)
                {
                    // Учётная запись не активирована
                    var message: string = "Уважаемый " + authResp.name + ". Ваша учётная запись не активирована. Вход в систему невозможен."
                    __currentApp.showLoginError(true, message);
                }
                else if (5 == errorCode)
                {
                    // Учётная запись заблокирована администрацией
                    var message: string = "Уважаемый " + authResp.name + ". Ваша учётная запись была заблокирована администрацией сайта " + authResp.banDate + ". Вход в систему невозможен.";
                    __currentApp.showLoginError(true, message);
                }
                else
                {
                    // остальные ошибки
                    var message: string = "Сервер вернул ошибку: " + data.code + ". " + data.userMessage  + ". Вход в систему невозможен.";
                    __currentApp.showLoginError(true, message);
                }
            }
        }

        onRegisterButtonClick(event: JQueryEventObject): void
        {
            // прячем сообщения об ошибке
            $("#i-page-auth-reg-error-container").removeClass("inline-block").addClass("hidden");

            // проверяем данные
            var login: string = $("#i-page-auth-reg-login-txt").val().trim();
            var email: string = $("#i-page-auth-reg-email-txt").val().trim();

            var loginValid: boolean = Validators.Validator.prototype.validateLogin(login);

            if (false == loginValid)
            {
                // выводим сообщение об ошибке
                __currentApp.showRegistrationError(true, Validators.loginNotValidMessage);
                return;
            }

            var emailValid: boolean = Validators.Validator.prototype.validateEmail(email);

            if (false == emailValid)
            {
                // выводим сообщение об ошибке
                __currentApp.showRegistrationError(true, Validators.emailNotValidMessage);
                return;
            }

            if (loginValid && emailValid)
            {
                // отображаем индикатор выполнения операции
                __currentApp.switchAuthLoadingState(true);

                // посылаем запрос на сервер
                var request: AjaxRegistrationRequest = new AjaxRegistrationRequest(login, email);

                $.ajax({
                    type: "POST",
                    url: __currentApp.getFullUri("api/account"),
                    data: JSON.stringify(request),
                    contentType: "application/json",
                    dataType: "json",
                    success: __currentApp.onAjaxRegistrationSuccess,
                    error: __currentApp.onAjaxRegistrationError
                });
            }
        }


        onAjaxRegistrationSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            __currentApp.switchAuthLoadingState(false);

            // отображаем сообщение об успешной регистрации
            $("#i-page-auth-reg-form-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-reg-message-container").removeClass("hidden").addClass("block");

        }

        onAjaxRegistrationError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            __currentApp.switchAuthLoadingState(false);

            if (1 > jqXHR.responseText.length)
            {
                var message: string = "Сервер не отвечает. Попробуйте повторить попытку позже.";
                __currentApp.showRegistrationError(true, message);
            }
            else
            {
                // обработка ответа сервера
                var data: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);

                // разбираем переданные коды ошибок                
                var errMessage: string = data.userMessage.replace(";", ". ");
                __currentApp.showRegistrationError(true, errMessage);
            }
        }

        showLoginError(visible: boolean, message: string): void
        {
            if (visible)
            {
                $("#i-page-auth-login-error-container").removeClass("hidden").addClass("inline-block");
                $("#i-page-auth-login-error-container > span").text(message);
            }
            else
            {
                $("#i-page-auth-login-error-container").removeClass("inline-block").addClass("hidden");
                $("#i-page-auth-login-error-container > span").text("");
            }
        }

        showRegistrationError(visible: boolean, message: string): void
        {
            if (visible)
            {
                $("#i-page-auth-reg-error-container").removeClass("hidden").addClass("inline-block");
                $("#i-page-auth-reg-error-container > span").text(message);
            }
            else
            {
                $("#i-page-auth-reg-error-container").removeClass("inline-block").addClass("hidden");
                $("#i-page-auth-reg-error-container > span").text("");
            }
        }

        switchAuthLoadingState(visible: boolean): void
        {
            if (visible)
                __currentApp.showOverlay("#i-page-auth-loading-container", "#i-page-auth-form-block");
            else
                __currentApp.hideOverlay("#i-page-auth-loading-container");
        }





        switchToComponentErrorSection(message: string): void
        {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("hidden").addClass("block");

            $("#i-page-main-error-text-block").text(message);
        }

        switchToMainSection()
        {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("hidden").addClass("block");
        }

        switchToLoadingSection(): void
        {
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-loading-container").removeClass("hidden").addClass("block");
        }

        switchAuthSectionVisability(visible: boolean): void
        {
            if (visible)
                $("#i-page-auth-container").removeClass("hidden").addClass("block");
            else
                $("#i-page-auth-container").removeClass("block").addClass("hidden");
        }

        switchToAuthSection(): void
        {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-container").removeClass("hidden").addClass("block");

            if (__currentApp.isPrivate)
                $("#i-page-auth-required-container").removeClass("hidden").addClass("block");
            else
                $("#i-page-auth-required-container").removeClass("block").addClass("hidden");

        }

        switchToErrorSection(message: string): void
        {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").text(message).removeClass("hidden").addClass("block");
        }

    }

    export var __currentApp: Application.ApplicationController = new Application.ApplicationController();
}

