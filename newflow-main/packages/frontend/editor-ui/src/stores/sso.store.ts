/**
 * Modified by NewFlow Team
 * Original work: Copyright (c) 2019-2024, Jan Oberhauser (n8n)
 * Modified work: Copyright (c) 2024, NewFlow Team
 *
 * This file is part of NewFlow, a modified version of n8n.
 * License: Sustainable Use License (see LICENSE.md)
 */

// NewFlow: SSO features (SAML/OIDC/LDAP) removed - stub store for compatibility
import type { OidcConfigDto, SamlPreferences } from '@newflow/api-types';
import { computed, ref } from 'vue';
import { defineStore } from 'pinia';
import type { SamlPreferencesExtractedData } from '@newflow/rest-api-client/api/sso';
import type { LdapConfig } from '@newflow/rest-api-client/api/ldap';
import type { IDataObject } from 'n8n-workflow';
import { UserManagementAuthenticationMethod } from '@/Interface';

export const SupportedProtocols = {
	SAML: 'saml',
	OIDC: 'oidc',
} as const;

export type SupportedProtocolType = (typeof SupportedProtocols)[keyof typeof SupportedProtocols];

export const useSSOStore = defineStore('sso', () => {
	const authenticationMethod = ref<UserManagementAuthenticationMethod | undefined>(
		UserManagementAuthenticationMethod.Email,
	);
	const selectedAuthProtocol = ref<SupportedProtocolType | undefined>(undefined);

	// NewFlow: Always false - SSO features removed
	const showSsoLoginButton = computed(() => false);

	const getSSORedirectUrl = async (_existingRedirect?: string) => {
		throw new Error('SSO features have been removed');
	};

	// Initialize as no-op - accepts options for compatibility but does nothing
	const initialize = (_options: {
		authenticationMethod: UserManagementAuthenticationMethod;
		config: {
			ldap?: Pick<LdapConfig, 'loginLabel' | 'loginEnabled'>;
			saml?: Pick<SamlPreferences, 'loginLabel' | 'loginEnabled'>;
			oidc?: Pick<OidcConfigDto, 'loginEnabled'> & {
				loginUrl?: string;
				callbackUrl?: string;
			};
		};
		features: {
			saml: boolean;
			ldap: boolean;
			oidc: boolean;
		};
	}) => {
		// NewFlow: No-op - SSO disabled
		authenticationMethod.value = UserManagementAuthenticationMethod.Email;
	};

	/**
	 * SAML - Stub implementation
	 */
	const saml = ref<Pick<SamlPreferences, 'loginLabel' | 'loginEnabled'>>({
		loginLabel: '',
		loginEnabled: false,
	});

	const samlConfig = ref<SamlPreferences & SamlPreferencesExtractedData>();

	const isSamlLoginEnabled = computed({
		get: () => false,
		set: (_value: boolean) => {
			// No-op
		},
	});

	const isEnterpriseSamlEnabled = ref(false);

	const isDefaultAuthenticationSaml = computed(() => false);

	const toggleLoginEnabled = async (_enabled: boolean) => {
		throw new Error('SAML feature has been removed');
	};

	const getSamlMetadata = async () => {
		throw new Error('SAML feature has been removed');
	};

	const getSamlConfig = async () => {
		throw new Error('SAML feature has been removed');
	};

	const saveSamlConfig = async (_config: Partial<SamlPreferences>) => {
		throw new Error('SAML feature has been removed');
	};

	const testSamlConfig = async () => {
		throw new Error('SAML feature has been removed');
	};

	/**
	 * OIDC - Stub implementation
	 */
	const oidc = ref<
		Pick<OidcConfigDto, 'loginEnabled'> & {
			loginUrl?: string;
			callbackUrl?: string;
		}
	>({
		loginUrl: '',
		loginEnabled: false,
		callbackUrl: '',
	});

	const oidcConfig = ref<OidcConfigDto | undefined>();

	const isEnterpriseOidcEnabled = ref(false);

	const getOidcConfig = async () => {
		throw new Error('OIDC feature has been removed');
	};

	const saveOidcConfig = async (_config: OidcConfigDto) => {
		throw new Error('OIDC feature has been removed');
	};

	const isOidcLoginEnabled = computed({
		get: () => false,
		set: (_value: boolean) => {
			// No-op
		},
	});

	const isDefaultAuthenticationOidc = computed(() => false);

	/**
	 * LDAP - Stub implementation
	 */
	const ldap = ref<Pick<LdapConfig, 'loginLabel' | 'loginEnabled'>>({
		loginLabel: '',
		loginEnabled: false,
	});

	const isEnterpriseLdapEnabled = ref(false);

	const isLdapLoginEnabled = computed(() => false);

	const ldapLoginLabel = computed(() => '');

	const getLdapConfig = async () => {
		throw new Error('LDAP feature has been removed');
	};

	const getLdapSynchronizations = async (_pagination: { page: number }) => {
		throw new Error('LDAP feature has been removed');
	};

	const testLdapConnection = async () => {
		throw new Error('LDAP feature has been removed');
	};

	const updateLdapConfig = async (_ldapConfig: LdapConfig) => {
		throw new Error('LDAP feature has been removed');
	};

	const runLdapSync = async (_data: IDataObject) => {
		throw new Error('LDAP feature has been removed');
	};

	const initializeSelectedProtocol = () => {
		// No-op - SSO disabled
	};

	return {
		showSsoLoginButton,
		getSSORedirectUrl,
		initialize,
		selectedAuthProtocol,
		initializeSelectedProtocol,

		saml,
		samlConfig,
		isSamlLoginEnabled,
		isEnterpriseSamlEnabled,
		isDefaultAuthenticationSaml,
		getSamlMetadata,
		getSamlConfig,
		saveSamlConfig,
		testSamlConfig,

		oidc,
		oidcConfig,
		isOidcLoginEnabled,
		isEnterpriseOidcEnabled,
		isDefaultAuthenticationOidc,
		getOidcConfig,
		saveOidcConfig,

		ldap,
		isLdapLoginEnabled,
		isEnterpriseLdapEnabled,
		ldapLoginLabel,
		getLdapConfig,
		getLdapSynchronizations,
		testLdapConnection,
		updateLdapConfig,
		runLdapSync,
	};
});
