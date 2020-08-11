<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Anton
 * Date: 29.09.13
 * Time: 23:33
 * To change this template use File | Settings | File Templates.
 */

class City
{
    public $id;
    public $name;
    public $latitude;
    public $longitude;

    function __construct($id, $name, $lat, $lon)
    {
        $this->id = $id;
        $this->name = $name;
        $this->latitude = $lat;
        $this->longitude = $lon;
    }
}

class Task
{
    public $id;
    public $city1;
    public $city2;
    public $weight;
    public $value;
    public $distance;
    public $price;

    function __construct($id, $city1, $city2, $distance, $value, $weight, $price)
    {
        $this->id = $id;
        $this->city1 = $city1;
        $this->city2 = $city2;
        $this->distance = $distance;
        $this->value = $value;
        $this->weight = $weight;
        $this->price = $price;
    }
}

$cities_arr = array();

$city = new City(1, "Калуга", 54.516697, 36.251335);
$cities_arr[1] = $city;
$city = new City(2, "Владимир", 56.146123, 40.406284);
$cities_arr[2] = $city;
$city = new City(3, "Лиски", 50.986963, 39.547148);
$cities_arr[3] = $city;
$city = new City(4, "Пенза", 53.199041, 45.011959);
$cities_arr[4] = $city;
$city = new City(5, "Рязань", 54.638876, 39.761467);
$cities_arr[5] = $city;
$city = new City(6, "Тамбов", 52.724233, 41.430416);
$cities_arr[6] = $city;
$city = new City(7, "Самара", 53.196984, 50.104294);
$cities_arr[7] = $city;
$city = new City(8, "Арзамас", 55.400366, 43.833532);
$cities_arr[8] = $city;
$city = new City(9, "Орёл", 52.97118, 36.065311);
$cities_arr[9] = $city;
$city = new City(10, "Липецк", 52.605967, 39.590492);
$cities_arr[10] = $city;

$tasks_arr = array();

$task = new Task(1, $cities_arr[1], $cities_arr[6], 477, 20, 2000, 477);
array_push($tasks_arr, $task);
$task = new Task(2, $cities_arr[2], $cities_arr[7], 925, 35, 4700, 925);
array_push($tasks_arr, $task);
$task = new Task(3, $cities_arr[3], $cities_arr[8], 699, 12, 1200, 699);
array_push($tasks_arr, $task);
$task = new Task(4, $cities_arr[4], $cities_arr[9], 719, 32, 6300, 719);
array_push($tasks_arr, $task);
$task = new Task(5, $cities_arr[5], $cities_arr[10], 267, 26, 5100, 267);
array_push($tasks_arr, $task);


echo json_encode($tasks_arr);

?>