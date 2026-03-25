const TOPICS = ["pandas", "numpy", "markdown"];
const DIFFICULTIES = ["basica", "media", "avanzada"];
const EXERCISE_TYPES = ["completar_codigo", "corregir_errores"];
const DATASET_SIZES = ["mediano"];

const DIFFICULTY_ALIASES = {
  intermedia: "media",
  intermediate: "media",
  medium: "media",
};

const TOPIC_ALIASES = {
  general: "markdown",
  analisis_datos: "pandas",
  ml_basico: "pandas",
  algoritmia: "numpy",
};

const normalizeRequest = (body) => {
  const toKey = (value) =>
    String(value || "")
      .trim()
      .toLowerCase()
      .replace(/\s+/g, "_");

  const difficulty = toKey(body.difficulty || body.dificultad);
  const topic = toKey(body.topic || body.tema);

  return {
    topic: TOPIC_ALIASES[topic] ?? topic,
    difficulty: DIFFICULTY_ALIASES[difficulty] ?? difficulty,
    exerciseType: toKey(body.exerciseType || body.tipo),
    datasetSize: "mediano",
    seed: Number.isFinite(body.seed) ? body.seed : null,
  };
};

const validateRequest = (payload) => {
  const errors = [];
  if (!TOPICS.includes(payload.topic))
    errors.push({ field: "topic", allowed: TOPICS, message: "Unsupported topic" });
  if (!DIFFICULTIES.includes(payload.difficulty))
    errors.push({ field: "difficulty", allowed: DIFFICULTIES, message: "Unsupported difficulty" });
  if (!EXERCISE_TYPES.includes(payload.exerciseType))
    errors.push({ field: "exerciseType", allowed: EXERCISE_TYPES, message: "Unsupported exercise type" });
  return { ok: errors.length === 0, errors };
};

// ─── Utilidad de seed ────────────────────────────────────────────────────────
const mulberry32 = (seed) => {
  let t = seed >>> 0;
  return () => {
    t += 0x6d2b79f5;
    let r = Math.imul(t ^ (t >>> 15), 1 | t);
    r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
    return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
  };
};

const pickIndex = (rng, length) => Math.floor(rng() * length);

// ─── PANDAS ──────────────────────────────────────────────────────────────────

