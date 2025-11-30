/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import { Expose } from 'class-transformer';
import { IsOptional, IsString, IsBoolean } from 'class-validator';

import { BaseFilter } from './base.filter.dto';

export class UserFilter extends BaseFilter {
	@IsString()
	@IsOptional()
	@Expose()
	email?: string;

	@IsString()
	@IsOptional()
	@Expose()
	firstName?: string;

	@IsString()
	@IsOptional()
	@Expose()
	lastName?: string;

	@IsBoolean()
	@IsOptional()
	@Expose()
	isOwner?: boolean;

	static async fromString(rawFilter: string) {
		return await this.toFilter(rawFilter, UserFilter);
	}
}
