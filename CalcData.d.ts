

interface City
{
    id : number;
    name : string;
    latitude: number;
    longitude: number;
}

interface Task
{
    id: number;
    city1: City;
    city2: City;
    weight: number;
    value: number;
    distance: number;
    price: number;
    priceWeight100Km: number;
    priceValue100Km: number;
}

interface GraphEdge
{
    id: number;
	cityId1: number;
	cityId2: number;
	distance: number;
}

interface DataPackage
{
    tasks: Task[];
    edges: GraphEdge[];
}

interface VehicleParams
{
    id: number;
    maxWeight: number;
    maxValue: number;
    expense: number;
    taxWeight: number;
    taxValue: number;
}