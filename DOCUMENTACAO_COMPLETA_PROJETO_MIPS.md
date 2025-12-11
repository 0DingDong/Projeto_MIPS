# DOCUMENTAÇÃO COMPLETA DO PROJETO MIPS
**Sistema de Mapeamento Interativo de Salas do IPS**

---

## 1. ESTRUTURA COMPLETA DE PASTAS E FICHEIROS

```
Projeto_MIPS/
│
├── BD/                                    # Backend PHP e dados JSON
│   ├── buscar_alertas_por_sala.php
│   ├── buscar_reservas.php
│   ├── buscar_reservas_por_sala.php
│   ├── cancelar_reserva.php
│   ├── check_auth.php
│   ├── db_connect.php
│   ├── debug_session.php
│   ├── fazer_reserva.php
│   ├── get_sala_reservas_horas.php
│   ├── get_sala_ultimo_alerta.php
│   ├── get_user_info.php
│   ├── historico_alertas.json
│   ├── historico_alertas_pending.json
│   ├── listar_alertas.php
│   ├── listar_historico_alertas.php
│   ├── listar_salas.php
│   ├── login.php
│   └── receber_alerta.php
│
├── CSS/                                   # Estilos
│   ├── style.css
│   └── style2.css
│
├── html/                                  # Páginas HTML
│   ├── aluno.html
│   ├── login.html
│   ├── main.html
│   ├── professor.html
│   └── seguranca.html
│
├── Img/                                   # Recursos visuais
│   ├── logo_ips.jpg
│   ├── logo_mips.jpg
│   ├── logo_mips.png
│   ├── planta2.png
│   └── planta3.png
│
└── JS/                                    # Scripts JavaScript
    └── script.js
```

---

## 2. PÁGINAS HTML E SEUS OBJETIVOS

### **login.html**
- Página inicial do sistema
- Formulário de autenticação com email e password
- Valida credenciais via AJAX (fetch para login.php)
- Inclui modal personalizado para mensagens de erro (sem "localhost diz")
- Redireciona para página apropriada conforme tipo de utilizador (aluno/professor/segurança)

### **aluno.html**
- Interface para estudantes
- Menu: Ver Mapa, Procurar Salas, Informações da Conta, Manual de Instruções, Sair
- Script de validação de sessão (redireciona se não for aluno autenticado)
- Permite pesquisar salas e visualizar mapa interativo com marcadores
- Destaque automático de sala pesquisada no mapa
- Manual integrado com toggle PT/EN explicando funcionalidades

### **professor.html**
- Interface para professores
- Menu: Reservar Sala, Gestão de Reservas, Ver Mapa, Procurar, Informações da Conta, Manual de Instruções, Sair
- Sistema completo de reservas de salas (criar, visualizar, cancelar)
- Reserva requer hora de início E hora de fim
- Ver Mapa mostra reservas do próprio dia (hoje)
- Procurar mostra todas as reservas de todos os professores
- Validação de horários disponíveis
- Tabela interativa de reservas pessoais
- Manual integrado com toggle PT/EN explicando funcionalidades

### **seguranca.html**
- Interface para equipa de segurança
- Menu: Alertas, Histórico de Alertas, Ver Mapa, Procurar, Informações da Conta, Manual de Instruções, Sair
- Listagem de alertas ativos (portas abertas)
- **Polling automático:** Inicia ao carregar página (não requer clicar "Alertas" primeiro)
- Notificações toast com som quando nova porta é aberta
- Polling a cada 3 segundos para novos alertas
- Histórico completo de alertas fechados
- Ver Mapa mostra último alerta com data e horários (abertura-fecho)
- Procurar mostra histórico completo de alertas da sala específica
- Manual integrado com toggle PT/EN explicando funcionalidades

### **main.html**
- Página de demonstração/protótipo inicial
- Contém mapa interativo completo com plantas dos andares
- Navegação entre andares (Piso 2 e Piso 3)
- Marcadores de salas posicionados sobre as plantas
- Sistema de zoom e visualização de detalhes das salas
- **Nota:** Esta página parece ser um protótipo anterior; as funcionalidades foram integradas nas páginas de utilizador

---

## 3. FICHEIROS PHP E JSON - FUNÇÕES PRINCIPAIS

### **Autenticação e Sessão:**

#### **db_connect.php**
- Ficheiro central de conexão à base de dados MySQL
- Define credenciais: localhost, root, senha vazia, base de dados `mips_local`
- Cria objeto `$conn` (mysqli) usado por todos os outros ficheiros PHP
- Define charset UTF-8 para suportar caracteres portugueses

#### **login.php**
- Processa autenticação de utilizadores
- Recebe email e password via POST
- Verifica credenciais em 3 tabelas: `aluno`, `professor`, `seguranca`
- Cria sessão PHP com `$_SESSION['user_type']` e `$_SESSION['user_id']`
- Retorna JSON com `success: true/false` e `user_type` quando bem-sucedido
- Em caso de erro, retorna mensagem "Email ou senha incorretos"

#### **check_auth.php**
- Função auxiliar `checkAuth($requiredType)` para proteger páginas
- Verifica se utilizador tem sessão ativa
- Redireciona para login se não autenticado
- Valida se o tipo de utilizador corresponde ao esperado (ex: só professores acedem certas páginas)
- **Nota:** Criado mas não ativamente usado; validação é feita via JavaScript nas páginas HTML

#### **get_user_info.php**
- API para obter dados do utilizador logado
- Lê `user_type` e `user_id` da sessão PHP
- Consulta tabela correspondente (aluno/professor/seguranca) e tabela `pessoa` para nome
- Retorna JSON com: `success`, `user_type`, `nome`, `email`
- Inclui debug detalhado das queries SQL executadas

#### **debug_session.php**
- Endpoint de desenvolvimento para inspecionar sessão
- Retorna JSON com: session_id, variáveis de sessão, cookies, headers HTTP
- Útil para debug de problemas de autenticação

---

### **Gestão de Salas:**

#### **listar_salas.php**
- Lista todas as salas da base de dados
- Query: `SELECT sala_id, sala_num FROM sala ORDER BY sala_num ASC`
- Retorna JSON com array de salas: `[{id, num}, ...]`
- Usado para popular dropdowns de seleção de salas