const PANDAS_COMPLETAR = [
  {
    title: "Pandas: explorar calificaciones de alumnos",
    instructions:
      "Tienes un DataFrame con calificaciones de alumnos. Completa el código para explorar los datos y calcular el promedio por materia.",
    starterCode:
`import pandas as pd
import io

datos = """nombre,materia,calificacion
Ana García,Matemáticas,85
Carlos López,Matemáticas,72
María Pérez,Matemáticas,91
Luis Herrera,Física,68
Sandra Torres,Física,79
Pedro Ramos,Física,88
Laura Díaz,Programación,95
Jorge Molina,Programación,60
Valeria Cruz,Programación,83"""

df = pd.read_csv(io.StringIO(datos))

# TODO 1: Muestra las primeras 5 filas del DataFrame
print(df._____())

# TODO 2: Calcula el promedio de calificación por materia
promedio = df.groupby('_____')['calificacion'].mean()
print(promedio)

# TODO 3: Filtra solo los alumnos con calificación >= 70
aprobados = df[df['calificacion'] ____ 70]
print(aprobados)`,
    solutionCode:
`import pandas as pd
import io

datos = """nombre,materia,calificacion
Ana García,Matemáticas,85
Carlos López,Matemáticas,72
María Pérez,Matemáticas,91
Luis Herrera,Física,68
Sandra Torres,Física,79
Pedro Ramos,Física,88
Laura Díaz,Programación,95
Jorge Molina,Programación,60
Valeria Cruz,Programación,83"""

df = pd.read_csv(io.StringIO(datos))

print(df.head())

promedio = df.groupby('materia')['calificacion'].mean()
print(promedio)

aprobados = df[df['calificacion'] >= 70]
print(aprobados)`,
    expectedOutput:
      "Las primeras 5 filas, el promedio por materia y la lista de alumnos con calificación >= 70.",
    hints: [
      "head() muestra las primeras filas",
      "groupby agrupa por una columna, luego aplica .mean()",
      "Para filtrar usa >= dentro de corchetes",
    ],
    steps: [
      "Ejecuta la celda para cargar los datos con pd.read_csv",
      "Completa el TODO 1 con el método correcto",
      "En el TODO 2 escribe el nombre de la columna entre comillas",
      "En el TODO 3 usa el operador de comparación correcto",
    ],
  },
  {
    title: "Pandas: analizar ventas por categoría",
    instructions:
      "Tienes un DataFrame de ventas. Completa el código para calcular el total vendido por categoría y encontrar el producto más caro.",
    starterCode:
`import pandas as pd
import io

datos = """producto,categoria,precio,cantidad
Laptop,Electrónica,12000,5
Mouse,Electrónica,350,20
Cuaderno,Papelería,45,100
Bolígrafo,Papelería,15,200
Mochila,Ropa,580,30
Audífonos,Electrónica,800,15
Carpeta,Papelería,60,80
Tenis,Ropa,1200,12"""

df = pd.read_csv(io.StringIO(datos))

# TODO 1: Crea una columna 'total' multiplicando precio por cantidad
df['total'] = df['_____'] * df['_____']

# TODO 2: Agrupa por categoria y suma el total
ventas_por_categoria = df.groupby('_____')['total'].___()
print(ventas_por_categoria)

# TODO 3: Encuentra el producto más caro usando idxmax
idx = df['precio'].___()
print("Producto más caro:", df.loc[idx, 'producto'])`,
    solutionCode:
`import pandas as pd
import io

datos = """producto,categoria,precio,cantidad
Laptop,Electrónica,12000,5
Mouse,Electrónica,350,20
Cuaderno,Papelería,45,100
Bolígrafo,Papelería,15,200
Mochila,Ropa,580,30
Audífonos,Electrónica,800,15
Carpeta,Papelería,60,80
Tenis,Ropa,1200,12"""

df = pd.read_csv(io.StringIO(datos))

df['total'] = df['precio'] * df['cantidad']

ventas_por_categoria = df.groupby('categoria')['total'].sum()
print(ventas_por_categoria)

idx = df['precio'].idxmax()
print("Producto más caro:", df.loc[idx, 'producto'])`,
    expectedOutput:
      "Total de ventas por categoría y nombre del producto más caro (Laptop).",
    hints: [
      "Multiplica dos columnas para crear la columna total",
      "Para sumar por grupo usa .sum() después del groupby",
      "idxmax() devuelve el índice del valor máximo",
    ],
    steps: [
      "Carga y revisa los datos",
      "Crea la columna 'total' como precio × cantidad",
      "Agrupa por categoría y suma",
      "Usa idxmax() para encontrar el más caro",
    ],
  },
];

