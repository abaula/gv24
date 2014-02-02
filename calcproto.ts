///<reference path="Scripts\typings\jquery\jquery.d.ts"/>
///<reference path="Scripts\typings\googlemaps\google.maps.d.ts"/>
///<reference path="Collections.ts"/>
///<reference path="CalcData.d.ts"/>
///<reference path="Route.ts"/>
///<reference path="Calculator.ts"/>

module RouteCalculator
{
    export class CalcTask
    {
        data: Task;
        selected: boolean;
        customTaxUsed: boolean;

        constructor(data: Task)
        {
            this.data = data;
            this.selected = false;
            this.customTaxUsed = false;
        }
    }

    export class CalcRouteEntry
    {

        entryId: string;
        city: City;
        task: CalcTask;
        next: CalcRouteEntry;

        weightLoad: number;
        weightUnload: number;
        sumWeight: number;
        sumWeightPc: number;
        
        valueLoad: number;
        valueUnload: number;
        sumValue: number;
        sumValuePc: number;

        resWeight: number;
        resValue: number;

        resWeightPc: number;
        resValuePc: number;

        distance: number;
        sumDistance: number;

        expense: number;
        sumExpense: number;

        proceeds: number;
        sumProceeds: number;
                
        profit: number;
        sumProfit: number;

        lostProceeds: number;
        targetProfit: number;

        customTaxUsed: boolean;

        constructor()
        {
            this.customTaxUsed = false;
        }

        isFirstTaskEntry(): boolean
        {
            return this.city == this.task.data.city1;
        }

    }


    export class CalcTaskList
    {
        private _tasks: CalcTask[];

        semiTotalDistance: number = 0;
        totalDistance: number = 0;

        semiTotalWeight: number = 0;
        totalWeight: number = 0;

        semiTotalValue: number = 0;
        totalValue: number = 0;

        semiTotalPrice: number = 0;
        totalPrice: number = 0;

        semiTotalPriceWeight: number = 0;
        totalPriceWeight: number = 0;

        semiTotalPriceValue: number = 0;
        totalPriceValue: number = 0;

        constructor()
        {
            this._tasks = [];
        }

        private _calcTotals(): void
        {
            
            this.totalDistance = 0;
            this.totalWeight = 0;
            this.totalValue = 0;
            this.totalPrice = 0;
            this.totalPriceWeight = 0;
            this.totalPriceValue = 0;

            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

                this.totalDistance += task.data.distance;
                this.totalWeight += task.data.weight;
                this.totalValue += task.data.value;
                this.totalPrice += task.data.price;
                this.totalPriceWeight += task.data.priceWeight100Km;
                this.totalPriceValue += task.data.priceValue100Km;
            }

            if (this._tasks.length > 0)
            {
                this.totalPriceWeight /= this._tasks.length;
                this.totalPriceValue /= this._tasks.length;
            }

        }

        private _calcSemiTotals(): void
        {
            this.semiTotalDistance = 0;
            this.semiTotalWeight = 0;
            this.semiTotalValue = 0;
            this.semiTotalPrice = 0;
            this.semiTotalPriceWeight = 0;
            this.semiTotalPriceValue = 0;
            var cnt: number = 0;

            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

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

            if (cnt > 0)
            {
                this.semiTotalPriceWeight /= cnt;
                this.semiTotalPriceValue /= cnt;
            }

        }

        updateTasks(tasks: Task[]): void
        {
            this._tasks = [];

            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: Task = tasks[i];
                var calcTask = new CalcTask(task);
                this._tasks.push(calcTask);
            }

