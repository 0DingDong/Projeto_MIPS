<?php
// Endpoint IoT - recebe estado dos sensores ESP32 nas portas
// Quando porta abre: cria alerta em pending
// Quando porta fecha: move alerta para histórico

date_default_timezone_set('Europe/Lisbon');

// Receber estado da porta (esperado: 'aberta' ou 'fechada')
$estado = isset($_GET['estado']) ? $_GET['estado'] : null;
$sensor_id = 1;  // ID do sensor (por agora fixo)

// Criar ligação BD (opcional, mantém para auditoria)
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mips_local";
$conn = new mysqli($servername, $username, $password, $dbname);

// Usar ficheiros JSON para guardar alertas
$pendingFile = __DIR__ . '/historico_alertas_pending.json';
$historyFile = __DIR__ . '/historico_alertas.json';

// Garantir que ficheiros existem
if (!file_exists($pendingFile)) file_put_contents($pendingFile, json_encode([]));
if (!file_exists($historyFile)) file_put_contents($historyFile, json_encode([]));

$pending = json_decode(file_get_contents($pendingFile), true);
if (!is_array($pending)) $pending = [];

$history = json_decode(file_get_contents($historyFile), true);
if (!is_array($history)) $history = [];

$sala = 'F315';
$mensagem = "A porta $sala está aberta!";

// ===== PORTA ABERTA =====
if ($estado === 'aberta') {
  // Verificar se já existe alerta pendente (evita duplicação)
  $exists = false;
  foreach ($pending as $p) {
    if (isset($p['sensor_id']) && $p['sensor_id'] == $sensor_id) { 
      $exists = true; 
      break; 
    }
  }
  
  if (!$exists) {
    // Criar novo alerta
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

  // Opcional: registar também na BD
  if ($conn && !$conn->connect_error) {
    $sql = "INSERT INTO alerta (alerta_mensagem, alerta_Sensor_id) VALUES (?, ?)";
    if ($stmt = $conn->prepare($sql)) {
      $stmt->bind_param('si', $mensagem, $sensor_id);
      @$stmt->execute();
      $stmt->close();
    }
  }

  echo "OK";

// ===== PORTA FECHADA =====
} elseif ($estado === 'fechada') {
  // Procurar alerta pendente para este sensor
  $foundIndex = null;
  $foundEntry = null;
  
  foreach ($pending as $i => $p) {
    if (isset($p['sensor_id']) && $p['sensor_id'] == $sensor_id) { 
      $foundIndex = $i;
      $foundEntry = $p;
      break; 
    }
  }

  if ($foundIndex !== null && $foundEntry) {
    // Adicionar timestamp de fecho
    $foundEntry['closed_at'] = date('Y-m-d H:i:s');
    // Mover para histórico
    $history[] = $foundEntry;
    // Remover de pending
    array_splice($pending, $foundIndex, 1);
    
    file_put_contents($pendingFile, json_encode($pending, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
    file_put_contents($historyFile, json_encode($history, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE));
  }

  echo "OK";

} else {
  http_response_code(400);
  echo "Bad Request";
}

$conn->close();
?>
