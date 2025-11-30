/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

export type ScenarioData = {
	/** Relative paths to the workflow files */
	workflowFiles?: string[];
	/** Relative paths to the credential files */
	credentialFiles?: string[];
};

/**
 * Configuration that defines the benchmark scenario
 */
export type ScenarioManifest = {
	/** The name of the scenario */
	name: string;
	/** A longer description of the scenario */
	description: string;
	/** Relative path to the k6 script */
	scriptPath: string;
	/** Data to import before running the scenario */
	scenarioData: ScenarioData;
};

/**
 * Scenario with additional metadata
 */
export type Scenario = ScenarioManifest & {
	id: string;
	/** Path to the directory containing the scenario */
	scenarioDirPath: string;
};
