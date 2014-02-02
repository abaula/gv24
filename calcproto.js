///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="Scripts\typings\googlemaps\google.maps.d.ts"/>
///<reference path="Collections.ts"/>
///<reference path="CalcData.d.ts"/>
///<reference path="Route.ts"/>
///<reference path="Calculator.ts"/>
var RouteCalculator;
(function (RouteCalculator) {
    var CalcTask = (function () {
        function CalcTask(data) {
            this.data = data;
            this.selected = false;
            this.customTaxUsed = false;
        }
        return CalcTask;
    })();
    RouteCalculator.CalcTask = CalcTask;

    var CalcRouteEntry = (function () {
        function CalcRouteEntry() {
            this.customTaxUsed = false;
        }
        CalcRouteEntry.prototype.isFirstTaskEntry = function () {
            return this.city == this.task.data.city1;
        };
        return CalcRouteEntry;
    })();
    RouteCalculator.CalcRouteEntry = CalcRouteEntry;

    var CalcTaskList = (function () {
        function CalcTaskList() {
            this.semiTotalDistance = 0;
            this.totalDistance = 0;
            this.semiTotalWeight = 0;
            this.totalWeight = 0;
            this.semiTotalValue = 0;
            this.totalValue = 0;
            this.semiTotalPrice = 0;
            this.totalPrice = 0;
            this.semiTotalPriceWeight = 0;
            this.totalPriceWeight = 0;
            this.semiTotalPriceValue = 0;
            this.totalPriceValue = 0;
            this._tasks = [];
        }
        CalcTaskList.prototype._calcTotals = function () {
            this.totalDistance = 0;
            this.totalWeight = 0;
            this.totalValue = 0;
            this.totalPrice = 0;
            this.totalPriceWeight = 0;
            this.totalPriceValue = 0;

            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                this.totalDistance += task.data.distance;
                this.totalWeight += task.data.weight;
                this.totalValue += task.data.value;
                this.totalPrice += task.data.price;
                this.totalPriceWeight += task.data.priceWeight100Km;
                this.totalPriceValue += task.data.priceValue100Km;
            }

            if (this._tasks.length > 0) {
                this.totalPriceWeight /= this._tasks.length;
                this.totalPriceValue /= this._tasks.length;
            }
        };

        CalcTaskList.prototype._calcSemiTotals = function () {
            this.semiTotalDistance = 0;
            this.semiTotalWeight = 0;
            this.semiTotalValue = 0;
            this.semiTotalPrice = 0;
            this.semiTotalPriceWeight = 0;
            this.semiTotalPriceValue = 0;
            var cnt = 0;

            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                if (false == task.selected)
                    continue;

                cnt++;
                this.semiTotalDistance += task.data.distance;
                this.semiTotalWeight += task.data.weight;
                this.semiTotalValue += task.data.value;
                this.semiTotalPrice += task.data.price;
                this.semiTotalPriceWeight += task.data.priceWeight100Km;
                this.semiTotalPriceValue += task.data.priceValue100Km;
            }

            if (cnt > 0) {
                this.semiTotalPriceWeight /= cnt;
                this.semiTotalPriceValue /= cnt;
            }
        };

        CalcTaskList.prototype.updateTasks = function (tasks) {
            this._tasks = [];

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var calcTask = new CalcTask(task);
                this._tasks.push(calcTask);
            }

            this._calcTotals();
            this._calcSemiTotals();
        };

        /*
        Устанавливаем правильное значение цены для задач
        */
        CalcTaskList.prototype.updateTaskListProceeds = function (taxWeight, taxValue) {
            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                if (0 == task.data.price || task.customTaxUsed) {
                    task.customTaxUsed = true;
                    var proceedsWeight = taxWeight * task.data.weight * (task.data.distance / 100);
                    var proceedsValue = taxValue * task.data.value * (task.data.distance / 100);
                    task.data.price = Math.max(proceedsWeight, proceedsValue);
                    task.data.priceWeight100Km = taxWeight;
                    task.data.priceValue100Km = taxValue;
                }
            }
        };

        CalcTaskList.prototype._setProceedsToRouteEntry = function (entry) {
            var task = entry.task.data;

            if (0 < task.price) {
                entry.proceeds = task.price;
            } else {
            }
        };

        CalcTaskList.prototype.getTask = function (id) {
            var result = null;

            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                if (task.data.id == id) {
                    result = task;
                    break;
                }
            }

            return result;
        };

        CalcTaskList.prototype.getTasks = function () {
            return this._tasks;
        };

        CalcTaskList.prototype.selectTask = function (taskId, selected) {
            var task = this.getTask(taskId);

            if (null != task)
                task.selected = selected;

            this._calcSemiTotals();
        };

        CalcTaskList.prototype.selectAllTasks = function (selected) {
            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];
                task.selected = selected;
            }

            this._calcSemiTotals();
        };

        CalcTaskList.prototype.getSelectedTasks = function () {
            var result = [];

            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                if (task.selected)
                    result.push(task);
            }

            return result;
        };

        CalcTaskList.prototype.getStartPoints = function () {
            var cities = new Collections.Dictionary();

            for (var i = 0; i < this._tasks.length; i++) {
                var task = this._tasks[i];

                if (task.selected) {
                    if (false == cities.containsKey(task.data.city1.id))
                        cities.setValue(task.data.city1.id, task.data.city1);
                }
            }

            var arr = cities.values();

            arr.sort(function (a, b) {
                if (a.name > b.name)
                    return 1;
else if (a.name < b.name)
                    return -1;
else
                    return 0;
            });

            return arr;
        };
        return CalcTaskList;
    })();
    RouteCalculator.CalcTaskList = CalcTaskList;

    var Calc = (function () {
        function Calc() {
            this._paramMaxWeight = 0;
            this._paramMaxValue = 0;
            this._paramExpense = 0;
            this._paramTaxWeight = 0;
            this._paramTaxValue = 0;
            this._route = [];
            this._taskList = new CalcTaskList();
            this._backWayEnable = false;
        }
        Calc.prototype.calculateRoute = function (startCityId, conflictResolveCriteria, loadingStrategy) {
            ///////////////////////////////////
            // создаём список ограничений
            var crc = (conflictResolveCriteria == "Profit") ? Routes.ConflictResolveCriteria.MaxProfit : Routes.ConflictResolveCriteria.MaxProceeds;
            var ls = (loadingStrategy == "SavingWeight") ? Routes.LoadingStrategy.SavingWeight : Routes.LoadingStrategy.SavingValue;
            var restrictions = new Routes.RouteRestrictions(this._paramMaxValue, this._paramMaxWeight, crc, ls);

            //////////////////////////////////////////
            // создаём список заданий на перевозку
            var tasks = this._taskList.getSelectedTasks();
            var routeTasks = [];

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var vertex1 = new Graph.GVertex(task.data.city1.id, task.data.city1.name, task.data.city1.latitude, task.data.city1.longitude);
                var vertex2 = new Graph.GVertex(task.data.city2.id, task.data.city2.name, task.data.city2.latitude, task.data.city2.longitude);
                var routeTask = new Routes.RouteTask(task.data.id, task.data.city1.name + "-" + task.data.city2.name, vertex1, vertex2, task.data.price, task.data.value, task.data.weight, task.data.distance);
                routeTasks.push(routeTask);
            }

            var taskList = new Routes.RouteTaskList();
            taskList.addRouteTasks(routeTasks);

            //////////////////////////////////////////////
            // создание массива рёбер графа Graph.GEdge
            var edges = [];

            // получаем список уникальных вершин
            var vertices = taskList.getVertices();

            for (var i = 0; i < this._edges.length; i++) {
                var graphEdge = this._edges[i];
                var a = this._isCityIdInVertexArray(graphEdge.cityId1, vertices);
                var b = this._isCityIdInVertexArray(graphEdge.cityId2, vertices);

                if (a && b) {
                    var edge = new Graph.GEdge(graphEdge.id, "", graphEdge.cityId1, graphEdge.cityId2, graphEdge.distance);
                    edges.push(edge);
                }
            }

            /////////////////////////////////////
            // создаём граф
            var graph = new Graph.UndirectedGraph();
            graph.init(vertices, edges);

            ///////////////////////////////////////
            // получаем начальную вершину маршрута
            var startVertex = null;

            for (var i = 0; i < vertices.length; i++) {
                if (startCityId == vertices[i].getId()) {
                    startVertex = vertices[i];
                    break;
                }
            }

            ///////////////////////////
            // расчитываем маршрут
            var calculator = new Calculator.RouteCalculator(taskList, restrictions, graph);
            calculator.calculateRoute(startVertex);

            // всегда получаем оптимальный маршрут рассчитанный без учёта обратного пути
            var route = calculator.getRoute();

            //////////////////////////////////
            // применяем полученный маршрут
            this._route = [];
            var routes = route.getEntries();

            for (var i = 0; i < routes.length; i++) {
                var routeEntry = routes[i];

                var calcEntries = this._createRouteEntriesByTasks(routeEntry.getCommitedTasks(), false);

                for (var j = 0; j < calcEntries.length; j++)
                    this._route.push(calcEntries[j]);

                calcEntries = this._createRouteEntriesByTasks(routeEntry.getFulfiledTasks(), true);

                for (var j = 0; j < calcEntries.length; j++)
                    this._route.push(calcEntries[j]);
            }

            // убираем лишние галочки у выбранных заданий
            this._taskList.selectAllTasks(false);
            var selectedTasks = this._getSelectedTasksFromRoute();

            for (var i = 0; i < selectedTasks.length; i++)
                this._taskList.selectTask(selectedTasks[i].data.id, true);

            // сообщаем, что список отмеченных задач изменился
            CalcController.prototype.onSelectedTaskListChanged();

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();

            return;
        };

        Calc.prototype._createRouteEntriesByTasks = function (tasks, isFulfiledTasks) {
            var entries = [];

            for (var i = 0; i < tasks.length; i++) {
                var rTask = tasks[i];
                var task = this._taskList.getTask(rTask.getId());
                var entry = new CalcRouteEntry();
                entry.task = task;

                if (isFulfiledTasks) {
                    entry.entryId = task.data.id.toString() + ".2";
                    entry.city = task.data.city2;
                    entry.weightLoad = 0;
                    entry.valueLoad = 0;
                    entry.weightUnload = task.data.weight;
                    entry.valueUnload = task.data.value;
                    entry.proceeds = task.data.price;
                } else {
                    entry.entryId = task.data.id.toString() + ".1";
                    entry.city = task.data.city1;
                    entry.weightLoad = task.data.weight;
                    entry.valueLoad = task.data.value;
                    entry.weightUnload = 0;
                    entry.valueUnload = 0;
                    entry.proceeds = 0;
                }

                entries.push(entry);
            }

            return entries;
        };

        /*
        Проверка находится ли город в массиве вершин
        */
        Calc.prototype._isCityIdInVertexArray = function (cityId, vertices) {
            for (var i = 0; i < vertices.length; i++) {
                if (cityId == vertices[i].getId())
                    return true;
            }

            return false;
        };

        /*
        Удаляем все задания из маршрута
        */
        Calc.prototype.removeAllTasksFromRoute = function () {
            // отмечаем все задания как не выделенные
            this._taskList.selectAllTasks(false);

            // обнуляем маршрут
            this._route = [];

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        };

        Calc.prototype.removeTaskFromRoute = function (taskId) {
            // помечаем задание как не выделеное
            this._taskList.selectTask(taskId, false);

            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            // удаляем 1-ю путевую точку из маршрута
            this._removeSingleTaskEntry(taskId);

            // удаляем 2-ю путевую точку из маршрута
            this._removeSingleTaskEntry(taskId);

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        };

        Calc.prototype._removeSingleTaskEntry = function (taskId) {
            var index = -1;

            for (var i = 0; i < this._route.length; i++) {
                var routeEntry = this._route[i];

                if (taskId == routeEntry.task.data.id) {
                    index = i;
                    break;
                }
            }

            if (-1 < index)
                this._route.splice(index, 1);
        };

        Calc.prototype.switchTaskRoutes = function (entryId1, entryId2) {
            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            var index1 = -1;
            var index2 = -1;

            for (var i = 0; i < this._route.length; i++) {
                var entry = this._route[i];

                if (entryId1 == entry.entryId)
                    index1 = i;

                if (entryId2 == entry.entryId)
                    index2 = i;

                if (-1 < index1 && -1 < index2) {
                    entry = this._route[index1];
                    this._route[index1] = this._route[index2];
                    this._route[index2] = entry;
                    break;
                }
            }

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        };

        /*
        Добавляем все задания в маршрут
        - добавялем только те задания котрые отсутствуют в маршруте (т.е. сохраняем существующий маршрут)
        - добавляем в порядке очередности в списке заданий
        */
        Calc.prototype.addAllTasksToRoute = function () {
            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            // получаем список заданий уже добавленных в маршрут
            var tasks = this._taskList.getTasks();

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];

                if (false == task.selected)
                    this._addTaskToRoute(task.data.id);
            }

            // отмечаем все задания как выделенные
            this._taskList.selectAllTasks(true);

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        };

        /*
        Проверка находится ли указанное задание в массиве заданий
        */
        /*
        private _isTaskInArray(taskId: number, tasks: Task[]): boolean
        {
        for (var i: number = 0; i < tasks.length; i++)
        {
        var task: Task = tasks[i];
        
        if (taskId == task.id)
        return true;
        }
        
        return false;
        }
        */
        /*
        Добавляем задание в маршрут
        */
        Calc.prototype.addTaskToRoute = function (taskId) {
            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            // создаём и добавляем путевые точки в маршрут
            this._addTaskToRoute(taskId);

            // помечаем задание как выделенное
            this._taskList.selectTask(taskId, true);

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        };

        Calc.prototype._addTaskToRoute = function (taskId) {
            var task = this._taskList.getTask(taskId);
            var firstEntry = new CalcRouteEntry();
            firstEntry.entryId = taskId.toString() + ".1";
            firstEntry.city = task.data.city1;
            firstEntry.task = task;
            firstEntry.weightLoad = task.data.weight;
            firstEntry.valueLoad = task.data.value;
            firstEntry.weightUnload = 0;
            firstEntry.valueUnload = 0;
            firstEntry.proceeds = 0;

            var secondEntry = new CalcRouteEntry();
            secondEntry.entryId = taskId.toString() + ".2";
            secondEntry.city = task.data.city2;
            secondEntry.task = task;
            secondEntry.weightLoad = 0;
            secondEntry.valueLoad = 0;
            secondEntry.weightUnload = task.data.weight;
            secondEntry.valueUnload = task.data.value;
            secondEntry.proceeds = task.data.price;

            // добавляем части маршрута в маршрут
            this._route.push(firstEntry);
            this._route.push(secondEntry);
        };

        Calc.prototype._hasRouteBackWayEntry = function () {
            var lastEntry = this._getLastRouteEntry();

            if (null == lastEntry)
                return false;

            return lastEntry.task == null;
        };

        Calc.prototype._cleanBackWayEntry = function () {
            if (this._hasRouteBackWayEntry())
                this._route.splice(this._route.length - 1, 1);
        };

        Calc.prototype._createAndPushBackWayEntry = function () {
            if (this._backWayEnable) {
                if (false == this._hasRouteBackWayEntry()) {
                    var firstEntry = this._getFirstRouteEntry();
                    var entry = new CalcRouteEntry();
                    entry.entryId = "-";
                    entry.city = firstEntry.city;
                    entry.task = null;
                    entry.weightLoad = 0;
                    entry.valueLoad = 0;
                    entry.weightUnload = 0;
                    entry.valueUnload = 0;
                    entry.proceeds = 0;

                    this._route.push(entry);
                }
            }
        };

        Calc.prototype._calculateRouteParams = function () {
            if (0 < this._route.length) {
                this._createAndPushBackWayEntry();

                var resWeight = this.getParamMaxWeight();
                var resValue = this.getParamMaxValue();
                var sumWeight = 0;
                var sumValue = 0;
                var sumDistance = 0;

                var sumExpense = 0;
                var sumProceeds = 0;
                var sumProfit = 0;

                // упущенная выручка
                var lostProcceds = 0;

                // целевая прибыль
                var targetProfit = 0;

                var prevCity = null;
                var prevEntry = null;

                for (var i = 0; i < this._route.length; i++) {
                    var entry = this._route[i];
                    var distance = 0;
                    var expense = 0;
                    var profit = 0;

                    if (null != entry.task) {
                        if (entry.isFirstTaskEntry()) {
                            // загрузка
                            sumWeight += entry.weightLoad;
                            sumValue += entry.valueLoad;
                            resWeight -= entry.weightLoad;
                            resValue -= entry.valueLoad;
                        } else {
                            // разгрузка
                            sumWeight -= entry.weightUnload;
                            sumValue -= entry.valueUnload;
                            resWeight += entry.weightUnload;
                            resValue += entry.valueUnload;

                            // обновдяем значение цены за перевозку
                            entry.proceeds = entry.task.data.price;
                        }
                    }

                    if (null != prevCity) {
                        distance = this.getDistance(prevCity.id, entry.city.id);
                        sumDistance += distance;
                        expense = distance * this.getParamExpense();
                        sumExpense += expense;
                        sumProceeds += entry.proceeds;
                        sumProfit = sumProceeds - sumExpense;
                        lostProcceds = Math.max(0, prevEntry.resWeight * (distance / 100) * this._taskList.semiTotalPriceWeight, prevEntry.resValue * (distance / 100) * this._taskList.semiTotalPriceValue);
                    }

                    entry.expense = expense;
                    entry.distance = distance;
                    entry.profit = entry.proceeds - expense;
                    entry.lostProceeds = parseInt(lostProcceds.toFixed(0));

                    targetProfit += entry.profit + lostProcceds;
                    entry.targetProfit = parseInt(targetProfit.toFixed(0));

                    entry.sumWeight = sumWeight;
                    entry.sumValue = sumValue;

                    entry.sumWeightPc = sumWeight / this.getParamMaxWeight() * 100;
                    entry.sumWeightPc = parseFloat(entry.sumWeightPc.toFixed(2));
                    entry.sumValuePc = sumValue / this.getParamMaxValue() * 100;
                    entry.sumValuePc = parseFloat(entry.sumValuePc.toFixed(2));

                    entry.resWeight = resWeight;
                    entry.resValue = resValue;

                    entry.resWeightPc = resWeight / this.getParamMaxWeight() * 100;
                    entry.resWeightPc = parseFloat(entry.resWeightPc.toFixed(2));
                    entry.resValuePc = resValue / this.getParamMaxValue() * 100;
                    entry.resValuePc = parseFloat(entry.resValuePc.toFixed(2));

                    entry.sumProceeds = sumProceeds;
                    entry.sumExpense = sumExpense;
                    entry.sumProfit = sumProfit;
                    entry.sumDistance = sumDistance;

                    entry.next = null;

                    if (null != prevEntry)
                        prevEntry.next = entry;

                    prevEntry = entry;
                    prevCity = entry.city;
                }
            }

            // сообщаем, что параметры маршрута пересчитаны
            CalcController.prototype.onRouteParamsCalculated();
        };

        Calc.prototype._getFirstRouteEntry = function () {
            if (1 > this._route.length)
                return null;

            return this._route[0];
        };

        Calc.prototype._getLastRouteEntry = function () {
            if (1 > this._route.length)
                return null;

            return this._route[this._route.length - 1];
        };

        Calc.prototype.getRouteEntry = function (entryId) {
            var result = null;

            for (var i = 0; i < this._route.length; i++) {
                var entry = this._route[i];

                if (entryId == entry.entryId) {
                    result = entry;
                    break;
                }
            }

            return result;
        };

        Calc.prototype.getRoute = function () {
            return this._route.slice(0);
        };

        Calc.prototype.updateTaskList = function (data) {
            this._route = [];
            this._taskList.updateTasks(data.tasks);
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue);
            this._edges = data.edges;

            // сообщаем, что список маршрутов изменился
            CalcController.prototype.onTaskListUpdated();

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // сообщаем, что параметры маршрута пересчитаны
            CalcController.prototype.onRouteParamsCalculated();
        };

        Calc.prototype._getSelectedTasksFromRoute = function () {
            var result = [];
            var tasks = new Collections.Dictionary();

            for (var i = 0; i < this._route.length; i++) {
                var entry = this._route[i];

                if (null != entry.task) {
                    if (false == tasks.containsKey(entry.task.data.id))
                        tasks.setValue(entry.task.data.id, entry.task);
                }
            }

            return tasks.values();
        };

        Calc.prototype.getEdges = function () {
            return this._edges;
        };

        /*setEdges(edges: GraphEdge[])
        {
        this._edges = edges;
        } */
        Calc.prototype.getTaskList = function () {
            return this._taskList;
        };

        /*setTasks(tasks: Task[])
        {
        this._tasks = tasks;
        
        } */
        Calc.prototype.getDistance = function (city1, city2) {
            if (city1 == city2)
                return 0;

            var result = -1;

            for (var i = 0; i < this._edges.length; i++) {
                var edge = this._edges[i];

                if ((edge.cityId1 == city1 && edge.cityId2 == city2) || (edge.cityId1 == city2 && edge.cityId2 == city1)) {
                    result = edge.distance;
                    break;
                }
            }

            return result;
        };

        Calc.prototype.getMap = function () {
            return this._map;
        };

        Calc.prototype.setMap = function (map) {
            this._map = map;
        };

        Calc.prototype.getParamMaxWeight = function () {
            return this._paramMaxWeight;
        };

        Calc.prototype.setParamMaxWeight = function (value) {
            this._paramMaxWeight = value;
            CalcController.prototype.onParamMaxWeightChanged();
            this._calculateRouteParams();
        };

        Calc.prototype.getParamMaxValue = function () {
            return this._paramMaxValue;
        };

        Calc.prototype.setParamMaxValue = function (value) {
            this._paramMaxValue = value;
            CalcController.prototype.onParamMaxValueChanged();
            this._calculateRouteParams();
        };

        Calc.prototype.getParamExpense = function () {
            return this._paramExpense;
        };

        Calc.prototype.setParamExpense = function (value) {
            this._paramExpense = value;
            CalcController.prototype.onParamExpenseChanged();
            this._calculateRouteParams();
        };

        Calc.prototype.updateVehicleParams = function (data) {
            this._paramMaxWeight = data.maxWeight;
            this._paramMaxValue = data.maxValue;
            this._paramExpense = data.expense;
            this._paramTaxWeight = data.taxWeight;
            this._paramTaxValue = data.taxValue;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue);

            CalcController.prototype.onVehicleParamsChanged();
            this._calculateRouteParams();
        };

        Calc.prototype._updateProceeds = function (taxWeight, taxValue) {
            this._taskList.updateTaskListProceeds(taxWeight, taxValue);
        };

        Calc.prototype.getParamTaxWeight = function () {
            return this._paramTaxWeight;
        };

        Calc.prototype.setParamTaxWeight = function (value) {
            this._paramTaxWeight = value;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue);
            CalcController.prototype.onParamTaxWeightChanged();
            this._calculateRouteParams();
        };

        Calc.prototype.getParamTaxValue = function () {
            return this._paramTaxValue;
        };

        Calc.prototype.setParamTaxValue = function (value) {
            this._paramTaxValue = value;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue);
            CalcController.prototype.onParamTaxValueChanged();
            this._calculateRouteParams();
        };

        Calc.prototype.enableBackWay = function (enable) {
            if (this._backWayEnable == enable)
                return;

            this._backWayEnable = enable;
            this._cleanBackWayEntry();
            this._calculateRouteParams();
        };
        return Calc;
    })();
    RouteCalculator.Calc = Calc;

    var CalcController = (function () {
        function CalcController() {
        }
        CalcController.prototype._onComputeClick = function (event) {
            var startCityId = parseInt($("#calc-auto-param-start-city option:selected").val());
            var conflictResolveCriteria = $("#calc-Conflict-Resolve-Criteria > input[name=calc-Conflict-Resolve-Criteria]:checked").val();
            var loadingStrategy = $("#calc-Loading-Strategy > input[name=calc-Loading-Strategy]:checked").val();
            _calc_route_calculator.calculateRoute(startCityId, conflictResolveCriteria, loadingStrategy);

            return false;
        };

        CalcController.prototype._onFocusOut = function (event) {
            var ctrl = $(event.delegateTarget);
            var val = parseFloat(ctrl.val());
            var newVal;
            var changed = false;

            if (isNaN(val) || val < 0)
                val = 0;

            var id = ctrl.attr("id");

            if ("calc-param-max-weight" == id) {
                newVal = _calc_route_calculator.getParamMaxWeight();

                if (newVal != val) {
                    _calc_route_calculator.setParamMaxWeight(val);
                    changed = true;
                }

                // сохраняем очищенное значение в поле
                ctrl.val(val);
            } else if ("calc-param-max-value" == id) {
                newVal = _calc_route_calculator.getParamMaxValue();

                if (newVal != val) {
                    _calc_route_calculator.setParamMaxValue(val);
                    changed = true;
                }

                // сохраняем очищенное значение в поле
                ctrl.val(val);
            } else if ("calc-param-expense" == id) {
                newVal = _calc_route_calculator.getParamExpense();

                if (newVal != val) {
                    _calc_route_calculator.setParamExpense(val);
                    changed = true;
                }

                // сохраняем очищенное значение в поле
                ctrl.val(val);
            }

            if (changed)
                $("#calc-param-vehicle-select").val(0);

            if ("calc-param-tax-weight" == id) {
                _calc_route_calculator.setParamTaxWeight(val);

                // сохраняем очищенное значение в поле
                ctrl.val(val.toFixed(2));
            } else if ("calc-param-tax-value" == id) {
                _calc_route_calculator.setParamTaxValue(val);

                // сохраняем очищенное значение в поле
                ctrl.val(val.toFixed(2));
            }
        };

        CalcController.prototype.onVehicleParamsChanged = function () {
            var maxWeight = _calc_route_calculator.getParamMaxWeight();
            $("#calc-param-max-weight").val(maxWeight);
            CalcController.prototype.onParamMaxWeightChanged();

            var maxValue = _calc_route_calculator.getParamMaxValue();
            $("#calc-param-max-value").val(maxValue);
            CalcController.prototype.onParamMaxValueChanged();

            var expense = _calc_route_calculator.getParamExpense();
            $("#calc-param-expense").val(expense);
            CalcController.prototype.onParamExpenseChanged();

            var taxWeight = _calc_route_calculator.getParamTaxWeight();
            $("#calc-param-tax-weight").val(taxWeight.toFixed(2));
            CalcController.prototype.onParamTaxWeightChanged();

            var taxValue = _calc_route_calculator.getParamTaxValue();
            $("#calc-param-tax-value").val(taxValue.toFixed(2));
            CalcController.prototype.onParamTaxValueChanged();
        };

        CalcController.prototype.onParamMaxWeightChanged = function () {
            var panel = $("#calc-param-info-panel-max-weight");
            var info = $(".calc-param-info-panel-value", panel);
            var value = _calc_route_calculator.getParamMaxWeight();
            CalcController.prototype._setInfoValue(panel, info, value.toString());
            CalcController.prototype._highliteTaskList();
        };

        CalcController.prototype.onParamMaxValueChanged = function () {
            var panel = $("#calc-param-info-panel-max-value");
            var info = $(".calc-param-info-panel-value", panel);
            var value = _calc_route_calculator.getParamMaxValue();
            CalcController.prototype._setInfoValue(panel, info, value.toString());
            CalcController.prototype._highliteTaskList();
        };

        CalcController.prototype.onParamExpenseChanged = function () {
            var panel = $("#calc-param-info-panel-expense");
            var info = $(".calc-param-info-panel-value", panel);
            var value = _calc_route_calculator.getParamExpense();
            CalcController.prototype._setInfoValue(panel, info, value.toString());
        };

        CalcController.prototype.onParamTaxWeightChanged = function () {
            var panel = $("#calc-param-info-panel-custom-tax-weight");
            var info = $(".calc-param-info-panel-value", panel);
            var value = _calc_route_calculator.getParamTaxWeight();
            CalcController.prototype._setInfoValue(panel, info, value.toFixed(2));
            CalcController.prototype._updateTaskList();
        };

        CalcController.prototype.onParamTaxValueChanged = function () {
            var panel = $("#calc-param-info-panel-custom-tax-value");
            var info = $(".calc-param-info-panel-value", panel);
            var value = _calc_route_calculator.getParamTaxValue();
            CalcController.prototype._setInfoValue(panel, info, value.toFixed(2));
            CalcController.prototype._updateTaskList();
        };

        CalcController.prototype.onRouteParamsCalculated = function () {
            // при изменении значений маршрута перерисовываем и делаем подсветку
            CalcController.prototype._collapseDetails();
            CalcController.prototype._drawRoute();
        };

        // Обновился список задач
        CalcController.prototype.onTaskListUpdated = function () {
            CalcController.prototype._createTaskList();
            CalcController.prototype._highliteTaskList();
        };

        // подсвечиваем в списке задач непроходящий по критериям вес и объём
        CalcController.prototype._highliteTaskList = function () {
            // убираем подсветку если есть
            $("#calc-task-list-table > tbody > tr > td").removeClass("calc-table-col-res-empty");

            // находим все задания вес или объём которых привышают указанный лимит машины и подсвечиваем их
            var maxWeightLimit = _calc_route_calculator.getParamMaxWeight();
            var maxValueLimit = _calc_route_calculator.getParamMaxValue();
            var tasks = _calc_route_calculator.getTaskList().getTasks();

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];

                if (task.data.weight > maxWeightLimit)
                    $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td.calc-table-col-weight").addClass("calc-table-col-res-empty");

                if (task.data.value > maxValueLimit)
                    $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td.calc-table-col-value").addClass("calc-table-col-res-empty");
            }
        };

        // Обновился список выделенных задач
        CalcController.prototype.onSelectedTaskListChanged = function () {
            $("#calc-task-list-table > tbody > tr > td > :checkbox").prop("checked", false);
            $("#calc-task-list-table > thead > tr > th > :checkbox").prop("checked", false);
            var tasks = _calc_route_calculator.getTaskList().getSelectedTasks();

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var elem = $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td > :checkbox");
                elem.prop("checked", true);
                CalcController.prototype._updateHeadCheckBoxState(true);
            }

            // вычисляем значения после загрузки
            CalcController.prototype._task_list_table_calc_total();
        };

        // обновился список доступных начальных точек маршрутов
        CalcController.prototype.onStartPointsListChanged = function () {
            var target = $("#calc-auto-param-start-city");
            $("option", target).remove();
            var cities = _calc_route_calculator.getTaskList().getStartPoints();

            for (var i = 0; i < cities.length; i++) {
                var city = cities[i];
                var elem = $("<option></option>");
                elem.val(city.id);
                elem.text(city.name);
                elem.appendTo(target);
            }
        };

        /*
        Создаём список задач
        */
        CalcController.prototype._createTaskList = function () {
            // очищаем таблицу
            $("#calc-task-list-table > tbody > tr").remove();

            // заполняем таблицу новыми значениями
            var tasks = _calc_route_calculator.getTaskList().getTasks();

            var rowTemplate = $("#calc-task-list-table-tr-template");
            var target = $("#calc-task-list-table > tbody");
            var rows = $("tr", target);
            var nextRowNumber = rows.length + 1;

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var id = task.data.id;

                // создаём новый экземпляр строки
                var row = rowTemplate.clone();
                row.removeClass("hidden");
                row.removeAttr("id");

                // заполняем данными строку
                row.attr("data-task-id", id);
                $(":checkbox", row).val(id);
                $("td.calc-table-col-num", row).text(nextRowNumber++);
                $("td.calc-table-col-from", row).text(task.data.city1.name).attr("data-city-id", task.data.city1.id).attr("data-lat", task.data.city1.latitude).attr("data-lon", task.data.city1.longitude);
                $("td.calc-table-col-to", row).text(task.data.city2.name).attr("data-city-id", task.data.city2.id).attr("data-lat", task.data.city2.latitude).attr("data-lon", task.data.city2.longitude);
                $("td.calc-table-col-distance", row).text(task.data.distance);

                // цепляем обработчики событий
                $(":checkbox", row).click(CalcController.prototype._onCheckBoxClick);
                row.click(CalcController.prototype._onTaskListTableRowClick);

                // добавляем строку в тело таблицы
                row.appendTo(target);
            }

            CalcController.prototype._updateTaskList();
        };

        /*
        Перерисовываем список задач
        */
        CalcController.prototype._updateTaskList = function () {
            // обновляем таблицу заданий на перевозку новыми значениями
            var tasks = _calc_route_calculator.getTaskList().getTasks();

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var id = task.data.id;

                var row = $("#calc-task-list-table > tbody > tr[data-task-id=" + id + "]");

                if (row.length > 0) {
                    // заполняем данными строку
                    $("td.calc-table-col-weight", row).text(task.data.weight);
                    $("td.calc-table-col-value", row).text(task.data.value);

                    if (task.customTaxUsed) {
                        $("td.calc-table-col-price", row).text(task.data.price.toFixed(0)).addClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-weight", row).text(task.data.priceWeight100Km.toFixed(2)).addClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-value", row).text(task.data.priceValue100Km.toFixed(2)).addClass("calc-table-col-val-custom");
                    } else {
                        $("td.calc-table-col-price", row).text(task.data.price.toFixed(0)).removeClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-weight", row).text(task.data.priceWeight100Km.toFixed(2)).removeClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-value", row).text(task.data.priceValue100Km.toFixed(2)).removeClass("calc-table-col-val-custom");
                    }
                    //$("td.calc-table-col-delete", row).text();
                }
            }

            // вычисляем значения после загрузки
            CalcController.prototype._task_list_table_calc_total();
        };

        CalcController.prototype._setInfoValue = function (panel, info, value) {
            info.text(value);

            var notValidClass = "calc-param-info-panel-entry-not-valid";

            if (0 == parseFloat(value))
                panel.addClass(notValidClass);
else
                panel.removeClass(notValidClass);
        };

        CalcController.prototype._onCheckBoxClick = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            CalcController.prototype._updateHeadCheckBoxState(checked);

            // добавляем в маршрут или исключаем
            var taskId = parseInt($(elem.parent().parent()).attr("data-task-id"));

            if (checked)
                _calc_route_calculator.addTaskToRoute(taskId);