---

### **Sistema de Reservas (Professores):**

#### **fazer_reserva.php**
- Cria nova reserva de sala
- Validações:
  - Utilizador é professor autenticado
  - Todos os campos obrigatórios preenchidos
  - Hora fim > hora início
  - Sala existe na BD
  - Não há conflito de horário (sala já reservada nesse período)
- INSERT na tabela `reserva` com: sala_id, professor_id, data_inicio, data_fim
- Retorna JSON com sucesso ou mensagem de erro

#### **buscar_reservas.php**
- Lista reservas do professor logado
- JOIN entre tabelas: `reserva`, `sala`, `professor`, `pessoa`
- Ordena por data decrescente (mais recentes primeiro)
- Retorna JSON com: reserva_id, sala_num, pessoa_nome, data, hora_inicio, hora_fim

#### **buscar_reservas_por_sala.php**
- Lista reservas de uma sala específica (qualquer professor)
- Recebe `sala_id` via POST/GET
- Mesma estrutura de JOIN que `buscar_reservas.php`
- Usado para mostrar ocupação de uma sala ao longo do tempo

#### **cancelar_reserva.php**
- Remove reserva da base de dados
- Validações:
  - Utilizador é professor autenticado
  - Reserva existe e pertence ao professor logado
- DELETE na tabela `reserva WHERE reserva_id = ?`
- Retorna JSON com confirmação

#### **get_sala_reservas_horas.php**
- Retorna horários reservados de uma sala HOJE
- Recebe `sala` (número da sala) via GET/POST
- Query com `DATE(s.reserva_Data) = CURDATE()`
- Retorna array: `[{hora_inicio, hora_fim}, ...]`
- Usado para mostrar disponibilidade em tempo real no mapa

---

### **Sistema de Alertas (Segurança + IoT):**

#### **receber_alerta.php**
- **Endpoint principal para ESP32/sensor IoT**
- Recebe estado da porta via GET: `?estado=aberta` ou `?estado=fechada`
- Define sensor_id = 1, sala = 'F315' (hardcoded para este sensor)
- Usa ficheiros JSON para gerir alertas (não usa tabela SQL para alertas)
- Lógica:
  - **Estado "aberta":** Cria novo alerta em `historico_alertas_pending.json` com timestamp `opened_at`
  - **Estado "fechada":** Move alerta de pending para `historico_alertas.json`, adiciona `closed_at`
- Timezone: Europe/Lisbon
- Retorna JSON com sucesso/erro e mensagem

#### **listar_alertas.php**
- Lista alertas ATIVOS (portas atualmente abertas)
- Lê ficheiro `historico_alertas_pending.json`
- Normaliza campos: id, sensor_id, sala, mensagem, opened_at
- Retorna JSON: `{success: true, alertas: [...]}`
- Usado pela página de segurança para polling a cada 3 segundos

#### **listar_historico_alertas.php**
- Lista histórico completo de alertas FECHADOS
- Lê ficheiro `historico_alertas.json`
- Inverte array para mostrar mais recentes primeiro
- Retorna JSON com: id, sensor_id, sala, mensagem, opened_at, closed_at
- Usado pela página "Histórico de Alertas" da segurança

#### **buscar_alertas_por_sala.php**
- Filtra histórico de alertas por sala específica
- Recebe `sala` via POST/GET (ex: "F315")
- Filtra array de `historico_alertas.json` por nome da sala
- Retorna alertas ordenados por data decrescente

#### **get_sala_ultimo_alerta.php**
- Retorna último alerta (mais recente) de uma sala
- Usado para mostrar informação no popup do mapa
- Calcula duração do alerta (diferença entre opened_at e closed_at)
- Retorna JSON com dados do último alerta ou null se não houver

---

### **Ficheiros JSON (Armazenamento Local):**

#### **historico_alertas_pending.json**
- Array de alertas ATIVOS (portas abertas no momento)
- Estrutura de cada objeto:
  ```json
  {
    "id": "timestamp_unico",
    "sensor_id": 1,
    "sala": "F315",
    "mensagem": "A porta F315 está aberta!",
    "opened_at": "2025-12-10 15:30:45"
  }
  ```
- Modificado por `receber_alerta.php` quando porta abre/fecha

#### **historico_alertas.json**
- Array de alertas FECHADOS (histórico completo)
- Estrutura:
  ```json
  {
    "id": "timestamp_unico",
    "sensor_id": 1,
    "sala": "F315",
    "mensagem": "A porta F315 está aberta!",
    "opened_at": "2025-12-10 15:30:45",
    "closed_at": "2025-12-10 15:32:10"
  }
  ```
- Cresce continuamente com novos alertas fechados
- Usado para estatísticas e relatórios

---

## 4. FICHEIROS JAVASCRIPT

### **script.js** (ficheiro único, ~1100+ linhas)

#### **Funções de UI/Navegação:**
- **Burger Menu:** Toggle de menu mobile responsivo
- **Gestão de Seções:** Funções para mostrar/ocultar diferentes seções da página (mapa, reservas, alertas, etc.)
- **Helpers:** `hideAccountDetailsAndShowContent()`, `toggleAccountDetails()`, `ensureAccountDetails()`

#### **Sistema de Mapa Interativo:**
- **carregarMapa():** Renderiza mapa com plantas dos andares
- **Navegação entre andares:** Botões "Anterior/Próximo" para mudar de piso
- **Marcadores de salas:** Posicionamento absoluto via CSS calculado para cada sala
- **Click em marcadores:** Abre popup com informações da sala (número, reservas de hoje, último alerta)
- **Busca de sala (alunos):** Função que pesquisa sala, muda andar automaticamente e destaca sala no mapa
- **Persistência de highlight:** Sala pesquisada mantém destaque verde pulsante

#### **Sistema de Reservas (Professores):**
- **Formulário de reserva:** Valida campos, envia para `fazer_reserva.php`
- **Listagem de reservas:** Carrega via `buscar_reservas.php`, renderiza tabela
- **Cancelar reserva:** Botão em cada linha da tabela, confirma com utilizador, chama `cancelar_reserva.php`
- **Atualização dinâmica:** Após criar/cancelar, recarrega lista automaticamente

