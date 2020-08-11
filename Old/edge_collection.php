<?php
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

echo json_encode($arr);

?>