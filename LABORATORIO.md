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

#### 🚑 Caso Real — SEDES Potosí: Despacho de Ambulancias

> **Contexto:** El Servicio Departamental de Salud (SEDES) de Potosí gestiona el despacho de ambulancias desde el **Hospital General Daniel Bracamonte** — el principal centro hospitalario de la ciudad, ubicado en la zona central. Ante una llamada de emergencia, el operador debe responder en segundos:
>
> *"¿Cuál es la ruta más rápida para que la ambulancia llegue al paciente, navegando por las calles angostas y empinadas de Potosí?"*

Las calles coloniales de Potosí presentan un desafío único: trazado irregular, pendientes pronunciadas, calles de apenas 3–4 metros de ancho y numerosas vías de un solo sentido. La ruta "más corta visualmente" en el mapa casi nunca coincide con el camino de menor distancia real calculado por el algoritmo.

Dijkstra resuelve exactamente esto: a partir del nodo Hospital, expande etiquetas hacia todos los nodos del grafo encontrando la distancia mínima garantizada a cualquier intersección de la ciudad.

##### Pasos para simular el despacho

1. Identifica el nodo más cercano al **Hospital Daniel Bracamonte** (Av. Antofagasta, zona central). Haz clic sobre él en el mapa → anota su clave `"X_Y"`.
2. En `main.ts` define el origen:
   ```typescript
   const startVertex = graph['CLAVE_HOSPITAL'];
   ```
3. Identifica el nodo de destino (simula una dirección de emergencia). Haz clic → anota su clave.
4. Activa Dijkstra con destino específico:
   ```typescript
   const targetVertex = graph['CLAVE_EMERGENCIA'];
   Dijkstra(startVertex, targetVertex);
   ```
5. Observa la consola (`F12`) al terminar. Verás algo como:
   ```
   Permanente: 1240.5_980.2 [dist: 312.4, pred: 1180.0_950.1]
   Permanente: 1300.1_1010.8 [dist: 378.9, pred: 1240.5_980.2]
   ...
   [Dijkstra] Destino alcanzado | Distancia total: 1 854.3 px
   ```

##### Conversión a distancia real y tiempo estimado

El canvas usa la misma escala que en el caso COTAP:

$$1 \text{ píxel (canvas)} \approx 0.60 \text{ metros reales}$$

Con la distancia obtenida, calcula:

$$D_{\text{metros}} = \text{Distancia total (px)} \times 0.60$$

Para estimar el **tiempo de respuesta** de la ambulancia, considera que en las calles angostas del centro histórico de Potosí la velocidad promedio es de **25 km/h** en condiciones normales:

$$t \text{ (min)} = \frac{D_{\text{metros}}}{1000} \div 25 \times 60$$

##### Tabla de despacho (complétala con tus resultados)

| Campo | Valor obtenido |
|-------|----------------|
| Nodo origen — Hospital (clave) | _____ |
| Nodo destino — Emergencia (clave) | _____ |
| Distancia total Dijkstra (px) | _____ px |
| Distancia real (m) | _____ m |
| Tiempo estimado de llegada (min) | _____ min |
| Nodos visitados antes de llegar | _____ |
| ¿Coincide con la ruta visual? | Sí / No |

---

**Preguntas para reflexionar:**
- ¿Cuántos nodos tuvo que "descartar" Dijkstra antes de encontrar el camino óptimo? ¿Qué representa cada descarte?
- ¿La ruta amarilla del algoritmo evita las zonas de mayor pendiente o las atraviesa?
- Si se cierra una calle en el camino óptimo (por obra o accidente), ¿cómo afecta eso al tiempo de respuesta? Prueba cambiando el nodo de origen a un nodo adyacente.
- ¿Existe algún punto de la ciudad que quede "demasiado lejos" del hospital en distancia? ¿Qué implicaría eso para la cobertura del SEDES?

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

---

#### 🏢 Caso Real — COTAP Limitada: Red de Fibra Óptica para Potosí

> **Contexto:** La Cooperativa de Telecomunicaciones COTAP Limitada planea realizar una inversión en infraestructura de **fibra óptica** para brindar conectividad a toda la población potosina. Antes de comprometer el presupuesto, la gerencia técnica necesita responder:
>
> *"¿Por cuáles calles tendemos el cable para llegar a todos los barrios de Potosí gastando la menor cantidad de material posible?"*

