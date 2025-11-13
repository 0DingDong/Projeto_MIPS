// Sidebar toggle
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));
}

// Elementos do menu (definir cedo para evitar referências antes da inicialização)
const conteudo = document.getElementById("conteudo");
const verMapa = document.getElementById("verMapa");
const salasLivres = document.getElementById("salasLivres");
const pedirSala = document.getElementById("pedirSala");
const procurar = document.getElementById("procurar");
const conta = document.getElementById("conta");
const detalhesConta = document.getElementById("detalhes-conta");
const accountDetails = document.getElementById("account-details");

// Helpers para gerir #account-details e o conteúdo da <main>
function ensureAccountDetails() {
  // dedupe any accidental duplicates
  const allAds = document.querySelectorAll('#account-details');
  if (allAds && allAds.length > 1) {
    // keep the first, remove the rest
    for (let i = 1; i < allAds.length; i++) allAds[i].remove();
  }
  let ad = document.getElementById('account-details');
  const mainEl = document.querySelector('.main');
  if (!mainEl) return null;
  if (!ad) {
    ad = document.createElement('div');
    ad.id = 'account-details';
    ad.className = 'secao';
    ad.style.display = 'none';
    mainEl.insertBefore(ad, mainEl.firstChild);
  }
  return ad;
}

// snapshot to restore original main content when toggling details
let originalMainHTML = null;

function hideSiblings(mainEl, keepId = 'account-details') {
  Array.from(mainEl.children).forEach((child) => {
    if (child.id !== keepId) child.style.display = 'none';
  });
}

function showSiblings(mainEl, keepId = 'account-details') {
  Array.from(mainEl.children).forEach((child) => {
    if (child.id !== keepId) child.style.display = '';
  });
}

function hideAccountDetailsAndShowContent(contentEl) {
  const mainEl = document.querySelector('.main');
  if (!mainEl) return;
  const ad = ensureAccountDetails();
  if (ad) ad.style.display = 'none';

  // snapshot original content (only the first time)
  if (originalMainHTML === null) originalMainHTML = mainEl.innerHTML;

  // remove existing content children except account-details
  Array.from(mainEl.children).forEach((child) => {
    if (child.id !== 'account-details') mainEl.removeChild(child);
  });
  mainEl.appendChild(contentEl);
}

function toggleAccountDetails(pageHtml) {
  const mainEl = document.querySelector('.main');
  if (!mainEl) return;
  const ad = ensureAccountDetails();
  if (!ad) return;

  const isHidden = (ad.style.display === 'none' || getComputedStyle(ad).display === 'none');
  ad.innerHTML = pageHtml;
  if (isHidden) {
    // show details, hide other content
    ad.style.display = 'block';
    hideSiblings(mainEl, 'account-details');
    ad.scrollIntoView({ behavior: 'smooth' });
  } else {
    // hide details, restore other content
    ad.style.display = 'none';
    // if we have a snapshot of original content, restore it
    if (originalMainHTML !== null) {
      mainEl.innerHTML = originalMainHTML;
      // ensure account-details exists and is hidden after restore
      const ad2 = ensureAccountDetails();
      if (ad2) ad2.style.display = 'none';
      // re-initialize map controls if map exists in restored content
      carregarMapa();
    } else {
      showSiblings(mainEl, 'account-details');
    }
  }
}

// Handler para 'Salas Livres' — preserva #account-details
if (salasLivres && conteudo) {
  salasLivres.addEventListener("click", () => {
    // construir conteúdo como elemento DOM e preservar #account-details
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Salas Livres</h2>
      <p>Aqui será exibida a lista de salas atualmente disponíveis.</p>
    `;
    hideAccountDetailsAndShowContent(contentEl);
  });
}

// Handler para 'Reservar Sala' — preserva #account-details
if (pedirSala && conteudo) {
  pedirSala.addEventListener("click", () => {
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Reservar Sala</h2>
      <p>Escolha a sala e o horário pretendido para realizar uma reserva.</p>
      <form class="form-reserva">
        <label for="sala">Sala:</label>
        <input type="text" id="sala" placeholder="Ex: B2.04">
        <label for="data">Data:</label>
        <input type="date" id="data">
        <label for="hora">Hora:</label>
        <input type="time" id="hora">
        <button type="submit">Reservar</button>
      </form>
    `;
    hideAccountDetailsAndShowContent(contentEl);
  });
}

carregarMapa();

// Handler para 'Ver Mapa' — injeta o mapa preservando #account-details quando existir
if (verMapa && conteudo) {
  verMapa.addEventListener("click", () => {
    // construir o mapa como elemento DOM
    const mapEl = document.createElement('div');
    mapEl.className = 'planta-container';
    mapEl.innerHTML = `
      <button class="seta seta-esquerda" id="anterior">&#10094;</button>
      <div class="planta-wrapper">
        <img id="plantaImagem" src="planta2.png" alt="Planta Andar 2" class="planta-img">
        <div id="andarTexto" class="andar-texto">Andar 2</div>
      </div>
      <button class="seta seta-direita" id="proximo">&#10095;</button>
    `;

    // esconder account details e mostrar o mapa
    hideAccountDetailsAndShowContent(mapEl);
    carregarMapa();
  });
}

// Função do mapa
function carregarMapa() {
  const imagens = ["planta2.png", "planta3.png"];
  const andares = ["Andar 2", "Andar 3"];
  let index = 0;

  const plantaImagem = document.getElementById("plantaImagem");
  const andarTexto = document.getElementById("andarTexto");
  const anterior = document.getElementById("anterior");
  const proximo = document.getElementById("proximo");

  if (plantaImagem && anterior && proximo && andarTexto) {
    const atualizarPlanta = () => {
      plantaImagem.src = imagens[index];
      andarTexto.textContent = andares[index];
    };

    anterior.addEventListener("click", () => {
      index = (index - 1 + imagens.length) % imagens.length;
      atualizarPlanta();
    });

    proximo.addEventListener("click", () => {
      index = (index + 1) % imagens.length;
      atualizarPlanta();
    });
  }
}

// Mostrar detalhes da conta dependendo da página
if (detalhesConta) {
  detalhesConta.addEventListener("click", (e) => {
    e.preventDefault();
    const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : (document.title || '').toLowerCase();
    let html = '';
    if (page === 'aluno' || (typeof page === 'string' && page.toLowerCase().includes('aluno'))) {
      html = `<h2>Detalhes da Conta</h2>
              <p>Como aluno, pode procurar salas, ver mapas e solicitar reservas (sujeito a aprovação). Pode também consultar as suas reservas e informações pessoais.</p>`;
    } else if (page === 'professor' || (typeof page === 'string' && page.toLowerCase().includes('professor'))) {
      html = `<h2>Detalhes da Conta</h2>
              <p>Como professor, pode verificar salas livres, efetuar e gerir reservas, e consultar relatórios das suas reservas e pedidos.</p>`;
    } else if (page === 'seguranca' || (typeof page === 'string' && page.toLowerCase().includes('seguran'))) {
      html = `<h2>Detalhes da Conta</h2>
              <p>Como membro da segurança, pode verificar o estado da porta das salas e receber alertas quando são abertas.</p>`;
    } else {
      html = `<h2>Detalhes da Conta</h2>
              <p>Informações sobre as capacidades de cada tipo de conta no sistema.</p>`;
    }

    toggleAccountDetails(html);
  });
}
