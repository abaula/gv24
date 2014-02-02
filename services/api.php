<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Anton
 * Date: 18.11.13
 * Time: 23:36
 * To change this template use File | Settings | File Templates.
 */
require_once("Settings.inc");
require_once("Session.module");
require_once("Headers.module");
require_once("CurrentUser.module");
require_once("AjaxServerResponse.module");
require_once("WebServices.module");

$uri_arr = explode("/", trim($_SERVER["REQUEST_URI"],"/"));

//echo var_dump( $uri_arr );

if(WEBAPI_URI == $uri_arr[0])
    // RESTful web api
{
    if(count($uri_arr) > 1)
        $webServ = getWebService($uri_arr[1]);
    else
        $webServ = null;

    if(null == $webServ)
    {
        // HTTP/1.1 400 Bad Request
        sendHTTPStatus(400);
    }
    else
    {
        // обрабочик запроса
        if(count($uri_arr) > 2)
            $args = array_slice($uri_arr, 2);
        else
            $args = null;

        //echo var_dump($args);

        $webServ->InvokeMember($_SERVER["REQUEST_METHOD"], $args);
    }
}
else
{
    // HTTP/1.1 404 Not Found
    sendHTTPStatus(404);
    // TODO показываем страницу ошибки ???


}


//echo $_SERVER["REQUEST_METHOD"];




//phpinfo();

?>