#### **Sistema de Alertas (Segurança):**
- **Auto-polling de alertas:** Função `initSecurityAlertsPolling()` (linhas ~1160-1185) inicia automaticamente ao carregar página de segurança
- **Polling contínuo:** `setInterval` a cada 3000ms chama `listar_alertas.php`
- **Notificações automáticas:** Utilizador recebe alertas mesmo sem clicar no botão "Alertas"
- **Contagem de alertas novos:** Compara tamanho do array atual vs anterior
- **Toast notifications:** Função `showToast(mensagem, tipo, duração)` com animação slideIn/slideOut
- **Som de alerta:** Função `playAlertSound()` gera beep usando Web Audio API
- **Listagem de alertas ativos:** Renderiza cards com sala, mensagem, hora de abertura
- **Histórico de alertas:** Carrega `listar_historico_alertas.php`, mostra tabela completa
- **Informação no mapa:** Tooltip de segurança mostra último alerta com data e horários (abertura-fecho)

#### **Manuais de Instruções (Novo):**
- **Conteúdo inline:** Manuais armazenados como strings HTML no script.js (linhas ~1187-1469)
- **Toggle PT/EN:** Botões de idioma mostram/escondem versões portuguesa e inglesa
- **Conteúdo por perfil:**
  - **Aluno:** Ver Mapa, Procurar Sala, Informações da Conta
  - **Professor:** Reservar Sala (hora início/fim), Gestão de Reservas, Ver Mapa (reservas de hoje), Procurar (todas as reservas de todos), Informações da Conta
  - **Segurança:** Alertas Ativos (com notificações automáticas), Histórico de Alertas, Ver Mapa (último alerta com horários), Pesquisar por Sala (histórico de alertas), Informações da Conta, Ao Receber Alerta
- **Linguagem simplificada:** Sem jargão técnico, focado em instruções para utilizador final
- **Acessibilidade:** Botão no menu de todas as páginas autenticadas

#### **Informações da Conta:**
- **getPageAndExpectedType():** Determina tipo de página (aluno/professor/segurança)
- **buildAccountInfoHtml():** Constrói HTML com dados do utilizador
- **Click em "Informações da Conta":** Fetch para `get_user_info.php`, valida tipo de utilizador, mostra painel
- **Validação de sessão:** Se tipo não corresponder, redireciona para página correta

#### **Procura de Salas:**
- **Input de pesquisa:** Campo de texto para número da sala
- **Busca case-insensitive:** Normaliza input e compara com salas disponíveis
- **Destaque no mapa:** Aplica classe `.sala-highlight` ao marcador encontrado
- **Mudança automática de andar:** Se sala estiver noutro piso, muda imagem e índice

---

## 5. FICHEIROS CSS

### **style.css**
- Estilos para **página de login** (login.html)
- Layout dos logos IPS e MIPS
- Formulário de login com inputs estilizados
- Botão "Entrar" com gradiente azul e hover effects
- Estilos do **modal personalizado de erro** (sem "localhost diz")
- Responsividade para mobile e tablets

### **style2.css**
- Estilos para **todas as outras páginas** (aluno, professor, segurança)
- **Navbar:** Header fixo com logo e menu burger
- **Menu de navegação:** Links com ícones FontAwesome, responsivo
- **Layout principal:** `.main` com `align-items: center` para centralização vertical de conteúdo
- **Classe universal `.secao`:** Todas as caixas de conteúdo usam esta classe para centralização consistente
- **Mapa interativo:** Container com plantas dos andares
- **Marcadores de salas:** Círculos posicionados absolutamente sobre o mapa
  - Classes: `.sala`, `.sala-highlight`, `.sala-selected`
  - Animação `pulse-green` para sala pesquisada
- **Popups de sala:** Informação flutuante ao clicar em marcador
- **Tabelas:** Estilos para listagem de reservas e alertas
- **Toast notifications:** Container fixo no topo, animações slideIn/slideOut
- **Formulários:** Inputs, selects, botões para reservas
- **Footer:** Rodapé com informações de contacto
- **Responsividade:** Media queries para diferentes tamanhos de ecrã
- **Fix mobile:** Sobreposição de navbar com conteúdo resolvida via centralização

---

## 6. PRINCIPAIS FUNCIONALIDADES IMPLEMENTADAS

### **Autenticação Multi-perfil:**
- Login unificado com validação para 3 tipos de utilizador: aluno, professor, segurança
- Cada perfil acede página diferente com funcionalidades específicas
- Sessão PHP persistente entre páginas

### **Mapa Interativo de Salas:**
- Visualização de plantas dos edifícios (Piso 2 e Piso 3)
- Marcadores clicáveis em cada sala
- Informação em tempo real:
  - **Professores:** Reservas do próprio dia (hoje)
  - **Segurança:** Último alerta com data e horários (abertura-fecho)
- Sistema de procura com destaque visual
- Layout centralizado responsivo

### **Sistema de Reservas (Professores):**
- Criar reserva escolhendo sala, data, **hora início E hora fim**
- Ver Mapa mostra apenas reservas do dia atual
- Procurar Sala mostra todas as reservas de todos os professores
- Validação de conflitos de horário
- Listar reservas pessoais em tabela
- Cancelar reservas com confirmação

### **Sistema de Alertas IoT (Segurança):**
- Integração com sensor ESP32 (porta aberta/fechada)
- **Polling automático:** Inicia ao carregar página (sem necessidade de clicar "Alertas")
- Alertas em tempo real a cada 3 segundos
- Notificação visual (toast) + sonora quando nova porta abre
- Histórico completo de alertas com timestamps
- Procurar por sala mostra histórico completo de alertas daquela sala
- Mapa mostra último alerta de cada sala com horários

