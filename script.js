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
