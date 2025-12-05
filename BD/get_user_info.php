<?php
include('db_connect.php');
session_start();

if (!isset($_SESSION['user_type']) || !isset($_SESSION['user_id'])) {
    echo json_encode(['success' => false, 'message' => 'Não autenticado.']);
    exit();
}

// Ler dados da sessão
$user_type = $_SESSION['user_type'];
$user_id = $_SESSION['user_id'] ?? null;
// Tentar várias fontes para encontrar nome/email
$result = null;
$debug = [];
try {
    // 1) Professor - buscar direto na tabela professor e depois em pessoa
    if ($user_type === 'professor') {
        $sql = "SELECT * FROM professor WHERE professor_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $debug[] = ['q' => 'prof_by_id', 'rows' => $res->num_rows];
        $row = $res->fetch_assoc();
        // incluir o row cru para debugging
        $debug[] = ['prof_row' => $row];
        if ($row) {
            // tentar extrair nome/email directamente
            $nome = '';
            $email = '';
            if (isset($row['professor_email'])) $email = $row['professor_email'];
            if (isset($row['professor_nome'])) $nome = $row['professor_nome'];
            // se existir ligação para pessoa, tentar obter nome aí
            if (empty($nome) && !empty($row['professor_Pessoa_id'])) {
                $pessoaId = $row['professor_Pessoa_id'];
                $s2 = $conn->prepare("SELECT pessoa_nome FROM pessoa WHERE pessoa_id = ?");
                $s2->bind_param('i', $pessoaId);
                $s2->execute();
                $r2 = $s2->get_result();
                $debug[] = ['q' => 'pessoa_lookup_by_professor', 'rows' => $r2->num_rows];
                $rrow = $r2->fetch_assoc();
                $debug[] = ['pessoa_row' => $rrow];
                if ($rrow && isset($rrow['pessoa_nome'])) $nome = $rrow['pessoa_nome'];
                $s2->close();
            }
            $result = ['nome' => $nome, 'email' => $email];
        }
        $stmt->close();
        // capturar erro SQL se houver
        if ($conn->error) $debug[] = ['sql_error' => $conn->error];
    }

    // 2) Aluno
    if (!$result && $user_type === 'aluno') {
        $sql = "SELECT aluno_nome AS nome, aluno_email AS email FROM aluno WHERE aluno_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $debug[] = ['q' => 'aluno', 'rows' => $res->num_rows];
        $row = $res->fetch_assoc();
        if ($row) $result = $row;
        $stmt->close();
    }

    // 3) Seguranca
    if (!$result && $user_type === 'seguranca') {
        $sql = "SELECT seguranca_nome AS nome, seguranca_email AS email FROM seguranca WHERE seguranca_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $debug[] = ['q' => 'seguranca', 'rows' => $res->num_rows];
        $row = $res->fetch_assoc();
        if ($row) $result = $row;
        $stmt->close();
    }

    // 4) Se nada ainda, tentar procurar na tabela pessoa usando pessoa_id = user_id
    if (!$result) {
        // A tabela `pessoa` pode não ter coluna de email em todos os esquemas.
        // Seleccionamos apenas o nome e deixamos email vazio para evitar erros de coluna desconhecida.
        $sql = "SELECT pessoa_nome AS nome, '' AS email FROM pessoa WHERE pessoa_id = ?";
        $stmt = $conn->prepare($sql);
        $stmt->bind_param('i', $user_id);
        $stmt->execute();
        $res = $stmt->get_result();
        $debug[] = ['q' => 'pessoa_by_id', 'rows' => $res->num_rows];
        $row = $res->fetch_assoc();
        if ($row) $result = $row;
        $stmt->close();
    }

    // 5) As a last resort, attempt to look up by email fields present in professor/aluno/seguranca using user_id as index
    if (!$result) {
        $debug[] = ['q' => 'not_found', 'user_type' => $user_type, 'user_id' => $user_id];
    }

} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage(), 'debug' => $debug]);
    $conn->close();
    exit();
}

if ($result) {
    $nome = $result['nome'] ?? '';
    $email = $result['email'] ?? '';
    echo json_encode(['success' => true, 'user_type' => $user_type, 'nome' => $nome, 'email' => $email, 'debug' => $debug]);
} else {
    echo json_encode(['success' => false, 'message' => 'Informação do utilizador não encontrada.', 'debug' => $debug]);
}
