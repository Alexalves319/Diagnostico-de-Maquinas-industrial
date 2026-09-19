import { DiagnosticCode } from "../types";

export interface ElectricalSheet {
  page: number;
  name: string;
  category: "Potência" | "Acionamentos" | "Aquecimento" | "Controle" | "Sensoriamento" | "Atuação" | "Segurança" | "Interface";
  description: string;
  keyComponents?: string[];
}

export interface ElectricalFailureItem {
  id: string;
  symptom: string;
  probableBlocks: string;
  priorityCheck: string;
  correction: string;
  relatedCode: string;
}

export interface DiagnosticStep {
  stepNumber: number;
  title: string;
  action: string;
  criticalSafetyTip?: string;
}

export interface ElectricalComponentItem {
  family: string;
  items: string;
  quantity: string;
  functionDesc: string;
}

// 43 Pranchas do Desenho Elétrico (Capítulo 9 - 389A61809)
export const ELECTRICAL_SHEETS: ElectricalSheet[] = [
  { page: 1, name: "INDEX", category: "Interface", description: "Índice geral do projeto elétrico e simbologia técnica.", keyComponents: ["Index"] },
  { page: 2, name: "MAIN POWER (CE)", category: "Potência", description: "Entrada de rede trifásica 380V, disjuntor geral QF1 225A, SPD1, TC2 e condutor PE.", keyComponents: ["QF1 225A", "SPD1", "TC2 25kVA", "PE"] },
  { page: 3, name: "SERVO PUMP", category: "Acionamentos", description: "Alimentação e controle das servo-bombas P1, P2 e P3 (AMSE 22kW, 3x motores 20kW).", keyComponents: ["AMSE1", "AMSE2", "AMSE3", "QFM1-3"] },
  { page: 4, name: "BARREL HEATER", category: "Aquecimento", description: "Aquecimento do canhão de injeção (H11 a H33), fusíveis FU11-13 e relés SSR11-13.", keyComponents: ["H11-H33", "FU11-13", "SSR11-13"] },
  { page: 5, name: "HOT RUNNER BLOCK", category: "Aquecimento", description: "Zonas de aquecimento do bloco do hot runner (H211-H219), fusíveis FU21-24 e SSR21-24.", keyComponents: ["H211-H219", "FU21-24", "SSR21-24"] },
  { page: 6, name: "HR NOZZLE", category: "Aquecimento", description: "Aquecimento dos bicos do hot runner (H221-H254), fusíveis FU31-32 e SSRs correspondentes.", keyComponents: ["H221-H254", "FU31-32", "SSR31-40"] },
  { page: 7, name: "HEATING POT UP", category: "Aquecimento", description: "Zonas superiores do heating pot (resistências H51-H70 e controle SSR).", keyComponents: ["H51-H70", "SSR51-70"] },
  { page: 8, name: "HEATING POT DW", category: "Aquecimento", description: "Zonas inferiores do heating pot (resistências H71-H90 e acionamento SSR).", keyComponents: ["H71-H90", "SSR71-90"] },
  { page: 9, name: "HEATING CORE", category: "Aquecimento", description: "Aquecimento do heating core (resistências H401-H424 e SSR151-186).", keyComponents: ["H401-H424", "SSR151-186"] },
  { page: 10, name: "SERVO MOTOR", category: "Acionamentos", description: "Servomotor da mesa de rotação SM1, servo drive, encoder RE1, resistor R1 e filtro NF1.", keyComponents: ["SM1", "Servo Amp", "R1", "NF1"] },
  { page: 11, name: "DC POWER SUPPLY", category: "Potência", description: "Fontes de alimentação DC24V para válvulas (PSU1), controle e sensores (PSU3).", keyComponents: ["PSU1 24V", "PSU3 24V", "QF71-76"] },
  { page: 12, name: "CONTROL POWER (CE)", category: "Potência", description: "Distribuição de 200V e 100V do transformador TC1/TC2, disjuntores QF81, QF82, QF86.", keyComponents: ["TC1 1kVA/100V", "QF81 10A", "QF82 6A", "QF86 10A"] },
  { page: 13, name: "PUMP RUN", category: "Acionamentos", description: "Circuito de partida e relés de permissivo de funcionamento das bombas (KA300, KA301).", keyComponents: ["KA300", "KA301", "SQ68-70"] },
  { page: 14, name: "PANEL ARRANGE", category: "Interface", description: "Layout físico dos painéis elétricos, barramentos, canaletas e calhas.", keyComponents: ["Layout Painel", "Trilhos DIN"] },
  { page: 15, name: "SEQ.UNIT 0", category: "Controle", description: "Bastidor do PLC Yokogawa (CPU F3SP71-4S, Base F3BU13, Hub Ethernet, IP 192.168.0.2).", keyComponents: ["F3SP71-4S", "F3BU13-0NCN", "Moxa UC-7112+"] },
  { page: 16, name: "DI-64P (X002**) 1/2", category: "Controle", description: "Módulo de entradas digitais 1: seletores de operação manual/semi/auto (SA1M, SA1SA, SA2).", keyComponents: ["X00201-X00232", "SA1-SA13"] },
  { page: 17, name: "DI-64P (X002**) 2/2", category: "Controle", description: "Módulo de entradas digitais 2: permissivos mecânicos e fins de curso de processo.", keyComponents: ["X00233-X00264", "SQ93/94"] },
  { page: 18, name: "DO-64P (Y003**) 1/2", category: "Controle", description: "Módulo de saídas digitais 1: comandos gerais (Power On, Pump Run, Auto Start, Heater).", keyComponents: ["Y00301-Y00332", "Controle Geral"] },
  { page: 19, name: "DO-64P (Y003**) 2/2", category: "Controle", description: "Módulo de saídas digitais 2: atuações de sopro, gate cut, take out e condicionamento.", keyComponents: ["Y00333-Y00364", "Gate Cut", "Take Out"] },
  { page: 20, name: "DI-64P (X004**) 1/2", category: "Controle", description: "Módulo de alarmes e feedbacks críticos (SERVO ALM, CHILLER WATER, OIL LEVEL ALARM).", keyComponents: ["SERVO ALM", "CHILLER ALARM", "OIL LEVEL ALM"] },
  { page: 21, name: "DI-64P (X004**) 2/2", category: "Controle", description: "Módulo de segurança e proteção óptica (LIP CAV.PROTECT, FLASH DETECTOR, BROUT).", keyComponents: ["LIP CAV.PROTECT", "FLASH DETECTOR"] },
  { page: 22, name: "DO-64P (Y005**) 1/2", category: "Atuação", description: "Saídas de potência hidráulica/pneumática: fechamento/abertura do molde de sopro e lock pin.", keyComponents: ["Blow Mold CL/OP", "Lock Pin", "Blow Core"] },
  { page: 23, name: "DO-64P (Y005**) 2/2", category: "Atuação", description: "Saídas de potência: descida/subida de estiramento (Stretch UP/DW), ejeção (Eject).", keyComponents: ["Stretch UP/DW", "Eject UP/DW", "H.Pot"] },
  { page: 24, name: "DO-64P (Y006**) 1/2", category: "Atuação", description: "Saídas adicionais da estação de sopro e acionamento proporcional de válvulas.", keyComponents: ["Sopro Estágio 1", "Sopro Estágio 2"] },
  { page: 25, name: "DO-64P (Y006**) 2/2", category: "Atuação", description: "Comandos auxiliares de movimentação de mesas e pinças de transferência.", keyComponents: ["Pinças", "Mesas Auxiliares"] },
  { page: 26, name: "ANALOG IN/OUT", category: "Controle", description: "Placas analógicas: leitura de transdutores de pressão de injeção/sopro e régua linear POS1.", keyComponents: ["Transdutor P1-P3", "POS1 Injeção"] },
  { page: 27, name: "DI-32P (X009**)", category: "Controle", description: "Submódulo de entradas digitais complementares para periféricos integrados.", keyComponents: ["X00901-X00932"] },
  { page: 28, name: "DI-16P (X010**)", category: "Sensoriamento", description: "Entradas de sensoriamento de alta velocidade para indexação de mesa rotativa.", keyComponents: ["SQ11", "SQ13A/B", "SQ14A/B"] },
  { page: 29, name: "DI-16P (X013**)", category: "Sensoriamento", description: "Entradas digitais para monitoramento de pressostatos e fluxostatos auxiliares.", keyComponents: ["Pressostatos Auxiliares"] },
  { page: 30, name: "TEMP. MODULE", category: "Controle", description: "Módulos de temperatura Yokogawa NX-D25 (Thermo Unit) e comunicação com a CPU.", keyComponents: ["NX-D25", "Barramento de Termopares"] },
  { page: 31, name: "TH CONTROL 1 (BARREL, HR)", category: "Aquecimento", description: "Controle PID e leitura de termopares do canhão e bloco do hot runner.", keyComponents: ["ST11-13", "ST21-24"] },
  { page: 32, name: "TH CONTROL 2 (HR NOZZLE)", category: "Aquecimento", description: "Controle de temperatura das zonas de bicos individuais do molde PET.", keyComponents: ["ST31-50"] },
  { page: 33, name: "TH CONTROL 3 (HR NOZ, H.POT)", category: "Aquecimento", description: "Zonas mistas de temperatura para bicos estendidos e corpo do pot de condicionamento.", keyComponents: ["ST131-142", "ST51-70"] },
  { page: 34, name: "TH CONTROL 4 (H.POT)", category: "Aquecimento", description: "Controle de aquecimento térmico complementar do pot de condicionamento.", keyComponents: ["ST71-90"] },
  { page: 35, name: "TH CONTROL 5 (H.POT)", category: "Aquecimento", description: "Monitoramento e corte térmico da estação de pot e termopar do óleo hidráulico ST100.", keyComponents: ["ST100 (Óleo)", "Intertravamento Térmico"] },
  { page: 36, name: "SENSOR", category: "Sensoriamento", description: "Barramento e alimentação dos sensores de proximidade inductivos (SQ11 a SQ112).", keyComponents: ["SQ11-SQ112", "Alimentação 24V Sensores"] },
  { page: 37, name: "SOLENOID VALVE", category: "Atuação", description: "Distribuição e acionamento das válvulas solenóides hidráulicas V13 a V68.", keyComponents: ["V13", "V15", "V16", "V23", "V61-V68"] },
  { page: 38, name: "BLOW AIR VALVE", category: "Atuação", description: "Válvulas pneumáticas de sopro AV1 a AV58 (primário, secundário, descompressão e cooling).", keyComponents: ["AV7-1/2", "AV8-1/2", "AV10-1/2", "AV58-1/2"] },
  { page: 39, name: "SIGNAL LIGHT", category: "Interface", description: "Torre luminosa tricolor e sinalizadores sonoros (buzzer de alarme e advertência).", keyComponents: ["Torre de Sinal", "Buzzer", "QF62"] },
  { page: 40, name: "LS CONTROLLER", category: "Segurança", description: "Controlador de chaves de fim de curso e relé de segurança LSC1 para portas de acesso.", keyComponents: ["LSC1 Safety Relay", "SQ901-907 Portas", "SB1-SB3"] },
  { page: 41, name: "CONNECTOR ARRANGE 1", category: "Interface", description: "Mapa de conectores multipolares e réguas de bornes do painel principal (Parte 1).", keyComponents: ["Bornes X1-X10"] },
  { page: 42, name: "CONNECTOR ARRANGE 2", category: "Interface", description: "Mapa de conectores para cabos móveis da mesa rotativa e cabeçote injetor (Parte 2).", keyComponents: ["Conectores Harting Mesa"] },
  { page: 43, name: "CONNECTOR ARRANGE 3", category: "Interface", description: "Réguas de interligação de termopares e cabos blindados de servomotores (Parte 3).", keyComponents: ["Réguas Termopares"] },
];

