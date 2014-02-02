///<reference path="TestCase1.ts"/>
///<reference path="Scripts\typings\jquery\jquery.d.ts"/>

function _drawTasks(tasks: Routes.RouteTask[], element: JQuery): void
{
    for (var i = 0; i < tasks.length; i++)
    {
        var task: Routes.RouteTask = tasks[i];
        element.append("<div>" + (i+1) + ". " + task.getName() + "</div>");
    }

}

function _drawEntry(startVertex: Graph.GVertex, entry: Routes.RouteEntry, edge: Graph.GEdge, index: number, element: JQuery)
{
    element.append("<div>" + (index + 1) + ". " + startVertex.getName() + " - " + edge.getAnotherVertex(startVertex).getName() + " (" + edge.getDistance() + " км.)</div>");
    var p1aInner: JQuery = $("<p></p>").appendTo(element);

    $("<div>Commited tasks:</div>").appendTo(p1aInner).css("text-decoration", "underline");
    var commitedTasks: Routes.RouteTask[] = entry.getCommitedTasks();
    _drawTasks(commitedTasks, p1aInner);

    $("<div>Fulfiled tasks:</div>").appendTo(p1aInner).css("text-decoration", "underline");
    var fulfiledTasks: Routes.RouteTask[] = entry.getFulfiledTasks();
    _drawTasks(fulfiledTasks, p1aInner);

    $("<div>Excluded tasks:</div>").appendTo(p1aInner).css("text-decoration", "underline");
    var excludedTasks: Routes.RouteTask[] = entry.getExcludedTasks();
    _drawTasks(excludedTasks, p1aInner);
}

function _drawEntries(startVertex: Graph.GVertex, entries: Routes.RouteEntry[], element: JQuery): Graph.GVertex
{
    for (var i = 0; i < entries.length; i++)
    {
        var entry: Routes.RouteEntry = entries[i];
        var edge: Graph.GEdge = entry.getEdge();

        _drawEntry(startVertex, entry, edge, i, element);

        startVertex = edge.getAnotherVertex(startVertex);
    }

    return startVertex;
}

function _drawRoute(route: Routes.Route, element: JQuery): void
{
    element.append("<div>Дистанция маршрута: " + route.getDistanse() + " км.</div>");
    element.append("<div>Дистанция заказов: " + route.getAllTasksDistance() + " км.</div>");
    element.append("<div>Коэф. дистанции: " + route.getDistanse() / route.getAllTasksDistance() + "</div>");
    element.append("<div>Выручка: " + route.getProceeds() + " руб.</div>");
    element.append("<div>Выручка за 1 км.: " + route.getProfit(false) + " руб.</div>");
    element.append("<div>Сумарный вес: " + route.getWeight() + " кг.</div>");
    element.append("<div>Сумарный объём: " + route.getValue() + " м3</div>");

    var p1a: JQuery = $("<p></p>").appendTo(element);
    var startVertex: Graph.GVertex = route.getStartVertex();
    var entries1: Routes.RouteEntry[] = route.getEntries();
    _drawEntries(startVertex, entries1, p1a);
    
}


$(document).ready(function ()
{
    $("#calculate").click(function ()
    {

        var startTime: number = new Date().getTime();
        var testCase1: Test.TestCase1 = new Test.TestCase1();
        testCase1.runTest();
        var stopTime: number = new Date().getTime();
        var seconds = (stopTime - startTime) / 1000;
        $("div#timer").html("Time = " + seconds + " sec");

        var route: Routes.Route = testCase1.getRoute();
        var routeWithWayBack: Routes.Route = testCase1.getRouteWithWayBack();

        var p1: JQuery = $("div#route > p");
        _drawRoute(route, p1);
        p1.append("<hr/>");

        ///////////////
        var p2: JQuery = $("div#routeWithWayBack > p");
        _drawRoute(routeWithWayBack, p2);
        p2.append("<hr/>");


    });


});
