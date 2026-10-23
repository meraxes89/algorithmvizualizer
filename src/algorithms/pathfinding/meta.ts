/**
 * Educational metadata for the pathfinding family.
 *
 * The metadata lives with the family — the registry entries in
 * `./index.ts` carry it as a required `meta` field — so an entry and its
 * explanation can no longer drift apart. This file replaced the
 * hand-keyed `pathfinding` section of the old `src/data/algorithmData.js`
 * database (which only ever covered A*); BFS, DFS and Dijkstra got their
 * content here, written against their generators in this folder.
 */

/** The educational companion of one pathfinding algorithm. */
export type PathfindingMeta = {
  /** Display name, identical to the registry entry's `name`. */
  name: string;
  /** One-sentence summary shown under the visualizer's title. */
  description: string;
  /** What the algorithm is for. */
  purpose: string;
  /** How the algorithm works, in prose. */
  workingPrinciple: string;
  /** Best-case time complexity. */
  bestCase: string;
  /** Average-case time complexity. */
  averageCase: string;
  /** Worst-case time complexity. */
  worstCase: string;
  /** Space complexity. */
  spaceComplexity: string;
  /** Where the algorithm is used. */
  applications: string[];
  /** What the algorithm does well. */
  advantages: string[];
  /** What the algorithm does poorly. */
  disadvantages: string[];
  /** Language-neutral pseudocode, one step per line. */
  pseudocode: string[];
  /** The same algorithm in the four languages the code viewer offers. */
  codeSnippets: {
    cpp: string;
    java: string;
    python: string;
    javascript: string;
  };
};

