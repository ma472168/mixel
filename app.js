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
    const btn = document.getElementById('btn-descargar');
    
    // Ocultar botón
    btn.style.display = 'none';

    // Seleccionamos el body
    const elementoParaImprimir = document.body; 
    
    // Fecha
    const fecha = new Date();
    const opciones = { year: 'numeric', month: 'long', day: 'numeric' };
    const fechaFormateada = fecha.toLocaleDateString('es-MX', opciones);

    // Crear Footer
    const footer = document.createElement('div');
    // Le damos estilo inline para asegurar que se centre en el PDF
    footer.innerHTML = `
        <div style="width:100%; text-align:center; margin-top: 40px; padding: 20px; color: #d63384; border-top: 1px solid #ffb7b2;">
            <p style="font-weight: bold; margin: 0;">Hecho por tu principito con mucho amor ❤️</p>
            <p style="font-size: 12px; margin-top: 5px;">${fechaFormateada}</p>
        </div>
    `;
    
    elementoParaImprimir.appendChild(footer);

    var opt = {
        margin:       0.5,
        filename:     'para_mixel.pdf',
        image:        { type: 'jpeg', quality: 0.98 },
        html2canvas:  { scale: 2, scrollY: 0 }, // scrollY: 0 ayuda a que no salga cortado
        jsPDF:        { unit: 'in', format: 'letter', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(elementoParaImprimir).save().then(() => {
        elementoParaImprimir.removeChild(footer);
        btn.style.display = 'block';
    });
});
