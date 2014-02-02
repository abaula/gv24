///<reference path="Route.ts"/>
///<reference path="Collections.ts"/>

module Graph
{
    /*
    Базовый класс для сущностей графа - вершины и ребра
    */
    export class GObject
    {
        // уникальный номер объекта
        private _id: number;
        // имя объекта 
        private _name: string;

        constructor(id: number, name: string)
        {
            this._id = id;
            this._name = name;
        }

        getId(): number
        {
            return this._id;
        }

        getName(): string
        {
            return this._name;
        }

        setName(value: string): void
        {
            this._name = value;
        }
    }

    /*
    Роль вершины для машрутов
    - разгрузка, погрузка, и разгрузка и погрузка
    */
    export enum GVertexTaskRole
    {
        Undefined,
        Loading,
        Unloading,
        All = Loading | Unloading
    }

    /*
    Вершина графа
    */
    export class GVertex extends GObject
    {
        // Рёбра присоединённые к точке
        private _edges: Collections.Dictionary<number, GEdge>;
        // Маршруты присоединённые к точке
        private _routeTasks: Collections.Dictionary<number, Routes.RouteTask>;        
        // Географические координаты вершины
        private _geoPoint: GEOPoint;
        // Сумма ролей вершины для заданий в которые она входит
        private _vertexTaskRole: GVertexTaskRole;

        constructor(id: number, name: string, latitude: number, longitude: number)
        {
            super(id, name);
            this._geoPoint = new GEOPoint(latitude, longitude);
            this._edges = new Collections.Dictionary<number, GEdge>();
            this._routeTasks = new Collections.Dictionary<number, Routes.RouteTask>();
            this._vertexTaskRole = GVertexTaskRole.Undefined;
        }

        getEdges(): GEdge[]
        {
            return this._edges.values();
        }

        getRouteTasks(): Routes.RouteTask[]
        {
            return this._routeTasks.values();
        }

        getGeoPoint(): GEOPoint
        {
            return this._geoPoint;
        }

        isEqual(vertex: GVertex): boolean
        {
            return this.getId() == vertex.getId();
        }

        addEdge(edge: GEdge): void
        {
            this._edges.setValue(edge.getId(), edge);
        }

        addRouteTask(routeTask: Routes.RouteTask): void
        {
            this._routeTasks.setValue(routeTask.getId(), routeTask);
        }

        // есть ли связанные задания для которых вершина выполняет указанную роль
        hasRouteTaskRole(role: GVertexTaskRole): boolean
        {
            if (GVertexTaskRole.Undefined == this._vertexTaskRole)
            {
                var tasks: Routes.RouteTask[] = this._routeTasks.values();

                for (var i = 0; i < tasks.length; i++)
                {
                    var task: Routes.RouteTask = tasks[i];
                    var isA: boolean = task.getVertexA().isEqual(this);
                    var isB: boolean = task.getVertexB().isEqual(this);

                    if (isA)
                        this._vertexTaskRole |= GVertexTaskRole.Loading;
                    
                    if (isB)
                        this._vertexTaskRole |= GVertexTaskRole.Unloading;

                }   
            }


            return 0 < (this._vertexTaskRole & role);
        }

        // возвращает те связанные задания для которых вершина выполняет указанную роль
        getRouteTasksForRole(role: GVertexTaskRole) : Routes.RouteTask[]
        {
            var result: Routes.RouteTask[] = [];
            var tasks: Routes.RouteTask[] = this._routeTasks.values();

            for (var i = 0; i < tasks.length; i++)
            {
                var task: Routes.RouteTask = tasks[i];
                
                if (role & GVertexTaskRole.Loading)
                {
                    // выбираем задания, у которых вершина является началом маршрута (загрузка)
                    var isA: boolean = task.getVertexA().isEqual(this);

                    if (isA)
                        result.push(task);
                }
                else if (role & GVertexTaskRole.Unloading)
                {
                    // выбираем задания, у которых вершина является концом маршрута (разгрузка)
                    var isB: boolean = task.getVertexB().isEqual(this);

                    if (isB)
                        result.push(task);
                }
            }   

            return result;
        }


    }

    /*
    Ребро графа    
    */
    export class GEdge extends GObject
    {
        // Идентификаторы вершин ребра
        private _verticesId: number[];
        // Вершины ребра
        private _vertices: GVertex[];
        // Расстояние (км)
        private _distance: number;

        constructor(id: number, name: string, vAId: number, vBId: number, distance: number)
        {
            super(id, name);
            this._verticesId = [vAId, vBId];
            this._vertices = [];
            this._distance = distance;
        }

        addVertex(v: GVertex): void
        {
            this._vertices.push(v);
        }

        getDistance(): number
        {
            return this._distance;
        }

        isEqual(edge: GEdge): boolean
        {
            return this.getId() == edge.getId();
        }

        getVertexId(getA: boolean): number
        {
            return getA ? this._verticesId[0] : this._verticesId[1];
        }

        getAnotherVertex(v: GVertex): GVertex
        {
            var result: GVertex = null;

            if (v == this._vertices[0])
                result = this._vertices[1];
            else if (v == this._vertices[1])
                result = this._vertices[0];

            return result;
        }

        getVertexA(): GVertex
        {
            return this._vertices[0];
        }

        getVertexB(): GVertex
        {
            return this._vertices[1];
        }


    }

    /*
    Точка, содержащая географические координаты
    */
    export class GEOPoint
    {
        private _latitude: number;
        private _longitude: number;

        constructor(latitude: number, longitude: number)
        {
            this._latitude = latitude;
            this._longitude = longitude;
        }

        getLatitude(): number
        {
            return this._latitude;
        }

        setLatitude(value: number): void
        {
            this._latitude = value;
        }

        getLongitude(): number
        {
            return this._longitude;
        }

        setLongitude(value: number): void
        {
            this._longitude = value;
        }

        clone(): GEOPoint
        {
            var point = new GEOPoint(this._latitude, this._longitude);
            return point;
        }
    }

    /*
    Ненаправленный граф
    */
    export class UndirectedGraph
    {
        private _vertices: Collections.Dictionary<number, GVertex>;
        private _edges: Collections.Dictionary<number, GEdge>;

        constructor()
        {
            this._vertices = new Collections.Dictionary<number, GVertex>();
            this._edges = new Collections.Dictionary<number, GEdge>();
        }

        // инициализация внутренней структуры графа
        init(vertices: Graph.GVertex[], edges: Graph.GEdge[]): void
        {
            // сохраняем вершины
            for (var i = 0; i < vertices.length; i++)
            {
                var vertex: GVertex = vertices[i];
                // сохраняем вершину
                this._vertices.setValue(vertex.getId(), vertex);
            }

            // сохраняем рёбра
            for (var i = 0; i < edges.length; i++)
            {
                var edge: GEdge = edges[i];

                // проставляем в рёбра ссылки на вершины
                var vertexA: GVertex = this._vertices.getValue(edge.getVertexId(true));
                edge.addVertex(vertexA);
                var vertexB: GVertex = this._vertices.getValue(edge.getVertexId(false));
                edge.addVertex(vertexB);

                // проставляем в вершины ссылки на ребро
                vertexA.addEdge(edge);
                vertexB.addEdge(edge);

                // сохраняем ребро
                this._edges.setValue(edge.getId(), edge);
            }
            
        }

        getEdges(): GEdge[]
        {
            return this._edges.values();
        }

    }




}