import { auth, db } from "./firebase.js";

import {
  GoogleAuthProvider,
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js";

import {
  collection,
  addDoc,
  getDocs
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

const provider = new GoogleAuthProvider();

const loginBtn = document.getElementById("login-google");
const logoutBtn = document.getElementById("logout");
const form = document.getElementById("form-gasto");
const lista = document.getElementById("lista-gastos");
const totalEl = document.getElementById("total");

let chart;

// LOGIN
loginBtn.addEventListener("click", async () => {
  await signInWithPopup(auth, provider);
});

logoutBtn.addEventListener("click", async () => {
  await signOut(auth);
});

// SESIÓN
onAuthStateChanged(auth, user => {
  if (user) {
    document.body.classList.add("logged");
    cargarGastos();
  } else {
    document.body.classList.remove("logged");
  }
});

// AGREGAR GASTO
form.addEventListener("submit", async e => {
  e.preventDefault();

  const gasto = {
    monto: Number(monto.value),
    categoria: categoria.value,
    fecha: fecha.value,
    nota: nota.value
  };

  await addDoc(
    collection(db, "users", auth.currentUser.uid, "gastos"),
    gasto
  );

  form.reset();
  cargarGastos();
});

// CARGAR GASTOS
async function cargarGastos() {
  const snapshot = await getDocs(
    collection(db, "users", auth.currentUser.uid, "gastos")
  );

  const gastos = snapshot.docs.map(d => d.data());
  render(gastos);
}

// RENDER
function render(gastos) {
  lista.innerHTML = "";
  let total = 0;
  const categorias = {};

  gastos.forEach(g => {
    total += g.monto;
    categorias[g.categoria] = (categorias[g.categoria] || 0) + g.monto;

    lista.innerHTML += `
      <li>
        ${g.categoria} - $${g.monto}
        <span>${g.fecha}</span>
      </li>
    `;
  });

  totalEl.textContent = `$${total.toFixed(2)}`;
  renderGrafica(categorias);
}

// GRÁFICA
function renderGrafica(data) {
  if (chart) chart.destroy();

  chart = new Chart(document.getElementById("grafica"), {
    type: "doughnut",
    data: {
      labels: Object.keys(data),
      datasets: [{
        data: Object.values(data)
      }]
    }
  });
}

document.getElementById('btn-descargar').addEventListener('click', () => {
    // 1. Mensaje de prueba (Bórralo si te molesta después de que funcione)
    alert("Iniciando generación de PDF... espera un momento.");

    // 2. Seleccionamos SOLO el área de la carta
    const elemento = document.getElementById('area-imprimir');

    // 3. Crear fecha y footer
    const fecha = new Date();
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-MX', opciones);

    // Creamos el footer
    const footer = document.createElement('div');
    footer.innerHTML = `
        <div style="width:100%; text-align:center; margin-top: 20px; padding-top: 20px; color: #d63384; border-top: 1px solid #ffb7b2;">
            <p style="font-weight: bold; margin: 0;">Hecho por tu principito con mucho amor ❤️</p>
            <p style="font-size: 12px; margin-top: 5px;">${fechaFormateada}</p>
        </div>
    `;
    
    // Lo metemos temporalmente dentro del área a imprimir
    elemento.appendChild(footer);

    // 4. Configuración
    var opt = {
        margin:       0.5,
        filename:     'para_mixel.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2 }, // Si falla en iPhone, cambia este 2 por un 1
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    // 5. Generar PDF con manejo de errores
    html2pdf()
        .set(opt)
        .from(elemento)
        .save()
        .then(() => {
            // Éxito: Quitamos el footer
            elemento.removeChild(footer);
            alert("¡PDF descargado con éxito!");
        })
        .catch((err) => {
            // Error: Avisamos qué pasó
            console.error(err);
            alert("Hubo un error al crear el PDF: " + err);
            // Aseguramos quitar el footer aunque falle
            if(footer.parentNode) elemento.removeChild(footer);
        });
});
