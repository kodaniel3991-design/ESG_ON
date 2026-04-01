-- CreateTable
CREATE TABLE "commuting_work_days" (
    "id" SERIAL NOT NULL,
    "employee_id" VARCHAR(50) NOT NULL,
    "year" INTEGER NOT NULL,
    "month" INTEGER NOT NULL,
    "days" INTEGER NOT NULL DEFAULT 0,

    CONSTRAINT "commuting_work_days_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "commuting_work_days_employee_id_year_month_key" ON "commuting_work_days"("employee_id", "year", "month");

-- AddForeignKey
ALTER TABLE "commuting_work_days" ADD CONSTRAINT "commuting_work_days_employee_id_fkey" FOREIGN KEY ("employee_id") REFERENCES "employees"("id") ON DELETE CASCADE ON UPDATE CASCADE;
