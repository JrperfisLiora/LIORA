<?php
/**
 * LIORA — contact.php
 * Recebe os dados do formulário "Solicitar um projeto" e envia por e-mail.
 * Funciona nativamente em hospedagem PHP (Hostinger inclui PHP por padrão).
 *
 * TODO: nenhuma configuração de servidor SMTP é necessária — este script usa
 * a função mail() nativa do PHP, que a Hostinger já tem habilitada.
 */

// ============ CONFIGURAÇÃO ============
$destinatario = "comercial@jrperfis.com.br"; // e-mail que vai receber as solicitações
$assunto_base = "Novo contato pelo site — LIORA";
// =======================================

header('Content-Type: application/json; charset=utf-8');

// Só aceita requisições POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método não permitido.']);
    exit;
}

// Função simples de sanitização (evita injeção de cabeçalhos de e-mail)
function limpar($valor) {
    $valor = trim($valor ?? '');
    $valor = str_replace(["\r", "\n"], '', $valor);
    return htmlspecialchars($valor, ENT_QUOTES, 'UTF-8');
}

$nome     = limpar($_POST['nome'] ?? '');
$empresa  = limpar($_POST['empresa'] ?? '');
$email    = limpar($_POST['email'] ?? '');
$telefone = limpar($_POST['telefone'] ?? '');
$cidade   = limpar($_POST['cidade'] ?? '');
$mensagem = trim($_POST['mensagem'] ?? ''); // mensagem pode ter quebras de linha normais

// Validação dos campos obrigatórios
if ($nome === '' || $email === '' || $mensagem === '') {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Preencha nome, e-mail e mensagem.']);
    exit;
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'E-mail inválido.']);
    exit;
}

// Honeypot simples anti-spam (campo invisível — se preenchido, é bot)
if (!empty($_POST['website'])) {
    // finge sucesso pro bot, mas não envia nada
    echo json_encode(['success' => true]);
    exit;
}

// Monta o corpo do e-mail
$corpo = "Nova solicitação de projeto pelo site da LIORA:\n\n";
$corpo .= "Nome: {$nome}\n";
if ($empresa !== '')  $corpo .= "Empresa: {$empresa}\n";
$corpo .= "E-mail: {$email}\n";
if ($telefone !== '') $corpo .= "Telefone: {$telefone}\n";
if ($cidade !== '')   $corpo .= "Cidade: {$cidade}\n";
$corpo .= "\nMensagem:\n{$mensagem}\n";

$assunto = $assunto_base . " — " . $nome;

// Cabeçalhos do e-mail
$headers   = [];
$headers[] = "MIME-Version: 1.0";
$headers[] = "Content-Type: text/plain; charset=UTF-8";
$headers[] = "From: site@" . ($_SERVER['HTTP_HOST'] ?? 'localhost'); // remetente técnico
$headers[] = "Reply-To: {$nome} <{$email}>"; // responder vai direto pro visitante

$enviado = mail($destinatario, $assunto, $corpo, implode("\r\n", $headers));

if ($enviado) {
    echo json_encode(['success' => true]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Não foi possível enviar agora. Tente novamente em instantes.']);
}
