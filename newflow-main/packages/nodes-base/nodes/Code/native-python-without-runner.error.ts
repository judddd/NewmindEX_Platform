import { UserError } from 'n8n-workflow';

export class NativePythonWithoutRunnerError extends UserError {
	constructor() {
		super('To use native Python, please use runners by setting `NEWFLOW_RUNNERS_ENABLED=true`.');
	}
}
