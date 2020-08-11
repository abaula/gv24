
///<reference path="Graph.ts"/>
///<reference path="Route.ts"/>
///<reference path="Collections.ts"/>


module Calculator
{
    /*
    Алгоритм верхнего уровня управляющий расчётами оптимального маршрута
    
    ЦЕЛЬ РАСЧЁТА - найти маршрут по которому можно перевезти максимальное количество груза из указанного с максимальной эффективностью,
    которая посчитана как - выручка / дистанция.

    Общая формула определения эффективности построенного маршрута:
    Эффективность маршрута = количество выполненных заданий на перевозку * (общая выручка / общая дистанция)
        
    */
    export class RouteCalculator
    {
        // список заданий на перевозку
        private _taskList: Routes.RouteTaskList;
        // ограничения применяемые при поиске пути
        private _restrictions: Routes.RouteRestrictions;
        // граф
        private _graph: Graph.UndirectedGraph;
        // коэффециент сохранения следа при испарении
        private _evaporationRate: number = 0.75;  //(испарение = 25%)
        // общее количество муравьёв в группе
        private _antCount: number = 1000;
        // Алгоритм останавливает работу если указанное количество муравьёв подряд не смогли найти более короткий маршрут
        private _stopAfter: number = 200;
        // список со значениями силы феромонового следа оставленного муравьями на посещённых рёбрах графа (edge.getId(), number)
        private _edgePheromones: Collections.Dictionary<number, number>;
        // построенный маршрут (отобран без учёта обратного пути)
        private _route: Routes.Route;
        // построенный маршрут (отобран с учётом обратного пути)
        private _routeWithWayBack: Routes.Route;

        constructor(taskList: Routes.RouteTaskList, restrictions: Routes.RouteRestrictions, graph: Graph.UndirectedGraph)
        {
            this._taskList = taskList;
            this._restrictions = restrictions;
            this._graph = graph;
            this._route = null;
            this._routeWithWayBack = null;
            this._edgePheromones = new Collections.Dictionary<number, number>();
        }

        getTaskList(): Routes.RouteTaskList
        {
            return this._taskList;
        }

        getRestrictions(): Routes.RouteRestrictions
        {
            return this._restrictions;
        }

        getGraph(): Graph.UndirectedGraph
        {
            return this._graph;
        }

        getRoute(): Routes.Route
        {
            return this._route;
        }

        getRouteWithWayBack(): Routes.Route
        {
            return this._routeWithWayBack;
        }


        calculateRoute(startVertex: Graph.GVertex): void
        {

            for (var a = 0; a <= 5; a++)
            {
                for (var b = 0; b <= 5; b++)
                {
                    this._initPheromones();
                    // счётчик неудачных попыток улучшить маршрут
                    var missCount: number = 0;

                    for (var i = 0; i < this._antCount; i++)
                    {
                        // Испаряем часть феромонов с рёбер
                        if (1 < i)
                            this._evaporatePheromones();

                        // Отправляем одного муравья в забег
                        var ant: Ant = new Ant(this, a, b);
                        var isRouteFound = ant.run(startVertex);

                        // Если муравей нашёл путь, то сохраняем результат
                        if (isRouteFound)
                        {
                            var route: Routes.Route = ant.getRoute();
                            // Добавляем феромоны на путь
                            this._addPheromones(route);

                            // пытаемся сохранить полученный маршрут
                            var better = this._tryUpdateRoute(route);

                            if (better)
                            {
                                // обнуляем счётчик неудачных попыток улучшить маршрут
                                missCount = 0;
                            }
                            else
                            {
                                // увеличиваем счётчик неудачных попыток улучшить маршрут
                                // и прекращаем дальнейшие попытки если превысили лимит
                                if (++missCount > this._stopAfter)
                                    break;
                            }
                        }
                    }
                }
            }
        }

