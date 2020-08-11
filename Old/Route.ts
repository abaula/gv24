
///<reference path="Graph.ts"/>
///<reference path="Collections.ts"/>
                               
module Routes
{
    /*
    Задание на доставку груза, маршрут состоящий из 2-х точек, загрузки и выгрузки.
    Содержит данные о пункте отправления и назначения, о параметрах перевозимого груза включая стоимость
    */
    export class RouteTask
    {
        // уникальный номер задания
        private _id: number;
        // неуникальное название задания (например Смоленск - Москва)
        private _name: string;
        // начальная точка, место отправления
        private _vertexA: Graph.GVertex;
        // конечная точка, место прибытия
        private _vertexB: Graph.GVertex;
        // стоимость
        private _price: number;
        // объём груза
        private _value: number;
        // масса груза
        private _weight: number;
        // расстояние перевозки (по справочнику)
        private _distance: number;

        constructor(id: number, name: string, vertexA: Graph.GVertex, vertexB: Graph.GVertex, price: number, value: number, weight: number, distance: number)
        {
            this._id = id;
            this._name = name;
            this._vertexA = vertexA;
            this._vertexB = vertexB;
            this._price = price;
            this._value = value;
            this._weight = weight;
            this._distance = distance;
        }

        getId(): number
        {
            return this._id;
        }

        getName(): string
        {
            return this._name;
        }

        getVertexA(): Graph.GVertex
        {
            return this._vertexA;
        }

        setVertexA(value: Graph.GVertex) : void
        {
            this._vertexA = value;
        }

        getVertexB(): Graph.GVertex
        {
            return this._vertexB;
        }

        setVertexB(value: Graph.GVertex): void
        {
            this._vertexB = value;
        }


        getPrice(): number
        {
            return this._price;
        }

        getValue(): number
        {
            return this._value;
        }

        getWeight(): number
        {
            return this._weight;
        }

        getDistance(): number
        {
            return this._distance;
        }

        isVertexA(vertex: Graph.GVertex): boolean
        {
            return this._vertexA.getId() == vertex.getId();
        }

        hasVertex(vertex: Graph.GVertex): boolean
        {
            return this._vertexA.getId() == vertex.getId() || this._vertexB.getId() == vertex.getId();
        }

        // Устанавливает связь задания на перевозку с обеими вершинами
        bindVerticesToThisTask(): void
        {            
            this._vertexA.addRouteTask(this);
            this._vertexB.addRouteTask(this);
        }

        // возвращает стоимость за 1 км пути
        getProfit(): number
        {
            return this._price / this._distance;
        }
    }

    /*
    Список заданий на перевозку RouteTask, которые подлежат обработке
    В отличии от простого массива предоставляет сервисные функции
    */
    export class RouteTaskList
    {
        private _tasks: Collections.Dictionary<number, RouteTask>;
        private _vertices: Collections.Dictionary<number, Graph.GVertex>;

        constructor()
        {
            this._tasks = new Collections.Dictionary<number, RouteTask>();
            this._vertices = new Collections.Dictionary < number, Graph.GVertex>();
        }

        // инициализирует список заданий на перевозку 
        addRouteTasks(tasks: RouteTask[]) : void
        {
            for (var i = 0; i < tasks.length; i++)
            {
                var task: RouteTask = tasks[i];

                // сохраняем вершины без дублей
                this._saveVertex(task, task.getVertexA(), true);
                this._saveVertex(task, task.getVertexB(), false);

                // связываем вершины с заданием
                task.bindVerticesToThisTask();
                
                // сохраняем задание
                this._tasks.setValue(task.getId(), task);
            }            
        }

        // сохраняет только уникальные вершины без дублей
        // при необходимости подменяет вершины в задании
        private _saveVertex(task: RouteTask, vertex: Graph.GVertex, isA: boolean): void
        {
            if (this._vertices.containsKey(vertex.getId()))
            {
                // вершина с данным Id уже сохранена ранее, поэтому
                // подменяем вершину в задании на сохранённую ранее
                var savedVertex: Graph.GVertex = this._vertices.getValue(vertex.getId());

                if (isA)
                    task.setVertexA(savedVertex);
                else
                    task.setVertexB(savedVertex);
            }
            else
            {
                // сохраняем вершину
                this._vertices.setValue(vertex.getId(), vertex);
            }

        }

        // возвращает массив вершин
        getVertices(): Graph.GVertex[]
        {
            return this._vertices.values();
        }
    }

