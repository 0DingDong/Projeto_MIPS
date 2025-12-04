<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Debug: mostrar estado da sessão
$debug = [
    'session_id' => session_id(),
    'session_status' => session_status(),
    'session_data' => $_SESSION,
    'user_type' => $_SESSION['user_type'] ?? 'não definido',
    'user_id' => $_SESSION['user_id'] ?? 'não definido',
];

echo json_encode($debug, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
