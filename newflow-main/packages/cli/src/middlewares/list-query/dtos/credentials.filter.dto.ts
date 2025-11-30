/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Expose } from 'class-transformer';
import { IsOptional, IsString } from 'class-validator';

import { BaseFilter } from './base.filter.dto';

export class CredentialsFilter extends BaseFilter {
	@IsString()
	@IsOptional()
	@Expose()
	name?: string;

	@IsString()
	@IsOptional()
	@Expose()
	type?: string;

	@IsString()
	@IsOptional()
	@Expose()
	projectId?: string;

	static async fromString(rawFilter: string) {
		return await this.toFilter(rawFilter, CredentialsFilter);
	}
}