Esta pregunta es exactamente lo que resuelve el **Árbol de Expansión Mínima (MST)** con el algoritmo de Prim: la red de calles que conecta **todos los nodos** del mapa recorriendo la **menor distancia total acumulada**, sin generar lazos innecesarios.

##### Datos técnicos para el cálculo

El canvas de la aplicación representa el área urbana de Potosí a una escala aproximada de:

$$1 \text{ píxel (canvas)} \approx 0.60 \text{ metros reales}$$

El costo estimado de instalación de fibra óptica subterránea en zona urbana (incluye tendido, ductos y mano de obra) es:

$$\text{Costo} = \mathbf{Bs.\, 95} \text{ por metro lineal}$$

> *Referencia: cotización promedio para Bolivia en 2025, tramo urbano con apertura de zanja en vía pavimentada.*

##### Pasos para calcular el presupuesto

1. Ejecuta `Prim(startVertex)` y observa las aristas verdes en el canvas.
2. Abre la consola del navegador (`F12 → Console`). Verás una línea similar a:
   ```
   [Prim] MST completado | Aristas: 843 | Peso total: 487 320 px
   ```
3. Convierte el peso total de píxeles a metros:
   $$D_{\text{metros}} = \text{Peso total (px)} \times 0.60$$
4. Calcula el costo total de instalación:
   $$\text{Costo total} = D_{\text{metros}} \times 95 \text{ Bs./m}$$
5. Convierte a dólares americanos si es necesario (tipo de cambio referencial: **1 USD ≈ 6.97 Bs.**):
   $$\text{Costo}_{\text{USD}} = \frac{\text{Costo total (Bs.)}}{6.97}$$

##### Tabla de estimación (complétala con tus resultados)

| Campo | Valor obtenido |
|-------|----------------|
| Peso total del MST (px) | _____ px |
| Distancia real estimada (m) | _____ m |
| Distancia real estimada (km) | _____ km |
| Costo total en bolivianos | Bs. _____ |
| Costo total en dólares (USD) | $ _____ |
| Número de aristas en el MST | _____ |

---

**Preguntas para reflexionar:**
- ¿Cuántas aristas tiene el MST comparado con el total de aristas del grafo?
- ¿Las calles del MST coinciden con las calles principales de Potosí?
- Si una calle del MST se cierra, ¿qué pasa con la conectividad de la ciudad?
- ¿El presupuesto calculado te parece razonable para una cooperativa como COTAP? ¿Qué factores reales elevarían o reducirían ese costo?

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

#### 💧 Caso Real — SEMAPA: Red de Distribución de Agua en Potosí

> **Contexto:** El Servicio Municipal de Agua Potable y Alcantarillado de Potosí (**SEMAPA**) distribuye agua desde el principal reservorio de la ciudad — la **Laguna Khara Khara** — hacia los barrios potosinos. A 4.090 metros de altitud, el agua es un recurso crítico y escaso. La gerencia necesita responder:
>
> *"¿Cuánto caudal máximo puede llegar desde Khara Khara hasta los barrios más alejados, y qué tuberías son las que limitan ese flujo?"*

En este modelo, **cada arista del grafo representa una tubería** y su **peso equivale al diámetro/capacidad** de esa tubería. El flujo máximo que puede circular por la red es exactamente lo que calcula Ford-Fulkerson, y el corte mínimo revela las tuberías críticas: aquellas que, si se rompen o se obstruyen, dejan sin agua a sectores enteros de la ciudad.

> Los vecindarios en las zonas altas del mapa (mayor elevación → mayor distancia desde la fuente) son históricamente los más afectados por cortes. Verifica si el corte mínimo del algoritmo coincide con esa realidad.

##### Interpretación de los pesos en este contexto

Los pesos de las aristas en la aplicación se calculan como **distancia euclidiana en píxeles**. Para este escenario, interpretamos ese valor como una **capacidad proporcional** de la tubería: aristas más cortas (calles más angostas o tuberías de menor diámetro) tienen menor capacidad → son los posibles cuellos de botella.

##### Pasos para simular la red de agua

