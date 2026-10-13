/*
 * Contenido de ejemplo de Crece en Casa.
 * Las actividades son orientaciones educativas pendientes de revisión
 * profesional; no constituyen diagnóstico ni tratamiento.
 */
window.CEC = window.CEC || {};

window.CEC.data = (function () {
  const IMG = "assets/img/temporal/";

  /* width y height deben coincidir con el archivo para reservar el espacio antes de que cargue. */
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
    { id: "vocabulario", label: "Vocabulario", icon: "i-vocabulario", tone: "blue" },
    { id: "comprension", label: "Comprensión", icon: "i-comprension", tone: "coral" },
    { id: "expresion", label: "Expresión", icon: "i-expresion", tone: "lavender" },
    { id: "interaccion-social", label: "Interacción social", icon: "i-interaccion", tone: "violet" },
    { id: "juego-comunicativo", label: "Juego comunicativo", icon: "i-juego", tone: "yellow" },
  ];

  const activities = [
    {
      id: "el-cuento-con-pausa",
      title: "El cuento con pausa",
      tagline: "Mirar, imaginar y conversar",
      summary: "Una historia, muchas oportunidades para comunicarse.",
      ages: [3, 4, 5],
      areas: ["vocabulario", "comprension", "expresion", "interaccion-social"],
      duration: "10 a 15 minutos",
      image: image("actividad-cuento-con-pausa.webp", 550, 396),
      imageAlt: "Una mamá lee un cuento ilustrado junto a su hijo, ambos sonríen.",
      materials: ["Un cuento con ilustraciones grandes.", "Un lugar cómodo y tranquilo."],
      steps: [
        "Elijan juntos el cuento y siéntense de forma que ambos puedan ver las ilustraciones.",
        "Lee una página y haz una pausa antes de pasar a la siguiente.",
        "Durante la pausa, señala la ilustración y pregunta: «¿Qué ves aquí?» o «¿Qué crees que va a pasar?».",
        "Espera unos segundos su respuesta, sin apresurarte a contestar por él o ella.",
        "Repite y amplía lo que dice. Si dice «oso», puedes responder: «Sí, un oso grande que busca a su mamá».",
        "Al terminar, pregúntale qué parte le gustó más y por qué.",
      ],
      favors: ["Vocabulario", "Comprensión", "Imaginación", "Interacción"],
      tips: [
        "Con niños de 3 años, basta con nombrar y señalar lo que aparece en las ilustraciones.",
        "Con niños de 5 años, invítalos a inventar un final diferente.",
        "No es un examen: si no responde, continúa la lectura con naturalidad.",
      ],
    },
    {
      id: "la-caja-de-sonidos",
      title: "La caja de sonidos",
      tagline: "Escuchar, nombrar e imitar",
      summary: "Objetos de casa que suenan y se convierten en palabras.",
      ages: [2],
      areas: ["vocabulario", "expresion"],
      duration: "10 minutos",
      materials: [
        "Una caja o bolsa de tela.",
        "Tres o cuatro objetos que suenen: llaves, una cuchara y una olla, papel para arrugar.",
      ],
      steps: [
        "Muestra los objetos uno por uno, nómbralos y hazlos sonar.",
        "Guárdalos en la caja y haz sonar uno sin que lo vea.",
        "Pregunta: «¿Qué suena?» y espera a que lo busque, lo señale o lo nombre.",
        "Celebra cualquier intento de comunicación: una palabra, un sonido o un gesto.",
        "Imiten juntos el sonido: «¡Clin, clin!», «¡Crac, crac!».",
      ],
      favors: ["Atención auditiva", "Vocabulario", "Imitación"],
      tips: [
        "Usa objetos seguros y de tamaño adecuado para evitar que se los lleve a la boca.",
        "Si pierde el interés, cambia de objeto o terminen el juego.",
      ],
    },
    {
      id: "palabras-a-la-hora-del-bano",
      title: "Palabras a la hora del baño",
      tagline: "Nombrar el cuerpo jugando",
      summary: "Aprovechar la rutina del baño para descubrir nuevas palabras.",
      ages: [2, 3],
      areas: ["vocabulario", "comprension"],
      duration: "Durante el baño",
      materials: ["Los objetos habituales del baño: esponja, toalla, jabón."],
      steps: [
        "Mientras lo bañas, nombra cada parte del cuerpo que lavas: «Ahora, las manos».",
        "Haz preguntas sencillas: «¿Dónde están tus pies?».",
        "Dale tiempo para señalar o responder antes de mostrarle la respuesta.",
        "Canta o inventa una canción corta con las partes del cuerpo.",
      ],
      favors: ["Vocabulario", "Comprensión de preguntas", "Vínculo afectivo"],
      tips: [
        "La supervisión durante el baño debe ser constante.",
        "Repite las mismas palabras varios días: la repetición ayuda a aprenderlas.",
      ],
    },
    {
      id: "mi-turno-tu-turno",
      title: "Mi turno, tu turno",
      tagline: "Jugar a esperar y responder",
      summary: "Un juego sencillo para practicar los turnos de la conversación.",
      ages: [2, 3],
      areas: ["interaccion-social", "juego-comunicativo"],
      duration: "5 a 10 minutos",
      materials: ["Una pelota blanda o un carrito de juguete."],
      steps: [
        "Siéntense frente a frente, a la misma altura.",
        "Rueda la pelota diciendo «Mi turno» y anímalo a devolverla con «Tu turno».",
        "Antes de lanzar, haz una pausa y mírale a los ojos para invitarle a pedirla.",
        "Acepta cualquier forma de pedirla: una mirada, un gesto, un sonido o una palabra.",
      ],
      favors: ["Turnos comunicativos", "Atención compartida", "Interacción"],
      tips: ["Este mismo juego sirve con bloques, burbujas o un tambor."],
    },
    {
      id: "cocinamos-juntos",
      title: "Cocinamos juntos",
      tagline: "Seguir instrucciones sencillas",
      summary: "Una receta fría y sencilla para escuchar, nombrar y hacer.",
      ages: [3, 4],
      areas: ["comprension", "vocabulario"],
      duration: "15 minutos",
      materials: [
        "Ingredientes de una receta que no requiera calor, por ejemplo yogur con fruta picada por un adulto.",
        "Un recipiente y una cuchara.",
      ],
      steps: [
        "Presenta cada ingrediente y nómbralo: «Esto es un banano, es amarillo».",
        "Da instrucciones de uno o dos pasos: «Toma la cuchara y pon el yogur en el plato».",
        "Pregúntale qué viene después y deja que lo diga antes de hacerlo.",
        "Al final, pídele que cuente cómo prepararon la receta.",
      ],
      favors: ["Comprensión de instrucciones", "Vocabulario", "Secuencias"],
      tips: [
        "Un adulto debe encargarse de los cuchillos y de cualquier utensilio peligroso.",
        "Con niños de 4 años, añade palabras como «primero», «después» y «al final».",
      ],
    },
    {
      id: "la-bolsa-misteriosa",
      title: "La bolsa misteriosa",
      tagline: "Tocar, adivinar y describir",
      summary: "Describir objetos sin verlos para ampliar las palabras.",
      ages: [3, 4],
      areas: ["vocabulario", "expresion"],
      duration: "10 minutos",
      materials: ["Una bolsa de tela.", "Objetos conocidos con texturas distintas: un peine, una pelota, una cuchara."],
      steps: [
        "Coloca un objeto dentro de la bolsa sin que lo vea.",
        "Invítale a tocarlo y pregunta: «¿Cómo se siente? ¿Es suave, duro, frío?».",
        "Ayúdale con opciones si lo necesita: «¿Es grande o pequeño?».",
        "Pídele que adivine qué es y luego sáquenlo para comprobarlo.",
        "Intercambien los papeles: ahora tú adivinas a partir de sus pistas.",
      ],
      favors: ["Vocabulario descriptivo", "Expresión", "Razonamiento"],
      tips: ["Evita objetos pequeños, cortantes o que puedan causar daño."],
    },
    {
      id: "teatro-de-calcetines",
      title: "Teatro de calcetines",
      tagline: "Dar voz a los personajes",
      summary: "Títeres caseros para inventar diálogos y emociones.",
      ages: [4, 5],
      areas: ["expresion", "interaccion-social", "juego-comunicativo"],
      duration: "15 a 20 minutos",
      materials: ["Dos calcetines limpios.", "Marcadores o botones para hacer los ojos (con supervisión)."],
      steps: [
        "Decoren juntos los calcetines para convertirlos en personajes.",
        "Elijan nombres y una situación sencilla: «El perrito perdió su pelota».",
        "Tú das voz a un personaje y el niño o la niña al otro.",
        "Haz preguntas a su personaje: «¿Cómo te sientes? ¿Qué vas a hacer?».",
        "Cierren la historia juntos y comenten qué pasó.",
      ],
      favors: ["Expresión", "Turnos de conversación", "Emociones", "Imaginación"],
      tips: ["Deja que proponga la historia; tu papel es acompañar y ampliar."],
    },
    {
      id: "que-paso-primero",
      title: "¿Qué pasó primero?",
      tagline: "Ordenar y contar el día",
      summary: "Dibujos o fotos de la rutina para contar en orden.",
      ages: [4, 5],
      areas: ["comprension", "expresion"],
      duration: "10 a 15 minutos",
      materials: ["Papel y colores, o tres o cuatro fotos de la rutina diaria."],
      steps: [
        "Dibujen o elijan imágenes de momentos del día: despertar, desayunar, jugar, dormir.",
        "Mézclenlas y pídele que las ordene.",
        "Pídele que cuente el día usando «primero», «después» y «al final».",
        "Haz preguntas abiertas: «¿Qué fue lo más divertido? ¿Por qué?».",
      ],
      favors: ["Secuencias", "Expresión", "Memoria"],
      tips: ["Si le cuesta, empieza con solo dos imágenes."],
    },
    {
      id: "veo-veo-en-casa",
      title: "Veo, veo en casa",
      tagline: "Describir y adivinar",
      summary: "El clásico juego de adivinanzas con pistas de color, forma y uso.",
      ages: [5],
      areas: ["vocabulario", "comprension", "juego-comunicativo"],
      duration: "10 minutos",
      materials: ["Ninguno: solo los objetos que haya a su alrededor."],
      steps: [
        "Elige un objeto que ambos puedan ver y di: «Veo, veo una cosa que es…».",
        "Da pistas de color, forma, tamaño o para qué sirve.",
        "Espera sus preguntas y respuestas antes de dar otra pista.",
        "Cambien los papeles: ahora es su turno de describir.",
      ],
      favors: ["Vocabulario", "Comprensión", "Formular preguntas"],
      tips: ["Puede jugarse en el carro, en la sala de espera o en la cocina."],
    },
    {
      id: "noticiero-familiar",
      title: "Noticiero familiar",
      tagline: "Contar lo que pasó hoy",
      summary: "Un pequeño noticiero en casa para narrar experiencias.",
      ages: [5],
      areas: ["expresion", "interaccion-social"],
      duration: "10 minutos",
      materials: ["Un objeto que haga de micrófono, por ejemplo una cuchara de madera."],
      steps: [
        "Explica que van a jugar a presentar las noticias del día.",
        "Hazle preguntas como periodista: «¿Qué pasó hoy? ¿Con quién jugaste?».",
        "Escucha con atención y pide detalles: «¿Y luego qué hiciste?».",
        "Intercambien los papeles para que también te entreviste.",
      ],
      favors: ["Narración", "Expresión", "Escucha"],
      tips: ["No corrijas cada palabra; repite la frase de forma correcta como parte de la conversación."],
    },
  ];

  function getAge(value) {
    return ages.find((age) => age.value === Number(value));
  }

  function getArea(id) {
    return areas.find((area) => area.id === id);
  }

  /* Las páginas asumen que cada edad y área de una actividad existe; se descartan las que no cumplan. */
  const validActivities = activities.filter((activity) => {
    const valid =
      activity.ages.length > 0 &&
      activity.ages.every((age) => getAge(age)) &&
      activity.areas.every((id) => getArea(id));
    if (!valid) console.warn(`Crece en Casa: «${activity.id}» tiene edades o áreas inexistentes y no se mostrará.`);
    return valid;
  });

  function getActivity(id) {
    return validActivities.find((activity) => activity.id === id);
  }

  return { ages, areas, activities: validActivities, getAge, getArea, getActivity };
})();
