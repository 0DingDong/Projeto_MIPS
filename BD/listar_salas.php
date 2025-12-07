<?php
header('Content-Type: application/json');
include('db_connect.php');

// Buscar todas as salas
$sql = "SELECT sala_id, sala_num FROM sala ORDER BY sala_num ASC";
$stmt = $conn->prepare($sql);
$stmt->execute();
$result = $stmt->get_result();

$salas = [];
while ($row = $result->fetch_assoc()) {
    $salas[] = [
        'id' => $row['sala_id'],
        'num' => $row['sala_num']
    ];
}

echo json_encode(['success' => true, 'salas' => $salas]);

$stmt->close();
$conn->close();
?>