// Matriz Rápida de Falhas Elétricas (Seção 10 do Mapa Elétrico)
export const ELECTRICAL_FAILURES_MATRIX: ElectricalFailureItem[] = [
  {
    id: "fail-power-blackout",
    symptom: "Máquina totalmente apagada",
    probableBlocks: "QF1 / Entrada de Rede / PE / Barramento de Controle",
    priorityCheck: "Estado do disjuntor geral QF1 (225 A) e tensão de alimentação de fábrica (380 V 3P); conferir fusíveis de controle.",
    correction: "Corrigir alimentação da fábrica/proteção; nunca aumentar a amperagem do disjuntor QF1. Testar isolamento antes de rearmar.",
    relatedCode: "QF1-POWER",
  },
  {
    id: "fail-pump-not-starting",
    symptom: "PLC liga, mas bomba não parte",
    probableBlocks: "SB / LSC1 / KA300-301 / QFM1-3 / AMSE",
    priorityCheck: "Cadeia de segurança das portas (SQ901-907), contatores KA300/KA301 (Pump Run), status dos servo drives AMSE e disjuntores QFM1-3.",
    correction: "Corrigir permissivo/alarme elétrico das portas ou relé de segurança LSC1 antes de tentar o reset.",
    relatedCode: "PUMP-RUN-FAIL",
  },
  {
    id: "fail-servo-alarm",
    symptom: "Servo P1 / P2 / P3 em alarme",
    probableBlocks: "AMSE + cabos + feedback de pressão + alimentação",
    priorityCheck: "Código de falha exibido no display do servo drive AMSE (1, 2 ou 3), estado do sinal Ready/Enable e integridade do transdutor de pressão.",
    correction: "Seguir diagnóstico do fabricante AMSE; verificar cabeamento de força e encoder; substituir drive somente após descartar travamento mecânico.",
    relatedCode: "SERVO-ALM",
  },
  {
    id: "fail-blow-mold-no-open",
    symptom: "Molde de sopro não abre",
    probableBlocks: "Y005 + Válvula V + Sensores SQ30/32/34/36 + Intertravamento de Segurança",
    priorityCheck: "Verificar se a saída Y005 do PLC aciona, checar posição dos sensores SQ de fim de curso e se há alarme de segurança ativo.",
    correction: "Corrigir sensor com leitura falsa, testar bobina da válvula solenoide correspondente; nunca forçar mecanicamente o molde travado.",
    relatedCode: "MOLD-OP-NOK",
  },
  {
    id: "fail-mold-close-no-confirm",
    symptom: "Molde fecha mas não confirma",
    probableBlocks: "SQ34 / SQ36 e cadeia de permissivos de segurança",
    priorityCheck: "Sinal do sensor de fechamento SQ34/SQ36 na entrada digital correspondente do PLC (DI-64P) e alinhamento mecânico do alvo.",
    correction: "Ajustar distância sensora ou substituir sensor de proximidade avariado; verificar integridade do chicote elétrico.",
    relatedCode: "MOLD-CL-NOK",
  },
  {
    id: "fail-heater-not-heating",
    symptom: "Aquecedor não esquenta",
    probableBlocks: "QF / FU / SSR / Resistência H / Termopar ST",
    priorityCheck: "Permissão de aquecimento no HMI, estado do fusível rápido ultrarrápido (FU11-FU32), LED de disparo do relé de estado sólido SSR e termopar.",
    correction: "Substituir fusível aberto, relé SSR danificado ou resistência com filamento rompido; conferir aterramento e isolamento.",
    relatedCode: "HEATER-FAIL",
  },
  {
    id: "fail-temp-divergence",
    symptom: "Temperatura muito diferente do real",
    probableBlocks: "Termopar ST / Thermo Unit NX-D25 / Cabos de Compensação",
    priorityCheck: "Tipo e fixação do termopar (ST11 a ST100), inversão de polaridade dos condutores de compensação ou falha no canal do módulo NX-D25.",
    correction: "Corrigir conexão/polaridade do termopar, substituir sensor com deriva e restaurar parâmetros térmicos originais no controlador.",
    relatedCode: "TEMP-DIFF",
  },
  {
    id: "fail-blow-no-air",
    symptom: "BLOW sem ar de sopro",
    probableBlocks: "DO Y00325-Y00328 / Placa Transistor / Válvula Pneumática AV",
    priorityCheck: "Saída lógica do PLC -> Placa transistorizada -> Fusível de proteção -> Bobina da válvula AV (AV7, AV8, AV10, AV58).",
    correction: "Corrigir canal do PLC, substituir fusível de proteção de 24V ou válvula piloto pneumática avariada.",
    relatedCode: "BLOW-AIR-FAIL",
  },
  {
    id: "fail-chiller-alarm",
    symptom: "Alarme CHILLER WATER",
    probableBlocks: "Entrada X004 / Circuito Auxiliar de Refrigeração",
    priorityCheck: "Sinal de retorno do termostato/fluxostato do chiller na entrada X004 do PLC e temperatura da água de resfriamento dos moldes.",
    correction: "Investigar circuito externo do chiller de água, checar vazão, pressão e bombas do circuito gelado antes de resetar.",
    relatedCode: "CHILLER-ALARM",
  },
  {
    id: "fail-oil-level-alarm",
    symptom: "Alarme OIL LEVEL ALARM",
    probableBlocks: "Entrada X004 / Bóia de Nível do Reservatório Hidráulico",
    priorityCheck: "Sinal elétrico da chave de nível de óleo na entrada X004 e inspeção visual do visor de nível no tanque principal.",
    correction: "Completar nível com óleo mineral ISO VG46 (nunca misturar óleos diferentes); investigar vazamentos antes de liberar.",
    relatedCode: "OIL-LEVEL-ALARM",
  },
  {
    id: "fail-flash-lip-protect",
    symptom: "Flash detector / Lip protection disparando",
    probableBlocks: "Sensores PHS / SQ + Amplificadores Ópticos / Laser",
    priorityCheck: "Alinhamento das barreiras laser PHS21/22, PHS31/32 e detectores SQ53/54; verificar poeira ou resíduos de PET nas lentes.",
    correction: "Limpar com ar limpo/pano macio, alinhar refletores ou substituir barreira laser conforme manual; JAMAIS desativar a proteção no programa.",
    relatedCode: "LIP-CAV-PROTECT",
  },
  {
    id: "fail-screen-no-comm",
    symptom: "Tela sem comunicação com a máquina",
    probableBlocks: "PLC F3SP71 / HUB Ethernet / Gateway Moxa UC-7112Plus / IHM Pro-face",
    priorityCheck: "Alimentação 24V do display e switch/hub; LEDs 'Link/Act' das portas de rede; conferir cabo LAN.",
    correction: "Restabelecer alimentação DC, testar cabos CAT5e blindados; manter rigorosamente os IPs padrão: PLC 192.168.0.2 e Display 192.168.0.3.",
    relatedCode: "PLC-COMM-FAIL",
  },
  {
    id: "fail-breaker-recurring-trip",
    symptom: "Disjuntor desarma repetidamente",
    probableBlocks: "QF / FU / Carga Elétrica / Fuga à Terra (GF1)",
    priorityCheck: "Identificar o ramo exato que desarmou (QF1 geral 225A, QF2 63A, QF3 100A ou disjuntores auxiliares de controle QF71-90).",
    correction: "Isolar circuito a jusante e testar isolamento de cabos e carcaças contra terra com megômetro por profissional qualificado.",
    relatedCode: "DISJ-TRIP",
  },
];

