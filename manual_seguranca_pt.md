# Manual de Segurança - MIPS (Mapa Interativo de Salas)

## 📚 Bem-vindo ao MIPS

O MIPS é uma plataforma digital desenvolvida para auxiliar na gestão das salas do IPS. Este manual vai ajudá-lo a utilizar todas as funcionalidades disponíveis para membros da segurança, incluindo monitorização de alertas em tempo real.

---

## 🔐 Como Fazer Login

1. Aceda à página de login do MIPS
2. Introduza o seu **email** registado
3. Introduza a sua **password**
4. Clique no botão **"Entrar"**
5. Será redirecionado para a página principal de segurança

> **Nota:** Se tiver problemas de acesso, contacte o administrador do sistema.

---

## 🗺️ Funcionalidades Disponíveis

### 1. Ver Mapa Interativo

Visualize o mapa das salas com indicadores de segurança em tempo real.

**Como usar:**
1. Clique em **"Ver Mapa"** no menu superior
2. O mapa do andar 2 será exibido automaticamente
3. Use as **setas laterais** (◀ ▶) para navegar entre andares
4. **Passe o rato** sobre qualquer sala para ver:
   - Nome da sala
   - Último alerta registado
   - Estado da porta (aberta/fechada)
5. Os **marcadores** indicam o estado das salas:
   - **Azul:** Sala sem alertas ativos
   - **Vermelho:** Sala com porta aberta (alerta ativo)

**Informações no Tooltip:**
- **Nome da sala**
- **Último alerta:** Data, hora e tipo de alerta
- **Estado atual:** Porta aberta ou fechada

---

### 2. Procurar Sala

Encontre rapidamente qualquer sala no mapa.

**Como usar:**
1. Clique em **"Procurar"** no menu superior
2. Digite o nome/número da sala (ex: F210, F315)
3. Selecione a sala da lista de sugestões
4. O mapa abrirá automaticamente no andar correto
5. A sala escolhida ficará **destacada em amarelo**

---

### 3. Alertas Ativos 🚨

Monitorize todas as portas abertas em tempo real. **Esta é a funcionalidade principal para segurança.**

**Como usar:**
1. Clique em **"Alertas"** no menu superior
2. Verá uma lista de todos os alertas ativos:
   - **Sala:** Número da sala com porta aberta
   - **Mensagem:** Descrição do alerta
   - **Aberto em:** Data e hora em que a porta foi aberta
3. A lista atualiza **automaticamente a cada 5 segundos**
4. Se não houver alertas: "Nenhum alerta ativo"

**Notificações em Tempo Real:**
- **Sons de alerta:** Toca automaticamente quando há novo alerta
- **Notificações toast:** Aparecem no canto superior direito do ecrã
- **Atualização automática:** Não precisa recarregar a página

**Importante:**
- Os alertas são gerados automaticamente pelos sensores ESP32 nas portas
- Quando uma porta fecha, o alerta move-se para o histórico
- As notificações funcionam **mesmo sem clicar em "Alertas"** - iniciando automaticamente ao fazer login

---

### 4. Pesquisar Alertas por Sala

Consulte o histórico completo de alertas de uma sala específica.

**Como usar:**
1. Clique em **"Procurar"** no menu superior
2. Digite o nome da sala (ex: F315)
3. Selecione a sala da lista de sugestões
4. Verá uma tabela com todos os alertas dessa sala:
   - **Sala:** Número da sala
   - **Aberto:** Data e hora de abertura
   - **Fechado:** Data e hora de fecho
5. A tabela mostra alertas do histórico (portas já fechadas)

**Utilidade:**
- Verificar padrões de uso de uma sala
- Investigar incidentes específicos
- Auditar acessos a salas sensíveis
- Relatórios de segurança

---

### 5. Histórico de Alertas

Veja o histórico completo de todos os alertas registados no sistema.

**Como usar:**
1. Clique em **"Histórico de Alertas"** no menu superior
2. Verá uma tabela com todos os alertas históricos:
   - **Sala:** Número da sala
   - **Aberto:** Data e hora de abertura
   - **Fechado:** Data e hora de fecho
3. A lista está ordenada do mais recente ao mais antigo
4. A tabela atualiza **automaticamente a cada 10 segundos**

**Diferença entre Alertas e Histórico:**
- **Alertas:** Portas atualmente abertas (ativas)
- **Histórico:** Portas que já foram fechadas (concluídas)

---

### 6. Informações da Conta

Visualize os seus dados de conta e perfil.

**Como usar:**
1. Clique em **"Informações da Conta"** no menu superior
2. Verá as seguintes informações:
   - **Tipo de conta:** Segurança
   - **Nome completo**
   - **Email registado**
   - **Descrição das funcionalidades** disponíveis

---

### 7. Sair da Conta

**Como usar:**
1. Clique em **"Sair"** no menu superior
2. Será redirecionado para a página de login
3. A sua sessão será encerrada com segurança

