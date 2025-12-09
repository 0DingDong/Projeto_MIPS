<?php
session_start();

// Função para verificar autenticação
function checkAuth($requiredType = null) {
    if (!isset($_SESSION['user_type']) || !isset($_SESSION['user_id'])) {
        header('Location: ../html/login.html');
        exit();
    }
    
    if ($requiredType && $_SESSION['user_type'] !== $requiredType) {
        // Redirecionar para a página correta do utilizador
        $pageMap = [
            'aluno' => '../html/aluno.html',
            'professor' => '../html/professor.html',
            'seguranca' => '../html/seguranca.html'
        ];
        $redirectPage = $pageMap[$_SESSION['user_type']] ?? '../html/login.html';
        header('Location: ' . $redirectPage);
        exit();
    }
}
?>
