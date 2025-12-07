<?php
header('Content-Type: application/json');

// Definir timezone para Portugal (WET/WEST)
date_default_timezone_set('Europe/Lisbon');

$historyFile = __DIR__ . '/historico_alertas.json';
if (!file_exists($historyFile)) {
    echo json_encode(['success' => true, 'historico' => []]);
    exit;
}

$history = json_decode(file_get_contents($historyFile), true);
if (!is_array($history)) $history = [];

// Inverter array para mostrar os mais recentes primeiro
$history = array_reverse($history);

// Normalize output
$out = [];
foreach ($history as $h) {
    $out[] = [
        'id' => $h['id'] ?? null,
        'sensor_id' => $h['sensor_id'] ?? null,
        'sala' => $h['sala'] ?? null,
        'mensagem' => $h['mensagem'] ?? null,
        'opened_at' => $h['opened_at'] ?? null,
        'closed_at' => $h['closed_at'] ?? null
    ];
}
 
 echo json_encode(['success' => true, 'historico' => $out]);
?>