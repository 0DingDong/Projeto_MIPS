<?php
header('Content-Type: application/json');
include('db_connect.php');

// Definir timezone para Portugal
date_default_timezone_set('Europe/Lisbon');

// Receber nome da sala via GET ou POST
$sala_num = isset($_GET['sala']) ? trim($_GET['sala']) : (isset($_POST['sala']) ? trim($_POST['sala']) : null);

if (!$sala_num) {
    echo json_encode(['success' => false, 'message' => 'Sala não especificada.']);
    exit();
}

// Buscar reservas de hoje para essa sala
$sql = "SELECT 
            TIME_FORMAT(s.reserva_Data, '%H:%i') as hora_inicio,
            TIME_FORMAT(s.reserva_Data_Fim, '%H:%i') as hora_fim
        FROM reserva s
        JOIN sala sa ON s.reserva_Sala_id = sa.sala_id
        WHERE sa.sala_num = ?
        AND DATE(s.reserva_Data) = CURDATE()
        ORDER BY s.reserva_Data ASC";

$stmt = $conn->prepare($sql);
if (!$stmt) {
    echo json_encode(['success' => false, 'message' => 'Erro na query.']);
    exit();
}

$stmt->bind_param("s", $sala_num);
$stmt->execute();
$result = $stmt->get_result();

$reservas = [];
while ($row = $result->fetch_assoc()) {
    $reservas[] = [
        'hora_inicio' => $row['hora_inicio'],
        'hora_fim' => $row['hora_fim']
    ];
}

echo json_encode(['success' => true, 'sala' => $sala_num, 'reservas' => $reservas]);

$stmt->close();
$conn->close();
?>
