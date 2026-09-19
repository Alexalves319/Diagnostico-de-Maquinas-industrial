<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

if ($method === 'GET') {
    // Retorna todos os dados para backup / restauração
    $users = $pdo->query("SELECT id, username, name, role, password, created_at as createdAt FROM users")->fetchAll();
    $codes = $pdo->query("SELECT id, code, title, causes, resolution, related_functions as relatedFunctions, severity, source_reference as sourceReference, added_by as addedBy, created_at as createdAt, updated_at as updatedAt FROM diagnostic_codes")->fetchAll();
    $maintenance = $pdo->query("SELECT id, machine_id as machineId, fault_code as faultCode, description, action_taken as actionTaken, parts_replaced as partsReplaced, status, technician, date, duration_minutes as durationMinutes, notes, created_at as createdAt FROM maintenance_records")->fetchAll();
    $notes = $pdo->query("SELECT id, project_name as projectName, title, description, priority, status, due_date as dueDate, assigned_to as assignedTo, created_at as createdAt, completed_at as completedAt FROM project_notes")->fetchAll();

    echo json_encode([
        'success' => true,
        'database' => $db_name,
        'users' => $users,
        'codes' => $codes,
        'maintenance' => $maintenance,
        'notes' => $notes
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    exit;
}

if ($method === 'POST') {
    // Recebe o payload do frontend e popula o MySQL
    $input = json_decode(file_get_contents('php://input'), true);
    if (!$input) {
        http_response_code(400);
        echo json_encode(['success' => false, 'error' => 'Dados inválidos.']);
        exit;
    }

    $pdo->beginTransaction();
    try {
        if (!empty($input['users'])) {
            $stmtUser = $pdo->prepare("INSERT INTO users (id, username, name, role, password, created_at) VALUES (?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password = VALUES(password)");
            foreach ($input['users'] as $u) {
                $stmtUser->execute([$u['id'], $u['username'], $u['name'], $u['role'], $u['password'] ?? '123456', $u['createdAt'] ?? date('Y-m-d H:i:s')]);
            }
        }

        if (!empty($input['codes'])) {
            $stmtCode = $pdo->prepare("INSERT INTO diagnostic_codes (id, code, title, causes, resolution, related_functions, severity, source_reference, added_by, created_at, updated_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title = VALUES(title), causes = VALUES(causes), resolution = VALUES(resolution), severity = VALUES(severity)");
            foreach ($input['codes'] as $c) {
                $stmtCode->execute([
                    $c['id'], $c['code'], $c['title'], $c['causes'] ?? '', $c['resolution'] ?? '',
                    $c['relatedFunctions'] ?? '', $c['severity'] ?? 'media', $c['sourceReference'] ?? '',
                    $c['addedBy'] ?? 'Sistema', $c['createdAt'] ?? date('Y-m-d H:i:s'), $c['updatedAt'] ?? date('Y-m-d H:i:s')
                ]);
            }
        }

        if (!empty($input['maintenance'])) {
            $stmtMaint = $pdo->prepare("INSERT INTO maintenance_records (id, machine_id, fault_code, description, action_taken, parts_replaced, status, technician, date, duration_minutes, notes, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE description = VALUES(description), action_taken = VALUES(action_taken)");
            foreach ($input['maintenance'] as $m) {
                $stmtMaint->execute([
                    $m['id'], $m['machineId'] ?? 'NISSEI ASB-70DPW V4', $m['faultCode'] ?? null,
                    $m['description'] ?? '', $m['actionTaken'] ?? '', $m['partsReplaced'] ?? null,
                    $m['status'] ?? 'concluida', $m['technician'] ?? 'Operador', $m['date'] ?? date('Y-m-d'),
                    $m['durationMinutes'] ?? null, $m['notes'] ?? null, $m['createdAt'] ?? date('Y-m-d H:i:s')
                ]);
            }
        }

        if (!empty($input['notes'])) {
            $stmtNotes = $pdo->prepare("INSERT INTO project_notes (id, project_name, title, description, priority, status, due_date, assigned_to, created_at, completed_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE title = VALUES(title), status = VALUES(status)");
            foreach ($input['notes'] as $n) {
                $stmtNotes->execute([
                    $n['id'], $n['projectName'] ?? 'NISSEI ASB-70DPW V4', $n['title'] ?? '',
                    $n['description'] ?? '', $n['priority'] ?? 'media', $n['status'] ?? 'pendente',
                    $n['dueDate'] ?? null, $n['assignedTo'] ?? null, $n['createdAt'] ?? date('Y-m-d H:i:s'),
                    $n['completedAt'] ?? null
                ]);
            }
        }

        $pdo->commit();
        echo json_encode(['success' => true, 'message' => 'Sincronização com o MySQL concluída com sucesso!']);
    } catch (Exception $e) {
        $pdo->rollBack();
        http_response_code(500);
        echo json_encode(['success' => false, 'error' => $e->getMessage()]);
    }
    exit;
}
