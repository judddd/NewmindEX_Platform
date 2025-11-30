/*
 * SPDX-License-Identifier: Apache-2.0
 */

/**
 * CMDB Configuration
 */
export interface CmdbConfig {
  domain: string;
  appId: string;
  appSecret: string;
  verifySsl: boolean;
  caCertPath?: string; // Optional path to custom CA certificate
}

/**
 * CMDB API Login Response
 */
export interface LoginResponse {
  Authorization?: string;
  token?: string;
  access_token?: string;
  [key: string]: any;
}

/**
 * Query Condition
 */
export interface QueryCondition {
  key: string;
  operation: string;
  value: string;
}

/**
 * Query View Request Payload
 */
export interface QueryViewPayload {
  pageSize: number;
  startPage: number;
  viewid: string;
  queryCondition: QueryCondition[];
}

/**
 * CMDB API Response Structure (based on filtered.json)
 */
export interface CmdbApiResponse<T = any> {
  success: boolean;
  message: string | null;
  statusCode: number;
  type: string | null;
  failData: any[];
  total: number;
  pages: number;
  startRow: number;
  pageSize: number;
  endRow: number;
  pageNum: number;
  content: T[];
}

/**
 * Asset Record (sample fields from filtered.json)
 */
export interface AssetRecord {
  _id: string;
  vHostName?: string;
  businessSystem?: string;
  businessSystem_show_value?: string;
  operatingSystem?: string;
  usage?: string;
  env?: string;
  env_show_value?: string;
  status?: string;
  status_show_value?: string;
  lifecycleState?: string;
  lifecycleState_show_value?: string;
  dataStatus?: string;
  dataStatus_show_value?: string;
  businessIp?: string;
  ipList?: string[];
  ipv6List?: string[];
  memory?: string;
  sumCpuCore?: string;
  diskSize?: string;
  info?: string;
  area?: string;
  area_show_value?: string;
  applicant?: string;
  applicant_show_value?: string;
  manager?: string;
  manager_show_value?: string;
  applicant_mail?: string;
  managerEmail?: string;
  Department?: string;
  createtime?: string;
  ciUpdateTime?: string;
  acquisitionTime?: string;
  expirationTime?: string;
  osType?: string;
  APPType?: string;
  APPType_show_value?: string;
  APPCategories?: string;
  esxiServer?: string;
  vHostCluster?: string;
  monitoring?: string | null;
  monitorStatus?: string | null;
  traceable?: string;
  traceable_show_value?: string;
  xdrRequired?: string;
  cmdb_platform_url?: string;
  [key: string]: any; // Allow additional fields
}