            this._calcTotals();
            this._calcSemiTotals();
        }

        /*
        Устанавливаем правильное значение цены для задач
        */
        updateTaskListProceeds(taxWeight: number, taxValue: number)
        {
            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

                if (0 == task.data.price || task.customTaxUsed)
                {
                    task.customTaxUsed = true;
                    var proceedsWeight: number = taxWeight * task.data.weight * (task.data.distance / 100);
                    var proceedsValue: number = taxValue * task.data.value * (task.data.distance / 100);
                    task.data.price = Math.max(proceedsWeight, proceedsValue);
                    task.data.priceWeight100Km = taxWeight;
                    task.data.priceValue100Km = taxValue;
                }
            }
        }

        private _setProceedsToRouteEntry(entry: CalcRouteEntry): void
        {

            var task: Task = entry.task.data;

            if (0 < task.price)
            {
                entry.proceeds = task.price;
            }
            else
            {
            }
        }

        getTask(id: number): CalcTask
        {
            var result: CalcTask = null;

            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

                if (task.data.id == id)
                {
                    result = task;
                    break;
                }
            }

            return result;
        }

        getTasks(): CalcTask[]
        {
            return this._tasks;
        }

        selectTask(taskId: number, selected: boolean): void
        {
            var task: CalcTask = this.getTask(taskId);

            if (null != task)
                task.selected = selected;

            this._calcSemiTotals();
        }

        selectAllTasks(selected: boolean): void
        {
            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];
                task.selected = selected;
            }

            this._calcSemiTotals();
        }

        getSelectedTasks(): CalcTask[]
        {
            var result: CalcTask[] = [];

            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

                if(task.selected)
                    result.push(task);
            }

            return result;
        }

        getStartPoints(): City[]
        {
            var cities: Collections.Dictionary<number, City> = new Collections.Dictionary<number, City>();

            for (var i: number = 0; i < this._tasks.length; i++)
            {
                var task: CalcTask = this._tasks[i];

                if (task.selected)
                {
                    if (false == cities.containsKey(task.data.city1.id))
                        cities.setValue(task.data.city1.id, task.data.city1);
                }
            }

            var arr: City[] = cities.values();

            arr.sort(function (a: City, b: City): number
            {
                if (a.name > b.name)
                    return 1;
                else if (a.name < b.name)
                    return -1;
                else
                    return 0;
            });

            return arr;
        }

    }



    export class Calc
    {
        private _edges: GraphEdge[];
        private _taskList: CalcTaskList;
        private _route: CalcRouteEntry[];
        private _map: google.maps.Map;

        private _paramMaxWeight: number;
        private _paramMaxValue: number;
        private _paramExpense: number;
        private _paramTaxWeight: number;
        private _paramTaxValue: number;

        private _backWayEnable: boolean;

        constructor()
        {
            this._paramMaxWeight = 0;
            this._paramMaxValue = 0;
            this._paramExpense = 0;
            this._paramTaxWeight = 0;
            this._paramTaxValue = 0;
            this._route = [];
            this._taskList = new CalcTaskList();
            this._backWayEnable = false;
        }

        calculateRoute(startCityId: number, conflictResolveCriteria: string, loadingStrategy: string): void
        {
            ///////////////////////////////////
            // создаём список ограничений             
            var crc: Routes.ConflictResolveCriteria = (conflictResolveCriteria == "Profit") ? Routes.ConflictResolveCriteria.MaxProfit : Routes.ConflictResolveCriteria.MaxProceeds;
            var ls: Routes.LoadingStrategy = (loadingStrategy == "SavingWeight") ? Routes.LoadingStrategy.SavingWeight : Routes.LoadingStrategy.SavingValue;
            var restrictions: Routes.RouteRestrictions = new Routes.RouteRestrictions(this._paramMaxValue, this._paramMaxWeight, crc, ls);

            //////////////////////////////////////////
            // создаём список заданий на перевозку
            var tasks: CalcTask[] = this._taskList.getSelectedTasks();
            var routeTasks: Routes.RouteTask[] = [];
            
            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];
                var vertex1: Graph.GVertex = new Graph.GVertex(task.data.city1.id, task.data.city1.name, task.data.city1.latitude, task.data.city1.longitude);
                var vertex2: Graph.GVertex = new Graph.GVertex(task.data.city2.id, task.data.city2.name, task.data.city2.latitude, task.data.city2.longitude);
                var routeTask: Routes.RouteTask = new Routes.RouteTask(task.data.id, task.data.city1.name + "-" + task.data.city2.name, vertex1, vertex2, task.data.price, task.data.value, task.data.weight, task.data.distance);
                routeTasks.push(routeTask);
            }

            var taskList: Routes.RouteTaskList = new Routes.RouteTaskList();
            taskList.addRouteTasks(routeTasks);

            //////////////////////////////////////////////
            // создание массива рёбер графа Graph.GEdge
            var edges: Graph.GEdge[] = [];
            // получаем список уникальных вершин 
            var vertices: Graph.GVertex[] = taskList.getVertices();
            
            for (var i: number = 0; i < this._edges.length; i++)
            {
                var graphEdge: GraphEdge = this._edges[i];
                var a: boolean = this._isCityIdInVertexArray(graphEdge.cityId1, vertices);
                var b: boolean = this._isCityIdInVertexArray(graphEdge.cityId2, vertices);

                if (a && b)
                {
                    var edge: Graph.GEdge = new Graph.GEdge(graphEdge.id, "", graphEdge.cityId1, graphEdge.cityId2, graphEdge.distance);
                    edges.push(edge);
                }
            }

            /////////////////////////////////////
            // создаём граф
            var graph: Graph.UndirectedGraph = new Graph.UndirectedGraph();
            graph.init(vertices, edges);

            ///////////////////////////////////////
            // получаем начальную вершину маршрута
            var startVertex: Graph.GVertex = null;

            for (var i: number = 0; i < vertices.length; i++)
            {
                if (startCityId == vertices[i].getId())
                {
                    startVertex = vertices[i];
                    break;
                }
            }


            ///////////////////////////
            // расчитываем маршрут
            var calculator: Calculator.RouteCalculator = new Calculator.RouteCalculator(taskList, restrictions, graph);
            calculator.calculateRoute(startVertex);            
            // всегда получаем оптимальный маршрут рассчитанный без учёта обратного пути
            var route: Routes.Route = calculator.getRoute();

            //////////////////////////////////
            // применяем полученный маршрут
            this._route = [];
            var routes: Routes.RouteEntry[] = route.getEntries();

            for (var i: number = 0; i < routes.length; i++)
            {
                var routeEntry: Routes.RouteEntry = routes[i];
                
                var calcEntries: CalcRouteEntry[] = this._createRouteEntriesByTasks(routeEntry.getCommitedTasks(), false);

                for (var j: number = 0; j < calcEntries.length; j++)
                    this._route.push(calcEntries[j]); 

                calcEntries = this._createRouteEntriesByTasks(routeEntry.getFulfiledTasks(), true);

                for (var j: number = 0; j < calcEntries.length; j++)
                    this._route.push(calcEntries[j]); 
            }

            // убираем лишние галочки у выбранных заданий
            this._taskList.selectAllTasks(false);
            var selectedTasks: CalcTask[] = this._getSelectedTasksFromRoute();

            for (var i: number = 0; i < selectedTasks.length; i++)
                this._taskList.selectTask(selectedTasks[i].data.id, true);


            // сообщаем, что список отмеченных задач изменился
            CalcController.prototype.onSelectedTaskListChanged();

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();

            return;
        }

        private _createRouteEntriesByTasks(tasks: Routes.RouteTask[], isFulfiledTasks: boolean): CalcRouteEntry[]
        {
            var entries: CalcRouteEntry[] = [];

            for (var i: number = 0; i < tasks.length; i++)
            {
                var rTask: Routes.RouteTask = tasks[i];
                var task: CalcTask = this._taskList.getTask(rTask.getId());
                var entry: CalcRouteEntry = new CalcRouteEntry();
                entry.task = task;

                if (isFulfiledTasks)
                {
                    entry.entryId = task.data.id.toString() + ".2";
                    entry.city = task.data.city2;
                    entry.weightLoad = 0;
                    entry.valueLoad = 0;
                    entry.weightUnload = task.data.weight;
                    entry.valueUnload = task.data.value;
                    entry.proceeds = task.data.price;
                }
                else
                {
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
        }

        /*
            Проверка находится ли город в массиве вершин
        */
        private _isCityIdInVertexArray(cityId: number, vertices: Graph.GVertex[]): boolean
        {
            for (var i: number = 0; i < vertices.length; i++)
            {
                if (cityId == vertices[i].getId())
                    return true;
            }

            return false;
        }

        /*
            Удаляем все задания из маршрута
        */
        removeAllTasksFromRoute(): void
        {
            // отмечаем все задания как не выделенные
            this._taskList.selectAllTasks(false);

            // обнуляем маршрут
            this._route = [];

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();            
        }

        removeTaskFromRoute(taskId: number): void
        {
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
        }

        private _removeSingleTaskEntry(taskId: number): void
        {
            var index: number = -1;

            for (var i: number = 0; i < this._route.length; i++)
            {
                var routeEntry: CalcRouteEntry = this._route[i];

                if (taskId == routeEntry.task.data.id)
                {
                    index = i;
                    break;
                }
            }

            if(-1 < index)
                this._route.splice(index, 1);
        }

        switchTaskRoutes(entryId1: string, entryId2: string): void
        {
            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            var index1: number = -1;
            var index2: number = -1;
           
            for (var i: number = 0; i < this._route.length; i++)
            {
                var entry: CalcRouteEntry = this._route[i];

                if (entryId1 == entry.entryId)
                    index1 = i;

                if (entryId2 == entry.entryId)
                    index2 = i;

                if (-1 < index1 && -1 < index2)
                {
                    entry = this._route[index1];
                    this._route[index1] = this._route[index2];
                    this._route[index2] = entry;
                    break;
                }
            }

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        }

        /*
            Добавляем все задания в маршрут
            - добавялем только те задания котрые отсутствуют в маршруте (т.е. сохраняем существующий маршрут)
            - добавляем в порядке очередности в списке заданий
        */
        addAllTasksToRoute(): void
        {
            // удаляем обратный путь из маршрута
            this._cleanBackWayEntry();

            // получаем список заданий уже добавленных в маршрут
            var tasks: CalcTask[] = this._taskList.getTasks();

            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];

                if (false == task.selected)
                    this._addTaskToRoute(task.data.id);
            }

            // отмечаем все задания как выделенные
            this._taskList.selectAllTasks(true);

            // сообщаем, что список доступных начальных точек маршрута изменился
            CalcController.prototype.onStartPointsListChanged();

            // пересчитываем параметры маршрута
            this._calculateRouteParams();
        }

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
        addTaskToRoute(taskId: number): void
        {
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
        }

        private _addTaskToRoute(taskId: number): void
        {
            var task: CalcTask = this._taskList.getTask(taskId);
            var firstEntry: CalcRouteEntry = new CalcRouteEntry();
            firstEntry.entryId = taskId.toString() + ".1";
            firstEntry.city = task.data.city1;
            firstEntry.task = task;
            firstEntry.weightLoad = task.data.weight;
            firstEntry.valueLoad = task.data.value;
            firstEntry.weightUnload = 0;
            firstEntry.valueUnload = 0;
            firstEntry.proceeds = 0;

            var secondEntry: CalcRouteEntry = new CalcRouteEntry();
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
        }

        private _hasRouteBackWayEntry(): boolean
        {
            var lastEntry: CalcRouteEntry = this._getLastRouteEntry();

            if (null == lastEntry)
                return false;

            return lastEntry.task == null;
        }

        private _cleanBackWayEntry(): void
        {
            if (this._hasRouteBackWayEntry())
                this._route.splice(this._route.length - 1, 1);
        }

        private _createAndPushBackWayEntry(): void
        {
            if (this._backWayEnable)
            {
                if (false == this._hasRouteBackWayEntry())
                {
                    var firstEntry: CalcRouteEntry = this._getFirstRouteEntry();
                    var entry: CalcRouteEntry = new CalcRouteEntry();
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
        }


        private _calculateRouteParams(): void
        {
            if (0 < this._route.length)
            {
                this._createAndPushBackWayEntry();

                var resWeight: number = this.getParamMaxWeight();
                var resValue: number = this.getParamMaxValue();
                var sumWeight: number = 0;
                var sumValue: number = 0;
                var sumDistance: number = 0;

                var sumExpense: number = 0;
                var sumProceeds: number = 0;
                var sumProfit: number = 0;

                // упущенная выручка
                var lostProcceds: number = 0;
                // целевая прибыль
                var targetProfit: number = 0;

                var prevCity: City = null;
                var prevEntry: CalcRouteEntry = null;

                for (var i: number = 0; i < this._route.length; i++)
                {
                    var entry: CalcRouteEntry = this._route[i];
                    var distance: number = 0;
                    var expense: number = 0;
                    var profit: number = 0;

                    if (null != entry.task)
                    {
                        if (entry.isFirstTaskEntry())
                        {
                            // загрузка
                            sumWeight += entry.weightLoad;
                            sumValue += entry.valueLoad;
                            resWeight -= entry.weightLoad;
                            resValue -= entry.valueLoad;
                        }
                        else
                        {
                            // разгрузка
                            sumWeight -= entry.weightUnload;
                            sumValue -= entry.valueUnload;
                            resWeight += entry.weightUnload;
                            resValue += entry.valueUnload;
                            // обновдяем значение цены за перевозку
                            entry.proceeds = entry.task.data.price;
                        }
                    }

                    if (null != prevCity)
                    {
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
        }

        private _getFirstRouteEntry(): CalcRouteEntry
        {
            if (1 > this._route.length)
                return null;

            return this._route[0];
        }

        private _getLastRouteEntry(): CalcRouteEntry
        {
            if (1 > this._route.length)
                return null;

            return this._route[this._route.length - 1];
        }

        getRouteEntry(entryId: string): CalcRouteEntry
        {
            var result: CalcRouteEntry = null;

            for (var i: number = 0; i < this._route.length; i++)
            {
                var entry: CalcRouteEntry = this._route[i];

                if (entryId == entry.entryId)
                {
                    result = entry;
                    break;
                }
            }

            return result;
        }

        getRoute(): CalcRouteEntry[]
        {
            return this._route.slice(0);
        }

        updateTaskList(data: DataPackage): void
        {
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
        }
        
        private _getSelectedTasksFromRoute(): CalcTask[]
        {
            var result: CalcTask[] = [];
            var tasks: Collections.Dictionary<number, CalcTask> = new Collections.Dictionary < number, CalcTask>();

            for (var i: number = 0; i < this._route.length; i++)
            {
                var entry: CalcRouteEntry = this._route[i];

                if (null != entry.task)
                {
                    if (false == tasks.containsKey(entry.task.data.id))
                        tasks.setValue(entry.task.data.id, entry.task);
                }
            }

            return tasks.values();
        }
        

        getEdges(): GraphEdge[]
        {
            return this._edges;
        }

        /*setEdges(edges: GraphEdge[])
        {
            this._edges = edges;
        } */

        getTaskList(): CalcTaskList
        {
            return this._taskList;
        }

        /*setTasks(tasks: Task[])
        {
            this._tasks = tasks;

        } */

        getDistance(city1: number, city2: number): number
        {
            if (city1 == city2)
                return 0;

            var result: number = -1;

            for (var i: number = 0; i < this._edges.length; i++)
            {
                var edge: GraphEdge = this._edges[i];

                if ((edge.cityId1 == city1 && edge.cityId2 == city2)
                    || (edge.cityId1 == city2 && edge.cityId2 == city1))
                {
                    result = edge.distance;
                    break;
                }
            }

            return result;
        }


        getMap(): google.maps.Map
        {
            return this._map;
        }

        setMap(map: google.maps.Map): void
        {
            this._map = map;
        }

        getParamMaxWeight(): number
        {
            return this._paramMaxWeight;
        }

        setParamMaxWeight(value: number): void
        {
            this._paramMaxWeight = value;
            CalcController.prototype.onParamMaxWeightChanged();
            this._calculateRouteParams();
        }

        getParamMaxValue(): number
        {
            return this._paramMaxValue;
        }

        setParamMaxValue(value: number): void
        {
            this._paramMaxValue = value;
            CalcController.prototype.onParamMaxValueChanged();
            this._calculateRouteParams();
        }

        getParamExpense(): number
        {
            return this._paramExpense;
        }

        setParamExpense(value: number): void
        {
            this._paramExpense = value;
            CalcController.prototype.onParamExpenseChanged();
            this._calculateRouteParams();
        }

        updateVehicleParams(data: VehicleParams): void
        {
            this._paramMaxWeight = data.maxWeight;
            this._paramMaxValue = data.maxValue;
            this._paramExpense = data.expense;
            this._paramTaxWeight = data.taxWeight;
            this._paramTaxValue = data.taxValue;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue);             
                                   
            CalcController.prototype.onVehicleParamsChanged();
            this._calculateRouteParams();
        }

        private _updateProceeds(taxWeight: number, taxValue: number): void
        {
            this._taskList.updateTaskListProceeds(taxWeight, taxValue);
        }

        getParamTaxWeight(): number
        {
            return this._paramTaxWeight;
        }

        setParamTaxWeight(value: number): void
        {
            this._paramTaxWeight = value;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue); 
            CalcController.prototype.onParamTaxWeightChanged();
            this._calculateRouteParams();
        }

        getParamTaxValue(): number
        {
            return this._paramTaxValue;
        }

        setParamTaxValue(value: number): void
        {
            this._paramTaxValue = value;
            this._updateProceeds(this._paramTaxWeight, this._paramTaxValue); 
            CalcController.prototype.onParamTaxValueChanged();
            this._calculateRouteParams();
        }

        enableBackWay(enable: boolean): void
        {
            if (this._backWayEnable == enable)
                return;

            this._backWayEnable = enable;
            this._cleanBackWayEntry();
            this._calculateRouteParams();
        }




    }

    export class CalcController
    {
        private _onComputeClick(event: JQueryEventObject): boolean
        {
            var startCityId: number = parseInt($("#calc-auto-param-start-city option:selected").val());
            var conflictResolveCriteria: string = $("#calc-Conflict-Resolve-Criteria > input[name=calc-Conflict-Resolve-Criteria]:checked").val();
            var loadingStrategy: string = $("#calc-Loading-Strategy > input[name=calc-Loading-Strategy]:checked").val();
            _calc_route_calculator.calculateRoute(startCityId, conflictResolveCriteria, loadingStrategy);

            return false;
        }

        private _onFocusOut(event: JQueryEventObject): void
        {
            var ctrl: JQuery = $(event.delegateTarget);
            var val: number = parseFloat(ctrl.val());
            var newVal: number;
            var changed: boolean = false;

            if (isNaN(val) || val < 0)
                val = 0;
            
            var id: string = ctrl.attr("id");

            if ("calc-param-max-weight" == id)
            {
                newVal = _calc_route_calculator.getParamMaxWeight();

                if (newVal != val)
                {
                    _calc_route_calculator.setParamMaxWeight(val);
                    changed = true;
                }

                // сохраняем очищенное значение в поле
                ctrl.val(val);
            }
            else if ("calc-param-max-value" == id)
            {
                newVal = _calc_route_calculator.getParamMaxValue();

                if (newVal != val)
                {
                    _calc_route_calculator.setParamMaxValue(val);
                    changed = true;
                }

                // сохраняем очищенное значение в поле
                ctrl.val(val);
            }
            else if ("calc-param-expense" == id)
            {
                newVal = _calc_route_calculator.getParamExpense();

                if (newVal != val)
                {
                    _calc_route_calculator.setParamExpense(val);
                    changed = true;
                }             
                
                // сохраняем очищенное значение в поле
                ctrl.val(val);                   
            }

            // сбрасываем значение выбранной машины в выпадающем списке
            if (changed)
                $("#calc-param-vehicle-select").val(0);


            if ("calc-param-tax-weight" == id)
            {
                _calc_route_calculator.setParamTaxWeight(val);
                // сохраняем очищенное значение в поле
                ctrl.val(val.toFixed(2));
            }
            else if ("calc-param-tax-value" == id)
            {
                _calc_route_calculator.setParamTaxValue(val);
                // сохраняем очищенное значение в поле
                ctrl.val(val.toFixed(2));
            }
        }

        onVehicleParamsChanged(): void
        {
            var maxWeight: number = _calc_route_calculator.getParamMaxWeight();
            $("#calc-param-max-weight").val(maxWeight);
            CalcController.prototype.onParamMaxWeightChanged();

            var maxValue: number = _calc_route_calculator.getParamMaxValue();
            $("#calc-param-max-value").val(maxValue);
            CalcController.prototype.onParamMaxValueChanged();

            var expense: number = _calc_route_calculator.getParamExpense();
            $("#calc-param-expense").val(expense);
            CalcController.prototype.onParamExpenseChanged();

            var taxWeight: number = _calc_route_calculator.getParamTaxWeight();
            $("#calc-param-tax-weight").val(taxWeight.toFixed(2));
            CalcController.prototype.onParamTaxWeightChanged();

            var taxValue: number = _calc_route_calculator.getParamTaxValue();
            $("#calc-param-tax-value").val(taxValue.toFixed(2));
            CalcController.prototype.onParamTaxValueChanged();
        }

        onParamMaxWeightChanged(): void
        {
            var panel: JQuery = $("#calc-param-info-panel-max-weight");
            var info: JQuery = $(".calc-param-info-panel-value", panel);
            var value: number = _calc_route_calculator.getParamMaxWeight();
            CalcController.prototype._setInfoValue(panel, info, value.toString());
            CalcController.prototype._highliteTaskList();
        }

        onParamMaxValueChanged(): void
        {
            var panel: JQuery = $("#calc-param-info-panel-max-value");
            var info: JQuery = $(".calc-param-info-panel-value", panel);
            var value: number = _calc_route_calculator.getParamMaxValue();
            CalcController.prototype._setInfoValue(panel, info, value.toString());
            CalcController.prototype._highliteTaskList();
        }

        onParamExpenseChanged(): void
        {
            var panel: JQuery = $("#calc-param-info-panel-expense");
            var info: JQuery = $(".calc-param-info-panel-value", panel);
            var value: number = _calc_route_calculator.getParamExpense();
            CalcController.prototype._setInfoValue(panel, info, value.toString());

        }

        onParamTaxWeightChanged(): void
        {
            var panel: JQuery = $("#calc-param-info-panel-custom-tax-weight");
            var info: JQuery = $(".calc-param-info-panel-value", panel);
            var value: number = _calc_route_calculator.getParamTaxWeight();
            CalcController.prototype._setInfoValue(panel, info, value.toFixed(2));
            CalcController.prototype._updateTaskList();  
        }

        onParamTaxValueChanged(): void
        {
            var panel: JQuery = $("#calc-param-info-panel-custom-tax-value");
            var info: JQuery = $(".calc-param-info-panel-value", panel);
            var value: number = _calc_route_calculator.getParamTaxValue();
            CalcController.prototype._setInfoValue(panel, info, value.toFixed(2));
            CalcController.prototype._updateTaskList();
        }

        onRouteParamsCalculated(): void
        {
            // при изменении значений маршрута перерисовываем и делаем подсветку
            CalcController.prototype._collapseDetails();
            CalcController.prototype._drawRoute();
        }


        // Обновился список задач
        onTaskListUpdated(): void
        {
            CalcController.prototype._createTaskList();    
            CalcController.prototype._highliteTaskList();        
        }

        // подсвечиваем в списке задач непроходящий по критериям вес и объём
        private _highliteTaskList(): void
        {
            // убираем подсветку если есть
            $("#calc-task-list-table > tbody > tr > td").removeClass("calc-table-col-res-empty");

            // находим все задания вес или объём которых привышают указанный лимит машины и подсвечиваем их
            var maxWeightLimit: number = _calc_route_calculator.getParamMaxWeight();
            var maxValueLimit: number = _calc_route_calculator.getParamMaxValue();
            var tasks: CalcTask[] = _calc_route_calculator.getTaskList().getTasks();

            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];

                if (task.data.weight > maxWeightLimit)
                    $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td.calc-table-col-weight").addClass("calc-table-col-res-empty");

                if (task.data.value > maxValueLimit)
                    $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td.calc-table-col-value").addClass("calc-table-col-res-empty");

            }
        }

        // Обновился список выделенных задач
        onSelectedTaskListChanged(): void
        {
            $("#calc-task-list-table > tbody > tr > td > :checkbox").prop("checked", false);
            $("#calc-task-list-table > thead > tr > th > :checkbox").prop("checked", false);
            var tasks: CalcTask[] = _calc_route_calculator.getTaskList().getSelectedTasks();

            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];
                var elem: JQuery = $("#calc-task-list-table > tbody > tr[data-task-id=" + task.data.id + "] > td > :checkbox");
                elem.prop("checked", true);
                CalcController.prototype._updateHeadCheckBoxState(true);
            }

            // вычисляем значения после загрузки
            CalcController.prototype._task_list_table_calc_total();
        }


        // обновился список доступных начальных точек маршрутов
        onStartPointsListChanged(): void
        {
            var target: JQuery = $("#calc-auto-param-start-city");
            $("option", target).remove();
            var cities: City[] = _calc_route_calculator.getTaskList().getStartPoints();

            for (var i: number = 0; i < cities.length; i++)
            {
                var city: City = cities[i];
                var elem: JQuery = $("<option></option>");
                elem.val(city.id);
                elem.text(city.name);
                elem.appendTo(target);
            }
        }

        /*
        Создаём список задач
        */
        private _createTaskList(): void
        {
            // очищаем таблицу
            $("#calc-task-list-table > tbody > tr").remove();

            // заполняем таблицу новыми значениями
            var tasks: CalcTask[] = _calc_route_calculator.getTaskList().getTasks();

            var rowTemplate: JQuery = $("#calc-task-list-table-tr-template");
            var target: JQuery = $("#calc-task-list-table > tbody");
            var rows: JQuery = $("tr", target);
            var nextRowNumber: number = rows.length + 1;

            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];
                var id = task.data.id;

                // создаём новый экземпляр строки
                var row: JQuery = rowTemplate.clone();
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
        }

        /*
        Перерисовываем список задач        
        */        
        private _updateTaskList(): void
        {
            // обновляем таблицу заданий на перевозку новыми значениями
            var tasks: CalcTask[] = _calc_route_calculator.getTaskList().getTasks();

            // добавляем только новые задания
            for (var i: number = 0; i < tasks.length; i++)
            {
                var task: CalcTask = tasks[i];
                var id = task.data.id;

                var row: JQuery = $("#calc-task-list-table > tbody > tr[data-task-id=" + id + "]");

                if (row.length > 0)
                {
                    // заполняем данными строку                    
                    $("td.calc-table-col-weight", row).text(task.data.weight);
                    $("td.calc-table-col-value", row).text(task.data.value);

                    if (task.customTaxUsed)
                    {
                        $("td.calc-table-col-price", row).text(task.data.price.toFixed(0)).addClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-weight", row).text(task.data.priceWeight100Km.toFixed(2)).addClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-value", row).text(task.data.priceValue100Km.toFixed(2)).addClass("calc-table-col-val-custom");
                    }
                    else
                    {
                        $("td.calc-table-col-price", row).text(task.data.price.toFixed(0)).removeClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-weight", row).text(task.data.priceWeight100Km.toFixed(2)).removeClass("calc-table-col-val-custom");
                        $("td.calc-table-col-price-value", row).text(task.data.priceValue100Km.toFixed(2)).removeClass("calc-table-col-val-custom");
                    }
                    
                    //$("td.calc-table-col-delete", row).text();
                }
            }

            // вычисляем значения после загрузки
            CalcController.prototype._task_list_table_calc_total();
        }



        private _setInfoValue(panel: JQuery, info: JQuery, value: string): void
        {
            info.text(value);

            var notValidClass: string = "calc-param-info-panel-entry-not-valid";

            if (0 == parseFloat(value))
                panel.addClass(notValidClass);
            else
                panel.removeClass(notValidClass);
        }


        private _onCheckBoxClick(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var checked: boolean = elem.is(":checked");
            CalcController.prototype._updateHeadCheckBoxState(checked); 
            
            // добавляем в маршрут или исключаем
            var taskId: number = parseInt($(elem.parent().parent()).attr("data-task-id"));

            if (checked)
                _calc_route_calculator.addTaskToRoute(taskId);
            else
                _calc_route_calculator.removeTaskFromRoute(taskId);

            // рассчитываем суммы в таблице заданий на перевозку
            CalcController.prototype._task_list_table_calc_total();
        }

        private _updateHeadCheckBoxState(checked: boolean): void
        {            
            var boxes: JQuery = $("#calc-task-list-table > tbody > tr > td > :checkbox");
            var boxesCnt: number = boxes.length;
            var boxesCheckedCnt: number = boxes.filter(":checked").length;
            var indeterminate: boolean = checked ? boxesCnt != boxesCheckedCnt : boxesCheckedCnt > 0;
            var headChkBox: JQuery = $("#calc-task-list-table > thead > tr > th > :checkbox");

            if (checked || indeterminate)
                headChkBox.prop("checked", true);
            else
                headChkBox.prop("checked", false);

            headChkBox.prop("indeterminate", indeterminate);
        }


        private _createRouteEntryRow(routeEntry: CalcRouteEntry, isBackWayRow: boolean): JQuery
        {
            var rowTemplate: JQuery = $("#calc-routes-table-tr-template");
            // создаём новую строку 
            var row: JQuery = rowTemplate.clone();
            row.removeAttr("id");
            row.removeClass("hidden");

            // заполняем данными строку
            if (null != routeEntry.task)                    
                row.attr("data-task-id", routeEntry.task.data.id);
            else
                row.attr("data-task-id", "-");

            row.attr("data-city-id", routeEntry.city.id);
            $("td.calc-table-col-num", row).text(routeEntry.entryId);
            $("td.calc-table-col-from", row).text(routeEntry.city.name);

            $("td.calc-table-col-weight-load", row).text(routeEntry.weightLoad - routeEntry.weightUnload);
            $("td.calc-table-col-value-load", row).text(routeEntry.valueLoad - routeEntry.valueUnload);


            if (routeEntry.sumWeightPc == Number.POSITIVE_INFINITY || routeEntry.sumValuePc == Number.POSITIVE_INFINITY
                || isNaN(routeEntry.sumWeightPc) || isNaN(routeEntry.sumValuePc))
            {
                $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight);
                $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue);
            }
            else
            {
                $("td.calc-table-col-sum-weight", row).text(routeEntry.sumWeight + " (" + routeEntry.sumWeightPc + "%)");
                $("td.calc-table-col-sum-value", row).text(routeEntry.sumValue + " (" + routeEntry.sumValuePc + "%)");
            }


            if (routeEntry.resWeightPc == Number.NEGATIVE_INFINITY || routeEntry.resValuePc == Number.NEGATIVE_INFINITY
                || isNaN(routeEntry.resWeightPc) || isNaN(routeEntry.resValuePc))
            {
                $("td.calc-table-col-res-weight", row).text(routeEntry.resWeight);
                $("td.calc-table-col-res-value", row).text(routeEntry.resValue);
            }
            else
            {
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

            // подключаем обработчики событий
            if (isBackWayRow)
            {
                $("td.calc-table-col-up > span.icon-button", row).remove();
                $("td.calc-table-col-down > span.icon-button", row).remove();
                $("td.calc-table-col-show-details > span.icon-button", row).remove();
            }
            else
            {
                $("td.calc-table-col-up > span.icon-button", row).click("up", CalcController.prototype._onUpDownClick);
                $("td.calc-table-col-down > span.icon-button", row).click("down", CalcController.prototype._onUpDownClick);
                $("td.calc-table-col-show-details > span.icon-button", row).click(CalcController.prototype._onDetailsClick);
            }
            
            row.click(CalcController.prototype._onRouteTableRowClick);

            return row;
        }


        private _clearRouteRows(): void
        {
            $("#calc-routes-table > tbody > tr[data-task-id] > td > span").unbind();
            $("#calc-routes-table > tbody > tr[data-task-id]").unbind().remove();

        }


        private _drawRoute(): void
        {
            // запоминаем выделенную строку если такая есть
            // var selectedEntryId: string = $("#calc-routes-table > tbody > tr.calc-table-row-selected > td.calc-table-col-num").text();

            CalcController.prototype._clearRouteRows();

            var route: CalcRouteEntry[] = _calc_route_calculator.getRoute();
            
            if (route.length < 1)
            {                
                CalcController.prototype._showHideRouteTableAbsentRow(true);
                return;
            }


            // рисуем строки маршрута
            CalcController.prototype._showHideRouteTableAbsentRow(false);
            var tbody: JQuery = $("#calc-routes-table > tbody");
            var traceClass: string = "trace-pass";
            var prevRow: JQuery = null;
            var prevEntry: CalcRouteEntry = null;

            for (var i: number = 0; i < route.length; i++)
            {
                var entry: CalcRouteEntry = route[i];
                var isBackWayRow: boolean = null == entry.task;
                var row: JQuery = CalcController.prototype._createRouteEntryRow(entry, isBackWayRow);

                // подсветка колонок суммарного веса и объёма
                if (entry.sumWeightPc > 100)
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-res-empty");
                else
                    $("td.calc-table-col-sum-weight", row).addClass("calc-table-col-weight-value-pc").css("background-size", entry.sumWeightPc + "% 100%");

                if (entry.sumValuePc > 100)
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-res-empty");
                else
                    $("td.calc-table-col-sum-value", row).addClass("calc-table-col-weight-value-pc").css("background-size", entry.sumValuePc + "% 100%");

                // подсветка колонок резерва
                if (entry.resWeight < 0)
                {
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-empty");
                    traceClass = "trace-stop";
                }
                else
                    $("td.calc-table-col-res-weight", row).addClass("calc-table-col-res-pc").css("background-size", entry.resWeightPc + "% 100%");                     

                if (entry.resValue < 0)
                {
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-empty");
                    traceClass = "trace-stop";
                }
                else
                    $("td.calc-table-col-res-value", row).addClass("calc-table-col-res-pc").css("background-size", entry.resValuePc + "% 100%");


                if (entry.profit < 0)
                    $("td.calc-table-col-profit", row).addClass("calc-table-col-val-empty");

                if (entry.sumProfit < 0)
                    $("td.calc-table-col-sum-profit", row).addClass("calc-table-col-val-empty");

                // Трассировка маршрута
                $("td.calc-table-col-trace", row).removeClass("trace-pass").removeClass("trace-stop").addClass(traceClass);


                if (false == isBackWayRow)
                {
                    // настраиваем кнопку вверх и вниз
                    var btnUp: JQuery = $("td.calc-table-col-up > span.icon-button", row);

                    if (null == prevRow)
                    {
                        btnUp.removeClass("ib-arrow-up").addClass("ib-arrow-up-gray");
                    }
                    else
                    {
                        var btnDown: JQuery = $("td.calc-table-col-down > span.icon-button", prevRow);

                        if (prevEntry.task.data.id == entry.task.data.id)
                        {
                            btnUp.removeClass("ib-arrow-up").addClass("ib-arrow-up-gray");
                            btnDown.removeClass("ib-arrow-down").addClass("ib-arrow-down-gray");
                        }
                        else
                        {
                            btnUp.removeClass("ib-arrow-up-gray").addClass("ib-arrow-up");
                            btnDown.removeClass("ib-arrow-down-gray").addClass("ib-arrow-down");
                        }

                        if ((i + 1) == route.length)
                            $("td.calc-table-col-down > span.icon-button", row).removeClass("ib-arrow-down").addClass("ib-arrow-down-gray");
                    }
                }
                else
                {
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
        }

        private _showHideRouteTableAbsentRow(show: boolean): void
        {
            var rowRouteAbsent: JQuery = $("#calc-routes-table-tr-absent");
            var rowTotal: JQuery = $("#calc-routes-table-foot-total");

            if (show)
            {
                rowRouteAbsent.removeClass("hidden");
                rowTotal.addClass("hidden");
            }
            else
            {
                rowRouteAbsent.addClass("hidden");
                rowTotal.removeClass("hidden");
            }
        }


      
        private _onDetailsClick(event: JQueryEventObject): void
        {            
            var elem: JQuery = $(event.delegateTarget);
            var expand: boolean = elem.hasClass("ib-toggle-expand");
            CalcController.prototype._collapseDetails();

            if (expand)
            {
                var row: JQuery = elem.parent().parent();
                var entryId: string = $("td.calc-table-col-num", row).text();
                var entry: CalcRouteEntry = _calc_route_calculator.getRouteEntry(entryId);

                if (null != entry)
                {
                    // заполняем поля данными
                    var detailsRow: JQuery = $("#calc-routes-table-tr-details");

                    /////////////////////////////////////////////////////////////
                    // детальная информация о маршруте
                    if (entry.isFirstTaskEntry())
                    {
                        $("#calc-route-detail-commited-tasks span.calc-param-info-panel-value").text(entry.task.data.city1.name + "-" + entry.task.data.city2.name);
                        $("#calc-route-detail-fulfiled-tasks span.calc-param-info-panel-value").text("-");
                    }
                    else
                    {
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

                    var pathDistance: number = null != entry.next ? _calc_route_calculator.getDistance(entry.city.id, entry.next.city.id) : 0;

                    if (entry.resWeight > 0 && entry.resValue > 0 && pathDistance > 0)
                    {
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(0).text(entry.resWeight);
                        $("#calc-route-detail-can-load span.calc-param-info-panel-value").eq(1).text(entry.resValue);
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(0).text(entry.city.name + "-" + entry.next.city.name);
                        $("#calc-route-detail-path span.calc-param-info-panel-value").eq(1).text(pathDistance);
                    }
                    else
                    {
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
        }

        private _collapseDetails(): void
        {
            var btn: JQuery = $("#calc-routes-table > tbody > tr > td.calc-table-col-show-details > span.icon-button")
            btn.removeClass("ib-toggle");
            btn.addClass("ib-toggle-expand");
            var rowRouteAbsent: JQuery = $("#calc-routes-table-tr-absent");
            $("#calc-routes-table-tr-details").addClass("hidden");

        }


        private _onUpDownClick(event: JQueryEventObject): void
        {
            var btn: JQuery = $(event.delegateTarget);

            if (btn.hasClass("ib-arrow-down-gray") || btn.hasClass("ib-arrow-up-gray"))
                return;

            var row1: JQuery = btn.parent().parent();
            var row2: JQuery = null;

            if ("up" == event.data)
                row2 = row1.prev();
            else if ("down" == event.data)
                row2 = row1.next();

            var entryId1: string = $("td.calc-table-col-num", row1).text();
            var entryId2: string = $("td.calc-table-col-num", row2).text();

            // меняем строки местами
            _calc_route_calculator.switchTaskRoutes(entryId1, entryId2);
        }


        private _onHeadCheckBoxClick(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var checked: boolean = elem.is(":checked");
            elem.prop("indeterminate", false);
            $("#calc-task-list-table > tbody > tr > td > :checkbox").prop("checked", checked);

            // добавляем в маршрут или исключаем все задания
            if (checked)
                _calc_route_calculator.addAllTasksToRoute();
            else
                _calc_route_calculator.removeAllTasksFromRoute();

            // рассчитываем суммы в таблице заданий на перевозку
            CalcController.prototype._task_list_table_calc_total();
        }


        private _onSlideClick(event: JQueryEventObject): void
        {
            var container: JQuery = $("#calc-param-panel");

            if (container.is(":hidden"))
            {
                $(event.delegateTarget).removeClass("ib-slide-down").addClass("ib-slide-up");
                container.slideDown();
            }
            else
            {
                $(event.delegateTarget).removeClass("ib-slide-up").addClass("ib-slide-down");
                container.slideUp();
            }
        }


        private _onTaskListTableRowClick(event: JQueryEventObject): void
        {
            CalcController.prototype._task_list_table_clear_selection();
            $(event.delegateTarget).addClass("calc-table-row-selected");
        }


        private _onWayBackClick(event: JQueryEventObject): void
        {
            var elem: JQuery = $(event.delegateTarget);
            var checked: boolean = elem.is(":checked");
            _calc_route_calculator.enableBackWay(checked);            
        }

        private _onRouteTableRowClick(event: JQueryEventObject): void
        {
            CalcController.prototype._route_table_clear_selection();
            $(event.delegateTarget).addClass("calc-table-row-selected");
        }

        private _onJSONPackageLoad(data: DataPackage): void
        {
            // сохраняем полученные данные
            _calc_route_calculator.updateTaskList(data);
        }

        private _onVehicleParamsSelect(event: JQueryEventObject): void
        {
            var id: number = parseInt($("#calc-param-vehicle-select option:selected").val());

            if (0 == id)
                return;

            CalcController.prototype._getJSONHelper("api/vehicle/" + id.toString(), CalcController.prototype._onJSONVehicleParamsLoad);
        }


        private _onJSONVehicleParamsLoad(data: VehicleParams) :void
        {
            // пакетное обновление данных в модели
            _calc_route_calculator.updateVehicleParams(data);
        }

        /*
        Сбрасываем значения в контролах
        */
        private _dropControlsState(): void
        {
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
        }

        /*
            Помогает сохранить работоспособность AJAX с любым именем хоста
            Выполняет JSON запрос к серверу - имя хоста формируется динамически
        */
        private _getJSONHelper(path: string, callback: any): void
        {
            //window.console.log(document.location.host);
            $.getJSON(document.location.protocol + "//" + document.location.host + "/" + path, callback);
        } 

        onDocumentReady() : void
        {
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

        }

        private _task_list_table_calc_total(): void
        {
            var tbl: JQuery = $("#calc-task-list-table");

            var taskList: CalcTaskList = _calc_route_calculator.getTaskList();

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

        }

        private _init_google_map(): void
        {
            var mapOptions: google.maps.MapOptions = {
                zoom: 8,
                center: new google.maps.LatLng(55.76, 37.64), // Москва
                mapTypeId: google.maps.MapTypeId.ROADMAP
            }

            var map: google.maps.Map = new google.maps.Map($("#calc-google-map").get(0), mapOptions);
            _calc_route_calculator.setMap(map);
        }

        private _task_list_table_clear_selection(): void
        {
            $("#calc-task-list-table > tbody > tr").removeClass("calc-table-row-selected");
        }        

        private _route_table_clear_selection(): void
        {
            $("#calc-routes-table > tbody > tr").removeClass("calc-table-row-selected");
        } 
    }

}


var _calc_route_calculator: RouteCalculator.Calc = new RouteCalculator.Calc();
$(document).ready(RouteCalculator.CalcController.prototype.onDocumentReady);