# 🗺 Laboratorio — Modelo de Redes en una Ciudad Real
## Aplicación de Algoritmos de Grafos sobre Potosí, Bolivia

> **Asignatura:** Investigación Operativa / Estructura de Datos  
> **Plataforma:** Vite + TypeScript + Canvas  
> **Mapa real:** Ciudad de Potosí, Bolivia (datos OpenStreetMap)

---

## 1. Introducción

Este laboratorio utiliza una aplicación real que convierte el mapa de calles de **Potosí, Bolivia** en un grafo computacional. Cada intersección o punto de la calle es un **vértice (nodo)** y cada segmento de calle es una **arista (edge)** con peso igual a la distancia en píxeles del canvas.

El objetivo es que experimentes con algoritmos clásicos de redes sobre un problema del mundo real: **¿cómo fluye el tráfico en una ciudad? ¿dónde están los cuellos de botella?**

### Estructura del proyecto

```
src/
├── main.ts                    ← Punto de entrada, aquí activas los algoritmos
├── graph/
│   ├── Vertex.ts              ← Clase Nodo (label, x, y, vecinos, distancia...)
│   ├── Edge.ts                ← Clase Arista (source, destination, weight)
│   └── paths/
│       ├── Bfs.ts             ← Búsqueda en anchura (BFS)
│       ├── Dfs.ts             ← Búsqueda en profundidad (DFS)
│       ├── Dijkstra.ts        ← Camino más corto (Dijkstra)
│       ├── Prim.ts            ← Árbol de expansión mínimo (Prim)
│       └── FordFulkerson.ts   ← Flujo máximo / Corte mínimo
└── graph-ui/
    ├── index.ts               ← Carga el GeoJSON y construye el grafo
    ├── utils.ts               ← Funciones auxiliares (delay, distancia, drawCircle)
    └── city.json              ← Datos reales de calles de Potosí (OpenStreetMap)
```

---

## 2. Cómo ejecutar el proyecto

```bash
yarn  install
yarn  dev
```

Abre el navegador en `http://localhost:5173`.  
Usa el panel de zoom y el **arrastre del mouse** para navegar el mapa.  
Haz **clic sobre cualquier nodo** para ver su información en el tooltip.

---

## 3. Cómo activar un algoritmo

Abre `src/main.ts`. Al final del archivo encontrarás estas líneas comentadas:

```typescript
// ── Activa el algoritmo que quieras probar ─────────────────────────────
//Bfs(startVertex);
//Dfs(startVertex);
//Prim(startVertex);
//Dijkstra(startVertex);

// Ford-Fulkerson: define source and sink vertices
const sourceVertex = startVertex;
const sinkVertex = Object.values(graph)[Object.values(graph).length - 1];
FordFulkerson(sourceVertex, sinkVertex).then((result) => { ... });
```

**Para activar un algoritmo:**
1. Comenta la línea del Ford-Fulkerson que está activa (o déjala)
2. Descomenta la línea del algoritmo que quieres ejecutar
3. Guarda el archivo — Vite recarga automáticamente

### Cambiar el vértice de inicio

El vértice de inicio está fijado en:

```typescript
const startVertex = graph[''];
```

La **clave** de cada vértice es su posición en canvas: `"x_y"`.  
Para encontrar la clave de cualquier nodo, **haz clic sobre él** en el mapa → el tooltip muestra `Canvas X` y `Canvas Y`. La clave es `"X_Y"` exacto.

---

## 4. Algoritmos disponibles

### 4.1 BFS — Búsqueda en Anchura

**Archivo:** `src/graph/paths/Bfs.ts`

Explora el grafo nivel por nivel usando una **cola (queue)**. Visita primero todos los vecinos directos, luego sus vecinos, y así sucesivamente.

**En el contexto de la ciudad:** Simula cómo se propaga una señal (o una noticia, o una orden de evacuación) desde un punto central hacia toda la red de calles.

**Activación en `main.ts`:**
```typescript
Bfs(startVertex);
```

**Lo que verás:** Los nodos se van pintando en rojo desde el origen hacia afuera, nivel a nivel.

**Preguntas para reflexionar:**
- ¿Cuántos niveles tiene el grafo desde el centro de Potosí?
- ¿Qué zonas de la ciudad quedan más "lejos" en número de saltos?

---

### 4.2 DFS — Búsqueda en Profundidad

**Archivo:** `src/graph/paths/Dfs.ts`

Explora el grafo siguiendo un camino hasta el final antes de retroceder. Usa **recursión**.

**En el contexto de la ciudad:** Simula un recorrido donde siempre se avanza por la misma calle hasta no poder continuar, luego se regresa.

**Activación en `main.ts`:**
```typescript
Dfs(startVertex);
```

**Preguntas para reflexionar:**
- Compara visualmente BFS vs DFS. ¿Cuál "cubre" mejor el mapa?
- ¿Hay calles que DFS nunca visita desde cierto origen? ¿Por qué?

---

### 4.3 Dijkstra — Camino Más Corto

**Archivo:** `src/graph/paths/Dijkstra.ts`