else
                _calc_route_calculator.removeTaskFromRoute(taskId);

            // рассчитываем суммы в таблице заданий на перевозку
            CalcController.prototype._task_list_table_calc_total();
        };

        CalcController.prototype._updateHeadCheckBoxState = function (checked) {
            var boxes = $("#calc-task-list-table > tbody > tr > td > :checkbox");
            var boxesCnt = boxes.length;
            var boxesCheckedCnt = boxes.filter(":checked").length;
            var indeterminate = checked ? boxesCnt != boxesCheckedCnt : boxesCheckedCnt > 0;
            var headChkBox = $("#calc-task-list-table > thead > tr > th > :checkbox");

            if (checked || indeterminate)
                headChkBox.prop("checked", true);
else
                headChkBox.prop("checked", false);

            headChkBox.prop("indeterminate", indeterminate);
        };

        CalcController.prototype._createRouteEntryRow = function (routeEntry, isBackWayRow) {
            var rowTemplate = $("#calc-routes-table-tr-template");

            // создаём новую строку
            var row = rowTemplate.clone();
            row.removeAttr("id");
            row.removeClass("hidden");

            if (null != routeEntry.task)
                row.attr("data-task-id", routeEntry.task.data.id);
else
                row.attr("data-task-id", "-");

            row.attr("data-city-id", routeEntry.city.id);
            $("td.calc-table-col-num", row).text(routeEntry.entryId);
            $("td.calc-table-col-from", row).text(routeEntry.city.name);

            $("td.calc-table-col-weight-load", row).text(routeEntry.weightLoad - routeEntry.weightUnload);
            $("td.calc-table-col-value-load", row).text(routeEntry.valueLoad - routeEntry.valueUnload);

            if (routeEntry.sumWeightPc == Number.POSITIVE_INFINITY || routeEntry.sumValuePc == Number.POSITIVE_INFINITY || isNaN(routeEntry.sumWeightPc) || isNaN(routeEntry.sumValuePc)) {
                $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight);
                $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue);
            } else {
                $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight + " (" + routeEntry.sumWeightPc + "%)");
                $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue + " (" + routeEntry.sumValuePc + "%)");
            }

            if (routeEntry.resWeightPc == Number.NEGATIVE_INFINITY || routeEntry.resValuePc == Number.NEGATIVE_INFINITY || isNaN(routeEntry.resWeightPc) || isNaN(routeEntry.resValuePc)) {
                $("td.calc-table-col-res-weight", row).text(routeEntry.resWeight);
                $("td.calc-table-col-res-value", row).text(routeEntry.resValue);
            } else {
                $("td.calc-table-col-res-weight", row).text(routeEntry.resWeight + " (" + routeEntry.resWeightPc + "%)");
                $("td.calc-table-col-res-value", row).text(routeEntry.resValue + " (" + routeEntry.resValuePc + "%)");
            }

            $("td.calc-table-col-distance", row).text(routeEntry.distance);
            $("td.calc-table-col-sum-distance", row).text(routeEntry.sumDistance);

            $("td.calc-table-col-expense", row).text(routeEntry.expense.toFixed(0));
            $("td.calc-table-col-sum-expense", row).text(routeEntry.sumExpense.toFixed(0));

            if (null != routeEntry.task && routeEntry.task.customTaxUsed)
                $("td.calc-table-col-proceeds", row).text(routeEntry.proceeds.toFixed(0)).addClass("calc-table-col-val-custom");
