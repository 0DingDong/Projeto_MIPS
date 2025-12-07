<?php
// listar_alertas.php
// TODO: Implementar endpoint para listar alertas.
// Atualmente é um ficheiro placeholder criado em 2025-12-07.

header('Content-Type: application/json');

$pendingFile = __DIR__ . '/historico_alertas_pending.json';
if (!file_exists($pendingFile)) {
	echo json_encode(['success' => true, 'alertas' => []]);
	exit;
}

$pending = json_decode(file_get_contents($pendingFile), true);
if (!is_array($pending)) $pending = [];

// Normalize output fields
$out = [];
foreach ($pending as $p) {
	$out[] = [
		'id' => $p['id'] ?? null,
		'sensor_id' => $p['sensor_id'] ?? null,
		'sala' => $p['sala'] ?? null,
		'mensagem' => $p['mensagem'] ?? null,
		'opened_at' => $p['opened_at'] ?? null
	];
}

echo json_encode(['success' => true, 'alertas' => $out]);

?>