---

## 🔔 Sistema de Notificações

O MIPS possui um sistema avançado de notificações para segurança:

### Notificações Toast
- Aparecem automaticamente no **canto superior direito**
- Cor vermelha para alertas críticos (porta aberta)
- Duração: 7 segundos (fecha automaticamente)
- Mostra a sala e o tipo de alerta

### Som de Alerta
- **Beep** de 800Hz durante 200ms
- Toca automaticamente quando há novo alerta
- Ajuda a chamar a atenção mesmo se não estiver a olhar para o ecrã

### Polling Automático
- O sistema verifica novos alertas **a cada 3 segundos**
- Funciona em background, mesmo sem a página de alertas aberta
- Inicia automaticamente ao fazer login como segurança

---

## 🔌 Integração com Sensores ESP32

O MIPS está integrado com sensores físicos nas portas das salas:

**Como Funciona:**
1. Sensores ESP32 estão instalados nas portas
2. Quando uma porta **abre**, o sensor envia alerta ao servidor
3. O alerta aparece imediatamente na lista de "Alertas Ativos"
4. Recebe notificação sonora e visual
5. Quando a porta **fecha**, o sensor envia confirmação
6. O alerta move-se para o "Histórico de Alertas"

**Informação Técnica:**
- Sensores comunicam via HTTP GET
- Endpoint: `receber_alerta.php`
- Dados JSON armazenados em: `historico_alertas.json` e `historico_alertas_pending.json`

---

## 📱 Utilização no Telemóvel

O MIPS é totalmente responsivo e funciona perfeitamente em dispositivos móveis.

**Menu no Telemóvel:**
1. Clique no **ícone do menu** (☰) no canto superior direito
2. O menu expandirá mostrando todas as opções
3. Selecione a funcionalidade desejada
4. O menu fecha automaticamente após a seleção

**Dicas para Telemóvel:**
- Notificações aparecem adaptadas ao tamanho do ecrã
- Tabelas têm scroll horizontal
- Sons de alerta funcionam normalmente
- Todos os quadrados ficam centralizados

---

## ❓ Perguntas Frequentes

**P: As notificações funcionam se eu estiver noutra secção?**
R: Sim! O polling automático funciona em background em toda a página de segurança.

**P: Posso desativar o som dos alertas?**
R: Atualmente não, mas pode silenciar o navegador/dispositivo.

**P: Com que frequência o sistema verifica novos alertas?**
R: A cada 3 segundos automaticamente.

**P: O que acontece se perder uma notificação?**
R: Pode sempre consultar "Alertas Ativos" para ver todas as portas abertas.

**P: Posso apagar alertas do histórico?**
R: Não, o histórico é permanente para fins de auditoria.

**P: Os alertas funcionam 24/7?**
R: Sim, os sensores estão sempre ativos e a enviar dados.

**P: Posso exportar o histórico de alertas?**
R: Não diretamente pela interface, contacte o administrador.

---

## 🚨 Procedimentos de Emergência

**Ao receber um alerta:**
1. ✅ Verifique imediatamente a sala no mapa
2. ✅ Note a hora e localização exata
3. ✅ Se necessário, dirija-se fisicamente ao local
4. ✅ Registe qualquer irregularidade
5. ✅ Aguarde o alerta mover-se para o histórico quando a porta fechar

**Alertas Suspeitos:**
- Portas abertas fora do horário normal
- Múltiplas aberturas em curto espaço de tempo
- Portas que ficam abertas por muito tempo

---

## 📊 Boas Práticas

✅ **Mantenha o MIPS aberto** durante o turno de trabalho
✅ **Ative o som** do dispositivo para ouvir alertas
✅ **Consulte o histórico** regularmente para padrões
✅ **Responda rapidamente** a alertas críticos
✅ **Faça logout** quando terminar o turno

---

## 🔧 Resolução de Problemas

**Problema: Não recebo notificações**
- Verifique se tem som ativado
- Recarregue a página
- Confirme que está na conta de segurança

**Problema: Alertas não atualizam**
- Verifique a ligação à internet
- Recarregue a página
- Contacte suporte se persistir

**Problema: Sons não tocam**
- Ative permissões de áudio no navegador
- Verifique volume do dispositivo
- Alguns navegadores bloqueiam áudio automático

---

## 📞 Suporte

Se tiver dúvidas ou problemas técnicos, contacte:
- **Email:** email@mips.com

---

## 🎯 Dicas Úteis para Segurança

✅ **Monitore alertas em tempo real** durante todo o turno
✅ **Use o mapa** para localizar rapidamente salas com alertas
✅ **Consulte o histórico** para verificar padrões suspeitos
✅ **Pesquise por sala** quando investigar incidentes específicos
✅ **Mantenha o volume ligado** para ouvir notificações sonoras

---

**MIPS - Garantindo a segurança dos espaços do IPS**

*Versão 1.0 - 2025*
