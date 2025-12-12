<?php
// Sistema de login - verifica email e password em 3 tabelas (aluno, professor, segurança)
// Se encontrar match, cria sessão e retorna tipo de utilizador em JSON

include('db_connect.php');
session_start();

// Receber dados do formulário
$email = $_POST['email_aluno'];
$password = $_POST['pass_aluno'];

// ===== TENTAR LOGIN COMO ALUNO =====
$sqlAluno = "SELECT * FROM aluno WHERE aluno_email = ?";
$stmt = $conn->prepare($sqlAluno);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultAluno = $stmt->get_result();

if ($resultAluno->num_rows > 0) {
    $user = $resultAluno->fetch_assoc();
    
    // Se password bate, criar sessão
    if ($password === $user['aluno_pass']) {
        $_SESSION['user_type'] = "aluno";
        $_SESSION['user_id'] = $user['aluno_id'];
        echo json_encode(['success' => true, 'user_type' => 'aluno']);
        $stmt->close();
        $conn->close();
        exit();
    }
}

// ===== TENTAR LOGIN COMO PROFESSOR =====
$sqlProf = "SELECT * FROM professor WHERE professor_email = ?";
$stmt = $conn->prepare($sqlProf);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultProf = $stmt->get_result();

if ($resultProf->num_rows > 0) {
    $user = $resultProf->fetch_assoc();
    
    if ($password === $user['professor_pass']) {
        $_SESSION['user_type'] = "professor";
        $_SESSION['user_id'] = $user['professor_id'];
        echo json_encode(['success' => true, 'user_type' => 'professor']);
        $stmt->close();
        $conn->close();
        exit();
    }
}

// ===== TENTAR LOGIN COMO SEGURANÇA =====
$sqlSeg = "SELECT * FROM seguranca WHERE seguranca_email = ?";
$stmt = $conn->prepare($sqlSeg);
$stmt->bind_param("s", $email);
$stmt->execute();
$resultSeg = $stmt->get_result();

if ($resultSeg->num_rows > 0) {
    $user = $resultSeg->fetch_assoc();
    
    if ($password === $user['seguranca_pass']) {
        $_SESSION['user_type'] = "seguranca";
        $_SESSION['user_id'] = $user['seguranca_id'];
        echo json_encode(['success' => true, 'user_type' => 'seguranca']);
        $stmt->close();
        $conn->close();
        exit();
    }
}

// Se chegou aqui, credenciais incorretas
echo json_encode(['success' => false, 'message' => 'Email ou senha incorretos.']);

$stmt->close();
$conn->close();
?>