    /*
    Ограничения накладываемые на маршрут
    */
    export class RouteRestrictions
    {
        // максимальный объём
        private _maxValue: number;
        // максимальный вес
        private _maxWeight: number;
        // решение принимаемое при конфликте (если для загрузки одновременно доступны несколько грузов, суммарный вес или объём которых больше установленных максимальных ограничений, нужно от каких-то отказаться)
        private _conflictResolveCriteria: ConflictResolveCriteria; 
        // стратегия загрузки нескольких грузов по умолчанию
        private _loadingStrategy: LoadingStrategy;

        constructor(maxValue: number, maxWeight: number, conflictResolveCriteria: ConflictResolveCriteria, loadingStrategy: LoadingStrategy)
        {
            this._maxValue = maxValue;
            this._maxWeight = maxWeight;
            this._conflictResolveCriteria = conflictResolveCriteria
            this._loadingStrategy = loadingStrategy;
        }

        getMaxValue(): number
        {
            return this._maxValue;
        }

        getMaxWeight(): number
        {
            return this._maxWeight;
        }

        getConflictResolveCriteria(): ConflictResolveCriteria
        {
            return this._conflictResolveCriteria;
        }

        getLoadingStrategy(): LoadingStrategy
        {
            return this._loadingStrategy;
        }
    }


    /*
    Способы принятия решений при конфликтах из-за ограничений накладываемых на маршрут
    */
    export enum ConflictResolveCriteria
    {
        // максимальная выручка
        MaxProceeds,
        // максимальная прибыльность = максимальная стоимость за километр пути
        MaxProfit
    }

    /*
        Стратегия загрузки нескольких грузов - влияет на очерёдность загрузки нескольких грузов
    */
    export enum LoadingStrategy
    {
        // экономия веса
        SavingWeight,
        // экономия объёма
        SavingValue
    }


    /*
    Расчитанный оптимальный маршрут
    Содержит списки включенных заданий на перевозку и список исключённых заданий,
    тех, которые не подошли по параметрам к условиям ограничения RouteRestrictions.
    Содержит обшую протяжённость маршрута и другую справочную информацию
    */
    export class Route
    {
        // исполненные задания на перевозку
        private _fulfiledTasks: RouteTask[];
        // неисполненные задания на перевозку
        private _excludedTasks: RouteTask[];
        // массив частей маршрута
        private _entries: RouteEntry[];
        // обратный путь маршрута, из конца в начало
        private _wayBackEntry: RouteEntry;
        // суммарная дистанция маршрута
        private _sumDistance: number;
        // суммараная выручка
        private _sumProceeds: number;
        // суммарный объём груза в маршруте
        private _sumValue: number;
        // суммарный вес груза в маршруте
        private _sumWeight: number;
        // суммарное исходное расстрояние для выполненных задач
        private _fulfiledTasksDistance: number;
        // суммарное исходное расстояние для отложенных задач
        private _excludedTasksDistance: number;
        // суммарное исходное расстояние для всех задач
        private _allTasksDistance: number;

        constructor()
        {
            this._fulfiledTasks = [];
            this._excludedTasks = [];
            this._entries = [];
            this._wayBackEntry = null;
            this._sumDistance = 0;
            this._sumProceeds = 0;
            this._sumValue = 0;
            this._sumWeight = 0; 
            this._fulfiledTasksDistance = -1;
            this._excludedTasksDistance = -1;
            this._allTasksDistance = -1;
                       
        }

        getFulfiledTasks(): RouteTask[]
        {
            return this._fulfiledTasks;
        }

        getExcludedTasks(): RouteTask[]
        {
            return this._excludedTasks;
        }

        getEntries(): RouteEntry[]
        {
            return this._entries;
        }

        getWayBackEntry(): RouteEntry
        {
            return this._wayBackEntry;
        }

        setWayBackEntry(value: RouteEntry): void
        {
            this._wayBackEntry = value;
        }

        // возвращает дистанцию маршрута без дороги назад
        getDistanse(): number
        {
            return this._sumDistance;
        }

        // возвращает дистанцию маршрута с дорогой назад
        getDistanseWithWayBack(): number
        {
            return this._sumDistance + this._wayBackEntry.getEdge().getDistance();
        }

        // возвращает выручку маршрута
        getProceeds(): number
        {
            return this._sumProceeds;
        }


        // возвращает общий объём груза в маршруте
        getValue(): number
        {
            return this._sumValue;
        }

        // возвращает общий вес груза в маршруте
        getWeight(): number
        {
            return this._sumWeight;
        }

        // получить 1-ю вершину маршрута
        getStartVertex(): Graph.GVertex
        {
            if (1 > this._entries.length)
                return null;

            var entry: RouteEntry = this._entries[0];
            var edge: Graph.GEdge = entry.getEdge();

            return edge.getVertexA();
        }

