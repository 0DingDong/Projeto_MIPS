<?php
include('db_connect.php');
session_start();

// Recebe dados enviados do login.html
$email = $_POST['email_aluno'];
$password = $_POST['pass_aluno'];

// --------------------- LOGIN ALUNO ---------------------
$sqlAluno = "SELECT * FROM Aluno WHERE email_aluno = ?";
$stmt = $conn->prepare($sqlAluno);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultAluno = $stmt->get_result();

if ($resultAluno->num_rows > 0) {
    $user = $resultAluno->fetch_assoc();
    
    if ($password === $user['pass_aluno']) {
        $_SESSION['user_type'] = "aluno";
        $_SESSION['user_id'] = $user['Alunoid'];
        header("Location: aluno.html");
        exit();
    }
}

// --------------------- LOGIN PROFESSOR ---------------------
$sqlProf = "SELECT * FROM Professor WHERE email_prof = ?";
$stmt = $conn->prepare($sqlProf);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultProf = $stmt->get_result();

if ($resultProf->num_rows > 0) {
    $user = $resultProf->fetch_assoc();
    
    if ($password === $user['pass_prof']) {
        $_SESSION['user_type'] = "professor";
        $_SESSION['user_id'] = $user['Professor_id'];
        header("Location: professor.html");
        exit();
    }
}

// --------------------- LOGIN SEGURANÇA ---------------------
$sqlSeg = "SELECT * FROM Seguranca WHERE email_Seg = ?";
$stmt = $conn->prepare($sqlSeg);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultSeg = $stmt->get_result();

if ($resultSeg->num_rows > 0) {
    $user = $resultSeg->fetch_assoc();
    
    if ($password === $user['pass_Seg']) {
        $_SESSION['user_type'] = "seguranca";
        $_SESSION['user_id'] = $user['Seguranca_id'];
        header("Location: seguranca.html");
        exit();
    }
}

// Se chegar aqui, o email não corresponde a nenhum utilizador
echo "Email ou senha incorretos.";

$stmt->close();
$conn->close();
?>