else
                $("td.calc-table-col-proceeds", row).text(routeEntry.proceeds.toFixed(0));

            $("td.calc-table-col-sum-proceeds", row).text(routeEntry.sumProceeds.toFixed(0));

            $("td.calc-table-col-profit", row).text(routeEntry.profit.toFixed(0));
            $("td.calc-table-col-sum-profit", row).text(routeEntry.sumProfit.toFixed(0));

            $("td.calc-table-col-lost-proceeds", row).text(routeEntry.lostProceeds.toFixed(0));
            $("td.calc-table-col-target-profit", row).text(routeEntry.targetProfit.toFixed(0));

            if (isBackWayRow) {
                $("td.calc-table-col-up > span.icon-button", row).remove();
                $("td.calc-table-col-down > span.icon-button", row).remove();
                $("td.calc-table-col-show-details > span.icon-button", row).remove();
            } else {
                $("td.calc-table-col-up > span.icon-button", row).click("up", CalcController.prototype._onUpDownClick);
                $("td.calc-table-col-down > span.icon-button", row).click("down", CalcController.prototype._onUpDownClick);
                $("td.calc-table-col-show-details > span.icon-button", row).click(CalcController.prototype._onDetailsClick);
            }

            row.click(CalcController.prototype._onRouteTableRowClick);

            return row;
        };

        CalcController.prototype._clearRouteRows = function () {
            $("#calc-routes-table > tbody > tr[data-task-id] > td > span").unbind();
            $("#calc-routes-table > tbody > tr[data-task-id]").unbind().remove();
        };

        CalcController.prototype._drawRoute = function () {
            // запоминаем выделенную строку если такая есть
            // var selectedEntryId: string = $("#calc-routes-table > tbody > tr.calc-table-row-selected > td.calc-table-col-num").text();
            CalcController.prototype._clearRouteRows();

            var route = _calc_route_calculator.getRoute();

            if (route.length < 1) {
                CalcController.prototype._showHideRouteTableAbsentRow(true);
                return;
            }

            // рисуем строки маршрута
            CalcController.prototype._showHideRouteTableAbsentRow(false);
            var tbody = $("#calc-routes-table > tbody");
            var traceClass = "trace-pass";
            var prevRow = null;
            var prevEntry = null;

            for (var i = 0; i < route.length; i++) {
                var entry = route[i];
                var isBackWayRow = null == entry.task;
                var row = CalcController.prototype._createRouteEntryRow(entry, isBackWayRow);

                if (entry.sumWeightPc > 100)
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-res-empty");
else
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-weight-value-pc").css("background-size", entry.sumWeightPc + "% 100%");

                if (entry.sumValuePc > 100)
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-res-empty");
else
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-weight-value-pc").css("background-size", entry.sumValuePc + "% 100%");

                if (entry.resWeight < 0) {
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-empty");
                    traceClass = "trace-stop";
                } else
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-pc").css("background-size", entry.resWeightPc + "% 100%");

                if (entry.resValue < 0) {
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-empty");
                    traceClass = "trace-stop";
                } else
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-pc").css("background-size", entry.resValuePc + "% 100%");

                if (entry.profit < 0)
                    $("td.calc-table-col-profit", row).addClass("calc-table-col-val-empty");

                if (entry.sumProfit < 0)
                    $("td.calc-table-col-sum-profit", row).addClass("calc-table-col-val-empty");

                // Трассировка маршрута
                $("td.calc-table-col-trace", row).removeClass("trace-pass").removeClass("trace-stop").addClass(traceClass);

                if (false == isBackWayRow) {
                    // настраиваем кнопку вверх и вниз
                    var btnUp = $("td.calc-table-col-up > span.icon-button", row);

                    if (null == prevRow) {
                        btnUp.removeClass("ib-arrow-up").addClass("ib-arrow-up-gray");
                    } else {
                        var btnDown = $("td.calc-table-col-down > span.icon-button", prevRow);

                        if (prevEntry.task.data.id == entry.task.data.id) {
                            btnUp.removeClass("ib-arrow-up").addClass("ib-arrow-up-gray");
                            btnDown.removeClass("ib-arrow-down").addClass("ib-arrow-down-gray");
                        } else {
                            btnUp.removeClass("ib-arrow-up-gray").addClass("ib-arrow-up");
                            btnDown.removeClass("ib-arrow-down-gray").addClass("ib-arrow-down");
                        }

                        if ((i + 1) == route.length)
                            $("td.calc-table-col-down > span.icon-button", row).removeClass("ib-arrow-down").addClass("ib-arrow-down-gray");
                    }
                } else {
                    $("td.calc-table-col-down > span.icon-button", prevRow).removeClass("ib-arrow-down").addClass("ib-arrow-down-gray");
                }

                prevRow = row;
                prevEntry = entry;

                /*
                // восстанавливаем выделение строки
                if (entry.entryId == selectedEntryId)
                row.addClass("calc-table-row-selected");
                */
                // Добавляем строку в таблицу
                row.appendTo(tbody);
            }
        };

        CalcController.prototype._showHideRouteTableAbsentRow = function (show) {
            var rowRouteAbsent = $("#calc-routes-table-tr-absent");
            var rowTotal = $("#calc-routes-table-foot-total");

            if (show) {
                rowRouteAbsent.removeClass("hidden");
                rowTotal.addClass("hidden");
            } else {
                rowRouteAbsent.addClass("hidden");
                rowTotal.removeClass("hidden");
            }
        };

        CalcController.prototype._onDetailsClick = function (event) {
            var elem = $(event.delegateTarget);
            var expand = elem.hasClass("ib-toggle-expand");
            CalcController.prototype._collapseDetails();

            if (expand) {
                var row = elem.parent().parent();
                var entryId = $("td.calc-table-col-num", row).text();
                var entry = _calc_route_calculator.getRouteEntry(entryId);

                if (null != entry) {
                    // заполняем поля данными
                    var detailsRow = $("#calc-routes-table-tr-details");

                    if (entry.isFirstTaskEntry()) {
                        $("#calc-route-detail-commited-tasks span.calc-param-info-panel-value").text(entry.task.data.city1.name + "-" + entry.task.data.city2.name);
                        $("#calc-route-detail-fulfiled-tasks span.calc-param-info-panel-value").text("-");
                    } else {
                        $("#calc-route-detail-commited-tasks span.calc-param-info-panel-value").text("-");
                        $("#calc-route-detail-fulfiled-tasks span.calc-param-info-panel-value").text(entry.task.data.city1.name + "-" + entry.task.data.city2.name);
                    }

                    $("#calc-route-detail-loaded span.calc-param-info-panel-value").eq(0).text(entry.weightLoad);
                    $("#calc-route-detail-loaded span.calc-param-info-panel-value").eq(1).text(entry.valueLoad);

                    $("#calc-route-detail-unloaded span.calc-param-info-panel-value").eq(0).text(entry.weightUnload);
                    $("#calc-route-detail-unloaded span.calc-param-info-panel-value").eq(1).text(entry.valueUnload);

                    $("#calc-route-detail-last-distance span.calc-param-info-panel-value").text(entry.distance);
                    $("#calc-route-detail-sum-distance span.calc-param-info-panel-value").text(entry.sumDistance);

                    /////////////////////////////////////////////////////////////
                    // параметры догрузки
                    var pathDistance = null != entry.next ? _calc_route_calculator.getDistance(entry.city.id, entry.next.city.id) : 0;

                    if (entry.resWeight > 0 && entry.resValue > 0 && pathDistance > 0) {
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(0).text(entry.resWeight);
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(1).text(entry.resValue);
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(0).text(entry.city.name + "-" + entry.next.city.name);
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(1).text(pathDistance);
                    } else {
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(0).text("-");
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(1).text("-");
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(0).text("-");
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(1).text("-");
                    }

                    /////////////////////////////////////////////////////////////
                    // финансовые параметры
                    $("#calc-route-detail-last-expense span.calc-param-info-panel-value").text(entry.expense);
                    $("#calc-route-detail-sum-expense span.calc-param-info-panel-value").text(entry.sumExpense);
                    $("#calc-route-detail-last-proceeds span.calc-param-info-panel-value").text(entry.proceeds);
                    $("#calc-route-detail-sum-proceeds span.calc-param-info-panel-value").text(entry.sumProceeds);
                    $("#calc-route-detail-last-profit span.calc-param-info-panel-value").text(entry.profit);
                    $("#calc-route-detail-sum-profit span.calc-param-info-panel-value").text(entry.sumProfit);

                    //$("#calc-route-detail-last-profit-norm span.calc-param-info-panel-value").text(entry.profitNormLast);
                    // $("#calc-route-detail-profit-norm-avg span.calc-param-info-panel-value").text(entry.profitNormAvg);
                    // отображаем детализацию
                    elem.removeClass("ib-toggle-expand");
                    elem.addClass("ib-toggle");
                    detailsRow.insertAfter(row);
                    detailsRow.removeClass("hidden");
                }
            }
        };

        CalcController.prototype._collapseDetails = function () {
            var btn = $("#calc-routes-table > tbody > tr > td.calc-table-col-show-details > span.icon-button");
            btn.removeClass("ib-toggle");
            btn.addClass("ib-toggle-expand");
            var rowRouteAbsent = $("#calc-routes-table-tr-absent");
            $("#calc-routes-table-tr-details").addClass("hidden");
        };

        CalcController.prototype._onUpDownClick = function (event) {
            var btn = $(event.delegateTarget);

            if (btn.hasClass("ib-arrow-down-gray") || btn.hasClass("ib-arrow-up-gray"))
                return;

            var row1 = btn.parent().parent();
            var row2 = null;

            if ("up" == event.data)
                row2 = row1.prev();
else if ("down" == event.data)
                row2 = row1.next();

            var entryId1 = $("td.calc-table-col-num", row1).text();
            var entryId2 = $("td.calc-table-col-num", row2).text();

            // меняем строки местами
            _calc_route_calculator.switchTaskRoutes(entryId1, entryId2);
        };

        CalcController.prototype._onHeadCheckBoxClick = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            elem.prop("indeterminate", false);
            $("#calc-task-list-table > tbody > tr > td > :checkbox").prop("checked", checked);

            if (checked)
                _calc_route_calculator.addAllTasksToRoute();