// 10 Etapas do Roteiro Seguro de Diagnóstico (Seção 11)
export const SAFE_DIAGNOSTIC_STEPS: DiagnosticStep[] = [
  {
    stepNumber: 1,
    title: "Segurança Absoluta (LOTO)",
    action: "Parar a máquina em ciclo seguro, desligar e bloquear com cadeado o disjuntor principal QF1. Confirmar com multímetro calibrado a ausência efetiva de tensão antes de abrir qualquer gabinete ou painel elétrico.",
    criticalSafetyTip: "PERIGO: O gabinete pode conter tensões de até ou acima de 400 V CA.",
  },
  {
    stepNumber: 2,
    title: "Registro Preciso no HMI",
    action: "Anotar o código de alarme exato exibido na tela Pro-face, o estágio do ciclo e qual unidade estava atuando no instante da falha (injeção, mesa, sopro ou ejeção).",
  },
  {
    stepNumber: 3,
    title: "Mapeamento PLC / I/O",
    action: "Consultar a prancha de I/O correspondente para determinar se a entrada do sensor muda de estado (0 para 1 no LED do módulo DI-64P) e se a saída do atuador recebe comando do PLC.",
  },
  {
    stepNumber: 4,
    title: "Inspeção Visual da Alimentação",
    action: "Com a máquina desenergizada, inspecionar visualmente disjuntores (QF), fusíveis (FU), conectores, sinais de superaquecimento, cabos frouxos ou deformados.",
  },
  {
    stepNumber: 5,
    title: "Cadeia de Segurança e E-Stops",
    action: "Verificar o status dos botões de emergência SB1-SB3, chaves de portas SQ901-907, safety relay LSC1 e intertravamentos de chave. NUNCA fazer jumper / ponte de segurança.",
    criticalSafetyTip: "A parada de emergência interrompe bombas e movimentos, mas o aquecimento de canhão e hot runner PERMANECE ligado.",
  },
  {
    stepNumber: 6,
    title: "Isolamento Atuador vs. Comando",
    action: "Se o PLC comanda a saída (LED ON), separar falha elétrica de mecânica/hidráulica/pneumática: testar alimentação 24V na bobina, fusível de proteção e conector antes de trocar a válvula.",
  },
  {
    stepNumber: 7,
    title: "Verificação e Ajuste de Sensores",
    action: "Checar distância sensora em relação ao alvo mecânico, alinhamento, integridade do cabo e fixação física. Para sensores parametrizados, consultar a tabela oficial do manual.",
  },
  {
    stepNumber: 8,
    title: "Diagnóstico dos Servos (P1 / P2 / P3 / SM1)",
    action: "Registrar o código numérico exibido no servo drive AMSE1-3 ou drive de rotação. Não alterar parâmetros internos de fábrica sem backup e suporte oficial.",
  },
  {
    stepNumber: 9,
    title: "Circuito Térmico & Resistências",
    action: "Comparar a temperatura lida com a temperatura real no bico/zona, inspecionar continuidade da resistência com ohmímetro, conferir acionamento do relé SSR e integridade do termopar ST.",
  },
  {
    stepNumber: 10,
    title: "Reteste Seguro & Liberação",
    action: "Reenergizar somente após concluir o reparo, retirar todas as ferramentas de dentro do painel e fechar todas as portas de proteção mecânicas e elétricas.",
  },
];

