/*
 * Contenido de Crece en Casa (MVP según guía de implementación).
 * Orientaciones educativas; no constituyen diagnóstico ni tratamiento.
 */
window.CEC = window.CEC || {};

window.CEC.data = (function () {
  const IMG = "assets/img/temporal/";

  function image(file, width, height) {
    return { src: IMG + file, width, height };
  }

  const ages = [
    { value: 2, label: "2 años", tagline: "Descubrir y expresar", tone: "pink", image: image("edad-2.jpeg", 220, 180) },
    { value: 3, label: "3 años", tagline: "Nombrar y comprender", tone: "yellow", image: image("edad-3.jpeg", 220, 180) },
    { value: 4, label: "4 años", tagline: "Conversar y crear ideas", tone: "green", image: image("edad-4.jpeg", 220, 180) },
    { value: 5, label: "5 años", tagline: "Contar, jugar y compartir", tone: "lavender", image: image("edad-5.jpeg", 220, 180) },
  ];

  const areas = [
    { id: "vocabulario", label: "Vocabulario y significado", icon: "i-vocabulario", tone: "blue" },
    { id: "comprension", label: "Comprensión del lenguaje", icon: "i-comprension", tone: "coral" },
    { id: "expresion", label: "Expresión del lenguaje", icon: "i-expresion", tone: "lavender" },
    { id: "interaccion", label: "Interacción comunicativa", icon: "i-interaccion", tone: "violet" },
  ];

  const moments = [
    { id: "comida", label: "Preparando o comiendo", flowLabel: "Preparando o comiendo alimentos", shortLabel: "Comida", icon: "i-casa", tone: "coral", image: image("momento-comida.png", 237, 237) },
    { id: "rutinas", label: "Vistiéndose", flowLabel: "Vistiéndose", shortLabel: "Rutinas", icon: "i-brote", tone: "green", image: image("momento-vestirse.png", 230, 230) },
    { id: "juego", label: "Jugando en casa", flowLabel: "Jugando en casa", shortLabel: "Juego", icon: "i-juego", tone: "yellow", image: image("momento-juego.png", 224, 224) },
    { id: "afuera", label: "Caminando o explorando afuera", flowLabel: "Caminando o explorando afuera", shortLabel: "Afuera", icon: "i-interaccion", tone: "blue", image: image("momento-afuera.png", 227, 227) },
    { id: "lectura", label: "Leyendo un cuento", flowLabel: "Leyendo un cuento", shortLabel: "Lectura", icon: "i-vocabulario", tone: "lavender", image: image("momento-cuento.png", 226, 226) },
  ];

  const durations = [
    { id: "2-5", label: "2–5 minutos" },
    { id: "5-10", label: "5–10 minutos" },
    { id: "10-15", label: "10–15 minutos" },
  ];

  /* Solo «Objetos de casa» en esta versión; Imprimible queda oculto. */
  const materials = [{ id: "casa", label: "Objetos de casa" }];

  const experienceSkills = [
    { id: "vocabulario", label: "Vocabulario", areaId: "vocabulario" },
    { id: "comprension", label: "Comprensión del lenguaje", areaId: "comprension" },
    { id: "combinacion", label: "Combinación de palabras y frases", areaId: "expresion" },
    { id: "narracion", label: "Narración y conversación", areaId: "interaccion" },
  ];

  const experienceDurations = [
    { id: "3", label: "3 min", durationId: "2-5" },
    { id: "5", label: "5 min", durationId: "5-10" },
    { id: "10", label: "10 min", durationId: "10-15" },
  ];

  const interests = [
    { id: "animales", label: "Animales", icon: "i-paw" },
    { id: "vehiculos", label: "Carros y vehículos", icon: "i-car" },
    { id: "musica", label: "Música", icon: "i-music" },
    { id: "naturaleza", label: "Naturaleza", icon: "i-leaf" },
    { id: "cocina", label: "Objetos cotidianos y cocina", icon: "i-bowl" },
    { id: "otro", label: "Otro interés", icon: "i-spark" },
  ];

  const durationRank = { "2-5": 1, "5-10": 2, "10-15": 3 };

  const strategies = [
    {
      id: "organiza-el-ambiente",
      number: 1,
      title: "Organiza el ambiente",
      what: "Deja a la vista juguetes, cuentos o alimentos que le gusten, pero un poco fuera de su alcance, para que tenga motivos para comunicarse contigo. Sin llegar a frustrarlo.",
      example: "Pones la pelota en una repisa que ve pero no alcanza. Si la mira o señala, respondes: «La pelota. ¿Te la doy?».",
      tip: "Si te mira, señala o hace un sonido para pedirla, el ambiente funcionó.",
      challengeIds: [],
      activityIds: ["elegimos-la-merienda"],
      tone: "pink",
    },
    {
      id: "sigue-su-interes",
      number: 2,
      title: "Sigue su interés",
      what: "Observa qué mira, señala o intenta alcanzar. Únete a ese interés y comenta lo que ocurre.",
      example: "«¡Un carro rojo! Va rápido».",
      tip: "Comenta lo que él está mirando, no lo que tú quieres enseñar.",
      challengeIds: ["senala-algo"],
      activityIds: ["el-cuento-con-pausa"],
      tone: "yellow",
    },
    {
      id: "responde-e-imita",
      number: 3,
      title: "Responde e imita",
      what: "Responde a sus gestos, sonidos y palabras como si fueran mensajes. Puedes imitar lo que hace o dice para animarlo a continuar.",
      example: "Si golpea la mesa con la cuchara, golpea tú también y di «Pum, pum».",
      tip: "Si repite o sigue con lo que hacía, tu respuesta le dio ganas de continuar.",
      challengeIds: ["senala-algo"],
      activityIds: ["la-bolsa-sorpresa"],
      tone: "green",
    },
    {
      id: "espera-y-dale-espacio",
      number: 4,
      title: "Espera y dale espacio",
      what: "Después de comentar, haz una pausa para que pueda responder con gestos, sonidos o palabras.",
      example: "Rueda una pelota, detente un momento y observa si pide continuar.",
      tip: "Cuenta mentalmente hasta cinco antes de volver a hablar.",
      challengeIds: ["no-responde"],
      activityIds: ["el-cuento-con-pausa"],
      tone: "lavender",
    },
    {
      id: "apoya-la-comprension",
      number: 5,
      title: "Apoya la comprensión",
      what: "Usa mensajes claros y, cuando sea útil, acompáñalos de gestos u objetos visibles.",
      example: "«Busca los zapatos», señalando dónde están.",
      tip: "Una indicación a la vez, con el objeto o el gesto a la vista.",
      challengeIds: ["vestirse"],
      activityIds: ["donde-esta", "que-hacemos-despues"],
      tone: "pink",
    },
    {
      id: "modela-el-lenguaje",
      number: 6,
      title: "Modela el lenguaje",
      what: "Ofrece palabras o frases sencillas relacionadas con lo que está mirando o haciendo, sin exigir repetición.",
      example: "Si señala agua, di «Quieres agua».",
      tip: "Usa frases cortas y no le pidas que repita.",
      challengeIds: ["vestirse"],
      activityIds: ["que-hacemos-despues"],
      tone: "yellow",
    },
    {
      id: "amplia-su-mensaje",
      number: 7,
      title: "Amplía su mensaje",
      what: "Retoma lo que comunica y añade una palabra o idea sin cambiar el sentido.",
      example: "Dice «perro»; respondes «Sí, un perro grande».",
      tip: "Agrega solo una palabra a la vez.",
      challengeIds: ["dice-una-palabra"],
      activityIds: ["la-bolsa-sorpresa"],
      tone: "green",
    },
    {
      id: "comparte-los-turnos",
      number: 8,
      title: "Comparte los turnos",
      what: "Responde a sus iniciativas y deja espacio para que ambos participen.",
      example: "Cada uno añade un bloque y comenta lo que construyen.",
      tip: "Si los dos aportan algo al juego, hay turnos compartidos.",
      challengeIds: [],
      activityIds: ["construimos-juntos"],
      tone: "lavender",
    },
  ];

  const challenges = [
    {
      id: "senala-algo",
      tag: "Oportunidad · En casa",
      title: "Tu niño señala algo que le interesa",
      situation: "Están en casa y tu niño señala una pelota, un juguete o un objeto. Puede que todavía no diga su nombre.",
      question: "¿Qué harías tú?",
      strategyIds: ["sigue-su-interes", "responde-e-imita"],
      example: "«¡Sí, una pelota! Podemos hacerla rodar». Después, espera unos segundos y observa cómo participa.",
      momento: "juego",
      tone: "coral",
      options: [
        {
          id: "a",
          text: "Le pido que diga el nombre antes de dárselo.",
          feedback:
            "Es natural querer ayudarle a hablar. Sin embargo, exigir una palabra puede interrumpir la interacción. Primero responde a lo que te está mostrando.",
        },
        {
          id: "b",
          text: "Miro lo que señala, respondo y le doy espacio para continuar.",
          feedback:
            "Esta respuesta sigue su interés y reconoce su iniciativa comunicativa. Puedes nombrar el objeto y esperar para darle oportunidad de responder.",
        },
        {
          id: "c",
          text: "Le hago varias preguntas para que hable.",
          feedback:
            "Las preguntas pueden formar parte de la conversación, pero muchas seguidas pueden convertirla en una prueba. Prueba primero con un comentario sencillo y una pausa.",
        },
      ],
    },
    {
      id: "no-responde",
      tag: "Oportunidad · En el juego",
      title: "Le hablas y no responde",
      situation: "Le preguntas algo mientras juega, pero sigue concentrado en lo que está haciendo.",
      question: "¿Qué podrías hacer?",
      strategyIds: ["espera-y-dale-espacio"],
      example: "Si construye una torre, puedes decir: «¡Qué alta está quedando!». Haz una pausa y mira si comparte contigo lo que ocurre.",
      momento: "juego",
      tone: "yellow",
      options: [
        {
          id: "a",
          text: "Repito la pregunta varias veces y le pido que me mire.",
          feedback:
            "Repetir muchas veces puede añadir presión. Primero observa si está atento a otra cosa y busca una manera de conectar con su interés.",
        },
        {
          id: "b",
          text: "Me acerco, comento lo que está haciendo y le doy tiempo.",
          feedback:
            "Acercarte a su actividad y hacer un comentario relacionado puede facilitar que se incorpore al intercambio. Dale tiempo para responder a su manera.",
        },
        {
          id: "c",
          text: "Concluyo que no me está escuchando.",
          feedback:
            "Una sola situación no permite concluir por qué no respondió. Observa el contexto y prueba una forma diferente de acercarte.",
        },
      ],
    },
    {
      id: "dice-una-palabra",
      tag: "Oportunidad · En la merienda",
      title: "Tu niño dice una palabra y espera",
      situation: "Durante la merienda, tu niño dice «agua» o señala su vaso.",
      question: "¿Cómo puedes acompañar ese mensaje?",
      strategyIds: ["amplia-su-mensaje"],
      example: "«Quieres agua. Aquí tienes agua fresquita». Después, continúa la rutina con naturalidad.",
      momento: "comida",
      tone: "coral",
      options: [
        {
          id: "a",
          text: "Le pido que repita una frase completa.",
          feedback:
            "No es necesario exigir una frase completa para reconocer su mensaje. Puedes ofrecer un modelo sencillo que amplíe lo que quiso comunicar.",
        },
        {
          id: "b",
          text: "Respondo y añado una o dos palabras.",
          feedback:
            "Responder y ampliar suavemente el mensaje ofrece un modelo relacionado con lo que necesita en ese momento.",
        },
        {
          id: "c",
          text: "Cambio de tema para que aprenda otras palabras.",
          feedback:
            "Seguir el tema del niño ayuda a mantener el intercambio. Puedes introducir vocabulario nuevo conectado con lo que está ocurriendo.",
        },
      ],
    },
    {
      id: "vestirse",
      tag: "Oportunidad · En las rutinas",
      title: "Vestirse también es comunicarse",
      situation: "Estás ayudando a tu niño a ponerse la ropa y tienen poco tiempo.",
      question: "¿Cómo puedes aprovechar este momento sin convertirlo en una clase?",
      strategyIds: ["modela-el-lenguaje", "apoya-la-comprension"],
      example: "«¿La camiseta azul o la roja?». Si no elige con palabras, puedes aceptar que señale o mire una opción.",
      momento: "rutinas",
      tone: "sage",
      options: [
        {
          id: "a",
          text: "Le enseño una lista de palabras para que las repita.",
          feedback:
            "No necesitas convertir la rutina en una lección. Las palabras pueden aparecer de forma natural mientras hacen algo juntos.",
        },
        {
          id: "b",
          text: "Comento lo que hacemos y le doy pequeñas oportunidades de participar.",
          feedback:
            "Nombrar prendas, ofrecer una elección sencilla y esperar su respuesta permite incluir comunicación dentro de la rutina.",
        },
        {
          id: "c",
          text: "Dejo de hablar porque tenemos prisa.",
          feedback: "En días ocupados basta con un intercambio breve. No necesitas añadir una actividad separada.",
        },
      ],
    },
  ];

  const activities = [
    {
      id: "el-cuento-con-pausa",
      title: "El cuento con pausa",
      tagline: "Mirar, imaginar y conversar",
      summary: "Una historia, muchas oportunidades para comunicarse.",
      ages: [2],
      ageNote: "Ajustada a la participación del niño",
      primaryArea: "interaccion",
      areas: ["interaccion", "vocabulario", "comprension", "expresion"],
      momentos: ["lectura"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["sigue-su-interes", "espera-y-dale-espacio"],
      image: image("actividad-cuento-con-pausa.webp", 1041, 774),
      imageAlt: "Una mamá lee un cuento ilustrado junto a su hijo, ambos sonríen.",
      objective:
        "Favorecer la interacción comunicativa durante la lectura compartida, ofreciendo oportunidades para que el niño exprese intereses e ideas mediante miradas, gestos, sonidos o palabras.",
      materials: ["Un cuento ilustrado o imágenes de una historia."],
      before:
        "Siéntense juntos y elijan una historia que llame la atención del niño. No es necesario leer cada palabra; pueden detenerse en las imágenes que despierten su interés.",
      steps: [
        "Miren juntos la portada y observen qué llama la atención del niño.",
        "Permite que señale, mire o elija una imagen.",
        "Comenta algo relacionado con lo que está observando.",
        "Haz una pausa y dale tiempo para responder con mirada, gesto, sonido o palabra.",
        "Continúa la historia siguiendo su interés y alternando comentarios con pausas.",
      ],
      accompany:
        "Si señala un perro, puedes decir: «¡Sí, un perro! Está corriendo». En lugar de hacer muchas preguntas seguidas, alterna comentarios y pausas para darle espacio a participar.",
      adapt:
        "Si todavía no usa palabras, acepta miradas, gestos y sonidos; elige imágenes grandes y pocas páginas. Si quiere continuar y muestra interés, invítalo a anticipar qué podría pasar o a contar la historia a su manera.",
      closing: "¿Qué imagen llamó más su atención?",
      remember:
        "No es necesario terminar el cuento ni obtener respuestas exactas. Lo importante es compartir la historia, seguir el interés del niño y disfrutar la interacción.",
      interests: ["animales", "naturaleza"],
      download: null,
      adaptations: {
        corta: "Mira solo la portada y una página. Nombra lo que señala y cierra el cuento con una sonrisa.",
        sencilla: "Usa dos o tres imágenes grandes. Acepta mirada, gesto o sonido como respuesta.",
        noQuiere: "Deja el cuento a la vista y comenta tú una imagen, sin insistir en que se siente a leer.",
        sinMateriales: "Inventen juntos lo que hay en la habitación: «Había una vez una cuchara que salió a pasear».",
      },
    },
    {
      id: "la-bolsa-sorpresa",
      title: "La bolsa sorpresa",
      tagline: "Explorar, nombrar y responder",
      summary: "Objetos conocidos que invitan a comunicarse.",
      ages: [2],
      ageNote: "Adaptar los objetos y la dificultad",
      primaryArea: "vocabulario",
      areas: ["vocabulario", "expresion", "interaccion"],
      momentos: ["juego"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["responde-e-imita", "amplia-su-mensaje"],
      objective:
        "Promover el reconocimiento y el uso de vocabulario cotidiano mediante la exploración compartida de objetos familiares, sus características y sus funciones.",
      materials: [
        "Una bolsa opaca y 3 o 4 objetos grandes, conocidos y seguros. Evita piezas pequeñas u objetos que puedan llevarse a la boca.",
      ],
      before:
        "Coloca los objetos dentro de la bolsa y siéntate junto al niño. Invítalo a elegir cuál explorar, sin obligarlo a tocar algo que no quiera.",
      steps: [
        "Invítalo a sacar o tocar un objeto, con supervisión adulta.",
        "Observa qué hace, mira o señala.",
        "Nombra el objeto y comenta una característica o acción relacionada.",
        "Espera su respuesta, sin pedirle que repita obligatoriamente.",
        "Si sigue interesado, compara dos objetos o descubre otro uso para uno de ellos.",
      ],
      accompany:
        "Si saca una cuchara, puedes decir: «¡Una cuchara! La usamos para comer». Si hace un sonido, la mira o la señala, responde a ese intento de comunicación sin exigir que repita la palabra.",
      adapt:
        "Para niños más pequeños, ofrece dos objetos familiares y nómbralos. Para quienes usan más palabras, describe el tamaño, la textura, la función o las acciones posibles. Mantén supervisión adulta durante toda la actividad.",
      closing: "¿Qué objeto quiso explorar más?",
      remember:
        "Usa objetos grandes, limpios, no tóxicos y adecuados para la edad. Evita piezas pequeñas, objetos afilados, frágiles o que representen riesgo de atragantamiento.",
      interests: ["cocina", "vehiculos", "animales"],
      download: null,
      adaptations: {
        corta: "Saca un solo objeto, nómbralo y guarda la bolsa. Dos minutos bastan.",
        sencilla: "Usa dos objetos grandes y familiares. Nombra uno y espera su gesto.",
        noQuiere: "Saca tú un objeto y coméntalo en voz alta, sin pedirle que meta la mano.",
        sinMateriales: "Usa las manos: «¿Qué hay aquí?» y nombra una prenda o un juguete que ya tenga cerca.",
      },
    },
    {
      id: "donde-esta",
      title: "¿Dónde está?",
      tagline: "Buscar, comprender y participar",
      summary: "Indicaciones breves con un juguete familiar.",
      ages: [3],
      ageNote: "Empezar con indicaciones sencillas",
      primaryArea: "comprension",
      areas: ["comprension", "vocabulario", "interaccion"],
      momentos: ["juego"],
      durationId: "2-5",
      duration: "5 minutos",
      materialsId: "casa",
      strategyIds: ["apoya-la-comprension"],
      objective:
        "Acompañar la comprensión de palabras e indicaciones sencillas mediante el juego de buscar un objeto, utilizando apoyos visuales y gestuales cuando sean útiles.",
      materials: ["Un juguete familiar y una tela o recipiente grande."],
      before:
        "Muestra el juguete y después colócalo parcialmente debajo de una tela o dentro de un recipiente grande, siempre en un lugar visible y seguro.",
      steps: [
        "Nombra el juguete y deja que el niño lo observe.",
        "Ocúltalo parcialmente, sin hacerlo inaccesible ni generar frustración.",
        "Da una instrucción breve, por ejemplo: «Busca el oso».",
        "Espera y observa cómo responde.",
        "Si lo necesita, acompaña la indicación con un gesto o señala el lugar.",
        "Reconoce su participación y repitan el juego si quiere.",
      ],
      accompany:
        "Usa frases cortas y dale tiempo. Si no encuentra el juguete, señala el lugar o acércaselo. Evita repetir la misma instrucción muchas veces seguidas.",
      adapt:
        "Empieza con un objeto visible y una sola indicación. Después, si el niño está preparado, puedes ofrecer dos objetos o decir «Pon el oso dentro». La actividad es un juego compartido, no un examen.",
      closing: "¿Qué apoyo le ayudó más: la palabra, el gesto o ver el objeto?",
      remember:
        "Asegúrate de que el juguete y el recipiente sean seguros y fáciles de alcanzar. Detén o modifica el juego si deja de ser agradable para el niño.",
      interests: ["animales", "cocina"],
      download: null,
      adaptations: {
        corta: "Muestra el juguete, nómbralo y dáselo. Una sola búsqueda es suficiente.",
        sencilla: "Deja el objeto a media vista. Di «busca» y señala al mismo tiempo.",
        noQuiere: "Esconde el objeto de forma visible para ti y comenta: «El oso está descansando». Si no busca, no insistas.",
        sinMateriales: "Usa las manos: cubre un objeto cotidiano con una toalla o con tus palmas.",
      },
    },
    {
      id: "construimos-juntos",
      title: "Construimos juntos",
      tagline: "Turnos, comentarios y juego compartido",
      summary: "Construir algo sencillo entre los dos.",
      ages: [4],
      ageNote: "Usar piezas grandes y seguras",
      primaryArea: "interaccion",
      areas: ["interaccion", "vocabulario", "comprension", "expresion"],
      momentos: ["juego"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["comparte-los-turnos"],
      objective:
        "Favorecer los turnos comunicativos y el intercambio durante una construcción compartida, comentando acciones, cambios y resultados del juego.",
      materials: [
        "Bloques grandes, recipientes plásticos seguros o cajas pequeñas sin bordes peligrosos.",
      ],
      before:
        "Siéntense frente a los materiales y comiencen a construir algo sencillo juntos. Deja las piezas al alcance del niño y permite que proponga cómo jugar.",
      steps: [
        "Coloca una pieza y comenta lo que estás haciendo.",
        "Deja otra pieza al alcance del niño.",
        "Espera su iniciativa o invítalo a participar con una frase breve.",
        "Alternen turnos para colocar, retirar o mover piezas.",
        "Comenten lo que sucede cuando la construcción crece, cambia o se cae.",
        "Continúen según el interés del niño, sin exigir que construya de una forma determinada.",
      ],
      accompany:
        "Puedes decir: «Mi turno… tu turno», «arriba», «se cayó» o «¡qué alta!». Los gestos, las miradas y las acciones del niño también forman parte de la interacción.",
      adapt:
        "Si todavía no apila piezas, pueden meter y sacar objetos grandes de un recipiente. Si desea dirigir el juego, síguelo y comenta sus ideas. Evita piezas pequeñas y mantén supervisión adulta.",
      closing: "¿Cómo se comunicaron para continuar el juego?",
      remember:
        "No importa cómo quede la construcción. Valora los turnos, la iniciativa y el disfrute compartido, no el resultado final.",
      interests: ["vehiculos", "cocina"],
      download: null,
      adaptations: {
        corta: "Coloca una pieza, espera su turno y cierra: «Listo, nuestra torre».",
        sencilla: "Metan y saquen objetos de un recipiente grande, nombrando «dentro» y «fuera».",
        noQuiere: "Construye tú y comenta lo que haces. Si se acerca, ofrécele una pieza sin pedirle que juegue.",
        sinMateriales: "Apilen cajas, tapas o libros que ya estén en la habitación, siempre con supervisión.",
      },
    },
    {
      id: "elegimos-la-merienda",
      title: "Elegimos la merienda",
      tagline: "Elegir, expresar y compartir la rutina",
      summary: "Una elección sencilla durante la merienda habitual.",
      ages: [3],
      ageNote: "Considerar la seguridad alimentaria y las alergias conocidas",
      primaryArea: "expresion",
      areas: ["expresion", "comprension", "vocabulario", "interaccion"],
      momentos: ["comida"],
      durationId: "2-5",
      duration: "2–5 minutos",
      materialsId: "casa",
      strategyIds: ["organiza-el-ambiente", "espera-y-dale-espacio"],
      objective:
        "Ofrecer oportunidades cotidianas para expresar elecciones, preferencias o necesidades mediante miradas, gestos, sonidos o palabras durante una merienda habitual.",
      materials: ["Dos opciones de alimentos habituales y seguros para el niño, presentadas por el adulto."],
      before:
        "Durante una merienda habitual, muestra dos opciones apropiadas para el niño. No es necesario preparar comida adicional.",
      steps: [
        "Nombra las dos opciones de manera clara y natural.",
        "Pregunta cuál quiere o invítalo a elegir mediante mirada, gesto o palabra.",
        "Espera unos segundos sin responder por él inmediatamente.",
        "Reconoce la elección que comunica, sea cual sea la forma de expresarla.",
        "Comenta una característica del alimento mientras continúan la rutina.",
      ],
      accompany:
        "Puedes decir: «¿Banano o pan?». Si señala uno, responde: «Elegiste pan». No exijas que nombre el alimento para recibirlo.",
      adapt:
        "Si elegir entre dos opciones resulta difícil, presenta una a la vez. La actividad no debe retrasar la comida ni presionar al niño a probar o comer algo que rechaza.",
      closing: "¿Cómo expresó su elección?",
      remember:
        "Respeta las alergias conocidas, las indicaciones alimentarias de la familia y la seguridad apropiada para la edad. El objetivo es favorecer la comunicación, no evaluar ni controlar cuánto come.",
      interests: ["cocina", "animales", "naturaleza"],
      download: null,
      adaptations: {
        corta: "Muestra una sola opción, nómbrala y sirve. Un intercambio breve basta.",
        sencilla: "Presenta un alimento a la vez. Acepta mirada o gesto como elección.",
        noQuiere: "Nombra lo que hay en la mesa sin preguntar. Si no elige, continúa la comida con calma.",
        sinMateriales: "Usa lo que ya está servido. Nombra colores, olores o si está caliente o frío.",
      },
    },
    {
      id: "que-hacemos-despues",
      title: "¿Qué hacemos después?",
      tagline: "Anticipar pasos de una rutina",
      summary: "Comentar juntos qué sigue en una rutina conocida.",
      ages: [5],
      ageNote: "Usar objetos de la rutina; simplificar si hace falta",
      primaryArea: "comprension",
      areas: ["comprension", "expresion", "interaccion"],
      momentos: ["rutinas"],
      durationId: "2-5",
      duration: "5 minutos",
      materialsId: "casa",
      strategyIds: ["modela-el-lenguaje", "apoya-la-comprension"],
      objective:
        "Apoyar la comprensión y anticipación de los pasos de una rutina conocida, usando lenguaje sencillo, objetos o imágenes como apoyos.",
      materials: ["Dos o tres imágenes de una rutina conocida o los propios objetos de la rutina."],
      before:
        "Elige una rutina familiar, como lavarse las manos, ponerse los zapatos o guardar juguetes. Ten a mano los objetos o imágenes que puedan ayudar a mostrar los pasos.",
      steps: [
        "Conversen brevemente sobre lo que están haciendo en ese momento.",
        "Muestra o nombra el siguiente paso con una frase sencilla.",
        "Cuando corresponda, invita al niño a elegir entre dos acciones posibles.",
        "Sigan la rutina y comenta cada paso de forma natural.",
        "Si lo necesita, vuelve a mostrar el objeto o señala la acción en lugar de repetir muchas instrucciones.",
      ],
      accompany:
        "Puedes decir: «Primero guardamos los bloques y después elegimos un cuento». Si necesita apoyo, muestra el objeto o señala la acción que viene a continuación.",
      adapt:
        "Usa una sola indicación a la vez si la secuencia resulta difícil. Si el niño ya comprende la rutina, invítalo a contar o mostrar qué sigue, sin exigir una respuesta verbal.",
      closing: "¿Qué apoyo le permitió anticipar el siguiente paso?",
      remember:
        "Mantén la rutina natural y flexible. El propósito no es que el niño memorice una secuencia perfecta, sino ayudarle a comprender qué está pasando y qué puede ocurrir después.",
      interests: ["cocina", "musica"],
      download: null,
      adaptations: {
        corta: "Nombra el paso de ahora y el que sigue. Luego continúen la rutina.",
        sencilla: "Una sola indicación: «Ahora los zapatos», con el objeto a la vista.",
        noQuiere: "Haz tú el siguiente paso en voz alta. Si no participa, no conviertas la rutina en una actividad extra.",
        sinMateriales: "Usa los objetos de la propia rutina: jabón, zapatos o el gancho de la toalla.",
      },
    },
  ];

  function getAge(value) {
    return ages.find((age) => age.value === Number(value));
  }

  function getArea(id) {
    return areas.find((area) => area.id === id);
  }

  function getMoment(id) {
    return moments.find((moment) => moment.id === id);
  }

  function getDuration(id) {
    return durations.find((duration) => duration.id === id);
  }

  function getMaterial(id) {
    return materials.find((material) => material.id === id);
  }

  function getStrategy(id) {
    return strategies.find((strategy) => strategy.id === id);
  }

  function getChallenge(id) {
    return challenges.find((challenge) => challenge.id === id);
  }

  const validActivities = activities.filter((activity) => {
    const momentos = activity.momentos || [];
    const strategyIds = activity.strategyIds || [];
    const valid =
      activity.ages.length > 0 &&
      activity.ages.every((age) => getAge(age)) &&
      activity.areas.every((id) => getArea(id)) &&
      getArea(activity.primaryArea) &&
      activity.areas.includes(activity.primaryArea) &&
      (!activity.durationId || getDuration(activity.durationId)) &&
      getMaterial(activity.materialsId) &&
      activity.objective &&
      activity.materials.length > 0 &&
      activity.before &&
      activity.steps.length > 0 &&
      activity.accompany &&
      activity.adapt &&
      activity.closing &&
      activity.remember &&
      momentos.every((id) => getMoment(id)) &&
      strategyIds.every((id) => getStrategy(id));
    if (!valid) console.warn(`Crece en Casa: «${activity.id}» tiene datos inválidos y no se mostrará.`);
    return valid;
  });

  function getActivity(id) {
    return validActivities.find((activity) => activity.id === id);
  }

  function getExperienceSkill(id) {
    return experienceSkills.find((item) => item.id === id);
  }

  function getExperienceDuration(id) {
    return experienceDurations.find((item) => item.id === id);
  }

  function getInterest(id) {
    return interests.find((item) => item.id === id);
  }

  function recommendExperiences(filters = {}) {
    const skill = getExperienceSkill(filters.skill);
    const duration = getExperienceDuration(filters.duration);
    const wantedRank = duration ? durationRank[duration.durationId] : null;
    const age = Number(filters.age);
    const hasAge = Number.isFinite(age) && age > 0;
    const interest = filters.interest && filters.interest !== "otro" ? filters.interest : "";

    const ranked = validActivities
      .map((activity) => {
        let score = 0;
        if (hasAge && activity.ages.includes(age)) score += 8;
        if (filters.moment && (activity.momentos || []).includes(filters.moment)) score += 10;
        if (skill && activity.primaryArea === skill.areaId) score += 6;
        else if (skill && activity.areas.includes(skill.areaId)) score += 3;
        if (duration && activity.durationId) {
          if (activity.durationId === duration.durationId) score += 5;
          else if (wantedRank && Math.abs((durationRank[activity.durationId] || 0) - wantedRank) === 1) score += 2;
        }
        if (interest && (activity.interests || []).includes(interest)) score += 4;
        return { activity, score };
      })
      .sort((a, b) => b.score - a.score || a.activity.title.localeCompare(b.activity.title, "es"));

    const matches = ranked.filter((item) => item.score > 0);
    const main = matches[0] ? matches[0].activity : null;
    const alternatives = matches.slice(1, 3).map((item) => item.activity);
    const extended = ranked
      .map((item) => item.activity)
      .find((activity) => {
        if (!main || activity.id === main.id) return false;
        return (durationRank[activity.durationId] || 0) > (durationRank[main.durationId] || 0);
      }) || null;

    return { main, alternatives, extended, ranked: matches };
  }

  return {
    ages,
    areas,
    moments,
    durations,
    materials,
    experienceSkills,
    experienceDurations,
    interests,
    strategies,
    challenges,
    activities: validActivities,
    getAge,
    getArea,
    getMoment,
    getDuration,
    getMaterial,
    getExperienceSkill,
    getExperienceDuration,
    getInterest,
    getStrategy,
    getChallenge,
    getActivity,
    recommendExperiences,
  };
})();