Encuentra el **camino de menor peso** entre dos vértices. Usa etiquetas temporales/permanentes (método de Dijkstra clásico).

**En el contexto de la ciudad:** Responde la pregunta: *"¿Cuál es la ruta más corta (en distancia) para ir del punto A al punto B en Potosí?"*

**Activación en `main.ts`:**
```typescript
Dijkstra(startVertex);                     // Solo desde origen (sin destino fijo)
Dijkstra(startVertex, targetVertex);       // Origen → Destino específico
```

Para definir un destino, primero encuentra su clave haciendo clic en el nodo:
```typescript
const targetVertex = graph['CANVAS_X_CANVAS_Y'];
Dijkstra(startVertex, targetVertex);
```

**Lo que verás:**
- Nodos visitados se pintan en rojo a medida que se procesan
- El camino mínimo final se dibuja en **amarillo**
- En la consola del navegador (`F12 → Console`) verás las etiquetas `[distancia, predecesor]` de cada nodo

**Preguntas para reflexionar:**
- ¿Cuál es la distancia más larga encontrada en el mapa?
- ¿Existe algún nodo "inalcanzable" desde el origen? ¿Qué nos dice eso del grafo?
- ¿Coincide el camino más corto en distancia con la ruta que intuitivamente elegirías en el mapa?

---

### 4.4 Prim — Árbol de Expansión Mínima (MST)

**Archivo:** `src/graph/paths/Prim.ts`

Construye el **árbol de expansión mínima**: conecta todos los nodos del grafo usando la menor suma de pesos posible, sin ciclos.

**En el contexto de la ciudad:** Responde: *"¿Cuáles son las calles esenciales para mantener conectada toda la ciudad con el menor costo total?"* Es útil para planificar infraestructura (tuberías, cables de fibra óptica, rutas de emergencia).

**Activación en `main.ts`:**
```typescript
Prim(startVertex);
```

**Lo que verás:** Las aristas del MST se dibujan en **verde** sobre el mapa.

**Preguntas para reflexionar:**
- ¿Cuántas aristas tiene el MST comparado con el total de aristas del grafo?
- ¿Las calles del MST coinciden con las calles principales de Potosí?
- Si una calle del MST se cierra, ¿qué pasa con la conectividad de la ciudad?

---

### 4.5 Ford-Fulkerson — Flujo Máximo y Cuello de Botella

**Archivo:** `src/graph/paths/FordFulkerson.ts`

Calcula el **flujo máximo** que puede pasar de una fuente (origen) a un sumidero (destino) en la red. Usa la variante **Edmonds-Karp** (BFS para encontrar caminos aumentantes).

**En el contexto de la ciudad:** Responde: *"¿Cuánto tráfico máximo puede fluir desde la zona A hasta la zona B? ¿Dónde se generan los cuellos de botella?"*

**Activación en `main.ts`** (ya activo por defecto):
```typescript
const sourceVertex = startVertex;
const sinkVertex = Object.values(graph)[Object.values(graph).length - 1];
FordFulkerson(sourceVertex, sinkVertex).then((result) => {
    console.log('[FF] Max Flow:', result.maxFlow);
    console.log('[FF] Augmenting paths:', result.augmentingPaths);
    console.log('[FF] Min-cut edges:', result.minCutEdges);
});
```

**Lo que verás en el canvas:**
- Cada **camino aumentante** se dibuja en un color diferente (HSL rotando)
- Cerca del punto medio de cada camino aparece el número de iteración y su **bottleneck**: `#3 bn:45.2`
- Las **aristas del corte mínimo** (cuellos de botella reales) se dibujan en **rojo punteado**

**Lo que verás en la consola (`F12`):**
```
[FF] Starting Ford-Fulkerson from "500.5_450.1" to "...último nodo..."
[FF] Iter 1 | Path: A → B → C → D | Bottleneck: 87.3 | Cumulative flow: 87.3
[FF] Iter 2 | Path: A → E → F → D | Bottleneck: 45.1 | Cumulative flow: 132.4
...
[FF] ── RESULT ──────────────────────────────────
[FF] Max Flow: 215.7
[FF] Min-cut edges:
  nodo_X → nodo_Y  (capacity: 98.4)
  nodo_W → nodo_Z  (capacity: 117.3)
```

**Interpretación del Corte Mínimo:**
> Las aristas en rojo punteado son las **calles críticas** de Potosí. Si esas calles se cierran (por un accidente, construcción, o desastre), el flujo de tráfico entre origen y destino cae a **cero**. Son los verdaderos cuellos de botella de la red vial.

**Preguntas para reflexionar:**
- ¿En qué zonas del mapa aparecen las aristas rojas del corte mínimo?
- ¿Son calles angostas, puentes, o cruces de una sola vía?
- ¿Cuántos caminos aumentantes encontró el algoritmo? ¿Qué representa cada uno?
- Cambia el par origen-destino y observa: ¿cambian los cuellos de botella?

---

## 5. Escenario de Análisis — Cuellos de Botella en Potosí

### Escenario 1: Centro → Periferia

**Objetivo:** Analizar cuánto flujo puede salir del centro histórico hacia los barrios periféricos.

