<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Anton
 * Date: 20.11.13
 * Time: 0:00
 * To change this template use File | Settings | File Templates.
 */
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/Settings.inc');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/Session.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/CurrentUser.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/SafeMySQL.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/AppErrors.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/SqlFactory.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/Headers.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/AjaxServerResponse.module');

require_once($_SERVER['DOCUMENT_ROOT'] . '/services/AccountWebService.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/OrgWebService.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/Mail.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/AuthWebService.module');
require_once($_SERVER['DOCUMENT_ROOT'] . '/services/CityAutoCompleteWebService.module');


//создание класса, коннект в БД
//$db = new SafeMySQL($db_ops);
//$result = $db->getAll('SELECT * FROM account;');
//var_dump($result);

//$logCheckSql = 'select 1 from account where name=?s';
//$db = new SafeMySQL($db_ops);
//$result = $db->getOne($logCheckSql, 'asasas');

//echo intval($result);

function Test_RegistrationServerRequest_Post()
{
    $data = new AjaxRegistrationRequest();
    $data->login = 'root';
    $data->email = 'anton.baula@gmail.com';
    $app = new AccountWebService();
    $app->onPost(null, $data);
}

//Test_RegistrationServerRequest_Post();

function Test_Email()
{
    $to = 'anton.baula@gmail.com';
    $subject = 'the subject';
    $message = 'hello Anton';

    $isSent = Mail::Send($to, $subject, $message);

    if(false == $isSent)
        echo "Not sent";
}

//Test_Email();


function Test_AuthRequest_Post()
{
    $data = new AjaxAuthRequest();
    $data->login = 'root';
    $data->pass = 'root';
    $app = new AuthWebService();
    $app->onPost(null, $data);
}

//Test_AuthRequest_Post();

function Test_LoginUpdate_Put()
{
    $data = new AjaxUpdateAccountRequest();
    $data->operation = 'login';
    $data->newLogin = 'root1';
    $app = new AccountWebService();
    $app->onPut(null, $data);
}

//Test_LoginUpdate_Put();

function Test_Org_Post()
{
    $data = new AjaxOrgDataResponse(null, 'Антон', 'ИП Антон', '1234567890123', '11111111111', 2);
    $contact1 = new OrgContactData(null, 'anton.baula@gmail.com', null, null, 'email', null);
    $contact2 = new OrgContactData(null, '+79037877195', null, null, 'phone1', null);
    $contacts = array($contact1, $contact2);
    $data->contacts = $contacts;
    $app = new OrgWebService();
    $app->onPost(null, $data);
}

//Test_Org_Post();


function Test_CityAutoCompleteWebService_Get()
{
    $args = array('мур');
    $app = new CityAutoCompleteWebService();
    $app->onGet($args);
}

//Test_CityAutoCompleteWebService_Get();