const PANDAS_CORREGIR = [
  {
    title: "Pandas: corregir agrupamiento de datos",
    instructions:
      "El siguiente código tiene 3 errores. Encuéntralos y corrígelos para que calcule correctamente el promedio de calificación por materia.",
    starterCode:
`import pandas as pd
import io

datos = """nombre,materia,calificacion
Ana García,Matemáticas,85
Carlos López,Matemáticas,72
Pedro Ramos,Física,88
Laura Díaz,Programación,95
Jorge Molina,Programación,60"""

df = pd.read_csv(io.StringIO(datos))

# ERROR 1: método incorrecto (group en lugar de groupby)
promedio = df.group('materia')['calificacion'].mean()

# ERROR 2: nombre de columna mal escrito
aprobados = df[df['calificacion '] >= 70]

# ERROR 3: falta imprimir el resultado
promedio`,
    solutionCode:
`import pandas as pd
import io

datos = """nombre,materia,calificacion
Ana García,Matemáticas,85
Carlos López,Matemáticas,72
Pedro Ramos,Física,88
Laura Díaz,Programación,95
Jorge Molina,Programación,60"""

df = pd.read_csv(io.StringIO(datos))

# CORRECCIÓN 1: groupby en lugar de group
promedio = df.groupby('materia')['calificacion'].mean()

# CORRECCIÓN 2: sin espacio en el nombre de columna
aprobados = df[df['calificacion'] >= 70]

# CORRECCIÓN 3: imprimir con print()
print(promedio)
print(aprobados)`,
    expectedOutput: "Promedio por materia y lista de alumnos aprobados.",
    hints: [
      "El método correcto para agrupar en pandas es groupby (sin espacio)",
      "Los nombres de columna deben coincidir exactamente, incluyendo espacios",
      "Usa print() para mostrar el resultado en lugar de solo escribir la variable",
    ],
    steps: [
      "Lee el código completo antes de modificar",
      "Busca el error en la línea del groupby",
      "Revisa el nombre de la columna en el filtro",
      "Agrega print() para mostrar los resultados",
    ],
  },
  {
    title: "Pandas: corregir filtro y ordenamiento",
    instructions:
      "El código intenta filtrar productos caros y ordenarlos, pero tiene 3 errores. Corrígelos.",
    starterCode:
`import pandas as pd
import io

datos = """producto,precio,stock
Laptop,12000,5
Mouse,350,20
Teclado,650,15
Monitor,4500,8
Audífonos,800,12"""

df = pd.read_csv(io.StringIO(datos))

# ERROR 1: operador de asignación en lugar de comparación
caros = df[df['precio'] = 1000]

# ERROR 2: columna inexistente 'Precio' (mayúscula)
ordenado = df.sort_values('Precio', ascending=False)

# ERROR 3: reset_index mal escrito
resultado = caros.reset_indx()
print(resultado)`,
    solutionCode:
`import pandas as pd
import io

datos = """producto,precio,stock
Laptop,12000,5
Mouse,350,20
Teclado,650,15
Monitor,4500,8
Audífonos,800,12"""

df = pd.read_csv(io.StringIO(datos))

# CORRECCIÓN 1: usar >= para comparar
caros = df[df['precio'] >= 1000]

# CORRECCIÓN 2: columna en minúsculas 'precio'
ordenado = df.sort_values('precio', ascending=False)

# CORRECCIÓN 3: reset_index bien escrito
resultado = caros.reset_index()
print(resultado)`,
    expectedOutput: "DataFrame con productos de precio >= 1000, con índice reiniciado.",
    hints: [
      "Para filtrar usa == o >= nunca un solo =",
      "Python es sensible a mayúsculas: 'precio' ≠ 'Precio'",
      "El método se llama reset_index() no reset_indx()",
    ],
    steps: [
      "Identifica qué hace cada bloque de código",
      "Corrige el operador en la línea de filtro",
      "Revisa la capitalización del nombre de columna",
      "Corrige el nombre del método reset_index",
    ],
  },
];

// ─── NUMPY ───────────────────────────────────────────────────────────────────

