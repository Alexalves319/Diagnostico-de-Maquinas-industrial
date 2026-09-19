<?php
require_once __DIR__ . '/config.php';

$pdo = getDB();
$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        $stmt = $pdo->query("SELECT id, username, name, role, password, created_at as createdAt FROM users ORDER BY created_at ASC");
        $users = $stmt->fetchAll();
        echo json_encode(['success' => true, 'data' => $users]);
        break;

    case 'POST':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['username']) || empty($input['name'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'Dados incompletos.']);
            exit;
        }

        $id = $input['id'] ?? ('usr_' . time() . '_' . rand(100, 999));
        $username = trim($input['username']);
        $name = trim($input['name']);
        $role = $input['role'] ?? 'operador';
        $password = $input['password'] ?? '123456';
        $createdAt = $input['createdAt'] ?? date('Y-m-d H:i:s');

        $stmt = $pdo->prepare("INSERT INTO users (id, username, name, role, password, created_at) VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE name = VALUES(name), role = VALUES(role), password = VALUES(password)");
        $stmt->execute([$id, $username, $name, $role, $password, $createdAt]);

        echo json_encode(['success' => true, 'data' => [
            'id' => $id, 'username' => $username, 'name' => $name, 'role' => $role, 'password' => $password, 'createdAt' => $createdAt
        ]]);
        break;

    case 'PUT':
        $input = json_decode(file_get_contents('php://input'), true);
        if (!$input || empty($input['id'])) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID do usuário não informado.']);
            exit;
        }

        $fields = [];
        $params = [];
        if (isset($input['name'])) { $fields[] = "name = ?"; $params[] = $input['name']; }
        if (isset($input['role'])) { $fields[] = "role = ?"; $params[] = $input['role']; }
        if (isset($input['password'])) { $fields[] = "password = ?"; $params[] = $input['password']; }

        if (empty($fields)) {
            echo json_encode(['success' => true, 'message' => 'Nenhum campo para atualizar.']);
            exit;
        }

        $params[] = $input['id'];
        $sql = "UPDATE users SET " . implode(', ', $fields) . " WHERE id = ?";
        $stmt = $pdo->prepare($sql);
        $stmt->execute($params);

        echo json_encode(['success' => true, 'message' => 'Usuário atualizado com sucesso.']);
        break;

    case 'DELETE':
        $id = $_GET['id'] ?? null;
        if (!$id) {
            http_response_code(400);
            echo json_encode(['success' => false, 'error' => 'ID não informado.']);
            exit;
        }
        $stmt = $pdo->prepare("DELETE FROM users WHERE id = ?");
        $stmt->execute([$id]);
        echo json_encode(['success' => true, 'message' => 'Usuário removido com sucesso.']);
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método não permitido']);
        break;
}