### **Manuais de Instruções Integrados (NOVO):**
- Botão "Manual de Instruções" em todas as páginas autenticadas
- Toggle entre Português 🇵🇹 e English 🇬🇧
- Conteúdo simplificado adaptado a cada perfil:
  - **Aluno:** Ver Mapa, Procurar Sala, Informações da Conta
  - **Professor:** Reservar Sala (detalhes de hora início/fim), Gestão de Reservas, Ver Mapa (reservas de hoje), Procurar (todas as reservas), Info da Conta
  - **Segurança:** Alertas Ativos, Histórico, Ver Mapa (último alerta), Pesquisar (histórico de alertas), Procedimentos ao receber alerta
- Sem jargão técnico, linguagem acessível

### **Interface Responsiva:**
- Design adaptativo para desktop, tablet e mobile
- Menu burger para navegação em ecrãs pequenos
- Todas as caixas de conteúdo centralizadas com classe `.secao`
- Fix de sobreposição navbar em mobile

### **Gestão de Conta:**
- Visualizar informações pessoais (nome, email, tipo)
- Descrição das funcionalidades disponíveis por perfil

---

## 7. SISTEMA DE LOGIN E GESTÃO DE SESSÕES

### **Fluxo de Autenticação:**

1. **Utilizador acede login.html:**
   - Preenche email e password
   - Clica "Entrar"

2. **JavaScript intercepta submit:**
   - Evento preventDefault() no formulário
   - Envia credenciais via fetch POST para `login.php`

3. **login.php processa:**
   - Recebe `email_aluno` e `pass_aluno` (nomes históricos, servem para todos os tipos)
   - Tenta autenticar sequencialmente em 3 tabelas:
     - `aluno WHERE aluno_email = ? AND aluno_pass = ?`
     - `professor WHERE professor_email = ? AND professor_pass = ?`
     - `seguranca WHERE seguranca_email = ? AND seguranca_pass = ?`
   - **Sucesso:** Cria sessão PHP:
     ```php
     $_SESSION['user_type'] = 'aluno'; // ou 'professor', 'seguranca'
     $_SESSION['user_id'] = 123; // ID do utilizador na tabela respetiva
     ```
   - Retorna JSON: `{success: true, user_type: 'aluno'}`
   - **Falha:** Retorna `{success: false, message: 'Email ou senha incorretos.'}`

4. **JavaScript trata resposta:**
   - Se sucesso: redireciona para página apropriada (aluno.html/professor.html/seguranca.html)
   - Se erro: mostra modal personalizado com mensagem

### **Validação de Sessão nas Páginas:**

Cada página HTML (aluno, professor, segurança) tem script inline que:
1. Faz fetch para `get_user_info.php` ao carregar
2. Verifica se `data.success === true` e `data.user_type` corresponde ao esperado
3. Se não corresponder: `window.location.href = '../html/login.html'`

### **Persistência:**
- Sessões PHP persistem até:
  - Utilizador clicar "Sair" (limpa sessão)
  - Fechar navegador (depende de configuração do servidor)
  - Timeout de inatividade (configurável no php.ini)

### **Segurança:**
- Passwords armazenadas em texto plano (⚠️ **INSEGURO** - deveria usar password_hash)
- Queries com prepared statements (protege contra SQL injection)
- Validação de tipo de utilizador em cada endpoint PHP sensível

---

## 8. COMUNICAÇÃO COM A BASE DE DADOS

### **Configuração (db_connect.php):**
```php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mips_local";
$conn = new mysqli($servername, $username, $password, $dbname);
```
- Conexão MySQL via mysqli
- Charset UTF-8 para caracteres especiais

### **Estrutura da Base de Dados (Inferida):**

#### **Tabela: aluno**
- `aluno_id` (INT, PRIMARY KEY)
- `aluno_email` (VARCHAR)
- `aluno_pass` (VARCHAR)
- `aluno_Pessoa_id` (INT, FOREIGN KEY -> pessoa.pessoa_id)

#### **Tabela: professor**
- `professor_id` (INT, PRIMARY KEY)
- `professor_email` (VARCHAR)
- `professor_pass` (VARCHAR)
- `professor_nome` (VARCHAR) - opcional
- `professor_Pessoa_id` (INT, FOREIGN KEY -> pessoa.pessoa_id)

#### **Tabela: seguranca**
- `seguranca_id` (INT, PRIMARY KEY)
- `seguranca_email` (VARCHAR)
- `seguranca_pass` (VARCHAR)
- `seguranca_Pessoa_id` (INT, FOREIGN KEY -> pessoa.pessoa_id)

#### **Tabela: pessoa**
- `pessoa_id` (INT, PRIMARY KEY)
- `pessoa_nome` (VARCHAR) - nome completo do utilizador

#### **Tabela: sala**
- `sala_id` (INT, PRIMARY KEY)
- `sala_num` (VARCHAR) - código da sala (ex: "F315", "F201")

#### **Tabela: reserva**
- `reserva_id` (INT, PRIMARY KEY)
- `reserva_Sala_id` (INT, FOREIGN KEY -> sala.sala_id)
- `reserva_Professor_id` (INT, FOREIGN KEY -> professor.professor_id)
- `reserva_Data` (DATETIME) - data e hora de início
- `reserva_Data_Fim` (DATETIME) - data e hora de fim

### **Principais Queries:**

#### **Login (exemplo para professor):**
```sql
SELECT * FROM professor WHERE professor_email = ?
```

#### **Obter nome do utilizador:**
```sql
SELECT pessoa_nome FROM pessoa WHERE pessoa_id = ?
```

#### **Listar salas:**
```sql
SELECT sala_id, sala_num FROM sala ORDER BY sala_num ASC
```

#### **Criar reserva:**
```sql
INSERT INTO reserva (reserva_Sala_id, reserva_Professor_id, reserva_Data, reserva_Data_Fim)
VALUES (?, ?, ?, ?)
```

#### **Verificar conflito de horário:**
```sql
SELECT * FROM reserva
WHERE reserva_Sala_id = ?
AND (
  (reserva_Data <= ? AND reserva_Data_Fim > ?) OR
  (reserva_Data < ? AND reserva_Data_Fim >= ?) OR
  (reserva_Data >= ? AND reserva_Data_Fim <= ?)
)
```

