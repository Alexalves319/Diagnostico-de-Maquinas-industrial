<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, machine_id as machineId, fault_code as faultCode, description, action_taken as actionTaken, parts_replaced as partsReplaced, status, technician, date, duration_minutes as durationMinutes, notes, created_at as createdAt FROM maintenance_records ORDER BY date DESC, created_at DESC");
        $records = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $records]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['description']) || empty($input['actionTaken'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Descrição e ações tomadas são obrigatórias.']);
            exit;
        }

        $id = $input['id'] ?? ('maint_' . time() . '_' . rand(100, 999));
        $machineId = $input['machineId'] ?? 'NISSEI ASB-70DPW V4';
        $faultCode = $input['faultCode'] ?? null;
        $description = trim($input['description']);
        $actionTaken = trim($input['actionTaken']);
        $partsReplaced = $input['partsReplaced'] ?? null;
        $status = $input['status'] ?? 'concluida';
        $technician = $input['technician'] ?? 'Operador';
        $date = $input['date'] ?? date('Y-m-d');
        $durationMinutes = isset($input['durationMinutes']) ? (int)$input['durationMinutes'] : null;
        $notes = $input['notes'] ?? null;
        $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO maintenance_records (id, machine_id, fault_code, description, action_taken, parts_replaced, status, technician, date, duration_minutes, notes, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                machine_id = VALUES(machine_id),
                fault_code = VALUES(fault_code),
                description = VALUES(description),
                action_taken = VALUES(action_taken),
                parts_replaced = VALUES(parts_replaced),
                status = VALUES(status),
                technician = VALUES(technician),
                date = VALUES(date),
                duration_minutes = VALUES(duration_minutes),
                notes = VALUES(notes)");
        $stmt->execute([$id, $machineId, $faultCode, $description, $actionTaken, $partsReplaced, $status, $technician, $date, $durationMinutes, $notes, $createdAt]);

        echo json_encode(['success' => true, 'data' => [
            'id' => $id, 'machineId' => $machineId, 'faultCode' => $faultCode, 'description' => $description,
            'actionTaken' => $actionTaken, 'partsReplaced' => $partsReplaced, 'status' => $status,
            'technician' => $technician, 'date' => $date, 'durationMinutes' => $durationMinutes,
            'notes' => $notes, 'createdAt' => $createdAt
        ]]);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID não informado.']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM maintenance_records WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Ordem de serviço removida com sucesso.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