else
                _calc_route_calculator.removeAllTasksFromRoute();

            // рассчитываем суммы в таблице заданий на перевозку
            CalcController.prototype._task_list_table_calc_total();
        };

        CalcController.prototype._onSlideClick = function (event) {
            var container = $("#calc-param-panel");

            if (container.is(":hidden")) {
                $(event.delegateTarget).removeClass("ib-slide-down").addClass("ib-slide-up");
                container.slideDown();
            } else {
                $(event.delegateTarget).removeClass("ib-slide-up").addClass("ib-slide-down");
                container.slideUp();
            }
        };

        CalcController.prototype._onTaskListTableRowClick = function (event) {
            CalcController.prototype._task_list_table_clear_selection();
            $(event.delegateTarget).addClass("calc-table-row-selected");
        };

        CalcController.prototype._onWayBackClick = function (event) {
            var elem = $(event.delegateTarget);
            var checked = elem.is(":checked");
            _calc_route_calculator.enableBackWay(checked);
        };

        CalcController.prototype._onRouteTableRowClick = function (event) {
            CalcController.prototype._route_table_clear_selection();
            $(event.delegateTarget).addClass("calc-table-row-selected");
        };

        CalcController.prototype._onJSONPackageLoad = function (data) {
            // сохраняем полученные данные
            _calc_route_calculator.updateTaskList(data);
        };

        CalcController.prototype._onVehicleParamsSelect = function (event) {
            var id = parseInt($("#calc-param-vehicle-select option:selected").val());

            if (0 == id)
                return;

            CalcController.prototype._getJSONHelper("api/vehicle/" + id.toString(), CalcController.prototype._onJSONVehicleParamsLoad);
        };

        CalcController.prototype._onJSONVehicleParamsLoad = function (data) {
            // пакетное обновление данных в модели
            _calc_route_calculator.updateVehicleParams(data);
        };

        /*
        Сбрасываем значения в контролах
        */
        CalcController.prototype._dropControlsState = function () {
            // чекбоксы в списке заданий на перевозку
            $("#calc-task-list-table :checkbox").prop("checked", false);

            // выбор машины
            $("#calc-param-vehicle-select").val(0);

            // поля ввода
            $("#calc-param-panel :text").val("0");
            $("#calc-param-tax-weight").val("0.00");
            $("#calc-param-tax-value").val("0.00");

            // галочка учитывать обратный путь
            $("#calc-param-info-panel-way-back :checkbox").prop("checked", false);
        };

        /*
        Помогает сохранить работоспособность AJAX с любым именем хоста
        Выполняет JSON запрос к серверу - имя хоста формируется динамически
        */
        CalcController.prototype._getJSONHelper = function (path, callback) {
            //window.console.log(document.location.host);
            $.getJSON(document.location.protocol + "//" + document.location.host + "/" + path, callback);
        };

        CalcController.prototype.onDocumentReady = function () {
            // чистим контролы после загрузки страницы от случайных старых данных
            CalcController.prototype._dropControlsState();

            // загружаем данные по списку заданий на перевозку
            CalcController.prototype._getJSONHelper("get_data_package.php", CalcController.prototype._onJSONPackageLoad);

            // выбор параметров машины
            $("#calc-param-vehicle-select").change(CalcController.prototype._onVehicleParamsSelect);

            // клик по кнопке свернуть
            //$("#calc-param-container-up-down-button").click(CalcController.prototype._onUpDownClick);
            // клик по кнопке рассчитать
            $("#calc-auto-param-compute").click(CalcController.prototype._onComputeClick);

            // клик по суммовой галочке
            $("#calc-task-list-table > thead > tr > th > :checkbox").click(CalcController.prototype._onHeadCheckBoxClick);

            // клик по отдельной галочке
            //$("#calc-task-list-table > tbody > tr > td > :checkbox").click(CalcController.prototype._onCheckBoxClick);
            //$("#calc-task-list-table > tbody > tr").click(CalcController.prototype._onTableRowClick);
            // клик на кнопке скрытия панели
            $("#calc-param-info-slide").click(CalcController.prototype._onSlideClick);

            // окончание редактирования текстового поля
            $("#calc-param-panel :text").focusout(CalcController.prototype._onFocusOut);

            // добавление обратного маршрута
            $("#calc-param-info-panel-way-back :checkbox").click(CalcController.prototype._onWayBackClick);

            // работаем с картой Google
            CalcController.prototype._init_google_map();
        };

        CalcController.prototype._task_list_table_calc_total = function () {
            var tbl = $("#calc-task-list-table");

            var taskList = _calc_route_calculator.getTaskList();

            $(".calc-table-foot-semitotal > .calc-table-col-distance", tbl).text(taskList.semiTotalDistance.toString());
            $(".calc-table-foot-total > .calc-table-col-distance", tbl).text(taskList.totalDistance.toString());

            $(".calc-table-foot-semitotal > .calc-table-col-weight", tbl).text(taskList.semiTotalWeight.toString());
            $(".calc-table-foot-total > .calc-table-col-weight", tbl).text(taskList.totalWeight.toString());

            $(".calc-table-foot-semitotal > .calc-table-col-value", tbl).text(taskList.semiTotalValue.toString());
            $(".calc-table-foot-total > .calc-table-col-value", tbl).text(taskList.totalValue.toString());

            $(".calc-table-foot-semitotal > .calc-table-col-price", tbl).text(taskList.semiTotalPrice.toString());
            $(".calc-table-foot-total > .calc-table-col-price", tbl).text(taskList.totalPrice.toString());

            $(".calc-table-foot-semitotal > .calc-table-col-price-weight", tbl).text(taskList.semiTotalPriceWeight.toFixed(2));
            $(".calc-table-foot-total > .calc-table-col-price-weight", tbl).text(taskList.totalPriceWeight.toFixed(2));

            $(".calc-table-foot-semitotal > .calc-table-col-price-value", tbl).text(taskList.semiTotalPriceValue.toFixed(2));
            $(".calc-table-foot-total > .calc-table-col-price-value", tbl).text(taskList.totalPriceValue.toFixed(2));
        };

        CalcController.prototype._init_google_map = function () {
            var mapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(55.76, 37.64),
                mapTypeId: google.maps.MapTypeId.ROADMAP
            };

            var map = new google.maps.Map($("#calc-google-map").get(0), mapOptions);
            _calc_route_calculator.setMap(map);
        };

        CalcController.prototype._task_list_table_clear_selection = function () {
            $("#calc-task-list-table > tbody > tr").removeClass("calc-table-row-selected");
        };

        CalcController.prototype._route_table_clear_selection = function () {
            $("#calc-routes-table > tbody > tr").removeClass("calc-table-row-selected");
        };
        return CalcController;
    })();
    RouteCalculator.CalcController = CalcController;
})(RouteCalculator || (RouteCalculator = {}));

var _calc_route_calculator = new RouteCalculator.Calc();
$(document).ready(RouteCalculator.CalcController.prototype.onDocumentReady);
