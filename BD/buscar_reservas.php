<?php
header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');
session_start();

// Verificar se o utilizador está logado como professor
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'professor') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit();
}

$professor_id = $_SESSION['user_id'];

// Buscar reservas do professor com informações da sala e pessoa
$sql = "SELECT 
            r.reserva_id,
            s.sala_num,
            p.pessoa_nome,
            DATE_FORMAT(r.reserva_Data, '%Y-%m-%d') as data,
            DATE_FORMAT(r.reserva_Data, '%H:%i') as hora_inicio,
            DATE_FORMAT(r.reserva_Data_Fim, '%H:%i') as hora_fim
        FROM reserva r
        JOIN sala s ON r.reserva_Sala_id = s.sala_id
        JOIN professor prof ON r.reserva_Professor_id = prof.professor_id
        JOIN pessoa p ON prof.professor_Pessoa_id = p.pessoa_id
        WHERE r.reserva_Professor_id = ?
        ORDER BY r.reserva_Data DESC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Erro ao preparar query: ' . $conn->error]);
    exit();
}

$stmt->bind_param("i", $professor_id);
if (!$stmt->execute()) {
    echo json_encode(['success' => false, 'message' => 'Erro ao executar query: ' . $stmt->error]);
    exit();
}

$result = $stmt->get_result();

$reservas = [];
while ($row = $result->fetch_assoc()) {
    $reservas[] = $row;
}

echo json_encode(['success' => true, 'reservas' => $reservas]);

$stmt->close();
$conn->close();
?>