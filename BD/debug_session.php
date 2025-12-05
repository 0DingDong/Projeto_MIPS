<?php
// Dev endpoint para inspecionar sessão e cookies (apenas para debugging local)
header('Content-Type: application/json');
include('db_connect.php');
session_start();

$out = [
    'session_id' => session_id(),
    'session' => $_SESSION,
    'cookies' => $_COOKIE,
    'request_headers' => getallheaders()
];

echo json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
?>