import 'reflect-metadata';

// Disable task runners until we have fixed the "run test workflows" test
// to mock the Code Node execution
process.env.NEWFLOW_RUNNERS_ENABLED = 'false';
process.env.NEWFLOW_ENFORCE_SETTINGS_FILE_PERMISSIONS = 'false';
process.env.NEWFLOW_VERSION = '0.0.0-test';
