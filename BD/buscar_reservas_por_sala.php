<?php
header('Content-Type: application/json');
include('db_connect.php');
session_start();

// Verificar autenticação
if (!isset($_SESSION['user_type'])) {
    echo json_encode(['success' => false, 'message' => 'Não autenticado.']);
    exit();
}

// Receber ID da sala via POST ou GET
$sala_id = isset($_POST['sala_id']) ? intval($_POST['sala_id']) : (isset($_GET['sala_id']) ? intval($_GET['sala_id']) : null);

if (!$sala_id) {
    echo json_encode(['success' => false, 'message' => 'Sala não especificada.']);
    exit();
}

// Buscar reservas dessa sala
$sql = "SELECT 
            r.reserva_id,
            s.sala_num,
            p.pessoa_nome,
            DATE_FORMAT(r.reserva_Data, '%d/%m/%Y') as data,
            DATE_FORMAT(r.reserva_Data, '%H:%i') as hora_inicio,
            DATE_FORMAT(r.reserva_Data_Fim, '%H:%i') as hora_fim
        FROM reserva r
        JOIN sala s ON r.reserva_Sala_id = s.sala_id
        JOIN professor prof ON r.reserva_Professor_id = prof.professor_id
        JOIN pessoa p ON prof.professor_Pessoa_id = p.pessoa_id
        WHERE r.reserva_Sala_id = ?
        ORDER BY r.reserva_Data DESC";

$stmt = $conn->prepare($sql);
$stmt->bind_param('i', $sala_id);
$stmt->execute();
$result = $stmt->get_result();

$reservas = [];
while ($row = $result->fetch_assoc()) {
    $reservas[] = $row;
}

echo json_encode(['success' => true, 'sala_id' => $sala_id, 'reservas' => $reservas]);

$stmt->close();
$conn->close();
?>