const NUMPY_COMPLETAR = [
  {
    title: "NumPy: estadísticas básicas de un arreglo",
    instructions:
      "Tienes un arreglo de calificaciones. Completa el código para calcular estadísticas básicas.",
    starterCode:
`import numpy as np

calificaciones = np.array([85, 72, 91, 68, 79, 88, 95, 60, 83, 77, 90, 65, 82, 74, 89])

# TODO 1: Calcula la media
media = np._____(calificaciones)
print("Media:", media)

# TODO 2: Calcula la desviación estándar
desviacion = np._____(calificaciones)
print("Desviación estándar:", desviacion)

# TODO 3: Encuentra el valor máximo y mínimo
print("Máximo:", np._____(calificaciones))
print("Mínimo:", np._____(calificaciones))

# TODO 4: Cuenta cuántos alumnos tienen calificación >= 70
aprobados = np.sum(calificaciones ____ 70)
print("Aprobados:", aprobados)`,
    solutionCode:
`import numpy as np

calificaciones = np.array([85, 72, 91, 68, 79, 88, 95, 60, 83, 77, 90, 65, 82, 74, 89])

media = np.mean(calificaciones)
print("Media:", media)

desviacion = np.std(calificaciones)
print("Desviación estándar:", desviacion)

print("Máximo:", np.max(calificaciones))
print("Mínimo:", np.min(calificaciones))

aprobados = np.sum(calificaciones >= 70)
print("Aprobados:", aprobados)`,
    expectedOutput:
      "Media ~79.9, desviación estándar ~10.2, máximo 95, mínimo 60, aprobados 12.",
    hints: [
      "np.mean() calcula el promedio",
      "np.std() calcula la desviación estándar",
      "np.max() y np.min() para máximo y mínimo",
      "Una condición como calificaciones >= 70 devuelve un arreglo de True/False, np.sum() cuenta los True",
    ],
    steps: [
      "Completa cada función de NumPy en los TODOs",
      "Para el TODO 4 usa el operador >= dentro del np.sum()",
      "Ejecuta la celda y verifica los resultados",
    ],
  },
  {
    title: "NumPy: operaciones con matrices",
    instructions:
      "Completa el código para crear y operar con matrices usando NumPy.",
    starterCode:
`import numpy as np

# TODO 1: Crea una matriz 3x3 con np.array
matriz = np.array([
    [1, 2, 3],
    [_____, _____, _____],
    [7, 8, 9]
])

# TODO 2: Calcula la suma de todos los elementos
total = np._____(matriz)
print("Suma total:", total)

# TODO 3: Calcula la media por fila (axis=1)
media_filas = np.mean(matriz, axis=_____)
print("Media por fila:", media_filas)

# TODO 4: Transpón la matriz
transpuesta = matriz._____
print("Transpuesta:\\n", transpuesta)`,
    solutionCode:
`import numpy as np

matriz = np.array([
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9]
])

total = np.sum(matriz)
print("Suma total:", total)

media_filas = np.mean(matriz, axis=1)
print("Media por fila:", media_filas)

transpuesta = matriz.T
print("Transpuesta:\\n", transpuesta)`,
    expectedOutput:
      "Suma total: 45, media por fila: [2. 5. 8.], matriz transpuesta 3x3.",
    hints: [
      "Completa la segunda fila con 4, 5, 6",
      "np.sum() sin axis suma todos los elementos",
      "axis=1 opera sobre las columnas (por fila), axis=0 sobre las filas (por columna)",
      "La transpuesta se obtiene con .T",
    ],
    steps: [
      "Completa la segunda fila de la matriz",
      "Usa np.sum() para el total",
      "Pasa axis=1 para calcular la media por fila",
      "Usa .T para transponer",
    ],
  },
];

const NUMPY_CORREGIR = [
  {
    title: "NumPy: corregir operaciones con arreglos",
    instructions:
      "El código tiene 3 errores. Corrígelos para que las operaciones con NumPy funcionen correctamente.",
    starterCode:
`import numpy as np

numeros = np.array([10, 20, 30, 40, 50])

# ERROR 1: np.promedio no existe
media = np.promedio(numeros)
print("Media:", media)

# ERROR 2: índice fuera de rango (el arreglo tiene índices 0-4)
ultimo = numeros[5]
print("Último elemento:", ultimo)

# ERROR 3: forma incorrecta de calcular la suma acumulada
acumulado = np.sum_acumulada(numeros)
print("Suma acumulada:", acumulado)`,
    solutionCode:
`import numpy as np

numeros = np.array([10, 20, 30, 40, 50])

# CORRECCIÓN 1: np.mean en lugar de np.promedio
media = np.mean(numeros)
print("Media:", media)

# CORRECCIÓN 2: índice -1 para el último, o índice 4
ultimo = numeros[-1]
print("Último elemento:", ultimo)

# CORRECCIÓN 3: np.cumsum para suma acumulada
acumulado = np.cumsum(numeros)
print("Suma acumulada:", acumulado)`,
    expectedOutput: "Media: 30.0, último elemento: 50, suma acumulada: [10 30 60 100 150].",
    hints: [
      "En NumPy el promedio se calcula con np.mean()",
      "En Python los índices empiezan en 0, el último elemento es índice -1 o len-1",
      "La suma acumulada en NumPy es np.cumsum()",
    ],
    steps: [
      "Identifica qué debería hacer cada línea",
      "Busca la función correcta para calcular la media",
      "Recuerda que un arreglo de 5 elementos tiene índices del 0 al 4",
      "Busca la función de NumPy para suma acumulada",
    ],
  },
];