        // сохраняет полученный маршрут, если он эффективнее
        private _tryUpdateRoute(route: Routes.Route): boolean
        {
            var result: boolean = false;


            // сохраняем более эффективный маршрут (эффективность посчитана без учёта обратного пути)
            if (null == this._route)
            {
                this._route = route;
                result = true;
            }
            else if (route.getEfficiency(false) > this._route.getEfficiency(false))
            {                
                this._route = route;
                result = true;
            }

            // сохраняем более эффективный маршрут (эффективность посчитана с учётом обратного пути)
            if (null == this._routeWithWayBack)
            {
                this._routeWithWayBack = route;
                result = true;
            }
            else if (route.getEfficiency(true) > this._routeWithWayBack.getEfficiency(true))
            {
                this._routeWithWayBack = route;
                result = true;
            }

            return result;
        }


        getPheromones(): Collections.Dictionary<number, number>
        {
            return this._edgePheromones;
        }

        // добавляем следы феромонов на рёбра графа по которым пробежал муравей и нашёл путь
        private _addPheromones(route: Routes.Route): void
        {
            // чем больше денег заработали и короче найденный путь, тем больше феромонов добавляем
            // формула: эффективность = выручка / расстояние
            var distance: number = route.getDistanse();
            var proceeds: number = route.getProceeds();
            var pheromoneValue: number = proceeds / distance;
            var entries: Routes.RouteEntry[] = route.getEntries();

            for (var i = 0; i < entries.length; i++)
            {
                var entry: Routes.RouteEntry = entries[i];
                var edge: Graph.GEdge = entry.getEdge();
                var curValue: number = this._edgePheromones.getValue(edge.getId());
                curValue += pheromoneValue;
                this._edgePheromones.setValue(edge.getId(), curValue);
            }

        } 

