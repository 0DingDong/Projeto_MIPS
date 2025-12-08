<?php
header('Content-Type: application/json');

// Definir timezone para Portugal (WET/WEST)
date_default_timezone_set('Europe/Lisbon');

// Receber nome da sala via POST ou GET
$sala = isset($_POST['sala']) ? trim($_POST['sala']) : (isset($_GET['sala']) ? trim($_GET['sala']) : null);

if (!$sala) {
    echo json_encode(['success' => false, 'message' => 'Sala não especificada.']);
    exit();
}

// Carregar histórico de alertas
$historyFile = __DIR__ . '/historico_alertas.json';
if (!file_exists($historyFile)) {
    echo json_encode(['success' => true, 'sala' => $sala, 'alertas' => []]);
    exit;
}

$history = json_decode(file_get_contents($historyFile), true);
if (!is_array($history)) $history = [];

// Filtrar alertas da sala especificada
$alertasDaSala = array_filter($history, function($h) use ($sala) {
    return isset($h['sala']) && strtoupper($h['sala']) === strtoupper($sala);
});

// Inverter para mostrar os mais recentes primeiro
$alertasDaSala = array_reverse($alertasDaSala);

// Normalizar output
$out = [];
foreach ($alertasDaSala as $a) {
    $out[] = [
        'id' => $a['id'] ?? null,
        'sensor_id' => $a['sensor_id'] ?? null,
        'sala' => $a['sala'] ?? null,
        'mensagem' => $a['mensagem'] ?? null,
        'opened_at' => $a['opened_at'] ?? null,
        'closed_at' => $a['closed_at'] ?? null
    ];
}

echo json_encode(['success' => true, 'sala' => $sala, 'alertas' => $out]);
?>
