// Datos de productos (constante)
const productos = [
    {
        id: 1,
        nombre: 'Tortitas de Huauzontle',
        descripcion: 'Tortitas ligeramente capeadas, rellenas de queso panela y bañadas en salsa de tu elección.',
        precio: 260.00,
        imagen: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=300&fit=crop'
    },
    {
        id: 2,
        nombre: 'Pierna y Muslo con Mole',
        descripcion: 'Pierna y muslo de pollo con mole hecho en casa. Acompañados con frijoles refritos. 380 g',
        precio: 242.00,
        imagen: 'https://images.unsplash.com/photo-1600891964092-4316c288032e?w=400&h=300&fit=crop'
    },
    {
        id: 3,
        nombre: 'Pechuga con Mole',
        descripcion: 'Pechuga de pollo con mole hecho en casa. Acompañados con frijoles refritos. 300 g',
        precio: 298.00,
        imagen: 'https://images.unsplash.com/photo-1599487488170-d11ec9c172f0?w=400&h=300&fit=crop'
    },
    {
        id: 4,
        nombre: 'Lengua de Res',
        descripcion: 'Lengua de res a la veracruzana o en escabeche con guarnición. 150 g',
        precio: 436.00,
        imagen: 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&h=300&fit=crop'
    },
    {
        id: 5,
        nombre: 'Pulpo',
        descripcion: 'Pulpo a la veracruzana, en escabeche o al mojo de ajo con guarnición. 400 g',
        precio: 510.00,
        imagen: 'https://images.unsplash.com/photo-1559847844-5315695dadae?w=400&h=300&fit=crop'
    },
    {
        id: 6,
        nombre: 'Ceviche Verde',
        descripcion: 'Tradicional ceviche verde lleno de frescura, sabores contrastantes y una combinación perfecta.',
        precio: 242.00,
        imagen: 'https://images.unsplash.com/photo-1514516345957-556ca7d90a29?w=400&h=300&fit=crop'
    },
    {
        id: 7,
        nombre: 'Enchiladas con Mole',
        descripcion: 'Enchiladas de pollo o queso panela bañadas con mole hecho en casa. Acompañadas con frijoles refritos.',
        precio: 254.00,
        imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=300&fit=crop'
    },
    {
        id: 8,
        nombre: 'Enchiladas',
        descripcion: 'Enchiladas de pollo o queso panela bañadas con salsa verde o roja. Acompañadas con frijoles refritos.',
        precio: 249.00,
        imagen: 'https://images.unsplash.com/photo-1599974464974-68b05d92f077?w=400&h=300&fit=crop'
    },
    {
        id: 9,
        nombre: 'Pescadillas de Minilla',
        descripcion: 'Deliciosas tortillas rellenas de pescado sazonado y frito.',
        precio: 157.00,
        imagen: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?w=400&h=300&fit=crop'
    }
];

// Estado del carrito (variable global)
let carrito = [];

// Inicializar la aplicación cuando el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', () => {
    renderizarProductos();
    configurarEventos();
});

// Función para renderizar (dibujar) los productos en el grid
function renderizarProductos() {
    const gridProductos = document.getElementById('productsGrid');
    // Mapea el array de productos a una cadena de HTML
    gridProductos.innerHTML = productos.map(producto => `
        <div class="product-card">
            <img src="${producto.imagen}" alt="${producto.nombre}" class="product-image">
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <p class="product-description">${producto.descripcion}</p>
                <div class="product-footer">
                    <span class="product-price">$${producto.precio.toFixed(2)}</span>
                    <button class="btn-add" onclick="agregarAlCarrito(${producto.id})">+</button>
                </div>
            </div>
        </div>
    `).join('');
}

// Función para agregar un producto al carrito
function agregarAlCarrito(productoId) {
    // Encuentra el producto en la lista de productos
    const producto = productos.find(p => p.id === productoId);
    // Busca si el producto ya existe en el carrito
    const itemExistente = carrito.find(item => item.id === productoId);
    
    if (itemExistente) {
        // Si existe, solo aumenta la cantidad
        itemExistente.quantity++;
        mostrarNotificacion('success', `Se agregó otra ${producto.nombre} al carrito`);
    } else {
        // Si no existe, lo agrega con cantidad 1
        carrito.push({ ...producto, quantity: 1 });
        mostrarNotificacion('success', `${producto.nombre} agregado al carrito`);
    }
    
    // Actualiza la vista del carrito
    actualizarCarrito();
}

// Función para actualizar la cantidad de un ítem en el carrito
function actualizarCantidad(productoId, cambio) {
    const item = carrito.find(item => item.id === productoId);
    
    if (item) {
        item.quantity += cambio; // Aplica el cambio (+1 o -1)
        
        if (item.quantity <= 0) {
            // Si la cantidad es cero o menos, lo elimina
            removerDelCarrito(productoId);
        } else {
            // Si no, solo actualiza la vista
            actualizarCarrito();
        }
    }
}

