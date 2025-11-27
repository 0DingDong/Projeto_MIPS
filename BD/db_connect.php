<?php
// Credenciais do Railway
$servername = "maglev.proxy.rlwy.net";
$username = "root";
$password = "pKbbavvgPYmYgBcoMBKSVReBpHfwnBHP";
$dbname = "railway";
$port = 57244;

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname, $port);

// Verificar conexão
if ($conn->connect_error) {
    die("❌ Erro de conexão: " . $conn->connect_error);
}

// Definir charset (importante para caracteres especiais portugueses)
$conn->set_charset("utf8mb4");
?>