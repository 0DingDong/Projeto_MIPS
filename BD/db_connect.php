<?php
// Credenciais da base de dados local XAMPP/phpMyAdmin
$servername = "localhost";
$username = "root";
$password = "";
$dbname = "mips_local";

// Criar conexão
$conn = new mysqli($servername, $username, $password, $dbname);

// Verificar conexão
if ($conn->connect_error) {
    die("❌ Erro de conexão: " . $conn->connect_error);
}

// Definir charset (importante para caracteres especiais portugueses)
$conn->set_charset("utf8mb4");
?>