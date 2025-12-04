<?php
header('Content-Type: application/json; charset=utf-8');
session_start();

// Simular um login de professor para teste
$_SESSION['user_type'] = 'professor';
$_SESSION['user_id'] = 1; // ID do professor Ana Martins

echo json_encode(['success' => true, 'message' => 'Session iniciada para teste. user_type=professor, user_id=1']);