#### **Listar reservas do professor:**
```sql
SELECT r.reserva_id, s.sala_num, p.pessoa_nome,
       DATE_FORMAT(r.reserva_Data, '%d/%m/%Y') as data,
       DATE_FORMAT(r.reserva_Data, '%H:%i') as hora_inicio,
       DATE_FORMAT(r.reserva_Data_Fim, '%H:%i') as hora_fim
FROM reserva r
JOIN sala s ON r.reserva_Sala_id = s.sala_id
JOIN professor prof ON r.reserva_Professor_id = prof.professor_id
JOIN pessoa p ON prof.professor_Pessoa_id = p.pessoa_id
WHERE r.reserva_Professor_id = ?
ORDER BY r.reserva_Data DESC
```

#### **Reservas de hoje para uma sala:**
```sql
SELECT TIME_FORMAT(s.reserva_Data, '%H:%i') as hora_inicio,
       TIME_FORMAT(s.reserva_Data_Fim, '%H:%i') as hora_fim
FROM reserva s
JOIN sala sa ON s.reserva_Sala_id = sa.sala_id
WHERE sa.sala_num = ?
AND DATE(s.reserva_Data) = CURDATE()
ORDER BY s.reserva_Data ASC
```

### **Ficheiros PHP que Fazem Queries:**
- `login.php` - SELECT em aluno/professor/seguranca
- `get_user_info.php` - SELECT em aluno/professor/seguranca + pessoa
- `listar_salas.php` - SELECT em sala
- `fazer_reserva.php` - SELECT sala, SELECT reservas (conflito), INSERT reserva
- `buscar_reservas.php` - SELECT com JOIN (reserva + sala + professor + pessoa)
- `buscar_reservas_por_sala.php` - SELECT com JOIN filtrado por sala
- `cancelar_reserva.php` - SELECT reserva (validação), DELETE reserva
- `get_sala_reservas_horas.php` - SELECT reservas de hoje

---

## 9. INTEGRAÇÃO COM SENSOR ESP32 E IoT

### **Hardware:**
- **Dispositivo:** ESP32 com sensor magnético/reed switch na porta
- **Sensor:** Deteta se porta está aberta ou fechada
- **Conectividade:** WiFi (ESP32 conecta à rede local)

### **Comunicação ESP32 → Servidor:**

#### **Endpoint de Recepção:**
- **URL:** `http://localhost/Projeto_MIPS/BD/receber_alerta.php?estado=aberta`
  - Parâmetro GET: `estado` pode ser `"aberta"` ou `"fechada"`

#### **Lógica do ESP32 (pseudocódigo):**
```cpp
void loop() {
  int doorState = digitalRead(SENSOR_PIN);
  
  if (doorState == HIGH && previousState == LOW) {
    // Porta acabou de abrir
    HTTPClient http;
    http.begin("http://SERVER_IP/Projeto_MIPS/BD/receber_alerta.php?estado=aberta");
    http.GET();
    http.end();
  }
  
  if (doorState == LOW && previousState == HIGH) {
    // Porta acabou de fechar
    HTTPClient http;
    http.begin("http://SERVER_IP/Projeto_MIPS/BD/receber_alerta.php?estado=fechada");
    http.GET();
    http.end();
  }
  
  previousState = doorState;
  delay(500);
}
```

### **Processamento no Servidor (receber_alerta.php):**

1. **Recebe estado via GET:**
   ```php
   $estado = $_GET['estado']; // 'aberta' ou 'fechada'
   $sensor_id = 1;
   $sala = 'F315'; // Hardcoded para este sensor
   ```

2. **Se estado = "aberta":**
   - Gera ID único: `time() . substr(microtime(), 2, 3)`
   - Cria objeto de alerta:
     ```php
     $newAlert = [
       'id' => $alertId,
       'sensor_id' => 1,
       'sala' => 'F315',
       'mensagem' => 'A porta F315 está aberta!',
       'opened_at' => date('Y-m-d H:i:s')
     ];
     ```
   - Adiciona a `historico_alertas_pending.json`
   - Retorna JSON: `{success: true, message: 'Alerta de porta aberta registado'}`

3. **Se estado = "fechada":**
   - Procura alerta ativo da sala em `historico_alertas_pending.json`
   - Remove de pending
   - Adiciona `closed_at` ao objeto
   - Move para `historico_alertas.json`
   - Retorna JSON: `{success: true, message: 'Alerta de porta fechada registado'}`

### **Visualização em Tempo Real:**

**Na página seguranca.html:**
1. JavaScript faz polling a cada 3 segundos:
   ```javascript
   setInterval(async () => {
     const resp = await fetch('../BD/listar_alertas.php');
     const data = await resp.json();
     // Compara tamanho do array com iteração anterior
     if (data.alertas.length > previousCount) {
       // Novos alertas! Mostrar toast + tocar som
       showToast('🚨 Novo alerta - A porta F315 está aberta!', 'error', 7000);
       playAlertSound();
     }
   }, 3000);
   ```

2. **Som de Alerta:**
   - Web Audio API gera beep de 800Hz durante 200ms
   - Toca automaticamente quando novo alerta é detetado

3. **Toast Notification:**
   - Aparece no topo da página
   - Cor vermelha (tipo 'error')
   - Animação slideIn, permanece 7 segundos, slideOut
   - Emoji 🚨 + mensagem da porta

### **Ficheiros Envolvidos no IoT:**
- **receber_alerta.php** - Recebe dados do ESP32
- **historico_alertas_pending.json** - Armazena alertas ativos
- **historico_alertas.json** - Armazena histórico
- **listar_alertas.php** - API para frontend consultar alertas ativos
- **listar_historico_alertas.php** - API para histórico completo
- **script.js** (secção alertas) - Polling, notificações, som

### **Expansibilidade:**
- Atualmente suporta 1 sensor (sala F315)
- Para adicionar mais sensores:
  - ESP32 envia `&sensor_id=X&sala=F999` na query string
  - `receber_alerta.php` usa esses valores dinamicamente (remover hardcoded)
  - Frontend adapta-se automaticamente (já processa arrays de alertas)

---

## 10. ÁREA DE SEGURANÇA E ALERTAS