/** Metadata for every pathfinding algorithm, keyed by registry id. */
export const pathfindingMeta: Record<string, PathfindingMeta> = {
  bfs: {
    name: 'Breadth-First Search',
    description:
      'Breadth-First Search explores the grid ring by ring out of the start, so the first time it reaches the end it has found a shortest route.',
    purpose: 'To find a shortest path on a grid where every move costs the same.',
    workingPrinciple:
      "The search keeps a queue of discovered cells and expands them in the order they were discovered, recording each cell's predecessor at discovery time. Because cells are expanded in order of their distance from the start, the route traced back from the end is a shortest one.",
    bestCase: 'O(1)',
    averageCase: 'O(V+E)',
    worstCase: 'O(V+E)',
    spaceComplexity: 'O(V)',
    applications: [
      'Shortest routes in unweighted mazes and grids',
      'Level-order exploration of any graph',
      'Web crawlers that walk the web layer by layer',
      'Finding all cells within k moves of a source',
    ],
    advantages: [
      'Guaranteed shortest path when every move costs the same',
      'Simple: a plain queue and a predecessor map',
      'Complete: finds a route whenever one exists',
      'Reaches the closest goals first',
    ],
    disadvantages: [
      'Ignores move weights, so it is wrong on weighted grids',
      'The queue can hold a whole ring of cells at once',
      'Spreads in every direction instead of aiming at the goal',
      'Slower than guided searches like A* on open grids',
    ],
    pseudocode: [
      'procedure bfs(grid, start, end)',
      '  queue = [start]',
      '  discovered = {start}',
      '  previous = empty map',
      '  while queue is not empty do',
      '    current = queue.dequeue()',
      '    if current == end then',
      '      return reconstruct_path(previous, current)',
      '    end if',
      '    for neighbour of neighbours(current, grid) do',
      '      if neighbour not in discovered then',
      '        discovered.add(neighbour)',
      '        previous[neighbour] = current',
      '        queue.enqueue(neighbour)',
      '      end if',
      '    end for',
      '  end while',
      '  return no path',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `vector<Cell> bfs(Grid& grid, Cell start, Cell end) {
    queue<Cell> frontier;
    map<Cell, Cell> previous;
    set<Cell> discovered = {start};
    frontier.push(start);
    while (!frontier.empty()) {
        Cell current = frontier.front();
        frontier.pop();
        if (current == end) return reconstructPath(previous, current);
        for (const Cell& next : neighbours(current, grid)) {
            if (discovered.count(next)) continue;
            discovered.insert(next);
            previous[next] = current;
            frontier.push(next);
        }
    }
    return {};
}`,
      java: `List<Cell> bfs(Grid grid, Cell start, Cell end) {
    Deque<Cell> frontier = new ArrayDeque<>();
    Map<Cell, Cell> previous = new HashMap<>();
    Set<Cell> discovered = new HashSet<>(List.of(start));
    frontier.add(start);
    while (!frontier.isEmpty()) {
        Cell current = frontier.poll();
        if (current.equals(end)) return reconstructPath(previous, current);
        for (Cell next : neighbours(current, grid)) {
            if (!discovered.add(next)) continue;
            previous.put(next, current);
            frontier.add(next);
        }
    }
    return List.of();
}`,
      python: `from collections import deque

def bfs(grid, start, end):
    frontier = deque([start])
    discovered = {start}
    previous = {}
    while frontier:
        current = frontier.popleft()
        if current == end:
            return reconstruct_path(previous, current)
        for neighbour in neighbours(current, grid):
            if neighbour in discovered:
                continue
            discovered.add(neighbour)
            previous[neighbour] = current
            frontier.append(neighbour)
    return []`,
      javascript: `function bfs(grid, start, end) {
  const frontier = [start];
  const discovered = new Set([key(start)]);
  const previous = new Map();
  while (frontier.length > 0) {
    const current = frontier.shift();
    if (sameCell(current, end)) return reconstructPath(previous, current);
    for (const neighbour of neighbours(current, grid)) {
      const k = key(neighbour);
      if (discovered.has(k)) continue;
      discovered.add(k);
      previous.set(k, current);
      frontier.push(neighbour);
    }
  }
  return [];
}`,
    },
  },
  dfs: {
    name: 'Depth-First Search',
    description:
      'Depth-First Search dives down one branch of the grid before backtracking, so the route it reports is not necessarily the shortest one.',
    purpose: 'To explore every reachable cell of a grid, without any shortest-path guarantee.',
    workingPrinciple:
      'The search keeps a stack of discovered cells and always expands the most recently discovered one, following a single route deeper and deeper until it dead-ends, then backtracking. When the end is finally reached, the route is traced back through the predecessor map.',
    bestCase: 'O(1)',
    averageCase: 'O(V+E)',
    worstCase: 'O(V+E)',
    spaceComplexity: 'O(V)',
    applications: [
      'Solving and generating mazes',
      'Cycle detection and topological sorting',
      'Checking whether two cells are connected at all',
      'Exhausting a puzzle space such as Sudoku',
    ],
    advantages: [
      'Finds a route quickly when one happens to lie along the first branch',
      'Simple: a plain stack and a predecessor map',
      'Visits every reachable cell exactly once',
      'Reveals the structure of the grid, not just one route',
    ],
    disadvantages: [
      'No shortest-path guarantee: the route can be far longer than optimal',
      'Can spend a long time deep in a dead-end region',
      'Stack depth grows with how far the exploration wanders',
      'Aims at nothing, so it cannot be guided towards the goal',
    ],
    pseudocode: [
      'procedure dfs(grid, start, end)',
      '  stack = [start]',
      '  discovered = {start}',
      '  previous = empty map',
      '  while stack is not empty do',
      '    current = stack.pop()',
      '    if current == end then',
      '      return reconstruct_path(previous, current)',
      '    end if',
      '    for neighbour of neighbours(current, grid) do',
      '      if neighbour not in discovered then',
      '        discovered.add(neighbour)',
      '        previous[neighbour] = current',
      '        stack.push(neighbour)',
      '      end if',
      '    end for',
      '  end while',
      '  return no path',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `vector<Cell> dfs(Grid& grid, Cell start, Cell end) {
    vector<Cell> frontier;
    map<Cell, Cell> previous;
    set<Cell> discovered = {start};
    frontier.push_back(start);
    while (!frontier.empty()) {
        Cell current = frontier.back();
        frontier.pop_back();
        if (current == end) return reconstructPath(previous, current);
        for (const Cell& next : neighbours(current, grid)) {
            if (discovered.count(next)) continue;
            discovered.insert(next);
            previous[next] = current;
            frontier.push_back(next);
        }
    }
    return {};
}`,
      java: `List<Cell> dfs(Grid grid, Cell start, Cell end) {
    Deque<Cell> frontier = new ArrayDeque<>();
    Map<Cell, Cell> previous = new HashMap<>();
    Set<Cell> discovered = new HashSet<>(List.of(start));
    frontier.push(start);
    while (!frontier.isEmpty()) {
        Cell current = frontier.pop();
        if (current.equals(end)) return reconstructPath(previous, current);
        for (Cell next : neighbours(current, grid)) {
            if (!discovered.add(next)) continue;
            previous.put(next, current);
            frontier.push(next);
        }
    }
    return List.of();
}`,
      python: `def dfs(grid, start, end):
    frontier = [start]
    discovered = {start}
    previous = {}
    while frontier:
        current = frontier.pop()
        if current == end:
            return reconstruct_path(previous, current)
        for neighbour in neighbours(current, grid):
            if neighbour in discovered:
                continue
            discovered.add(neighbour)
            previous[neighbour] = current
            frontier.append(neighbour)
    return []`,
      javascript: `function dfs(grid, start, end) {
  const frontier = [start];
  const discovered = new Set([key(start)]);
  const previous = new Map();
  while (frontier.length > 0) {
    const current = frontier.pop();
    if (sameCell(current, end)) return reconstructPath(previous, current);
    for (const neighbour of neighbours(current, grid)) {
      const k = key(neighbour);
      if (discovered.has(k)) continue;
      discovered.add(k);
      previous.set(k, current);
      frontier.push(neighbour);
    }
  }
  return [];
}`,
    },
  },
  dijkstra: {
    name: "Dijkstra's Algorithm",
    description:
      "Dijkstra's Algorithm always expands the cheapest cell it knows about, which makes it the shortest-route search for grids where moves are weighted.",
    purpose:
      'To find the cheapest route on a grid with weighted cells, as long as no weight is negative.',
    workingPrinciple:
      'The search keeps a priority queue ordered by the cheapest total cost found so far and always expands the cheapest cell in it. When a neighbour turns out to be reachable more cheaply through the current cell, its recorded cost and predecessor are updated. The route is reconstructed from the predecessors once the end is expanded.',
    bestCase: 'O((V+E) log V)',
    averageCase: 'O((V+E) log V)',
    worstCase: 'O((V+E) log V)',
    spaceComplexity: 'O(V)',
    applications: [
      'Road navigation where roads have different lengths',
      'Network routing protocols with link costs',
      'Cheapest-route planning over weighted terrain',
      'Any grid where walls are expensive and roads are cheap',
    ],
    advantages: [
      'Optimal: reports the cheapest route with non-negative weights',
      'Respects move weights, unlike breadth-first search',
      'Costs can be tuned per cell, so terrain can be modelled',
      'The baseline that A* improves on with a heuristic',
    ],
    disadvantages: [
      'No sense of direction: it spreads around the start in every way',
      'Slower than A* on large open grids',
      'Requires non-negative weights to stay correct',
      'The priority queue adds a log factor to every step',
    ],
    pseudocode: [
      'procedure dijkstra(grid, start, end)',
      '  distance[start] = 0',
      '  frontier = priority queue ordered by distance',
      '  previous = empty map',
      '  while frontier is not empty do',
      '    current = frontier.pop_cheapest()',
      '    if current == end then',
      '      return reconstruct_path(previous, current)',
      '    end if',
      '    for neighbour of neighbours(current, grid) do',
      '      candidate = distance[current] + weight(neighbour)',
      '      if candidate < distance[neighbour] then',
      '        distance[neighbour] = candidate',
      '        previous[neighbour] = current',
      '        frontier.push(neighbour)',
      '      end if',
      '    end for',
      '  end while',
      '  return no path',
      'end procedure',
    ],
    codeSnippets: {
      cpp: `vector<Cell> dijkstra(Grid& grid, Cell start, Cell end) {
    priority_queue<Costed, vector<Costed>, greater<Costed>> frontier;
    map<Cell, int> distance;
    map<Cell, Cell> previous;
    distance[start] = 0;
    frontier.push({start, 0});
    while (!frontier.empty()) {
        Costed top = frontier.top();
        frontier.pop();
        if (top.cell == end) return reconstructPath(previous, end);
        for (const Cell& next : neighbours(top.cell, grid)) {
            int candidate = distance[top.cell] + weight(next);
            if (!distance.count(next) || candidate < distance[next]) {
                distance[next] = candidate;
                previous[next] = top.cell;
                frontier.push({next, candidate});
            }
        }
    }
    return {};
}`,
      java: `List<Cell> dijkstra(Grid grid, Cell start, Cell end) {
    PriorityQueue<Costed> frontier = new PriorityQueue<>(Comparator.comparingInt(c -> c.cost));
    Map<Cell, Integer> distance = new HashMap<>();
    Map<Cell, Cell> previous = new HashMap<>();
    distance.put(start, 0);
    frontier.add(new Costed(start, 0));
    while (!frontier.isEmpty()) {
        Costed top = frontier.poll();
        if (top.cell.equals(end)) return reconstructPath(previous, end);
        for (Cell next : neighbours(top.cell, grid)) {
            int candidate = distance.get(top.cell) + weight(next);
            if (candidate < distance.getOrDefault(next, Integer.MAX_VALUE)) {
                distance.put(next, candidate);
                previous.put(next, top.cell);
                frontier.add(new Costed(next, candidate));
            }
        }
    }
    return List.of();
}`,
      python: `import heapq

def dijkstra(grid, start, end):
    frontier = [(0, start)]
    distance = {start: 0}
    previous = {}
    while frontier:
        dist, current = heapq.heappop(frontier)
        if current == end:
            return reconstruct_path(previous, end)
        for neighbour in neighbours(current, grid):
            candidate = dist + weight(neighbour)
            if candidate < distance.get(neighbour, float('inf')):
                distance[neighbour] = candidate
                previous[neighbour] = current
                heapq.heappush(frontier, (candidate, neighbour))
    return []`,
      javascript: `function dijkstra(grid, start, end) {
  const frontier = [{ cell: start, cost: 0 }];
  const distance = new Map([[key(start), 0]]);
  const previous = new Map();
  while (frontier.length > 0) {
    frontier.sort((a, b) => a.cost - b.cost);
    const { cell: current, cost } = frontier.shift();
    if (sameCell(current, end)) return reconstructPath(previous, end);
    for (const neighbour of neighbours(current, grid)) {
      const candidate = cost + weight(neighbour);
      const known = distance.get(key(neighbour)) ?? Infinity;
      if (candidate < known) {
        distance.set(key(neighbour), candidate);
        previous.set(key(neighbour), current);
        frontier.push({ cell: neighbour, cost: candidate });
      }
    }
  }
  return [];
}`,
    },
  },
  astar: {
    name: 'A* Search',
    description:
      'A* Search is an informed search algorithm that uses heuristic functions to find the shortest path between start and goal nodes efficiently.',
    purpose:
      'To find the shortest path faster than Dijkstra by guiding the search towards the target using heuristics.',
    workingPrinciple:
      'A* calculates f(n) = g(n) + h(n) for each node, where g(n) is the cost from start and h(n) is the estimated cost to target (Manhattan distance). It expands nodes with the smallest f(n) first.',
    bestCase: 'O(1)',
    averageCase: 'O(E)',
    worstCase: 'O(b^d)',
    spaceComplexity: 'O(V)',
    applications: [
      'Video game pathing (NPC navigation)',
      'GPS navigation & mapping services',
      'Robotic motion planning',
    ],
    advantages: [
      'Optimal and complete (finds shortest path if admissible heuristic is used)',
      'Dramatically faster than Dijkstra on spatial grids',
    ],
    disadvantages: ['Memory intensive as it keeps all generated nodes in memory'],
    pseudocode: [
      'openSet = {startNode}',
      'while openSet is not empty:',
      '  current = node in openSet with lowest fScore',
      '  if current == goal: return reconstruct_path(current)',
      '  openSet.remove(current)',
      '  for neighbor of current:',
      '    tentative_g = gScore[current] + weight(current, neighbor)',
      '    if tentative_g < gScore[neighbor]:',
      '      cameFrom[neighbor] = current',
      '      gScore[neighbor] = tentative_g',
      '      fScore[neighbor] = gScore[neighbor] + h(neighbor, goal)',
      '      if neighbor not in openSet: openSet.add(neighbor)',
    ],
    codeSnippets: {
      cpp: `struct Node { int r, c, g, h; int f() const { return g + h; } };
int astar(Node start, Node goal) {
    priority_queue<Node> openSet;
    openSet.push(start);
    while(!openSet.empty()) {
        Node curr = openSet.top(); openSet.pop();
        if(curr.r == goal.r && curr.c == goal.c) return curr.g;
        // Expand 4-directional neighbors...
    }
    return -1;
}`,
      java: `public int astar(Node start, Node goal) {
    PriorityQueue<Node> openSet = new PriorityQueue<>((a, b) -> a.f() - b.f());
    openSet.add(start);
    while (!openSet.isEmpty()) {
        Node curr = openSet.poll();
        if (curr.r == goal.r && curr.c == goal.c) return curr.g;
        // Expand neighbors...
    }
    return -1;
}`,
      python: `import heapq
def astar(start, goal):
    open_set = []
    heapq.heappush(open_set, (0 + h(start, goal), 0, start))
    while open_set:
        f, g, curr = heapq.heappop(open_set)
        if curr == goal: return g
        # Expand neighbors...
    return -1`,
      javascript: `function astar(start, goal) {
    const openSet = [start];
    while (openSet.length) {
        openSet.sort((a, b) => a.f - b.f);
        const curr = openSet.shift();
        if (curr === goal) return curr.g;
        // Expand neighbors...
    }
    return -1;
}`,
    },
  },
};