        // получить последнюю вершину маршрута
        getEndVertex(): Graph.GVertex
        {
            if (1 > this._entries.length)
                return null;

            var index: number = this._entries.length - 1;
            var entry: RouteEntry = this._entries[index];
            var edge: Graph.GEdge = entry.getEdge();

            return edge.getVertexB();
        }

        // добавляем часть маршрута
        addEntry(entry: RouteEntry): void
        {
            //////////////////////////////////////////
            // Расчитываем суммовые значения

            // рассчитываем перевезённый вес и объём, полученная сумму денег
            // добавляем выполненные задания в список
            var fulfiledTasks: RouteTask[] = entry.getFulfiledTasks();

            for (var i = 0; i < fulfiledTasks.length; i++)
            {
                var task: RouteTask = fulfiledTasks[i];
                this._sumProceeds += task.getPrice();
                this._sumValue += task.getValue();
                this._sumWeight += task.getWeight();

                // добавляем выполненное задание в список
                this._fulfiledTasks.push(task);
            }

            // расстояние
            var edge: Graph.GEdge = entry.getEdge();
            this._sumDistance += edge.getDistance();

            // сохраняем часть маршрута
            this._entries.push(entry);

            // добавляем исключённые задания в список
            var excludedTasks: RouteTask[] = entry.getExcludedTasks();

            for (var i = 0; i < excludedTasks.length; i++)
            {
                var task: RouteTask = excludedTasks[i];
                this._excludedTasks.push(task);
            }            
        }

        getProfit(considerWayBack: boolean)
        {
            var distance: number = this._sumDistance;

            if (considerWayBack)
                distance += this._wayBackEntry.getEdge().getDistance();

            return this._sumProceeds / distance;                            
        }

        getEfficiency(considerWayBack: boolean): number
        {
            var numTasks: number = this._fulfiledTasks.length;
            var profit: number = this.getProfit(considerWayBack);
            return numTasks * profit;
        }

        // получить исходное расстояние для выполненных задач 
        getFulfiledTasksDistance(): number
        {
            if (0 > this._fulfiledTasksDistance)
            {
                this._fulfiledTasksDistance = 0;

                for (var i = 0; i < this._fulfiledTasks.length; i++)
                {
                    var task: RouteTask = this._fulfiledTasks[i];
                    this._fulfiledTasksDistance += task.getDistance();
                }
            }
            
            return this._fulfiledTasksDistance;
 
        }

        // получить исходное расстояние для отложенных задач 
        getExcludedTasksDistance(): number
        {
            if (0 > this._excludedTasksDistance)
            {
                this._excludedTasksDistance = 0;

                for (var i = 0; i < this._excludedTasks.length; i++)
                {
                    var task: RouteTask = this._excludedTasks[i];
                    this._excludedTasksDistance += task.getDistance();
                }
            }

            return this._excludedTasksDistance;
        }

        // получить исходное расстояние для всех задач 
        getAllTasksDistance(): number
        {
            if (0 > this._allTasksDistance)
            {
                this._allTasksDistance = 0;
                this._allTasksDistance += this.getFulfiledTasksDistance();
                this._allTasksDistance += this.getExcludedTasksDistance();
            }

            return this._allTasksDistance;
        }

    }

    /*
    Часть рассчитанного оптимального маршрута - один перегон между 2-я точками
    */
    export class RouteEntry
    {
        // ребро графа - перегон между двумя точками
        private _edge: Graph.GEdge;
        // массив принятых в вершине А в работу заданий на перевозку
        private _commitedTasks: RouteTask[];
        // массив исключенных в вершине А заданий на перевозку
        private _excludedTasks: RouteTask[];
        // массив завершённых в вершине Б заданий на перевозку
        private _fulfiledTasks: RouteTask[];
        
        constructor()
        {
            this._edge = null;
            this._commitedTasks = [];
            this._excludedTasks = [];
            this._fulfiledTasks = [];
        }

        getEdge(): Graph.GEdge
        {
            return this._edge;
        }

        setEdge(value: Graph.GEdge): void
        {
            this._edge = value;
        }

        getCommitedTasks(): RouteTask[]
        {
            return this._commitedTasks;
        }

        getFulfiledTasks(): RouteTask[]
        {
            return this._fulfiledTasks;
        }

        getExcludedTasks(): RouteTask[]
        {
            return this._excludedTasks;
        }

        addFulfiledTask(task: RouteTask): void
        {
             this._fulfiledTasks.push(task);                
        }

        addCommitedTask(task: RouteTask): void
        {
            this._commitedTasks.push(task);
        }

        addExcludedTask(task: RouteTask): void
        {
            this._excludedTasks.push(task);
        }


    }

}