### **Ficheiros Backend:**

#### **receber_alerta.php**
- **Função:** Endpoint IoT para receber estado do sensor
- **Input:** GET `?estado=aberta|fechada`
- **Output:** JSON com confirmação
- **Ações:**
  - Porta aberta: cria alerta em pending
  - Porta fechada: move alerta para histórico

#### **listar_alertas.php**
- **Função:** API para listar alertas ATIVOS
- **Input:** Nenhum (GET simples)
- **Output:** JSON `{success: true, alertas: [{id, sensor_id, sala, mensagem, opened_at}, ...]}`
- **Usado por:** Polling JavaScript na página segurança

#### **listar_historico_alertas.php**
- **Função:** API para histórico completo
- **Input:** Nenhum
- **Output:** JSON com alertas fechados, incluindo `closed_at`
- **Usado por:** Seção "Histórico de Alertas" na página segurança

#### **buscar_alertas_por_sala.php**
- **Função:** Filtrar histórico por sala específica
- **Input:** GET/POST `sala=F315`
- **Output:** JSON com alertas apenas dessa sala
- **Usado por:** Popup do mapa (mostrar últimos alertas da sala)

#### **get_sala_ultimo_alerta.php**
- **Função:** Obter último alerta de uma sala
- **Input:** GET/POST `sala=F315`
- **Output:** JSON com dados do último alerta ou null
- **Calcula:** Duração do alerta (diferença entre opened_at e closed_at)
- **Usado por:** Popup do mapa

### **Ficheiros JSON:**

#### **historico_alertas_pending.json**
- Alertas em aberto (portas atualmente abertas)
- Atualizado em tempo real pelo sensor

#### **historico_alertas.json**
- Histórico completo de alertas fechados
- Cresce indefinidamente (não tem limpeza automática)

### **Ficheiros Frontend:**

#### **seguranca.html**
- Página principal da equipa de segurança
- Menu com: Alertas, Histórico de Alertas, Ver Mapa, Procurar, Info Conta, Sair
- Script de validação: só utilizadores tipo 'seguranca' acedem

#### **script.js (secção alertas):**

**Funções principais:**

1. **Polling de Alertas:**
   ```javascript
   let previousAlertsCount = 0;
   setInterval(async () => {
     const resp = await fetch('../BD/listar_alertas.php');
     const data = await resp.json();
     const currentList = data.alertas || [];
     
     // Detetar novos alertas
     if (currentList.length > previousAlertsCount) {
       const newAlerts = currentList.slice(0, currentList.length - previousAlertsCount);
       newAlerts.forEach(alert => {
         showToast(`🚨 Novo alerta - ${alert.mensagem}`, 'error', 7000);
         playAlertSound();
       });
     }
     previousAlertsCount = currentList.length;
   }, 3000);
   ```

2. **showToast(mensagem, tipo, duração):**
   - Cria elemento HTML com classe `.toast`
   - Adiciona a `.toast-container` (topo da página)
   - Animação CSS `slideIn`
   - Após duração, animação `slideOut` e remove elemento

3. **playAlertSound():**
   ```javascript
   const audioContext = new (window.AudioContext || window.webkitAudioContext)();
   const oscillator = audioContext.createOscillator();
   oscillator.type = 'sine';
   oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
   oscillator.connect(audioContext.destination);
   oscillator.start();
   oscillator.stop(audioContext.currentTime + 0.2);
   ```

4. **Renderização de Alertas:**
   - Listagem em cards/tabela
   - Cada alerta mostra: sala, mensagem, tempo desde abertura
   - Cor vermelha para destacar urgência

5. **Histórico de Alertas:**
   - Tabela com colunas: Sala, Mensagem, Data/Hora Abertura, Data/Hora Fecho, Duração
   - Ordenação por data decrescente
   - Paginação/scroll para históricos longos

### **Fluxo Completo de um Alerta:**

1. **Sensor ESP32 deteta porta aberta**
   → Envia GET para `receber_alerta.php?estado=aberta`

2. **receber_alerta.php processa**
   → Cria objeto de alerta com timestamp
   → Salva em `historico_alertas_pending.json`

3. **Frontend (segurança) polling a cada 3s**
   → Chama `listar_alertas.php`
   → Compara número de alertas com iteração anterior
   → Deteta novo alerta

4. **Frontend reage**
   → Mostra toast notification no topo da página
   → Toca beep sonoro
   → Atualiza listagem de alertas ativos

5. **Porta fecha**
   → ESP32 envia `receber_alerta.php?estado=fechada`
   → receber_alerta.php move alerta de pending para histórico
   → Adiciona timestamp de fecho

6. **Próximo polling**
   → Alerta desaparece da lista de ativos
   → Permanece no histórico

---

## 11. ÁREA DE PROFESSORES E RESERVA DE SALAS

### **Ficheiros Backend:**

#### **fazer_reserva.php**
- **Autenticação:** Valida `$_SESSION['user_type'] === 'professor'`
- **Input (POST):**
  - `sala` - código da sala (ex: "F315")
  - `data` - data da reserva (YYYY-MM-DD)
  - `hora_inicio` - hora de início (HH:MM)
  - `hora_fim` - hora de fim (HH:MM)
- **Validações:**
  1. Campos obrigatórios preenchidos
  2. Hora fim > hora início
  3. Sala existe na BD
  4. Não há conflito de horário (query com 3 condições OR para sobresposição)
- **Ação:** INSERT em `reserva` com sala_id, professor_id, data_inicio, data_fim
- **Output:** JSON `{success: true/false, message: '...'}`

#### **buscar_reservas.php**
- **Autenticação:** Valida `$_SESSION['user_type'] === 'professor'`
- **Query:** JOIN entre reserva, sala, professor, pessoa
- **Filtro:** `WHERE r.reserva_Professor_id = ?` (apenas reservas do professor logado)
- **Output:** JSON com array de reservas:
  ```json
  {
    "success": true,
    "reservas": [
      {
        "reserva_id": 123,
        "sala_num": "F315",
        "pessoa_nome": "Carlos Monteiro",
        "data": "10/12/2025",
        "hora_inicio": "14:00",
        "hora_fim": "16:00"
      },
      ...
    ]
  }
  ```

