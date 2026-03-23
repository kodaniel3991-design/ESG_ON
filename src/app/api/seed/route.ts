import { NextResponse } from "next/server";
import { getPool, sql } from "@/lib/db";

/**
 * POST /api/seed
 * 모든 테이블에 데모/시드 데이터를 삽입합니다.
 * 이미 데이터가 있으면 건너뜁니다 (idempotent).
 */
export async function POST() {
  try {
    const pool = await getPool();
    const log: string[] = [];
    const year = 2025;

    // helper: NEWID() 를 SQL 에서 생성
    const uid = () => "NEWID()";

    // ──────────────────────────────────────────────
    // 1. 조직 (이미 db-init에서 기본 행 삽입됨, 주소만 업데이트)
    // ──────────────────────────────────────────────
    await pool.request().query(`
      UPDATE organizations SET
        organization_name = N'엔비오 주식회사',
        address = N'서울특별시 강남구 테헤란로 152',
        address_detail = N'강남파이낸스센터 20층'
      WHERE id = (SELECT TOP 1 id FROM organizations);
    `);
    log.push("organizations: updated");

    // 사업장
    const wsCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM worksites`);
    if (wsCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        DECLARE @oid INT = (SELECT TOP 1 id FROM organizations);
        INSERT INTO worksites (id, organization_id, name, address, is_default, sort_order) VALUES
          (NEWID(), @oid, N'서울 본사', N'서울 강남구 테헤란로 152', 1, 1),
          (NEWID(), @oid, N'안산 공장', N'경기도 안산시 단원구 산단로 100', 0, 2),
          (NEWID(), @oid, N'부산 물류센터', N'부산광역시 강서구 녹산산업로 50', 0, 3);
      `);
      log.push("worksites: 3 rows");
    }

    // ──────────────────────────────────────────────
    // 2. 배출 시설 + 활동량
    // ──────────────────────────────────────────────
    const facCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM emission_facilities`);
    if (facCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO emission_facilities (id, scope, facility_name, fuel_type, energy_type, activity_type, unit, data_method, category_id) VALUES
          ('FAC-S1-LNG-01',    1, N'본사 보일러 (LNG)',      'LNG',              NULL,          N'고정연소', 'Nm3',    N'계측기',     'fixed'),
          ('FAC-S1-DIESEL-01', 1, N'안산공장 발전기 (경유)',  'Diesel',           NULL,          N'고정연소', 'L',      N'구매전표',   'fixed'),
          ('FAC-S1-MOB-01',    1, N'법인차량 (경유)',         'Diesel',           NULL,          N'이동연소', 'L',      N'카드내역',   'mobile'),
          ('FAC-S1-MOB-02',    1, N'법인차량 (휘발유)',       'Gasoline',         NULL,          N'이동연소', 'L',      N'카드내역',   'mobile'),
          ('FAC-S2-ELEC-01',   2, N'서울본사 전력',          'Electricity',      'Electricity', N'전력사용', 'MWh',    N'전력청구서', 'electricity'),
          ('FAC-S2-ELEC-02',   2, N'안산공장 전력',          'Electricity',      'Electricity', N'전력사용', 'MWh',    N'전력청구서', 'electricity'),
          ('FAC-S2-STEAM-01',  2, N'본사 스팀',              'Steam',            'Steam',       N'열에너지', 'GJ',     N'열공급청구서','steam'),
          ('FAC-S3-STEEL-01',  3, N'강판 구매',              N'강판(철강)',        NULL,          N'구입상품', 'ton',    N'구매전표',   'u1'),
          ('FAC-S3-TRUCK-01',  3, N'화물 트럭 운송',         N'화물트럭(도로)',    NULL,          N'상류운송', N'ton·km', N'물류ERP',    'u4'),
          ('FAC-S3-FLIGHT-01', 3, N'임직원 출장(국내선)',     N'국내선 항공',       NULL,          N'출장',     'pkm',    N'출장시스템', 'u6');
      `);
      log.push("emission_facilities: 10 rows");

      // 월별 활동량 (1~12월)
      const actData: [string, number[]][] = [
        ["FAC-S1-LNG-01",    [12000, 11000, 9000, 6000, 3000, 1500, 1000, 1000, 2000, 5000, 9000, 12500]],
        ["FAC-S1-DIESEL-01", [800, 750, 700, 650, 600, 550, 500, 500, 600, 700, 800, 850]],
        ["FAC-S1-MOB-01",    [400, 380, 420, 400, 450, 430, 410, 400, 420, 440, 400, 380]],
        ["FAC-S1-MOB-02",    [300, 280, 310, 290, 330, 320, 300, 290, 310, 320, 300, 280]],
        ["FAC-S2-ELEC-01",   [120, 115, 110, 105, 130, 160, 180, 185, 150, 115, 110, 125]],
        ["FAC-S2-ELEC-02",   [450, 440, 430, 420, 460, 520, 560, 570, 500, 440, 430, 455]],
        ["FAC-S2-STEAM-01",  [300, 280, 220, 150, 80, 40, 30, 30, 60, 140, 240, 310]],
        ["FAC-S3-STEEL-01",  [50, 45, 55, 60, 50, 48, 52, 55, 50, 60, 55, 50]],
        ["FAC-S3-TRUCK-01",  [80000, 75000, 85000, 90000, 80000, 78000, 82000, 85000, 80000, 90000, 85000, 82000]],
        ["FAC-S3-FLIGHT-01", [15000, 12000, 18000, 20000, 16000, 14000, 10000, 8000, 17000, 19000, 16000, 13000]],
      ];

      // 한 번에 VALUES절로 삽입 (성능)
      const vals: string[] = [];
      for (const [fid, months] of actData) {
        for (let m = 0; m < 12; m++) {
          vals.push(`('${fid}', ${year}, ${m + 1}, ${months[m]})`);
        }
      }
      await pool.request().query(`
        INSERT INTO activity_data (facility_id, year, month, activity_value) VALUES ${vals.join(",\n")};
      `);
      log.push(`activity_data: ${vals.length} rows`);
    }

    // ──────────────────────────────────────────────
    // 3. KPI 마스터 + 목표 + 실적
    // ──────────────────────────────────────────────
    const kpiCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM kpi_masters`);
    if (kpiCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO kpi_masters (id, code, name, category, unit, report_included) VALUES
          (NEWID(), 'ENV-001', N'총 온실가스 배출량',     'environment', 'tCO2e',       1),
          (NEWID(), 'ENV-002', N'에너지 사용량',          'environment', 'TJ',          1),
          (NEWID(), 'ENV-003', N'재생에너지 비율',        'environment', '%',           1),
          (NEWID(), 'ENV-004', N'용수 사용량',            'environment', N'톤',          1),
          (NEWID(), 'ENV-005', N'폐기물 재활용률',        'environment', '%',           1),
          (NEWID(), 'SOC-001', N'여성 관리자 비율',       'social',      '%',           1),
          (NEWID(), 'SOC-002', N'산업재해율',             'social',      '%',           1),
          (NEWID(), 'SOC-003', N'임직원 교육시간',        'social',      N'시간/인',     1),
          (NEWID(), 'SOC-004', N'직원 이직률',            'social',      '%',           0),
          (NEWID(), 'GOV-001', N'이사회 독립성',          'governance',  '%',           1),
          (NEWID(), 'GOV-002', N'윤리경영 교육 이수율',   'governance',  '%',           1),
          (NEWID(), 'GOV-003', N'정보보안 사고건수',      'governance',  N'건',          1),
          (NEWID(), 'CAR-001', N'Scope 1 배출량',         'carbon',      'tCO2e',       1),
          (NEWID(), 'CAR-002', N'Scope 2 배출량',         'carbon',      'tCO2e',       1),
          (NEWID(), 'CAR-003', N'Scope 3 배출량',         'carbon',      'tCO2e',       1),
          (NEWID(), 'CAR-004', N'탄소 원단위',            'carbon',      N'tCO2e/억원', 1);
      `);
      log.push("kpi_masters: 16 rows");

      // 목표값 + 실적값 (code 기준으로 kpi_id 참조)
      const targetData: [string, number, number][] = [
        ["ENV-001", 850, 912], ["ENV-002", 45, 48.2], ["ENV-003", 15, 12.3],
        ["ENV-004", 50000, 47200], ["ENV-005", 85, 88],
        ["SOC-001", 30, 27.5], ["SOC-002", 0.5, 0.3], ["SOC-003", 40, 42], ["SOC-004", 8, 6.5],
        ["GOV-001", 50, 57], ["GOV-002", 95, 98], ["GOV-003", 0, 1],
        ["CAR-001", 200, 215], ["CAR-002", 550, 580], ["CAR-003", 100, 117], ["CAR-004", 3.5, 3.8],
      ];

      for (const [code, target, actual] of targetData) {
        const r = pool.request();
        r.input("code", code);
        r.input("period", `${year}`);
        r.input("target", sql.Decimal(18, 4), target);
        r.input("actual", sql.Decimal(18, 4), actual);
        await r.query(`
          DECLARE @kid NVARCHAR(36) = (SELECT id FROM kpi_masters WHERE code = @code);
          INSERT INTO kpi_targets (id, kpi_id, period, target_value) VALUES (NEWID(), @kid, @period, @target);
          INSERT INTO kpi_performance (id, kpi_id, period, actual_value) VALUES (NEWID(), @kid, @period, @actual);
        `);
      }
      log.push("kpi_targets + kpi_performance: seeded");
    }

    // ──────────────────────────────────────────────
    // 4. ESG 지표
    // ──────────────────────────────────────────────
    const esgCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM esg_metrics`);
    if (esgCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO esg_metrics (id, esg_domain, category, indicator_name, value, unit, period, status) VALUES
          (NEWID(), 'environment', N'기후변화', N'온실가스 배출량 (Scope 1+2)', 795,    'tCO2e',    '2025', 'verified'),
          (NEWID(), 'environment', N'기후변화', N'온실가스 배출량 (Scope 3)',    117,    'tCO2e',    '2025', 'estimated'),
          (NEWID(), 'environment', N'에너지',   N'총 에너지 사용량',            48.2,   'TJ',       '2025', 'verified'),
          (NEWID(), 'environment', N'에너지',   N'재생에너지 사용량',           5.9,    'TJ',       '2025', 'verified'),
          (NEWID(), 'environment', N'용수',     N'용수 취수량',                47200,  N'톤',       '2025', 'verified'),
          (NEWID(), 'environment', N'폐기물',   N'폐기물 발생량',              1250,   N'톤',       '2025', 'estimated'),
          (NEWID(), 'environment', N'폐기물',   N'폐기물 재활용량',            1100,   N'톤',       '2025', 'verified'),
          (NEWID(), 'social',      N'고용',     N'총 임직원 수',               320,    N'명',       '2025', 'verified'),
          (NEWID(), 'social',      N'고용',     N'여성 임직원 비율',           38,     '%',        '2025', 'verified'),
          (NEWID(), 'social',      N'고용',     N'여성 관리자 비율',           27.5,   '%',        '2025', 'verified'),
          (NEWID(), 'social',      N'안전보건', N'산업재해율',                 0.3,    '%',        '2025', 'verified'),
          (NEWID(), 'social',      N'안전보건', N'안전 교육시간',              24,     N'시간/인',  '2025', 'pending'),
          (NEWID(), 'social',      N'인적자본', N'직원 교육시간',              42,     N'시간/인',  '2025', 'verified'),
          (NEWID(), 'social',      N'인적자본', N'직원 이직률',               6.5,    '%',        '2025', 'verified'),
          (NEWID(), 'governance',  N'이사회',   N'사외이사 비율',             57,     '%',        '2025', 'verified'),
          (NEWID(), 'governance',  N'이사회',   N'이사회 개최 횟수',         12,     N'회',       '2025', 'verified'),
          (NEWID(), 'governance',  N'윤리경영', N'윤리교육 이수율',          98,     '%',        '2025', 'verified'),
          (NEWID(), 'governance',  N'윤리경영', N'내부고발 접수건수',        2,      N'건',       '2025', 'pending'),
          (NEWID(), 'governance',  N'정보보안', N'정보보안 사고건수',        1,      N'건',       '2025', 'verified'),
          (NEWID(), 'governance',  N'정보보안', N'개인정보 교육 이수율',    97,     '%',        '2025', 'verified');
      `);
      log.push("esg_metrics: 20 rows");
    }

    // ──────────────────────────────────────────────
    // 5. 협력사
    // ──────────────────────────────────────────────
    const vendorCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM vendors`);
    if (vendorCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO vendors (id, name, email, status, tier, category, risk_level, esg_score) VALUES
          (NEWID(), N'한국철강(주)',  'esg@korsteel.co.kr',    'active',  1, N'원자재',   'low',     82),
          (NEWID(), N'세진물류',      'admin@sejin.kr',        'active',  1, N'물류',     'medium',  68),
          (NEWID(), N'그린패키징',    'info@greenpack.co.kr',  'active',  2, N'포장재',   'low',     91),
          (NEWID(), N'대한화학',      'esg@daehan.kr',         'active',  1, N'화학소재', 'high',    45),
          (NEWID(), N'에코에너지',    'contact@ecoeng.kr',     'active',  2, N'에너지',   'low',     88),
          (NEWID(), N'신라전자',      'scm@shilla.co.kr',      'invited', 1, N'전자부품', 'medium',  72),
          (NEWID(), N'부산목재',      'info@bsmokjae.kr',      'pending', 3, N'원자재',   'medium',  60),
          (NEWID(), N'제이텍',        'admin@jtech.co.kr',     'active',  2, N'IT서비스', 'low',     85);
      `);
      log.push("vendors: 8 rows");

      // 벤더 ESG 점수
      await pool.request().query(`
        INSERT INTO vendor_esg_scores (id, vendor_id, overall_score, environment_score, social_score, governance_score, risk_level, trend)
        SELECT NEWID(), v.id, v.esg_score,
               v.esg_score + ABS(CHECKSUM(NEWID())) % 10 - 5,
               v.esg_score + ABS(CHECKSUM(NEWID())) % 10 - 5,
               v.esg_score + ABS(CHECKSUM(NEWID())) % 10 - 5,
               v.risk_level,
               CASE WHEN ABS(CHECKSUM(NEWID())) % 2 = 0 THEN 'up' ELSE 'stable' END
        FROM vendors v WHERE v.status = 'active';
      `);
      log.push("vendor_esg_scores: seeded");
    }

    // ──────────────────────────────────────────────
    // 6. 보고서 / 컴플라이언스
    // ──────────────────────────────────────────────
    const rptCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM esg_reports`);
    if (rptCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO esg_reports (id, title, type, period, status, framework) VALUES
          (NEWID(), N'2025 ESG 연간보고서',     'annual',    '2025',    'draft',     'ESG'),
          (NEWID(), N'2025 CDP 기후변화 응답',   'cdp',       '2025',    'draft',     'ESG'),
          (NEWID(), N'2025 Q1 분기 보고서',      'quarterly', '2025-Q1', 'published', 'K-ESG'),
          (NEWID(), N'2024 ESG 연간보고서',     'annual',    '2024',    'published', 'GRI');
      `);
      log.push("esg_reports: 4 rows");
    }

    const compCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM compliance_items`);
    if (compCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO compliance_items (id, framework, requirement, status, due_date, last_checked) VALUES
          (NEWID(), N'온실가스 배출권거래제', N'배출량 명세서 제출',   'compliant',      '2025-03-31', GETDATE()),
          (NEWID(), N'K-ESG 가이드라인',     N'ESG 정보공개',        'partial',        '2025-06-30', GETDATE()),
          (NEWID(), N'EU CSRD',              N'지속가능성 보고 준비', 'non_compliant',  '2026-01-01', NULL),
          (NEWID(), N'ISSB S2',              N'기후관련 재무공시',   'partial',        '2025-12-31', GETDATE()),
          (NEWID(), N'GRI Standards 2021',   N'GRI 보고서 발행',    'compliant',      '2025-04-30', GETDATE());
      `);
      log.push("compliance_items: 5 rows");
    }

    // ──────────────────────────────────────────────
    // 7. 감축 프로젝트
    // ──────────────────────────────────────────────
    const redCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM reduction_projects`);
    if (redCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO reduction_projects (id, name, category, scope, status, expected_reduction_mt, actual_reduction_mt, estimated_cost_m) VALUES
          (NEWID(), N'태양광 발전 설치 (안산공장)', 'energy',        'scope2', 'in_progress', 120.0, 45.0, 8.5),
          (NEWID(), N'전기차 전환 (법인차량)',       'fleet',         'scope1', 'planning',     35.0,  0.0,  3.2),
          (NEWID(), N'보일러 고효율화',             'energy',        'scope1', 'in_progress', 50.0,  22.0, 2.0),
          (NEWID(), N'협력사 ESG 역량 강화',        'supply_chain',  'scope3', 'in_progress', 80.0,  15.0, 1.5),
          (NEWID(), N'스마트 에너지 모니터링',       'energy',        'scope2', 'completed',   30.0,  32.0, 1.0);
      `);
      log.push("reduction_projects: 5 rows");
    }

    // ──────────────────────────────────────────────
    // 8. 중요성 평가
    // ──────────────────────────────────────────────
    const matCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM materiality_issues`);
    if (matCheck.recordset[0].cnt === 0) {
      // expert_score/benchmark_score: DECIMAL(3,2) → 1.00~5.00 스케일
      // impact_score/stakeholder_score: DECIMAL(4,2) → max 99.99
      await pool.request().query(`
        INSERT INTO materiality_issues (id, code, name, dimension, expert_score, benchmark_score, kpi_linked_count, impact_score, stakeholder_score) VALUES
          (NEWID(), N'MAT-01', N'기후변화 대응',   N'environment', 4.60, 4.40, 5, 95.0, 90.0),
          (NEWID(), N'MAT-02', N'에너지 관리',     N'environment', 4.40, 4.25, 3, 88.0, 82.0),
          (NEWID(), N'MAT-03', N'폐기물 관리',     N'environment', 3.75, 3.60, 2, 78.0, 70.0),
          (NEWID(), N'MAT-04', N'산업안전보건',     N'social',      4.25, 4.00, 2, 90.0, 85.0),
          (NEWID(), N'MAT-05', N'인적자본 개발',   N'social',      3.90, 3.75, 3, 80.0, 76.0),
          (NEWID(), N'MAT-06', N'공급망 ESG 관리', N'social',      4.10, 3.90, 2, 85.0, 80.0),
          (NEWID(), N'MAT-07', N'이사회 독립성',   N'governance',  4.00, 4.10, 1, 82.0, 78.0),
          (NEWID(), N'MAT-08', N'윤리경영·반부패', N'governance',  3.85, 3.70, 2, 80.0, 75.0),
          (NEWID(), N'MAT-09', N'정보보안',         N'governance',  3.65, 3.50, 1, 75.0, 72.0);
      `);
      log.push("materiality_issues: 9 rows");
    }

    // ──────────────────────────────────────────────
    // 9. 역할 / 사용자
    // ──────────────────────────────────────────────
    const roleCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM roles`);
    if (roleCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO roles (id, name, description, system_code) VALUES
          (NEWID(), N'관리자',     N'시스템 전체 관리 권한',       'admin'),
          (NEWID(), N'ESG 담당자', N'ESG 데이터 입력 및 관리',    'esg_manager'),
          (NEWID(), N'경영진',     N'대시보드 조회 및 보고서 승인', 'executive'),
          (NEWID(), N'협력사',     N'공급망 포탈 접근',            'vendor');
      `);
      log.push("roles: 4 rows");
    }

    const userCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM users`);
    if (userCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO users (id, name, email, department, job_title, role_id, status) VALUES
          (NEWID(), N'김철수', 'admin@envio.kr',   N'ESG경영팀',  N'팀장',  (SELECT TOP 1 id FROM roles WHERE system_code='admin'),       'active'),
          (NEWID(), N'이영희', 'yhlee@envio.kr',   N'ESG경영팀',  N'매니저',(SELECT TOP 1 id FROM roles WHERE system_code='esg_manager'), 'active'),
          (NEWID(), N'박지훈', 'jhpark@envio.kr',  N'경영기획실', N'상무',  (SELECT TOP 1 id FROM roles WHERE system_code='executive'),   'active');
      `);
      log.push("users: 3 rows");
    }

    // ──────────────────────────────────────────────
    // 10. 직원 (통근 데이터)
    // ──────────────────────────────────────────────
    const empCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM employees`);
    if (empCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        DECLARE @wsid NVARCHAR(50) = (SELECT TOP 1 id FROM worksites WHERE is_default = 1);
        IF @wsid IS NOT NULL
        INSERT INTO employees (worksite_id, department, name, job_title, employee_id, commute_transport, fuel, commute_distance_km) VALUES
          (@wsid, N'ESG경영팀',  N'김철수', N'팀장',  'E001', 'car',    'gasoline', 25),
          (@wsid, N'ESG경영팀',  N'이영희', N'매니저', 'E002', 'public', NULL,       18),
          (@wsid, N'생산부',     N'최민석', N'부장',  'E003', 'car',    'diesel',   32),
          (@wsid, N'생산부',     N'한소영', N'대리',  'E004', 'public', NULL,       22),
          (@wsid, N'경영기획실', N'박지훈', N'상무',  'E005', 'car',    'gasoline', 15),
          (@wsid, N'물류팀',     N'정우진', N'과장',  'E006', 'ev',     'ev',       28);
      `);
      log.push("employees: 6 rows");
    }

    // ──────────────────────────────────────────────
    // 11. KPI 공시프레임워크 매핑
    // ──────────────────────────────────────────────
    const discCheck = await pool.request().query(`SELECT COUNT(*) AS cnt FROM kpi_disclosure_mappings`);
    if (discCheck.recordset[0].cnt === 0) {
      await pool.request().query(`
        INSERT INTO kpi_disclosure_mappings (id, kpi_code, kpi_name, kpi_category, framework, disclosure_code, status)
        SELECT NEWID(), m.code, m.name, m.category, d.framework, d.disclosure_code, 'linked'
        FROM (VALUES
          ('ENV-001', 'GRI',  'GRI 305-1'),
          ('ENV-001', 'ISSB', 'IFRS S2 29(a)'),
          ('ENV-002', 'GRI',  'GRI 302-1'),
          ('ENV-003', 'GRI',  'GRI 302-1'),
          ('ENV-004', 'GRI',  'GRI 303-3'),
          ('SOC-001', 'GRI',  'GRI 405-1'),
          ('SOC-002', 'GRI',  'GRI 403-9'),
          ('GOV-001', 'K-ESG','G-1-1'),
          ('CAR-001', 'ISSB', 'IFRS S2 29(a)(i)'),
          ('CAR-002', 'ISSB', 'IFRS S2 29(a)(ii)'),
          ('CAR-003', 'ISSB', 'IFRS S2 29(a)(vi)')
        ) AS d(kpi_code, framework, disclosure_code)
        JOIN kpi_masters m ON m.code = d.kpi_code;
      `);
      log.push("kpi_disclosure_mappings: 11 rows");
    }

    return NextResponse.json({
      success: true,
      message: "Seed data created",
      details: log,
    });
  } catch (err: any) {
    console.error("[POST /api/seed]", err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
