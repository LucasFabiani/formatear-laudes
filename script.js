// Import the functions you need from the SDKs you need
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-app.js";
import { getFirestore, doc, getDoc, getDocs, collection, setDoc } from "https://www.gstatic.com/firebasejs/11.3.1/firebase-firestore.js";

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyDjHvkLXlYWJhB2R1pPAeRh8SaTOs3qKww",
  authDomain: "litu-cea.firebaseapp.com",
  projectId: "litu-cea",
  storageBucket: "litu-cea.firebasestorage.app",
  messagingSenderId: "264826744823",
  appId: "1:264826744823:web:ea6b840aeb2c03b65a48f2",
  measurementId: "G-PS3GLKHDJD"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const input = document.getElementById("input");
const output = document.getElementById("output");
const copyButton = document.getElementById("copyButton");
const pasteButton = document.getElementById("pasteButton");

var hora = {
  memoria: "",
  tipo: "",
  himno: "",
  ant1: "",
  salmo1: { numero: "", letra: "" },
  ant2: "",
  cantico: { cita: "", letra: "" },
  ant3: "",
  salmo2: { numero: "", letra: "" },
  lectura_breve: { cita: "", letra: "" },
  responsorio: "",
  antev: "",
  preces: "",
  oracion_dominical: "",
  conclusion: "",
}

class RichText {
  constructor(text = "") {
    this.text = text;
  }

  // Método para aplicar estilos en negritas
  boldAll(pattern) {
    const regex = new RegExp(pattern, "g");
    this.text = this.text.replace(regex, (match) => `<b>${match}</b>`);
    return this;
  }

  // Método para poner en h4 líneas que comiencen con un patrón específico
  h4LinesStartingWith(pattern) {
    const regex = new RegExp(`^${pattern}.*$`, "gm");
    this.text = this.text.replace(regex, (line) => `<br><h4>${line}</h4>`);
    return this;
  }

  // Método para aplicar encabezados h4
  h4All(pattern) {
    const regex = new RegExp(pattern, "g");
    this.text = this.text.replace(regex, (match) => `<br><h4>${match}</h4>`);
    return this;
  }

  // Método para poner en negrita líneas que comiencen con un patrón específico
  boldLinesStartingWith(pattern) {
    const regex = new RegExp(`^${pattern}.*$`, "gm");
    this.text = this.text.replace(regex, (line) => `<b>${line}</b>`);
    return this;
  }

  // Método genérico para aplicar reemplazos con una función o texto
  replace(pattern, replacement) {
    const regex = new RegExp(pattern, "g");
    this.text = this.text.replace(regex, replacement);
    return this;
  }

  extract(startKeyWord, endKeyWord, startAtLeast = 0) {
    let t = this.text.slice(startAtLeast);
    t = t.slice(t.indexOf(startKeyWord) + startKeyWord.length);
    t = t.slice(0, t.indexOf(endKeyWord)).trim();
    return t;
  }

  getLine(i) {
    return this.text.split('\n')[i]
  }

  // Método para eliminar un rango de texto
  removeRange(startPattern, endPattern, includingEnd = true) {
    const start = this.text.indexOf(startPattern);
    if (start !== -1) {
      const end = this.text.indexOf(endPattern, start) + (includingEnd ? endPattern.length : 0);
      if (end > start) {
        this.text = this.text.slice(0, start) + this.text.slice(end);
      }
    }
    return this;
  }


  // Método para obtener el texto procesado
  getProcessedText() {
    return this.text;
  }
}

async function sha256(texto) {
  const encoder = new TextEncoder();
  const data = encoder.encode(texto);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(byte => byte.toString(16).padStart(2, '0')).join('');
}

function obtenerFecha() {
  const fecha = new Date();
  const dia = String(fecha.getDate()).padStart(2, '0');  // Asegura dos dígitos
  const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes empieza desde 0
  const año = String(fecha.getFullYear()).slice(-2); // Últimos dos dígitos del año

  return `${dia}-${mes}-${año}`;
}


