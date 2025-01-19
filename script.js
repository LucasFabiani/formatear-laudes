const input = document.getElementById("input");
const output = document.getElementById("output");
const copyButton = document.getElementById("copyButton");
const pasteButton = document.getElementById("pasteButton");

function loadDefaultText() {
    fetch('input-example.txt')  // Accede al archivo directamente desde el repositorio
        .then(response => response.text())
        .then(data => {
            input.value = data;

            // Mostrar el texto procesado en el div de salida
            output.innerHTML = procesarTexto(input.value);
        })
        .catch(error => console.error('Error al cargar el archivo:', error));
}

window.onload = loadDefaultText;
function CopyToClipboard(containerid) {
if (document.selection) { 
    var range = document.body.createTextRange();
    range.moveToElementText(document.getElementById(containerid));
    range.select().createTextRange();
    document.execCommand("Copy"); 

} else if (window.getSelection) {
    var range = document.createRange();
     range.selectNode(document.getElementById(containerid));
     window.getSelection().addRange(range);
     document.execCommand("Copy");
     alert("text copied") 
}}
// Función para aplicar formato en negritas a "V." y "R."
function aplicarNegritas(text) {
  return text
    .replace(/V\./g, "<b>V. </b>")
    .replace(/R\./g, "<b>R. </b>")
    .replace(/\nAnt.\n/g, "<b>Ant. </b>")
    .replace(
      /Gloria al Padre, y al Hijo, y al Espíritu Santo.\nComo era en el principio, ahora y siempre,\npor los siglos de los siglos. Amén./g,
      "Gloria al Padre y al Hijo...\n\n"
    )
    .replace("Himno\n", "<h4>\nHimno</h4>")
    .replace("Lectura breve\n", "<h4>\nLectura breve</h4>")
    .replace("Responsorio\n", "<h4>\nResponsorio</h4>")
    .replace("Cántico\n", "<h4>Cántico</h4>")
    .replace('Al final de este cántico no se dice "Gloria al Padre".', "\n")
    .replace("Ant. 1.\n", "<b>\nAnt. 1. </b>")
    .replace("Ant. 2.\n", "<b>\nAnt. 2. </b>")
    .replace("Ant. 3.\n", "<b>\nAnt. 3. </b>")
    .replace("Cántico evangélico", "<h4>\nCántico evangélico\n</h4>")
    .replace("Oración conclusiva\n", "<h4>\nOración conclusiva</h4>")

    .replace(/(^|\n)(Salmo \d+)\n/g, (match, prefix, salmo) => {
      return `${prefix}<h4>${salmo}</h4>`;
    });
}

// Función para eliminar el rango entre "Himno latino" y "Amén"
function eliminarRango(text, inicio, fin) {
  const start = text.indexOf(inicio);
  const end = text.indexOf(fin) + fin.length;

  if (start !== -1 && end !== -1) {
    return text.slice(0, start) + text.slice(end);
  } else {
    console.log("No se encontraron las frases especificadas.");
    return text;
  }
}

// Función para limpiar y procesar el texto
function procesarTexto(text) {
  let textoLimpio = eliminarRango(text, "Himno latino", "Amen").replace(
    "Laudes\nSi las Laudes empiezan con el Invitatorio se omite la siguiente invocación y se dice el himno.\nInvocación inicial\nV.Dios mío, ven en mi auxilio.\nR.Señor, date prisa en socorrerme.\nGloria al Padre, y al Hijo, y al Espíritu Santo.\nComo era en el principio, ahora y siempre,\npor los siglos de los siglos. Amén. Aleluia.\n",
    text.indexOf("Himno") != -1 ? "" : "<h4>\nHimno</h4>"
  );
  textoLimpio = textoLimpio.slice(0, textoLimpio.indexOf("Conclusión"));
  textoLimpio =
    textoLimpio.slice(0, textoLimpio.indexOf("Cántico de Zacarías")) +
    textoLimpio
      .slice(textoLimpio.indexOf("Preces"))
      .replace(
        "Preces para consagrar a Dios el día y el trabajo\n",
        "<h4>\nPreces para consagrar a Dios el día y el trabajo</h4>"
      );
  textoLimpio = eliminarRango(
    textoLimpio,
    ", que estás en el cielo",
    "líbranos del mal."
  ).replace("\nPadre nuestro", " Padre nuestro...");
  textoLimpio = aplicarNegritas(textoLimpio).replace(
    /—\n(.*?)\n/g,
    (match, contenido) => {
      return `<i>${contenido}</i>\n`;
    }
  );
  textoLimpio = textoLimpio
    .replace(/\n/g, "<br>")
    .replace("Oración dominical", "\n");
  return textoLimpio;
}

// Evento de pegar texto en el textarea
input.addEventListener("input", (event) => {
  event.preventDefault(); // Evitar que el texto original se pegue automáticamente

  // Obtener el texto pegado desde el portapapeles
  const text = input.value;

  // Procesar el texto
  const formattedText = procesarTexto(text);

  // Mostrar el texto procesado en el div de salida
  output.innerHTML = formattedText;
});

// Función para copiar el contenido del div de salida al portapapeles
copyButton.addEventListener("click", () => {
  // Crear un elemento temporal para copiar el texto sin etiquetas HTML
  CopyToClipboard("output");
});

pasteButton.addEventListener("click", () => {
navigator.clipboard.readText()
  .then(text => {
    const formattedText = procesarTexto(text);

  // Mostrar el texto procesado en el div de salida
   output.innerHTML = formattedText;
      input.value = text;
    console.log('Texto del portapapeles:', text)
  })
  .catch(err => {
    console.error('Error al leer del portapapeles:', err)
  })
});
