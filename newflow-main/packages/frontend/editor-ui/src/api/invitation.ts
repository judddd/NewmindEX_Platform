/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type { IInviteResponse, InvitableRoleName } from '@/Interface';
import type { CurrentUserResponse } from '@newflow/rest-api-client/api/users';
import type { IRestApiContext } from '@newflow/rest-api-client';
import type { IDataObject } from 'n8n-workflow';
import { makeRestApiRequest } from '@newflow/rest-api-client';

type AcceptInvitationParams = {
	inviterId: string;
	inviteeId: string;
	firstName: string;
	lastName: string;
	password: string;
};

export async function inviteUsers(
	context: IRestApiContext,
	params: Array<{ email: string; role: InvitableRoleName }>,
) {
	return await makeRestApiRequest<IInviteResponse[]>(context, 'POST', '/invitations', params);
}

export async function acceptInvitation(context: IRestApiContext, params: AcceptInvitationParams) {
	const { inviteeId, ...props } = params;
	return await makeRestApiRequest<CurrentUserResponse>(
		context,
		'POST',
		`/invitations/${params.inviteeId}/accept`,
		props as unknown as IDataObject,
	);
}
