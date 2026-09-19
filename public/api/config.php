<?php
/**
 * Configuração de Conexão com o Banco de Dados MySQL (XAMPP)
 * Projeto: NISSEI ASB-70DPW V4 SERVO
 * Desenvolvido por Alex Alves
 */

header('Content-Type: application/json; charset=utf-8');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Configurações padrão do MySQL no XAMPP
$db_host = 'localhost';
$db_port = '3306';
$db_name = 'db_nissei';
$db_user = 'root';
$db_pass = ''; // Senha padrão do XAMPP é vazia

function getDB() {
    global $db_host, $db_port, $db_name, $db_user, $db_pass;
    try {
        $dsn = "mysql:host={$db_host};port={$db_port};dbname={$db_name};charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, $db_user, $db_pass, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Falha ao conectar ao MySQL no XAMPP.',
            'details' => $e->getMessage(),
            'hint' => 'Verifique se o MySQL está iniciado no Painel do XAMPP e se o banco db_nissei foi importado.'
        ]);
        exit;
    }
}