// Función para eliminar un producto del carrito
function removerDelCarrito(productoId) {
    const itemRemovido = carrito.find(item => item.id === productoId);
    // Filtra el array para remover el ítem con el ID dado
    carrito = carrito.filter(item => item.id !== productoId);
    mostrarNotificacion('info', `${itemRemovido.nombre} eliminado del carrito`);
    // Actualiza la vista del carrito
    actualizarCarrito();
}

// Función principal para actualizar la interfaz del carrito y contadores
function actualizarCarrito() {
    const contenedorItemsCarrito = document.getElementById('cartItems');
    const contadorCarritoHeader = document.getElementById('cartCount');
    const contadorItemsCarritoSidebar = document.getElementById('cartItemCount');
    const pieCarrito = document.getElementById('cartFooter');
    const montoSubtotal = document.getElementById('subtotalAmount');
    
    // Calcular el número total de ítems en el carrito
    const totalItems = carrito.reduce((sum, item) => sum + item.quantity, 0);
    contadorCarritoHeader.textContent = totalItems;
    contadorItemsCarritoSidebar.textContent = totalItems;
    
    // Muestra/oculta la insignia del carrito en el header
    if (totalItems > 0) {
        contadorCarritoHeader.classList.add('active');
    } else {
        contadorCarritoHeader.classList.remove('active');
    }
    
    // Renderizar ítems del carrito
    if (carrito.length === 0) {
        // Muestra un mensaje si el carrito está vacío
        contenedorItemsCarrito.innerHTML = '<p style="text-align: center; color: #6b7280; padding: 2rem;">Tu carrito está vacío</p>';
        pieCarrito.style.display = 'none'; // Oculta el pie si está vacío
    } else {
        // Genera el HTML para cada ítem en el carrito
        contenedorItemsCarrito.innerHTML = carrito.map(item => `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.nombre}" class="cart-item-image">
                <div class="cart-item-info">
                    <h4 class="cart-item-name">${item.nombre}</h4>
                    <p class="cart-item-price">$${item.precio.toFixed(2)}</p>
                    <div class="quantity-controls">
                        <button class="btn-quantity" onclick="actualizarCantidad(${item.id}, -1)">-</button>
                        <span class="quantity-value">${item.quantity}</span>
                        <button class="btn-quantity" onclick="actualizarCantidad(${item.id}, 1)">+</button>
                    </div>
                </div>
                <button class="btn-remove" onclick="removerDelCarrito(${item.id})">×</button>
            </div>
        `).join('');
        
        // Calcular el subtotal de todos los ítems
        const subtotal = carrito.reduce((sum, item) => sum + (item.precio * item.quantity), 0);
        montoSubtotal.textContent = `$${subtotal.toFixed(2)}`;
        pieCarrito.style.display = 'block'; // Muestra el pie si hay ítems
    }
}

// Función para simular el proceso de pago (checkout)
function checkout() {
    if (carrito.length === 0) {
        mostrarNotificacion('error', 'Tu carrito está vacío. Agrega productos para continuar.');
        return;
    }
    
    mostrarNotificacion('success', '¡Pedido procesado exitosamente! Pronto recibirás tu orden.');
    
    // Vacía el carrito después de un breve retraso
    setTimeout(() => {
        carrito = [];
        actualizarCarrito();
    }, 2000);
}

// Función para mostrar el modal de notificación
function mostrarNotificacion(tipo, mensaje) {
    const modal = document.getElementById('notificationModal');
    const contenidoModal = modal.querySelector('.modal-content');
    const iconoModal = document.getElementById('modalIcon');
    const tituloModal = document.getElementById('modalTitle');
    const mensajeModal = document.getElementById('modalMessage');
    
    // Objeto de configuración para diferentes tipos de notificación
    const configuracion = {
        success: {
            icon: '✅',
            title: '¡Éxito!',
            class: 'success'
        },
        error: {
            icon: '❌',
            title: 'Error',
            class: 'error'
        },
        info: {
            icon: 'ℹ️',
            title: 'Información',
            class: 'info'
        }
    };
    
    const ajustes = configuracion[tipo];
    
    // Establecer contenido y estilo del modal
    iconoModal.textContent = ajustes.icon;
    tituloModal.textContent = ajustes.title;
    mensajeModal.textContent = mensaje;
    
    // Limpiar clases de tipo de notificación y aplicar la nueva
    contenidoModal.classList.remove('success', 'error', 'info');
    contenidoModal.classList.add(ajustes.class);
    
    // Mostrar el modal
    modal.classList.add('active');
}

// Función para cerrar el modal de notificación
function closeNotification() {
    const modal = document.getElementById('notificationModal');
    modal.classList.remove('active');
}

// Configurar todos los Event Listeners
function configurarEventos() {
    // Cerrar modal al hacer clic fuera de su contenido
    const modal = document.getElementById('notificationModal');
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeNotification();
        }
    });
    
    // Alternar la visibilidad del menú principal en móviles
    const alternarMenu = document.getElementById('menuToggle');
    const navegacionPrincipal = document.getElementById('mainNav');
    
    alternarMenu.addEventListener('click', () => {
        // Si está en 'flex', lo cambia a 'none', y viceversa
        navegacionPrincipal.style.display = navegacionPrincipal.style.display === 'flex' ? 'none' : 'flex';
    });
}