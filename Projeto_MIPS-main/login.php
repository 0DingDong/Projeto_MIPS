<?php
include('db_connect.php'); // liga à base de dados
session_start(); // iniciar sessão no início do ficheiro

// Recebe dados do formulário
$email = $_POST['email_aluno'];
$password = $_POST['pass_aluno'];

// Procura o utilizador na BD usando prepared statement
$sql = "SELECT * FROM aluno WHERE email_aluno = ?";
$stmt = $conn->prepare($sql);
$stmt->bind_param("s", $email);
$stmt->execute();
$result = $stmt->get_result();

if ($result->num_rows > 0) {
    $user = $result->fetch_assoc();

    // Comparação direta da senha em texto simples
    if ($password === $user['pass_aluno']) {
        // Login com sucesso
        $_SESSION['aluno'] = $user['nome_aluno']; // ou outro campo da BD
        header("Location: aluno.html"); // redireciona para página principal
        exit();
    } else {
        echo "Senha incorreta.";
    }
} else {
    echo "Email não encontrado.";
}

$conn->close();
?>

