///<reference path="Graph.ts"/>
///<reference path="Collections.ts"/>
var Routes;
(function (Routes) {
    /*
    Задание на доставку груза, маршрут состоящий из 2-х точек, загрузки и выгрузки.
    Содержит данные о пункте отправления и назначения, о параметрах перевозимого груза включая стоимость
    */
    var RouteTask = (function () {
        function RouteTask(id, name, vertexA, vertexB, price, value, weight, distance) {
            this._id = id;
            this._name = name;
            this._vertexA = vertexA;
            this._vertexB = vertexB;
            this._price = price;
            this._value = value;
            this._weight = weight;
            this._distance = distance;
        }
        RouteTask.prototype.getId = function () {
            return this._id;
        };

        RouteTask.prototype.getName = function () {
            return this._name;
        };

        RouteTask.prototype.getVertexA = function () {
            return this._vertexA;
        };

        RouteTask.prototype.setVertexA = function (value) {
            this._vertexA = value;
        };

        RouteTask.prototype.getVertexB = function () {
            return this._vertexB;
        };

        RouteTask.prototype.setVertexB = function (value) {
            this._vertexB = value;
        };

        RouteTask.prototype.getPrice = function () {
            return this._price;
        };

        RouteTask.prototype.getValue = function () {
            return this._value;
        };

        RouteTask.prototype.getWeight = function () {
            return this._weight;
        };

        RouteTask.prototype.getDistance = function () {
            return this._distance;
        };

        RouteTask.prototype.isVertexA = function (vertex) {
            return this._vertexA.getId() == vertex.getId();
        };

        RouteTask.prototype.hasVertex = function (vertex) {
            return this._vertexA.getId() == vertex.getId() || this._vertexB.getId() == vertex.getId();
        };

        // Устанавливает связь задания на перевозку с обеими вершинами
        RouteTask.prototype.bindVerticesToThisTask = function () {
            this._vertexA.addRouteTask(this);
            this._vertexB.addRouteTask(this);
        };

        // возвращает стоимость за 1 км пути
        RouteTask.prototype.getProfit = function () {
            return this._price / this._distance;
        };
        return RouteTask;
    })();
    Routes.RouteTask = RouteTask;

    /*
    Список заданий на перевозку RouteTask, которые подлежат обработке
    В отличии от простого массива предоставляет сервисные функции
    */
    var RouteTaskList = (function () {
        function RouteTaskList() {
            this._tasks = new Collections.Dictionary();
            this._vertices = new Collections.Dictionary();
        }
        // инициализирует список заданий на перевозку
        RouteTaskList.prototype.addRouteTasks = function (tasks) {
            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];

                // сохраняем вершины без дублей
                this._saveVertex(task, task.getVertexA(), true);
                this._saveVertex(task, task.getVertexB(), false);

                // связываем вершины с заданием
                task.bindVerticesToThisTask();

                // сохраняем задание
                this._tasks.setValue(task.getId(), task);
            }
        };

        // сохраняет только уникальные вершины без дублей
        // при необходимости подменяет вершины в задании
        RouteTaskList.prototype._saveVertex = function (task, vertex, isA) {
            if (this._vertices.containsKey(vertex.getId())) {
                // вершина с данным Id уже сохранена ранее, поэтому
                // подменяем вершину в задании на сохранённую ранее
                var savedVertex = this._vertices.getValue(vertex.getId());

                if (isA)
                    task.setVertexA(savedVertex);
else
                    task.setVertexB(savedVertex);
            } else {
                // сохраняем вершину
                this._vertices.setValue(vertex.getId(), vertex);
            }
        };

        // возвращает массив вершин
        RouteTaskList.prototype.getVertices = function () {
            return this._vertices.values();
        };
        return RouteTaskList;
    })();
    Routes.RouteTaskList = RouteTaskList;

    /*
    Ограничения накладываемые на маршрут
    */
    var RouteRestrictions = (function () {
        function RouteRestrictions(maxValue, maxWeight, conflictResolveCriteria, loadingStrategy) {
            this._maxValue = maxValue;
            this._maxWeight = maxWeight;
            this._conflictResolveCriteria = conflictResolveCriteria;
            this._loadingStrategy = loadingStrategy;
        }
        RouteRestrictions.prototype.getMaxValue = function () {
            return this._maxValue;
        };

        RouteRestrictions.prototype.getMaxWeight = function () {
            return this._maxWeight;
        };

        RouteRestrictions.prototype.getConflictResolveCriteria = function () {
            return this._conflictResolveCriteria;
        };

        RouteRestrictions.prototype.getLoadingStrategy = function () {
            return this._loadingStrategy;
        };
        return RouteRestrictions;
    })();
    Routes.RouteRestrictions = RouteRestrictions;

    /*
    Способы принятия решений при конфликтах из-за ограничений накладываемых на маршрут
    */
    (function (ConflictResolveCriteria) {
        // максимальная выручка
        ConflictResolveCriteria[ConflictResolveCriteria["MaxProceeds"] = 0] = "MaxProceeds";

        // максимальная прибыльность = максимальная стоимость за километр пути
        ConflictResolveCriteria[ConflictResolveCriteria["MaxProfit"] = 1] = "MaxProfit";
    })(Routes.ConflictResolveCriteria || (Routes.ConflictResolveCriteria = {}));
    var ConflictResolveCriteria = Routes.ConflictResolveCriteria;

    /*
    Стратегия загрузки нескольких грузов - влияет на очерёдность загрузки нескольких грузов
    */
    (function (LoadingStrategy) {
        // экономия веса
        LoadingStrategy[LoadingStrategy["SavingWeight"] = 0] = "SavingWeight";

        // экономия объёма
        LoadingStrategy[LoadingStrategy["SavingValue"] = 1] = "SavingValue";
    })(Routes.LoadingStrategy || (Routes.LoadingStrategy = {}));
    var LoadingStrategy = Routes.LoadingStrategy;

    /*
    Расчитанный оптимальный маршрут
    Содержит списки включенных заданий на перевозку и список исключённых заданий,
    тех, которые не подошли по параметрам к условиям ограничения RouteRestrictions.
    Содержит обшую протяжённость маршрута и другую справочную информацию
    */
    var Route = (function () {
        function Route() {
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
        Route.prototype.getFulfiledTasks = function () {
            return this._fulfiledTasks;
        };

        Route.prototype.getExcludedTasks = function () {
            return this._excludedTasks;
        };

        Route.prototype.getEntries = function () {
            return this._entries;
        };

        Route.prototype.getWayBackEntry = function () {
            return this._wayBackEntry;
        };

        Route.prototype.setWayBackEntry = function (value) {
            this._wayBackEntry = value;
        };

        // возвращает дистанцию маршрута без дороги назад
        Route.prototype.getDistanse = function () {
            return this._sumDistance;
        };

        // возвращает дистанцию маршрута с дорогой назад
        Route.prototype.getDistanseWithWayBack = function () {
            return this._sumDistance + this._wayBackEntry.getEdge().getDistance();
        };

        // возвращает выручку маршрута
        Route.prototype.getProceeds = function () {
            return this._sumProceeds;
        };

        // возвращает общий объём груза в маршруте
        Route.prototype.getValue = function () {
            return this._sumValue;
        };

        // возвращает общий вес груза в маршруте
        Route.prototype.getWeight = function () {
            return this._sumWeight;
        };

        // получить 1-ю вершину маршрута
        Route.prototype.getStartVertex = function () {
            if (1 > this._entries.length)
                return null;

            var entry = this._entries[0];
            var edge = entry.getEdge();

            return edge.getVertexA();
        };

        // получить последнюю вершину маршрута
        Route.prototype.getEndVertex = function () {
            if (1 > this._entries.length)
                return null;

            var index = this._entries.length - 1;
            var entry = this._entries[index];
            var edge = entry.getEdge();

            return edge.getVertexB();
        };

        // добавляем часть маршрута
        Route.prototype.addEntry = function (entry) {
            //////////////////////////////////////////
            // Расчитываем суммовые значения
            // рассчитываем перевезённый вес и объём, полученная сумму денег
            // добавляем выполненные задания в список
            var fulfiledTasks = entry.getFulfiledTasks();

            for (var i = 0; i < fulfiledTasks.length; i++) {
                var task = fulfiledTasks[i];
                this._sumProceeds += task.getPrice();
                this._sumValue += task.getValue();
                this._sumWeight += task.getWeight();

                // добавляем выполненное задание в список
                this._fulfiledTasks.push(task);
            }

            // расстояние
            var edge = entry.getEdge();
            this._sumDistance += edge.getDistance();

            // сохраняем часть маршрута
            this._entries.push(entry);

            // добавляем исключённые задания в список
            var excludedTasks = entry.getExcludedTasks();

            for (var i = 0; i < excludedTasks.length; i++) {
                var task = excludedTasks[i];
                this._excludedTasks.push(task);
            }
        };

        Route.prototype.getProfit = function (considerWayBack) {
            var distance = this._sumDistance;

            if (considerWayBack)
                distance += this._wayBackEntry.getEdge().getDistance();

            return this._sumProceeds / distance;
        };

        Route.prototype.getEfficiency = function (considerWayBack) {
            var numTasks = this._fulfiledTasks.length;
            var profit = this.getProfit(considerWayBack);
            return numTasks * profit;
        };

        // получить исходное расстояние для выполненных задач
        Route.prototype.getFulfiledTasksDistance = function () {
            if (0 > this._fulfiledTasksDistance) {
                this._fulfiledTasksDistance = 0;

                for (var i = 0; i < this._fulfiledTasks.length; i++) {
                    var task = this._fulfiledTasks[i];
                    this._fulfiledTasksDistance += task.getDistance();
                }
            }

            return this._fulfiledTasksDistance;
        };

        // получить исходное расстояние для отложенных задач
        Route.prototype.getExcludedTasksDistance = function () {
            if (0 > this._excludedTasksDistance) {
                this._excludedTasksDistance = 0;

                for (var i = 0; i < this._excludedTasks.length; i++) {
                    var task = this._excludedTasks[i];
                    this._excludedTasksDistance += task.getDistance();
                }
            }

            return this._excludedTasksDistance;
        };

        // получить исходное расстояние для всех задач
        Route.prototype.getAllTasksDistance = function () {
            if (0 > this._allTasksDistance) {
                this._allTasksDistance = 0;
                this._allTasksDistance += this.getFulfiledTasksDistance();
                this._allTasksDistance += this.getExcludedTasksDistance();
            }

            return this._allTasksDistance;
        };
        return Route;
    })();
    Routes.Route = Route;

    /*
    Часть рассчитанного оптимального маршрута - один перегон между 2-я точками
    */
    var RouteEntry = (function () {
        function RouteEntry() {
            this._edge = null;
            this._commitedTasks = [];
            this._excludedTasks = [];
            this._fulfiledTasks = [];
        }
        RouteEntry.prototype.getEdge = function () {
            return this._edge;
        };

        RouteEntry.prototype.setEdge = function (value) {
            this._edge = value;
        };

        RouteEntry.prototype.getCommitedTasks = function () {
            return this._commitedTasks;
        };

        RouteEntry.prototype.getFulfiledTasks = function () {
            return this._fulfiledTasks;
        };

        RouteEntry.prototype.getExcludedTasks = function () {
            return this._excludedTasks;
        };

        RouteEntry.prototype.addFulfiledTask = function (task) {
            this._fulfiledTasks.push(task);
        };

        RouteEntry.prototype.addCommitedTask = function (task) {
            this._commitedTasks.push(task);
        };

        RouteEntry.prototype.addExcludedTask = function (task) {
            this._excludedTasks.push(task);
        };
        return RouteEntry;
    })();
    Routes.RouteEntry = RouteEntry;
})(Routes || (Routes = {}));
//# sourceMappingURL=Route.js.map
