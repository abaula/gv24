<?php
/**
 * Created by JetBrains PhpStorm.
 * User: Anton
 * Date: 02.10.13
 * Time: 0:36
 * To change this template use File | Settings | File Templates.
 */

class GraphEdge
{
    public $id;
    public $cityId1;
    public $cityId2;
    public $distance;

    function __construct($eid, $c1, $c2, $d)
    {
        $this->id = $eid;
        $this->cityId1 = $c1;
        $this->cityId2 = $c2;
        $this->distance = $d;
    }
}


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
    public $priceWeight100Km;
    public $priceValue100Km;

    function __construct($id, $city1, $city2, $distance, $value, $weight, $price)
    {
        $this->id = $id;
        $this->city1 = $city1;
        $this->city2 = $city2;
        $this->distance = $distance;
        $this->value = $value;
        $this->weight = $weight;
        $this->price = $price;
        $this->priceWeight100Km = $price / ($distance / 100) / $weight;
        $this->priceValue100Km = $price / ($distance / 100) / $value;
    }
}

class DataPackage
{
    public $tasks;
    public $edges;

    function __construct($tasks, $edges)
    {
        $this->tasks = $tasks;
        $this->edges = $edges;
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

$task = new Task(1, $cities_arr[1], $cities_arr[6], 477, 20, 2000, 9540);
array_push($tasks_arr, $task);
$task = new Task(2, $cities_arr[2], $cities_arr[7], 925, 35, 4700, 18500);
array_push($tasks_arr, $task);
$task = new Task(3, $cities_arr[3], $cities_arr[8], 699, 12, 1200, 13980);
array_push($tasks_arr, $task);
$task = new Task(4, $cities_arr[4], $cities_arr[9], 719, 32, 6300, 14380);
array_push($tasks_arr, $task);
$task = new Task(5, $cities_arr[5], $cities_arr[10], 267, 26, 5100, 5340);
array_push($tasks_arr, $task);
$task = new Task(6, $cities_arr[5], $cities_arr[10], 267, 16, 2100, 0);
array_push($tasks_arr, $task);
$task = new Task(7, $cities_arr[3], $cities_arr[6], 295, 18, 1800, 6000);
array_push($tasks_arr, $task);




$arr = array();

$edge = new GraphEdge(1, 1, 2, 379);
array_push($arr, $edge);
$edge = new GraphEdge(2,  1, 3, 547);
array_push($arr, $edge);
$edge = new GraphEdge(3,  1, 4, 732);
array_push($arr, $edge);
$edge = new GraphEdge(4,  1, 5, 297);
array_push($arr, $edge);
$edge = new GraphEdge(5,  1, 6, 477);
array_push($arr, $edge);
$edge = new GraphEdge(6,  1, 7, 1147);
array_push($arr, $edge);
$edge = new GraphEdge(7,  1, 8, 650);
array_push($arr, $edge);
$edge = new GraphEdge(8,  1, 9, 209);
array_push($arr, $edge);
$edge = new GraphEdge(9,  1, 10, 391);
array_push($arr, $edge);
$edge = new GraphEdge(10,  2, 3, 757);
array_push($arr, $edge);
$edge = new GraphEdge(11,  2, 4, 568);
array_push($arr, $edge);
$edge = new GraphEdge(12,  2, 5, 234);
array_push($arr, $edge);
$edge = new GraphEdge(13,  2, 6, 484);
array_push($arr, $edge);
$edge = new GraphEdge(14,  2, 7, 925);
array_push($arr, $edge);
$edge = new GraphEdge(15,  2, 8, 279);
array_push($arr, $edge);
$edge = new GraphEdge(16,  2, 9, 546);
array_push($arr, $edge);
$edge = new GraphEdge(17,  2, 10, 500);
array_push($arr, $edge);
$edge = new GraphEdge(18,  3, 4, 584);
array_push($arr, $edge);
$edge = new GraphEdge(19,  3, 5, 495);
array_push($arr, $edge);
$edge = new GraphEdge(20,  3, 6, 295);
array_push($arr, $edge);
$edge = new GraphEdge(21,  3, 7, 935);
array_push($arr, $edge);
$edge = new GraphEdge(22,  3, 8, 699);
array_push($arr, $edge);
$edge = new GraphEdge(23,  3, 9, 447);
array_push($arr, $edge);
$edge = new GraphEdge(24,  3, 10, 221);
array_push($arr, $edge);
$edge = new GraphEdge(25,  4, 5, 443);
array_push($arr, $edge);
$edge = new GraphEdge(26,  4, 6, 291);
array_push($arr, $edge);
$edge = new GraphEdge(27,  4, 7, 418);
array_push($arr, $edge);
$edge = new GraphEdge(28,  4, 8, 315);
array_push($arr, $edge);
$edge = new GraphEdge(29,  4, 9, 719);
array_push($arr, $edge);
$edge = new GraphEdge(30,  4, 10, 425);
array_push($arr, $edge);
$edge = new GraphEdge(31,  5, 6, 286);
array_push($arr, $edge);
$edge = new GraphEdge(32,  5, 7, 855);
array_push($arr, $edge);
$edge = new GraphEdge(33,  5, 8, 403);
array_push($arr, $edge);
$edge = new GraphEdge(34,  5, 9, 374);
array_push($arr, $edge);
$edge = new GraphEdge(35,  5, 10, 267);
array_push($arr, $edge);
$edge = new GraphEdge(36,  6, 7, 707);
array_push($arr, $edge);
$edge = new GraphEdge(37,  6, 8, 405);
array_push($arr, $edge);
$edge = new GraphEdge(38,  6, 9, 428);
array_push($arr, $edge);
$edge = new GraphEdge(39,  6, 10, 134);
array_push($arr, $edge);
$edge = new GraphEdge(40,  7, 8, 648);
array_push($arr, $edge);
$edge = new GraphEdge(41,  7, 9, 1135);
array_push($arr, $edge);
$edge = new GraphEdge(42,  7, 10, 841);
array_push($arr, $edge);
$edge = new GraphEdge(43,  8, 9, 769);
array_push($arr, $edge);
$edge = new GraphEdge(44,  8, 10, 532);
array_push($arr, $edge);
$edge = new GraphEdge(45,  9, 10, 297);
array_push($arr, $edge);

$package = new DataPackage($tasks_arr, $arr);

echo json_encode($package);
?>