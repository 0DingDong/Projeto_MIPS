<?php
include('db_connect.php');
session_start();

// Verificar se o utilizador está logado como professor
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'professor') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas professores podem reservar salas.']);
    exit();
}

// Receber dados do formulário
$sala_num = $_POST['sala'] ?? '';
$data = $_POST['data'] ?? '';
$hora = $_POST['hora'] ?? '';
$professor_id = $_SESSION['user_id'];

// Validar campos
if (empty($sala_num) || empty($data) || empty($hora)) {
    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
    exit();
}

// Combinar data e hora
$data_hora = $data . ' ' . $hora . ':00';

// Buscar sala_id pelo número/código da sala
$sql = "SELECT sala_id FROM sala WHERE sala_num = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $sala_num);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows === 0) {
    echo json_encode(['success' => false, 'message' => 'Sala não encontrada.']);
    exit();
}

$sala = $result->fetch_assoc();
$sala_id = $sala['sala_id'];

// Verificar se a sala já está reservada nesse horário
$sql_check = "SELECT * FROM reserva WHERE reserva_Sala_id = ? AND reserva_Data = ?";
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("is", $sala_id, $data_hora);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    echo json_encode(['success' => false, 'message' => 'Sala já está reservada nesse horário.']);
    exit();
}

// Inserir reserva
$sql_insert = "INSERT INTO reserva (reserva_Professor_id, reserva_Sala_id, reserva_Data) VALUES (?, ?, ?)";
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("iis", $professor_id, $sala_id, $data_hora);

if ($stmt_insert->execute()) {
    echo json_encode(['success' => true, 'message' => 'Reserva efetuada com sucesso!']);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao efetuar reserva: ' . $conn->error]);
}

$stmt->close();
$stmt_check->close();
$stmt_insert->close();
$conn->close();
?>