**Pasos:**
1. Ejecuta la aplicación
2. Haz clic en un nodo cercano al **mercado central** → anota su clave `"X_Y"`
3. Haz clic en un nodo en la **periferia del mapa** → anota su clave
4. En `main.ts` configura:
```typescript
const sourceVertex = graph['CLAVE_CENTRO'];
const sinkVertex   = graph['CLAVE_PERIFERIA'];
FordFulkerson(sourceVertex, sinkVertex).then(result => {
    console.log('Max Flow:', result.maxFlow);
    console.log('Cuellos de botella:', result.minCutEdges.length, 'aristas críticas');
});
```
5. Observa el canvas y la consola
6. Registra los resultados en la tabla de la sección 6

### Escenario 2: Comparar rutas con Dijkstra

**Objetivo:** Contrastar el camino más corto (Dijkstra) con las rutas de flujo máximo (Ford-Fulkerson).

**Pasos:**
1. Con el mismo par origen-destino, ejecuta primero **Dijkstra** (observa camino amarillo)
2. Comenta Dijkstra, descomenta Ford-Fulkerson
3. Compara: ¿el camino de Dijkstra pasa por las aristas del corte mínimo? ¿Por qué sí o no?

### Escenario 3: Infraestructura mínima con Prim

**Objetivo:** Identificar las calles "esenciales" de Potosí.

**Pasos:**
1. Ejecuta **Prim** desde el nodo central
2. Observa las aristas verdes (MST)
3. Compara: ¿las aristas rojas del corte mínimo (Ford-Fulkerson) están dentro del MST?

---

## 6. Tabla de Resultados

Completa esta tabla para cada experimento:

| # | Algoritmo | Origen (clave) | Destino (clave) | Resultado clave | Observación |
|---|-----------|---------------|-----------------|-----------------|-------------|
| 1 | Ford-Fulkerson | | | Max Flow = ___ | Min-cut aristas = ___ |
| 2 | Dijkstra | | | Distancia = ___ | Nodos visitados = ___ |
| 3 | Prim | | — | Aristas MST = ___ | Peso total = ___ |
| 4 | BFS | | — | Niveles = ___ | Zona más lejana = ___ |
| 5 | Ford-Fulkerson | | | Max Flow = ___ | ¿Cambió el cuello de botella? |

---

## 7. Cómo leer el Tooltip de un Nodo

Al hacer **clic** sobre cualquier punto del mapa aparece un panel con:

| Campo | Significado |
|-------|-------------|
| **Label** | Clave única del nodo: `"canvasX_canvasY"` — úsala en el código |
| **Canvas X / Y** | Posición en píxeles del canvas (1–6000 / 1–5000) |
| **Vecinos** | Número de aristas salientes (grado del nodo) |
| **Visitado** | `Sí` si el último algoritmo pasó por este nodo |
| **Distancia** | Distancia acumulada calculada por Dijkstra |
| **Predecesor** | Nodo anterior en el camino más corto (Dijkstra) |

---

## 8. Cómo leer la Consola del Navegador

Abre las **DevTools** con `F12` → pestaña **Console**.

- **Dijkstra** imprime cada nodo al volverse permanente: `Permanente: label [dist, pred]*`
- **Ford-Fulkerson** imprime cada iteración con el path, bottleneck y flujo acumulado
- Al terminar Ford-Fulkerson imprime el resumen con las aristas del corte mínimo

---

## 9. Preguntas de Cierre

1. **¿Qué diferencia hay entre "camino más corto" y "flujo máximo"?** ¿Pueden existir en la misma ruta?

2. **¿Por qué el MST de Prim no es necesariamente la solución al problema de rutas de tráfico?**

3. **Si el municipio de Potosí quisiera colocar semáforos inteligentes para reducir la congestión, ¿en qué calles los ubicarías basándote en los resultados de Ford-Fulkerson?**

4. **¿Qué pasaría con el flujo máximo si se construye una nueva calle paralela a una arista del corte mínimo?** Modifica el grafo en `city.json` o en `graph-ui/index.ts` y compruébalo.

5. **BFS y DFS recorren todos los nodos. ¿Cuál usarías para un sistema de alerta de emergencias en la ciudad? ¿Por qué?**

---

## 10. Extensiones (trabajo opcional)

- **Cambiar pesos:** En `graph-ui/index.ts`, la función `calculateDistance` asigna el peso. Modifícala para simular calles con distinto nivel de tráfico (multiplica por un factor aleatorio).
- **Nuevo GeoJSON:** El archivo `src/graph-ui/stcz.json` contiene datos de **Santa Cruz de la Sierra**. Cambia la importación en `graph-ui/index.ts` para analizar esa ciudad.
- **Guardar resultados:** Modifica `FordFulkerson.ts` para exportar los resultados a un archivo JSON usando `JSON.stringify(result.minCutEdges)`.
- **Visualización de flujo:** En cada arista del canvas, dibuja el valor de flujo neto calculado por Ford-Fulkerson.

---

*Datos geográficos: © OpenStreetMap contributors — Potosí, Bolivia*
