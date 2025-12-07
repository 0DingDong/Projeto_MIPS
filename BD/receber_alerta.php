<?php
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "railway";

// Receber estado da porta
$estado = $_GET['estado']; // 'aberta' ou 'fechada'

// Sensor associado
$sensor_id = 1;

// Criar ligação
$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
  die("Erro na ligação: " . $conn->connect_error);
}

// Criar alerta
if ($estado === "aberta") {
    $sql = "INSERT INTO alerta (alerta_mensagem, alerta_Sensor_id)
            VALUES ('A porta F315 está aberta!', $sensor_id)";
    $conn->query($sql);
}

echo "OK";
$conn->close();
?>
