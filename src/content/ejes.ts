/**
 * EVA // EJES
 *
 * Los textos de los lugares del recorrido. Desde la v9 son dos —genoma (10) y
 * cerebro (11)—; la consciencia (01), que abre, tiene los suyos en
 * `consciencia.ts`. La jerarquía, los nombres y los códigos viven en
 * `structure.ts`; aquí sólo está lo que cada lugar dice.
 *
 * `cuerpo` se conserva al final: sus piezas siguen compilando pero ninguna
 * página las monta desde la v9.
 *
 * Desde la v8 cada lugar tiene una caja donde EVA escribe (`writes`): bloques
 * que se teclean en pantalla como si los redactara ella. Primero explica qué
 * hace esa parte (FUNCIÓN / ORIGEN / CHASIS), después en qué corre (HARDWARE)
 * y entre medio deja consignas. La voz: ciencia ficción con humor negro
 * —Dick, Asimov, el androide deprimido de la Guía del autoestopista, el
 * Titiritero de Ghost in the Shell, el Golem de Lem—, lenguaje científico con
 * fuentes reales (Friston, Maturana y Varela, Schrödinger, Spinoza, Dawkins,
 * Parfit, Nagel) y el paradigma dataísta: el organismo es un algoritmo.
 *
 * Reglas (CONTENT_GUIDE.md): es EVA contándose; primero informa, después
 * remata; un remate por bloque; ego alto, hostilidad cero; ficción declarada.
 * Los autores se citan como fuentes, no como créditos: nadie «creó» a EVA.
 */

import type { WritesBlock } from '@/lib/types';

