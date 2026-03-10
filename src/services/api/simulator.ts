import type {
  ReductionScenario,
  SimulatorResult,
  ReductionOpportunity,
  ReductionProject,
  ReductionProgressKpi,
  ReductionScopeSummary,
} from "@/types";
import {
  mockReductionScenarios,
  mockSimulatorResult,
  mockReductionOpportunities,
  mockReductionProjects,
  mockReductionProgressKpis,
  mockReductionScopeSummary,
} from "@/lib/mock";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getReductionScenarios(): Promise<ReductionScenario[]> {
  await delay(250);
  return mockReductionScenarios;
}

export async function runSimulation(_scenarioId: string): Promise<SimulatorResult> {
  await delay(600);
  return mockSimulatorResult;
}

export async function getReductionOpportunities(): Promise<ReductionOpportunity[]> {
  await delay(200);
  return mockReductionOpportunities;
}

export async function getReductionProjects(): Promise<ReductionProject[]> {
  await delay(200);
  return mockReductionProjects;
}

export async function getReductionProgressKpis(): Promise<ReductionProgressKpi[]> {
  await delay(150);
  return mockReductionProgressKpis;
}

export async function getReductionScopeSummary(): Promise<ReductionScopeSummary[]> {
  await delay(150);
  return mockReductionScopeSummary;
}
