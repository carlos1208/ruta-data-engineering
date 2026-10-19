/* Glosario compartido de la ruta Cloud & Data Engineering.
 *
 * Cada término marcado en una plataforma interactiva sale de aquí. La regla
 * (CLAUDE.md §2, regla 9): ninguna palabra técnica aparece sin definición a un
 * clic de distancia.
 *
 *   c  definición corta, la que sale al pasar el dedo o el cursor
 *   d  definición completa, la del modal. Admite HTML simple.
 *   v  variantes que deben subrayarse en el texto (plurales, sinónimos)
 *
 * Los módulos siguientes agregan términos aquí, no en su propia página.
 */
const GLOSARIO = {
  "pipeline": {
    t: "Pipeline",
    c: "Una cadena de pasos automáticos que toma datos crudos y entrega datos listos para usar.",
    d: "<p>Una <b>cadena de pasos automáticos</b> por la que pasan los datos: se leen de su origen, se limpian, se transforman y se dejan listos para un tablero o un informe. Cada paso entrega su salida al siguiente, como una línea de producción.</p><p>La diferencia con hacerlo a mano es que el pipeline corre solo, en horario, sin que nadie abra un archivo. Y ahí está su riesgo: si un paso empieza a entregar mal, no hay nadie mirando.</p><p><b>En esta ruta:</b> el pipeline de KPIs de operación NOC que construyes desde la Fase 2 y sigue creciendo hasta la 7.</p>",
    v: ["pipeline", "pipelines"]
  },
  "commit": {
    m: "objetos",
    t: "Commit",
    c: "La foto completa de tu proyecto en un momento dado, con fecha, autor y un comentario.",
    d: "<p>La <b>foto completa</b> de todos tus archivos en un momento dado, archivada con fecha, autor y un comentario tuyo que explica qué cambiaste.</p><p>No guarda «lo que cambió»: guarda el estado entero. Y lleva escrito el identificador de la foto anterior, así que las fotos quedan encadenadas en orden.</p><p>Como su identificador se calcula a partir de su propio contenido, <b>un commit no se puede modificar</b>. Lo que parece modificarlo en realidad crea uno nuevo.</p>",
    v: ["commit", "commits"]
  },
  "hash": {
    m: "objetos",
    t: "Hash",
    c: "El número de serie de una foto, calculado a partir de su propio contenido.",
    d: "<p>El <b>número de serie</b> que identifica cada objeto en Git. No es un consecutivo: se calcula a partir del contenido mismo del objeto.</p><p>Consecuencia práctica: si cambias cualquier cosa, por mínima que sea, el número cambia. Por eso dos personas con el mismo contenido obtienen el mismo hash, y por eso no se puede alterar una foto sin que se note.</p><p>Se ve abreviado a 7 caracteres (<code>c7f4a19</code>) aunque por dentro son 40.</p>",
    v: ["hash", "hashes"]
  },
  "blob": {
    m: "objetos",
    t: "Blob",
    c: "El contenido de un archivo, guardado sin nombre ni ruta.",
    d: "<p>El <b>contenido de un archivo</b>, guardado desnudo: sin nombre, sin ruta, sin fecha. Solo los bytes.</p><p>El nombre vive en el <i>tree</i> que lo apunta. Por eso, si renombras un archivo sin cambiar su contenido, Git no crea un blob nuevo: reutiliza el mismo y solo cambia el tree. De ahí que «detecte» renombres sin que se lo digas.</p>",
    v: ["blob", "blobs"]
  },
  "tree": {
    m: "objetos",
    t: "Tree",
    c: "La carpeta: la lista que le pone nombre a los archivos de una foto.",
    d: "<p>La <b>carpeta</b> de Git: una lista que asocia nombres con contenidos. Cada línea dice «este nombre corresponde a este blob» o «esta carpeta corresponde a este otro tree».</p><p>Un commit apunta a un tree, ese tree apunta a los blobs y a otros trees, y así se reconstruye la estructura completa de archivos de esa foto.</p>",
    v: ["tree", "trees"]
  },
  "parent": {
    m: "objetos",
    t: "Parent",
    c: "El commit anterior en la cadena. Cada foto lleva escrito cuál la precede.",
    d: "<p>El <b>commit anterior</b>. Cada foto lleva escrito el identificador de la que la precede, formando una cadena hacia atrás hasta el primer commit del proyecto.</p><p>Como el identificador del padre entra en el cálculo del identificador del hijo, cambiar un commit antiguo cambia el de todos los que vienen después. Esa cascada es la razón de casi todas las reglas de Git.</p>",
    v: ["parent", "padre"]
  },
  "HEAD": {
    m: "objetos",
    t: "HEAD",
    c: "Dónde estás parado ahora mismo: la foto que tienes cargada en la carpeta.",
    d: "<p>Una palabra especial que significa <b>«dónde estoy parado ahora»</b>. Los archivos que ves en tu carpeta corresponden a la foto que HEAD señala.</p><p>Casi todos los comandos la aceptan: <code>HEAD~3</code> es «tres fotos hacia atrás en la cadena», y <code>HEAD@{3}</code> es «donde estaba parado hace tres movimientos» — que no es lo mismo.</p>",
    v: ["HEAD"]
  },
  "rama": {
    m: "objetos",
    t: "Rama (branch)",
    c: "Una etiqueta que apunta a una foto y avanza contigo cuando guardas.",
    d: "<p>Un <b>nombre que apunta a un commit</b>. Cuando guardas una foto nueva, la etiqueta avanza para señalarla.</p><p>Por dentro es un archivo de 41 bytes con un identificador escrito. Literalmente: <code>cat .git/refs/heads/main</code>. Por eso crear una rama es instantáneo y gratis, y por eso en Git se ramifica sin pensarlo dos veces — no se copia nada.</p>",
    v: ["rama", "ramas", "branch"]
  },
  "repositorio": {
    m: "objetos",
    t: "Repositorio",
    c: "La carpeta de tu proyecto más todo su historial de fotos archivadas.",
    d: "<p>La carpeta de tu proyecto <b>más todo su historial</b>. Lo segundo vive en una subcarpeta oculta llamada <code>.git</code>: ahí están todos los objetos archivados y las etiquetas.</p><p>Si borras <code>.git</code>, te quedan los archivos actuales y pierdes toda la historia, incluido el reflog. Si borras un archivo del proyecto, el historial lo sigue teniendo.</p>",
    v: ["repositorio", "repositorios", "repo"]
  },
  "staging area": {
    m: "objetos",
    t: "Staging area (index)",
    c: "La antesala: lo que seleccionaste para que entre en la próxima foto.",
    d: "<p>La <b>antesala de la foto</b>. Cuando haces <code>git add</code> de un archivo, lo pones aquí; cuando haces commit, se fotografía <b>esto</b>, no lo que está en tu editor.</p><p>Parece un trámite y no lo es: es donde decides qué entra en la foto. Permite guardar solo una parte de lo que cambiaste, y es lo que hace posible componer commits que cuenten una sola cosa.</p><p>También se le llama <i>index</i>.</p>",
    v: ["staging area", "staging", "index"]
  },
  "working tree": {
    m: "objetos",
    t: "Working tree",
    c: "Los archivos tal como los ves y los editas ahora mismo en tu carpeta.",
    d: "<p>Los archivos <b>tal como están en tu carpeta ahora</b>, incluidos los cambios que todavía no has guardado en ninguna foto.</p><p>Es la primera de las cuatro zonas: working tree → staging area → repositorio local → remoto. Un cambio tiene que recorrerlas en ese orden para llegar a GitHub.</p>",
    v: ["working tree"]
  },
  "remoto": {
    m: "objetos",
    t: "Remoto",
    c: "La copia del repositorio que vive en un servidor, normalmente GitHub.",
    d: "<p>La copia del repositorio que vive <b>en un servidor</b> — normalmente GitHub — y que sirve de punto de encuentro entre varias personas.</p><p>Lo importante para esta fase: tu historial local y el remoto son dos cosas distintas. Puedes reescribir el local libremente; el remoto es lo que otros ya descargaron, y ahí las reglas cambian.</p>",
    v: ["remoto", "remotos"]
  },
  "reflog": {
    m: "reflog",
    t: "Reflog",
    c: "La bitácora privada de todos tus movimientos. Recupera lo que creías perdido.",
    d: "<p>El <b>registro de por dónde ha pasado tu posición</b>: cada vez que guardas, cambias de rama o deshaces algo, Git anota una línea con el identificador de donde quedaste.</p><p>No registra qué fotos existen, sino dónde estuviste tú. Por eso rescata commits que quedaron sin etiqueta: el objeto sigue archivado y el reflog conserva su número.</p><p><b>Límites:</b> es local (no se sube ni lo tienen tus compañeros), caduca a los 90 días, y no salva lo que nunca guardaste.</p>",
    v: ["reflog"]
  },
  "referencia": {
    m: "reflog",
    t: "Referencia (ref)",
    c: "Cualquier nombre que apunte a una foto: una rama, una etiqueta, HEAD.",
    d: "<p>Cualquier <b>nombre que apunte a un commit</b>: una rama, una etiqueta de versión, HEAD. Es lo que te evita andar copiando identificadores a mano.</p><p>Casi todo lo que parece destructivo en Git en realidad solo mueve o borra referencias. El contenido apuntado sigue en su sitio.</p>",
    v: ["referencia", "referencias"]
  },
  "objeto huérfano": {
    m: "reflog",
    t: "Objeto huérfano",
    c: "Una foto archivada que ya nadie apunta. Sigue existiendo hasta la limpieza.",
    d: "<p>Una foto que sigue archivada pero <b>a la que ya no apunta ninguna referencia</b>. Sucede tras un <code>amend</code>, un rebase o un reset.</p><p>No desaparece de inmediato: sigue disponible mientras el reflog conserve su número, típicamente 30 días. Después, la limpieza automática de Git (<i>garbage collection</i>) la elimina de verdad.</p>",
    v: ["objeto huérfano", "objetos huérfanos", "huérfano", "huérfana"]
  },
  "rebase": {
    m: "rebase",
    t: "Rebase",
    c: "Rehacer una serie de commits: reordenarlos, juntarlos o reescribir sus comentarios.",
    d: "<p><b>Rehacer una serie de commits.</b> En su forma interactiva (<code>-i</code>), Git te abre una lista editable donde decides qué hacer con cada foto: dejarla, juntarla con la anterior, cambiarle el comentario, eliminarla o moverla de lugar.</p><p>No modifica nada: genera fotos nuevas con identificadores nuevos y mueve la etiqueta. Las viejas quedan huérfanas y el reflog las conserva.</p><p><b>La regla:</b> sobre tu rama antes de publicarla, libre. Sobre algo que otros ya descargaron, nunca.</p>",
    v: ["rebase"]
  },
  "conflicto": {
    m: "rebase",
    t: "Conflicto",
    c: "Git no puede combinar dos cambios por su cuenta y te pide que decidas tú.",
    d: "<p>Cuando dos cambios tocan las mismas líneas, Git <b>no adivina</b>: se detiene, marca el archivo y te pide que decidas cuál versión queda.</p><p>No es un error ni algo que hiciste mal: es la herramienta negándose a inventar. Resuelves el archivo, haces <code>git add</code> y continúas.</p>",
    v: ["conflicto", "conflictos"]
  },
  "merge": {
    m: "rebase",
    t: "Merge",
    c: "Unir dos ramas creando una foto que tiene dos padres.",
    d: "<p>Unir dos líneas de trabajo. Crea una foto especial con <b>dos padres</b>, una por cada rama que se une, conservando ambos historiales intactos.</p><p>Es la alternativa al rebase: el merge preserva lo que pasó (incluido el desorden), el rebase reescribe para que se lea limpio. Sobre una rama compartida, merge es la opción segura.</p>",
    v: ["merge", "fusionar", "fusión"]
  },
  "checkout": {
    m: "rebase",
    t: "Checkout",
    c: "Cambiar los archivos de tu carpeta al contenido de otra foto o rama.",
    d: "<p>Cambiar el contenido de tu carpeta al de <b>otra foto o rama</b>. Tus archivos se reemplazan por los de ese momento.</p><p>Esto es exactamente lo que hace <code>bisect</code> en cada paso, y es la razón de que el script de prueba deba vivir fuera del repositorio: si estuviera dentro, el checkout se lo llevaría a mitad de la búsqueda.</p>",
    v: ["checkout"]
  },
  "etiqueta": {
    m: "rebase",
    t: "Etiqueta (tag)",
    c: "Un nombre fijo puesto a una foto concreta: una versión, un informe entregado.",
    d: "<p>Un <b>nombre fijo</b> puesto a un commit concreto. A diferencia de una rama, no avanza: se queda señalando esa foto para siempre.</p><p>Sirve para marcar hitos: una versión publicada, el estado de un informe entregado. En el laboratorio de este módulo, <code>informe-semana-40</code> es la etiqueta que marca el último punto bueno conocido — y es justo lo que le das a bisect como punto de partida.</p>",
    v: ["etiqueta", "etiquetas", "tag"]
  },
  "reset": {
    m: "reflog",
    t: "Reset",
    c: "Mover tu posición a otra foto. Con --hard, también reemplaza tus archivos.",
    d: "<p><b>Mover tu posición</b> a otro commit. Con <code>--hard</code>, además reemplaza los archivos de tu carpeta por los de esa foto, descartando lo que tuvieras sin guardar.</p><p>Es el comando que más pánico causa, y el que demuestra por qué vale la pena conocer el reflog: lo que deja sin etiqueta sigue archivado y se recupera en un comando.</p>",
    v: ["reset"]
  },
  "amend": {
    m: "reflog",
    t: "Amend",
    c: "Corregir la última foto. En realidad crea una nueva y deja huérfana la anterior.",
    d: "<p>Corregir el último commit: cambiarle el comentario o agregarle un archivo olvidado.</p><p>El nombre engaña. No corrige nada: <b>crea una foto nueva</b> con el contenido corregido, mueve la etiqueta hacia ella, y deja la anterior huérfana. Como todo en Git.</p>",
    v: ["amend"]
  },
  "cherry-pick": {
    m: "reflog",
    t: "Cherry-pick",
    c: "Copiar un commit concreto de otra rama a la tuya.",
    d: "<p>Tomar <b>un commit concreto</b> de otra rama y aplicar ese mismo cambio sobre la tuya. Útil para llevarse una corrección puntual sin traer todo lo demás.</p><p>Crea una foto nueva con identificador distinto, aunque el cambio sea idéntico: el identificador depende también del padre y de la fecha.</p>",
    v: ["cherry-pick"]
  },
  "force-with-lease": {
    m: "rebase",
    t: "--force-with-lease",
    c: "Republicar tu rama reescrita, pero fallando si alguien subió algo que no has visto.",
    d: "<p>La forma segura de publicar una rama cuyo historial reescribiste. Comprueba primero que el remoto esté donde tú crees: <b>si alguien subió algo que no has descargado, falla</b> en vez de pisarlo.</p><p><code>--force</code> a secas no comprueba nada y borra el trabajo del otro sin avisar. La diferencia entre republicar y destruir.</p>",
    v: ["--force-with-lease", "force-with-lease"]
  },
  "bisect": {
    m: "bisect",
    t: "Bisect",
    c: "Búsqueda binaria sobre el historial: encuentra el commit culpable en ~8 pasos.",
    d: "<p>Búsqueda binaria sobre el historial. Le das un punto donde está mal, uno donde estaba bien, y una forma de decidir en medio; parte el rango a la mitad en cada paso.</p><p>De 200 revisiones a 8. Con <code>bisect run</code> y un script que responda por ti, recorre la historia solo.</p><p>Es el mismo razonamiento de la fase <i>Analyze</i> de DMAIC: aislar la causa dividiendo el espacio de búsqueda en lugar de recorrerlo entero.</p>",
    v: ["bisect"]
  },
  "búsqueda binaria": {
    m: "bisect",
    t: "Búsqueda binaria",
    c: "Partir siempre por la mitad. 1000 opciones se reducen a 10 preguntas.",
    d: "<p>Adivinar un número del 1 al 100 preguntando «¿mayor o menor?». Cada respuesta <b>descarta la mitad</b> de lo que queda, así que bastan 7 preguntas.</p><p>La progresión es lo que importa: 60 opciones son 6 preguntas, 200 son 8, 1000 son 10. Duplicar el problema cuesta una sola pregunta más.</p>",
    v: ["búsqueda binaria"]
  },
  "script": {
    m: "bisect",
    t: "Script",
    c: "Un archivo de texto con comandos guardados para ejecutarlos de un tirón.",
    d: "<p>Un <b>archivo de texto con una lista de comandos</b>, de los que escribirías en la terminal, guardados para ejecutarlos todos de una vez.</p><p>No es «programar»: es anotar lo que ya harías a mano para no repetirlo. Un script de tres líneas es un script perfectamente válido.</p>",
    v: ["script", "scripts"]
  },
  "terminal": {
    m: "bisect",
    t: "Terminal",
    c: "La ventana donde escribes comandos en vez de hacer clic.",
    d: "<p>La ventana donde <b>escribes comandos</b> en lugar de hacer clic. Escribes una línea, pulsas Enter, y la respuesta se imprime debajo.</p><p>Se usa porque es exacta y repetible: un clic no se puede guardar en un archivo ni ejecutar automáticamente a las 3 de la mañana; una línea de comando sí.</p>",
    v: ["terminal", "línea de comandos", "consola"]
  },
  "código de salida": {
    m: "bisect",
    t: "Código de salida",
    c: "El número que deja un comando al terminar: 0 es «bien», cualquier otro «mal».",
    d: "<p>El número que un comando deja al terminar para decir cómo le fue: <b><code>0</code> es «bien»</b>, cualquier otro número es «mal». No se muestra en pantalla; se consulta con <code>echo $?</code>.</p><p>Es el canal por el que los programas se avisan entre sí. <code>git bisect run</code> no entiende tu script: solo lee este número. Por eso <code>125</code> —«no se puede probar»— es una respuesta distinta de <code>1</code> —«está mal»—, y confundirlas cambia el resultado.</p><p>Un pipeline que no verifica códigos de salida falla en silencio.</p>",
    v: ["código de salida", "códigos de salida"]
  },
  "determinista": {
    m: "bisect",
    t: "Determinista",
    c: "Mismos datos de entrada, mismo resultado, siempre. Sin azar ni fechas de por medio.",
    d: "<p>Que con <b>la misma entrada produce siempre la misma salida</b>. Sin azar, sin depender de la hora ni de datos que cambian.</p><p>Es un requisito, no un lujo: si la prueba de bisect no es determinista, la respuesta cambia sin que cambie el código y la búsqueda converge en cualquier parte. Por eso los datos del laboratorio están congelados.</p>",
    v: ["determinista", "deterministas", "determinismo"]
  },
  "MTTR": {
    t: "MTTR",
    c: "Tiempo medio de resolución: cuánto tarda en cerrarse una alarma, en promedio o mediana.",
    d: "<p><i>Mean Time To Repair</i>: cuánto <b>tarda en resolverse</b> una alarma desde que aparece hasta que se cierra.</p><p>Aunque el nombre diga «mean» (promedio), en operación casi siempre se reporta con la <b>mediana</b>: los tiempos de resolución tienen cola larga y unos pocos casos extremos arrastran el promedio hacia arriba.</p><p>Esa decisión —mediana o promedio— es exactamente el defecto sembrado en el laboratorio de este módulo.</p>",
    v: ["MTTR"]
  },
  "mediana": {
    t: "Mediana",
    c: "El valor del medio: la mitad de los casos está por debajo y la mitad por encima.",
    d: "<p>El <b>valor del medio</b> cuando ordenas todos los casos: la mitad queda por debajo y la mitad por encima.</p><p>No le afectan los extremos. Si una alarma tardó 40 horas porque el técnico no pudo llegar, la mediana no se mueve; el promedio sí. Por eso, con tiempos de resolución, la mediana describe mejor «lo que pasa normalmente».</p>",
    v: ["mediana"]
  },
  "promedio": {
    t: "Promedio (media)",
    c: "Sumar todo y dividir. Los casos extremos lo arrastran.",
    d: "<p>Sumar todos los valores y dividir entre cuántos son.</p><p>Su debilidad: <b>cada caso extremo lo arrastra</b>. En una distribución con cola larga, el promedio queda por encima de casi todos los casos reales, y quien lee el informe se lleva una idea equivocada de la operación.</p>",
    v: ["promedio", "promedios", "media aritmética"]
  },
  "cola larga": {
    t: "Cola larga",
    c: "La mayoría de los casos se agrupa abajo, pero unos pocos se van muy lejos.",
    d: "<p>Una distribución donde <b>la mayoría de los casos se agrupa en valores bajos</b> pero unos pocos se van muchísimo más lejos.</p><p>Los tiempos de resolución de alarmas son el ejemplo de manual: casi todo se cierra en una o dos horas, y un puñado tarda dos días por falta de repuesto o acceso al sitio.</p><p>Es la razón por la que cambiar mediana por promedio mueve el MTTR de 2.83 a 4.11 horas. Con datos simétricos, ese mismo error habría pasado inadvertido.</p>",
    v: ["cola larga"]
  },
  "KPI": {
    t: "KPI",
    c: "Un indicador que resume el desempeño de algo en un número seguible.",
    d: "<p><i>Key Performance Indicator</i>: un <b>indicador</b> que resume el desempeño de una operación en un número que se puede seguir en el tiempo y comparar.</p><p>En este proyecto: MTTR, reincidencia de alarmas y disponibilidad por zona.</p>",
    v: ["KPI", "KPIs"]
  },
  "NOC": {
    t: "NOC",
    c: "Centro de operaciones de red: quien vigila las alarmas y coordina su resolución.",
    d: "<p><i>Network Operations Center</i>: el centro desde el que se <b>vigila una red</b>, se reciben las alarmas de los equipos y se coordina su resolución.</p><p>Es el dominio del proyecto de la ruta, y no es casual: ocho años operando uno te dan criterio sobre qué anomalía es un problema real y cuál es ruido del sistema de tickets. Eso no se estudia.</p>",
    v: ["NOC"]
  },
  "idempotencia": {
    t: "Idempotencia",
    c: "Correr el proceso dos veces sobre lo mismo deja el resultado idéntico.",
    d: "<p>Que ejecutar el proceso <b>dos veces sobre los mismos datos deje exactamente el mismo resultado</b> que ejecutarlo una vez. Sin filas duplicadas, sin totales inflados.</p><p>Es lo que permite reprocesar un día que falló sin ensuciar los datos, y la prueba no es la intención: se corre dos veces y el conteo de filas tiene que ser idéntico.</p><p><b>En esta ruta:</b> se estudia como concepto en la Fase 0 y se cierra en código en la Fase 4.</p>",
    v: ["idempotencia", "idempotente"]
  },
  "Delta Lake": {
    t: "Delta Lake",
    c: "Formato de tablas que añade transacciones e historial sobre archivos en la nube.",
    d: "<p>Un formato de tablas que añade <b>transacciones, historial y control de concurrencia</b> a archivos guardados en almacenamiento de nube.</p><p>Lo consigue con un registro de transacciones: una lista ordenada de operaciones a partir de la cual se reconstruye el estado de la tabla. Es el mismo principio que el historial de Git, aplicado a datos.</p><p><b>En esta ruta:</b> Fase 2, y ahí se abre ese registro para leerlo a mano.</p>",
    v: ["Delta Lake", "Delta"]
  },
  "lakehouse": {
    t: "Lakehouse",
    c: "Almacenar archivos baratos en la nube, pero consultarlos como si fueran un almacén de datos.",
    d: "<p>Guardar los datos como <b>archivos en almacenamiento barato de nube</b> y, encima, una capa que los hace consultables con las garantías de un almacén de datos tradicional: transacciones, esquema, permisos.</p><p>La idea: no elegir entre la flexibilidad del lago de datos y la seriedad del almacén.</p>",
    v: ["lakehouse"]
  },
  "Spark": {
    t: "Spark",
    c: "Motor que reparte el trabajo sobre muchas máquinas para procesar datos grandes.",
    d: "<p>El motor que <b>reparte el procesamiento entre muchas máquinas</b> para trabajar con volúmenes que no caben en una sola.</p><p>Escribes la transformación como si fuera una tabla entera; Spark decide cómo partirla, qué mandar a cada máquina y en qué orden. Cuando esas decisiones salen mal, el trabajo tarda diez veces más — y diagnosticarlo es el contenido de la Fase 3.</p>",
    v: ["Spark"]
  },
  "DMAIC": {
    t: "DMAIC",
    c: "El ciclo de Six Sigma: Definir, Medir, Analizar, Mejorar, Controlar.",
    d: "<p>El ciclo de mejora de Lean Six Sigma: <b>Define, Measure, Analyze, Improve, Control</b>.</p><p>Aparece en esta ruta porque la fase <i>Analyze</i> es exactamente lo que hace bisect: aislar la causa de un defecto dividiendo el espacio de búsqueda, en lugar de revisar todo. El método ya lo tienes; cambia el objeto al que se aplica.</p>",
    v: ["DMAIC"]
  },
  "CI": {
    t: "CI / CD",
    c: "Validación automática de cada cambio, y despliegue automático de lo que pasa la validación.",
    d: "<p><b>Integración continua:</b> cada cambio que subes dispara automáticamente las pruebas, y si algo falla te enteras en minutos en vez de en el informe del lunes.</p><p><b>Despliegue continuo:</b> lo que pasa esas pruebas se publica solo, sin pasos manuales.</p><p><b>En esta ruta:</b> Fase 5, cerrando el círculo que abre la Fase 0 con Git.</p>",
    v: ["CI/CD", "CI"]
  },
  "CSV": {
    t: "CSV",
    c: "Archivo de texto con una fila por línea y columnas separadas por comas.",
    d: "<p>Un archivo de texto plano con <b>una fila por línea</b> y las columnas separadas por comas. Lo que exportas de casi cualquier sistema.</p><p>Su virtud es que lo abre todo; su defecto, que no guarda tipos de dato ni estadísticas, así que para leer una columna hay que recorrer el archivo entero. Eso es justo lo que resuelve Parquet, en la Fase 0 y la 2.</p>",
    v: ["CSV"]
  },

  /* Lección aparte: «El bot de los $55» (bot-de-los-55.html) */
  "simulación de Monte Carlo": {
    t: "Simulación de Monte Carlo",
    c: "Repetir un proceso con azar miles de veces para ver todos los resultados posibles, no uno solo.",
    d: "<p>Correr <b>el mismo proceso con azar miles de veces</b>, cada vez con una tirada distinta, y mirar la distribución completa de resultados en vez de un caso suelto.</p><p>Responde la pregunta que un caso aislado no puede responder: <i>¿esto es lo normal o es un extremo?</i></p><p><b>En la lección del bot:</b> correr 10.000 bots iguales es una simulación de Monte Carlo. El post muestra una sola corrida.</p>",
    v: ["simulación de Monte Carlo", "Monte Carlo"]
  },
  "semilla": {
    t: "Semilla",
    c: "El número con el que arranca el azar de una simulación. Misma semilla, mismos resultados.",
    d: "<p>El <b>punto de partida</b> de un generador de números al azar. La computadora no tira dados: calcula una secuencia que parece azar a partir de un número inicial.</p><p>Consecuencia práctica: <b>con la misma semilla, la secuencia sale idéntica</b>. Por eso un experimento con azar se puede repetir y auditar, y por eso el script y la página del bot imprimen los mismos números.</p><p>El laboratorio de bisect también usa una semilla fija: es lo que congela sus datos.</p>",
    v: ["semilla", "semillas"]
  },
  "sesgo de supervivencia": {
    t: "Sesgo de supervivencia",
    c: "Sacar conclusiones mirando solo a los que pasaron un filtro, sin ver a los que quedaron fuera.",
    d: "<p>Sacar conclusiones mirando <b>solo los casos que pasaron un filtro</b>, sin ver los que quedaron fuera.</p><p>El ejemplo de manual: en la Segunda Guerra Mundial se estudiaban los impactos de bala en los aviones que volvían, para reforzar esas zonas. Abraham Wald señaló lo contrario: había que reforzar donde <i>no</i> había impactos, porque los aviones tocados ahí no volvían.</p><p><b>En la lección del bot:</b> nadie publica el video del bot que quebró. Ves solo al que sobrevivió, y el filtro es invisible.</p>",
    v: ["sesgo de supervivencia"]
  },
  "tasa de acierto": {
    t: "Tasa de acierto",
    c: "Qué porcentaje de operaciones terminó en ganancia. No dice cuánto se ganó ni cuánto se perdió.",
    d: "<p>El <b>porcentaje de operaciones que terminaron en ganancia</b>, sin importar de cuánto.</p><p>Es el número favorito de quien vende un bot: suele ser alto y se entiende al instante. Su trampa es que cuenta igual una ganancia de $1 que una pérdida de $100. Un sistema puede acertar 9 de cada 10 y perder dinero, si la décima se lleva todo.</p><p>Se lee siempre junto a la <b>esperanza matemática</b>.</p>",
    v: ["tasa de acierto", "win rate"]
  },
  "esperanza matemática": {
    t: "Esperanza matemática",
    c: "Lo que deja en promedio una operación: cada resultado posible por su probabilidad, todo sumado.",
    d: "<p>Lo que <b>deja en promedio</b> una operación si se repitiera muchas veces: cada resultado posible multiplicado por su probabilidad, y todo sumado.</p><p>KADE, en la lección del bot: el 70 % de las veces gana 15 %, el 4 % sale ×3.5 y el 26 % restante pierde 79 %. La cuenta da <b>cero</b> antes de costos y −3.5 % después. Su tasa de acierto es 74 %; su esperanza, negativa.</p><p>Con esperanza negativa, más operaciones solo significan perder más rápido.</p>",
    v: ["esperanza matemática"]
  },
  "slippage": {
    t: "Slippage (deslizamiento)",
    c: "La diferencia entre el precio que viste y el precio al que de verdad se compró o se vendió.",
    d: "<p>La diferencia entre el precio que mostraba la pantalla y el precio al que <b>de verdad se ejecutó</b> la compra o la venta. En mercados con poco volumen, tu propia orden mueve el precio en tu contra.</p><p>Se paga dos veces por operación: al entrar y al salir. El registro del propio post muestra entre 1.2 % y 2.1 % por lado; sumado a la comisión, cada operación arranca perdiendo cerca de 3.5 %.</p>",
    v: ["slippage", "deslizamiento"]
  },
  "backtest": {
    t: "Backtest",
    c: "Probar una estrategia contra datos del pasado para ver cómo le habría ido.",
    d: "<p>Correr una estrategia <b>contra datos del pasado</b> para ver cómo le habría ido.</p><p>Útil y peligroso: si pruebas mil variantes sobre los mismos datos y te quedas con la mejor, encontraste la que mejor encaja con ese pasado en particular, no la que funciona. Es el truco de los 10.000 bots, hecho sin querer.</p>",
    v: ["backtest", "backtests", "backtesting"]
  },
  "sobreajuste": {
    t: "Sobreajuste",
    c: "Una estrategia que aprendió el ruido de sus datos en vez del patrón: brilla en el pasado y falla después.",
    d: "<p>Cuando un modelo o una estrategia <b>aprende el ruido de los datos con que se construyó</b> en vez del patrón real. Brilla en esos datos y falla en los nuevos.</p><p>La defensa profesional es separar datos que nunca se usaron para elegir —datos <i>fuera de muestra</i>— y juzgar solo con ellos.</p>",
    v: ["sobreajuste", "fuera de muestra"]
  },
  "billetera": {
    t: "Billetera (wallet)",
    c: "La cuenta donde viven los fondos en una cadena de bloques. Sus movimientos son públicos.",
    d: "<p>La <b>cuenta</b> donde viven los fondos en una cadena de bloques como Solana. Se identifica con una dirección pública: una cadena larga de letras y números.</p><p>Lo que importa aquí: <b>cada compra y cada venta queda registrada en público</b>, y cualquiera puede revisarla en un explorador como Solscan. Un reclamo de ganancias sin dirección no se puede verificar; uno con dirección, sí.</p>",
    v: ["billetera", "billeteras", "wallet"]
  },
  "MCP": {
    t: "MCP",
    c: "Un protocolo estándar para conectar herramientas externas a un agente de IA.",
    d: "<p><i>Model Context Protocol</i>: una forma estándar de <b>conectar herramientas a un agente de IA</b> como Claude Code. El agente no sabe manejar un desensamblador; un servidor MCP le da los controles para hacerlo.</p><p>REA es un servidor MCP: le da al agente instrumentos para desarmar programas ajenos.</p>",
    v: ["MCP"]
  },
  "ingeniería inversa": {
    t: "Ingeniería inversa",
    c: "Deducir cómo funciona un programa a partir del programa terminado, sin su código fuente.",
    d: "<p>Deducir <b>cómo funciona un programa a partir del programa ya terminado</b>, sin acceso a cómo se escribió: se desarma el ejecutable, se observa qué hace y se reconstruye la lógica.</p><p>Tiene una condición previa: <b>tener el programa</b>. Un video de una pantalla no es un programa, y la lógica de un servicio vive en un servidor al que no se llega.</p>",
    v: ["ingeniería inversa"]
  },
  "streaming": {
    t: "Streaming",
    c: "Procesar los datos a medida que llegan, evento por evento, en vez de esperar al lote del día.",
    d: "<p>Procesar los datos <b>a medida que llegan</b>, evento por evento, en vez de juntarlos y procesarlos de una vez al final del día (el lote).</p><p>Lo difícil no es la velocidad: es que los eventos llegan tarde y desordenados, y hay que decidir cuánto esperar antes de cerrar una cuenta. Eso es la <b>marca de agua</b>.</p><p><b>En esta ruta:</b> Fase 4.</p>",
    v: ["streaming"]
  },
  "marca de agua": {
    t: "Marca de agua",
    c: "Cuánto espera un proceso en streaming por los eventos atrasados antes de cerrar una ventana de tiempo.",
    d: "<p>La regla que dice <b>cuánto esperar por los eventos que llegan tarde</b> antes de dar por cerrada una ventana de tiempo y emitir su resultado.</p><p>Esperar poco deja datos fuera; esperar mucho retrasa todo. Es la misma decisión que tomas cuando cierras el informe del turno sabiendo que todavía pueden entrar tickets del turno anterior.</p><p><b>En esta ruta:</b> Fase 4.</p>",
    v: ["marca de agua", "marcas de agua"]
  }
};
