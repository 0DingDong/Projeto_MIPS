<?php
header('Content-Type: application/json');

// Definir timezone para Portugal
date_default_timezone_set('Europe/Lisbon');

// Receber nome da sala via GET ou POST
$sala = isset($_GET['sala']) ? trim($_GET['sala']) : (isset($_POST['sala']) ? trim($_POST['sala']) : null);

if (!$sala) {
    echo json_encode(['success' => false, 'message' => 'Sala não especificada.']);
    exit();
}

// Carregar histórico de alertas
$historyFile = __DIR__ . '/historico_alertas.json';
if (!file_exists($historyFile)) {
    echo json_encode(['success' => true, 'sala' => $sala, 'ultimo_alerta' => null]);
    exit;
}

$history = json_decode(file_get_contents($historyFile), true);
if (!is_array($history)) $history = [];

// Filtrar alertas da sala e pegar o último
$alertasDaSala = array_filter($history, function($h) use ($sala) {
    return isset($h['sala']) && strtoupper($h['sala']) === strtoupper($sala);
});

if (empty($alertasDaSala)) {
    echo json_encode(['success' => true, 'sala' => $sala, 'ultimo_alerta' => null]);
    exit;
}

// Pegar o último alerta (último índice do array filtrado)
$ultimoAlerta = end($alertasDaSala);

// Formatar data e hora
$opened_at = $ultimoAlerta['opened_at'] ?? null;
$closed_at = $ultimoAlerta['closed_at'] ?? null;

// Extrair apenas as horas e datas
$hora_aberto = '';
$hora_fechado = '';
$data_alerta = '';

if ($opened_at) {
    $partes = explode(' ', $opened_at);
    if (count($partes) >= 2) {
        $data_str = $partes[0]; // YYYY-MM-DD
        $hora_aberto = $partes[1];
        // Converter para DD/MM/YYYY
        $data_obj = DateTime::createFromFormat('Y-m-d', $data_str);
        if ($data_obj) {
            $data_alerta = $data_obj->format('d/m/Y');
        }
    }
}

if ($closed_at) {
    $partes = explode(' ', $closed_at);
    if (count($partes) >= 2) {
        $hora_fechado = $partes[1];
    }
}

echo json_encode([
    'success' => true,
    'sala' => $sala,
    'ultimo_alerta' => [
        'data' => $data_alerta,
        'hora_aberto' => $hora_aberto,
        'hora_fechado' => $hora_fechado,
        'opened_at' => $opened_at,
        'closed_at' => $closed_at
    ]
]);
?>
