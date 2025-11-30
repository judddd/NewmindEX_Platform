/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Logger } from '@newflow/backend-common';
import { Timed } from '@newflow/decorators';
import { Container } from '@newflow/di';

/**
 * Decorator that warns when database queries exceed a duration threshold.
 *
 * For options, see `@newflow/decorators/src/timed.ts`.
 *
 * @example
 * ```ts
 * @Service()
 * class UserRepository {
 *   @TimedQuery()
 *   async findUsers() {
 *     // will log warning if execution takes > 100ms
 *   }
 *
 *   @TimedQuery({ threshold: 50, logArgs: true })
 *   async findUserById(id: string) {
 *     // will log warning if execution takes >50ms, including args
 *   }
 * }
 * ```
 */
export const TimedQuery = Timed(Container.get(Logger), 'Slow database query');
