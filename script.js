const sidebar = document.querySelector(".sidebar");
const sidebarClose = document.querySelector("#sidebar-close");
const menu = document.querySelector(".menu-content");


sidebarClose.addEventListener("click", () => sidebar.classList.toggle("close"));

/*console.log(menuItems);*/

const imagens = ["planta2.png", "planta3.png"]; // imagens de cada andar
const andares = ["Andar 2", "Andar 3"];          // texto correspondente
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