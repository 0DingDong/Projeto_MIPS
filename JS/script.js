// Sidebar toggle
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));
}

// Elementos do menu
const conteudo = document.getElementById("conteudo");
const verMapa = document.getElementById("verMapa");
const salasLivres = document.getElementById("salasLivres");
const pedirSala = document.getElementById("pedirSala");
const procurar = document.getElementById("procurar");
const conta = document.getElementById("conta");
const detalhesConta = document.getElementById("detalhes-conta");
const accountDetails = document.getElementById("account-details");

// Garantir conteúdo por defeito consistente no painel de conta (evita textos antigos em cache)
if (accountDetails) {
  accountDetails.innerHTML = `<h2>Informações da Conta</h2><p>A carregar informações do utilizador...</p>`;
  accountDetails.style.display = 'none';
}

// Helpers para gerir #account-details e o conteúdo da <main>
function ensureAccountDetails() {
  const allAds = document.querySelectorAll('#account-details');
  if (allAds && allAds.length > 1) {
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

  if (originalMainHTML === null) originalMainHTML = mainEl.innerHTML;

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
    ad.style.display = 'block';
    hideSiblings(mainEl, 'account-details');
  } else {
    ad.style.display = 'none';
    if (originalMainHTML !== null) {
      mainEl.innerHTML = originalMainHTML;
      const ad2 = ensureAccountDetails();
      if (ad2) ad2.style.display = 'none';
      carregarMapa();
    } else {
      showSiblings(mainEl, 'account-details');
    }
  }
}