1. Identifica el nodo más cercano a la **Laguna Khara Khara** (zona noroeste del mapa). Haz clic → anota su clave.
2. Identifica el nodo de destino en un **barrio periférico elevado** (zona opuesta del mapa). Haz clic → anota su clave.
3. En `main.ts` configura:
   ```typescript
   const sourceVertex = graph['CLAVE_KHARA_KHARA'];   // Reservorio
   const sinkVertex   = graph['CLAVE_BARRIO_ALTO'];   // Barrio destino
   FordFulkerson(sourceVertex, sinkVertex).then(result => {
       console.log('[SEMAPA] Caudal máximo:', result.maxFlow);
       console.log('[SEMAPA] Tuberías críticas:', result.minCutEdges.length);
       result.minCutEdges.forEach(e =>
           console.log(`  Tubería: ${e.source.label} → ${e.destination.label} | Capacidad: ${e.weight.toFixed(1)}`)
       );
   });
   ```
4. Ejecuta y observa:
   - Los **caminos aumentantes** de colores → rutas paralelas por donde fluye el agua
   - Las **aristas rojas punteadas** → tuberías críticas que SEMAPA debe reforzar o duplicar

##### Interpretación del flujo máximo

El valor `maxFlow` representa el **caudal total** que puede circular por la red (en unidades proporcionales a la escala del canvas). Para comparar entre experimentos, interesa más la **relación** entre el flujo máximo y el número de aristas del corte mínimo que el valor numérico absoluto.

| Pocas aristas en el corte mínimo | Muchas aristas en el corte mínimo |
|----------------------------------|-----------------------------------|
| La red es muy vulnerable: basta romper 1–2 tuberías para colapsar el suministro | La red es más resiliente: necesitas bloquear muchos puntos a la vez |

##### Tabla de análisis SEMAPA (complétala con tus resultados)

| Campo | Valor obtenido |
|-------|----------------|
| Nodo origen — Khara Khara (clave) | _____ |
| Nodo destino — Barrio alto (clave) | _____ |
| Flujo máximo calculado | _____ |
| Número de caminos aumentantes | _____ |
| Número de aristas en el corte mínimo | _____ |
| ¿Las aristas rojas están en zona alta o baja? | Alta / Baja / Ambas |
| Bottleneck más pequeño encontrado | _____ |

---

**Preguntas para reflexionar:**
- ¿Las tuberías críticas (aristas rojas) coinciden con los barrios que históricamente reportan cortes de agua en Potosí?
- ¿Cuántos caminos alternativos encontró Ford-Fulkerson? ¿Qué significa eso en términos de redundancia de la red?
- Si SEMAPA duplicara **solo una** de las tuberías del corte mínimo (la de menor capacidad), ¿cuánto aumentaría el flujo máximo? Modifica el peso de esa arista en `graph-ui/index.ts` y vuelve a ejecutar.
- Compara los cuellos de botella del Escenario SEMAPA con los del Escenario 1 (tráfico Centro → Periferia). ¿Son las mismas aristas? ¿Por qué sí o no?

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

### Escenario 4: Presupuesto de Fibra Óptica — COTAP Limitada

**Objetivo:** Determinar el tendido mínimo de cable de fibra óptica para cubrir toda la ciudad y estimar el costo de la inversión.

**Pasos:**
1. Activa `Prim(startVertex)` y espera a que termine la visualización
2. En la consola (`F12`) anota el **peso total del MST** en píxeles
3. Aplica la fórmula de conversión: $D = \text{peso (px)} \times 0.60 \text{ m}$
4. Calcula: $\text{Costo} = D \times 95 \text{ Bs./m}$
5. Registra los resultados en la tabla de la sección 6
6. Analiza visualmente: ¿las aristas verdes del MST siguen las avenidas principales o las calles secundarias?
7. ¿Hay zonas del mapa donde el MST hace "saltos largos"? ¿Qué implicaría eso para COTAP en términos de obra civil?

### Escenario 5: Despacho de Ambulancias — SEDES Potosí

**Objetivo:** Calcular la ruta más corta desde el Hospital Daniel Bracamonte hasta un punto de emergencia y estimar el tiempo de respuesta.

**Pasos:**
1. Localiza el nodo más cercano al Hospital Daniel Bracamonte (zona central, Av. Antofagasta) y anota su clave
2. Elige dos puntos de emergencia en zonas distintas del mapa (una cercana y una periférica) y anota sus claves
3. En `main.ts`, configura origen y destino y activa `Dijkstra(startVertex, targetVertex)`
4. Anota la distancia total en píxeles desde la consola
5. Aplica: $D = \text{px} \times 0.60$, luego $t = \frac{D/1000}{25} \times 60$
6. Repite con el segundo punto de emergencia y compara los tiempos
7. Registra en la tabla de la sección 6

