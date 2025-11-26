#!/usr/bin/env node

/**
 * 简单的连接测试脚本
 * 用法: node test-connection.js
 * 需要设置环境变量: CMDB_DOMAIN, CMDB_APP_ID, CMDB_APP_SECRET
 */

import { CmdbClient } from './dist/src/cmdb-client.js';

async function test() {
  const config = {
    domain: process.env.CMDB_DOMAIN || '',
    appId: process.env.CMDB_APP_ID || '',
    appSecret: process.env.CMDB_APP_SECRET || '',
    verifySsl: process.env.CMDB_VERIFY_SSL !== '0' && process.env.CMDB_VERIFY_SSL !== 'false',
  };

  console.log('配置信息:');
  console.log('- Domain:', config.domain);
  console.log('- App ID:', config.appId ? config.appId.substring(0, 4) + '***' : '未设置');
  console.log('- Verify SSL:', config.verifySsl);
  console.log('');

  if (!config.domain || !config.appId || !config.appSecret) {
    console.error('错误: 请设置环境变量 CMDB_DOMAIN, CMDB_APP_ID, CMDB_APP_SECRET');
    process.exit(1);
  }

  try {
    const client = new CmdbClient(config);
    
    console.log('正在测试连接...');
    const result = await client.testConnection();
    
    if (result.success) {
      console.log('✓ 连接成功!');
      console.log('Token 预览:', result.tokenPreview);
    } else {
      console.log('✗ 连接失败:', result.message);
      process.exit(1);
    }
  } catch (error) {
    console.error('✗ 测试失败:', error.message);
    process.exit(1);
  }
}

test();

