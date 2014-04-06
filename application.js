///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
///<reference path="Dictionary.ts"/>
var Application;
(function (Application) {
    var CalendarControl = (function () {
        function CalendarControl() {
            this.control = null;
            this.selectedDate = Date.now();
        }
        CalendarControl.prototype.init = function (control, date) {
            Application.__currentCalendarControl.control = control;
            Application.__currentCalendarControl.setDate(date);
        };

        CalendarControl.prototype.setToday = function () {
            Application.__currentCalendarControl.selectedDate = Date.now();
        };

        CalendarControl.prototype.setDate = function (date) {
            if (null == date || 1 > date.length)
                Application.__currentCalendarControl.setToday();
else
                Application.__currentCalendarControl.selectedDate = Date.parse(date);
        };

        CalendarControl.prototype.showCalendar = function () {
        };
        return CalendarControl;
    })();
    Application.CalendarControl = CalendarControl;

    Application.__currentCalendarControl = new CalendarControl();

    var CityData = (function () {
        function CityData() {
        }
        return CityData;
    })();
    Application.CityData = CityData;

    var AjaxCityAutoComplete = (function () {
        function AjaxCityAutoComplete() {
        }
        return AjaxCityAutoComplete;
    })();
    Application.AjaxCityAutoComplete = AjaxCityAutoComplete;

    var CitySelector = (function () {
        function CitySelector() {
            this.control = null;
            this.component = null;
            this.timer = 0;
            this.searchValue = null;
            this.busy = false;
            this.timeoutMs = 1000;
            this.currentRequest = null;
            this.listBlockHtml = null;
            this.listData = null;
        }
        CitySelector.prototype.init = function (control, component) {
            Application.__currentCitySelector.clear();
            Application.__currentCitySelector.component = component;
            Application.__currentCitySelector.control = control;
            Application.__currentCitySelector.control.bind("cut paste", Application.__currentCitySelector.onTextChange);
            Application.__currentCitySelector.control.bind("keydown", Application.__currentCitySelector.onKeyDown);
            Application.__currentCitySelector.control.bind("blur", Application.__currentCitySelector.onLostFocus);
        };

        CitySelector.prototype.clear = function () {
            Application.__currentCitySelector.clearListBlock();

            if (0 < Application.__currentCitySelector.timer)
                clearTimeout(Application.__currentCitySelector.timer);

            if (null != Application.__currentCitySelector.control) {
                Application.__currentCitySelector.control.unbind("cut paste", Application.__currentCitySelector.onTextChange);
                Application.__currentCitySelector.control.unbind("keydown", Application.__currentCitySelector.onKeyDown);
                Application.__currentCitySelector.control.unbind("blur", Application.__currentCitySelector.onLostFocus);
            }

            if (null != Application.__currentCitySelector.currentRequest)
                Application.__currentCitySelector.currentRequest.abort();

            Application.__currentCitySelector.currentRequest = null;
            Application.__currentCitySelector.busy = false;
            Application.__currentCitySelector.listData = null;
            Application.__currentCitySelector.component = null;
        };

        CitySelector.prototype.clearListBlock = function () {
            if (null != Application.__currentCitySelector.listBlockHtml) {
                $("div", Application.__currentCitySelector.listBlockHtml).unbind("click mouseenter mouseleave");
                Application.__currentCitySelector.listBlockHtml.remove();
                Application.__currentCitySelector.listBlockHtml = null;
            }
        };

        CitySelector.prototype.onMouseEnter = function (event) {
            $("div.c-page-city-select-item", Application.__currentCitySelector.listBlockHtml).removeClass("c-page-city-select-item-selected");
            $(event.delegateTarget).addClass("c-page-city-select-item-selected");
        };

        CitySelector.prototype.onMouseLeave = function (event) {
            $("div.c-page-city-select-item", Application.__currentCitySelector.listBlockHtml).removeClass("c-page-city-select-item-selected");
        };

        CitySelector.prototype.onKeyDown = function (event) {
            if (null != Application.__currentCitySelector.listBlockHtml) {
                if (40 == event.keyCode) {
                    Application.__currentCitySelector.onArrowDown();
                    return;
                } else if (38 == event.keyCode) {
                    Application.__currentCitySelector.onArrowUp();
                    return;
                } else if (13 == event.keyCode) {
                    Application.__currentCitySelector.onEnter();
                    return;
                } else if (27 == event.keyCode) {
                    Application.__currentCitySelector.onEscape();
                    return;
                }
            }

            Application.__currentCitySelector.onTextChange(event);
        };

        CitySelector.prototype.onArrowDown = function () {
            var selectedItem = Application.__currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length) {
                var nextItem = selectedItem.next();

                if (0 < nextItem.length) {
                    selectedItem.removeClass("c-page-city-select-item-selected");
                    nextItem.addClass("c-page-city-select-item-selected");
                }
            } else {
                $("div.c-page-city-select-item", Application.__currentCitySelector.listBlockHtml).first().addClass("c-page-city-select-item-selected");
            }
        };

        CitySelector.prototype.onArrowUp = function () {
            var selectedItem = Application.__currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length) {
                var prevItem = selectedItem.prev();

                if (0 < prevItem.length) {
                    selectedItem.removeClass("c-page-city-select-item-selected");
                    prevItem.addClass("c-page-city-select-item-selected");
                }
            }
        };

        CitySelector.prototype.onEnter = function () {
            var selectedItem = Application.__currentCitySelector.getSelectedItem();

            if (0 < selectedItem.length) {
                var id = parseInt(selectedItem.attr("data-id"));
                Application.__currentCitySelector.onItemClicked(id);
            }
        };

        CitySelector.prototype.onEscape = function () {
            Application.__currentCitySelector.clearListBlock();
        };

        CitySelector.prototype.getSelectedItem = function () {
            return $("div.c-page-city-select-item-selected", Application.__currentCitySelector.listBlockHtml);
        };

        CitySelector.prototype.onTextChange = function (event) {
            if (0 < Application.__currentCitySelector.timer)
                clearTimeout(Application.__currentCitySelector.timer);

            if (true == Application.__currentCitySelector.busy)
                return;

            Application.__currentCitySelector.timer = setTimeout(Application.__currentCitySelector.onTimeout, Application.__currentCitySelector.timeoutMs);
        };

        CitySelector.prototype.onTimeout = function () {
            var value = Application.__currentCitySelector.control.val().trim();

            if (value == Application.__currentCitySelector.searchValue)
                return;

            Application.__currentCitySelector.searchValue = value;

            if (3 > value.length) {
                Application.__currentCitySelector.clearListBlock();
                return;
            }

            //window.console.log(__currentCitySelector.searchValue);
            // выставляем флаг блокировки поиска и отправляем поисковый запрос на сервер
            Application.__currentCitySelector.busy = true;
            Application.__currentCitySelector.getData(value);
        };

        CitySelector.prototype.getData = function (query) {
            Application.__currentCitySelector.currentRequest = $.ajax({
                type: "GET",
                url: Application.__currentApp.getFullUri("api/cityautocomplete/" + query),
                success: Application.__currentCitySelector.onAjaxGetOrgDataSuccess,
                error: Application.__currentCitySelector.onAjaxGetOrgDataError
            });
        };

        CitySelector.prototype.onAjaxGetOrgDataError = function (jqXHR, status, message) {
            Application.__currentCitySelector.busy = false;
            Application.__currentCitySelector.currentRequest = null;
            //window.console.log("_onAjaxError");
        };

        CitySelector.prototype.onAjaxGetOrgDataSuccess = function (data, status, jqXHR) {
            Application.__currentCitySelector.busy = false;
            Application.__currentCitySelector.currentRequest = null;

            //window.console.log("_onAjaxGetAccountDataSuccess");
            Application.__currentCitySelector.listData = data.data;

            // данные получены рисуем выпадающий список выбора
            Application.__currentCitySelector.drawList();
        };

        CitySelector.prototype.drawList = function () {
            Application.__currentCitySelector.clearListBlock();
            var data = Application.__currentCitySelector.listData;

            if (false == Application.__currentCitySelector.control.is(":focus"))
                return;

            if (null == data.cities || 1 > data.cities.length)
                return;

            Application.__currentCitySelector.listBlockHtml = $('<div class="c-page-city-select-block"></div>');

            for (var i = 0; i < data.cities.length; i++) {
                var city = data.cities[i];
                var item = $('<div class="c-page-city-select-item"></div>');
                item.text(city.fullname);
                item.attr("data-id", city.id);
                item.bind("click", Application.__currentCitySelector.onItemClick);
                item.bind("mouseenter", Application.__currentCitySelector.onMouseEnter);
                item.bind("mouseleave", Application.__currentCitySelector.onMouseLeave);
                Application.__currentCitySelector.listBlockHtml.append(item);
            }

            // вычисляем положение списка на экране
            var top = Application.__currentCitySelector.control.offset().top;
            top += Application.__currentCitySelector.control.height();
            var left = Application.__currentCitySelector.control.offset().left;

            Application.__currentCitySelector.listBlockHtml.appendTo($("body"));
            Application.__currentCitySelector.listBlockHtml.css({ top: top, left: left });
        };

        CitySelector.prototype.onItemClick = function (event) {
            Application.__currentCitySelector.searchValue = null;
            var elem = $(event.delegateTarget);

            //window.console.log("__currentCitySelector.onItemClick(" + elem.attr("data-id") + ")");
            Application.__currentCitySelector.onItemClicked(parseInt(elem.attr("data-id")));
        };

        CitySelector.prototype.onItemClicked = function (id) {
            var city = Application.__currentCitySelector.getCityById(id);
            Application.__currentCitySelector.component.onCitySelected(city);
            Application.__currentCitySelector.clearListBlock();
        };

        CitySelector.prototype.getCityById = function (id) {
            var city = null;

            if (null != Application.__currentCitySelector.listData && null != Application.__currentCitySelector.listData.cities) {
                for (var i = 0; i < Application.__currentCitySelector.listData.cities.length; i++) {
                    var c = Application.__currentCitySelector.listData.cities[i];

                    if (id == c.id) {
                        city = c;
                        break;
                    }
                }
            }

            return city;
        };

        CitySelector.prototype.onLostFocus = function (event) {
            if (null != Application.__currentCitySelector.listBlockHtml) {
                if ($(Application.__currentCitySelector.listBlockHtml).is(':hover'))
                    setTimeout(Application.__currentCitySelector.clearListBlock, 500);
else
                    Application.__currentCitySelector.clearListBlock();
            }

            Application.__currentCitySelector.searchValue = null;
            Application.__currentCitySelector.component.onCitySelectedAbort();
        };
        return CitySelector;
    })();
    Application.CitySelector = CitySelector;

    Application.__currentCitySelector = new CitySelector();

    var AjaxRegistrationRequest = (function () {
        function AjaxRegistrationRequest(login, email) {
            this.login = login;
            this.email = email;
        }
        return AjaxRegistrationRequest;
    })();

    var AjaxAuthRequest = (function () {
        function AjaxAuthRequest(login, pass) {
            this.login = login;
            this.pass = pass;
        }
        return AjaxAuthRequest;
    })();

    var ApplicationController = (function () {
        function ApplicationController() {
        }
        ApplicationController.prototype.init = function (component, isPrivate) {
            Application.__currentApp.component = component;
            Application.__currentApp.isPrivate = isPrivate;

            ///////////////
            // прикрепляем обработчики событий
            // переключение вкладорк на панели авторизации
            $("#i-page-auth-tabs > span").click(Application.__currentApp.onAuthTabClick);

            // кнопка отправки логина и пароля
            $("#i-page-auth-login-submit-btn").click(Application.__currentApp.onLoginClick);

            // кнопка регистрации
            $("#i-page-auth-reg-submit-btn").click(Application.__currentApp.onRegisterButtonClick);

            // изменение текста в полях
            $("#i-page-auth-login-container input").keyup(Application.__currentApp.onTextChange);

            // ссылка входа в систему
            $("#i-page-top-login-link").click(Application.__currentApp.onEnterClick);

            // ссылка регистрации в системе
            $("#i-page-top-reg-link").click(Application.__currentApp.onRegisterClick);

            // ссылка выхода из системы
            $("#i-page-top-logout-link").click(Application.__currentApp.onLogoutClick);

            // ссылка по имени пользователя
            $("#i-page-top-login-user-info").click(Application.__currentApp.onUserNameClick);

            // кнопка обновления при ошибке компонента
            $("#i-page-main-section-error-btn").click(Application.__currentApp.onUpdateClick);

            // событие показа информационных блоков
            $("div.c-page-info-message-header-block").click(Application.__currentApp.onInfoMessageBlockClick);

            // событие переключение панелей ListView
            $("div.c-page-lv-list-item").click(Application.__currentApp.onListViewItemClick);

            Application.__currentApp.checkAuthStatus();

            if (false == Application.__currentApp.isPrivate)
                Application.__currentApp.component.onLoad(Application.__currentApp, null, Application.__currentApp);
        };

        ApplicationController.prototype.checkAuthStatus = function () {
            $.ajax({
                type: "GET",
                url: Application.__currentApp.getFullUri("api/auth"),
                success: Application.__currentApp.onAjaxCheckAuthStatusSuccess,
                error: Application.__currentApp.onAjaxCheckAuthStatusError
            });
        };

        ApplicationController.prototype.getFullUri = function (path) {
            return document.location.protocol + "//" + document.location.host + "/" + path;
        };

        ApplicationController.prototype.navigateTo = function (path) {
            window.location.href = Application.__currentApp.getFullUri(path);
        };

        ApplicationController.prototype.componentReady = function () {
            Application.__currentApp.switchToMainSection();
        };

        ApplicationController.prototype.componentError = function (message) {
            Application.__currentApp.switchToComponentErrorSection(message);
        };

        ApplicationController.prototype.getState = function (id) {
            return null;
        };

        ApplicationController.prototype.saveState = function (id, state) {
        };

        ApplicationController.prototype.showOverlay = function (overlayId, parentId) {
            var overlay = $(overlayId);
            var parent = $(parentId);
            var icon = $("div.fa-spinner", overlay);

            overlay.css({
                top: 0,
                width: parent.outerWidth(true),
                height: parent.outerHeight(true)
            });

            var iconWidth = 64;
            var iconHeight = 64;

            icon.css({
                top: (parent.height() / 2 - (iconHeight / 2)),
                left: (parent.width() / 2 - (iconWidth / 2))
            });

            //overlay.fadeIn(100);
            overlay.show();
        };

        ApplicationController.prototype.hideOverlay = function (overlayId) {
            var overlay = $(overlayId);

            //overlay.fadeOut(100);
            overlay.hide();
        };

        ApplicationController.prototype.switchFormPropertyErrorVisibility = function (id, error, visible) {
            var container = $(id);

            if (visible)
                container.removeClass("hidden").addClass("cell");
else
                container.removeClass("cell").addClass("hidden");

            $("span", container).text(error);
        };

        ApplicationController.prototype.switchFormInfoMessageVisibility = function (id, message, visible) {
            var container = $(id);

            if (visible)
                container.removeClass("hidden").addClass("block");
else
                container.removeClass("block").addClass("hidden");

            $("span", container).text(message);
        };

        ApplicationController.prototype.onTextChange = function (event) {
            $("#i-page-auth-login-container input").removeClass("c-page-auth-panel-block-ctrl-red");
        };

        ApplicationController.prototype.onAuthTabClick = function (event) {
            var tab = $(event.delegateTarget);
            var tabs = tab.parent();

            if (tab.hasClass("selected"))
                // повторные клики не обрабатываем
                return;

            // получаем id выбранного элемента
            var containerId = tab.attr("data-target-id");
            var container = $("#" + containerId);

            // получаем id (прежнего) выделенного элемента
            var selectedTab = $("span.selected", tabs);
            var selectedContainerId = selectedTab.attr("data-target-id");
            var selectedContainer = $("#" + selectedContainerId);

            // переключаем выделенный пункт меню
            selectedTab.removeClass("selected");
            tab.addClass("selected");

            // переключаем видимость контейнеров
            container.removeClass("hidden").addClass("block");
            selectedContainer.removeClass("block").addClass("hidden");
        };

        ApplicationController.prototype.onUpdateClick = function (event) {
            Application.__currentApp.switchToLoadingSection();
            Application.__currentApp.component.onUpdate(Application.__currentApp);
        };

        ApplicationController.prototype.onUserNameClick = function (event) {
            Application.__currentApp.navigateTo("profile");
        };

        ApplicationController.prototype.onListViewItemClick = function (event) {
            var item = $(event.delegateTarget);
            var items = item.parent();
            var listView = items.parent();
            var views = $("div.c-page-lv-view-block", listView);

            if (item.hasClass("selected"))
                // повторные клики не обрабатываем
                return;

            // получаем id выбранного элемента
            var containerId = item.attr("data-target-id");
            var container = $("#" + containerId, views);

            // получаем id (прежнего) выделенного элемента
            var selectedItem = $("div.c-page-lv-list-item.selected", items);
            var selectedContainerId = selectedItem.attr("data-target-id");
            var selectedContainer = $("#" + selectedContainerId, views);

            // TODO отправляем события о скрытии и показе контейнеров
            // переключаем выделенный пункт меню
            selectedItem.removeClass("selected");
            item.addClass("selected");

            // переключаем видимость контейнеров
            container.removeClass("hidden").addClass("block");
            selectedContainer.removeClass("block").addClass("hidden");
        };

        ApplicationController.prototype.onInfoMessageBlockClick = function (event) {
            var block = $(event.delegateTarget).parent();
            var icon = $("div.c-page-info-message-header-block > div.fa", block);
            var container = $("div.c-page-info-message-text-container", block);
            var hidden = container.hasClass("hidden");

            if (hidden) {
                icon.removeClass("fa-plus-square-o").addClass("fa-minus-square-o");
                container.removeClass("hidden").addClass("block");
            } else {
                icon.removeClass("fa-minus-square-o").addClass("fa-plus-square-o");
                container.removeClass("block").addClass("hidden");
            }
        };

        ApplicationController.prototype.onAjaxCheckAuthStatusSuccess = function (data, status, jqXHR) {
            if (null == data.data) {
                $("#i-page-top-login-container").removeClass("hidden").addClass("block");
                $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
                $("#i-page-top-login-user-info > span").text("");

                if (Application.__currentApp.isPrivate)
                    Application.__currentApp.switchToAuthSection();
            } else {
                $("#i-page-top-login-container").removeClass("block").addClass("hidden");
                $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
                var authResp = data.data;
                $("#i-page-top-login-user-info > span").text(authResp.name);

                if (Application.__currentApp.isPrivate) {
                    if (Application.__currentApp.component.isComponentLoaded)
                        Application.__currentApp.component.onShow(Application.__currentApp);
else
                        Application.__currentApp.component.onLoad(Application.__currentApp, null, Application.__currentApp);
                }
            }
        };

        ApplicationController.prototype.onAjaxCheckAuthStatusError = function (jqXHR, status, message) {
            if (Application.__currentApp.isPrivate)
                Application.__currentApp.switchToErrorSection("Произошла ошибка на сервере. Попробуйте перегрузить страницу позже.");
        };

        ApplicationController.prototype.onEnterClick = function (event) {
            if (false == Application.__currentApp.isPrivate) {
                var state = $("#i-page-auth-container").hasClass("hidden");
                Application.__currentApp.switchAuthSectionVisability(state);
            }
        };

        ApplicationController.prototype.onRegisterClick = function (event) {
            if (false == Application.__currentApp.isPrivate) {
                var state = $("#i-page-auth-container").hasClass("hidden");
                Application.__currentApp.switchAuthSectionVisability(state);
            }

            $("#i-page-auth-tabs > span").removeClass("selected");
            $("#i-page-auth-tabs > span[data-target-id=i-page-auth-reg-container]").addClass("selected");

            $("#i-page-auth-login-container, #i-page-auth-remind-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-reg-container").removeClass("hidden").addClass("block");
        };

        ApplicationController.prototype.onLogoutClick = function (event) {
            $.ajax({
                type: "DELETE",
                url: Application.__currentApp.getFullUri("api/auth"),
                success: Application.__currentApp.onAjaxLogoutSuccess,
                error: Application.__currentApp.onAjaxLogoutError
            });
        };

        ApplicationController.prototype.onAjaxLogoutSuccess = function (data, status, jqXHR) {
            $("#i-page-top-login-container").removeClass("hidden").addClass("block");
            $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
            $("#i-page-top-login-user-info > span").text("");

            if (Application.__currentApp.isPrivate) {
                Application.__currentApp.switchToAuthSection();

                // вызываем метод onHide компонента страницы
                Application.__currentApp.component.onHide(Application.__currentApp);
            }
        };

        ApplicationController.prototype.onAjaxLogoutError = function (jqXHR, status, message) {
            // ничего не делаем
        };

        ApplicationController.prototype.onLoginClick = function (event) {
            Application.__currentApp.showLoginError(false, "");
            Application.__currentApp.switchAuthLoadingState(true);

            var login = $("#i-page-auth-login-login-txt").val();
            var pass = $("#i-page-auth-login-pass-txt").val();

            var request = new AjaxAuthRequest(login.trim(), pass.trim());

            $.ajax({
                type: "POST",
                url: Application.__currentApp.getFullUri("api/auth"),
                data: JSON.stringify(request),
                contentType: "application/json",
                dataType: "json",
                success: Application.__currentApp.onAjaxLoginSuccess,
                error: Application.__currentApp.onAjaxLoginError
            });
        };

        ApplicationController.prototype.onAjaxLoginSuccess = function (data, status, jqXHR) {
            Application.__currentApp.switchAuthLoadingState(false);
            Application.__currentApp.switchAuthSectionVisability(false);

            // обработка ответа сервера
            var authResp = data.data;

            // отображаем имя в строке приветствия
            $("#i-page-top-login-container").removeClass("block").addClass("hidden");
            $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
            $("#i-page-top-login-user-info > span").text(authResp.name);

            if (Application.__currentApp.isPrivate) {
                Application.__currentApp.switchToLoadingSection();

                if (Application.__currentApp.component.isComponentLoaded)
                    Application.__currentApp.component.onShow(Application.__currentApp);
else
                    Application.__currentApp.component.onLoad(Application.__currentApp, null, Application.__currentApp);
            }
        };

        ApplicationController.prototype.onAjaxLoginError = function (jqXHR, status, message) {
            Application.__currentApp.switchAuthLoadingState(false);

            if (1 > jqXHR.responseText.length) {
                var message = "Сервер не отвечает. Попробуйте повторить попытку позже.";
                Application.__currentApp.showLoginError(true, message);
            } else {
                // обработка ответа сервера
                var data = JSON.parse(jqXHR.responseText);
                var authResp = data.data;
                var errorCode = parseInt(data.code);

                if (3 == errorCode) {
                    // Логин или пароль указаны неверно
                    $("#i-page-auth-login-container input").addClass("c-page-auth-panel-block-ctrl-red");
                    var message = "Неправильно указан email или пароль. Повторите попытку.";
                    Application.__currentApp.showLoginError(true, message);
                } else if (4 == errorCode) {
                    // Учётная запись не активирована
                    var message = "Уважаемый " + authResp.name + ". Ваша учётная запись не активирована. Вход в систему невозможен.";
                    Application.__currentApp.showLoginError(true, message);
                } else if (5 == errorCode) {
                    // Учётная запись заблокирована администрацией
                    var message = "Уважаемый " + authResp.name + ". Ваша учётная запись была заблокирована администрацией сайта " + authResp.banDate + ". Вход в систему невозможен.";
                    Application.__currentApp.showLoginError(true, message);
                } else {
                    // остальные ошибки
                    var message = "Сервер вернул ошибку: " + data.code + ". " + data.userMessage + ". Вход в систему невозможен.";
                    Application.__currentApp.showLoginError(true, message);
                }
            }
        };

        ApplicationController.prototype.onRegisterButtonClick = function (event) {
            // прячем сообщения об ошибке
            $("#i-page-auth-reg-error-container").removeClass("inline-block").addClass("hidden");

            // проверяем данные
            var login = $("#i-page-auth-reg-login-txt").val().trim();
            var email = $("#i-page-auth-reg-email-txt").val().trim();

            var loginValid = Validators.Validator.prototype.validateLogin(login);

            if (false == loginValid) {
                // выводим сообщение об ошибке
                Application.__currentApp.showRegistrationError(true, Validators.loginNotValidMessage);
                return;
            }

            var emailValid = Validators.Validator.prototype.validateEmail(email);

            if (false == emailValid) {
                // выводим сообщение об ошибке
                Application.__currentApp.showRegistrationError(true, Validators.emailNotValidMessage);
                return;
            }

            if (loginValid && emailValid) {
                // отображаем индикатор выполнения операции
                Application.__currentApp.switchAuthLoadingState(true);

                // посылаем запрос на сервер
                var request = new AjaxRegistrationRequest(login, email);

                $.ajax({
                    type: "POST",
                    url: Application.__currentApp.getFullUri("api/account"),
                    data: JSON.stringify(request),
                    contentType: "application/json",
                    dataType: "json",
                    success: Application.__currentApp.onAjaxRegistrationSuccess,
                    error: Application.__currentApp.onAjaxRegistrationError
                });
            }
        };

        ApplicationController.prototype.onAjaxRegistrationSuccess = function (data, status, jqXHR) {
            Application.__currentApp.switchAuthLoadingState(false);

            // отображаем сообщение об успешной регистрации
            $("#i-page-auth-reg-form-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-reg-message-container").removeClass("hidden").addClass("block");
        };

        ApplicationController.prototype.onAjaxRegistrationError = function (jqXHR, status, message) {
            Application.__currentApp.switchAuthLoadingState(false);

            if (1 > jqXHR.responseText.length) {
                var message = "Сервер не отвечает. Попробуйте повторить попытку позже.";
                Application.__currentApp.showRegistrationError(true, message);
            } else {
                // обработка ответа сервера
                var data = JSON.parse(jqXHR.responseText);

                // разбираем переданные коды ошибок
                var errMessage = data.userMessage.replace(";", ". ");
                Application.__currentApp.showRegistrationError(true, errMessage);
            }
        };

        ApplicationController.prototype.showLoginError = function (visible, message) {
            if (visible) {
                $("#i-page-auth-login-error-container").removeClass("hidden").addClass("inline-block");
                $("#i-page-auth-login-error-container > span").text(message);
            } else {
                $("#i-page-auth-login-error-container").removeClass("inline-block").addClass("hidden");
                $("#i-page-auth-login-error-container > span").text("");
            }
        };

        ApplicationController.prototype.showRegistrationError = function (visible, message) {
            if (visible) {
                $("#i-page-auth-reg-error-container").removeClass("hidden").addClass("inline-block");
                $("#i-page-auth-reg-error-container > span").text(message);
            } else {
                $("#i-page-auth-reg-error-container").removeClass("inline-block").addClass("hidden");
                $("#i-page-auth-reg-error-container > span").text("");
            }
        };

        ApplicationController.prototype.switchAuthLoadingState = function (visible) {
            if (visible)
                Application.__currentApp.showOverlay("#i-page-auth-loading-container", "#i-page-auth-form-block");
else
                Application.__currentApp.hideOverlay("#i-page-auth-loading-container");
        };

        ApplicationController.prototype.switchToComponentErrorSection = function (message) {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("hidden").addClass("block");

            $("#i-page-main-error-text-block").text(message);
        };

        ApplicationController.prototype.switchToMainSection = function () {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("hidden").addClass("block");
        };

        ApplicationController.prototype.switchToLoadingSection = function () {
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-loading-container").removeClass("hidden").addClass("block");
        };

        ApplicationController.prototype.switchAuthSectionVisability = function (visible) {
            if (visible)
                $("#i-page-auth-container").removeClass("hidden").addClass("block");
else
                $("#i-page-auth-container").removeClass("block").addClass("hidden");
        };

        ApplicationController.prototype.switchToAuthSection = function () {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-container").removeClass("hidden").addClass("block");

            if (Application.__currentApp.isPrivate)
                $("#i-page-auth-required-container").removeClass("hidden").addClass("block");
else
                $("#i-page-auth-required-container").removeClass("block").addClass("hidden");
        };

        ApplicationController.prototype.switchToErrorSection = function (message) {
            $("#i-page-loading-container").removeClass("block").addClass("hidden");
            $("#i-page-auth-container").removeClass("block").addClass("hidden");
            $("#i-page-main-section-error-container").removeClass("block").addClass("hidden");
            $("#i-page-main-container").removeClass("block").addClass("hidden");
            $("#i-page-error-container").text(message).removeClass("hidden").addClass("block");
        };
        return ApplicationController;
    })();
    Application.ApplicationController = ApplicationController;

    Application.__currentApp = new Application.ApplicationController();
})(Application || (Application = {}));
