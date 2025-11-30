/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Tournament } from '@n8n/tournament';

import { PrototypeSanitizer } from './expression-sandboxing';

type Evaluator = (expr: string, data: unknown) => string | null | (() => unknown);
type ErrorHandler = (error: Error) => void;

const errorHandler: ErrorHandler = () => {};
const tournamentEvaluator = new Tournament(errorHandler, undefined, undefined, {
	before: [],
	after: [PrototypeSanitizer],
});
const evaluator: Evaluator = tournamentEvaluator.execute.bind(tournamentEvaluator);

export const setErrorHandler = (handler: ErrorHandler) => {
	tournamentEvaluator.errorHandler = handler;
};

export const evaluateExpression: Evaluator = (expr, data) => {
	return evaluator(expr, data);
};