#### **buscar_reservas_por_sala.php**
- Similar a `buscar_reservas.php`, mas filtra por `sala_id` em vez de professor
- Usado para mostrar ocupação de uma sala específica

#### **cancelar_reserva.php**
- **Autenticação:** Valida `$_SESSION['user_type'] === 'professor'`
- **Input (POST):** `reserva_id`
- **Validações:**
  1. Reserva existe
  2. Reserva pertence ao professor logado (query com 2 condições WHERE)
- **Ação:** DELETE FROM reserva WHERE reserva_id = ?
- **Output:** JSON com confirmação

#### **get_sala_reservas_horas.php**
- **Input:** `sala` (código da sala)
- **Query:** SELECT reservas de HOJE (`DATE(s.reserva_Data) = CURDATE()`)
- **Output:** Array de horários: `[{hora_inicio: "14:00", hora_fim: "16:00"}, ...]`
- **Usado por:** Popup do mapa (mostrar disponibilidade em tempo real)

### **Ficheiros Frontend:**

#### **professor.html**
- Menu: Reservar Sala, Gestão de Reservas, Ver Mapa, Procurar, Info Conta, Sair
- Script de validação: só utilizadores tipo 'professor' acedem

#### **script.js (secção professores):**

**1. Formulário de Reserva:**
```javascript
// Handler do botão "Reservar Sala"
pedirSala.addEventListener('click', () => {
  const formHTML = `
    <form id="reserva-form">
      <label>Sala:</label>
      <select name="sala" required>
        <option value="">Escolha uma sala</option>
        <!-- Preenchido dinamicamente via listar_salas.php -->
      </select>
      
      <label>Data:</label>
      <input type="date" name="data" required>
      
      <label>Hora de Início:</label>
      <input type="time" name="hora_inicio" required>
      
      <label>Hora de Fim:</label>
      <input type="time" name="hora_fim" required>
      
      <button type="submit">Confirmar Reserva</button>
    </form>
  `;
  // Renderiza formulário
});

// Submit do formulário
form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const formData = new FormData(form);
  const resp = await fetch('../BD/fazer_reserva.php', { method: 'POST', body: formData });
  const data = await resp.json();
  
  if (data.success) {
    alert('Reserva criada com sucesso!');
    // Recarregar lista de reservas
  } else {
    alert(data.message); // Ex: "Sala já reservada nesse horário"
  }
});
```

**2. Gestão de Reservas:**
```javascript
// Handler do botão "Gestão de Reservas"
salasLivres.addEventListener('click', async () => {
  const resp = await fetch('../BD/buscar_reservas.php');
  const data = await resp.json();
  
  if (data.success && data.reservas.length > 0) {
    // Renderizar tabela
    let tableHTML = `
      <table>
        <thead>
          <tr>
            <th>Sala</th>
            <th>Professor</th>
            <th>Data</th>
            <th>Hora Início</th>
            <th>Hora Fim</th>
            <th>Ações</th>
          </tr>
        </thead>
        <tbody>
    `;
    
    data.reservas.forEach(r => {
      tableHTML += `
        <tr>
          <td>${r.sala_num}</td>
          <td>${r.pessoa_nome}</td>
          <td>${r.data}</td>
          <td>${r.hora_inicio}</td>
          <td>${r.hora_fim}</td>
          <td>
            <button class="cancel-reservation" data-id="${r.reserva_id}">
              Cancelar
            </button>
          </td>
        </tr>
      `;
    });
    
    tableHTML += '</tbody></table>';
    // Renderizar na página
  } else {
    // Mensagem "Não tens reservas"
  }
});
```

**3. Cancelar Reserva:**
```javascript
// Event delegation para botões de cancelar
document.addEventListener('click', async (e) => {
  const btn = e.target.closest('.cancel-reservation');
  if (!btn) return;
  
  const reservaId = btn.dataset.id;
  if (!confirm('Tens a certeza que queres cancelar esta reserva?')) return;
  
  const formData = new FormData();
  formData.append('reserva_id', reservaId);
  
  const resp = await fetch('../BD/cancelar_reserva.php', { method: 'POST', body: formData });
  const data = await resp.json();
  
  if (data.success) {
    alert('Reserva cancelada!');
    // Remover linha da tabela ou recarregar lista
  } else {
    alert(data.message);
  }
});
```

### **Fluxo Completo de uma Reserva:**

1. **Professor acede "Reservar Sala"**
   → Frontend carrega lista de salas via `listar_salas.php`
   → Renderiza formulário com dropdown de salas

2. **Professor preenche formulário**
   → Escolhe sala, data, hora início, hora fim
   → Clica "Confirmar Reserva"

3. **Frontend envia dados**
   → POST para `fazer_reserva.php` com FormData

4. **Backend valida**
   → Verifica se professor está autenticado
   → Valida campos obrigatórios
   → Valida hora fim > hora início
   → Busca sala_id pelo código da sala
   → Verifica conflitos de horário (query complexa)

5. **Se não houver conflito**
   → INSERT na tabela reserva
   → Retorna `{success: true}`

6. **Frontend reage**
   → Mostra mensagem de sucesso
   → Recarrega lista de reservas automaticamente

7. **Professor visualiza reservas**
   → Acede "Gestão de Reservas"
   → Frontend chama `buscar_reservas.php`
   → Renderiza tabela com todas as reservas do professor

8. **Cancelamento (opcional)**
   → Professor clica "Cancelar" numa reserva
   → Confirma ação
   → Frontend envia `reserva_id` para `cancelar_reserva.php`
   → Backend valida propriedade e deleta
   → Frontend remove linha da tabela

---

## 12. FUNCIONALIDADES ADICIONAIS

### **1. Sistema de Procura de Salas (Todos os Perfis):**
- Input de texto para código da sala (ex: "F315")
- Busca case-insensitive com normalização
- Resultado:
  - **Se sala existe:** Destaca no mapa com classe `.sala-highlight` (verde pulsante)
  - **Se sala noutro andar:** Muda automaticamente para o piso correto
  - **Se sala não existe:** Mensagem "Sala não encontrada"
