<?php
// Sistema de reserva de salas
// Valida se professor está logado, verifica dados e detecta conflitos de horário
// Se tudo OK, insere reserva na BD

include('db_connect.php');
session_start();

// Só professores podem reservar
if (!isset($_SESSION['user_type']) || $_SESSION['user_type'] !== 'professor') {
    echo json_encode(['success' => false, 'message' => 'Acesso negado. Apenas professores podem reservar salas.']);
    exit();
}

// Receber dados do formulário
$sala_num = $_POST['sala'] ?? '';
$data = $_POST['data'] ?? '';
$hora_inicio = $_POST['hora_inicio'] ?? '';
$hora_fim = $_POST['hora_fim'] ?? '';
$professor_id = $_SESSION['user_id'];

// Validar se campos estão preenchidos
if (empty($sala_num) || empty($data) || empty($hora_inicio) || empty($hora_fim)) {
    echo json_encode(['success' => false, 'message' => 'Todos os campos são obrigatórios.']);
    exit();
}

// Validar que hora fim é depois da hora início
if ($hora_fim <= $hora_inicio) {
    echo json_encode(['success' => false, 'message' => 'A hora de fim deve ser posterior à hora de início.']);
    exit();
}

// Combinar data e horas para formato datetime
$data_hora_inicio = $data . ' ' . $hora_inicio . ':00';
$data_hora_fim = $data . ' ' . $hora_fim . ':00';

// Buscar sala_id pelo código
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

// ===== DETECTAR CONFLITOS DE HORÁRIO =====
// Duas reservas conflitam se: (nova_inicio < existente_fim) E (nova_fim > existente_inicio)
// Ex: Existente 14:00-16:00, Nova 15:00-17:00 → Conflito (sobrepõem de 15:00-16:00)

$sql_check = "SELECT * FROM reserva 
              WHERE reserva_Sala_id = ? 
              AND DATE(reserva_Data) = ? 
              AND (
                  (? < reserva_Data_Fim AND ? > reserva_Data)
              )";
              
$stmt_check = $conn->prepare($sql_check);
$stmt_check->bind_param("isss", $sala_id, $data, $data_hora_inicio, $data_hora_fim);
$stmt_check->execute();
$result_check = $stmt_check->get_result();

if ($result_check->num_rows > 0) {
    $conflito = $result_check->fetch_assoc();
    $hora_conflito_inicio = date('H:i', strtotime($conflito['reserva_Data']));
    $hora_conflito_fim = date('H:i', strtotime($conflito['reserva_Data_Fim']));
    
    echo json_encode([
        'success' => false, 
        'message' => "Sala já está reservada nesse horário! Conflito com reserva das {$hora_conflito_inicio} às {$hora_conflito_fim}."
    ]);
    exit();
}

// Se chegou aqui, não há conflitos - inserir reserva
$sql_insert = "INSERT INTO reserva (reserva_Professor_id, reserva_Sala_id, reserva_Data, reserva_Data_Fim) 
               VALUES (?, ?, ?, ?)";
               
$stmt_insert = $conn->prepare($sql_insert);
$stmt_insert->bind_param("iiss", $professor_id, $sala_id, $data_hora_inicio, $data_hora_fim);

if ($stmt_insert->execute()) {
    echo json_encode([
        'success' => true, 
        'message' => "Reserva efetuada com sucesso! Sala {$sala_num} de {$hora_inicio} às {$hora_fim}."
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Erro ao efetuar reserva: ' . $conn->error]);
}

$stmt->close();
$stmt_check->close();
$stmt_insert->close();
$conn->close();
?>