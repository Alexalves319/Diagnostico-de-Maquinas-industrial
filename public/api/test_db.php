<?php
require_once __DIR__ . '/config.php';

try {
    $pdo = getDB();
    $stmt = $pdo->query("SHOW TABLES");
    $tables = $stmt->fetchAll(PDO::FETCH_COLUMN);

    $counts = [];
    foreach ($tables as $t) {
        $cntStmt = $pdo->query("SELECT COUNT(*) as total FROM `{$t}`");
        $counts[$t] = (int)$cntStmt->fetch()['total'];
    }

    echo json_encode([
        'success' => true,
        'message' => 'Conexão com MySQL estabelecida com sucesso no XAMPP!',
        'database' => $db_name,
        'tables' => $tables,
        'counts' => $counts
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
} catch (Exception $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage()
    ]);
}