- **Persistência:** Highlight mantém-se até clicar noutra sala ou refrescar mapa

### **2. Popup de Informações da Sala (Mapa Interativo):**
- Ao clicar em qualquer marcador de sala:
  - **Número da sala:** Ex: "Sala F315"
  - **Reservas de hoje:** Lista de horários ocupados (ex: "14:00 - 16:00, 18:00 - 20:00")
  - **Último alerta:** Data e hora do último alerta dessa sala (se houver)
  - **Duração do alerta:** Quanto tempo a porta esteve aberta
- Dados carregados via:
  - `get_sala_reservas_horas.php` (reservas)
  - `get_sala_ultimo_alerta.php` (alertas)

### **3. Painel "Informações da Conta" (Todos os Perfis):**
- Mostra dados do utilizador logado:
  - **Tipo:** Aluno / Professor / Segurança
  - **Nome completo:** Obtido da tabela `pessoa`
  - **Email:** Email registado
  - **Descrição do perfil:** Texto explicativo das funcionalidades disponíveis
- Validação de sessão:
  - Se tipo de utilizador não corresponder à página, redireciona automaticamente
  - Ex: Se professor aceder página de aluno → redireciona para professor.html

### **4. Menu Burger Responsivo:**
- Em ecrãs pequenos (<768px), menu colapsa num ícone burger
- Click no burger: menu desliza de cima para baixo
- Click num link do menu: menu fecha automaticamente
- Click fora do menu: fecha o menu

### **5. Validação de Sessão nas Páginas:**
- Cada página HTML tem script inline que faz fetch para `get_user_info.php` ao carregar
- Se utilizador não autenticado ou tipo incorreto → redireciona para login

### **6. Toast Notifications (Segurança):**
- Sistema de notificações não-intrusivas no topo da página
- Tipos: success (verde), error (vermelho), warning (laranja), info (azul)
- Animações CSS suaves (slideIn, slideOut)
- Duração configurável (default 7 segundos para alertas)
- Empilhamento: múltiplos toasts aparecem em fila vertical

### **7. Som de Alerta (Segurança):**
- Beep gerado dinamicamente com Web Audio API
- Frequência: 800Hz (tom agudo)
- Duração: 200ms
- Toca automaticamente quando novo alerta é detetado
- Não requer ficheiro de áudio externo

### **8. Navegação Entre Andares no Mapa:**
- Botões "Anterior" e "Próximo"
- Ciclo infinito (após último andar, volta ao primeiro)
- Atualização automática de:
  - Imagem da planta
  - Texto "Piso X"
  - Marcadores de salas correspondentes ao andar
- Transição suave (fade in/out com CSS)

### **9. Debug e Desenvolvimento:**
- **debug_session.php:** Endpoint para inspecionar sessão PHP, cookies, headers
- Útil para troubleshooting de problemas de autenticação

### **10. Histórico Completo de Alertas:**
- Página dedicada ao histórico (botão no menu de segurança)
- Tabela com todas as entradas de `historico_alertas.json`
- Colunas: Sala, Mensagem, Data/Hora Abertura, Data/Hora Fecho, Duração
- Sem limite de linhas (mostra tudo)
- Ordenação por data decrescente (mais recentes primeiro)

---

## RESUMO TÉCNICO

### **Stack Tecnológico:**
- **Frontend:** HTML5, CSS3, JavaScript Vanilla (ES6+)
- **Backend:** PHP 7.4+ com MySQLi
- **Base de Dados:** MySQL 8.0 (phpMyAdmin)
- **IoT:** ESP32 com sensor magnético, WiFi, HTTP GET
- **Armazenamento Adicional:** JSON files (alertas)
- **APIs:** REST-like (JSON responses)
- **Animações:** CSS Animations + Web Audio API

### **Arquitetura:**
- **Modelo:** MVC implícito
  - **Model:** Tabelas MySQL + JSON files
  - **View:** HTML + CSS (gerado dinamicamente por JS)
  - **Controller:** PHP endpoints + script.js
- **Comunicação:** AJAX (fetch API) para todas as interações backend
- **Sessões:** PHP sessions para autenticação persistente
- **Segurança:** Prepared statements SQL, validação de sessão em cada endpoint

### **Pontos Fortes:**
- Sistema multi-perfil com funcionalidades diferenciadas
- Integração IoT funcional e escalável com polling automático
- Interface responsiva e moderna com layout centralizado
- Notificações em tempo real (visual + sonora)
- Manuais integrados bilingues (PT/EN) para cada perfil
- UX melhorada: alertas automáticos, informações contextuais no mapa

### **Pontos a Melhorar (Sugestões):**
- **Segurança:**
  - Hash de passwords (bcrypt/password_hash)
  - HTTPS obrigatório
  - CSRF tokens em formulários
  - Rate limiting nos endpoints de login
- **Escalabilidade:**
  - Migrar alertas de JSON para tabela SQL
  - Paginação no histórico de alertas
  - Cache de queries frequentes
- **UX:**
  - Loading spinners durante requisições
  - Validação em tempo real nos formulários
  - Mensagens de erro mais descritivas
- **Código:**
  - Modularização do script.js (múltiplos ficheiros)
  - Constantes para URLs dos endpoints
  - Comentários em português consistentes

---

## FICHEIROS CHAVE POR FUNCIONALIDADE

### **Autenticação:**
- login.html, login.php, db_connect.php, get_user_info.php

### **Mapa Interativo:**
- script.js (funções carregarMapa, renderização de marcadores)
- style2.css (estilos .sala, .sala-highlight, .popup)
- planta2.png, planta3.png

### **Reservas:**
- fazer_reserva.php, buscar_reservas.php, cancelar_reserva.php
- script.js (seção professores)

### **Alertas IoT:**
- receber_alerta.php, listar_alertas.php, listar_historico_alertas.php
- historico_alertas.json, historico_alertas_pending.json
- script.js (polling, toast, som)

### **Interface Geral:**
- aluno.html, professor.html, seguranca.html
- style2.css (navbar, footer, responsividade)

---

**FIM DA DOCUMENTAÇÃO**