// ─── MARKDOWN ────────────────────────────────────────────────────────────────

const MARKDOWN_COMPLETAR = [
  {
    title: "Markdown: documentar un análisis de datos",
    instructions:
      "Completa la celda Markdown para documentar correctamente un análisis de datos. Usa la sintaxis adecuada para títulos, listas, negritas y tablas.",
    starterCode:
`# _____ del Dataset de Ventas

## Descripción
Este análisis explora las **_____** de una tienda durante el último trimestre.

## Objetivos
- _____ las ventas por categoría
- Identificar el producto _____ vendido
- Comparar resultados con el trimestre _____

## Resultados principales

| Categoría     | Total Ventas |
|_______________|______________|
| Electrónica   | $85,000      |
| _____         | $12,000      |
| Ropa          | _____        |

## Conclusión
El análisis muestra que **Electrónica** representa la mayor parte de las ventas,
con un **_____% del total**.`,
    solutionCode:
`# Análisis del Dataset de Ventas

## Descripción
Este análisis explora las **ventas** de una tienda durante el último trimestre.

## Objetivos
- Comparar las ventas por categoría
- Identificar el producto más vendido
- Comparar resultados con el trimestre anterior

## Resultados principales

| Categoría     | Total Ventas |
|---------------|--------------|
| Electrónica   | $85,000      |
| Papelería     | $12,000      |
| Ropa          | $21,600      |

## Conclusión
El análisis muestra que **Electrónica** representa la mayor parte de las ventas,
con un **71% del total**.`,
    expectedOutput:
      "Celda Markdown con título, descripción, lista de objetivos, tabla completa y conclusión.",
    hints: [
      "Usa # para el título principal y ## para subtítulos",
      "Las negritas se escriben con **texto**",
      "En la tabla, los separadores de columna son guiones ---",
      "Las listas usan - al inicio de cada línea",
    ],
    steps: [
      "Completa el título principal después del #",
      "Rellena los espacios en blanco de la descripción y objetivos",
      "Completa la tabla con los datos que faltan",
      "Añade el porcentaje en la conclusión",
    ],
  },
  {
    title: "Markdown: crear documentación de un proyecto",
    instructions:
      "Completa la celda Markdown para crear la documentación básica de un proyecto de Jupyter Notebook.",
    starterCode:
`# Proyecto: _____ de Temperaturas Mensuales

**Autor:** _____
**Fecha:** Marzo 2026
**Versión:** 1.0

---

## ¿Qué hace este notebook?
Este notebook _____ las temperaturas registradas en Guadalajara
durante el año 2025 para identificar patrones estacionales.

## Requisitos
Para ejecutar este notebook necesitas:
- _____ 3.8 o superior
- Librería _____
- Librería matplotlib

## Cómo usarlo
1. _____ todas las celdas en orden
2. Los datos se cargan _____ desde el código
3. Los gráficos se generan _____

> **Nota:** Este notebook fue creado como parte del curso de _____ Notebook.`,
    solutionCode:
`# Proyecto: Análisis de Temperaturas Mensuales

**Autor:** José Alberto Orozco
**Fecha:** Marzo 2026
**Versión:** 1.0

---

## ¿Qué hace este notebook?
Este notebook analiza las temperaturas registradas en Guadalajara
durante el año 2025 para identificar patrones estacionales.

## Requisitos
Para ejecutar este notebook necesitas:
- Python 3.8 o superior
- Librería pandas
- Librería matplotlib

## Cómo usarlo
1. Ejecuta todas las celdas en orden
2. Los datos se cargan automáticamente desde el código
3. Los gráficos se generan al final del notebook

> **Nota:** Este notebook fue creado como parte del curso de Jupyter Notebook.`,
    expectedOutput:
      "Documentación completa con título, autor, descripción, requisitos e instrucciones de uso.",
    hints: [
      "Usa --- para crear una línea horizontal separadora",
      "Las listas numeradas usan 1. 2. 3.",
      "> al inicio de línea crea un bloque de cita (quote)",
      "**texto** para negritas, *texto* para cursiva",
    ],
    steps: [
      "Pon un título descriptivo para el proyecto",
      "Llena el autor y los datos faltantes",
      "Completa la lista de requisitos",
      "Rellena las instrucciones de uso",
    ],
  },
];

