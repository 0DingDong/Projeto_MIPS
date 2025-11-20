<?php
$servername = "localhost";
$username = "root"; // ou o teu utilizador MySQL
$password = "";     // palavra-passe do MySQL
$dbname = "mips";

$conn = new mysqli($servername, $username, $password, $dbname);

if ($conn->connect_error) {
    die("Erro de ligação: " . $conn->connect_error);
}
?>
