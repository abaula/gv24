

module Validators
{
    export class Validator
    {
        validateEmail(email: string): boolean
        {
            var emailReg: RegExp = new RegExp("^[_A-Za-z0-9-\\+]+(\\.[_A-Za-z0-9-]+)*@[A-Za-z0-9-]+(\\.[A-Za-z0-9-]+)*(\\.[A-Za-z]{2,})$");

            var valid: boolean = emailReg.test(email);

            return valid;
        }

        validateLogin(login: string): boolean
        {
            // от 3 до 15 знаков
            var emailReg: RegExp = new RegExp("^[a-z0-9_-]{3,15}$");

            var valid: boolean = emailReg.test(login);

            return valid;
        }

        validatePhone(phone: string): boolean
        {
            var reg: RegExp = new RegExp("^((8|\\+7)[\\- ]?)?(\\(?\\d{3}\\)?[\\- ]?)?[\\d\\- ]{7,10}$");
            var valid: boolean = reg.test(phone);

            return valid;
        }

        validateOGRN(orgn: string): boolean
        {
            //для ОГРН в 13 знаков
            if (orgn.length == 13 && (orgn.slice(12, 13) == (parseInt(orgn.slice(0, -1)) % 11).toString().slice(-1)))
            {
                return true;
            
            }
            //для ОГРН в 15 знаков
            else if (orgn.length == 15 && (orgn.slice(14, 15) == (parseInt(orgn.slice(0, -1)) % 13).toString().slice(-1)))
            {
                return true;
            }

            return false;
        }

        validateINN(inn: string): boolean
        {
            
            //преобразуем в массив
            var arr: string[] = inn.split('');

            //для ИНН в 10 знаков
            if ((arr.length == 10) && (parseInt(arr[9]) == ((2 * parseInt(arr[0]) + 4 * parseInt(arr[1]) + 10 * parseInt(arr[2]) + 3 * parseInt(arr[3]) + 5 * parseInt(arr[4]) + 9 * parseInt(arr[5]) + 4 * parseInt(arr[6]) + 6 * parseInt(arr[7]) + 8 * parseInt(arr[8])) % 11) % 10))
            {
                return true;                
            }
            //для ИНН в 12 знаков
            else if ((arr.length == 12) && ((parseInt(arr[10]) == ((7 * parseInt(arr[0]) + 2 * parseInt(arr[1]) + 4 * parseInt(arr[2]) + 10 * parseInt(arr[3]) + 3 * parseInt(arr[4]) + 5 * parseInt(arr[5])
                + 9 * parseInt(arr[6]) + 4 * parseInt(arr[7]) + 6 * parseInt(arr[8]) + 8 * parseInt(arr[9])) % 11) % 10)
                && (parseInt(arr[11]) == ((3 * parseInt(arr[0]) + 7 * parseInt(arr[1]) + 2 * parseInt(arr[2]) + 4 * parseInt(arr[3]) + 10 * parseInt(arr[4]) + 3 * parseInt(arr[5]) + 5 * parseInt(arr[6])
                + 9 * parseInt(arr[7]) + 4 * parseInt(arr[8]) + 6 * parseInt(arr[9]) + 8 * parseInt(arr[10])) % 11) % 10)))
            {
                return true;
            }

            return false;
        }

        validateDate(date: string): boolean
        {
            var reg: RegExp = new RegExp("[0-9]{2}-[0-9]{2}-[0-9]{4}");

            if (reg.test(date))
            {
                var dates: string[] = date.split("-");
                var day: number = parseInt(dates[0]);
                var month: number = parseInt(dates[1]);
                var year: number = parseInt(dates[2]);

                if (month < 1 || month > 12)
                    return false;
                else if (day < 1 || day > 31)
                    return false;
                else if ((month == 4 || month == 6 || month == 9 || month == 11) && day == 31)
                    return false;
                else if (month == 2) 
                {
                    var isleap: boolean = (year % 4 == 0 && (year % 100 != 0 || year % 400 == 0));

                    if (day > 29 || (day == 29 && !isleap))
                        return false;
                }

                return true;
            }

            return false;
        }

        getPassStrength(password: string): number
        {
            var strength: number = 0;

		    if (password.length < 6)
			    return strength;

            if (password.length >= 6)
                strength++; 

            if (password.length > 7)
                strength++; 

            if (password.match(/([a-z].*[A-Z])|([A-Z].*[a-z])/))
                strength++; 

            if (password.match(/([a-zA-Z])/) && password.match(/([0-9])/))
                strength++;

            if (password.match(/([!,%,&,@,#,$,^,*,?,_,~])/))
                strength++;

            if (password.match(/(.*[!,%,&,@,#,$,^,*,?,_,~].*[!,%,&,@,#,$,^,*,?,_,~])/))
                strength++;

            return strength;
        }

    }

    export var loginNotValidMessage: string = "Логин указан неправильно. Укажите не менее 3-х и не более 15 латинских символов и, по желанию, цифр.";
    export var emailNotValidMessage: string = "Email указан неправильно. Внимательно проверьте указанный адрес.";
    export var passNotValidMessage: string = "Пароль должен быть длинной не менее 6-ти символов.";
    export var passNotMatchMessage: string = "Пароли не совпадают.";
    export var passMatchMessage: string = "Старый и новый пароли не должны совпадать.";
    export var ogrnNotValidMessage: string = "ОГРН указан неправильно. Внимательно проверьте указанный номер.";
    export var innNotValidMessage: string = "ИНН указан неправильно. Внимательно проверьте указанный номер.";
    export var phoneNotValidMessage: string = "Телефон указан неправильно. Внимательно проверьте указанный номер.";
}