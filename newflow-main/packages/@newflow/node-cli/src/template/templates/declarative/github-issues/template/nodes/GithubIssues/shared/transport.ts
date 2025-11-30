/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

import type {
	IHookFunctions,
	IExecuteFunctions,
	IExecuteSingleFunctions,
	ILoadOptionsFunctions,
	IHttpRequestMethods,
	IDataObject,
	IHttpRequestOptions,
} from 'n8n-workflow';

export async function githubApiRequest(
	this: IHookFunctions | IExecuteFunctions | IExecuteSingleFunctions | ILoadOptionsFunctions,
	method: IHttpRequestMethods,
	resource: string,
	qs: IDataObject = {},
	body: IDataObject | undefined = undefined,
) {
	const authenticationMethod = this.getNodeParameter('authentication', 0);

	const options: IHttpRequestOptions = {
		method: method,
		qs,
		body,
		url: `https://api.github.com${resource}`,
		json: true,
	};

	const credentialType =
		authenticationMethod === 'accessToken' ? 'githubIssuesApi' : 'githubIssuesOAuth2Api';

	return this.helpers.httpRequestWithAuthentication.call(this, credentialType, options);
}
