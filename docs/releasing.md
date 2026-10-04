# 维护者发布指南

这个仓库通过 GitHub Actions 发布到 npm。普通提交和 Pull Request 会运行检查；发布正式 GitHub Release 后，才会构建、测试、打包并上传到 npm。

包名：`@yfwu2020/dsh-full-view`。发布工作流：[`publish.yml`](../.github/workflows/publish.yml)。

## 首次配置

在 npm 包设置中添加 GitHub Actions 的 Trusted Publisher：

| 项目 | 值 |
| --- | --- |
| GitHub 组织或用户名 | `yfwu2020` |
| 仓库 | `dsh-full-view` |
| 工作流文件名 | `publish.yml` |
| GitHub Environment | 留空 |
| 发布权限 | 允许直接发布到 npm（Allow publish） |

工作流使用 GitHub 提供的临时身份进行授权，不需要设置 `NPM_TOKEN`。npm 设置中的「仅暂存」模式不允许直接发布，需要明确允许发布。

有 npm 包写入权限、已开启双重验证的维护者，也可以使用支持 `npm trust` 的 npm 11 执行：

```sh
npm trust github @yfwu2020/dsh-full-view --file publish.yml --repo yfwu2020/dsh-full-view --allow-publish --yes
```

按照提示完成账号验证。详情见 [npm 官方 Trusted Publishing 文档](https://docs.npmjs.com/trusted-publishers/)。

## 发布下一个版本

1. 在 `main` 完成代码和 README 更新，确认 [检查通过](https://github.com/yfwu2020/dsh-full-view/actions/workflows/ci.yml)。
2. 更新版本号，提交并推送。以下示例会将 `0.1.1` 更新为 `0.1.2`，同时更新依赖锁文件：

   ```sh
   npm version patch --no-git-tag-version --ignore-scripts
   git add package.json package-lock.json README.md
   git commit -m "chore: prepare next release"
   git push origin main
   ```

3. 在 GitHub 创建 Release，选择这个提交，标签填写与 `package.json` 一致的 `vX.Y.Z`，例如 `v0.1.2`。填写更新说明，发布为正式版本。
4. 查看 [Publish to npm](https://github.com/yfwu2020/dsh-full-view/actions/workflows/publish.yml) 的结果。成功后，用户可以从 npm 安装新版本。

同一个 npm 版本不能重复发布。草稿、预发布版本，以及仅推送代码或标签，都不会上传 npm。标签、包版本或锁文件不一致时，流程会停止。

## 检查和故障处理

可以在发布工作流页面点击 **Run workflow** 做一次检查。手动运行只会构建、测试、打包和模拟发布，不上传 npm。

- 构建或测试失败：先修复并推送，再为正确提交创建版本。不要把失败的流程当作成功发布。
- 授权失败：核对 npm Trusted Publisher 中的仓库、工作流文件名和「允许发布」权限。
- 版本已存在：检查 npm 是否已收到该版本；如果需要变更内容，请递增版本号。
- 上传前失败且 npm 中没有该版本：修复原因后，可在对应 Release 的 Actions 记录中重新运行。不要移动已经公开的版本标签。

GitHub Release 的附件与 npm 上传是两件事；本流程会自动上传 npm，Release 附件仍可由维护者另行添加。
