
///<reference path="Route.ts"/>
///<reference path="Calculator.ts"/>

module Test
{

    export class TestCase1
    {
        private _route: Routes.Route;
        private _routeWithWayBack: Routes.Route;

        getRoute(): Routes.Route
        {
            return this._route;
        }

        getRouteWithWayBack(): Routes.Route
        {
            return this._routeWithWayBack;
        }


        runTest(): void
        {
            // создаём список ограничений 
            var maxValue: number = 82; // 82 m2
            var maxWeight: number = 20000; // 20 tons
            var conflictResolveCriteria: Routes.ConflictResolveCriteria = Routes.ConflictResolveCriteria.MaxProfit;
            var loadingStrategy: Routes.LoadingStrategy = Routes.LoadingStrategy.SavingWeight;
            var restrictions: Routes.RouteRestrictions = new Routes.RouteRestrictions(maxValue, maxWeight, conflictResolveCriteria, loadingStrategy);



            // создание вершин графа - Graph.GVertex
            var vertex1: Graph.GVertex = new Graph.GVertex(1, "Калуга", 54.516697, 36.251335);
            var vertex2: Graph.GVertex = new Graph.GVertex(2, "Владимир", 56.146123, 40.406284);
            var vertex3: Graph.GVertex = new Graph.GVertex(3, "Лиски", 50.986963, 39.547148);
            var vertex4: Graph.GVertex = new Graph.GVertex(4, "Пенза", 53.199041, 45.011959);
            var vertex5: Graph.GVertex = new Graph.GVertex(5, "Рязань", 54.638876, 39.761467);
            var vertex6: Graph.GVertex = new Graph.GVertex(6, "Тамбов", 52.724233, 41.430416);
            var vertex7: Graph.GVertex = new Graph.GVertex(7, "Самара", 53.196984, 50.104294);
            var vertex8: Graph.GVertex = new Graph.GVertex(8, "Арзамас", 55.400366, 43.833532);
            var vertex9: Graph.GVertex = new Graph.GVertex(9, "Орёл", 52.97118, 36.065311);
            var vertex10: Graph.GVertex = new Graph.GVertex(10, "Липецк", 52.605967, 39.590492);

            // создаём задания на перевозку и вносим их в массив
            var tasks: Routes.RouteTask[] = [];
            var task: Routes.RouteTask = new Routes.RouteTask(1, "Калуга-Тамбов", vertex1, vertex6, 477, 20, 2000, 477);
            tasks.push(task);

            task = new Routes.RouteTask(2, "Владимир-Самара", vertex2, vertex7, 925, 35, 4700, 925);
            tasks.push(task);

            task = new Routes.RouteTask(3, "Лиски-Арзамас", vertex3, vertex8, 699, 12, 1200, 699);
            tasks.push(task);
            
            task = new Routes.RouteTask(4, "Пенза-Орёл", vertex4, vertex9, 719, 32, 6300, 719);
            tasks.push(task);

            task = new Routes.RouteTask(5, "Рязань-Липецк", vertex5, vertex10, 267, 26, 5100, 267);
            tasks.push(task);


            // создаём список заданий
            var taskList: Routes.RouteTaskList = new Routes.RouteTaskList();
            taskList.addRouteTasks(tasks);

            // получаем список уникальных вершин 
            var vertices: Graph.GVertex[] = taskList.getVertices();

            // создание массива рёбер графа Graph.GEdge
            var edges: Graph.GEdge[] = [];

            var edge: Graph.GEdge = new Graph.GEdge(1, "", 1, 2, 379);
            edges.push(edge);
            edge = new Graph.GEdge(2, "", 1, 3, 547);
            edges.push(edge);
            edge = new Graph.GEdge(3, "", 1, 4, 732);
            edges.push(edge);
            edge = new Graph.GEdge(4, "", 1, 5, 297);
            edges.push(edge);
            edge = new Graph.GEdge(5, "", 1, 6, 477);
            edges.push(edge);
            edge = new Graph.GEdge(6, "", 1, 7, 1147);
            edges.push(edge);
            edge = new Graph.GEdge(7, "", 1, 8, 650);
            edges.push(edge);
            edge = new Graph.GEdge(8, "", 1, 9, 209);
            edges.push(edge);
            edge = new Graph.GEdge(9, "", 1, 10, 391);
            edges.push(edge);
            edge = new Graph.GEdge(10, "", 2, 3, 757);
            edges.push(edge);
            edge = new Graph.GEdge(11, "", 2, 4, 568);
            edges.push(edge);
            edge = new Graph.GEdge(12, "", 2, 5, 234);
            edges.push(edge);
            edge = new Graph.GEdge(13, "", 2, 6, 484);
            edges.push(edge);
            edge = new Graph.GEdge(14, "", 2, 7, 925);
            edges.push(edge);
            edge = new Graph.GEdge(15, "", 2, 8, 279);
            edges.push(edge);
            edge = new Graph.GEdge(16, "", 2, 9, 546);
            edges.push(edge);
            edge = new Graph.GEdge(17, "", 2, 10, 500);
            edges.push(edge);
            edge = new Graph.GEdge(18, "", 3, 4, 584);
            edges.push(edge);
            edge = new Graph.GEdge(19, "", 3, 5, 495);
            edges.push(edge);
            edge = new Graph.GEdge(20, "", 3, 6, 295);
            edges.push(edge);
            edge = new Graph.GEdge(21, "", 3, 7, 935);
            edges.push(edge);
            edge = new Graph.GEdge(22, "", 3, 8, 699);
            edges.push(edge);
            edge = new Graph.GEdge(23, "", 3, 9, 447);
            edges.push(edge);
            edge = new Graph.GEdge(24, "", 3, 10, 221);
            edges.push(edge);
            edge = new Graph.GEdge(25, "", 4, 5, 443);
            edges.push(edge);
            edge = new Graph.GEdge(26, "", 4, 6, 291);
            edges.push(edge);
            edge = new Graph.GEdge(27, "", 4, 7, 418);
            edges.push(edge);
            edge = new Graph.GEdge(28, "", 4, 8, 315);
            edges.push(edge);
            edge = new Graph.GEdge(29, "", 4, 9, 719);
            edges.push(edge);
            edge = new Graph.GEdge(30, "", 4, 10, 425);
            edges.push(edge);
            edge = new Graph.GEdge(31, "", 5, 6, 286);
            edges.push(edge);
            edge = new Graph.GEdge(32, "", 5, 7, 855);
            edges.push(edge);
            edge = new Graph.GEdge(33, "", 5, 8, 403);
            edges.push(edge);
            edge = new Graph.GEdge(34, "", 5, 9, 374);
            edges.push(edge);
            edge = new Graph.GEdge(35, "", 5, 10, 267);
            edges.push(edge);
            edge = new Graph.GEdge(36, "", 6, 7, 707);
            edges.push(edge);
            edge = new Graph.GEdge(37, "", 6, 8, 405);
            edges.push(edge);
            edge = new Graph.GEdge(38, "", 6, 9, 428);
            edges.push(edge);
            edge = new Graph.GEdge(39, "", 6, 10, 134);
            edges.push(edge);
            edge = new Graph.GEdge(40, "", 7, 8, 648);
            edges.push(edge);
            edge = new Graph.GEdge(41, "", 7, 9, 1135);
            edges.push(edge);
            edge = new Graph.GEdge(42, "", 7, 10, 841);
            edges.push(edge);
            edge = new Graph.GEdge(43, "", 8, 9, 769);
            edges.push(edge);
            edge = new Graph.GEdge(44, "", 8, 10, 532);
            edges.push(edge);
            edge = new Graph.GEdge(45, "", 9, 10, 297);
            edges.push(edge);

            // создаём граф
            var graph: Graph.UndirectedGraph = new Graph.UndirectedGraph();
            graph.init(vertices, edges);

            // расчитываем маршрут
            var calculator: Calculator.RouteCalculator = new Calculator.RouteCalculator(taskList, restrictions, graph);
            calculator.calculateRoute(vertex1);

            // получаем оптимальный маршрут рассчитанный без учёта обратного пути
            this._route = calculator.getRoute();

            // получаем оптимальный маршрут рассчитанный с учётом обратного пути
            this._routeWithWayBack = calculator.getRouteWithWayBack();


            // todo отображаем маршруты
        }



    }
}