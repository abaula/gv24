<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Anton
 * Date: 19.11.13
 * Time: 23:33
 * To change this template use File | Settings | File Templates.
 */

error_reporting(E_ALL);

// DB settings
define('DB_HOST', 'localhost');
define('DB_USER', 'root');
define('DB_PASS', 'root');
define('DB_NAME', 'tris24');
$db_ops = array('host' => DB_HOST, 'user' => DB_USER, 'pass' => DB_PASS, 'db' => DB_NAME);

// Email settings
define('EMAIL_FROM', 'anton_baula@mail.ru');


// Memcache settings
define('MEMCACHE_HOST', '127.0.0.1');
define('MEMCACHE_PORT', 11211);

// virtual Directories
define('WEBAPI_URI', 'api');
//define('PROFILE_URI', 'profile');
//define('REGISTRATION_URI', 'registration');



// Paths
define('ROOT_PATH', $_SERVER['DOCUMENT_ROOT']);
define('ERROR_FILE', ROOT_PATH . '/errors.log.txt');


// Urls
//define('HOME_URL', 'http://localhost/');

// Session Keys
define('SESSION_USERID', 'UserId');
define('SESSION_USERNAME', 'UserName');
define('SESSION_REMOTE_ADDR', 'UserIPAddr');
define('SESSION_STARTTIME', 'StartTime');

?>