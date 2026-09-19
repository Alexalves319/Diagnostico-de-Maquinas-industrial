<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, code, title, causes, resolution, related_functions as relatedFunctions, severity, source_reference as sourceReference, added_by as addedBy, created_at as createdAt, updated_at as updatedAt FROM diagnostic_codes ORDER BY code ASC");
        $codes = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $codes]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['code']) || empty($input['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Código e título são obrigatórios.']);
            exit;
        }

        $id = $input['id'] ?? ('code_' . time() . '_' . rand(100, 999));
        $code = trim($input['code']);
        $title = trim($input['title']);
        $causes = $input['causes'] ?? '';
        $resolution = $input['resolution'] ?? '';
        $relatedFunctions = $input['relatedFunctions'] ?? '';
        $severity = $input['severity'] ?? 'media';
        $sourceReference = $input['sourceReference'] ?? '';
        $addedBy = $input['addedBy'] ?? 'Sistema';
        $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
        $updatedAt = date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO diagnostic_codes (id, code, title, causes, resolution, related_functions, severity, source_reference, added_by, created_at, updated_at) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE 
                code = VALUES(code),
                title = VALUES(title),
                causes = VALUES(causes),
                resolution = VALUES(resolution),
                related_functions = VALUES(related_functions),
                severity = VALUES(severity),
                source_reference = VALUES(source_reference),
                updated_at = VALUES(updated_at)");
        $stmt->execute([$id, $code, $title, $causes, $resolution, $relatedFunctions, $severity, $sourceReference, $addedBy, $createdAt, $updatedAt]);

        echo json_encode(['success' => true, 'data' => [
            'id' => $id, 'code' => $code, 'title' => $title, 'causes' => $causes, 'resolution' => $resolution,
            'relatedFunctions' => $relatedFunctions, 'severity' => $severity, 'sourceReference' => $sourceReference,
            'addedBy' => $addedBy, 'createdAt' => $createdAt, 'updatedAt' => $updatedAt
        ]]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID não informado.']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM diagnostic_codes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Código excluído com sucesso.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