// Handler para 'Gestão de Reservas'
if (salasLivres && conteudo) {
  salasLivres.addEventListener("click", async () => {
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Gestão de Reservas</h2>
      <p>A carregar reservas...</p>
    `;
    hideAccountDetailsAndShowContent(contentEl);

    // Buscar reservas do servidor
    try {
      const response = await fetch('../BD/buscar_reservas.php');
      const data = await response.json();

      if (data.success && data.reservas.length > 0) {
        let tableHTML = `
          <div class="reserves-table">
            <table>
              <colgroup>
                <col style="width:12%">
                <col style="width:25%">
                <col style="width:20%">
                <col style="width:13%">
                <col style="width:30%">
              </colgroup>
              <thead>
                <tr><th>Sala</th><th>Professor</th><th>Data</th><th>Hora</th><th>Ações</th></tr>
              </thead>
              <tbody>
        `;

        data.reservas.forEach(reserva => {
          tableHTML += `
            <tr data-id="${reserva.reserva_id}">
              <td>${reserva.sala_num}</td>
              <td>${reserva.pessoa_nome}</td>
              <td>${reserva.data}</td>
              <td>${reserva.hora_inicio} - ${reserva.hora_fim}</td>
              <td><button class="cancel-reservation" data-reserva-id="${reserva.reserva_id}">Cancelar</button></td>
            </tr>
          `;
        });

        tableHTML += `</tbody></table></div>`;
        contentEl.innerHTML = `<h2>Gestão de Reservas</h2>` + tableHTML;
      } else {
        contentEl.innerHTML = `
          <h2>Gestão de Reservas</h2>
          <p>Ainda não tens reservas efetuadas.</p>
        `;
      }
    } catch (error) {
      contentEl.innerHTML = `
        <h2>Gestão de Reservas</h2>
        <p style="color: red;">Erro ao carregar reservas: ${error.message}</p>
      `;
    }
  });
}

// Handler para 'Reservar Sala'
if (pedirSala && conteudo) {
  pedirSala.addEventListener("click", async () => {
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Reservar Sala</h2>
      <p>Escolha o código da sala e o horário pretendido.</p>
      <form class="form-reserva" id="form-reserva">
        <label for="sala">Código da Sala:</label>
        <div class="sala-autocomplete-wrapper">
          <input type="text" id="sala" name="sala" placeholder="Ex: F231" required autocomplete="off">
          <ul id="sala-suggestions" class="sala-suggestions hidden"></ul>
        </div>
        
        <label for="data">Data:</label>
        <input type="date" id="data" name="data" required>
        
        <label for="hora-inicio">Hora de Início:</label>
        <input type="time" id="hora-inicio" name="hora_inicio" required>
        
        <label for="hora-fim">Hora de Fim:</label>
        <input type="time" id="hora-fim" name="hora_fim" required>
        
        <button type="submit">Reservar</button>
      </form>
      <div id="reserva-message" style="margin-top: 20px; text-align: center;"></div>
    `;
    hideAccountDetailsAndShowContent(contentEl);

    // Carregar lista de salas
    let salasList = [];
    try {
      const salaResponse = await fetch('../BD/listar_salas.php');
      const salaData = await salaResponse.json();
      if (salaData.success) {
        salasList = salaData.salas;
      }
    } catch (error) {
      console.error('Erro ao carregar salas:', error);
    }

    // Configurar autocomplete
    const salaInput = document.getElementById('sala');
    const salaSuggestions = document.getElementById('sala-suggestions');

    const showSalas = (filtered) => {
      salaSuggestions.innerHTML = '';
      if (filtered.length > 0) {
        filtered.forEach(sala => {
          const li = document.createElement('li');
          li.textContent = sala.num;
          li.addEventListener('click', () => {
            salaInput.value = sala.num;
            salaSuggestions.classList.add('hidden');
          });
          salaSuggestions.appendChild(li);
        });
        salaSuggestions.classList.remove('hidden');
      } else {
        salaSuggestions.classList.add('hidden');
      }
    };

    const filterSalas = (query) => {
      if (!query.trim()) {
        // Se não tem query, mostrar todas as salas
        showSalas(salasList);
        return;
      }
      const filtered = salasList.filter(s => s.num.toLowerCase().includes(query.toLowerCase()));
      showSalas(filtered);
    };

    // Mostrar lista ao focar no input
    salaInput.addEventListener('focus', () => {
      filterSalas(salaInput.value);
    });

    // Filtrar conforme escreve
    salaInput.addEventListener('input', (e) => {
      filterSalas(e.target.value);
    });

    // Fechar dropdown ao clicar fora
    document.addEventListener('click', (e) => {
      if (e.target !== salaInput && !salaSuggestions.contains(e.target)) {
        salaSuggestions.classList.add('hidden');
      }
    });

    // Adicionar event listener ao formulário
    const form = document.getElementById('form-reserva');
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formData = new FormData(form);
      const messageDiv = document.getElementById('reserva-message');
      messageDiv.innerHTML = '<p>A processar reserva...</p>';

      try {
        const response = await fetch('../BD/fazer_reserva.php', {
          method: 'POST',
          body: formData
        });

        const data = await response.json();

        if (data.success) {
          messageDiv.innerHTML = `<p style="color: green; font-weight: bold;">✅ ${data.message}</p>`;
          form.reset();
        } else {
          messageDiv.innerHTML = `<p style="color: red; font-weight: bold;">❌ ${data.message}</p>`;
        }
      } catch (error) {
        messageDiv.innerHTML = `<p style="color: red;">Erro: ${error.message}</p>`;
      }
    });
  });
}

