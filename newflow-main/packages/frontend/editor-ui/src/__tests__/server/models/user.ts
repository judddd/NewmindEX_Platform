/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IUser } from '@newflow/rest-api-client/api/users';
import { Model } from 'miragejs';
import type { ModelDefinition } from 'miragejs/-types';

export const UserModel: ModelDefinition<IUser> = Model.extend({});
