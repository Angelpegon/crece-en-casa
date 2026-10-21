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
    { value: 2, label: "2 años", tagline: "Descubrir y expresar", tone: "pink", image: image("edad-2.webp", 190, 172) },
    { value: 3, label: "3 años", tagline: "Nombrar y comprender", tone: "yellow", image: image("edad-3.webp", 170, 172) },
    { value: 4, label: "4 años", tagline: "Conversar y crear ideas", tone: "green", image: image("edad-4.webp", 190, 172) },
    { value: 5, label: "5 años", tagline: "Contar, jugar y compartir", tone: "lavender", image: image("edad-5.webp", 204, 156) },
  ];

  const areas = [
    { id: "vocabulario", label: "Vocabulario y significado", icon: "i-vocabulario", tone: "blue" },
    { id: "comprension", label: "Comprensión del lenguaje", icon: "i-comprension", tone: "coral" },
    { id: "expresion", label: "Expresión del lenguaje", icon: "i-expresion", tone: "lavender" },
    { id: "interaccion", label: "Interacción comunicativa", icon: "i-interaccion", tone: "violet" },
  ];

  const moments = [
    { id: "juego", label: "Juego", icon: "i-juego", tone: "yellow" },
    { id: "comida", label: "Comida", icon: "i-casa", tone: "coral" },
    { id: "rutinas", label: "Rutinas diarias", icon: "i-brote", tone: "green" },
    { id: "lectura", label: "Lectura compartida", icon: "i-vocabulario", tone: "lavender" },
  ];

  const durations = [
    { id: "2-5", label: "2–5 minutos" },
    { id: "5-10", label: "5–10 minutos" },
    { id: "10-15", label: "10–15 minutos" },
  ];

  /* Solo «Objetos de casa» en esta versión; Imprimible queda oculto. */
  const materials = [{ id: "casa", label: "Objetos de casa" }];

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
      tag: "Reto cotidiano · En casa",
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
      tag: "Reto cotidiano · En el juego",
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
      tag: "Reto cotidiano · En la merienda",
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
      tag: "Reto cotidiano · En las rutinas",
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
      ages: [2, 3, 4, 5],
      ageNote: "Ajustar a la participación del niño",
      primaryArea: "interaccion",
      areas: ["interaccion", "vocabulario", "comprension", "expresion"],
      momentos: ["lectura"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["sigue-su-interes", "espera-y-dale-espacio"],
      image: image("actividad-cuento-con-pausa.webp", 550, 396),
      imageAlt: "Una mamá lee un cuento ilustrado junto a su hijo, ambos sonríen.",
      materials: ["Un cuento ilustrado o imágenes de una historia."],
      before: "Siéntense juntos y elijan una historia que llame la atención del niño. No es necesario leer cada palabra.",
      steps: [
        "Miren la portada juntos.",
        "Deja que el niño señale o elija una imagen.",
        "Comenta algo que le interese.",
        "Haz una pausa para darle espacio a responder con mirada, gesto, sonido o palabra.",
        "Continúa la historia siguiendo su interés.",
      ],
      accompany:
        "Si señala un perro, puedes decir: «¡Sí, un perro! Está corriendo». En vez de hacer muchas preguntas, alterna comentarios y pausas.",
      adapt:
        "Si el niño aún no usa palabras, acepta miradas, gestos y sonidos; usa imágenes grandes y pocas páginas. Si quiere continuar, invita a anticipar qué podría pasar o a contar la historia a su manera.",
      closing: "¿Qué imagen llamó más su atención?",
    },
    {
      id: "la-bolsa-sorpresa",
      title: "La bolsa sorpresa",
      tagline: "Explorar, nombrar y responder",
      summary: "Objetos conocidos que invitan a comunicarse.",
      ages: [2, 3, 4, 5],
      ageNote: "Adaptar los objetos y la dificultad",
      primaryArea: "vocabulario",
      areas: ["vocabulario", "expresion", "interaccion"],
      momentos: ["juego"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["responde-e-imita", "amplia-su-mensaje"],
      materials: [
        "Una bolsa opaca y 3 o 4 objetos grandes, conocidos y seguros; no usar piezas pequeñas ni objetos que puedan llevarse a la boca.",
      ],
      before: "Coloca los objetos dentro de la bolsa y siéntate junto al niño. Permite que elija cuál explorar.",
      steps: [
        "Invítalo a sacar o tocar un objeto.",
        "Observa qué hace o mira.",
        "Nombra el objeto y comenta una característica o acción.",
        "Espera su respuesta.",
        "Si sigue interesado, compara dos objetos o busca otro uso para uno de ellos.",
      ],
      accompany:
        "Si saca una cuchara, puedes decir: «¡Una cuchara! La usamos para comer». Si hace un sonido o la señala, responde a su intento sin pedirle que repita.",
      adapt:
        "Para niños más pequeños, usa dos objetos familiares y nómbralos. Para quienes usan más palabras, describe tamaño, función o acciones. Mantén supervisión adulta durante toda la actividad.",
      closing: "¿Qué objeto quiso explorar más?",
    },
    {
      id: "donde-esta",
      title: "¿Dónde está?",
      tagline: "Buscar, comprender y participar",
      summary: "Indicaciones breves con un juguete familiar.",
      ages: [2, 3, 4, 5],
      ageNote: "Empezar con indicaciones sencillas",
      primaryArea: "comprension",
      areas: ["comprension", "vocabulario", "interaccion"],
      momentos: ["juego"],
      durationId: "2-5",
      duration: "5 minutos",
      materialsId: "casa",
      strategyIds: ["apoya-la-comprension"],
      materials: ["Un juguete familiar y una tela o recipiente grande."],
      before:
        "Muestra el juguete y luego colócalo parcialmente debajo de la tela o dentro del recipiente, siempre a la vista o en un lugar seguro.",
      steps: [
        "Nombra el juguete.",
        "Ocúltalo parcialmente.",
        "Di una instrucción breve, por ejemplo: «Busca el oso».",
        "Espera y observa cómo responde.",
        "Si lo necesita, acompaña la indicación con un gesto.",
        "Celebra la participación y repitan si el niño quiere.",
      ],
      accompany:
        "Usa frases cortas y da tiempo. Si no lo encuentra, señala el lugar o acerca el objeto; evita repetir la instrucción muchas veces seguidas.",
      adapt:
        "Empieza con un objeto visible y una indicación. Después, si está preparado, ofrece dos objetos o instrucciones como «Pon el oso dentro». No convertirlo en examen.",
      closing: "¿Qué apoyo le ayudó: la palabra, el gesto o ver el objeto?",
    },
    {
      id: "construimos-juntos",
      title: "Construimos juntos",
      tagline: "Turnos, comentarios y juego compartido",
      summary: "Construir algo sencillo entre los dos.",
      ages: [2, 3, 4, 5],
      ageNote: "Usar piezas grandes y seguras",
      primaryArea: "interaccion",
      areas: ["interaccion", "vocabulario", "comprension", "expresion"],
      momentos: ["juego"],
      durationId: "5-10",
      duration: "5–10 minutos",
      materialsId: "casa",
      strategyIds: ["comparte-los-turnos"],
      materials: [
        "Bloques grandes, recipientes plásticos seguros o cajas pequeñas que no tengan bordes peligrosos.",
      ],
      before: "Siéntense frente a los materiales y comiencen a construir algo sencillo juntos.",
      steps: [
        "Coloca una pieza y comenta lo que haces.",
        "Deja una pieza al alcance del niño.",
        "Espera su iniciativa o invítalo con una frase corta.",
        "Alternen turnos para colocar piezas.",
        "Comenten lo que pasa si la torre crece o se cae.",
      ],
      accompany:
        "Puedes decir: «Mi turno… tu turno», «arriba», «se cayó» o «¡qué alta!». Responde a los gestos y acciones del niño como parte de la interacción.",
      adapt:
        "Si aún no construye una torre, pueden meter y sacar objetos de un recipiente. Si desea dirigir el juego, síguelo y comenta sus ideas. Supervisar y evitar piezas pequeñas.",
      closing: "¿Cómo se comunicaron para continuar el juego?",
    },
    {
      id: "elegimos-la-merienda",
      title: "Elegimos la merienda",
      tagline: "Elegir, expresar y compartir la rutina",
      summary: "Una elección sencilla durante la merienda habitual.",
      ages: [2, 3, 4, 5],
      ageNote: "Considerar seguridad alimentaria y alergias conocidas",
      primaryArea: "expresion",
      areas: ["expresion", "comprension", "vocabulario", "interaccion"],
      momentos: ["comida"],
      durationId: "2-5",
      duration: "2–5 minutos",
      materialsId: "casa",
      strategyIds: ["organiza-el-ambiente", "espera-y-dale-espacio"],
      materials: ["Dos opciones de alimentos habituales y seguros para el niño, presentados por el adulto."],
      before:
        "Durante una merienda habitual, muestra dos opciones apropiadas para el niño. No hace falta preparar comida adicional.",
      steps: [
        "Nombra las dos opciones.",
        "Pregunta cuál quiere o invita a elegir con mirada, gesto o palabra.",
        "Espera sin responder por él inmediatamente.",
        "Reconoce su elección.",
        "Comenta una característica del alimento mientras continúan la rutina.",
      ],
      accompany:
        "Puedes decir: «¿Banano o pan?». Si señala uno, responde: «Elegiste pan». No exijas que nombre el alimento para recibirlo.",
      adapt:
        "Si la elección entre dos opciones es difícil, presenta una a la vez. La actividad no debe retrasar la comida ni presionar al niño a comer algo que rechaza.",
      closing: "¿Cómo expresó su elección?",
    },
    {
      id: "que-hacemos-despues",
      title: "¿Qué hacemos después?",
      tagline: "Anticipar pasos de una rutina",
      summary: "Comentar juntos qué sigue en una rutina conocida.",
      ages: [3, 4, 5],
      ageNote: "Simplificar para niños más pequeños",
      primaryArea: "comprension",
      areas: ["comprension", "expresion", "interaccion"],
      momentos: ["rutinas"],
      durationId: "2-5",
      duration: "5 minutos",
      materialsId: "casa",
      strategyIds: ["modela-el-lenguaje", "apoya-la-comprension"],
      materials: ["Dos o tres imágenes de una rutina conocida o los propios objetos de la rutina."],
      before: "Elige una rutina familiar, como lavarse las manos, ponerse los zapatos o guardar juguetes.",
      steps: [
        "Conversen sobre lo que están haciendo ahora.",
        "Muestra o nombra el siguiente paso.",
        "Invita al niño a elegir entre dos acciones posibles cuando corresponda.",
        "Sigue la rutina y comenta cada paso de forma natural.",
      ],
      accompany:
        "Puedes decir: «Primero guardamos los bloques y después elegimos un cuento». Si necesita apoyo, muestra el objeto o señala la acción.",
      adapt:
        "Usa una sola indicación a la vez si la secuencia resulta difícil. Si el niño ya comprende la rutina, invítalo a contar qué sigue, sin exigir una respuesta verbal.",
      closing: "¿Qué apoyo le permitió anticipar el siguiente paso?",
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
      getDuration(activity.durationId) &&
      getMaterial(activity.materialsId) &&
      momentos.every((id) => getMoment(id)) &&
      strategyIds.every((id) => getStrategy(id));
    if (!valid) console.warn(`Crece en Casa: «${activity.id}» tiene datos inválidos y no se mostrará.`);
    return valid;
  });

  function getActivity(id) {
    return validActivities.find((activity) => activity.id === id);
  }

  return {
    ages,
    areas,
    moments,
    durations,
    materials,
    strategies,
    challenges,
    activities: validActivities,
    getAge,
    getArea,
    getMoment,
    getDuration,
    getMaterial,
    getStrategy,
    getChallenge,
    getActivity,
  };
})();
