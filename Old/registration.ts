///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="page.ts"/>
///<reference path="ServerAjaxData.d.ts"/>




module Registration
{
    class RegistrationRequest
    {
        public login: string;
        public email: string;

        constructor(login: string, email: string)
        {
            this.login = login;
            this.email = email;
            //            this.pass = (typeof pass === "undefined") ? "" : pass;
        }
    }

    export class RegistrationController
    {
        private _onTextChange(event: JQueryEventObject): void
        {
            var txtBox: JQuery = $(event.delegateTarget);
            var containerId = txtBox.parent().parent().attr("id");

            if ("registration-account-login" == containerId)
                $("#registration-account-login div.page-property-message").text("");
            else if ("registration-account-email" == containerId)
                $("#registration-account-email div.page-property-message").text("");

        }


        private _onRegiterButtonClick(event: JQueryEventObject): void
        {
            var button: JQuery = $(event.delegateTarget);
            var loginControl: JQuery = $("#registration-account-login :text");
            var emailControl: JQuery = $("#registration-account-email :text");
            var loginMessageControl: JQuery = $("#registration-account-login div.page-property-message");
            var emailMessageControl: JQuery = $("#registration-account-email div.page-property-message");
            
            // убираем сообщение об ошибке, если оно было
            $("#registration-account-cmd div.page-property-message").text("");
            // делаем кнопку недоступной
            button.attr("disabled", "disabled");

            // собираем данные для регистрации
            var login: string = loginControl.val();
            login = login.trim();
            loginControl.val(login);

            var email: string = emailControl.val();
            email = email.trim();
            emailControl.val(email);

            // проверки корректности введённых данных
            var validLogin: boolean = RegistrationController.prototype._validateLogin(login); 
            //window.console.log("Login (" + login + ") validation: " + validLogin);

            if (!validLogin)
            {
                loginMessageControl.text("Логин указан неправильно. Укажите не менее 3-х и не более 15 латинских символов и, по желанию, цифр");
            }

            var validEmail: boolean = RegistrationController.prototype._validateEmail(email);
            //window.console.log("Email (" + email + ") validation: " + validEmail);

            if (!validEmail)
            {
                emailMessageControl.text("Email указан неправильно. Внимательно проверьте указанный адрес");
            }

            if (validLogin && validEmail)
            {
                // отправка данных на сервер
                var request: RegistrationRequest = new RegistrationRequest(login, email);

                $.ajax({
                    type: "POST",
                    url: Page.PageController.prototype.getFullUrl("api/account"),
                    data: JSON.stringify(request),
                    contentType: "application/json",
                    dataType: "json",
                    success: RegistrationController.prototype._onAjaxSuccess,
                    error: RegistrationController.prototype._onAjaxError
                });
            }
            else
            {
                button.removeAttr("disabled");
            }
            

        }

        /*
        */
        private _onAjaxError(jqXHR: JQueryXHR, status: string, message: string): void
        {
            // делаем доступной кнопку регистрации
            $("#page-containers button").removeAttr("disabled");

            // обработка ответа сервера
            var data: ServerData.AjaxServerResponse = <ServerData.AjaxServerResponse>JSON.parse(jqXHR.responseText);

            // разбираем переданные коды ошибок
            var errCodes: string[] = data.code.split(";");
            var errMessages: string[] = data.userMessage.split(";");

            // отображаем ошибки
            for (var i: number = 0; i < errCodes.length; i++)
            {
                var eCode: number = parseInt(errCodes[i]);

                if (1 == eCode)
                {
                    $("#registration-account-cmd div.page-property-message").text(errMessages[i]);
                }
                else if (1001 == eCode)
                {
                    $("#registration-account-email div.page-property-message").text(errMessages[i]);
                }
                else if (1002 == eCode)
                {
                    $("#registration-account-login div.page-property-message").text(errMessages[i]);
                }
                else if (1003 == eCode)
                {
                    $("#registration-account-login div.page-property-message").text(errMessages[i]);
                }
                else if (1004 == eCode)
                {
                    $("#registration-account-email div.page-property-message").text(errMessages[i]);
                }
            }


            //window.console.log("Server error: code: " + data.code + ", message: " + data.userMessage + ", url: " + data.moreInfoUri);
            //window.console.log("Server error: status: " + status + ", message: " + message);

        }

        private _onAjaxSuccess(data: ServerData.AjaxServerResponse, status: string, jqXHR: JQueryXHR): void
        {
            //$("#page-containers button").removeAttr("disabled");

            // отображение результата операции
            $("#page-registration-form").removeClass("page-property").addClass("hidden");
            $("#page-registration-complete").removeClass("hidden").addClass("page-property");


            //window.console.log("Server success: code: " + data.code + ", message: " + data.userMessage + ", url: " + data.moreInfoUri);

        }

        private _validateEmail(email: string)
        {
            var emailReg: RegExp = new RegExp("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$");

            var valid: boolean = emailReg.test(email);

            return valid;
        }

        private _validateLogin(login: string)
        {
            // от 3 до 15 знаков
            var emailReg: RegExp = new RegExp("^[a-z0-9_-]{3,15}$");

            var valid: boolean = emailReg.test(login);

            return valid;
        }

        onDocumentReady(): void
        {
            // нажатие на кнопку регистрации
            $("#page-containers button").click(RegistrationController.prototype._onRegiterButtonClick);

            // изменение текста в полях
            $("#page-containers :text").change(RegistrationController.prototype._onTextChange);
        }

    }
}

$(document).ready(Registration.RegistrationController.prototype.onDocumentReady);