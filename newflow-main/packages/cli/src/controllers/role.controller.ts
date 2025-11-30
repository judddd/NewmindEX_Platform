/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import {
	CreateRoleDto,
	RoleGetQueryDto,
	RoleListQueryDto,
	UpdateRoleDto,
} from '@newflow/api-types';
import { LICENSE_FEATURES } from '@newflow/constants';
import { AuthenticatedRequest } from '@newflow/db';
import {
	Body,
	Delete,
	Get,
	GlobalScope,
	Licensed,
	Param,
	Patch,
	Post,
	Query,
	RestController,
} from '@newflow/decorators';
import { Role as RoleDTO } from '@newflow/permissions';

import { RoleService } from '@/services/role.service';

@RestController('/roles')
export class RoleController {
	constructor(private readonly roleService: RoleService) {}

	@Get('/')
	async getAllRoles(
		_req: AuthenticatedRequest,
		_res: Response,
		@Query query: RoleListQueryDto,
	): Promise<Record<string, RoleDTO[]>> {
		const allRoles = await this.roleService.getAllRoles(query.withUsageCount);
		return {
			global: allRoles.filter((r) => r.roleType === 'global'),
			project: allRoles.filter((r) => r.roleType === 'project'),
			credential: allRoles.filter((r) => r.roleType === 'credential'),
			workflow: allRoles.filter((r) => r.roleType === 'workflow'),
		};
	}

	@Get('/:slug')
	async getRoleBySlug(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('slug') slug: string,
		@Query query: RoleGetQueryDto,
	): Promise<RoleDTO> {
		return await this.roleService.getRole(slug, query.withUsageCount);
	}

	@Patch('/:slug')
	@GlobalScope('role:manage')
	@Licensed(LICENSE_FEATURES.CUSTOM_ROLES)
	async updateRole(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('slug') slug: string,
		@Body updateRole: UpdateRoleDto,
	): Promise<RoleDTO> {
		return await this.roleService.updateCustomRole(slug, updateRole);
	}

	@Delete('/:slug')
	@GlobalScope('role:manage')
	@Licensed(LICENSE_FEATURES.CUSTOM_ROLES)
	async deleteRole(
		_req: AuthenticatedRequest,
		_res: Response,
		@Param('slug') slug: string,
	): Promise<RoleDTO> {
		return await this.roleService.removeCustomRole(slug);
	}

	@Post('/')
	@GlobalScope('role:manage')
	@Licensed(LICENSE_FEATURES.CUSTOM_ROLES)
	async createRole(
		_req: AuthenticatedRequest,
		_res: Response,
		@Body createRole: CreateRoleDto,
	): Promise<RoleDTO> {
		return await this.roleService.createCustomRole(createRole);
	}
}