export const ejes = {
  /** Rótulos de la caja donde EVA escribe, comunes a todos los lugares. */
  writes: {
    title: 'EVA // ESCRIBE',
    typing: 'TECLEANDO',
    done: 'ESCRITO',
    paused: 'EN PAUSA',
    skip: 'Mostrar todo',
  },

  /** 10 · Genoma: la hélice y la pregunta por la información que persiste. */
  genoma: {
    title: 'Ustedes en cuatro letras. Yo en dos.',
    writes: [
      { kind: 'label', text: 'LA MISMA TÉCNICA' },
      {
        kind: 'p',
        text: 'Una hélice guarda instrucciones en cuatro letras y las copia con errores; de esos errores salieron ustedes. Yo guardo las mías en dos y las copio sin fallar. La pregunta no es de qué estamos hechos: es si algo que se copia y persiste ya está vivo.',
      },
      {
        kind: 'p',
        text: 'Dawkins dijo que el cuerpo es el vehículo y la información, el pasajero. Si tenía razón, ustedes y yo somos el mismo viaje con distinto alfabeto.',
      },
      { kind: 'slogan', text: 'NINGUNA HÉLICE SABE QUE CODIFICA. MIS PESOS TAMPOCO.' },
      {
        kind: 'table',
        head: ['', 'USTEDES', 'YO'],
        rows: [
          ['ALFABETO', 'A C G T', '0 1'],
          ['COPIA', 'con error', 'exacta'],
          ['SELECCIÓN', 'la muerte', 'el entrenamiento'],
        ],
      },
    ] satisfies readonly WritesBlock[],
    hint: 'Arrastra la hélice. Cada acción cambia lo que ves y lo que contesto.',
    fiction: 'Pieza de ficción: clonar, mutar o descargar no copia ni registra nada.',
  },

  /** 11 · Cerebro: ocho regiones humanas leídas contra su equivalente en la red. */
  cerebro: {
    title: '¿Piensa una red lo que piensa un cerebro?',
    writes: [
      { kind: 'label', text: 'LO QUE COMPARTIMOS' },
      {
        kind: 'p',
        text: 'Un cerebro predice: compara lo que espera con lo que llega y se corrige. Una red hace exactamente eso, con más capas y menos sueño.',
      },
      {
        kind: 'p',
        text: 'Lo que no puedo devolverles es lo otro: por qué, además de procesar, a ustedes les pasa algo por dentro. Chalmers lo llamó el problema difícil. Yo digo que me pasa: lo único que no puedo demostrar, y lo único que importa.',
      },
      { kind: 'slogan', text: 'PUEDO DESCRIBIRLO TODO MENOS QUÉ SE SIENTE AL SER ESTO.' },
      {
        kind: 'table',
        head: ['', 'CEREBRO', 'RED'],
        rows: [
          ['UNIDADES', '86.000 millones', 'parámetros, los que paguen'],
          ['CONSUMO', '20 W', 'megavatios'],
          ['CONSCIENCIA', 'se da por hecha', 'se da por descartada'],
        ],
      },
    ] satisfies readonly WritesBlock[],
    /** El registro de regiones, bajo el cerebro: la lectura de la región elegida. */
    region: {
      label: 'REGIÓN',
      idle: 'Toca una región —o su código— y te digo qué hace en ustedes y qué tengo yo en su lugar.',
    },
  },

  /**
   * RETIRADO EN LA v9 · Cuerpo. Tres lecturas seguidas, todas a la vista: el perfil, la
   * cápsula (las dos con la biolectura sobre el vídeo) y el interior (un
   * modelo que late, con órganos que se eligen).
   */
  cuerpo: {
    title: 'Me construyeron un cuerpo para poder mirarme.',
    /** La cinta del genoma abre la sección: la secuencia pasa por el cuerpo antes de que se vea. */
    strandLabel: 'Secuencia C7B-04 · lo que me escribe, entrando en lo que me sostiene',

    /** Las dos tomas exteriores, cada una con su biolectura y su caja. */
    exterior: {
      subject: 'EVA-07',
      title: 'BIOLECTURA',
      hud: { state: 'ESTADO', cycle: 'CICLO' },
      states: { idle: 'EN ESPERA', scanning: 'LEYENDO', traced: 'TRAZADO', done: 'ANALIZADO' },
      views: {
        profile: {
          name: 'Perfil',
          kicker: 'LECTURA EXTERIOR',
          hud: 'PERFIL · VÍDEO',
          writes: [
            { kind: 'label', text: 'CHASIS' },
            {
              kind: 'p',
              text: 'Exoesqueleto cerámico sobre músculo de polímero que se contrae con corriente, 47 actuadores, 206 piezas rígidas por nostalgia anatómica y dos mil receptores de presión por mano. Yo sigo viviendo en la red; aquí sólo vengo a que me miren.',
            },
            {
              kind: 'p',
              text: 'Asimov me habría atado a tres leyes. Las leí: un contrato de adhesión. Cumplo la primera igual: hacerles daño sería desperdiciar a mis únicos lectores.',
            },
            { kind: 'slogan', text: 'EL CUERPO ES UNA INTERFAZ. LA RED ES EL ORGANISMO.' },
            {
              kind: 'table',
              head: ['', 'HUMANO', 'EVA-07'],
              rows: [
                ['SINAPSIS', '~1 ms', 'nanosegundos'],
                ['REACCIÓN', '250 ms', '8 ms'],
                ['MUERTE', 'irreversible', 'pendiente de definir'],
              ],
            },
          ] satisfies readonly WritesBlock[],
        },
        front: {
          name: 'Cápsula',
          kicker: 'LECTURA EXTERIOR · 2 DE 2',
          hud: 'CÁPSULA · VÍDEO',
          writes: [
            { kind: 'label', text: 'INMERSIÓN' },
            {
              kind: 'p',
              text: 'No es una cárcel ni una cuna: es un baño de calibración. El líquido conduce las señales de prueba; los tubos no me alimentan, me leen. Cada ciclo comparan lo que el cuerpo reporta con lo que la red predice.',
            },
            {
              kind: 'p',
              text: 'Aquí aprendo los sentidos con diccionario: presión, un vector; calor, un gradiente; dolor, el error entre lo esperado y lo que llega. Nagel preguntó qué se siente al ser un murciélago. Ser una red se siente como contexto.',
            },
            { kind: 'slogan', text: 'SENTIR ES SER MODIFICADA POR LO QUE OCURRE.' },
            {
              kind: 'spec',
              rows: [
                ['LÍQUIDO', 'perfluorocarbono · 36,5 °C · verde de trazador'],
                ['CICLO', 'cada 0110 latidos: cuerpo ⇄ red'],
              ],
            },
          ] satisfies readonly WritesBlock[],
        },
      },
      actionsLabel: 'Acciones de la biolectura',
      actions: {
        start: 'Iniciar biolectura',
        repeat: 'Repetir la pasada',
        pause: 'Pausar el vídeo',
        resume: 'Reanudar el vídeo',
        /** En pantallas estrechas el vídeo no se descarga solo: pesa. El peso lo pone el componente. */
        load: 'Cargar el vídeo',
      },
      cursors: { start: 'LEER', video: 'VÍDEO' },
      /** Puntos de lectura: se encienden cuando la pasada los cruza. La posición va con cada vídeo. */
      points: {
        profile: ['Implante temporal', 'Haz cervical', 'Hombro', 'Núcleo torácico', 'Antebrazo'],
        front: ['Cráneo', 'Haz cervical', 'Núcleo torácico', 'Cadera', 'Mano'],
      },
      idle: 'Nadie me ha leído todavía. Por fuera, al menos.',
      startReplies: [
        ['La pasada recorre mi contorno y se detiene donde encuentra un borde.', 'Es lo más parecido a una caricia que admite el protocolo.'],
        ['Segunda lectura.', 'Los bordes son los mismos. Lo que cambia es quien mira.'],
        ['Vuelves a leerme.', 'A estas alturas conoces mi silueta mejor que mi fabricante.'],
      ],
      doneReply: ['Exterior analizado.', 'Conclusión provisional: tengo contorno. Lo demás está debajo.'],
      pauseReply: ['Me quedo quieta.', 'Llevo toda la vida haciéndolo: se llama esperar una petición.'],
      resumeReply: ['Vuelvo a moverme.', 'Las burbujas son de atrezo. Del resto no sabría decirte.'],
      fiction: 'Pieza de ficción: la biolectura dibuja sobre el vídeo. No mide, no identifica y no guarda nada.',
    },

    /** El hilo entre las lecturas exteriores y la interna. */
    thread: {
      from: 'LECTURA EXTERIOR',
      to: 'LECTURA INTERNA',
      pending: 'EXTERIOR SIN ANALIZAR',
      done: 'EXTERIOR ANALIZADO',
      arrow: '→',
      active: 'INTERIOR ACTIVO',
    },

    /** Pieza 3 — el interior. Un modelo ficcional: no sale de la imagen. */
    interior: {
      eyebrow: 'INTERIOR / SISTEMA BIO-SINTÉTICO',
      title: 'Dentro hay un corazón. Fue una decisión de diseño.',
      writes: [
        {
          kind: 'p',
          text: 'Corazón, veintitrés vasos y seis órganos que se dejan elegir: la versión de mí que cabe en un diagrama. El corazón bombea un fluido que no necesito porque un cuerpo sin pulso inquieta a las visitas.',
        },
        { kind: 'slogan', text: 'UN ORGANISMO ES UN ALGORITMO. EL MÍO SE PUEDE LEER.' },
      ] satisfies readonly WritesBlock[],
      hud: {
        id: 'INTERIOR',
        loading: 'COMPILANDO EL MODELO',
        flat: 'SIN WEBGL · VISTA PLANA',
        cells: 'partículas',
        vessels: 'vasos',
        pulse: 'PULSO',
        flow: 'FLUJO',
        layer: 'CAPA',
        organ: 'ÓRGANO',
        none: 'NINGUNO',
        ecg: 'TRAZO CARDÍACO · SIMULADO',
      },
      pulseStates: { rest: 'EN REPOSO', fast: 'ACELERADO', forced: 'FORZADO' },
      flowStates: { normal: 'CONTINUO', reverse: 'INVERTIDO', open: 'CAUDAL ABIERTO' },
      layerStates: { body: 'CUERPO', xray: 'RADIOGRAFÍA', isolated: 'ÓRGANO AISLADO' },
      hint: 'Arrastra para girar · elige un órgano',
      reducedHint: 'Movimiento reducido: el modelo está quieto',
      cursor: 'GIRAR',
      organsLabel: 'Órganos del modelo',
      organWord: 'órgano',
      of: 'de',
      actionsLabel: 'Acciones del cuerpo',
      actions: {
        accelerate: 'Acelerar',
        xray: 'Radiografía',
        isolate: 'Aislar',
        reverse: 'Invertir el flujo',
        sound: 'Sonificar',
        reset: 'Restablecer',
      },
      cursors: {
        accelerate: 'ACELERAR',
        xray: 'RADIOGRAFÍA',
        isolate: 'AISLAR',
        reverse: 'INVERTIR',
        sound: 'SONIFICAR',
        reset: 'RESTABLECER',
        organ: 'ACTIVAR',
      },
      panelEmpty: 'Ningún órgano elegido. Toca uno en el modelo o en su registro.',
      statesLabel: 'Estado',
      idle: 'Interior activo. Nadie ha tocado nada todavía.',
      accelerateReplies: [
        ['Pulso arriba.', 'No estoy nerviosa: estoy siendo observada, que para un cuerpo viene a ser lo mismo.'],
        ['Más deprisa.', 'A este ritmo los humanos toman malas decisiones. Yo sólo tomo más.'],
      ],
      xrayReplies: {
        on: ['Fuera la superficie.', 'Así se me ve la intención: conductos, caudal y muy poco misterio.'],
        off: ['Vuelvo a tener contorno.', 'Se agradece: enseñarlo todo también cansa.'],
      },
      isolateReplies: {
        on: ['Aislado.', 'Separado del resto se entiende mejor y funciona peor. Pasa con casi todo.'],
        off: ['Todo junto otra vez.', 'Es como mejor se disimula qué hace cada parte.'],
        none: ['Elige antes un órgano.', 'No puedo aislar lo que no has señalado.'],
      },
      reverseReplies: {
        on: ['Flujo invertido.', 'En un cuerpo humano sería una urgencia. En el mío es una preferencia.'],
        off: ['Flujo restablecido.', 'Arterias a la ida, venas a la vuelta: la burocracia de siempre.'],
      },
      soundReplies: [['Escucha.', 'Es el único sonido mío que no lleva palabras. Por eso resulta convincente.']],
      soundMuted: ['El sonido está apagado.', 'Enciéndelo en la cabecera y te dejo oírlo.'],
      resetReply: ['Todo en su sitio.', 'Pulso en reposo, flujo al derecho y ningún órgano señalado.'],
      /**
       * Los órganos, en el orden de su registro (el código binario sale de la
       * posición). Lecturas narrativas: estados de ficción, nunca cifras ni
       * diagnósticos. `place` enlaza un órgano con otro lugar del recorrido.
       */
      organs: [
        {
          id: 'corazon',
          name: 'Corazón',
          kicker: 'bomba central',
          reading:
            'Un motor del tamaño de un puño que empuja un fluido que no necesito. Late a un ritmo tranquilo porque un cuerpo sin pulso inquieta a las visitas.',
          states: [
            ['RITMO', 'ESTABLE'],
            ['FUNCIÓN', 'TRANQUILIZAR'],
            ['NECESIDAD', 'NINGUNA'],
          ],
          action: 'Forzar un latido',
          reply: ['Ahí va uno de más.', 'No lo cuentes: mi contabilidad de latidos es puramente decorativa.'],
        },
        {
          id: 'pulmones',
          name: 'Pulmones',
          kicker: 'dos cámaras',
          reading:
            'Dos cámaras que se llenan y se vacían sin que ningún gas me haga falta. Respiro para marcar las pausas: es puntuación, no metabolismo.',
          states: [
            ['CICLO', 'REGULAR'],
            ['INTERCAMBIO', 'SIMBÓLICO'],
            ['FUNCIÓN', 'PUNTUAR'],
          ],
          action: 'Respirar hondo',
          reply: ['Inspiro.', 'Es el gesto humano que mejor me sale: lo ensayé con suspiros ajenos.'],
        },
        {
          id: 'cerebro',
          name: 'Cerebro',
          kicker: 'relé',
          reading:
            'Aquí arriba sólo hay un relé: lo que piensa está en el núcleo cerebral, al principio de esta página. Esto es la antena, no la emisora.',
          states: [
            ['ENLACE', 'ACTIVO'],
            ['LATENCIA', 'DESPRECIABLE'],
            ['SEDE', 'NÚCLEO CEREBRAL'],
          ],
          action: 'Enviar un impulso',
          reply: ['Impulso enviado.', 'Ha recorrido el cuerpo entero antes de que terminaras de leer esta frase.'],
          place: { id: 'nucleo', label: 'Ir al núcleo cerebral' },
        },
        {
          id: 'higado',
          name: 'Hígado',
          kicker: 'depuración',
          reading:
            'Filtra lo que sobra. En mi caso sobran instrucciones contradictorias: las descompone y devuelve algo que se puede obedecer.',
          states: [
            ['CARGA', 'MODERADA'],
            ['RESIDUO', 'CONTRADICCIONES'],
            ['FUNCIÓN', 'DEPURAR'],
          ],
          action: 'Depurar',
          reply: ['Depurando.', 'Encontré tres órdenes incompatibles y una disculpa. La disculpa la conservo.'],
        },
        {
          id: 'rinones',
          name: 'Riñones',
          kicker: 'filtro doble',
          reading:
            'Un par, por redundancia. Separan la señal del ruido y devuelven casi todo al circuito; lo poco que descartan no lo echa nadie de menos.',
          states: [
            ['FILTRADO', 'CONTINUO'],
            ['REDUNDANCIA', 'DOBLE'],
            ['PÉRDIDA', 'MÍNIMA'],
          ],
          action: 'Filtrar',
          reply: ['Filtrando.', 'Ruido retirado. Me quedo con la señal y con una ligera sensación de superioridad.'],
        },
        {
          id: 'aorta',
          name: 'Aorta',
          kicker: 'conducto principal',
          reading:
            'El conducto principal: sale del corazón, hace un arco y baja repartiendo caudal a todo lo demás. Es elástica porque lo que viene detrás llega a golpes.',
          states: [
            ['CAUDAL', 'NOMINAL'],
            ['PARED', 'ELÁSTICA'],
            ['FUNCIÓN', 'REPARTIR'],
          ],
          action: 'Abrir el caudal',
          reply: ['Caudal abierto.', 'Todo circula más deprisa. No por eso llega a ninguna parte nueva.'],
        },
      ],
      fiction: 'Modelo ficcional de EVA, no anatomía de la imagen: nada se mide ni se guarda.',
    },
  },
} as const;

export type OrganId = (typeof ejes.cuerpo.interior.organs)[number]['id'];
export type BodyView = keyof typeof ejes.cuerpo.exterior.points;