// Resumo dos Principais Componentes Elétricos (Seção 12)
export const ELECTRICAL_COMPONENTS_SUMMARY: ElectricalComponentItem[] = [
  { family: "Disjuntores & Proteção", items: "QF1 (225A), QF2 (63A), QF3 (100A), QF4, QF5, QF61/62, QF71-76, QF81-84, QF86, QF90", quantity: "18+ unidades", functionDesc: "Proteção contra sobrecorrente e curto-circuito na entrada de rede e ramais de distribuição interna." },
  { family: "Fusíveis Rápidos", items: "FU12/13, FU11R/11F, FU14, FU21-24, FU29, FU31/32, FU41-48, FU51-54, FUP", quantity: "Conforme zona", functionDesc: "Proteção ultrarrápida das zonas de aquecimento resistivo (canhão, bloco hot runner e bicos)." },
  { family: "Contatores Eletromagnéticos", items: "KM1/1A, KM6/7, KM11/12, KMM1-3A", quantity: "Vários", functionDesc: "Acionamento de motores de ventilação, partida das servo-bombas e circuitos de potência." },
  { family: "Relés de Estado Sólido (SSR)", items: "SSR11-14, SSR21-24, SSR29, SSR31-50 / 131-142, SSR51-90, SSR151-186", quantity: "Diversos por zona", functionDesc: "Controle modulado de potência (PWM/zero-crossing) para as zonas de aquecimento PET." },
  { family: "Controlador Lógico (PLC)", items: "CPU F3SP71-4S, Base F3BU13-0NCN, DI F3XD64-3F, DO F3YD64-1P, Thermo Unit NX-D25, Gateway Moxa UC-7112Plus, IHM Pro-face PFXGP4401TAD", quantity: "1 rack completo", functionDesc: "Controle sequencial, comunicação Ethernet (192.168.0.2 / 192.168.0.3) e aquisição de dados." },
  { family: "Fontes de Alimentação", items: "PSU1 DC 24V (Válvulas), PSU3 (Controle de servo-bombas)", quantity: "2 principais", functionDesc: "Converte 200V CA em 24V CC regulado para as bobinas de solenóides e lógica de controle." },
  { family: "Transformadores de Potência", items: "TC1 (Controle 1 kVA • 100V), TC2 (Potência 25 kVA • 380V -> 200V)", quantity: "2 unidades", functionDesc: "Adequação de tensão da rede trifásica da fábrica para o barramento interno de 200V/100V da máquina." },
  { family: "Sensores Industriais", items: "SQ (indutivos/chaves fim de curso), PHS (fotocélulas/laser), ST (termopares K/J), POS1 (régua linear injeção), RE1 (encoder rosca)", quantity: "Centenas", functionDesc: "Monitoramento de posição mecânica, fechamento de molde, temperatura e rotação." },
  { family: "Segurança & Parada", items: "LSC1 (Safety Controller), SQ901-907 (Chaves de porta), SQ61-66 (Intertravamento P), KA300/301 (Pump Run), SB1-SB3 (E-Stops)", quantity: "Conforme normas CE", functionDesc: "Circuito de segurança com categoria e redundância para proteção de operadores." },
  { family: "Motores & Acionamentos", items: "SM1 (Servomotor mesa rotativa), P1/P2/P3 (3x Servomotores de 20 kW para bombas hidráulicas ASE5)", quantity: "4 servomotores", functionDesc: "Acionamento de alta precisão e economia de energia para injeção, molde e sopro." },
  { family: "Ventilação & Refrigeração", items: "BM1 (Ventilador principal), FM1-6 (Ventiladores de gabinete e servo drivers)", quantity: "7 unidades", functionDesc: "Arrefecimento forçado de componentes eletrônicos nos armários de controle." },
];

