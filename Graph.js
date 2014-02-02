///<reference path="Route.ts"/>
///<reference path="Collections.ts"/>
var __extends = this.__extends || function (d, b) {
    for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p];
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
};
var Graph;
(function (Graph) {
    /*
    Базовый класс для сущностей графа - вершины и ребра
    */
    var GObject = (function () {
        function GObject(id, name) {
            this._id = id;
            this._name = name;
        }
        GObject.prototype.getId = function () {
            return this._id;
        };

        GObject.prototype.getName = function () {
            return this._name;
        };

        GObject.prototype.setName = function (value) {
            this._name = value;
        };
        return GObject;
    })();
    Graph.GObject = GObject;

    /*
    Роль вершины для машрутов
    - разгрузка, погрузка, и разгрузка и погрузка
    */
    (function (GVertexTaskRole) {
        GVertexTaskRole[GVertexTaskRole["Undefined"] = 0] = "Undefined";
        GVertexTaskRole[GVertexTaskRole["Loading"] = 1] = "Loading";
        GVertexTaskRole[GVertexTaskRole["Unloading"] = 2] = "Unloading";
        GVertexTaskRole[GVertexTaskRole["All"] = GVertexTaskRole.Loading | GVertexTaskRole.Unloading] = "All";
    })(Graph.GVertexTaskRole || (Graph.GVertexTaskRole = {}));
    var GVertexTaskRole = Graph.GVertexTaskRole;

    /*
    Вершина графа
    */
    var GVertex = (function (_super) {
        __extends(GVertex, _super);
        function GVertex(id, name, latitude, longitude) {
            _super.call(this, id, name);
            this._geoPoint = new GEOPoint(latitude, longitude);
            this._edges = new Collections.Dictionary();
            this._routeTasks = new Collections.Dictionary();
            this._vertexTaskRole = GVertexTaskRole.Undefined;
        }
        GVertex.prototype.getEdges = function () {
            return this._edges.values();
        };

        GVertex.prototype.getRouteTasks = function () {
            return this._routeTasks.values();
        };

        GVertex.prototype.getGeoPoint = function () {
            return this._geoPoint;
        };

        GVertex.prototype.isEqual = function (vertex) {
            return this.getId() == vertex.getId();
        };

        GVertex.prototype.addEdge = function (edge) {
            this._edges.setValue(edge.getId(), edge);
        };

        GVertex.prototype.addRouteTask = function (routeTask) {
            this._routeTasks.setValue(routeTask.getId(), routeTask);
        };

        // есть ли связанные задания для которых вершина выполняет указанную роль
        GVertex.prototype.hasRouteTaskRole = function (role) {
            if (GVertexTaskRole.Undefined == this._vertexTaskRole) {
                var tasks = this._routeTasks.values();

                for (var i = 0; i < tasks.length; i++) {
                    var task = tasks[i];
                    var isA = task.getVertexA().isEqual(this);
                    var isB = task.getVertexB().isEqual(this);

                    if (isA)
                        this._vertexTaskRole |= GVertexTaskRole.Loading;

                    if (isB)
                        this._vertexTaskRole |= GVertexTaskRole.Unloading;
                }
            }

            return 0 < (this._vertexTaskRole & role);
        };

        // возвращает те связанные задания для которых вершина выполняет указанную роль
        GVertex.prototype.getRouteTasksForRole = function (role) {
            var result = [];
            var tasks = this._routeTasks.values();

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];

                if (role & GVertexTaskRole.Loading) {
                    // выбираем задания, у которых вершина является началом маршрута (загрузка)
                    var isA = task.getVertexA().isEqual(this);

                    if (isA)
                        result.push(task);
                } else if (role & GVertexTaskRole.Unloading) {
                    // выбираем задания, у которых вершина является концом маршрута (разгрузка)
                    var isB = task.getVertexB().isEqual(this);

                    if (isB)
                        result.push(task);
                }
            }

            return result;
        };
        return GVertex;
    })(GObject);
    Graph.GVertex = GVertex;

    /*
    Ребро графа
    */
    var GEdge = (function (_super) {
        __extends(GEdge, _super);
        function GEdge(id, name, vAId, vBId, distance) {
            _super.call(this, id, name);
            this._verticesId = [vAId, vBId];
            this._vertices = [];
            this._distance = distance;
        }
        GEdge.prototype.addVertex = function (v) {
            this._vertices.push(v);
        };

        GEdge.prototype.getDistance = function () {
            return this._distance;
        };

        GEdge.prototype.isEqual = function (edge) {
            return this.getId() == edge.getId();
        };

        GEdge.prototype.getVertexId = function (getA) {
            return getA ? this._verticesId[0] : this._verticesId[1];
        };

        GEdge.prototype.getAnotherVertex = function (v) {
            var result = null;

            if (v == this._vertices[0])
                result = this._vertices[1];
else if (v == this._vertices[1])
                result = this._vertices[0];

            return result;
        };

        GEdge.prototype.getVertexA = function () {
            return this._vertices[0];
        };

        GEdge.prototype.getVertexB = function () {
            return this._vertices[1];
        };
        return GEdge;
    })(GObject);
    Graph.GEdge = GEdge;

    /*
    Точка, содержащая географические координаты
    */
    var GEOPoint = (function () {
        function GEOPoint(latitude, longitude) {
            this._latitude = latitude;
            this._longitude = longitude;
        }
        GEOPoint.prototype.getLatitude = function () {
            return this._latitude;
        };

        GEOPoint.prototype.setLatitude = function (value) {
            this._latitude = value;
        };

        GEOPoint.prototype.getLongitude = function () {
            return this._longitude;
        };

        GEOPoint.prototype.setLongitude = function (value) {
            this._longitude = value;
        };

        GEOPoint.prototype.clone = function () {
            var point = new GEOPoint(this._latitude, this._longitude);
            return point;
        };
        return GEOPoint;
    })();
    Graph.GEOPoint = GEOPoint;

    /*
    Ненаправленный граф
    */
    var UndirectedGraph = (function () {
        function UndirectedGraph() {
            this._vertices = new Collections.Dictionary();
            this._edges = new Collections.Dictionary();
        }
        // инициализация внутренней структуры графа
        UndirectedGraph.prototype.init = function (vertices, edges) {
            for (var i = 0; i < vertices.length; i++) {
                var vertex = vertices[i];

                // сохраняем вершину
                this._vertices.setValue(vertex.getId(), vertex);
            }

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];

                // проставляем в рёбра ссылки на вершины
                var vertexA = this._vertices.getValue(edge.getVertexId(true));
                edge.addVertex(vertexA);
                var vertexB = this._vertices.getValue(edge.getVertexId(false));
                edge.addVertex(vertexB);

                // проставляем в вершины ссылки на ребро
                vertexA.addEdge(edge);
                vertexB.addEdge(edge);

                // сохраняем ребро
                this._edges.setValue(edge.getId(), edge);
            }
        };

        UndirectedGraph.prototype.getEdges = function () {
            return this._edges.values();
        };
        return UndirectedGraph;
    })();
    Graph.UndirectedGraph = UndirectedGraph;
})(Graph || (Graph = {}));
//# sourceMappingURL=Graph.js.map
