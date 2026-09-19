<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, project_name as projectName, title, description, priority, status, due_date as dueDate, assigned_to as assignedTo, created_at as createdAt, completed_at as completedAt FROM project_notes ORDER BY created_at DESC");
        $notes = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $notes]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['title'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Título é obrigatório.']);
            exit;
        }

        $id = $input['id'] ?? ('note_' . time() . '_' . rand(100, 999));
        $projectName = $input['projectName'] ?? 'NISSEI ASB-70DPW V4';
        $title = trim($input['title']);
        $description = $input['description'] ?? '';
        $priority = $input['priority'] ?? 'media';
        $status = $input['status'] ?? 'pendente';
        $dueDate = $input['dueDate'] ?? null;
        $assignedTo = $input['assignedTo'] ?? null;
        $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');
        $completedAt = $input['completedAt'] ?? null;

        $stmt = $pdo->prepare("INSERT INTO project_notes (id, project_name, title, description, priority, status, due_date, assigned_to, created_at, completed_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                project_name = VALUES(project_name),
                title = VALUES(title),
                description = VALUES(description),
                priority = VALUES(priority),
                status = VALUES(status),
                due_date = VALUES(due_date),
                assigned_to = VALUES(assigned_to),
                completed_at = VALUES(completed_at)");
        $stmt->execute([$id, $projectName, $title, $description, $priority, $status, $dueDate, $assignedTo, $createdAt, $completedAt]);

        echo json_encode(['success' => true, 'data' => [
            'id' => $id, 'projectName' => $projectName, 'title' => $title, 'description' => $description,
            'priority' => $priority, 'status' => $status, 'dueDate' => $dueDate, 'assignedTo' => $assignedTo,
            'createdAt' => $createdAt, 'completedAt' => $completedAt
        ]]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID não informado.']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM project_notes WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Lembrete removido com sucesso.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