// Handler para 'Alertas' (segurança)
const alertas = document.getElementById('alertas');
if (alertas && conteudo) {
  alertas.addEventListener('click', () => {
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Alertas</h2>
      <p>Aqui serão exibidos os alertas relevantes para a equipa de segurança.</p>
    `;
    hideAccountDetailsAndShowContent(contentEl);
  });
}

carregarMapa();

// Handler para 'Ver Mapa'
if (verMapa && conteudo) {
  verMapa.addEventListener("click", () => {
    const mapEl = document.createElement('div');
    mapEl.className = 'planta-container';
    mapEl.innerHTML = `
      <button class="seta seta-esquerda" id="anterior">&#10094;</button>
      <div class="planta-wrapper">
        <img id="plantaImagem" src="../Img/planta2.png" alt="Planta Andar 2" class="planta-img">
        <div id="andarTexto" class="andar-texto">Andar 2</div>
        <div id="tooltip" class="tooltip"></div>
      </div>
      <button class="seta seta-direita" id="proximo">&#10095;</button>
    `;

    hideAccountDetailsAndShowContent(mapEl);
    carregarMapa();
  });
}

// Função do mapa
function carregarMapa() {
  const imagens = ["../Img/planta2.png", "../Img/planta3.png"];
  const andares = ["Andar 2", "Andar 3"];
  let index = 0;

  const plantaImagem = document.getElementById("plantaImagem");
  const andarTexto = document.getElementById("andarTexto");
  const anterior = document.getElementById("anterior");
  const proximo = document.getElementById("proximo");
  const tooltip = document.getElementById("tooltip");

  const horarios = {
    F210: ["09h-10h - Disponível", "10h-11h - Ocupada", "11h-12h - Disponível"],
    F211: ["09h-10h - Ocupada", "10h-11h - Ocupada", "11h-12h - Disponível"],
    F212: ["09h-10h - Disponível", "10h-11h - Disponível", "11h-12h - Ocupada"],
    F212A: ["09h-10h - Ocupada", "10h-11h - Disponível", "11h-12h - Disponível"],
    F212B: ["09h-10h - Disponível", "10h-11h - Ocupada", "11h-12h - Ocupada"],

    F311: ["09h-10h - Ocupada", "10h-11h - Disponível", "11h-12h - Disponível"],
    F313: ["09h-10h - Disponível", "10h-11h - Ocupada", "11h-12h - Disponível"],
    F315: ["09h-10h - Disponível", "10h-11h - Ocupada", "11h-12h - Ocupada"],
    F317: ["09h-10h - Ocupada", "10h-11h - Ocupada", "11h-12h - Disponível"],
    F319: ["09h-10h - Disponível", "10h-11h - Disponível", "11h-12h - Ocupada"],
    F314A: ["09h-10h - Ocupada", "10h-11h - Disponível", "11h-12h - Ocupada"],
    F316: ["09h-10h - Ocupada", "10h-11h - Ocupada", "11h-12h - Disponível"],
    F318: ["09h-10h - Disponível", "10h-11h - Disponível", "11h-12h - Ocupada"],
    F320: ["09h-10h - Ocupada", "10h-11h - Ocupada", "11h-12h - Disponível"],
  };

  const atualizarPlanta = () => {
    if (!plantaImagem || !andarTexto) return;
    plantaImagem.src = imagens[index];
    andarTexto.textContent = andares[index];

    document.querySelectorAll(".sala").forEach((el) => el.remove());

    if (index === 0) {
      addSalas([
        { nome: "F210", top: "31%", left: "42.5%" },
        { nome: "F211", top: "41%", left: "42.5%" },
        { nome: "F212", top: "61%", left: "47%" },
        { nome: "F212A", top: "33%", left: "53.5%" },
        { nome: "F212B", top: "50.5%", left: "54%" },
      ]);
    } else {
      addSalas([
        { nome: "F311", top: "10%", left: "42.5%" },
        { nome: "F313", top: "20%", left: "42.5%" },
        { nome: "F315", top: "35%", left: "42.5%" },
        { nome: "F317", top: "50%", left: "42.5%" },
        { nome: "F319", top: "67%", left: "42.5%" },
        { nome: "F314A", top: "16.5%", left: "54%" },
        { nome: "F316", top: "35%", left: "54%" },
        { nome: "F318", top: "50%", left: "54%" },
        { nome: "F320", top: "67%", left: "54%" },
      ]);
    }
  };

  const addSalas = (salas) => {
    const wrapper = document.querySelector(".planta-wrapper");
    if (!wrapper) return;
    salas.forEach((sala) => {
      const div = document.createElement("div");
      div.classList.add("sala");
      div.dataset.nome = sala.nome;
      div.style.top = sala.top;
      div.style.left = sala.left;
      wrapper.appendChild(div);

      div.addEventListener("mousemove", (e) => {
        const info = horarios[sala.nome] ? horarios[sala.nome].join("<br>") : "Sem dados";
        if (tooltip) {
          tooltip.innerHTML = `<strong>${sala.nome}</strong><br>${info}`;
          tooltip.style.left = e.pageX + 15 + "px";
          tooltip.style.top = e.pageY + 15 + "px";
          tooltip.style.display = "block";
        }
      });

      div.addEventListener("mouseleave", () => {
        if (tooltip) tooltip.style.display = "none";
      });
    });
  };

  if (plantaImagem && anterior && proximo && andarTexto) {
    anterior.addEventListener("click", () => {
      index = (index - 1 + imagens.length) % imagens.length;
      atualizarPlanta();
    });

    proximo.addEventListener("click", () => {
      index = (index + 1) % imagens.length;
      atualizarPlanta();
    });

    atualizarPlanta();
  }
}

// Mostrar informações da conta
if (detalhesConta) {
  detalhesConta.addEventListener("click", async (e) => {
    e.preventDefault();
    const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : (document.title || '').toLowerCase();

    // Mostrar loading imediato
    toggleAccountDetails(`<h2>Informações da Conta</h2><p>A carregar informações do utilizador...</p>`);
    // Buscar informações do utilizador ao servidor
    try {
  const resp = await fetch('../BD/get_user_info.php', { credentials: 'same-origin' });
      const userData = await resp.json();
      console.log('get_user_info response:', userData);

      let infoHtml = `<h2>Informações da Conta</h2>`;
      if (userData.success) {
        const typeMap = { professor: 'Professor', aluno: 'Aluno', seguranca: 'Segurança' };
        const typeLabel = typeMap[userData.user_type] || userData.user_type || '';
        infoHtml += `<p><strong>${typeLabel} - ${userData.nome || ''}</strong></p>`;
        infoHtml += `<p><strong>Email -</strong> ${userData.email || ''}</p><hr />`;
      } else {
        infoHtml += `<p><em>Utilizador não autenticado.</em></p>`;
        infoHtml += `<p><a href="../html/login.html">Iniciar sessão</a> para ver as suas informações.</p>`;
  infoHtml += `<details open style="margin-top:8px;"><summary>Debug</summary><pre style="white-space:pre-wrap;">${userData.message || JSON.stringify(userData, null, 2)}</pre></details><hr />`;
      }

      // Conteúdo específico por tipo de página
      if (page === 'aluno' || (typeof page === 'string' && page.toLowerCase().includes('aluno'))) {
        infoHtml += `<p>Como aluno, pode pesquisar salas e visualizar o mapa interativo para localizar salas no IPS.</p>`;
      } else if (page === 'professor' || (typeof page === 'string' && page.toLowerCase().includes('professor'))) {
        infoHtml += `<p>Como professor, pode verificar salas livres, efetuar e gerir reservas, e consultar relatórios das suas reservas e pedidos.</p>`;
      } else if (page === 'seguranca' || (typeof page === 'string' && page.toLowerCase().includes('seguran'))) {
        infoHtml += `<p>Como membro da segurança, pode verificar o estado da porta das salas e receber alertas quando são abertas.</p>`;
      } else {
        infoHtml += `<p>Informações sobre as capacidades de cada tipo de conta no sistema.</p>`;
      }

      // Forçar atualização do painel de conta (ignorar possíveis estados guardados)
      const mainEl2 = document.querySelector('.main');
      const ad2 = ensureAccountDetails();
      if (ad2 && mainEl2) {
        // Save originalMainHTML if not yet saved
        if (originalMainHTML === null) originalMainHTML = mainEl2.innerHTML;
        ad2.innerHTML = infoHtml;
        ad2.style.display = 'block';
        hideSiblings(mainEl2, 'account-details');
      } else {
        // fallback
        toggleAccountDetails(infoHtml);
      }
    } catch (err) {
      const errHtml = `<h2>Informações da Conta</h2><p style="color:red;">Erro ao obter informações: ${err.message}</p>`;
      toggleAccountDetails(errHtml);
    }
  });
}

// Delegate handler para cancelar reservas
document.addEventListener('click', async function (e) {
  const btn = e.target.closest && e.target.closest('.cancel-reservation');
  if (!btn) return;

  if (!confirm('Tens a certeza que queres cancelar esta reserva?')) return;

  const row = btn.closest('tr');
  const resId = btn.dataset.reservaId;

  btn.disabled = true;
  const oldText = btn.textContent;
  btn.textContent = 'Cancelando...';

  try {
    const formData = new FormData();
    formData.append('reserva_id', resId);

    const response = await fetch('../BD/cancelar_reserva.php', {
      method: 'POST',
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      if (row) row.remove();
      alert('✅ Reserva cancelada com sucesso!');
    } else {
      alert('❌ ' + data.message);
      btn.disabled = false;
      btn.textContent = oldText;
    }
  } catch (error) {
    alert('❌ Erro: ' + error.message);
    btn.disabled = false;
    btn.textContent = oldText;
  }
});