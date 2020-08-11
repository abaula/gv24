///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="ServerAjaxData.d.ts"/>
var Page;
(function (Page) {
    var AjaxAuthRequest = (function () {
        function AjaxAuthRequest(login, pass) {
            this.login = login;
            this.pass = pass;
        }
        return AjaxAuthRequest;
    })();

    /*
    Класс управляющий основными элементами на странице.
    
    Поддерживаются 2 шаблона поведения: для приватных страниц и для публичных страниц.
    
    Признак приватности страницы задаётся свойством "public isPrivatePage: boolean".
    
    Приветные страницы запрещают просмотр содержимого в #page-main-section без авторизации пользователя.
    
    Сценарий поведения для приватных страниц:
    1) Событие: загрузка страницы
    Поведение:
    1) отображается секция #page-loading-section
    2) производится проверка текущего статуса авторизации
    3) если пользователь не авторизован, то отображаются секции: #page-auth-section, #i-page-top-login-container
    4) если пользователь авторизован , то отображаются секции: #page-main-section, #i-page-top-logout-container
    
    2) Событие: успешная авторизация
    Поведение:
    1) отображаются секции: #page-main-section, #i-page-top-logout-container
    2) вызывается callback функция "callbackFoo(true);"
    
    3) Событие: выход из системы
    Поведение:
    1) отображаются секции: #page-auth-section, #i-page-top-login-container
    2) вызывается callback функция "callbackFoo(false);"
    
    4) Событие: нажатие на ссылку "Вход"
    Поведение:
    1) ничего не делать, т.к. если ссылка "Вход", значит отображается секция авторизации #page-auth-section
    
    Публичные страницы не запрещают просмотр содержимого в #page-main-section без авторизации пользователя.
    
    Сценарий поведения для публичных страниц:
    1) Событие: загрузка страницы
    Поведение:
    1) отображается секция #page-main-section
    2) производится проверка текущего статуса авторизации
    3) если пользователь не авторизован, то отображаются секции: #i-page-top-login-container
    4) если пользователь авторизован, то отображаются секции: #i-page-top-logout-container
    
    2) Событие: успешная авторизация
    Поведение:
    1) отображаются секции: #i-page-top-logout-container
    2) скрывается секция: #page-auth-section
    2) вызывается callback функция "callbackFoo(true);"
    
    3) Событие: выход из системы
    Поведение:
    1) отображаются секции: #i-page-top-login-container
    2) вызывается callback функция "callbackFoo(false);"
    
    4) Событие: нажатие на ссылку "Вход"
    Поведение:
    1) скрыть или отобразить #page-auth-section
    
    
    
    */
    var PageController = (function () {
        function PageController() {
            // ссылка на обратную функцию
            this.callbackFoo = null;
        }
        // инициализация страницы
        PageController.prototype.Init = function (isPrivatePage, callback) {
            // сохраняем свойство приватности страницы
            currentPage.isPrivatePage = isPrivatePage;

            // сохраняем ссылку на обратную функцию
            currentPage.callbackFoo = callback;

            // присваиваем начальное свойство состояния авторизации
            currentPage.isAuthorized = false;

            ///////////////
            // прикрепляем обработчики событий
            // кнопка отправки логина и пароля
            $("#page-auth-panel-btn").click(PageController.prototype._onSubmitClick);

            // изменение текста в полях
            $("#page-auth-panel input").keyup(PageController.prototype._onTextChange);

            // ссылка входа в систему
            $("#page-top-login-panel-login-link").click(PageController.prototype._onLoginClick);

            // ссылка выхода из системы
            $("#page-top-login-panel-logout-link").click(PageController.prototype._onLogoutClick);

            // ссылка по имени пользователя
            $("#page-top-login-panel-user-info").click(PageController.prototype._onUserNameClick);

            if (currentPage.isPrivatePage)
                PageController.prototype.switchToLoadingSection();
else
                PageController.prototype.switchToMainSection();

            // проверяем авторизацию на сайте
            PageController.prototype.checkAuthStatus();
        };

        PageController.prototype.getAuthorizedState = function () {
            return currentPage.isAuthorized;
        };

        /*
        Помогает сохранить работоспособность AJAX с любым именем хоста
        Выполняет JSON запрос к серверу - имя хоста формируется динамически
        */
        PageController.prototype.getFullUrl = function (path) {
            return document.location.protocol + "//" + document.location.host + "/" + path;
        };

        PageController.prototype._onTextChange = function (event) {
            $("#page-auth-panel input").removeClass("page-auth-panel-block-ctrl-red");
        };

        PageController.prototype.checkAuthStatus = function () {
            $.ajax({
                type: "GET",
                url: PageController.prototype.getFullUrl("api/auth"),
                success: PageController.prototype._onAjaxCheckAuthStatusSuccess,
                error: PageController.prototype._onAjaxCheckAuthStatusError
            });
        };

        PageController.prototype._onAjaxCheckAuthStatusSuccess = function (data, status, jqXHR) {
            if (null == data.data) {
                $("#i-page-top-login-container").removeClass("hidden").addClass("block");
                $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
                $("#i-page-top-login-user-info > span").text("");

                currentPage.isAuthorized = false;

                if (currentPage.isPrivatePage)
                    PageController.prototype.switchToAuthSection();
            } else {
                $("#i-page-top-login-container").removeClass("block").addClass("hidden");
                $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
                var authResp = data.data;
                $("#i-page-top-login-user-info > span").text(authResp.name);

                currentPage.isAuthorized = true;

                if (currentPage.isPrivatePage) {
                    PageController.prototype.switchToMainSection();

                    if (null != currentPage.callbackFoo)
                        currentPage.callbackFoo(true);
                }
            }
        };

        PageController.prototype._onAjaxCheckAuthStatusError = function (jqXHR, status, message) {
            if (currentPage.isPrivatePage)
                PageController.prototype.switchToErrorSection("Произошла ошибка на сервере. Попробуйте перегрузить страницу позже.");
        };

        PageController.prototype._onUserNameClick = function (event) {
            window.location.href = PageController.prototype.getFullUrl("profile");
        };

        PageController.prototype._onLoginClick = function (event) {
            if (false == currentPage.isPrivatePage) {
                var state = $("#page-auth-section").hasClass("hidden");
                PageController.prototype.switchAuthSectionVisability(state);
            }
        };

        PageController.prototype._onLogoutClick = function (event) {
            $.ajax({
                type: "DELETE",
                url: PageController.prototype.getFullUrl("api/auth"),
                success: PageController.prototype._onAjaxLogoutSuccess,
                error: PageController.prototype._onAjaxLogoutError
            });
        };

        PageController.prototype._onAjaxLogoutSuccess = function (data, status, jqXHR) {
            $("#i-page-top-login-container").removeClass("hidden").addClass("block");
            $("#i-page-top-logout-container").removeClass("block").addClass("hidden");
            $("#i-page-top-login-user-info > span").text("");

            if (currentPage.isPrivatePage)
                PageController.prototype.switchToAuthSection();

            if (null != currentPage.callbackFoo)
                currentPage.callbackFoo(false);
        };

        PageController.prototype._onAjaxLogoutError = function (jqXHR, status, message) {
            // ничего не делаем
        };

        PageController.prototype._onSubmitClick = function (event) {
            PageController.prototype.switchLoginControlsEnableState(false);

            var login = $("#page-auth-panel-login").val();
            var pass = $("#page-auth-panel-pass").val();

            var request = new AjaxAuthRequest(login.trim(), pass.trim());

            $.ajax({
                type: "POST",
                url: PageController.prototype.getFullUrl("api/auth"),
                data: JSON.stringify(request),
                contentType: "application/json",
                dataType: "json",
                success: PageController.prototype._onAjaxLoginSuccess,
                error: PageController.prototype._onAjaxLoginError
            });
        };

        PageController.prototype._onAjaxLoginSuccess = function (data, status, jqXHR) {
            PageController.prototype.switchLoginControlsEnableState(true);

            // обработка ответа сервера
            var authResp = data.data;

            // отображаем имя в строке приветствия
            $("#i-page-top-login-container").removeClass("block").addClass("hidden");
            $("#i-page-top-logout-container").removeClass("hidden").addClass("block");
            $("#i-page-top-login-user-info > span").text(authResp.name);

            PageController.prototype.showLoginError(false, "");

            if (currentPage.isPrivatePage)
                PageController.prototype.switchToMainSection();
else
                PageController.prototype.switchAuthSectionVisability(false);

            if (null != currentPage.callbackFoo)
                currentPage.callbackFoo(true);
        };

        PageController.prototype._onAjaxLoginError = function (jqXHR, status, message) {
            PageController.prototype.switchLoginControlsEnableState(true);

            if (1 > jqXHR.responseText.length) {
                var message = "Сервер не отвечает. Попробуйте повторить попытку позже.";
                PageController.prototype.showLoginError(true, message);
            } else {
                // обработка ответа сервера
                var data = JSON.parse(jqXHR.responseText);
                var authResp = data.data;
                var errorCode = parseInt(data.code);

                if (3 == errorCode) {
                    // Логин или пароль указаны неверно
                    $("#page-auth-panel input").addClass("page-auth-panel-block-ctrl-red");
                    var message = "Неправильно указан email или пароль. Повторите попытку.";
                    PageController.prototype.showLoginError(true, message);
                } else if (4 == errorCode) {
                    // Учётная запись не активирована
                    var message = "Уважаемый " + authResp.name + ". Ваша учётная запись не активирована. Вход в систему невозможен.";
                    PageController.prototype.showLoginError(true, message);
                } else if (5 == errorCode) {
                    // Учётная запись заблокирована администрацией
                    var message = "Уважаемый " + authResp.name + ". Ваша учётная запись была заблокирована администрацией сайта " + authResp.banDate + ". Вход в систему невозможен.";
                    PageController.prototype.showLoginError(true, message);
                }
            }
        };

        PageController.prototype.switchToAuthSection = function () {
            $("#page-loading-section").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#page-main-section").removeClass("block").addClass("hidden");
            $("#page-auth-section").removeClass("hidden").addClass("block");
        };

        PageController.prototype.switchToMainSection = function () {
            $("#page-loading-section").removeClass("block").addClass("hidden");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#page-auth-section").removeClass("block").addClass("hidden");
            $("#page-main-section").removeClass("hidden").addClass("block");
        };

        PageController.prototype.switchToErrorSection = function (message) {
            $("#page-loading-section").removeClass("block").addClass("hidden");
            $("#page-auth-section").removeClass("block").addClass("hidden");
            $("#page-main-section").removeClass("block").addClass("hidden");

            $("#i-page-error-container").text(message).removeClass("hidden").addClass("block");
        };

        PageController.prototype.showLoginError = function (visible, message) {
            if (visible) {
                $("#page-auth-error-panel").removeClass("hidden").addClass("block").text(message);
            } else {
                $("#page-auth-error-panel").removeClass("block").addClass("hidden").text("");
            }
        };

        PageController.prototype.switchToLoadingSection = function () {
            $("#page-loading-section").removeClass("hidden").addClass("block");
            $("#i-page-error-container").removeClass("block").addClass("hidden");
            $("#page-auth-section").removeClass("block").addClass("hidden");
            $("#page-main-section").removeClass("block").addClass("hidden");
        };

        PageController.prototype.switchAuthSectionVisability = function (visible) {
            if (visible)
                $("#page-auth-section").removeClass("hidden").addClass("block");
else
                $("#page-auth-section").removeClass("block").addClass("hidden");
        };

        PageController.prototype.switchLoginControlsEnableState = function (enable) {
            if (enable) {
                $("#page-auth-panel-btn").removeClass("hidden").addClass("inline-block");
                $("#page-auth-panel-loading").removeClass("inline-block").addClass("hidden");
                $("#page-auth-panel input").removeAttr("disabled");
            } else {
                $("#page-auth-panel-btn").removeClass("inline-block").addClass("hidden");
                $("#page-auth-panel-loading").removeClass("hidden").addClass("inline-block");
                $("#page-auth-panel input").attr("disabled", "disabled");
            }
        };
        return PageController;
    })();
    Page.PageController = PageController;

    var currentPage = new PageController();
})(Page || (Page = {}));
