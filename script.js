// Sidebar toggle
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));
}

carregarMapa();

// Elementos do menu
const conteudo = document.getElementById("conteudo");
const verMapa = document.getElementById("verMapa");
const salasLivres = document.getElementById("salasLivres");
const pedirSala = document.getElementById("pedirSala");
const procurar = document.getElementById("procurar");
const conta = document.getElementById("conta");
const detalhesConta = document.getElementById("detalhes-conta");
const accountDetails = document.getElementById("account-details");

if (verMapa && conteudo) {
  verMapa.addEventListener("click", () => {
    conteudo.innerHTML = `
      <div class="planta-container">
        <button class="seta seta-esquerda" id="anterior">&#10094;</button>
        <div class="planta-wrapper">
          <img id="plantaImagem" src="planta2.png" alt="Planta Andar 2" class="planta-img">
          <div id="andarTexto" class="andar-texto">Andar 2</div>
        </div>
        <button class="seta seta-direita" id="proximo">&#10095;</button>
      </div>
    `;
    carregarMapa();
  });
}

if (salasLivres && conteudo) {
  salasLivres.addEventListener("click", () => {
    conteudo.innerHTML = `
      <div class="secao">
        <h2>Salas Livres</h2>
        <p>Aqui será exibida a lista de salas atualmente disponíveis.</p>
      </div>
    `;
  });
}

if (pedirSala && conteudo) {
  pedirSala.addEventListener("click", () => {
    conteudo.innerHTML = `
      <div class="secao">
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
      </div>
    `;
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
  // guardar conteúdo original para fallback
  const originalConteudo = conteudo ? conteudo.innerHTML : null;
  const mainEl = document.querySelector('.main');

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

    if (accountDetails && mainEl) {
      const isHidden = (accountDetails.style.display === 'none' || getComputedStyle(accountDetails).display === 'none');
      accountDetails.innerHTML = html;
      if (isHidden) {
        // mostrar detalhes e esconder irmãos (conteúdo original)
        accountDetails.style.display = 'block';
        Array.from(mainEl.children).forEach((child) => {
          if (child.id !== 'account-details') child.style.display = 'none';
        });
        accountDetails.scrollIntoView({ behavior: 'smooth' });
      } else {
        // ocultar detalhes e restaurar irmãos
        accountDetails.style.display = 'none';
        Array.from(mainEl.children).forEach((child) => {
          if (child.id !== 'account-details') child.style.display = '';
        });
      }
    } else if (conteudo) {
      // fallback: substituir o conteúdo (toggle)
      const showing = conteudo.dataset.showingDetails === 'true';
      if (!showing) {
        conteudo.dataset.showingDetails = 'true';
        conteudo.innerHTML = `<div class="secao">${html}</div>`;
      } else {
        conteudo.dataset.showingDetails = 'false';
        if (originalConteudo !== null) conteudo.innerHTML = originalConteudo;
      }
    }
  });
}
