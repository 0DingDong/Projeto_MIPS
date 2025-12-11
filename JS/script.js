// Burger menu toggle
const burgerToggle = document.getElementById('burger-toggle');
const navMenu = document.getElementById('nav-menu');

if (burgerToggle && navMenu) {
  burgerToggle.addEventListener('click', () => {
    burgerToggle.classList.toggle('active');
    navMenu.classList.toggle('mobile-active');
  });

  // Fechar menu ao clicar num link
  const navLinks = navMenu.querySelectorAll('a');
  navLinks.forEach(link => {
    link.addEventListener('click', () => {
      burgerToggle.classList.remove('active');
      navMenu.classList.remove('mobile-active');
    });
  });

  // Fechar menu ao clicar fora
  document.addEventListener('click', (e) => {
    if (!burgerToggle.contains(e.target) && !navMenu.contains(e.target)) {
      burgerToggle.classList.remove('active');
      navMenu.classList.remove('mobile-active');
    }
  });
}

// Sidebar toggle
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
if (sidebarClose && sidebar) {
  sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));
}

// ===========================
// SISTEMA DE NOTIFICAÇÕES (TOAST)
// ===========================
function initToastContainer() {
  if (!document.getElementById('toast-container')) {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
}

function showToast(message, type = 'info', duration = 5000) {
  initToastContainer();
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  container.appendChild(toast);
  
  // Auto-remove após duration
  setTimeout(() => {
    toast.classList.add('removing');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// Som de alerta
function playAlertSound() {
  // Criar tom de alerta simples usando Web Audio API
  const audioContext = new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gainNode = audioContext.createGain();
  
  oscillator.connect(gainNode);
  gainNode.connect(audioContext.destination);
  
  oscillator.frequency.value = 800; // Frequência em Hz
  oscillator.type = 'sine';
  
  gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
  gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
  
  oscillator.start(audioContext.currentTime);
  oscillator.stop(audioContext.currentTime + 0.5);
}

// Função auxiliar para formatar data e hora
function formatDateTime(dateTimeStr) {
  if (!dateTimeStr) return '';
  
  // Tentar fazer parse da data
  const date = new Date(dateTimeStr);
  
  // Verificar se a data é válida
  if (isNaN(date.getTime())) return dateTimeStr;
  
  // Formatar data como dd/mm/yyyy
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  
  // Formatar hora como hh:mm
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  return `${day}/${month}/${year} às ${hours}:${minutes}`;
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

// seleção de sala para destacar no mapa
window._selectedSala = null;
window._selectedAndar = null;

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
                <col style="width:15%">
                <col style="width:25%">
                <col style="width:17%">
                <col style="width:17%">
                <col style="width:26%">
              </colgroup>
              <thead>
                <tr><th>Sala</th><th>Professor</th><th>Data</th><th>Hora</th><th>Ações</th></tr>
              </thead>
              <tbody>
        `;

        data.reservas.forEach(reserva => {
          tableHTML += `
            <tr data-id="${reserva.reserva_id}">
              <td class="col-sala">${reserva.sala_num}</td>
              <td class="col-prof">${reserva.pessoa_nome}</td>
              <td class="col-data">${reserva.data}</td>
              <td class="col-hora" style="white-space: nowrap;">${reserva.hora_inicio} - ${reserva.hora_fim}</td>
              <td class="col-actions"><button class="cancel-reservation" data-reserva-id="${reserva.reserva_id}">Cancelar</button></td>
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

// Handler para 'Procurar' (pesquisar reservas por sala para professor, alertas por sala para segurança)
if (procurar && conteudo) {
  procurar.addEventListener('click', async (e) => {
    e.preventDefault();
    const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : '';

    if (page === 'seguranca') {
      // ===== HANDLER PARA SEGURANÇA: PESQUISAR ALERTAS POR SALA =====
      const contentEl = document.createElement('div');
      contentEl.className = 'secao';
      contentEl.innerHTML = `
        <h2>Pesquisar Alertas por Sala</h2>
        <p>Selecione uma sala para ver todos os seus alertas históricos.</p>
        <div class="pesquisa-container">
          <label for="sala-pesquisa-seg">Selecione a Sala:</label>
          <div class="sala-autocomplete-wrapper">
            <input type="text" id="sala-pesquisa-seg" placeholder="Ex: F315" autocomplete="off">
            <ul id="sala-pesquisa-seg-suggestions" class="sala-suggestions hidden"></ul>
          </div>
        </div>
        <div id="pesquisa-resultado-seg" style="margin-top: 30px;"></div>
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
      const salaPesquisaInput = document.getElementById('sala-pesquisa-seg');
      const salaPesquisaSuggestions = document.getElementById('sala-pesquisa-seg-suggestions');
      const pesquisaResultado = document.getElementById('pesquisa-resultado-seg');

      const showSalas = (filtered) => {
        salaPesquisaSuggestions.innerHTML = '';
        if (filtered.length > 0) {
          filtered.forEach(sala => {
            const li = document.createElement('li');
            li.textContent = sala.num;
            li.addEventListener('click', async () => {
              salaPesquisaInput.value = sala.num;
              salaPesquisaSuggestions.classList.add('hidden');
              
              // Buscar alertas dessa sala
              pesquisaResultado.innerHTML = '<p>A carregar alertas...</p>';
              try {
                const alertResponse = await fetch('../BD/buscar_alertas_por_sala.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `sala=${encodeURIComponent(sala.num)}`
                });
                const alertData = await alertResponse.json();
                
                if (alertData.success && alertData.alertas.length > 0) {
                  let html = `<h3>Alertas da Sala ${sala.num}</h3><table style="width: 100%; border-collapse: collapse; margin-top: 15px;">`;
                  html += `<tr style="background: #f0f0f0;"><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Mensagem</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Aberto</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Fechado</th></tr>`;
                  alertData.alertas.forEach(alert => {
                    const openedFormatted = formatDateTime(alert.opened_at);
                    const closedFormatted = formatDateTime(alert.closed_at);
                    html += `<tr style="border: 1px solid #ddd;"><td style="padding: 10px;">${alert.mensagem}</td><td style="padding: 10px;">${openedFormatted}</td><td style="padding: 10px;">${closedFormatted}</td></tr>`;
                  });
                  html += `</table>`;
                  pesquisaResultado.innerHTML = html;
                } else {
                  pesquisaResultado.innerHTML = `<p style="color: #666;">Nenhum alerta encontrado para a sala ${sala.num}.</p>`;
                }
              } catch (error) {
                pesquisaResultado.innerHTML = `<p style="color: red;">Erro ao carregar alertas: ${error.message}</p>`;
              }
            });
            salaPesquisaSuggestions.appendChild(li);
          });
          salaPesquisaSuggestions.classList.remove('hidden');
        } else {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      };

      const filterSalas = (query) => {
        if (!query.trim()) {
          showSalas(salasList);
          return;
        }
        const filtered = salasList.filter(s => s.num.toLowerCase().includes(query.toLowerCase()));
        showSalas(filtered);
      };

      // Mostrar todas as salas imediatamente ao focar
      salaPesquisaInput.addEventListener('focus', () => {
        showSalas(salasList);
      });

      // Mostrar todas as salas ao clicar
      salaPesquisaInput.addEventListener('click', () => {
        showSalas(salasList);
      });

      salaPesquisaInput.addEventListener('input', (e) => {
        filterSalas(e.target.value);
      });

      document.addEventListener('click', (e) => {
        if (e.target !== salaPesquisaInput && !salaPesquisaSuggestions.contains(e.target)) {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      });
    } else if (page === 'aluno') {
      // ===== HANDLER PARA ALUNO: PESQUISAR E IR PARA O MAPA DESTACANDO A SALA =====
      const contentEl = document.createElement('div');
      contentEl.className = 'secao';
      contentEl.innerHTML = `
        <h2>Pesquisar Sala e abrir mapa</h2>
        <p>Escolhe a sala para abrir o mapa automaticamente no andar correto e com o marcador em destaque.</p>
        <div class="pesquisa-container">
          <label for="sala-pesquisa-aluno">Selecione a Sala:</label>
          <div class="sala-autocomplete-wrapper">
            <input type="text" id="sala-pesquisa-aluno" placeholder="Ex: F210" autocomplete="off">
            <ul id="sala-pesquisa-aluno-suggestions" class="sala-suggestions hidden"></ul>
          </div>
        </div>
      `;
      hideAccountDetailsAndShowContent(contentEl);

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

      const salaPesquisaInput = document.getElementById('sala-pesquisa-aluno');
      const salaPesquisaSuggestions = document.getElementById('sala-pesquisa-aluno-suggestions');

      const showSalas = (filtered) => {
        salaPesquisaSuggestions.innerHTML = '';
        if (filtered.length > 0) {
          filtered.forEach(sala => {
            const li = document.createElement('li');
            li.textContent = sala.num;
            li.addEventListener('click', () => {
              salaPesquisaInput.value = sala.num;
              salaPesquisaSuggestions.classList.add('hidden');

              // definir seleção para o mapa e renderizar
              window._selectedSala = sala.num;
              window._selectedAndar = sala.num.startsWith('F3') ? 1 : 0;
              renderMapaView();
            });
            salaPesquisaSuggestions.appendChild(li);
          });
          salaPesquisaSuggestions.classList.remove('hidden');
        } else {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      };

      const filterSalas = (query) => {
        if (!query.trim()) {
          showSalas(salasList);
          return;
        }
        const filtered = salasList.filter(s => s.num.toLowerCase().includes(query.toLowerCase()));
        showSalas(filtered);
      };

      salaPesquisaInput.addEventListener('focus', () => showSalas(salasList));
      salaPesquisaInput.addEventListener('click', () => showSalas(salasList));
      salaPesquisaInput.addEventListener('input', (e) => filterSalas(e.target.value));
      document.addEventListener('click', (ev) => {
        if (ev.target !== salaPesquisaInput && !salaPesquisaSuggestions.contains(ev.target)) {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      });

    } else {
      // ===== HANDLER PARA PROFESSOR: PESQUISAR RESERVAS POR SALA =====
      const contentEl = document.createElement('div');
      contentEl.className = 'secao';
      contentEl.innerHTML = `
        <h2>Pesquisar Reservas por Sala</h2>
        <p>Selecione uma sala para ver todas as suas reservas.</p>
        <div class="pesquisa-container">
          <label for="sala-pesquisa">Selecione a Sala:</label>
          <div class="sala-autocomplete-wrapper">
            <input type="text" id="sala-pesquisa" placeholder="Ex: F231" autocomplete="off">
            <ul id="sala-pesquisa-suggestions" class="sala-suggestions hidden"></ul>
          </div>
        </div>
        <div id="pesquisa-resultado" style="margin-top: 30px;"></div>
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
      const salaPesquisaInput = document.getElementById('sala-pesquisa');
      const salaPesquisaSuggestions = document.getElementById('sala-pesquisa-suggestions');
      const pesquisaResultado = document.getElementById('pesquisa-resultado');

      const showSalas = (filtered) => {
        salaPesquisaSuggestions.innerHTML = '';
        if (filtered.length > 0) {
          filtered.forEach(sala => {
            const li = document.createElement('li');
            li.textContent = sala.num;
            li.addEventListener('click', async () => {
              salaPesquisaInput.value = sala.num;
              salaPesquisaSuggestions.classList.add('hidden');
              
              // Buscar reservas dessa sala
              pesquisaResultado.innerHTML = '<p>A carregar reservas...</p>';
              try {
                const resResponse = await fetch('../BD/buscar_reservas_por_sala.php', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                  body: `sala_id=${sala.id}`
                });
                const resData = await resResponse.json();
                
                if (resData.success && resData.reservas.length > 0) {
                  let html = `<h3>Reservas da Sala ${sala.num}</h3><table style="width: 100%; border-collapse: collapse; margin-top: 15px;">`;
                  html += `<tr style="background: #f0f0f0;"><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Professor</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Data</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Hora Início</th><th style="padding: 10px; border: 1px solid #ddd; text-align: left;">Hora Fim</th></tr>`;
                  resData.reservas.forEach(res => {
                    html += `<tr style="border: 1px solid #ddd;"><td style="padding: 10px;">${res.pessoa_nome}</td><td style="padding: 10px;">${res.data}</td><td style="padding: 10px;">${res.hora_inicio}</td><td style="padding: 10px;">${res.hora_fim}</td></tr>`;
                  });
                  html += `</table>`;
                  pesquisaResultado.innerHTML = html;
                } else {
                  pesquisaResultado.innerHTML = `<p style="color: #666;">Nenhuma reserva encontrada para a sala ${sala.num}.</p>`;
                }
              } catch (error) {
                pesquisaResultado.innerHTML = `<p style="color: red;">Erro ao carregar reservas: ${error.message}</p>`;
              }
            });
            salaPesquisaSuggestions.appendChild(li);
          });
          salaPesquisaSuggestions.classList.remove('hidden');
        } else {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      };

      const filterSalas = (query) => {
        if (!query.trim()) {
          showSalas(salasList);
          return;
        }
        const filtered = salasList.filter(s => s.num.toLowerCase().includes(query.toLowerCase()));
        showSalas(filtered);
      };

      // Mostrar todas as salas imediatamente ao focar
      salaPesquisaInput.addEventListener('focus', () => {
        showSalas(salasList);
      });

      // Mostrar todas as salas ao clicar
      salaPesquisaInput.addEventListener('click', () => {
        showSalas(salasList);
      });

      salaPesquisaInput.addEventListener('input', (e) => {
        filterSalas(e.target.value);
      });

      document.addEventListener('click', (e) => {
        if (e.target !== salaPesquisaInput && !salaPesquisaSuggestions.contains(e.target)) {
          salaPesquisaSuggestions.classList.add('hidden');
        }
      });
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

      // Mostrar lista ao clicar no input
      salaInput.addEventListener('click', () => {
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
    // limpar qualquer polling anterior
    if (window._alertsInterval) { clearInterval(window._alertsInterval); window._alertsInterval = null; }

    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Alertas Ativos</h2>
      <div id="alerts-items">A carregar alertas...</div>
    `;

    hideAccountDetailsAndShowContent(contentEl);

    let previousAlertsCount = 0;

    // Render helper
    function renderAlerts(list) {
      const container = document.getElementById('alerts-items');
      if (!container) return;
      if (!list || list.length === 0) {
        container.innerHTML = '<p>Nenhum alerta ativo.</p>';
        return;
      }
      let html = '<ul style="list-style:none;padding:0;margin:0;">';
      list.forEach(a => {
        const formattedDate = formatDateTime(a.opened_at);
        html += `<li style="background:#fff;padding:12px;border-radius:8px;margin-bottom:10px;box-shadow:0 2px 6px rgba(0,0,0,0.03);border-left:4px solid #ef4444;">
                    <div style="font-weight:600;color:#1f2937;">${a.sala || ''}</div>
                    <div style="color:#374151;margin-top:4px;font-size:0.95rem;">${a.mensagem || ''}</div>
                    <div style="color:#6b7280;font-size:0.85rem;margin-top:6px;">Aberto em: ${formattedDate}</div>
                  </li>`;
      });
      html += '</ul>';
      container.innerHTML = html;
    }

    // Fetch function
    async function loadAlerts() {
      try {
        const alertsResp = await fetch('../BD/listar_alertas.php');
        const alertsData = await alertsResp.json();

        if (alertsData && alertsData.success) {
          const currentList = alertsData.alertas || [];
          renderAlerts(currentList);

          // Verificar novos alertas e notificar
          if (currentList.length > previousAlertsCount) {
            const newAlerts = currentList.slice(0, currentList.length - previousAlertsCount);
            newAlerts.forEach(alert => {
              showToast(`🚨 Novo alerta - ${alert.mensagem}`, 'error', 7000);
              playAlertSound();
            });
          }
          previousAlertsCount = currentList.length;
        } else {
          renderAlerts([]);
        }
      } catch (err) {
        const a = document.getElementById('alerts-items'); if (a) a.innerHTML = '<p style="color:red;">Erro ao carregar alertas.</p>';
      }
    }

    // primeira carga
    loadAlerts();
    // polling a cada 5s
    window._alertsInterval = setInterval(loadAlerts, 5000);
  });
}

// Handler para 'Histórico de Alertas' (segurança)
const historicoAlertas = document.getElementById('historico-alertas');
if (historicoAlertas && conteudo) {
  historicoAlertas.addEventListener('click', () => {
    // limpar qualquer polling anterior
    if (window._historyInterval) { clearInterval(window._historyInterval); window._historyInterval = null; }

    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = `
      <h2>Histórico de Alertas</h2>
      <div id="history-items">A carregar histórico...</div>
    `;

    hideAccountDetailsAndShowContent(contentEl);

    // Render helper
    function renderHistory(list) {
      const container = document.getElementById('history-items');
      if (!container) return;
      if (!list || list.length === 0) {
        container.innerHTML = '<p>Nenhum histórico disponível.</p>';
        return;
      }
      let html = `<table style="width:100%;border-collapse:collapse;">
                    <thead>
                      <tr style="text-align:left;background:#f3f4f6;border-bottom:2px solid #e5e7eb;">
                        <th style="padding:10px 12px;font-weight:600;color:#374151;">Sala</th>
                        <th style="padding:10px 12px;font-weight:600;color:#374151;">Aberto</th>
                        <th style="padding:10px 12px;font-weight:600;color:#374151;">Fechado</th>
                      </tr>
                    </thead>
                    <tbody>`;
      list.forEach((h, idx) => {
        const bgColor = idx % 2 === 0 ? '#fff' : '#f9fafb';
        const openedFormatted = formatDateTime(h.opened_at);
        const closedFormatted = formatDateTime(h.closed_at);
        html += `<tr style="background:${bgColor};border-bottom:1px solid #e5e7eb;">
                   <td style="padding:10px 12px;color:#1f2937;font-weight:500;">${h.sala || ''}</td>
                   <td style="padding:10px 12px;color:#374151;">${openedFormatted}</td>
                   <td style="padding:10px 12px;color:#374151;">${closedFormatted}</td>
                 </tr>`;
      });
      html += '</tbody></table>';
      container.innerHTML = html;
    }

    // Fetch function
    async function loadHistory() {
      try {
        const histResp = await fetch('../BD/listar_historico_alertas.php');
        const histData = await histResp.json();

        if (histData && histData.success) renderHistory(histData.historico || []);
        else renderHistory([]);
      } catch (err) {
        const h = document.getElementById('history-items'); if (h) h.innerHTML = '<p style="color:red;">Erro ao carregar histórico.</p>';
      }
    }

    // primeira carga
    loadHistory();
    // polling a cada 5s (para atualizar automaticamente se houver novos registos)
    window._historyInterval = setInterval(loadHistory, 5000);
  });
}


carregarMapa();

// Handler para 'Ver Mapa'
function renderMapaView() {
  const mapEl = document.createElement('div');
  mapEl.className = 'secao planta-container';
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
}

if (verMapa && conteudo) {
  verMapa.addEventListener("click", () => {
    // reset seleção manual do utilizador
    window._selectedSala = null;
    window._selectedAndar = null;
    renderMapaView();
  });
}

// Função do mapa
function carregarMapa() {
  const imagens = ["../Img/planta2.png", "../Img/planta3.png"];
  const andares = ["Andar 2", "Andar 3"];
  let index = (typeof window._selectedAndar === 'number') ? window._selectedAndar : 0;

  const plantaImagem = document.getElementById("plantaImagem");
  const andarTexto = document.getElementById("andarTexto");
  const anterior = document.getElementById("anterior");
  const proximo = document.getElementById("proximo");
  const tooltip = document.getElementById("tooltip");

  // Determinar tipo de página para saber qual endpoint usar
  const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : '';
  const isProfessor = page === 'professor';
  const isSeguranca = page === 'seguranca';

  const atualizarPlanta = () => {
    if (!plantaImagem || !andarTexto) return;
    plantaImagem.src = imagens[index];
    andarTexto.textContent = andares[index];

    document.querySelectorAll(".sala").forEach((el) => el.remove());

    if (index === 0) {
      addSalas([
        { nome: "F210", top: "30%", left: "16.5%" },
        { nome: "F211", top: "40.5%", left: "16.5%" },
        { nome: "F212", top: "60%", left: "41.44%" },
        { nome: "F212A", top: "31%", left: "76.5%" },
        { nome: "F212B", top: "50.5%", left: "78.5%" },
      ]);
    } else {
      addSalas([
        { nome: "F311", top: "8%", left: "18.45%" },
        { nome: "F313", top: "21%", left: "19.20%" },
        { nome: "F315", top: "34%", left: "19.20%" },
        { nome: "F317", top: "49%", left: "17.71%" },
        { nome: "F319", top: "65%", left: "17.71%" },
        { nome: "F314A", top: "16%", left: "74.82%" },
        { nome: "F316", top: "34.5%", left: "74.82%" },
        { nome: "F318", top: "51%", left: "74.82%" },
        { nome: "F320", top: "67%", left: "75.56%" },
      ]);
    }

    // Re-aplicar destaque após trocar andar, se existe seleção ativa
    if (window._selectedSala) {
      const allSalas = document.querySelectorAll('.sala');
      allSalas.forEach(s => {
        if (s.dataset.nome === window._selectedSala) {
          s.classList.add('sala-highlight');
        }
      });
    }
  };

  const addSalas = (salas) => {
    const wrapper = document.querySelector(".planta-wrapper");
    if (!wrapper) return;
    salas.forEach((sala) => {
      const div = document.createElement("div");
      div.classList.add("sala");
      div.dataset.nome = sala.nome;
      div.textContent = sala.nome;
      div.style.top = sala.top;
      div.style.left = sala.left;
      if (window._selectedSala && window._selectedSala === sala.nome) {
        div.classList.add('sala-highlight');
      }
      wrapper.appendChild(div);

      div.addEventListener("mouseenter", async (e) => {
        if (tooltip) {
          tooltip.innerHTML = `<strong>${sala.nome}</strong><br><em>A carregar...</em>`;
          tooltip.style.display = "block";
        }

        // Buscar dados de acordo com o tipo de utilizador
        try {
          if (isProfessor) {
            // Para professor: mostrar reservas de hoje
            const response = await fetch(`../BD/get_sala_reservas_horas.php?sala=${encodeURIComponent(sala.nome)}`);
            const data = await response.json();
            
            if (data.success && data.reservas && data.reservas.length > 0) {
              let info = '';
              data.reservas.forEach(res => {
                info += `${res.hora_inicio} - ${res.hora_fim}<br>`;
              });
              if (tooltip) {
                tooltip.innerHTML = `<strong>${sala.nome}</strong><br>Reservas de hoje:<br>${info}`;
              }
            } else {
              if (tooltip) {
                tooltip.innerHTML = `<strong>${sala.nome}</strong><br>Sem reservas hoje`;
              }
            }
          } else if (isSeguranca) {
            // Para segurança: mostrar último alerta
            const response = await fetch(`../BD/get_sala_ultimo_alerta.php?sala=${encodeURIComponent(sala.nome)}`);
            const data = await response.json();
            
            if (data.success && data.ultimo_alerta) {
              const { data: dataAlerta, hora_aberto, hora_fechado } = data.ultimo_alerta;
              if (tooltip) {
                tooltip.innerHTML = `<strong>${sala.nome}</strong><br>Último alerta:<br>${dataAlerta}<br>${hora_aberto} - ${hora_fechado}`;
              }
            } else {
              if (tooltip) {
                tooltip.innerHTML = `<strong>${sala.nome}</strong><br>Sem alertas`;
              }
            }
          } else {
            // Para aluno: sem informação adicional
            if (tooltip) {
              tooltip.innerHTML = `<strong>${sala.nome}</strong>`;
            }
          }
        } catch (error) {
          if (tooltip) {
            tooltip.innerHTML = `<strong>${sala.nome}</strong><br>Erro ao carregar dados`;
          }
        }
      });

      div.addEventListener("mousemove", (e) => {
        if (tooltip) {
          tooltip.style.left = e.pageX + 15 + "px";
          tooltip.style.top = e.pageY + 15 + "px";
        }
      });

      div.addEventListener("mouseleave", () => {
        if (tooltip) tooltip.style.display = "none";
      });
    });
  };

  // Helper opcional para medir coordenadas ao clicar na planta
  if (plantaImagem && !plantaImagem.dataset.coordListener) {
    plantaImagem.addEventListener('click', (e) => {
      if (!window._debugCoords) return;
      const rect = plantaImagem.getBoundingClientRect();
      const xPct = ((e.clientX - rect.left) / rect.width) * 100;
      const yPct = ((e.clientY - rect.top) / rect.height) * 100;
      console.log(`Coord percentuais -> left: ${xPct.toFixed(2)}%, top: ${yPct.toFixed(2)}%`);
    });
    plantaImagem.dataset.coordListener = 'true';
  }

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
// Helpers de sessão para checar utilizador esperado na página
function getPageAndExpectedType() {
  const page = (document.body && document.body.dataset && document.body.dataset.page)
    ? document.body.dataset.page
    : (document.title || '').toLowerCase();
  const expectedType = (page === 'aluno') ? 'aluno'
    : (page === 'professor') ? 'professor'
    : (page && page.startsWith('segur')) ? 'seguranca'
    : null;
  return { page, expectedType };
}

function buildAccountInfoHtml(userData, page) {
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

  if (page === 'aluno' || (typeof page === 'string' && page.toLowerCase().includes('aluno'))) {
    infoHtml += `<p>Como aluno, pode pesquisar salas e visualizar o mapa interativo para localizar salas no IPS.</p>`;
  } else if (page === 'professor' || (typeof page === 'string' && page.toLowerCase().includes('professor'))) {
    infoHtml += `<p>Como professor, pode verificar salas livres, efetuar e gerir reservas, e consultar relatórios das suas reservas e pedidos.</p>`;
  } else if (page === 'seguranca' || (typeof page === 'string' && page.toLowerCase().includes('seguran'))) {
    infoHtml += `<p>Como membro da segurança, pode verificar o estado da porta das salas e receber alertas quando são abertas.</p>`;
  } else {
    infoHtml += `<p>Informações sobre as capacidades de cada tipo de conta no sistema.</p>`;
  }

  return infoHtml;
}

if (detalhesConta) {
  detalhesConta.addEventListener("click", async (e) => {
    e.preventDefault();
    const { page, expectedType } = getPageAndExpectedType();

    // Mostrar loading imediato
    toggleAccountDetails(`<h2>Informações da Conta</h2><p>A carregar informações do utilizador...</p>`);
    // Buscar informações do utilizador ao servidor
    try {
      const resp = await fetch('../BD/get_user_info.php', { credentials: 'same-origin' });
      const userData = await resp.json();
      console.log('get_user_info response:', userData);

      // Se o tipo da sessão não corresponder ao tipo esperado desta página, redirecionar
      if (userData.success && expectedType && userData.user_type !== expectedType) {
        const redirectMap = {
          aluno: '../html/aluno.html',
          professor: '../html/professor.html',
          seguranca: '../html/seguranca.html'
        };
        const target = redirectMap[userData.user_type] || '../html/login.html';
        window.location.href = target;
        return;
      }

      const infoHtml = buildAccountInfoHtml(userData, page);

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

// ===========================
// POLLING AUTOMÁTICO DE ALERTAS (SEGURANÇA)
// ===========================
// Iniciar polling de alertas automaticamente para usuários de segurança
(function initSecurityAlertsPolling() {
  const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : '';
  
  if (page !== 'seguranca') return;
  
  let previousAlertsCount = 0;
  
  async function checkNewAlerts() {
    try {
      const alertsResp = await fetch('../BD/listar_alertas.php');
      const alertsData = await alertsResp.json();
      
      if (alertsData && alertsData.success) {
        const currentList = alertsData.alertas || [];
        
        // Verificar novos alertas e notificar
        if (previousAlertsCount > 0 && currentList.length > previousAlertsCount) {
          const newAlerts = currentList.slice(0, currentList.length - previousAlertsCount);
          newAlerts.forEach(alert => {
            showToast(`🚨 Novo alerta - ${alert.mensagem}`, 'error', 7000);
            playAlertSound();
          });
        }
        previousAlertsCount = currentList.length;
      }
    } catch (err) {
      console.error('Erro ao verificar alertas:', err);
    }
  }
  
  // Carregar contagem inicial
  checkNewAlerts();
  
  // Polling a cada 3 segundos
  window._backgroundAlertsInterval = setInterval(checkNewAlerts, 3000);
})();

// ===========================
// MANUAL DE INSTRUÇÕES
// ===========================
const manualInstrucoes = document.getElementById('manual-instrucoes');
if (manualInstrucoes && conteudo) {
  manualInstrucoes.addEventListener('click', (e) => {
    e.preventDefault();
    
    const page = (document.body && document.body.dataset && document.body.dataset.page) ? document.body.dataset.page : '';
    
    let manualContent = '';
    
    if (page === 'aluno') {
      manualContent = `
        <h2>📚 Manual do Aluno - MIPS</h2>
        
        <div style="text-align:left; max-width:800px; margin:0 auto;">
          
          <div style="text-align:right; margin-bottom:15px;">
            <button onclick="document.getElementById('manual-pt').style.display='block'; document.getElementById('manual-en').style.display='none'; this.style.fontWeight='bold'; this.nextElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">🇵🇹 Português</button>
            <button onclick="document.getElementById('manual-pt').style.display='none'; document.getElementById('manual-en').style.display='block'; this.style.fontWeight='bold'; this.previousElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer;">🇬🇧 English</button>
          </div>
          
          <div id="manual-pt">
            <h3>🗺️ Ver Mapa</h3>
            <p><strong>Como usar:</strong></p>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Ver Mapa"</strong> no menu</li>
              <li>Use as <strong>setas (◀ ▶)</strong> para mudar de andar</li>
              <li>Passe o rato sobre as salas para ver informações</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Procurar Sala</h3>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Procurar"</strong></li>
              <li>Digite o nome da sala (ex: F210)</li>
              <li>Selecione da lista</li>
              <li>A sala ficará destacada no mapa</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Informações da Conta</h3>
            <p>Clique em <strong>"Informações da Conta"</strong> para ver os seus dados.</p>
          </div>
          
          <div id="manual-en" style="display:none;">
            <h3>🗺️ View Map</h3>
            <p><strong>How to use:</strong></p>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Ver Mapa"</strong> (View Map) in the menu</li>
              <li>Use the <strong>arrows (◀ ▶)</strong> to change floors</li>
              <li>Hover over rooms to see information</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Search Room</h3>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Procurar"</strong> (Search)</li>
              <li>Type the room name (e.g., F210)</li>
              <li>Select from the list</li>
              <li>The room will be highlighted on the map</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Account Information</h3>
            <p>Click <strong>"Informações da Conta"</strong> (Account Information) to view your data.</p>
          </div>
        </div>
      `;
    } else if (page === 'professor') {
      manualContent = `
        <h2>📚 Manual do Professor - MIPS</h2>
        
        <div style="text-align:left; max-width:800px; margin:0 auto;">
          
          <div style="text-align:right; margin-bottom:15px;">
            <button onclick="document.getElementById('manual-pt').style.display='block'; document.getElementById('manual-en').style.display='none'; this.style.fontWeight='bold'; this.nextElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">🇵🇹 Português</button>
            <button onclick="document.getElementById('manual-pt').style.display='none'; document.getElementById('manual-en').style.display='block'; this.style.fontWeight='bold'; this.previousElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer;">🇬🇧 English</button>
          </div>
          
          <div id="manual-pt">
            <h3>📅 Reservar Sala</h3>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Reservar Sala"</strong></li>
              <li>Preencha:
                <ul>
                  <li><strong>Sala:</strong> Ex: F210, F315</li>
                  <li><strong>Data:</strong> Escolha a data</li>
                  <li><strong>Hora de início:</strong> Ex: 14:00</li>
                  <li><strong>Hora de fim:</strong> Ex: 15:00</li>
                </ul>
              </li>
              <li>Clique em <strong>"Reservar"</strong></li>
            </ol>
            <p><strong>⚠️ Nota:</strong> Não pode reservar horários já ocupados.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>📋 Gestão de Reservas</h3>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Gestão de Reservas"</strong></li>
              <li>Veja todas as suas reservas</li>
              <li>Para cancelar: clique em <strong>"Cancelar"</strong></li>
            </ol>
            <p><strong>💡 Dica:</strong> Para alterar uma reserva, cancele e crie nova.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🗺️ Ver Mapa</h3>
            <p>Clique em <strong>"Ver Mapa"</strong> para visualizar as salas.</p>
            <p><strong>📌 Ao passar o rato sobre uma sala:</strong></p>
            <ul style="line-height:1.8;">
              <li>Verá as reservas <strong>do próprio dia</strong> (hoje)</li>
              <li>Horários já reservados para essa sala</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Procurar Sala</h3>
            <p><strong>Consulte todas as reservas de uma sala específica:</strong></p>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Procurar"</strong></li>
              <li>Digite o nome da sala (ex: F210)</li>
              <li>Selecione da lista</li>
            </ol>
            <p><strong>📊 O que verá:</strong></p>
            <ul style="line-height:1.8;">
              <li>Todas as reservas daquela sala</li>
              <li>Reservas feitas por <strong>todos os professores</strong></li>
              <li>Datas e horários de cada reserva</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Informações da Conta</h3>
            <p>Clique em <strong>"Informações da Conta"</strong> para ver os seus dados.</p>
          </div>
          
          <div id="manual-en" style="display:none;">
            <h3>📅 Reserve Room</h3>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Reservar Sala"</strong> (Reserve Room)</li>
              <li>Fill in:
                <ul>
                  <li><strong>Room:</strong> E.g., F210, F315</li>
                  <li><strong>Date:</strong> Choose date</li>
                  <li><strong>Start time:</strong> E.g., 14:00</li>
                  <li><strong>End time:</strong> E.g., 15:00</li>
                </ul>
              </li>
              <li>Click <strong>"Reservar"</strong> (Reserve)</li>
            </ol>
            <p><strong>⚠️ Note:</strong> Cannot reserve already occupied times.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>📋 Reservation Management</h3>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Gestão de Reservas"</strong> (Reservation Management)</li>
              <li>View all your reservations</li>
              <li>To cancel: click <strong>"Cancelar"</strong> (Cancel)</li>
            </ol>
            <p><strong>💡 Tip:</strong> To change a reservation, cancel and create new one.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🗺️ View Map</h3>
            <p>Click <strong>"Ver Mapa"</strong> (View Map) to visualize rooms.</p>
            <p><strong>📌 When hovering over a room:</strong></p>
            <ul style="line-height:1.8;">
              <li>View reservations for <strong>today only</strong></li>
              <li>Hours already reserved for that room</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Search Room</h3>
            <p><strong>Check all reservations for a specific room:</strong></p>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Procurar"</strong> (Search)</li>
              <li>Type the room name (e.g., F210)</li>
              <li>Select from the list</li>
            </ol>
            <p><strong>📊 What you'll see:</strong></p>
            <ul style="line-height:1.8;">
              <li>All reservations for that room</li>
              <li>Reservations made by <strong>all professors</strong></li>
              <li>Dates and times of each reservation</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Account Information</h3>
            <p>Click <strong>"Informações da Conta"</strong> (Account Information) to view your data.</p>
          </div>
        </div>
      `;
    } else if (page === 'seguranca') {
      manualContent = `
        <h2>📚 Manual de Segurança - MIPS</h2>
        
        <div style="text-align:left; max-width:800px; margin:0 auto;">
          
          <div style="text-align:right; margin-bottom:15px;">
            <button onclick="document.getElementById('manual-pt').style.display='block'; document.getElementById('manual-en').style.display='none'; this.style.fontWeight='bold'; this.nextElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#3b82f6; color:white; border:none; border-radius:6px; cursor:pointer; font-weight:bold;">🇵🇹 Português</button>
            <button onclick="document.getElementById('manual-pt').style.display='none'; document.getElementById('manual-en').style.display='block'; this.style.fontWeight='bold'; this.previousElementSibling.style.fontWeight='normal';" style="padding:8px 16px; margin:0 5px; background:#6b7280; color:white; border:none; border-radius:6px; cursor:pointer;">🇬🇧 English</button>
          </div>
          
          <div id="manual-pt">
            <h3>🚨 Alertas Ativos</h3>
            <p><strong>Monitorize portas abertas em tempo real.</strong></p>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Alertas"</strong></li>
              <li>Verá uma lista de portas abertas</li>
              <li>A lista atualiza automaticamente</li>
            </ol>
            <p><strong>🔔 Notificações:</strong></p>
            <ul style="line-height:1.8;">
              <li>Recebe som e notificação quando há novo alerta</li>
              <li>Funciona mesmo sem a página de alertas aberta</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>📜 Histórico de Alertas</h3>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Histórico de Alertas"</strong></li>
              <li>Veja todas as portas que já foram fechadas</li>
              <li>Consulte data/hora de abertura e fecho</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🗺️ Ver Mapa</h3>
            <p>Clique em <strong>"Ver Mapa"</strong> para visualizar as salas.</p>
            <p><strong>📌 Ao passar o rato sobre uma sala:</strong></p>
            <ul style="line-height:1.8;">
              <li>Verá o último alerta registado</li>
              <li>Data e horário do alerta (abertura - fecho)</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Pesquisar por Sala</h3>
            <p><strong>Consulte o histórico de alertas de uma sala específica:</strong></p>
            <ol style="line-height:1.8;">
              <li>Clique em <strong>"Procurar"</strong></li>
              <li>Digite o nome da sala (ex: F210)</li>
              <li>Selecione da lista</li>
            </ol>
            <p><strong>📊 O que verá:</strong></p>
            <ul style="line-height:1.8;">
              <li>Lista completa de alertas anteriores dessa sala</li>
              <li>Data e horário de cada abertura/fecho de porta</li>
              <li>Histórico organizado do mais recente ao mais antigo</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Informações da Conta</h3>
            <p>Clique em <strong>"Informações da Conta"</strong> para ver os seus dados.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🚨 Ao Receber Alerta</h3>
            <ol style="line-height:1.8;">
              <li>✅ Verifique a sala no mapa</li>
              <li>✅ Note a hora e localização</li>
              <li>✅ Se necessário, dirija-se ao local</li>
            </ol>
          </div>
          
          <div id="manual-en" style="display:none;">
            <h3>🚨 Active Alerts</h3>
            <p><strong>Monitor open doors in real-time.</strong></p>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Alertas"</strong> (Alerts)</li>
              <li>View list of open doors</li>
              <li>List updates automatically</li>
            </ol>
            <p><strong>🔔 Notifications:</strong></p>
            <ul style="line-height:1.8;">
              <li>Receive sound and notification on new alerts</li>
              <li>Works even without alerts page open</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>📜 Alert History</h3>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Histórico de Alertas"</strong> (Alert History)</li>
              <li>View all doors that have been closed</li>
              <li>Check opening and closing date/time</li>
            </ol>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🗺️ View Map</h3>
            <p>Click <strong>"Ver Mapa"</strong> (View Map) to visualize rooms.</p>
            <p><strong>📌 When hovering over a room:</strong></p>
            <ul style="line-height:1.8;">
              <li>View the last registered alert</li>
              <li>Date and time of alert (opening - closing)</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🔍 Search by Room</h3>
            <p><strong>Check alert history of a specific room:</strong></p>
            <ol style="line-height:1.8;">
              <li>Click <strong>"Procurar"</strong> (Search)</li>
              <li>Type the room name (e.g., F210)</li>
              <li>Select from the list</li>
            </ol>
            <p><strong>📊 What you'll see:</strong></p>
            <ul style="line-height:1.8;">
              <li>Complete list of previous alerts for that room</li>
              <li>Date and time of each door opening/closing</li>
              <li>History organized from most recent to oldest</li>
            </ul>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>👤 Account Information</h3>
            <p>Click <strong>"Informações da Conta"</strong> (Account Information) to view your data.</p>
            
            <hr style="margin:20px 0; border:none; border-top:1px solid #e5e7eb;">
            
            <h3>🚨 When Receiving Alert</h3>
            <ol style="line-height:1.8;">
              <li>✅ Check room on map</li>
              <li>✅ Note time and location</li>
              <li>✅ If necessary, go to location</li>
            </ol>
          </div>
        </div>
      `;
    }
    
    const contentEl = document.createElement('div');
    contentEl.className = 'secao';
    contentEl.innerHTML = manualContent;
    
    hideAccountDetailsAndShowContent(contentEl);
  });
}