// Función para verificar y escribir solo si no existe
const writeIfNotExists = async (path, id, data) => {
  const docRef = doc(db, path, id);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) {
    await setDoc(docRef, data);
  } else {
    console.log(`El documento con ID ${id} ya existe. No se sobrescribirá.`);
  }
};


async function upload() {
  try {
    const idant1 = await sha256(hora.ant1)
    const idant2 = await sha256(hora.ant2)
    const idant3 = await sha256(hora.ant3)
    const idantev = await sha256(hora.antev)
    const idres = await sha256(hora.responsorio)
    const idpre = await sha256(hora.preces)
    const iddom = await sha256(hora.oracion_dominical)
    const idcon = await sha256(hora.conclusion)


    // Aplicando la función a tus datos
    hora.himno.forEach(letra => writeIfNotExists("himnos", letra.split('\n')[0], { texto: letra }));
    writeIfNotExists("salmos", hora.salmo1.numero, { texto: hora.salmo1.letra });
    writeIfNotExists("salmos", hora.salmo2.numero, { texto: hora.salmo2.letra });
    writeIfNotExists("antifonas", idant1, { texto: hora.ant1 });
    writeIfNotExists("antifonas", idant2, { texto: hora.ant2 });
    writeIfNotExists("antifonas", idant3, { texto: hora.ant3 });
    writeIfNotExists("antifonas", idantev, { texto: hora.antev });
    writeIfNotExists("canticos", hora.cantico.cita, { texto: hora.cantico.letra });
    writeIfNotExists("lecturas_breves", hora.lectura_breve.cita, { texto: hora.lectura_breve.letra });
    writeIfNotExists("responsorios", idres, { texto: hora.responsorio });
    writeIfNotExists("preces", idpre, { texto: hora.preces });
    writeIfNotExists("oraciones_dominicales", iddom, { texto: hora.oracion_dominical });
    writeIfNotExists("oraciones_conclusivas", idcon, { texto: hora.conclusion });
    writeIfNotExists("liturgia", obtenerFecha(), {
      ant1: idant1,
      ant2: idant2,
      ant3: idant3,
      antev:idantev,
      cantico: hora.cantico.cita,
      himno: hora.himno.map(letra => letra.split('\n')[0]),
      lectura_breve: hora.lectura_breve.cita,
      memoria: hora.memoria,
      oracion_dominical: iddom,
      preces: idpre,
      responsorio: idres,
      salmo1: hora.salmo1.numero,
      salmo2: hora.salmo2.numero,
      tipo: hora.tipo
    });
    // const docRef = doc(db, "salmos", hora.salmo1.numero);
    // const docSnap = await getDoc(docRef);
    // console.log(docSnap.data());

    // const querySnapshot = await getDocs(collection(db, "salmos"));
    // querySnapshot.forEach((doc) => console.log(doc));
    console.log("Documentos agregados!");
  } catch (error) {
    console.error("Error al enviar mensaje:", error);
  }
}