const MARKDOWN_CORREGIR = [
  {
    title: "Markdown: corregir formato de documentación",
    instructions:
      "La celda Markdown tiene 4 errores de formato. Encuéntralos y corrígelos para que se renderice correctamente.",
    starterCode:
`## Análisis de Ventas 2025

Descripción
Este reporte muestra las ventas del último trimestre.

##Objetivos
- Comparar categorías
- Identificar tendencias
-Detectar anomalías

Resultados

| Mes | Ventas |
|-----|-----
| Enero | $45,000 |
| Febrero | $52,000 |

**Conclusión
Las ventas aumentaron un 15% respecto al trimestre anterior.`,
    solutionCode:
`## Análisis de Ventas 2025

## Descripción
Este reporte muestra las ventas del último trimestre.

## Objetivos
- Comparar categorías
- Identificar tendencias
- Detectar anomalías

## Resultados

| Mes | Ventas |
|-----|--------|
| Enero | $45,000 |
| Febrero | $52,000 |

**Conclusión**
Las ventas aumentaron un 15% respecto al trimestre anterior.`,
    expectedOutput:
      "Markdown renderizado con subtítulos, lista correcta, tabla completa y negritas cerradas.",
    hints: [
      "Los subtítulos ## necesitan un espacio después de los #",
      "Los elementos de lista - necesitan un espacio después del guión",
      "En las tablas el separador |-----| debe tener el mismo ancho que el encabezado",
      "Las negritas **texto** deben abrirse y cerrarse con **",
    ],
    steps: [
      "Revisa todos los encabezados ## y verifica el espacio",
      "Revisa cada elemento de lista para el espacio después del -",
      "Completa el separador de la tabla",
      "Cierra las negritas con **",
    ],
  },
];

// ─── Builder principal ────────────────────────────────────────────────────────

const buildExercise = (payload, seed) => {
  const rng = mulberry32(seed);

  if (payload.topic === "pandas") {
    if (payload.exerciseType === "corregir_errores") {
      return PANDAS_CORREGIR[pickIndex(rng, PANDAS_CORREGIR.length)];
    }
    return PANDAS_COMPLETAR[pickIndex(rng, PANDAS_COMPLETAR.length)];
  }

  if (payload.topic === "numpy") {
    if (payload.exerciseType === "corregir_errores") {
      return NUMPY_CORREGIR[pickIndex(rng, NUMPY_CORREGIR.length)];
    }
    return NUMPY_COMPLETAR[pickIndex(rng, NUMPY_COMPLETAR.length)];
  }

  if (payload.topic === "markdown") {
    if (payload.exerciseType === "corregir_errores") {
      return MARKDOWN_CORREGIR[pickIndex(rng, MARKDOWN_CORREGIR.length)];
    }
    return MARKDOWN_COMPLETAR[pickIndex(rng, MARKDOWN_COMPLETAR.length)];
  }

  return PANDAS_COMPLETAR[0];
};

module.exports = {
  TOPICS,
  DIFFICULTIES,
  EXERCISE_TYPES,
  DATASET_SIZES,
  normalizeRequest,
  validateRequest,
  buildExercise,
};
