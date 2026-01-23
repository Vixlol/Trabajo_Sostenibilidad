/* global marked, DOMPurify */

// Configuración de las páginas del proyecto
const PAGES = [
  {
    group: 'Proyecto',
    items: [
      { id: 'inicio', label: 'Inicio', file: 'README.md' },
      { id: 'acciones', label: 'Economía circular', file: 'AccionesSostenibles.md' },
      { id: 'tic', label: 'Sector TIC', file: 'SectorInformatica.md' },
    ]
  },
  {
    group: 'Roma Antigüedad',
    items: [
      { id: 'roma', label: 'Visión general', file: 'Sistemas-civilizaciones.md',
        sub: [
          { id: 'roma-materia', label: 'Materia', file: 'RomanosMateriales.md' },
          { id: 'roma-energia', label: 'Energía', file: 'RomanosEnergia.md' },
          { id: 'roma-condiciones', label: 'Condiciones', file: 'RomanosCondiciones.md' },
        ]
      },
    ]
  },
];

// Elementos del DOM
const navElement = document.getElementById('nav');
const pageElement = document.getElementById('page');
const tocElement = document.getElementById('toc');
const themeBtn = document.getElementById('themeToggle');

// Función para inicializar la web
function init() {
  console.log('Iniciando aplicación...');
  renderMenu();
  
  // Escuchar cambios en el # de la URL
  window.addEventListener('hashchange', cargarPagina);
  
  // Botón de tema oscuro/claro
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
  });

  // Cargar la página inicial si no hay hash
  if (!location.hash) {
    location.hash = '#/inicio';
  } else {
    cargarPagina();
  }
}

// Función para pintar el menú lateral
function renderMenu() {
  navElement.innerHTML = '';
  
  // Recorremos los grupos de páginas
  for (let group of PAGES) {
    let titulo = document.createElement('h4');
    titulo.textContent = group.group;
    navElement.appendChild(titulo);

    for (let item of group.items) {
      crearEnlaceMenu(item);

      // Si tiene submenú
      if (item.sub) {
        let subDiv = document.createElement('div');
        subDiv.className = 'nav-sub';
        for (let subItem of item.sub) {
          crearEnlaceMenu(subItem, subDiv);
        }
        navElement.appendChild(subDiv);
      }
    }
  }
}

// Helper para crear los enlaces
function crearEnlaceMenu(item, container = navElement) {
  let link = document.createElement('a');
  link.className = 'nav-item';
  link.href = '#/' + item.id;
  link.textContent = item.label; // + ' ' + (item.icon || '');
  container.appendChild(link);
}

// Función principal: Carga el MD y lo convierte a HTML
async function cargarPagina() {
  // Limpiamos el hash para sacar el ID. Ejemplo: #/roma -> roma
  let hash = location.hash.replace('#/', '');
  if (!hash) hash = 'inicio';

  // Buscar qué archivo corresponde a este ID
  let paginaEncontrada = null;
  
  // Búsqueda simple con bucles for
  for (let g of PAGES) {
    for (let item of g.items) {
      if (item.id === hash) paginaEncontrada = item;
      if (item.sub) {
        for (let s of item.sub) {
          if (s.id === hash) paginaEncontrada = s;
        }
      }
    }
  }

  if (!paginaEncontrada) {
    pageElement.innerHTML = '<h2>Error 404</h2><p>Página no encontrada.</p>';
    return;
  }

  // Poner mensaje de carga
  pageElement.innerHTML = '<p>Cargando contenido...</p>';
  tocElement.innerHTML = ''; // Limpiar índice

  try {
    // Petición fetch al archivo .md
    const response = await fetch(paginaEncontrada.file);
    if (!response.ok) throw new Error('Error al cargar archivo');
    
    const textoMarkdown = await response.text();

    // Usar la librería marked para convertir a HTML
    const htmlSucio = marked.parse(textoMarkdown);
    
    // Limpiar el HTML por seguridad (DOMPurify)
    const htmlLimpio = DOMPurify.sanitize(htmlSucio);
    
    pageElement.innerHTML = htmlLimpio;

    // Después de cargar el contenido, generamos el índice (TOC)
    generarIndice();

  } catch (error) {
    console.error(error);
    pageElement.innerHTML = '<h3>Error</h3><p>No se pudo cargar el archivo ' + paginaEncontrada.file + '</p>';
  }
}

// Genera un índice automático buscando los H2 y H3
function generarIndice() {
  const titulos = pageElement.querySelectorAll('h2, h3');
  
  if (titulos.length === 0) {
    tocElement.innerHTML = '<p>Sin índice</p>';
    return;
  }

  titulos.forEach((titulo, index) => {
    // Le ponemos un ID al título si no tiene para poder saltar a él
    if (!titulo.id) titulo.id = 'titulo-' + index;

    let link = document.createElement('a');
    link.href = '#' + titulo.id;
    link.textContent = titulo.textContent;
    link.className = 'toc-link';
    
    // Si es H3 lo indentamos un poco visualmente (añadiendo espacios o guión)
    if (titulo.tagName === 'H3') {
      link.textContent = '- ' + link.textContent;
      link.style.paddingLeft = '15px';
    }

    // Al hacer click, que haga scroll suave (opcional)
    link.addEventListener('click', (e) => {
      e.preventDefault();
      document.getElementById(titulo.id).scrollIntoView({ behavior: 'smooth' });
    });

    tocElement.appendChild(link);
  });
}

// Arrancamos
init();