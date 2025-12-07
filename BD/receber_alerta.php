<?php
header('Content-Type: application/json');
include("db_connect.php");

if (!isset($_POST['sensor_id']) || !isset($_POST['estado'])) {
    echo json_encode(["success" => false, "message" => "Dados incompletos."]);
    exit();
}

$sensor_id = intval($_POST['sensor_id']);
$estado = $_POST['estado'];

$mensagem = ($estado === "aberta")
    ? "A porta do sensor $sensor_id está ABERTA!"
    : "A porta do sensor $sensor_id está FECHADA!";

// Guarda alerta
$sql = "INSERT INTO alerta (alerta_mensagem, alerta_Sensor_id) VALUES (?, ?)";
$stmt = $conn->prepare($sql);
$stmt->bind_param("si", $mensagem, $sensor_id);
$stmt->execute();

echo json_encode(["success" => true, "message" => "Alerta recebido."]);
?>
