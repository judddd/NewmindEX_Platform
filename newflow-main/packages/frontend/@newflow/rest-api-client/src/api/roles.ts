import type { AllRolesMap } from '@newflow/permissions';

import type { IRestApiContext } from '../types';
import { makeRestApiRequest } from '../utils';

export const getRoles = async (context: IRestApiContext): Promise<AllRolesMap> => {
	return await makeRestApiRequest(context, 'GET', '/roles');
};