// Función para procesar el texto
function process(rawText) {
  if (rawText.includes("(Oración de la mañana)")) {
    alert("Texto invalido: Extraelo de la App de la Liturgia de las Horas CEA");
    return;
  }
  if (!rawText.includes("Ant.") || !rawText.includes("Salmo") || !rawText.includes("Amén.")) {
    alert("Texto invalido");
  }
  const richText = new RichText(rawText);

  hora.memoria = richText.getLine(0);
  hora.tipo = richText.getLine(1).toLowerCase();
  hora.himno = richText.extract("Himno", "Himno latino").split("O bien:").map(letra => letra.replace(/^\s*\w+\s*\[\w+\]\s*/, "").trim());
  hora.ant1 = richText.extract("Ant. 1.", "Salmo");
  hora.ant2 = richText.extract("Ant. 2.", "Cántico");
  hora.ant3 = richText.extract("Ant. 3.", "Salmo");
  let aux = richText.extract("Salmo ", "Gloria al Padre");
  hora.salmo1.numero = aux.slice(0, aux.indexOf("\n"));
  hora.salmo1.letra = aux.slice(aux.indexOf("\n") + 1);
  aux = richText.extract("Salmo ", "Gloria al Padre", richText.text.indexOf("Salmo ") + 5);
  hora.salmo2.numero = aux.slice(0, aux.indexOf("\n"));
  hora.salmo2.letra = aux.slice(aux.indexOf("\n") + 1);
  hora.antev = richText.extract("Cántico evangélico\nAnt.", "Cántico de Zacarías");
  aux = richText.extract("Cántico", "Gloria al Padre");
  hora.cantico.cita = aux.slice(0, aux.indexOf("\n"));
  hora.cantico.letra = aux.slice(aux.indexOf("\n") + 1);
  aux = richText.extract("Lectura breve", "Responsorio");
  hora.lectura_breve.cita = aux.slice(0, aux.indexOf("\n"));
  hora.lectura_breve.letra = aux.slice(aux.indexOf("\n") + 1);
  hora.responsorio = richText.extract("Responsorio", "Cántico")
  hora.preces = richText.extract("Preces para consagrar a Dios el día y el trabajo", "Oración dominical");
  hora.oracion_dominical = richText.extract("Oración dominical\nV.", "Padre nuestro, que");
  hora.conclusion = richText.extract("Oración conclusiva\nV.", "R.Amén.");

  console.log(hora);

  richText.text = addSalmoAudios(rawText)

  // Aplicar los cambios al texto
  return richText
    .removeRange("Himno latino", "Amen.") // Eliminar el rango
    .removeRange("Laudes", "Amén. Aleluia.")
    .removeRange("Cántico de Zacarías", "Preces", false)
    .removeRange("Conclusión", "Demos gracias a Dios.")
    .removeRange(", que estás en el cielo", "líbranos del mal.")
    .boldAll("V\\.") // Negritas para "V."
    .boldAll("R\\.") // Negritas para "R."
    .boldAll("(Ant\\. \\d+\\.)") // Negritas para "Ant."
    .boldAll("Ant\\.") // Negritas para "Ant."
    .h4LinesStartingWith("Salmo")
    .h4All("Cántico\n")
    .h4All("Himno\n") // Encabezado para "Himno"
    .h4All("Lectura breve\n") // Encabezado para "Lectura breve"
    .h4All("Responsorio\n") // Encabezado para "Responsorio"
    .h4All("Cántico evangélico\n") // Encabezado para "Cántico evangélico"
    .h4All("Preces para consagrar a Dios el día y el trabajo\n")
    .h4All("Oración conclusiva\n") // Encabezado para "Oración conclusiva"
    .replace(
      "Gloria al Padre, y al Hijo, y al Espíritu Santo.\nComo era en el principio, ahora y siempre,\npor los siglos de los siglos. Amén.",
      "Gloria al Padre y al Hijo..."
    ) // Simplificar el Gloria
    .replace("\nPadre nuestro", " Padre nuestro...") // Modificación del Padre Nuestro
    .replace(/—\n(.*?)\n/g, (match, contenido) => `<i>${contenido}</i>\n`) // Cursivas
    .replace(/\n/g, "<br>") // Convertir saltos de línea en <br>
    .getProcessedText();
}

// Variable global para almacenar los salmos
let listaSalmos = {};

