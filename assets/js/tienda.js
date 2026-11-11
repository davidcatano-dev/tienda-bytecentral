// ByteCentral: Catálogo, Buscador, Filtros y Carrito

const TARIFA_KWH = 950;
const DIAS_MES = 30;

// Estado global de la busqueda y el filtro
let categoriaActual = "todas";
let textoBusqueda = "";

// Arreglo de productos (8 productos, 3 categorías)
const productos = [
    { id: 1, nombre: "Bombillo LED 9 W", categoria: "iluminacion", precio: 8900, wattsAntes: 60, wattsDespues: 9, horasDia: 5 },
    { id: 2, nombre: "Panel LED 18 W", categoria: "iluminacion", precio: 35000, wattsAntes: 40, wattsDespues: 18, horasDia: 8 },
    { id: 3, nombre: "Reflector LED 50 W", categoria: "iluminacion", precio: 59000, wattsAntes: 250, wattsDespues: 50, horasDia: 6 },
    { id: 4, nombre: "Nevera Eficiente Inverter", categoria: "electrodomesticos", precio: 1890000, wattsAntes: 80, wattsDespues: 40, horasDia: 24 },
    { id: 5, nombre: "Aire Acondicionado Inverter 12k BTU", categoria: "electrodomesticos", precio: 2100000, wattsAntes: 1400, wattsDespues: 900, horasDia: 6 },
    { id: 6, nombre: "Regleta Inteligente EcoSwitch", categoria: "electrodomesticos", precio: 65000, wattsAntes: 15, wattsDespues: 0, horasDia: 20 },
    { id: 7, nombre: "Calentador Solar de Agua 150L", categoria: "solar", precio: 1200000, wattsAntes: 3500, wattsDespues: 0, horasDia: 0.5 },
    { id: 8, nombre: "Kit Panel Solar Autónomo 50 W", categoria: "solar", precio: 2400000, wattsAntes: 550, wattsDespues: 0, horasDia: 4.5 },
    { id: 9, nombre: "Kit Panel Solar Dinamico", categoria: "solar", precio: 256000, wattsAntes: 550, wattsDespues: 0, horasDia: 3.5 }
];

let carrito = [];

// Funciones auxiliares 
function calcularAhorroKwhMes(producto) {
    return ((producto.wattsAntes - producto.wattsDespues) * producto.horasDia * DIAS_MES) / 1000;
}

function calcularAhorroPesosMes(producto) {
    return calcularAhorroKwhMes(producto) * TARIFA_KWH;
}

function formatoPesos(valor) {
    return "$" + Math.round(valor).toLocaleString("es-CO");
}

function obtenerNombreCategoria(categoria) {
    if (categoria === "iluminacion") return "Iluminación";
    if (categoria === "electrodomesticos") return "Electrodomésticos";
    if (categoria === "solar") return "Energía solar";
    return "General";
}

// Renderizado dinámico de tarjetas con filtro y buscador
function mostrarProductos() {
    const contenedor = document.querySelector("#productos");
    if (!contenedor) return;

    contenedor.innerHTML = "";
    let contadorVisibles = 0;

    for (const producto of productos) {
        // Condicion 1: Filtro por categoría
        if (categoriaActual !== "todas" && producto.categoria !== categoriaActual) {
            continue;
        }

        // Condicion 2: Buscador por texto (insensible a mayúsculas/minúsculas)
        const coincideNombre = producto.nombre.toLowerCase().includes(textoBusqueda.toLowerCase());
        if (textoBusqueda !== "" && !coincideNombre) {
            continue;
        }

        contadorVisibles++;

        const ahorroKwh = calcularAhorroKwhMes(producto).toFixed(1);
        const ahorroPesos = formatoPesos(calcularAhorroPesosMes(producto));

        contenedor.innerHTML += `
            <article class="tarjeta">
                <span class="categoria">${obtenerNombreCategoria(producto.categoria)}</span>
                <h3>${producto.nombre}</h3>
                <p>Reemplaza un equipo de ${producto.wattsAntes} W.
                Ahorra <span class="ahorro">${ahorroKwh} kWh</span> al mes.</p>
                <p class="precio">${formatoPesos(producto.precio)}</p>
                <p>Ahorro estimado: <span class="ahorro">${ahorroPesos}/mes</span></p>
                <button class="btn btn-primary btn-sm" data-id="${producto.id}">
                    Agregar al carrito
                </button>
            </article>
        `;
    }

    // Mensaje alternativo si no hay coincidencias
    if (contadorVisibles === 0) {
        contenedor.innerHTML = `<p class="alert alert-info w-100 text-center">No se encontraron productos que coincidan con la búsqueda.</p>`;
    }
}

// --- Gestión del Carrito ---
function agregarAlCarrito(idProducto) {
    for (const producto of productos) {
        if (producto.id === idProducto) {
            carrito.push(producto);
            break;
        }
    }
    actualizarCarrito();
}

function actualizarCarrito() {
    const listaCarrito = document.querySelector("#lista-carrito");
    const totalElem = document.querySelector("#total");
    const ahorroElem = document.querySelector("#ahorro");

    if (!listaCarrito) return;

    listaCarrito.innerHTML = "";
    let totalPrecio = 0;
    let totalAhorroMensual = 0;

    for (const producto of carrito) {
        listaCarrito.innerHTML += `<li>${producto.nombre}: ${formatoPesos(producto.precio)}</li>`;
        totalPrecio += producto.precio;
        totalAhorroMensual += calcularAhorroPesosMes(producto);
    }

    if (totalElem) {
        totalElem.textContent = `Total: ${formatoPesos(totalPrecio)}`;
    }

    if (ahorroElem) {
        if (carrito.length === 0) {
            ahorroElem.textContent = "El carrito está vacío.";
        } else {
            const mesesRetorno = Math.ceil(totalPrecio / totalAhorroMensual);
            ahorroElem.textContent = `Ahorras ${formatoPesos(totalAhorroMensual)}/mes: la compra se paga sola en ${mesesRetorno} meses.`;
        }
    }
}

// --- Inicialización y eventos del DOM ---
document.addEventListener("DOMContentLoaded", function () {
    mostrarProductos();
    actualizarCarrito();

    // 1. Evento 'input' en el buscador (Búsqueda en tiempo real)
    const inputBuscador = document.querySelector("#buscador");
    if (inputBuscador) {
        inputBuscador.addEventListener("input", function (e) {
            textoBusqueda = e.target.value.trim();
            mostrarProductos();
        });
    }

    // 2. Evento 'click' en botones de filtro por categoría
    const botonesFiltro = document.querySelectorAll(".filtro");
    for (const boton of botonesFiltro) {
        boton.addEventListener("click", function () {
            for (const b of botonesFiltro) b.classList.remove("activo");
            this.classList.add("activo");
            categoriaActual = this.dataset.categoria;
            mostrarProductos();
        });
    }

    // 3. Evento 'click' delegado para los botones "Agregar al carrito"
    const contenedorProductos = document.querySelector("#productos");
    if (contenedorProductos) {
        contenedorProductos.addEventListener("click", function (e) {
            if (e.target && e.target.dataset.id) {
                agregarAlCarrito(Number(e.target.dataset.id));
            }
        });
    }

    // 4. Evento 'click' para vaciar el carrito
    const botonVaciar = document.querySelector("#vaciar");
    if (botonVaciar) {
        botonVaciar.addEventListener("click", function () {
            carrito = [];
            actualizarCarrito();
        });
    }
});