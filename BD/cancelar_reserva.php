<?php
header('Content-Type: application/json; charset=utf-8');
include('db_connect.php');
session_start();

// Verificar se o utilizador está logado como professor
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'professor') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado.']);
    exit();
}

// Receber ID da reserva
$reserva_id = $_POST['reserva_id'] ?? 0;
$professor_id = $_SESSION['user_id'];

if (empty($reserva_id)) {
    echo json_encode(['success' => false, 'message' => 'ID da reserva não fornecido.']);
    exit();
}

// Verificar se a reserva pertence ao professor logado
$sql_check = "SELECT * FROM reserva WHERE reserva_id = ? AND reserva_Professor_id = ?";
$stmt_check = $conn->prepare($sql_check);
if (!$stmt_check) {
    echo json_encode(['success' => false, 'message' => 'Erro ao preparar query: ' . $conn->error]);
    exit();
}

$stmt_check->bind_param("ii", $reserva_id, $professor_id);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Reserva não encontrada ou não pertence a este professor.']);
    exit();
}

// Cancelar (apagar) a reserva
$sql_delete = "DELETE FROM reserva WHERE reserva_id = ?";
$stmt_delete = $conn->prepare($sql_delete);
if (!$stmt_delete) {
    echo json_encode(['success' => false, 'message' => 'Erro ao preparar query: ' . $conn->error]);
    exit();
}

$stmt_delete->bind_param("i", $reserva_id);

if ($stmt_delete->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reserva cancelada com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao cancelar reserva: ' . $conn->error]);
}

$stmt_check->close();
$stmt_delete->close();
$conn->close();
?>