        // обнуляет веса феромонового следа для всех рёбер графа
        private _initPheromones(): void
        {
            this._edgePheromones.clear();

            var edges: Graph.GEdge[] = this._graph.getEdges();

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];
                this._edgePheromones.setValue(edge.getId(), 0.0);
            }
        }

        // испаряем часть феромонов
        private _evaporatePheromones(): void
        {
            var keys: number[] = this._edgePheromones.keys();

            for (var i = 0; i < keys.length; i++)
            {
                var key = keys[i];
                var curValue: number = this._edgePheromones.getValue(key);
                // испаряем установленную часть следа
                curValue *= this._evaporationRate;
                this._edgePheromones.setValue(key, curValue);
            }
        }
    }

    /*
        Класс "муравей" сущность модели расчёта оптимального маршрута на основе генетического алгоритма "Муравьиный алгоритм"
    */
    class Ant
    {
        // ссылка на объект класса RouteCalculator
        private _calculator: RouteCalculator;
        // список посещённых вершин
        private _visitedVertices: Collections.Dictionary<number, Graph.GVertex>;
        // список выполняемых в текущий момент заданий на перевозку
        private _commitedTasks: Collections.Dictionary<number, Routes.RouteTask>;
        // Размер эллипса, для поиска попутных точек маршрутов
        private _ellipseSize: number = 0.2;
        // коэффициент Alpha, влияет на выбор муравьём очередного ребра для перехода
        private _alpha: number;
        // коэффициент Beta, влияет на выбор муравьём очередного ребра для перехода
        private _beta: number;
        // данные о текущей загрузке муравья - вес
        private _curWeight: number;
        // данные о текущей загрузке муравья - объём
        private _curValue: number;
        // построенный маршрут
        private _route: Routes.Route;

        constructor(calculator: RouteCalculator, alpha: number, beta: number)
        {
            this._calculator = calculator;
            this._alpha = alpha;
            this._beta = beta;
            this._curWeight = 0;
            this._curValue = 0;
            this._route = new Routes.Route();

            this._commitedTasks = new Collections.Dictionary<number, Routes.RouteTask>();
            this._visitedVertices = new Collections.Dictionary<number, Graph.GVertex>();
        }

        // муравей ищет путь
        run(vertex: Graph.GVertex): boolean
        {
            while (null != vertex)
            {
                // обрабатываем событие посещения вершины A (загружаем муравья)
                var routeEntry: Routes.RouteEntry = this._handleVertexAVisited(vertex);
                // отмечаем вершину как посещённую
                this._visitedVertices.setValue(vertex.getId(), vertex);
                // получаем список возможных путей
                var edges: Graph.GEdge[] = this._getAccessibleEdges(vertex);

                if (1 > edges.length)
                {
                    // создаём путь домой и выходим
                    this._addBackHomeEntry();
                    break;        
                }
                else
                {
                    // получаем следующую вершину ребра маршрута
                    var edge: Graph.GEdge = this._selectEdgeToMove(vertex, edges);
                    vertex = edge.getAnotherVertex(vertex);
                    // обрабатываем событие посещения вершины Б (разгружаем муравья)
                    this._handleVertexBVisited(vertex, edge, routeEntry);
                    // сохраняем часть маршрута
                    this._route.addEntry(routeEntry);
                }
            }

            return true;
        }

        // Находится ли задание в работе
        private _isRouteTaskCommited(task: Routes.RouteTask): boolean
        {
            var commited: boolean = this._commitedTasks.containsKey(task.getId());

            return commited;
        }

        // добавляем отдельно в Route.Route отдельный Route.RouteEntry из последней точки маршрута к первой точке маршрута
        private _addBackHomeEntry(): void
        {
            var startVertex: Graph.GVertex = this._route.getStartVertex();
            var endVertex: Graph.GVertex = this._route.getEndVertex();

            var edges: Graph.GEdge[] = endVertex.getEdges();

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];

                var anotherVertex: Graph.GVertex = edge.getAnotherVertex(endVertex);

                if (anotherVertex.isEqual(startVertex))
                {
                    var entry: Routes.RouteEntry = new Routes.RouteEntry();
                    entry.setEdge(edge);
                    this._route.setWayBackEntry(entry);                    
                    break;
                }
            }
        }

        getRoute(): Routes.Route
        {
            return this._route;
        }

        // обработка события загрузки муравья, принятые к исполнению задания сохраняются в списке
        // если объём загрузки превышает лимиты, обрабатывает конфликт и помещает конфликтные маршруты в список Route.RouteEntry._excludedTasks
        private _handleVertexAVisited(vertex: Graph.GVertex): Routes.RouteEntry
        {
            var entry: Routes.RouteEntry = new Routes.RouteEntry();

            ///////////////////////////////////////////////////////////
            // выбираем все задания, для которых данная вершина является начальной точкой перевозки
            var selectedTaskList: Collections.Dictionary<number, Routes.RouteTask> = new Collections.Dictionary<number, Routes.RouteTask>();

            var vertexTasks: Routes.RouteTask[] = vertex.getRouteTasks();
            var valueToLoad: number = 0;
            var weightToLoad: number = 0;

            for (var i = 0; i < vertexTasks.length; i++)
            {
                var task: Routes.RouteTask = vertexTasks[i];

                if (task.getVertexA().isEqual(vertex))
                {
                    selectedTaskList.setValue(task.getId(), task);
                    // подсчитываем суммарные значения груза подлежащего загрузке
                    valueToLoad += task.getValue();
                    weightToLoad += task.getWeight();
                }
            }

            var selectedTasks: Routes.RouteTask[] = selectedTaskList.values();

            ///////////////////////////////////////////////////////////
            // проверяем наличие конфликта по объёму и весу
            var valueLimit: number = this._calculator.getRestrictions().getMaxValue();
            var weightLimit: number = this._calculator.getRestrictions().getMaxWeight();
            
            // расчитываем значения перевозимого муравьём объёма и веса после погрузки всех заданий
            var valueAfterLoad: number = this._curValue + valueToLoad;
            var weightAfterLoad: number = this._curWeight + weightToLoad;

            if (valueAfterLoad > valueLimit || weightAfterLoad > weightLimit)
            {
                // обрабатываем конфликт
                var commitedTasks: Routes.RouteTask[] = this._resolveLoadingConflictByCriteria(selectedTasks);

                // если не удалось ничего погрузить по правилам разрешения конфликтов, то пытаемся погрузить хоть что-нибудь
                if (1 > commitedTasks.length)
                {
                    commitedTasks = this._resolveLoadingConflictByLoadingStrategy(selectedTasks);
                }

                // удаляем все принятые задания из общего списка заданий, в итоге в нём останутся только не принятые задания
                for (var i = 0; i < commitedTasks.length; i++)
                {
                    var task: Routes.RouteTask = commitedTasks[i];
                    selectedTaskList.remove(task.getId());
                }

                // после разрешения кофликта вносим в список все исключённые задания
                selectedTasks = selectedTaskList.values();

                for (var i = 0; i < selectedTasks.length; i++)
                {
                    var task: Routes.RouteTask = selectedTasks[i];
                    entry.addExcludedTask(task);
                }

                // правим ссылку на список принятых в работу заданий для дальнейшего использования
                selectedTasks = commitedTasks;
            }

            // принимаем в работу все задания, которые остались после обработки конфликта
            valueToLoad = 0;
            weightToLoad = 0;

            for (var i = 0; i < selectedTasks.length; i++)
            {
                var task: Routes.RouteTask = selectedTasks[i];
                // отмечаем принятые в работы задания
                this._commitedTasks.setValue(task.getId(), task);
                // отмечаем принятые в работы задания в части маршрута
                entry.addCommitedTask(task);

                valueToLoad += task.getValue();
                weightToLoad += task.getWeight();
            }

            // обновляем текущие вес и объём перевозимые муравьём
            this._curValue += valueToLoad;
            this._curWeight += weightToLoad;

            return entry;  
        }


        // обработка события разгрузки муравья
        private _handleVertexBVisited(vertex: Graph.GVertex, edge: Graph.GEdge, routeEntry: Routes.RouteEntry): void
        {
            // сохраняем ребро
            routeEntry.setEdge(edge);

            ///////////////////////////////////////////////////////////
            // выбираем все задания, для которых данная вершина является конечной точкой перевозки
            // помещаем их в список выполненных заданий и разгружаем муравья
            var vertexTasks: Routes.RouteTask[] = vertex.getRouteTasks();
            var valueToUnload: number = 0;
            var weightToUnload: number = 0;

            for (var i = 0; i < vertexTasks.length; i++)
            {
                var task: Routes.RouteTask = vertexTasks[i];

                if (task.getVertexB().isEqual(vertex))
                {
                    // если задание не было принято в работу, то пропускаем его
                    if (false == this._commitedTasks.containsKey(task.getId()))
                        continue;

                    // вносим в маршрут только те задания, которые были приняты в работу
                    // удаляем принятое ранее в работу задание из списка
                    this._commitedTasks.remove(task.getId());
                    // вносим выполненное задание в часть маршрута
                    routeEntry.addFulfiledTask(task);
                    // уменьшаем текущие значения загрузки муравья
                    this._curValue -= task.getValue();
                    this._curWeight -= task.getWeight();
                }
            }
        }


        // разрешаем конфликт при загрузке согласно установленным правилам, возвращаем задания, которые можно принять в работу
        private _resolveLoadingConflictByCriteria(tasks: Routes.RouteTask[]): Routes.RouteTask[]
        {
            // получаем правила
            var criteria: Routes.ConflictResolveCriteria = this._calculator.getRestrictions().getConflictResolveCriteria();

            // сортируем по убыванию максимальной выручки
            if (Routes.ConflictResolveCriteria.MaxProceeds == criteria)
                tasks.sort(this._compareTaskForProceeds);

            // сортируем по убыванию максимальной стоимости за 1 км пути (максимальная прибыльность)
            if (Routes.ConflictResolveCriteria.MaxProfit == criteria)
                tasks.sort(this._compareTaskForProfit);

            // получаем список заданий которые можно взять в работу
            var acceptableTasks: Routes.RouteTask[] = this._pickupTasksWithLimits(tasks);

            return acceptableTasks;
        }

        // разрешаем конфликт при загрузке согласно стратегии загрузки, возвращаем задания, которые можно принять в работу
        private _resolveLoadingConflictByLoadingStrategy(tasks: Routes.RouteTask[]): Routes.RouteTask[]
        {
            // получаем правила
            var strategy: Routes.LoadingStrategy = this._calculator.getRestrictions().getLoadingStrategy();

            // сортируем по возрастанию объёма
            if (Routes.LoadingStrategy.SavingValue == strategy)
                tasks.sort(this._compareTaskForSaveValue);

            // сортируем по возрастанию массы
            if (Routes.LoadingStrategy.SavingWeight == strategy)
                tasks.sort(this._compareTaskForSaveWeight);

            // получаем список заданий которые можно взять в работу
            var acceptableTasks: Routes.RouteTask[] = this._pickupTasksWithLimits(tasks);

            return acceptableTasks;
        }

        // выбираем задачи в соответствии с установленным лимитом
        private _pickupTasksWithLimits(tasks: Routes.RouteTask[]): Routes.RouteTask[]
        {
            // рассчитываем лимиты на погрузку
            var valueLimit: number = this._calculator.getRestrictions().getMaxValue();
            var weightLimit: number = this._calculator.getRestrictions().getMaxWeight();
            valueLimit -= this._curValue;
            weightLimit -= this._curWeight; 

            var result: Routes.RouteTask[] = [];

            for (var i = 0; i < tasks.length; i++)
            {
                var task: Routes.RouteTask = tasks[i];
                valueLimit -= task.getValue();
                weightLimit -= task.getWeight();

                // если превысили лимит, то останавливаемся
                if (0 > valueLimit || 0 > weightLimit)
                    break;

                result.push(task);
            }

            return result;
        }

        


        // для сортировки заданий по критерию выручки - по убыванию
        private _compareTaskForProceeds(a: Routes.RouteTask, b: Routes.RouteTask): number
        {
            if (a.getPrice() < b.getPrice())
                return 1;

            if (a.getPrice() > b.getPrice())
                return -1;

            return 0;
        }

        // для сортировки заданий по критерию прибыльности - по убыванию
        private _compareTaskForProfit(a: Routes.RouteTask, b: Routes.RouteTask): number
        {
            if (a.getProfit() < b.getProfit())
                return 1;

            if (a.getProfit() > b.getProfit())
                return -1;

            return 0;
        }

        // для сортировки заданий по критерию экономии объёма - по возрастанию
        private _compareTaskForSaveValue(a: Routes.RouteTask, b: Routes.RouteTask): number
        {
            if (a.getValue() > b.getValue())
                return 1;

            if (a.getValue() < b.getValue())
                return -1;

            return 0;
        }

        // для сортировки заданий по критерию экономии веса (грузоподьёмности) - по возрастанию
        private _compareTaskForSaveWeight(a: Routes.RouteTask, b: Routes.RouteTask): number
        {
            if (a.getWeight() > b.getWeight())
                return 1;

            if (a.getWeight() < b.getWeight())
                return -1;

            return 0;
        }


        /*
            Возвращает все доступные для перехода точки маршрута
            с учётом ограничений

        ==========================
        ???? МАНИФЕСТ ????

        1) Составляем список возможных рёбер ранжируя по статусам: от "возможный для перехода", до "под вопросом для перехода"
         - Возможный для перехода - все рёбра ведущие к вершинам, при прибытии в которые не будет пропущен груз.
         - Под вопросом для перехода - все рёбра ведущие к вершинам при прибытии в которые будет пропущен груз.

        2) Если в списке нет вершин "возможный для перехода", то оставляем только одно ребро, переход по которому приведёт к минимальным потерям
        относительно других возможных переходов, а именно - эффективность маршрута начатого в этой вершине, должна быть больше чем эффективность пропущенного маршрута

        */
        private _getAccessibleEdges(vertex: Graph.GVertex): Graph.GEdge[]
        {
            var result: Graph.GEdge[] = [];
            // список рёбер возможных для перехода 
            var arr1: Graph.GEdge[] = [];
            // список рёбер под вопросом для перехода
            var arr2: Graph.GEdge[] = [];

            ////////////////////////////////////////////////////////
            // добавляем в результат доступные для посещения рёбра
            var edges: Graph.GEdge[] = vertex.getEdges();

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];
                var nextV: Graph.GVertex = edge.getAnotherVertex(vertex);

                // исключаем вершины, которые уже посещали
                if (this._visitedVertices.containsKey(nextV.getId()))
                    continue;

                // для кажого ребра определены 2 возможных состояния после перехода по ребру:
                // 1) маршруты пропущены не будут
                // 1.1) можно выгрузить груз
                var canUnload: boolean = false;
                // 1.2) можно загрузить груз полностью
                var canLoadAll: boolean = false;
                // 2) будут пропущены маршруты
                // 2.1) можно загрузить груз частично
                var canLoadPart: boolean = false;
                // 2.2) приедем в конец маршрута не посетив его начало
                var skipRoute: boolean = false;

                // лимиты на погрузку
                var valueLimit: number = this._calculator.getRestrictions().getMaxValue();
                var weightLimit: number = this._calculator.getRestrictions().getMaxWeight();

                // загрузка накапливается итогом
                var valueAfterLoad: number = 0;
                var weightAfterLoad: number = 0;


                // получаем список заданий для вершины перехода
                var vertexTasks: Routes.RouteTask[] = nextV.getRouteTasks();

                for (var j = 0; j < vertexTasks.length; j++)
                {
                    var task: Routes.RouteTask = vertexTasks[j];

                    //////////////////////////////////////////////////
                    // сможем ли выгрузить груз в вершине перехода?
                    if (task.getVertexB().isEqual(nextV))
                    {
                        if (this._isRouteTaskCommited(task))
                            canUnload = true;
                        else
                            skipRoute = true;
                    }

                    //////////////////////////////////////////////////
                    // сможем ли принять груз в вершине перехода?
                    if (task.getVertexA().isEqual(nextV))
                    {
                        // будем грузится в вершине, узнаем превысим лимиты или нет
                        valueAfterLoad += this._curValue + task.getValue();
                        weightAfterLoad += this._curWeight + task.getWeight();

                        if (valueAfterLoad <= valueLimit && weightAfterLoad <= weightLimit)
                        {
                            canLoadAll = true;
                            canLoadPart = false;
                        }
                        else
                        {
                            if (canLoadAll)
                                canLoadPart = true;    

                            canLoadAll = false;
                        }
                    }
                }
                
                // можем загрузиться или разгрузиться ничего не пропустив  
                if ((canLoadAll || canUnload) && !skipRoute)
                    arr1.push(edge);                
                // можем загрузиться или разгрузиться пропустив маршрут
                else if ((canLoadAll || canUnload) && skipRoute)
                    arr2.push(edge);
                // можем загрузиться частично, а значит пропускаем маршрут
                else if (canLoadPart)
                    arr2.push(edge);                   
            }

            // формируем результат
            if (0 < arr1.length)
                result = arr1;
            else if(0 < arr2.length)
            {
                var effEdge: Graph.GEdge = this._getEffectiveEdge(vertex, arr2);
                result.push(effEdge);
            }

            return result;
        }

        // выбираем ребро с наибольшей эффективностью из возможных, согласно установленных правил разрешения конфликтов
        private _getEffectiveEdge(vertex: Graph.GVertex, edges: Graph.GEdge[]): Graph.GEdge
        {
            var result: Graph.GEdge = null;
            // сначала присваиваем самое малое значение
            var criteriaMaxValue: number = -1 * Number.MAX_VALUE;

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];
                var nextV: Graph.GVertex = edge.getAnotherVertex(vertex);
                var criteriaValue: number = this._getProfitForVertex(nextV);

                if (criteriaValue > criteriaMaxValue)
                {
                    criteriaMaxValue = criteriaValue;
                    result = edge;
                } 
            }

            return result;
        }

        // получить оценку выгоды посещения вершины
        // рассчитывается как сумма выгод или выручки (в зависитмости от настроек разрешения конфликтов) всех заданий, которые могут быть начаты в вершине за вычетом
        // сумма выгод или выручки всех заданий, которые будут пропущены из за посещения вершины
        private _getProfitForVertex(vertex: Graph.GVertex): number
        {
            var result: number = 0;
            var confResolveCriteria: Routes.ConflictResolveCriteria = this._calculator.getRestrictions().getConflictResolveCriteria();

            // получаем список заданий для вершины перехода
            var vertexTasks: Routes.RouteTask[] = vertex.getRouteTasks();

            for (var j = 0; j < vertexTasks.length; j++)
            {
                var task: Routes.RouteTask = vertexTasks[j];
                var curValue: number = 0;

                if (Routes.ConflictResolveCriteria.MaxProceeds == confResolveCriteria)
                    curValue = task.getPrice();
                else if (Routes.ConflictResolveCriteria.MaxProfit == confResolveCriteria)
                    curValue = task.getProfit();

                if (task.getVertexA().isEqual(vertex))
                {
                    result += curValue;
                }
                else if (task.getVertexB().isEqual(vertex))
                {
                    // если задание не в работе, значит мы его пропустим посетив указанную вершину
                    if (!this._isRouteTaskCommited(task))
                        result -= curValue;
                }
            }

            return result;
        }

        // выбираем следующее ребро по которому будем двигаться
        private _selectEdgeToMove(vertex: Graph.GVertex, edges: Graph.GEdge[]): Graph.GEdge
        {
            var pheromones: Collections.Dictionary<number, number> = this._calculator.getPheromones();                

            // расчитываем числители
            var numerators: number[] = [];
            var denominator: number = 0;

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];
                var pheromoneE: number = pheromones.getValue(edge.getId());

                //////////////////////////////////////
                // расчитаем вес вершины
                // Правило: чем меньше вес вершины, тем больше шансов она получает при выборе
                var edgeWeight = edge.getDistance();

                // учитываем приоритет вершины (3 - самый высокий приоритет)
                // 3 = могу разгрузится и взять груз
                // 2 = могу только взять груз
                // 1 = могу только разгрузиться
                var nextVertex: Graph.GVertex = edge.getAnotherVertex(vertex);                                

                if (nextVertex.hasRouteTaskRole(Graph.GVertexTaskRole.All))
                {
                    edgeWeight /= 3;
                }
                else if (nextVertex.hasRouteTaskRole(Graph.GVertexTaskRole.Loading))
                {
                    edgeWeight /= 2;
                }
                
                var a1: number = Math.pow(pheromoneE, this._alpha);
                var a2: number = 1 / Math.pow(edgeWeight, this._beta);
                var numerator: number = a1 + a2;

                numerators.push(numerator);
                denominator += numerator;
            }

            ////////////////////////////////////////////
            // рассчитываем возможности для каждого ребра (сумма всех возможностей ~ 1.0, +- погрешность при операциях с плавающей точкой)

            var possibilities: number[] = [];

            for (var i = 0; i < numerators.length; i++)
            {
                var numerator: number = numerators[i];
                var pos: number = numerator / denominator;
                possibilities.push(pos);
            }

            //////////////////////////////////////////////
            // Теперь кидаем кубик и смотрим куда он попал
            var randNum: number = Math.random();
            // По умолчанию выбираем последнюю вершину в массиве edges (нивелируем погрешность при операциях с плавающей точкой)
            var choosenEdge: Graph.GEdge = edges[possibilities.length - 1];
            var pos2: number = 0;

            for (var i = 0; i < possibilities.length; i++)
            {
                pos2 += possibilities[i];

                if (randNum < pos2)
                {
                    choosenEdge = edges[i];
                    break;
                }
            }

            // Находим вершину с приоритетом, если такая есть
            // Вершина с приоритетом - точка разгрузки лежащая на пути выбранного ребра, точнее сказать рядом, в эллипсе установленной величины
            // Смысл такой - если едем мимо точки разгрузки, то нужно немного отклониться и разгрузить муравья
            choosenEdge = this._getEdgeWithPriority(choosenEdge, vertex, edges);

            // TODO если заехали в попутную точку, то нужно решить отмечаем её как посещённую или нет
            // - если забрали весь груз из попутной точки и не пропустили из-за посещения не один маршрут, то снова заезжать не имеет смысла
            // - иначе (остался незагруженный груз, или точка в которой завершаются другие маршруты) не отмечаем эту точку как посещённую, позже заедем ещё раз

            return choosenEdge;
        }

        private _getEdgeWithPriority(choosenEdge: Graph.GEdge, startVertex: Graph.GVertex, edges: Graph.GEdge[]): Graph.GEdge       
        {
            var resultEdges: Graph.GEdge[] = [];
            var endVertex: Graph.GVertex = choosenEdge.getAnotherVertex(startVertex);

            // создаём эллипс для поиска входящих точек
            var ellipse: GEOEllipse = new GEOEllipse(startVertex.getGeoPoint(), endVertex.getGeoPoint(), this._ellipseSize);

            /////////////////////////////////////////////////////////////////////////
            // Если есть точки разгрузки в элипсе, то выберем ближайшую из найденных
            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];

                if (choosenEdge.getId() == edge.getId())
                    continue;

                var v: Graph.GVertex = edge.getAnotherVertex(startVertex);

                ///////////////////////////////////////
                /// Если вершина v - это конечная точка маршрута и начальная точка маршрута уже пройдена (муравей загружен), 
                /// то проверяем находится ли эта вершина в элипсе
                /// 
                if(v.hasRouteTaskRole(Graph.GVertexTaskRole.Unloading))
                {
                    if (this._hasVertexAnyCommitedTask(v, Graph.GVertexTaskRole.Unloading))
                    {
                        // находится ли точка в элипсе?
                        var inEllipse: boolean = ellipse.isPointInEllipse(v.getGeoPoint());

                        if (inEllipse)
                            resultEdges.push(edge);                            
                    }   
                }
            }

            // Если нашли ребра с приоритетом, то выберем ближайшее
            if (0 < resultEdges.length)
                choosenEdge = this._getMinDistanceEdge(resultEdges);

            return choosenEdge;
        }

        // возвращает вершину с минимальным расстоянием
        private _getMinDistanceEdge(edges: Graph.GEdge[]): Graph.GEdge
        {
            var result: Graph.GEdge = null;
            var distance: number = 0;

            for (var i = 0; i < edges.length; i++)
            {
                var edge: Graph.GEdge = edges[i];

                if (0 == distance || distance > edge.getDistance())
                {
                    distance = edge.getDistance();
                    result = edge;
                }
            }

            return result;
        }

        // проверяет что указанная вершина связана с задачами, которые выполняются в данный момент
        // связь вершины с задачами должна соответствовать указанной роли 
        private _hasVertexAnyCommitedTask(vertex: Graph.GVertex, vertexRole: Graph.GVertexTaskRole): boolean
        {
            var result: boolean = false;
            var tasks: Routes.RouteTask[] = vertex.getRouteTasksForRole(vertexRole);

            for (var i = 0; i < tasks.length; i++)
            {
                var task: Routes.RouteTask = tasks[i];
                var commited: boolean = this._isRouteTaskCommited(task);

                if (commited)
                {
                    result = true;
                    break;
                }
            }

            return result;
        }
        

    }

    class GEOEllipse
    {
        private DE2RA: number = 0.01745329252;
        private AVG_ERAD: number = 6371.0;

        private _f1: Graph.GEOPoint;
        private _f2: Graph.GEOPoint;
        private _dPrc: number;
        private _2a: number;


        constructor(f1: Graph.GEOPoint, f2: Graph.GEOPoint, dPrc: number)
        {
            this._f1 = f1.clone();
            this._f2 = f2.clone();
            this._dPrc = dPrc;
            this._2a = this._calculate2A();
        }

        private _calculate2A(): number
        {
            var len2C: number = this._getGCDistance(this._f1, this._f2);
            var delta: number = len2C * this._dPrc;

            return len2C + delta;
        }

        private _getGCDistance(p1: Graph.GEOPoint, p2: Graph.GEOPoint): number
        {
            var point1: Graph.GEOPoint = p1.clone();
            var point2: Graph.GEOPoint = p2.clone();

            point1.setLatitude(point1.getLatitude() * this.DE2RA);
            point1.setLongitude(point1.getLongitude() * this.DE2RA);

            point2.setLatitude(point2.getLatitude() * this.DE2RA);
            point2.setLongitude(point2.getLongitude() * this.DE2RA);

            var d: number = Math.sin(point1.getLatitude())
                * Math.sin(point2.getLatitude())
                + Math.cos(point1.getLatitude())
                * Math.cos(point2.getLatitude())
                * Math.cos(point1.getLongitude() - point2.getLongitude());

            return (this.AVG_ERAD * Math.acos(d));
        }

        isPointInEllipse(point: Graph.GEOPoint): boolean
        {
            var r1: number = this._getGCDistance(this._f1, point);
            var r2: number = this._getGCDistance(this._f2, point);
            var t2A: number = r1 + r2;

            return t2A < this._2a;
        }
    }

}