// Novos códigos de diagnóstico elétrico derivados do Mapa Elétrico para INITIAL_CODES
export const ELECTRICAL_DIAGNOSTIC_CODES: DiagnosticCode[] = [
  {
    id: "code_nissei_qf1_power",
    code: "QF1-POWER",
    title: "Disjuntor Principal 225 A (Z00J08746) — Máquina Sem Alimentação Geral",
    causes: "Disjuntor principal QF1 desarmado por sobrecorrente instantânea, curto-circuito na entrada de rede ou disparo do relé de fuga à terra GF1. Ausência de tensão trifásica na entrada L1/L2/L3 (380 V 60 Hz).",
    resolution: "1. Procedimento seguro: DESLIGAR e bloquear (LOTO) a alimentação na subestação/quadro geral antes de qualquer teste interno.\n2. Confirmar com multímetro categoria III/IV a ausência de tensão no barramento.\n3. Testar a resistência de isolamento dos condutores de entrada e do primário do transformador TC2 (25 kVA).\n4. Inspecionar o protetor contra surtos SPD1 (Z10L01410) — se o indicador estiver vermelho/danificado, substituir.\n5. Somente rearmar o QF1 após a eliminação garantida do curto-circuito ou sobrecarga.",
    relatedFunctions: "Alimentação Elétrica Geral 380V, Proteção Contra Surtos SPD1 e Barramento Principal",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 2 e 12, Pág. 3 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_pump_run_fail",
    code: "PUMP-RUN-FAIL",
    title: "PLC Ligado mas Servo Bombas Não Partem — Permissivos KA300/301 e Portas",
    causes: "A lógica da máquina liga no display, mas ao pressionar 'PUMP START' as bombas não entram. Causas prováveis: cadeia de segurança interrompida (relé LSC1 aberto), chaves de portas de proteção SQ901 a SQ907 desalinhadas, intertravamento SQ68-70 da caixa da servo bomba aberto, disjuntores dos motores QFM1-3 disparados ou falha nos contatores KA300/KA301.",
    resolution: "1. Verificar no HMI se há mensagem de 'SAFETY GUARD OPEN' ou alarme de porta.\n2. Inspecionar os LEDs indicadores no controlador de segurança LSC1 (Prancha 40).\n3. Checar o alinhamento mecânico das chaves de segurança das portas de proteção (SQ901 a SQ907).\n4. Inspecionar as chaves SQ68, SQ69 e SQ70 na caixa do conjunto de servo-bombas.\n5. Verificar se os disjuntores de proteção dos servo-motores QFM1, QFM2 e QFM3 estão armados.\n6. Testar o sinal de comando da saída Y003 (Pump Run) para as bobinas dos relés KA300 e KA301 (Prancha 13).",
    relatedFunctions: "Permissivo de Segurança, Relés KA300/301, Chaves de Portas SQ901-907 e Disjuntores QFM",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 3, 13 e 40, Pág. 9 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_servo_alm",
    code: "SERVO-ALM",
    title: "Alarme Geral de Servo Acionamento (AMSE1, AMSE2, AMSE3 ou Rotação SM1)",
    causes: "Entrada digital X004 do PLC recebe sinal 'SERVO ALM'. Causas prováveis: alarme de sobrecorrente, sobretensão, sobretemperatura ou falha de encoder nos drivers YUKEN AMSE (22 kW) das bombas P1/P2/P3 ou no servo amplifier da mesa rotativa SM1. Resistência de frenagem R1 aberta ou filtro de ruído NF1 degradado.",
    resolution: "1. Consultar a tela do painel e verificar qual dos acionamentos está em alarme (AMSE1 = Injeção, AMSE2 = Molde, AMSE3 = Sopro, SM1 = Rotação da mesa).\n2. Ler o código de erro de dois dígitos exibido no display digital do próprio driver afetado.\n3. Checar o conector do cabo de encoder e cabo de potência do servomotor correspondente.\n4. Medir a resistência do elemento de frenagem regenerativa R1 (Prancha 10).\n5. Inspecionar os ventiladores de resfriamento FM1 a FM6 dos módulos eletrônicos.\n6. Verificar se não há sobrecarga mecânica na bomba ou na mesa antes de resetar o driver.",
    relatedFunctions: "Servo Drivers AMSE1/AMSE2/AMSE3, Servomotor SM1, Resistor R1 e Feedback X004",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 3, 10 e 20, Pág. 4 e 7)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_sm1_rotation",
    code: "SM1-ROTATION",
    title: "Servomotor da Mesa Rotativa (SM1) — Mesa Não Gira ou Erro de Posicionamento",
    causes: "Mesa rotativa não indexa entre as estações (Injeção, Condicionamento, Sopro, Ejeção). Causas prováveis: pino de trava (Lock Pin SQ13A/B, SQ14A/B) não recuou, desalinhamento do sensor de indexação SQ11, cabo do encoder RE1 com ruído ou danificado, ou servo driver da mesa em modo de falha.",
    resolution: "1. Verificar se a solenoide do Lock Pin (AV12/AV13, Y00548) atuou para destravar a mesa.\n2. Confirmar no PLC se as entradas dos sensores do pino de trava SQ13 e SQ14 confirmam recuo total.\n3. Inspecionar visualmente o sensor de proximidade indutivo SQ11 (rotação FW) e seu alvo mecânico.\n4. Checar integridade da fiação blindada do encoder e do servo amplificador (Prancha 10).\n5. Não forçar rotação manual sem garantir que todos os machos, machetes, bicos e pinças estejam completamente recuados.",
    relatedFunctions: "Indexação da Mesa Rotativa, Lock Pin SQ13/14, Sensor SQ11 e Servo Amp SM1",
    severity: "alta",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 10, 28 e 37, Pág. 4 e 8)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_chiller_alarm",
    code: "CHILLER-ALARM",
    title: "Alarme de Água de Refrigeração (CHILLER WATER ALARM) — Entrada X004",
    causes: "Sinal de retorno de falha na entrada X004 do PLC. Causas: vazão insuficiente de água gelada para as placas e machos de injeção/sopro, temperatura da água acima do limite de processo, pressostato de água desregulado ou chiller industrial desligado/em falha.",
    resolution: "1. Verificar no equipamento do chiller externo se as bombas de circulação estão operando com pressão nominal.\n2. Checar a temperatura no termômetro do circuito de água gelada (recomendado entre 8°C e 12°C dependendo do molde).\n3. Inspecionar os filtros de água na entrada da máquina contra entupimento por algas ou incrustações.\n4. Medir a continuidade do contato seco do alarme do chiller ligado à régua de bornes do painel.\n5. Confirmar se a entrada correspondente no módulo DI-64P muda de estado após a normalização.",
    relatedFunctions: "Refrigeração dos Moldes, Circuito de Água Gelada e Entrada X004",
    severity: "alta",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Prancha 20, Pág. 7 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_oil_level_alarm",
    code: "OIL-LEVEL-ALARM",
    title: "Alarme de Nível de Óleo Hidráulico — Entrada X004",
    causes: "A bóia eletromagnética do reservatório hidráulico central abriu o contato por nível insuficiente de fluido. Operação das servo-bombas é bloqueada para prevenir cavitação e destruição das bombas YUKEN ASE5.",
    resolution: "1. Inspecionar visualmente o visor de nível no tanque hidráulico da máquina.\n2. Verificar se há vazamento significativo em mangueiras, conexões de cilindros ou trocador de calor.\n3. Completar o nível do reservatório utilizando EXCLUSIVAMENTE óleo hidráulico mineral ISO VG46 antidesgaste novo e filtrado.\n4. Caso o nível esteja correto, inspecionar a chave bóia de nível e o chicote elétrico conectado à entrada X004 do PLC.\n5. Lembrar que a carcaça de cada bomba YUKEN ASE5 deve manter o pré-enchimento de 600 ml.",
    relatedFunctions: "Reservatório Hidráulico Central, Chave de Nível e Entrada X004",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 20 e 36, Pág. 7 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_lip_protect",
    code: "LIP-CAV-PROTECT",
    title: "Laser de Proteção de Cavidade do Lip / Drop Out (PHS21/22 e PHS31/32)",
    causes: "Disparo do alarme de segurança óptica no fechamento do molde ou ejeção de frascos. Causas: pré-forma ou frasco preso no lip mold ou na placa de extração, poeira ou névoa de óleo nas lentes dos sensores laser PHS21/22 ou refletores desalinhados.",
    resolution: "1. Inspecionar visualmente as cavidades do Lip Mold e retirar com ferramenta apropriada qualquer pedaço de PET preso.\n2. Limpar cuidadosamente as lentes dos sensores ópticos laser PHS21, PHS22, PHS31 e PHS32 com pano macio seco e sem fiapos.\n3. Verificar se o LED de recepção de sinal no amplificador do sensor confirma o alinhamento correto do feixe.\n4. NUNCA fazer jumper ou alterar a programação do PLC para ignorar a proteção de cavidade (risco de destruição mecânica do molde).",
    relatedFunctions: "Proteção de Cavidade Lip, Sensores Laser PHS21/22, Ejeção PHS31/32 e Entrada X004",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 21 e 36, Pág. 8 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_heater_fail",
    code: "HEATER-FAIL",
    title: "Falha Geral no Sistema de Aquecimento (Canhão, Hot Runner ou Bicos)",
    causes: "Uma ou mais zonas não aquecem, impedindo a partida automática da injeção ou dosagem. Causas: fusíveis rápidos de proteção abertos (FU11 a FU32), relé de estado sólido SSR queimado (aberto), filamento da resistência de aquecimento rompido ou termopar desconectado.",
    resolution: "1. Identificar na tela do HMI qual zona está com temperatura abaixo do setpoint (Canhão H11-H33, Cabeçote H41, Bico H51, Hot Runner H211-H254, Pot H51-H90 ou Core H401-H424).\n2. Desligar a energia e verificar com multímetro a continuidade dos fusíveis de proteção associados à zona (Pranchas 4 a 9).\n3. Inspecionar o relé SSR correspondente (verificar se o LED de comando acende mas a tensão não chaveia na carga).\n4. Medir a resistência ôhmica do elemento de aquecimento (valor padrão varia de acordo com a potência da cinta/cartucho).\n5. Substituir componentes danificados utilizando peças com as especificações originais da lista de peças elétricas.",
    relatedFunctions: "Aquecimento Canhão/Hot Runner, Fusíveis FU11-32, Relés SSR e Resistências H",
    severity: "alta",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 4 a 9 e 31 a 35, Pág. 5 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_temp_diff",
    code: "TEMP-DIFF",
    title: "Temperatura Divergente / Falha nos Termopares ST — Módulo NX-D25",
    causes: "Temperatura indicada na tela oscila bruscamente, indica temperatura ambiente ou dispara alarme de sobretemperatura. Causas: termopar ST com mau contato, rompimento interno do par metálico, fios de compensação invertidos (+ / -) ou falha no módulo conversor de temperatura Yokogawa NX-D25.",
    resolution: "1. Localizar o termopar da zona afetada (ST11-ST14 canhão, ST21-ST29 hot runner, ST31-ST50 bicos, ST100 óleo hidráulico).\n2. Inspecionar a régua de bornes de compensação na parte traseira da máquina (Prancha 43).\n3. Medir em milivolts o sinal do termopar ou testar continuidade com ohmímetro.\n4. Se a temperatura estiver indicando valor negativo ou caindo ao aquecer, inverter os condutores do termopar nos bornes (+ e - invertidos).\n5. Inspecionar os LEDs de diagnóstico da Thermo Unit NX-D25 no rack do sequenciador (Prancha 30).",
    relatedFunctions: "Termopares ST11-ST100, Módulo de Temperatura NX-D25 e Cabos de Compensação",
    severity: "media",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 30 a 35, Pág. 5, 8 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_blow_air_fail",
    code: "BLOW-AIR-FAIL",
    title: "Falha no Ar de Sopro (Sopro Primário / Secundário / Descompressão / Cooling)",
    causes: "Frascos não formam ou saem deformados por ausência de ar de sopro no molde. Causas: saídas do PLC Y00325-Y00328 inativas, queima do transistor na placa de acionamento, queima do fusível de 24V de válvulas pneumáticas, ou bobina das eletroválvulas AV7, AV8, AV10 ou AV58 inoperante.",
    resolution: "1. Verificar no manômetro de linha se a alimentação principal de ar de alta pressão (até 40 bar / 4,0 MPa para garrafas PET) está disponível.\n2. Inspecionar se o comando sai do PLC (saída Y00325 a Y00328) no momento exato do ciclo de sopro.\n3. Testar os fusíveis de 24V DC na placa transistorizada de blow air (Prancha 38).\n4. Testar individualmente as bobinas das válvulas dos canais A e B:\n   - AV7-1 / AV7-2: Sopro primário\n   - AV8-1 / AV8-2: Sopro secundário (alta pressão)\n   - AV10-1 / AV10-2: Descompressão\n   - AV58-1 / AV58-2: Cooling blow\n5. Se a bobina acionar mas não passar ar, desmontar o piloto da válvula com a linha despressurizada e inspecionar sede.",
    relatedFunctions: "Válvulas Pneumáticas de Sopro AV, Placa Transistorizada e Saídas Y003",
    severity: "alta",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 38 e 22, Pág. 10 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_plc_comm_fail",
    code: "PLC-COMM-FAIL",
    title: "Falha de Comunicação PLC / HMI (Display Pro-face PFXGP4401TAD)",
    causes: "A tela sensível ao toque exibe erro de comunicação ou fica congelada sem atualizar valores. Causas: perda de alimentação na fonte do display, switch Ethernet ou gateway Moxa UC-7112Plus travado, cabo de rede rompido ou conflito de endereçamento IP.",
    resolution: "1. Confirmar as fontes de alimentação DC24V da tela, do Hub de rede e do módulo de comunicação.\n2. Verificar se o cabo Ethernet CAT5e está firmemente encaixado na porta LAN da CPU F3SP71-4S e no display.\n3. Validar se os endereços IP estão configurados exatamente conforme o manual:\n   - PLC Yokogawa: 192.168.0.2\n   - Display Pro-face: 192.168.0.3\n4. Nunca alterar máscaras de rede ou portas de comunicação sem autorização técnica.\n5. Reiniciar o hub e o display elétrico com a máquina parada de forma segura.",
    relatedFunctions: "Rede Ethernet Interna, CPU F3SP71-4S, Display Pro-face e Hub Moxa",
    severity: "alta",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 15 e 12, Pág. 6 e 11)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
  {
    id: "code_nissei_estop_lsc",
    code: "ESTOP-LSC",
    title: "Parada de Emergência SB1-SB3 e Relé de Segurança LSC1 Ativados",
    causes: "Botão cogumelo de emergência SB1, SB2 ou SB3 pressionado, ou chave fim de curso de porta de segurança SQ901-907 aberta durante operação. O relé de segurança LSC1 corta a potência de motores, bombas e válvulas pneumáticas.",
    resolution: "1. Localizar e desarmar (girar para soltar) o botão de parada de emergência que foi acionado (SB1 no painel principal, SB2 na área de sopro ou SB3 na traseira).\n2. Fechar completamente todas as portas e proteções móveis de segurança.\n3. Pressionar o botão 'FAULT RESET' / 'SAFETY RESET' no painel de comando para rearmar o relé LSC1 (Prancha 40).\n4. Verificar se os LEDs de canal CH1 e CH2 no relé LSC1 acendem em verde contínuo.\n5. ATENÇÃO: O circuito de aquecimento das resistências H NÃO é cortado pela parada de emergência por segurança de processo, mas as bombas e movimentos hidráulicos sim.",
    relatedFunctions: "Botões de Emergência SB1-SB3, Controlador LSC1 e Chaves de Portas SQ901-907",
    severity: "critica",
    sourceReference: "Mapa Elétrico NISSEI ASB-70DPW V4 (Pranchas 40 e 13, Pág. 9 e 12)",
    createdAt: "2026-09-17T14:30:00.000Z",
    updatedAt: "2026-09-17T14:30:00.000Z",
  },
];
