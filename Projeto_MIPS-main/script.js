// Sidebar toggle
const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));

// Elementos do menu
const conteudo = document.getElementById("conteudo");
const verMapa = document.getElementById("verMapa");
const salasLivres = document.getElementById("salasLivres");
const pedirSala = document.getElementById("pedirSala");
const procurar = document.getElementById("procurar");
const conta = document.getElementById("conta");

// Funções de alteração de conteúdo
verMapa.addEventListener("click", () => {
  conteudo.innerHTML = `
    <div class="planta-container">
      <button class="seta seta-esquerda" id="anterior">&#10094;</button>
      <div class="planta-wrapper">
        <img id="plantaImagem" src="planta2.png" alt="Planta Andar 2" class="planta-img">
        <div id="andarTexto" class="andar-texto">Andar 2</div>

        <!-- Tooltip -->
        <div id="tooltip" class="tooltip"></div>

        <!-- Salas Andar 2 -->
        <div class="sala" data-nome="F210" style="top: 42%; left: 30%;"></div>
        <div class="sala" data-nome="F211" style="top: 50%; left: 30%;"></div>
        <div class="sala" data-nome="F212" style="top: 63%; left: 30%;"></div>
        <div class="sala" data-nome="F212A" style="top: 35%; left: 65%;"></div>
        <div class="sala" data-nome="F212B" style="top: 55%; left: 65%;"></div>
      </div>
      <button class="seta seta-direita" id="proximo">&#10095;</button>
    </div>
  `;
  carregarMapa();
});

salasLivres.addEventListener("click", () => {
  conteudo.innerHTML = `
    <div class="secao">
      <h2>Salas Livres</h2>
      <p>Aqui será exibida a lista de salas atualmente disponíveis.</p>
    </div>
  `;
});

pedirSala.addEventListener("click", () => {
  conteudo.innerHTML = `
    <div class="secao">
      <h2>Reservar Sala</h2>
      <p>Escolha a sala e o horário pretendido para realizar uma reserva.</p>
      <form class="form-reserva">
        <label for="sala">Sala:</label>
        <input type="text" id="sala" placeholder="Ex: F210">
        <label for="data">Data:</label>
        <input type="date" id="data">
        <label for="hora">Hora:</label>
        <input type="time" id="hora">
        <button type="submit">Reservar</button>
      </form>
    </div>
  `;
});

// Função do mapa
function carregarMapa() {
  const imagens = ["planta2.png", "planta3.png"];
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

    // Andar 3
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
    plantaImagem.src = imagens[index];
    andarTexto.textContent = andares[index];

    // Limpar salas antigas
    document.querySelectorAll(".sala").forEach((el) => el.remove());

    // Adicionar salas conforme o andar
    if (index === 0) {
      // Andar 2
      addSalas([
        { nome: "F210", top: "31%", left: "42.5%" },
        { nome: "F211", top: "41%", left: "42.5%" },
        { nome: "F212", top: "61%", left: "47%" },
        { nome: "F212A", top: "33%", left: "53.5%" },
        { nome: "F212B", top: "50.5%", left: "54%" },
      ]);
    } else {
      // Andar 3
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
    salas.forEach((sala) => {
      const div = document.createElement("div");
      div.classList.add("sala");
      div.dataset.nome = sala.nome;
      div.style.top = sala.top;
      div.style.left = sala.left;
      wrapper.appendChild(div);

      div.addEventListener("mousemove", (e) => {
        const info = horarios[sala.nome]
          ? horarios[sala.nome].join("<br>")
          : "Sem dados";
        tooltip.innerHTML = `<strong>${sala.nome}</strong><br>${info}`;
        tooltip.style.left = e.pageX + 15 + "px";
        tooltip.style.top = e.pageY + 15 + "px";
        tooltip.style.display = "block";
      });

      div.addEventListener("mouseleave", () => {
        tooltip.style.display = "none";
      });
    });
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

