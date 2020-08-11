///<reference path="Graph.ts"/>
///<reference path="Route.ts"/>
///<reference path="Collections.ts"/>
var Calculator;
(function (Calculator) {
    /*
    Алгоритм верхнего уровня управляющий расчётами оптимального маршрута
    
    ЦЕЛЬ РАСЧЁТА - найти маршрут по которому можно перевезти максимальное количество груза из указанного с максимальной эффективностью,
    которая посчитана как - выручка / дистанция.
    
    Общая формула определения эффективности построенного маршрута:
    Эффективность маршрута = количество выполненных заданий на перевозку * (общая выручка / общая дистанция)
    
    */
    var RouteCalculator = (function () {
        function RouteCalculator(taskList, restrictions, graph) {
            // коэффециент сохранения следа при испарении
            this._evaporationRate = 0.75;
            // общее количество муравьёв в группе
            this._antCount = 1000;
            // Алгоритм останавливает работу если указанное количество муравьёв подряд не смогли найти более короткий маршрут
            this._stopAfter = 200;
            this._taskList = taskList;
            this._restrictions = restrictions;
            this._graph = graph;
            this._route = null;
            this._routeWithWayBack = null;
            this._edgePheromones = new Collections.Dictionary();
        }
        RouteCalculator.prototype.getTaskList = function () {
            return this._taskList;
        };

        RouteCalculator.prototype.getRestrictions = function () {
            return this._restrictions;
        };

        RouteCalculator.prototype.getGraph = function () {
            return this._graph;
        };

        RouteCalculator.prototype.getRoute = function () {
            return this._route;
        };

        RouteCalculator.prototype.getRouteWithWayBack = function () {
            return this._routeWithWayBack;
        };

        RouteCalculator.prototype.calculateRoute = function (startVertex) {
            for (var a = 0; a <= 5; a++) {
                for (var b = 0; b <= 5; b++) {
                    this._initPheromones();

                    // счётчик неудачных попыток улучшить маршрут
                    var missCount = 0;

                    for (var i = 0; i < this._antCount; i++) {
                        if (1 < i)
                            this._evaporatePheromones();

                        // Отправляем одного муравья в забег
                        var ant = new Ant(this, a, b);
                        var isRouteFound = ant.run(startVertex);

                        if (isRouteFound) {
                            var route = ant.getRoute();

                            // Добавляем феромоны на путь
                            this._addPheromones(route);

                            // пытаемся сохранить полученный маршрут
                            var better = this._tryUpdateRoute(route);

                            if (better) {
                                // обнуляем счётчик неудачных попыток улучшить маршрут
                                missCount = 0;
                            } else {
                                if (++missCount > this._stopAfter)
                                    break;
                            }
                        }
                    }
                }
            }
        };

        // сохраняет полученный маршрут, если он эффективнее
        RouteCalculator.prototype._tryUpdateRoute = function (route) {
            var result = false;

            if (null == this._route) {
                this._route = route;
                result = true;
            } else if (route.getEfficiency(false) > this._route.getEfficiency(false)) {
                this._route = route;
                result = true;
            }

            if (null == this._routeWithWayBack) {
                this._routeWithWayBack = route;
                result = true;
            } else if (route.getEfficiency(true) > this._routeWithWayBack.getEfficiency(true)) {
                this._routeWithWayBack = route;
                result = true;
            }

            return result;
        };

        RouteCalculator.prototype.getPheromones = function () {
            return this._edgePheromones;
        };

        // добавляем следы феромонов на рёбра графа по которым пробежал муравей и нашёл путь
        RouteCalculator.prototype._addPheromones = function (route) {
            // чем больше денег заработали и короче найденный путь, тем больше феромонов добавляем
            // формула: эффективность = выручка / расстояние
            var distance = route.getDistanse();
            var proceeds = route.getProceeds();
            var pheromoneValue = proceeds / distance;
            var entries = route.getEntries();

            for (var i = 0; i < entries.length; i++) {
                var entry = entries[i];
                var edge = entry.getEdge();
                var curValue = this._edgePheromones.getValue(edge.getId());
                curValue += pheromoneValue;
                this._edgePheromones.setValue(edge.getId(), curValue);
            }
        };

        // обнуляет веса феромонового следа для всех рёбер графа
        RouteCalculator.prototype._initPheromones = function () {
            this._edgePheromones.clear();

            var edges = this._graph.getEdges();

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                this._edgePheromones.setValue(edge.getId(), 0.0);
            }
        };

        // испаряем часть феромонов
        RouteCalculator.prototype._evaporatePheromones = function () {
            var keys = this._edgePheromones.keys();

            for (var i = 0; i < keys.length; i++) {
                var key = keys[i];
                var curValue = this._edgePheromones.getValue(key);

                // испаряем установленную часть следа
                curValue *= this._evaporationRate;
                this._edgePheromones.setValue(key, curValue);
            }
        };
        return RouteCalculator;
    })();
    Calculator.RouteCalculator = RouteCalculator;

    /*
    Класс "муравей" сущность модели расчёта оптимального маршрута на основе генетического алгоритма "Муравьиный алгоритм"
    */
    var Ant = (function () {
        function Ant(calculator, alpha, beta) {
            // Размер эллипса, для поиска попутных точек маршрутов
            this._ellipseSize = 0.2;
            this._calculator = calculator;
            this._alpha = alpha;
            this._beta = beta;
            this._curWeight = 0;
            this._curValue = 0;
            this._route = new Routes.Route();

            this._commitedTasks = new Collections.Dictionary();
            this._visitedVertices = new Collections.Dictionary();
        }
        // муравей ищет путь
        Ant.prototype.run = function (vertex) {
            while (null != vertex) {
                // обрабатываем событие посещения вершины A (загружаем муравья)
                var routeEntry = this._handleVertexAVisited(vertex);

                // отмечаем вершину как посещённую
                this._visitedVertices.setValue(vertex.getId(), vertex);

                // получаем список возможных путей
                var edges = this._getAccessibleEdges(vertex);

                if (1 > edges.length) {
                    // создаём путь домой и выходим
                    this._addBackHomeEntry();
                    break;
                } else {
                    // получаем следующую вершину ребра маршрута
                    var edge = this._selectEdgeToMove(vertex, edges);
                    vertex = edge.getAnotherVertex(vertex);

                    // обрабатываем событие посещения вершины Б (разгружаем муравья)
                    this._handleVertexBVisited(vertex, edge, routeEntry);

                    // сохраняем часть маршрута
                    this._route.addEntry(routeEntry);
                }
            }

            return true;
        };

        // Находится ли задание в работе
        Ant.prototype._isRouteTaskCommited = function (task) {
            var commited = this._commitedTasks.containsKey(task.getId());

            return commited;
        };

        // добавляем отдельно в Route.Route отдельный Route.RouteEntry из последней точки маршрута к первой точке маршрута
        Ant.prototype._addBackHomeEntry = function () {
            var startVertex = this._route.getStartVertex();
            var endVertex = this._route.getEndVertex();

            var edges = endVertex.getEdges();

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];

                var anotherVertex = edge.getAnotherVertex(endVertex);

                if (anotherVertex.isEqual(startVertex)) {
                    var entry = new Routes.RouteEntry();
                    entry.setEdge(edge);
                    this._route.setWayBackEntry(entry);
                    break;
                }
            }
        };

        Ant.prototype.getRoute = function () {
            return this._route;
        };

        // обработка события загрузки муравья, принятые к исполнению задания сохраняются в списке
        // если объём загрузки превышает лимиты, обрабатывает конфликт и помещает конфликтные маршруты в список Route.RouteEntry._excludedTasks
        Ant.prototype._handleVertexAVisited = function (vertex) {
            var entry = new Routes.RouteEntry();

            ///////////////////////////////////////////////////////////
            // выбираем все задания, для которых данная вершина является начальной точкой перевозки
            var selectedTaskList = new Collections.Dictionary();

            var vertexTasks = vertex.getRouteTasks();
            var valueToLoad = 0;
            var weightToLoad = 0;

            for (var i = 0; i < vertexTasks.length; i++) {
                var task = vertexTasks[i];

                if (task.getVertexA().isEqual(vertex)) {
                    selectedTaskList.setValue(task.getId(), task);

                    // подсчитываем суммарные значения груза подлежащего загрузке
                    valueToLoad += task.getValue();
                    weightToLoad += task.getWeight();
                }
            }

            var selectedTasks = selectedTaskList.values();

            ///////////////////////////////////////////////////////////
            // проверяем наличие конфликта по объёму и весу
            var valueLimit = this._calculator.getRestrictions().getMaxValue();
            var weightLimit = this._calculator.getRestrictions().getMaxWeight();

            // расчитываем значения перевозимого муравьём объёма и веса после погрузки всех заданий
            var valueAfterLoad = this._curValue + valueToLoad;
            var weightAfterLoad = this._curWeight + weightToLoad;

            if (valueAfterLoad > valueLimit || weightAfterLoad > weightLimit) {
                // обрабатываем конфликт
                var commitedTasks = this._resolveLoadingConflictByCriteria(selectedTasks);

                if (1 > commitedTasks.length) {
                    commitedTasks = this._resolveLoadingConflictByLoadingStrategy(selectedTasks);
                }

                for (var i = 0; i < commitedTasks.length; i++) {
                    var task = commitedTasks[i];
                    selectedTaskList.remove(task.getId());
                }

                // после разрешения кофликта вносим в список все исключённые задания
                selectedTasks = selectedTaskList.values();

                for (var i = 0; i < selectedTasks.length; i++) {
                    var task = selectedTasks[i];
                    entry.addExcludedTask(task);
                }

                // правим ссылку на список принятых в работу заданий для дальнейшего использования
                selectedTasks = commitedTasks;
            }

            // принимаем в работу все задания, которые остались после обработки конфликта
            valueToLoad = 0;
            weightToLoad = 0;

            for (var i = 0; i < selectedTasks.length; i++) {
                var task = selectedTasks[i];

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
        };

        // обработка события разгрузки муравья
        Ant.prototype._handleVertexBVisited = function (vertex, edge, routeEntry) {
            // сохраняем ребро
            routeEntry.setEdge(edge);

            ///////////////////////////////////////////////////////////
            // выбираем все задания, для которых данная вершина является конечной точкой перевозки
            // помещаем их в список выполненных заданий и разгружаем муравья
            var vertexTasks = vertex.getRouteTasks();
            var valueToUnload = 0;
            var weightToUnload = 0;

            for (var i = 0; i < vertexTasks.length; i++) {
                var task = vertexTasks[i];

                if (task.getVertexB().isEqual(vertex)) {
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
        };

        // разрешаем конфликт при загрузке согласно установленным правилам, возвращаем задания, которые можно принять в работу
        Ant.prototype._resolveLoadingConflictByCriteria = function (tasks) {
            // получаем правила
            var criteria = this._calculator.getRestrictions().getConflictResolveCriteria();

            if (Routes.ConflictResolveCriteria.MaxProceeds == criteria)
                tasks.sort(this._compareTaskForProceeds);

            if (Routes.ConflictResolveCriteria.MaxProfit == criteria)
                tasks.sort(this._compareTaskForProfit);

            // получаем список заданий которые можно взять в работу
            var acceptableTasks = this._pickupTasksWithLimits(tasks);

            return acceptableTasks;
        };

        // разрешаем конфликт при загрузке согласно стратегии загрузки, возвращаем задания, которые можно принять в работу
        Ant.prototype._resolveLoadingConflictByLoadingStrategy = function (tasks) {
            // получаем правила
            var strategy = this._calculator.getRestrictions().getLoadingStrategy();

            if (Routes.LoadingStrategy.SavingValue == strategy)
                tasks.sort(this._compareTaskForSaveValue);

            if (Routes.LoadingStrategy.SavingWeight == strategy)
                tasks.sort(this._compareTaskForSaveWeight);

            // получаем список заданий которые можно взять в работу
            var acceptableTasks = this._pickupTasksWithLimits(tasks);

            return acceptableTasks;
        };

        // выбираем задачи в соответствии с установленным лимитом
        Ant.prototype._pickupTasksWithLimits = function (tasks) {
            // рассчитываем лимиты на погрузку
            var valueLimit = this._calculator.getRestrictions().getMaxValue();
            var weightLimit = this._calculator.getRestrictions().getMaxWeight();
            valueLimit -= this._curValue;
            weightLimit -= this._curWeight;

            var result = [];

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                valueLimit -= task.getValue();
                weightLimit -= task.getWeight();

                if (0 > valueLimit || 0 > weightLimit)
                    break;

                result.push(task);
            }

            return result;
        };

        // для сортировки заданий по критерию выручки - по убыванию
        Ant.prototype._compareTaskForProceeds = function (a, b) {
            if (a.getPrice() < b.getPrice())
                return 1;

            if (a.getPrice() > b.getPrice())
                return -1;

            return 0;
        };

        // для сортировки заданий по критерию прибыльности - по убыванию
        Ant.prototype._compareTaskForProfit = function (a, b) {
            if (a.getProfit() < b.getProfit())
                return 1;

            if (a.getProfit() > b.getProfit())
                return -1;

            return 0;
        };

        // для сортировки заданий по критерию экономии объёма - по возрастанию
        Ant.prototype._compareTaskForSaveValue = function (a, b) {
            if (a.getValue() > b.getValue())
                return 1;

            if (a.getValue() < b.getValue())
                return -1;

            return 0;
        };

        // для сортировки заданий по критерию экономии веса (грузоподьёмности) - по возрастанию
        Ant.prototype._compareTaskForSaveWeight = function (a, b) {
            if (a.getWeight() > b.getWeight())
                return 1;

            if (a.getWeight() < b.getWeight())
                return -1;

            return 0;
        };

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
        Ant.prototype._getAccessibleEdges = function (vertex) {
            var result = [];

            // список рёбер возможных для перехода
            var arr1 = [];

            // список рёбер под вопросом для перехода
            var arr2 = [];

            ////////////////////////////////////////////////////////
            // добавляем в результат доступные для посещения рёбра
            var edges = vertex.getEdges();

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var nextV = edge.getAnotherVertex(vertex);

                if (this._visitedVertices.containsKey(nextV.getId()))
                    continue;

                // для кажого ребра определены 2 возможных состояния после перехода по ребру:
                // 1) маршруты пропущены не будут
                // 1.1) можно выгрузить груз
                var canUnload = false;

                // 1.2) можно загрузить груз полностью
                var canLoadAll = false;

                // 2) будут пропущены маршруты
                // 2.1) можно загрузить груз частично
                var canLoadPart = false;

                // 2.2) приедем в конец маршрута не посетив его начало
                var skipRoute = false;

                // лимиты на погрузку
                var valueLimit = this._calculator.getRestrictions().getMaxValue();
                var weightLimit = this._calculator.getRestrictions().getMaxWeight();

                // загрузка накапливается итогом
                var valueAfterLoad = 0;
                var weightAfterLoad = 0;

                // получаем список заданий для вершины перехода
                var vertexTasks = nextV.getRouteTasks();

                for (var j = 0; j < vertexTasks.length; j++) {
                    var task = vertexTasks[j];

                    if (task.getVertexB().isEqual(nextV)) {
                        if (this._isRouteTaskCommited(task))
                            canUnload = true;
else
                            skipRoute = true;
                    }

                    if (task.getVertexA().isEqual(nextV)) {
                        // будем грузится в вершине, узнаем превысим лимиты или нет
                        valueAfterLoad += this._curValue + task.getValue();
                        weightAfterLoad += this._curWeight + task.getWeight();

                        if (valueAfterLoad <= valueLimit && weightAfterLoad <= weightLimit) {
                            canLoadAll = true;
                            canLoadPart = false;
                        } else {
                            if (canLoadAll)
                                canLoadPart = true;

                            canLoadAll = false;
                        }
                    }
                }

                if ((canLoadAll || canUnload) && !skipRoute)
                    arr1.push(edge);
else if ((canLoadAll || canUnload) && skipRoute)
                    arr2.push(edge);
else if (canLoadPart)
                    arr2.push(edge);
            }

            if (0 < arr1.length)
                result = arr1;
else if (0 < arr2.length) {
                var effEdge = this._getEffectiveEdge(vertex, arr2);
                result.push(effEdge);
            }

            return result;
        };

        // выбираем ребро с наибольшей эффективностью из возможных, согласно установленных правил разрешения конфликтов
        Ant.prototype._getEffectiveEdge = function (vertex, edges) {
            var result = null;

            // сначала присваиваем самое малое значение
            var criteriaMaxValue = -1 * Number.MAX_VALUE;

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var nextV = edge.getAnotherVertex(vertex);
                var criteriaValue = this._getProfitForVertex(nextV);

                if (criteriaValue > criteriaMaxValue) {
                    criteriaMaxValue = criteriaValue;
                    result = edge;
                }
            }

            return result;
        };

        // получить оценку выгоды посещения вершины
        // рассчитывается как сумма выгод или выручки (в зависитмости от настроек разрешения конфликтов) всех заданий, которые могут быть начаты в вершине за вычетом
        // сумма выгод или выручки всех заданий, которые будут пропущены из за посещения вершины
        Ant.prototype._getProfitForVertex = function (vertex) {
            var result = 0;
            var confResolveCriteria = this._calculator.getRestrictions().getConflictResolveCriteria();

            // получаем список заданий для вершины перехода
            var vertexTasks = vertex.getRouteTasks();

            for (var j = 0; j < vertexTasks.length; j++) {
                var task = vertexTasks[j];
                var curValue = 0;

                if (Routes.ConflictResolveCriteria.MaxProceeds == confResolveCriteria)
                    curValue = task.getPrice();
else if (Routes.ConflictResolveCriteria.MaxProfit == confResolveCriteria)
                    curValue = task.getProfit();

                if (task.getVertexA().isEqual(vertex)) {
                    result += curValue;
                } else if (task.getVertexB().isEqual(vertex)) {
                    if (!this._isRouteTaskCommited(task))
                        result -= curValue;
                }
            }

            return result;
        };

        // выбираем следующее ребро по которому будем двигаться
        Ant.prototype._selectEdgeToMove = function (vertex, edges) {
            var pheromones = this._calculator.getPheromones();

            // расчитываем числители
            var numerators = [];
            var denominator = 0;

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];
                var pheromoneE = pheromones.getValue(edge.getId());

                //////////////////////////////////////
                // расчитаем вес вершины
                // Правило: чем меньше вес вершины, тем больше шансов она получает при выборе
                var edgeWeight = edge.getDistance();

                // учитываем приоритет вершины (3 - самый высокий приоритет)
                // 3 = могу разгрузится и взять груз
                // 2 = могу только взять груз
                // 1 = могу только разгрузиться
                var nextVertex = edge.getAnotherVertex(vertex);

                if (nextVertex.hasRouteTaskRole(Graph.GVertexTaskRole.All)) {
                    edgeWeight /= 3;
                } else if (nextVertex.hasRouteTaskRole(Graph.GVertexTaskRole.Loading)) {
                    edgeWeight /= 2;
                }

                var a1 = Math.pow(pheromoneE, this._alpha);
                var a2 = 1 / Math.pow(edgeWeight, this._beta);
                var numerator = a1 + a2;

                numerators.push(numerator);
                denominator += numerator;
            }

            ////////////////////////////////////////////
            // рассчитываем возможности для каждого ребра (сумма всех возможностей ~ 1.0, +- погрешность при операциях с плавающей точкой)
            var possibilities = [];

            for (var i = 0; i < numerators.length; i++) {
                var numerator = numerators[i];
                var pos = numerator / denominator;
                possibilities.push(pos);
            }

            //////////////////////////////////////////////
            // Теперь кидаем кубик и смотрим куда он попал
            var randNum = Math.random();

            // По умолчанию выбираем последнюю вершину в массиве edges (нивелируем погрешность при операциях с плавающей точкой)
            var choosenEdge = edges[possibilities.length - 1];
            var pos2 = 0;

            for (var i = 0; i < possibilities.length; i++) {
                pos2 += possibilities[i];

                if (randNum < pos2) {
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
        };

        Ant.prototype._getEdgeWithPriority = function (choosenEdge, startVertex, edges) {
            var resultEdges = [];
            var endVertex = choosenEdge.getAnotherVertex(startVertex);

            // создаём эллипс для поиска входящих точек
            var ellipse = new GEOEllipse(startVertex.getGeoPoint(), endVertex.getGeoPoint(), this._ellipseSize);

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];

                if (choosenEdge.getId() == edge.getId())
                    continue;

                var v = edge.getAnotherVertex(startVertex);

                if (v.hasRouteTaskRole(Graph.GVertexTaskRole.Unloading)) {
                    if (this._hasVertexAnyCommitedTask(v, Graph.GVertexTaskRole.Unloading)) {
                        // находится ли точка в элипсе?
                        var inEllipse = ellipse.isPointInEllipse(v.getGeoPoint());

                        if (inEllipse)
                            resultEdges.push(edge);
                    }
                }
            }

            if (0 < resultEdges.length)
                choosenEdge = this._getMinDistanceEdge(resultEdges);

            return choosenEdge;
        };

        // возвращает вершину с минимальным расстоянием
        Ant.prototype._getMinDistanceEdge = function (edges) {
            var result = null;
            var distance = 0;

            for (var i = 0; i < edges.length; i++) {
                var edge = edges[i];

                if (0 == distance || distance > edge.getDistance()) {
                    distance = edge.getDistance();
                    result = edge;
                }
            }

            return result;
        };

        // проверяет что указанная вершина связана с задачами, которые выполняются в данный момент
        // связь вершины с задачами должна соответствовать указанной роли
        Ant.prototype._hasVertexAnyCommitedTask = function (vertex, vertexRole) {
            var result = false;
            var tasks = vertex.getRouteTasksForRole(vertexRole);

            for (var i = 0; i < tasks.length; i++) {
                var task = tasks[i];
                var commited = this._isRouteTaskCommited(task);

                if (commited) {
                    result = true;
                    break;
                }
            }

            return result;
        };
        return Ant;
    })();

    var GEOEllipse = (function () {
        function GEOEllipse(f1, f2, dPrc) {
            this.DE2RA = 0.01745329252;
            this.AVG_ERAD = 6371.0;
            this._f1 = f1.clone();
            this._f2 = f2.clone();
            this._dPrc = dPrc;
            this._2a = this._calculate2A();
        }
        GEOEllipse.prototype._calculate2A = function () {
            var len2C = this._getGCDistance(this._f1, this._f2);
            var delta = len2C * this._dPrc;

            return len2C + delta;
        };

        GEOEllipse.prototype._getGCDistance = function (p1, p2) {
            var point1 = p1.clone();
            var point2 = p2.clone();

            point1.setLatitude(point1.getLatitude() * this.DE2RA);
            point1.setLongitude(point1.getLongitude() * this.DE2RA);

            point2.setLatitude(point2.getLatitude() * this.DE2RA);
            point2.setLongitude(point2.getLongitude() * this.DE2RA);

            var d = Math.sin(point1.getLatitude()) * Math.sin(point2.getLatitude()) + Math.cos(point1.getLatitude()) * Math.cos(point2.getLatitude()) * Math.cos(point1.getLongitude() - point2.getLongitude());

            return (this.AVG_ERAD * Math.acos(d));
        };

        GEOEllipse.prototype.isPointInEllipse = function (point) {
            var r1 = this._getGCDistance(this._f1, point);
            var r2 = this._getGCDistance(this._f2, point);
            var t2A = r1 + r2;

            return t2A < this._2a;
        };
        return GEOEllipse;
    })();
})(Calculator || (Calculator = {}));
//# sourceMappingURL=Calculator.js.map
