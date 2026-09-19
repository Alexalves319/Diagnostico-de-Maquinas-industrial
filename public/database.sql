-- ==========================================================
-- BANCO DE DADOS MYSQL PARA XAMPP: db_nissei
-- Máquina: Injetora Sopradora 1-Estágio NISSEI ASB-70DPW V4 SERVO
-- Desenvolvido por Alex Alves
-- ==========================================================

CREATE DATABASE IF NOT EXISTS `db_nissei` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE `db_nissei`;

-- --------------------------------------------------------
-- Tabela de Usuários do Sistema
-- --------------------------------------------------------
DROP TABLE IF EXISTS `users`;
CREATE TABLE `users` (
  `id` VARCHAR(64) NOT NULL,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `name` VARCHAR(128) NOT NULL,
  `role` ENUM('operador', 'admin') NOT NULL DEFAULT 'operador',
  `password` VARCHAR(128) NOT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Usuários Padrão Iniciais (admin / admin123 e operador / operador123)
INSERT INTO `users` (`id`, `username`, `name`, `role`, `password`, `created_at`) VALUES
('usr_admin', 'admin', 'Administrador do Sistema', 'admin', 'admin123', NOW()),
('usr_operador', 'operador', 'Operador Técnico', 'operador', 'operador123', NOW());

-- --------------------------------------------------------
-- Tabela de Códigos de Falha & Diagnóstico Técnico
-- --------------------------------------------------------
DROP TABLE IF EXISTS `diagnostic_codes`;
CREATE TABLE `diagnostic_codes` (
  `id` VARCHAR(64) NOT NULL,
  `code` VARCHAR(64) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `causes` TEXT NOT NULL,
  `resolution` TEXT NOT NULL,
  `related_functions` VARCHAR(255) DEFAULT NULL,
  `severity` ENUM('baixa', 'media', 'alta', 'critica') NOT NULL DEFAULT 'media',
  `source_reference` VARCHAR(255) DEFAULT NULL,
  `added_by` VARCHAR(128) DEFAULT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `updated_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_code` (`code`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Códigos Iniciais de Referência da NISSEI ASB-70DPW V4 SERVO
INSERT INTO `diagnostic_codes` (`id`, `code`, `title`, `causes`, `resolution`, `related_functions`, `severity`, `source_reference`, `added_by`, `created_at`, `updated_at`) VALUES
('code_nissei_p1_v1', 'V1-P1', 'Servo-Bomba 1 (V1/P1) — Sistema de Injeção (INJECTION)', 'Desvios de pressão ou velocidade na unidade de injeção. Causas: oscilação na dosagem da rosca (SCREW BW), ar no circuito da bomba YUKEN ASE5, obstrução na linha de avanço/recuo da unidade (INJ. UNIT FW/BW), superaquecimento do servo driver AMSE1 ou nível insuficiente de óleo ISO VG46.', '1. Parâmetros padrão do manual: SCREW BW: 3 MPa / 30% vel. | INJ. UNIT FW: 7 MPa / 10% vel. | INJ. UNIT BW: 4 MPa / 10% vel. | UNLOAD: 0 MPa / 0%.\n2. Inspecionar servo driver AMSE1 no painel elétrico.\n3. Checar enchimento da bomba YUKEN ASE5 (600 ml de ISO VG46).\n4. Verificar engripamento mecânico no carro da unidade injetora.', 'Unidade de Injeção, Rosca Plastificadora, Avanço e Recuo do Bico Injetor', 'alta', 'Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P1/V1)', 'Sistema', NOW(), NOW()),
('code_nissei_p2_v2', 'V2-P2', 'Servo-Bomba 2 (V2/P2) — Molde de Injeção (INJ. M, Main Ram & Lip Mold)', 'Falha de fechamento, alta pressão ou abertura do molde de injeção. Causas: perda de pressão de travamento no cilindro Main Ram (não atinge 14 MPa), transição irregular entre avanço rápido e lento, emperramento mecânico do Lip Mold ou falha no servo acionador AMSE2.', '1. Parâmetros padrão do manual:\n   - Fechamento: CL FA: 7 MPa (80%) | CL SD: 7 MPa (50%) | CL (M.SET): 5 MPa (5%)\n   - Abertura: OP SD: 1 MPa (4%) | OP FA: 14 MPa (90%) | OP SD 2: 8 MPa (60%)\n   - Main Ram: FW: 14 MPa (50%) | BW: 6 MPa (50%)\n2. Se o Main Ram não travar com 14 MPa, verificar vedações do cilindro e válvula de pré-enchimento.\n3. Testar calibração do transdutor de pressão canal P2 e alarmes do drive AMSE2.\n4. Lubrificar colunas guias.', 'Fechamento/Abertura do Molde de Injeção, Cilindro Main Ram e Lip Mold', 'critica', 'Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P2/V2)', 'Sistema', NOW(), NOW()),
('code_nissei_p3_v3', 'V3-P3', 'Servo-Bomba 3 (V3/P3) — Mesa Rotativa e Molde de Sopro', 'Desvio no giro da mesa indexadora (TABLE ROTATE) ou abertura/fechamento do molde de sopro (BLOW M. CL/OP). Causas: desalinhamento de sensores indutivos de posição, pressão insuficiente no avanço do Bottom Mold (BOT. M FW: 14 MPa), contaminação nas válvulas direcionais ou sobrecarga no servo driver AMSE3.', '1. Conferir parâmetros padrão: TABLE ROTATE: 3 MPa / 30% vel. | BLOW M. CL: 7 MPa (50%) / 14 MPa (50%) | BOT. M FW: 14 MPa / 30% vel.\n2. Inspecionar o sensor de indexação angular da mesa giratória de 4 estações.\n3. Checar alinhamento do molde de fundo (Bottom Mold) com a cavidade de sopro.\n4. Avaliar temperatura de trabalho do bloco hidráulico.', 'Mesa Indexadora 4 Estações, Molde de Sopro e Molde de Fundo', 'alta', 'Manual NISSEI ASB-70DPW V4 (Doc 389A61809 ENG, Seção P3/V3)', 'Sistema', NOW(), NOW());

-- --------------------------------------------------------
-- Tabela de Histórico de Ordens de Serviço e Manutenção
-- --------------------------------------------------------
DROP TABLE IF EXISTS `maintenance_records`;
CREATE TABLE `maintenance_records` (
  `id` VARCHAR(64) NOT NULL,
  `machine_id` VARCHAR(64) NOT NULL,
  `fault_code` VARCHAR(64) DEFAULT NULL,
  `description` TEXT NOT NULL,
  `action_taken` TEXT NOT NULL,
  `parts_replaced` TEXT DEFAULT NULL,
  `status` ENUM('concluida', 'em_andamento', 'aguardando_pecas', 'cancelada') NOT NULL DEFAULT 'concluida',
  `technician` VARCHAR(128) NOT NULL,
  `date` VARCHAR(64) NOT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `notes` TEXT DEFAULT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_machine` (`machine_id`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Registro de Exemplo Inicial
INSERT INTO `maintenance_records` (`id`, `machine_id`, `fault_code`, `description`, `action_taken`, `parts_replaced`, `status`, `technician`, `date`, `duration_minutes`, `notes`, `created_at`) VALUES
('rec_init_01', 'ASB-70DPW-01', 'V2-P2', 'Inspeção preventiva e calibração de pressão de travamento do molde de injeção', 'Verificada a pressão de retenção do Main Ram em 14 MPa, ajustados transdutores e limpos filtros hidráulicos.', 'Troca de anel O-ring da linha piloto', 'concluida', 'Carlos Mecânica', CURDATE(), 45, 'Sistema operando com ciclo nominal de 8.5s sem alarmes', NOW());

-- --------------------------------------------------------
-- Tabela de Pendências Técnicas & Lembretes da Máquina
-- --------------------------------------------------------
DROP TABLE IF EXISTS `project_notes`;
CREATE TABLE `project_notes` (
  `id` VARCHAR(64) NOT NULL,
  `project_name` VARCHAR(128) NOT NULL,
  `title` VARCHAR(255) NOT NULL,
  `description` TEXT NOT NULL,
  `priority` ENUM('baixa', 'media', 'alta', 'urgente') NOT NULL DEFAULT 'media',
  `status` ENUM('pendente', 'em_andamento', 'concluido') NOT NULL DEFAULT 'pendente',
  `due_date` VARCHAR(64) DEFAULT NULL,
  `assigned_to` VARCHAR(128) DEFAULT NULL,
  `created_at` VARCHAR(64) NOT NULL,
  `completed_at` VARCHAR(64) DEFAULT NULL,
  PRIMARY KEY (`id`),
  INDEX `idx_priority` (`priority`),
  INDEX `idx_status` (`status`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Lembrete de Exemplo Inicial
INSERT INTO `project_notes` (`id`, `project_name`, `title`, `description`, `priority`, `status`, `due_date`, `assigned_to`, `created_at`, `completed_at`) VALUES
('note_init_01', 'NISSEI ASB-70DPW V4', 'Substituição periódica dos elementos filtrantes de óleo hidráulico', 'Substituir os filtros de retorno e de sucção do tanque de 600L (óleo ISO VG46) conforme horas de operação.', 'alta', 'pendente', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Equipe de Manutenção', NOW(), NULL);
