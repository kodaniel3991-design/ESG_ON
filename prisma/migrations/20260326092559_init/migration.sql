-- CreateTable
CREATE TABLE "emission_facilities" (
    "id" TEXT NOT NULL,
    "scope" INTEGER NOT NULL,
    "facility_name" VARCHAR(200) NOT NULL,
    "fuel_type" VARCHAR(100),
    "energy_type" VARCHAR(100),
    "activity_type" VARCHAR(200),
    "unit" VARCHAR(50) NOT NULL,
    "data_method" VARCHAR(100) NOT NULL,
    "category_id" VARCHAR(50) NOT NULL DEFAULT 'fixed',
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emission_facilities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_data" (
    "id" SERIAL NOT NULL,
    "facility_id" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "activity_value" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_data_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_attachments" (
    "id" SERIAL NOT NULL,
    "facility_id" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "file_name" VARCHAR(500) NOT NULL,
    "file_type" VARCHAR(200) NOT NULL,
    "file_size" INTEGER NOT NULL,
    "file_data" BYTEA NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_attachments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_references" (
    "id" VARCHAR(50) NOT NULL,
    "scope" INTEGER NOT NULL,
    "category_id" VARCHAR(50) NOT NULL,
    "source_name" VARCHAR(200) NOT NULL,
    "fuel_type" VARCHAR(100),
    "energy_type" VARCHAR(100),
    "activity_type" VARCHAR(200),
    "unit" VARCHAR(50) NOT NULL,
    "emission_factor" DECIMAL(18,6) NOT NULL DEFAULT 0,
    "factor_source" VARCHAR(500),
    "status" VARCHAR(20) NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emission_references_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_factor_source" (
    "id" SERIAL NOT NULL,
    "source_code" VARCHAR(50) NOT NULL,
    "publisher" VARCHAR(200) NOT NULL,
    "document_name" VARCHAR(500) NOT NULL,
    "document_url" VARCHAR(1000),
    "country" VARCHAR(10) NOT NULL DEFAULT 'KR',
    "year" INTEGER NOT NULL,
    "version" VARCHAR(100),
    "notes" VARCHAR(1000),
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emission_factor_source_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "emission_factor_master" (
    "id" SERIAL NOT NULL,
    "factor_code" VARCHAR(50) NOT NULL,
    "scope" INTEGER NOT NULL,
    "category_code" VARCHAR(50),
    "fuel_code" VARCHAR(100),
    "source_type" VARCHAR(50),
    "country" VARCHAR(10) NOT NULL DEFAULT 'KR',
    "year" INTEGER NOT NULL,
    "source_name" VARCHAR(500) NOT NULL,
    "source_version" VARCHAR(100),
    "valid_from" DATE,
    "valid_to" DATE,
    "calculation_method" VARCHAR(100),
    "co2_factor" DECIMAL(20,10),
    "co2_factor_unit" VARCHAR(50),
    "ch4_factor" DECIMAL(20,10),
    "ch4_factor_unit" VARCHAR(50),
    "n2o_factor" DECIMAL(20,10),
    "n2o_factor_unit" VARCHAR(50),
    "ncv" DECIMAL(20,8),
    "ncv_unit" VARCHAR(50),
    "carbon_content_factor" DECIMAL(20,8),
    "oxidation_factor" DECIMAL(10,6) DEFAULT 1.0,
    "gwp_ch4" DECIMAL(10,4) DEFAULT 28.0,
    "gwp_n2o" DECIMAL(10,4) DEFAULT 265.0,
    "source_id" INTEGER,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "emission_factor_master_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organizations" (
    "id" SERIAL NOT NULL,
    "organization_name" VARCHAR(200) NOT NULL DEFAULT '조직',
    "address" VARCHAR(500) NOT NULL DEFAULT '',
    "address_detail" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "worksites" (
    "id" VARCHAR(50) NOT NULL,
    "organization_id" INTEGER NOT NULL,
    "name" VARCHAR(200) NOT NULL,
    "address" VARCHAR(500) NOT NULL DEFAULT '',
    "address_detail" VARCHAR(200),
    "is_default" BOOLEAN NOT NULL DEFAULT false,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "worksites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "employees" (
    "id" VARCHAR(50) NOT NULL,
    "worksite_id" VARCHAR(50),
    "department" VARCHAR(100),
    "team" VARCHAR(100),
    "sub_team" VARCHAR(100),
    "name" VARCHAR(100) NOT NULL,
    "employee_id" VARCHAR(50),
    "job_title" VARCHAR(100),
    "position" VARCHAR(100),
    "job_position" VARCHAR(100),
    "is_manager" BOOLEAN,
    "employment_status" VARCHAR(50),
    "employment_type" VARCHAR(50),
    "hire_date" DATE,
    "termination_date" DATE,
    "leave_start_date" DATE,
    "leave_end_date" DATE,
    "reference_date" DATE,
    "gender" VARCHAR(20),
    "birth_year" INTEGER,
    "nationality" VARCHAR(100),
    "is_foreigner" BOOLEAN,
    "is_disabled" BOOLEAN,
    "disability_type" VARCHAR(100),
    "commute_transport" VARCHAR(50),
    "fuel" VARCHAR(50),
    "work_address" VARCHAR(500),
    "address" VARCHAR(500),
    "address_detail" VARCHAR(200),
    "commute_distance_km" DECIMAL(10,3),
    "round_trip_distance_km" DECIMAL(10,2),
    "work_days_per_month" INTEGER,
    "monthly_commute_emission" DECIMAL(12,4),
    "data_source" VARCHAR(50),
    "evidence_file_id" VARCHAR(100),
    "memo" TEXT,
    "created_by" VARCHAR(100),
    "updated_by" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "employees_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_masters" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "unit" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "report_included" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_masters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_targets" (
    "id" VARCHAR(36) NOT NULL,
    "kpi_id" VARCHAR(36) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "target_value" DECIMAL(18,6) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_targets_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_performance" (
    "id" VARCHAR(36) NOT NULL,
    "kpi_id" VARCHAR(36) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "actual_value" DECIMAL(18,6) NOT NULL,
    "updated_by" VARCHAR(255),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_performance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_change_log" (
    "id" VARCHAR(36) NOT NULL,
    "kpi_id" VARCHAR(36) NOT NULL,
    "field" VARCHAR(100) NOT NULL,
    "old_value" TEXT,
    "new_value" TEXT,
    "changed_by" VARCHAR(255) NOT NULL,
    "changed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_change_log_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_metrics" (
    "id" VARCHAR(36) NOT NULL,
    "esg_domain" VARCHAR(50) NOT NULL,
    "category" VARCHAR(100) NOT NULL,
    "indicator_name" VARCHAR(255) NOT NULL,
    "value" DECIMAL(18,6),
    "unit" VARCHAR(50) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "source" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "esg_metrics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendors" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'invited',
    "tier" INTEGER,
    "category" VARCHAR(255),
    "risk_level" VARCHAR(50),
    "esg_score" DECIMAL(5,2),
    "invited_at" TIMESTAMP(3),
    "linked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendors_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_submissions" (
    "id" VARCHAR(36) NOT NULL,
    "vendor_id" VARCHAR(36) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'not_started',
    "scope3_categories_completed" INTEGER NOT NULL DEFAULT 0,
    "scope3_categories_total" INTEGER NOT NULL DEFAULT 0,
    "emissions_tco2e" DECIMAL(18,6),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_submissions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vendor_esg_scores" (
    "id" VARCHAR(36) NOT NULL,
    "vendor_id" VARCHAR(36) NOT NULL,
    "overall_score" DECIMAL(5,2),
    "environment_score" DECIMAL(5,2),
    "social_score" DECIMAL(5,2),
    "governance_score" DECIMAL(5,2),
    "risk_level" VARCHAR(50),
    "trend" VARCHAR(50),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "vendor_esg_scores_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "esg_reports" (
    "id" VARCHAR(36) NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "type" VARCHAR(50) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'draft',
    "framework" VARCHAR(50),
    "version" VARCHAR(50),
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "esg_reports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "compliance_items" (
    "id" VARCHAR(36) NOT NULL,
    "framework" VARCHAR(100) NOT NULL,
    "requirement" VARCHAR(255) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'non_compliant',
    "due_date" DATE,
    "last_checked" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "compliance_items_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kpi_disclosure_mappings" (
    "id" VARCHAR(36) NOT NULL,
    "kpi_code" VARCHAR(50) NOT NULL,
    "kpi_name" VARCHAR(255) NOT NULL,
    "kpi_category" VARCHAR(50) NOT NULL,
    "framework" VARCHAR(50) NOT NULL,
    "disclosure_code" VARCHAR(100) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'unlinked',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kpi_disclosure_mappings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "materiality_issues" (
    "id" VARCHAR(36) NOT NULL,
    "code" VARCHAR(50) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "dimension" VARCHAR(50) NOT NULL,
    "description" TEXT,
    "expert_score" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "benchmark_score" DECIMAL(3,2) NOT NULL DEFAULT 3.0,
    "kpi_linked_count" INTEGER NOT NULL DEFAULT 0,
    "kpi_connection_status" VARCHAR(50),
    "impact_score" DECIMAL(4,2),
    "stakeholder_score" DECIMAL(4,2),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "materiality_issues_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "reduction_projects" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "category" VARCHAR(50) NOT NULL,
    "scope" VARCHAR(50) NOT NULL,
    "owner" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'planning',
    "expected_reduction_mt" DECIMAL(18,6),
    "actual_reduction_mt" DECIMAL(18,6),
    "estimated_cost_m" DECIMAL(18,6),
    "start_date" DATE,
    "end_date" DATE,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "reduction_projects_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "roles" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" TEXT,
    "system_code" VARCHAR(100),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "roles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" VARCHAR(36) NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "department" VARCHAR(255),
    "job_title" VARCHAR(255),
    "role_id" VARCHAR(36),
    "status" VARCHAR(50) NOT NULL DEFAULT 'active',
    "last_login_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_validations" (
    "id" VARCHAR(36) NOT NULL,
    "scope" VARCHAR(50) NOT NULL,
    "category" VARCHAR(255) NOT NULL,
    "emission_source" VARCHAR(255) NOT NULL,
    "site" VARCHAR(255) NOT NULL,
    "period" VARCHAR(50) NOT NULL,
    "activity_amount" VARCHAR(255),
    "emissions" VARCHAR(255),
    "status" VARCHAR(50) NOT NULL DEFAULT 'submitted',
    "ai_verification" VARCHAR(50),
    "data_source" VARCHAR(100),
    "evidence_count" INTEGER NOT NULL DEFAULT 0,
    "submitted_by" VARCHAR(255),
    "submitted_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_validations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_approvals" (
    "id" VARCHAR(36) NOT NULL,
    "validation_id" VARCHAR(36) NOT NULL,
    "status" VARCHAR(50) NOT NULL DEFAULT 'pending_approval',
    "approver" VARCHAR(255),
    "comment" TEXT,
    "approved_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_approvals_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_departments" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_departments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_teams" (
    "id" VARCHAR(50) NOT NULL,
    "department_id" VARCHAR(50),
    "name" VARCHAR(100) NOT NULL,
    "leader_name" VARCHAR(100),
    "default_duty_name" VARCHAR(100),
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_teams_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_positions" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_positions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "org_duties" (
    "id" VARCHAR(50) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "sort_order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "org_duties_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "activity_data_facility_id_year_month_key" ON "activity_data"("facility_id", "year", "month");

-- CreateIndex
CREATE UNIQUE INDEX "emission_factor_source_source_code_key" ON "emission_factor_source"("source_code");

-- CreateIndex
CREATE UNIQUE INDEX "emission_factor_master_factor_code_key" ON "emission_factor_master"("factor_code");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_masters_code_key" ON "kpi_masters"("code");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_targets_kpi_id_period_key" ON "kpi_targets"("kpi_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "kpi_performance_kpi_id_period_key" ON "kpi_performance"("kpi_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "vendor_submissions_vendor_id_period_key" ON "vendor_submissions"("vendor_id", "period");

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- AddForeignKey
ALTER TABLE "activity_data" ADD CONSTRAINT "activity_data_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "emission_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_attachments" ADD CONSTRAINT "activity_attachments_facility_id_fkey" FOREIGN KEY ("facility_id") REFERENCES "emission_facilities"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "emission_factor_master" ADD CONSTRAINT "emission_factor_master_source_id_fkey" FOREIGN KEY ("source_id") REFERENCES "emission_factor_source"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "worksites" ADD CONSTRAINT "worksites_organization_id_fkey" FOREIGN KEY ("organization_id") REFERENCES "organizations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "employees" ADD CONSTRAINT "employees_worksite_id_fkey" FOREIGN KEY ("worksite_id") REFERENCES "worksites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_targets" ADD CONSTRAINT "kpi_targets_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_performance" ADD CONSTRAINT "kpi_performance_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kpi_change_log" ADD CONSTRAINT "kpi_change_log_kpi_id_fkey" FOREIGN KEY ("kpi_id") REFERENCES "kpi_masters"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_submissions" ADD CONSTRAINT "vendor_submissions_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vendor_esg_scores" ADD CONSTRAINT "vendor_esg_scores_vendor_id_fkey" FOREIGN KEY ("vendor_id") REFERENCES "vendors"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_role_id_fkey" FOREIGN KEY ("role_id") REFERENCES "roles"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "data_approvals" ADD CONSTRAINT "data_approvals_validation_id_fkey" FOREIGN KEY ("validation_id") REFERENCES "data_validations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "org_teams" ADD CONSTRAINT "org_teams_department_id_fkey" FOREIGN KEY ("department_id") REFERENCES "org_departments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