### Escenario 6: Red de Agua Potable — SEMAPA Potosí

**Objetivo:** Identificar las tuberías críticas que limitan el suministro de agua desde la Laguna Khara Khara hacia los barrios más alejados.

**Pasos:**
1. Ubica el nodo más cercano a la **Laguna Khara Khara** (zona noroeste del mapa) → anota su clave
2. Ubica un nodo en un **barrio periférico de zona alta** (extremo opuesto del mapa) → anota su clave
3. Configura y ejecuta Ford-Fulkerson con ese par origen-destino
4. En la consola anota: flujo máximo, número de caminos aumentantes y número de aristas del corte mínimo
5. Observa si las aristas rojas punteadas se concentran en zonas altas o bajas del mapa
6. Repite cambiando el nodo destino a un barrio diferente y compara si cambian las tuberías críticas
7. Registra en la tabla de la sección 6

---

## 6. Tabla de Resultados

Completa esta tabla para cada experimento:

| # | Algoritmo | Origen (clave) | Destino (clave) | Resultado clave | Observación |
|---|-----------|---------------|-----------------|-----------------|-------------|
| 1 | Ford-Fulkerson | | | Max Flow = ___ | Min-cut aristas = ___ |
| 2 | Dijkstra | | | Distancia = ___ | Nodos visitados = ___ |
| 3 | Prim | | — | Aristas MST = ___ | Peso total = ___ px |
| 4 | BFS | | — | Niveles = ___ | Zona más lejana = ___ |
| 5 | Ford-Fulkerson | | | Max Flow = ___ | ¿Cambió el cuello de botella? |
| 6 | **Prim (COTAP)** | | — | Distancia real = ___ km | Costo total = Bs. ___ / USD ___ |
| 7 | **Dijkstra (SEDES)** | Hospital | Emergencia 1 | Distancia = ___ m | Tiempo = ___ min |
| 8 | **Dijkstra (SEDES)** | Hospital | Emergencia 2 | Distancia = ___ m | Tiempo = ___ min |
| 9 | **Ford-Fulkerson (SEMAPA)** | Khara Khara | Barrio alto 1 | Max Flow = ___ | Corte mínimo = ___ aristas |
| 10 | **Ford-Fulkerson (SEMAPA)** | Khara Khara | Barrio alto 2 | Max Flow = ___ | ¿Cambiaron las tuberías críticas? |

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

6. **COTAP Limitada tiene un presupuesto máximo de USD 500 000 para la primera fase.** Con base en tu cálculo del MST, ¿alcanza ese presupuesto para cubrir toda la ciudad? Si no alcanza, ¿qué estrategia le propondrías a la cooperativa para priorizar qué zonas cubrir primero?

7. **El SEDES Potosí establece que el tiempo máximo de respuesta de una ambulancia debe ser de 8 minutos.** Con los resultados de Dijkstra, ¿hay zonas de la ciudad que superen ese límite desde el Hospital Daniel Bracamonte? ¿Qué solución de infraestructura propondrías (un segundo hospital, una base de ambulancias, una vía de acceso rápido)?

8. **SEMAPA necesita priorizar la renovación de una sola tubería con presupuesto limitado.** Con los resultados de Ford-Fulkerson, ¿cuál arista del corte mínimo renovarías primero y por qué? ¿Cómo cambiaría el flujo máximo si esa tubería duplica su capacidad?

---

## 10. Extensiones (trabajo opcional)

- **Cambiar pesos:** En `graph-ui/index.ts`, la función `calculateDistance` asigna el peso. Modifícala para simular calles con distinto nivel de tráfico (multiplica por un factor aleatorio).
- **Nuevo GeoJSON:** El archivo `src/graph-ui/stcz.json` contiene datos de **Santa Cruz de la Sierra**. Cambia la importación en `graph-ui/index.ts` para analizar esa ciudad.
- **Guardar resultados:** Modifica `FordFulkerson.ts` para exportar los resultados a un archivo JSON usando `JSON.stringify(result.minCutEdges)`.
- **Visualización de flujo:** En cada arista del canvas, dibuja el valor de flujo neto calculado por Ford-Fulkerson.

---

*Datos geográficos: © OpenStreetMap contributors — Potosí, Bolivia*
