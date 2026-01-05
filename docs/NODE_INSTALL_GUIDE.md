# Node.js 22.12.0 安装指南

## 📋 安装策略

### 为什么要指定 Node.js 22.12.0？

1. **版本一致性**：确保所有部署环境使用相同的 Node.js 版本
2. **自带 Corepack**：Node.js 22.12.0 自带 Corepack，包含 pnpm 和 yarn
3. **避免版本冲突**：不同的 Node.js 版本可能导致包管理器行为不一致

### 安装包位置

```
installers/system/node-v22.12.0.pkg  (83MB)
```

## 🔧 安装逻辑

### 1. 检查现有版本

脚本会检查当前系统的 Node.js 版本：
- ✅ 如果是 `v22.12.0`，跳过安装
- ⚠️ 如果是其他版本（即使是 v22.x），也会提示并安装指定版本

### 2. 安装 Node.js 22.12.0

```bash
sudo installer -pkg installers/system/node-v22.12.0.pkg -target /
```

安装路径：
- 可执行文件：`/usr/local/bin/node`, `/usr/local/bin/npm`
- Corepack：`/usr/local/lib/node_modules/corepack/`

### 3. 启用 Corepack

```bash
sudo corepack enable
```

这会创建 pnpm 和 yarn 的符号链接，指向 Corepack 的 shims：
- `/usr/local/bin/pnpm` → Corepack 管理的 pnpm
- `/usr/local/bin/yarn` → Corepack 管理的 yarn

### 4. pnpm 激活

首次运行 `pnpm` 命令时，Corepack 会自动下载对应版本的 pnpm：
```bash
pnpm --version
# 首次运行会下载，之后直接使用
```

## 📦 NewFlow 安装流程

1. **检查 pnpm**：优先使用 Corepack 提供的 pnpm
2. **备用方案**：如果 Corepack 不可用，使用 `npm install -g pnpm@10.12.1`
3. **版本检查**：确保 pnpm >= 9.x

## ⚠️ 常见问题

### Q1: 已经有 Node.js v22.x，但不是 v22.12.0，怎么办？

**A**: 脚本会提示安装指定版本。如果确实需要保留现有版本，可以：
1. 跳过 Node.js 安装步骤
2. 手动确保 `corepack enable` 已执行
3. 确保 pnpm 可用

### Q2: 已经通过 npm 全局安装了 pnpm，如何切换到 Corepack？

**A**: 
```bash
# 1. 卸载 npm 全局的 pnpm
npm uninstall -g pnpm

# 2. 启用 Corepack
sudo corepack enable

# 3. 验证（首次会自动下载）
pnpm --version
```

### Q3: Corepack 启用失败怎么办？

**A**: 
```bash
# 手动启用（需要管理员权限）
sudo corepack enable

# 如果仍然失败，使用备用方案
npm install -g pnpm@10.12.1
```

### Q4: 如何验证 pnpm 是由 Corepack 管理的？

**A**: 
```bash
which pnpm
# 应该显示：/usr/local/bin/pnpm

ls -l /usr/local/bin/pnpm
# 应该显示是 corepack 的符号链接或 shim

# 或者检查 npm 全局包
npm list -g pnpm
# 应该显示：(empty) 或找不到
```

## 🎯 最佳实践

1. **全新安装**：使用 `install.sh`，让脚本自动处理所有步骤
2. **已有环境**：
   - 如果已有 Node.js 22.12.0 且 Corepack 已启用，无需重新安装
   - 如果 pnpm 由 npm 安装，建议切换到 Corepack
3. **版本锁定**：在 `package.json` 中指定 `"packageManager": "pnpm@10.12.1"` 以锁定版本

## 📝 参考

- Corepack 官方文档：https://nodejs.org/api/corepack.html
- pnpm 官方文档：https://pnpm.io/