// Carga los salmos al inicio de la aplicación
function cargarListaSalmosSincronicamente() {
  const request = new XMLHttpRequest();
  request.open("GET", "src/lista-salmos.txt", false); // Llamada sincrónica
  request.send(null);

  if (request.status === 200) {
    const salmos = request.responseText
      .replace(/'/g, '') // Quitar las comillas simples
      .split(',') // Dividir por comas
      .map(item => item.trim()); // Quitar espacios

    // Agrupar los salmos por número
    salmos.forEach(salmo => {
      const match = salmo.match(/SR_(\d+)/); // Extraer el número del salmo
      if (match) {
        const numero = match[1];
        if (!listaSalmos[numero]) {
          listaSalmos[numero] = []; // Crear un array para este número
        }
        listaSalmos[numero].push(salmo); // Agregar el salmo al grupo
      }
    });
  } else {
    console.error("Error al cargar lista de salmos:", request.statusText);
  }
}


// Función para agregar audios a los salmos en el texto
function addSalmoAudios(text) {
  const regex = /^Salmo (\d+).*$/gm; // Captura el número después de "Salmo"

  // Procesar el texto y agregar audios
  return text.replace(regex, (match, numero) => {
    if (listaSalmos[numero]) {
      // Crear etiquetas <audio> para los salmos
      const audioTags = listaSalmos[numero]
        .map(
          salmo =>
            `<audio controls src="https://www.corosanclemente.com.ar/Part/Responsoriales/audio/${salmo}.mp3"></audio><br>`
        )
        .join('');

      return `${match} <br>${audioTags}`; // Retornar la línea con los audios
    }
    return match; // Si no hay salmos, dejar el texto igual
  });
}

function loadDefaultText() {
  fetch('src/input-example.txt')  // Accede al archivo directamente desde el repositorio
    .then(response => response.text())
    .then(data => {
      input.value = data;

      // Mostrar el texto procesado en el div de salida
      output.innerHTML = process(input.value);
    })
    .catch(error => console.error('Error al cargar el archivo:', error));
}

// Copiar al portapapeles
function copy() {
  const range = document.createRange();
  range.selectNode(output);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);

  if (document.execCommand("copy")) {
    copyButton.innerHTML = "<i class='fa fa-check'></i> Copiado!";
    setTimeout(() => {
      copyButton.innerHTML = "<i class='fa fa-copy'></i> Copiar";
    }, 2000);
  }
  window.getSelection().removeAllRanges();
}

// Pegar desde el portapapeles
async function paste() {
  try {
    const text = await navigator.clipboard.readText();
    input.value = text;
    output.innerHTML = process(text);
    upload();
  } catch (err) {
    console.error('Error al leer del portapapeles:', err);
  }
}

// Manejo de archivos arrastrados
function handleFileDrop(event) {
  event.preventDefault();
  const file = event.dataTransfer.files[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      input.value = text;
      output.innerHTML = process(text);
      upload();
    };
    reader.readAsText(file);
  }
}

cargarListaSalmosSincronicamente();

// Eventos
window.onload = loadDefaultText;
copyButton.addEventListener("click", copy);
pasteButton.addEventListener("click", paste);

document.addEventListener("dragover", (e) => e.preventDefault());
document.addEventListener("drop", handleFileDrop);

document.addEventListener("keydown", (e) => {
  if (e.ctrlKey && e.key === 'v') paste();
  if (e.ctrlKey && e.key === 'c') copy();
});

function play() {
  const audios = document.querySelectorAll("audio");

  function playAudio(index = 0) {
    if (index < audios.length) {
      const audio = audios[index];
      audio.play();

      audio.onended = () => {
        playAudio(index + 1);
      };
    }
  }

  playAudio();
};


// Opcion para instalar app en el movil con Chrome
if ("serviceWorker" in navigator) {
  navigator.serviceWorker.register("sw.js")
    .then(() => console.log("Service Worker registrado"))
    .catch((err) => console.log("Error en Service Worker", err));
}

let deferredPrompt;

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;

  // Muestra el botón de instalación
  const installBtn = document.createElement("button");
  installBtn.innerText = "Instalar App";
  installBtn.style.position = "fixed";
  installBtn.style.bottom = "20px";
  installBtn.style.right = "20px";
  installBtn.style.padding = "10px";
  installBtn.style.backgroundColor = "#4CAF50";
  installBtn.style.color = "#fff";
  installBtn.style.border = "none";
  installBtn.style.borderRadius = "5px";
  installBtn.style.cursor = "pointer";

  document.body.appendChild(installBtn);

  installBtn.addEventListener("click", () => {
    deferredPrompt.prompt();
    deferredPrompt.userChoice.then((choiceResult) => {
      if (choiceResult.outcome === "accepted") {
        console.log("Usuario aceptó la instalación");
      } else {
        console.log("Usuario canceló la instalación");
      }
      deferredPrompt = null;
      document.body.removeChild(installBtn);
    });
  });
});
