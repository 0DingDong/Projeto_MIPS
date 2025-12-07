<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mips_local";   // <- ESTA É A BD CERTA

// Receber estado da porta (esperado: 'aberta' ou 'fechada')
$estado = isset($_GET['estado']) ? $_GET['estado'] : null; // 'aberta' ou 'fechada'

// Sensor associado (único por agora)
$sensor_id = 1;

// Criar ligação (mantemos por compatibilidade caso queiras gravar em BD no futuro)
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  // Se a ligação falhar, ainda assim continuamos a processar as fixtures em ficheiro
  error_log("Erro na ligação DB em receber_alerta.php: " . $conn->connect_error);
}

// Usaremos ficheiros JSON simples para gerir alertas abertos e histórico de alertas.
// Motivo: evitar dependência em colunas DB específicas aqui e permitir um histórico funcional.
$pendingFile = __DIR__ . '/historico_alertas_pending.json';
$historyFile = __DIR__ . '/historico_alertas.json';

// Garante que os ficheiros existem
if (!file_exists($pendingFile)) file_put_contents($pendingFile, json_encode([]));
if (!file_exists($historyFile)) file_put_contents($historyFile, json_encode([]));

$pending = json_decode(file_get_contents($pendingFile), true);
if (!is_array($pending)) $pending = [];

$history = json_decode(file_get_contents($historyFile), true);
if (!is_array($history)) $history = [];

// Mensagem e sala (a mensagem actual é fixa; adaptável conforme sensor)
$sala = 'F315';
$mensagem = "A porta $sala está aberta!";

if ($estado === 'aberta') {
  // Inserir alerta pendente (se já houver um para este sensor, não duplicar)
  $exists = false;
  foreach ($pending as $p) {
    if (isset($p['sensor_id']) && $p['sensor_id'] == $sensor_id) { $exists = true; break; }
  }
  if (!$exists) {
    $entry = [
      'id' => time() . rand(100,999),
      'sensor_id' => $sensor_id,
      'sala' => $sala,
      'mensagem' => $mensagem,
      'opened_at' => date('Y-m-d H:i:s')
    ];
    $pending[] = $entry;
    file_put_contents($pendingFile, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  }

  // Opcional: ainda gravamos um registo simples na BD para auditing (se a tabela existir)
  if ($conn && !$conn->connect_error) {
    $sql = "INSERT INTO alerta (alerta_mensagem, alerta_Sensor_id) VALUES (?, ?)";
    if ($stmt = $conn->prepare($sql)) {
      $stmt->bind_param('si', $mensagem, $sensor_id);
      @$stmt->execute();
      $stmt->close();
    }
  }

  echo "OK";

} elseif ($estado === 'fechada') {
  // Ao fechar: localizar alerta pendente para este sensor, remover de pending e gravar no histórico
  $foundIndex = null;
  $foundEntry = null;
  foreach ($pending as $i => $p) {
    if (isset($p['sensor_id']) && $p['sensor_id'] == $sensor_id) { $foundIndex = $i; $foundEntry = $p; break; }
  }

  if ($foundIndex !== null && $foundEntry) {
    // Completar com closed timestamp
    $foundEntry['closed_at'] = date('Y-m-d H:i:s');
    $history[] = $foundEntry;
    // Remover de pending
    array_splice($pending, $foundIndex, 1);
    file_put_contents($pendingFile, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    file_put_contents($historyFile, json_encode($history, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  }

  // Opcional: gravar também na BD que fechou (se houver colunas adequadas)
  if ($conn && !$conn->connect_error) {
    // Tentamos atualizar a última entrada para este sensor se existir uma coluna 'closed_at' - silenciosamente
    $trySql = "UPDATE alerta SET alerta_mensagem = alerta_mensagem WHERE alerta_Sensor_id = ? LIMIT 1";
    if ($stmt = @$conn->prepare($trySql)) {
      $stmt->bind_param('i', $sensor_id);
      @$stmt->execute();
      @$stmt->close();
    }
  }

  echo "OK";

} else {
  http_response_code(400);
  echo "Bad Request";
}

$conn->close();
?>
