# CLAUDE.md — 项目约定

> `GraveYard` · React 19 + Vite 7 + TypeScript（`client/`）/ Express 4 + Mongoose 8（`server/`）· 线上纪念墓园。
> **前后端均已部署上线并连通**：client 在 Vercel（`client/vercel.json` 做 SPA rewrite），server 独立部署。
> 这意味着线上 bug 是「正在坏着」，改动要在**线上**验证，数据模型改动需要迁移脚本。

## 文档地图：先读哪一份

| 文件 | 回答什么问题 | 什么时候读 |
|---|---|---|
| `docs/PROGRESS.md` | **现在在哪** | 每次开工先读，十几行 |
| `docs/ROADMAP.md` | **整体怎么走**（Phase 0–6） | 需要知道下一阶段是什么时 |
| `docs/TODO.md` | **具体做哪些事**（#1–#40，编号稳定） | 挑任务时 |
| `docs/PRD.md` | 产品规格 + **决策记录 D1–D11** | 做功能前，尤其要看决策记录 |
| `docs/DATA-MODEL.md` | 数据结构「现状 → 目标」（已定稿） | 碰数据模型时 |
| `docs/CONVENTIONS.md` | 资源/CSS/命名规范，主题收敛方案 | 碰样式和静态资源时 |
| `docs/REMINDERS.md` | 已知但暂不处理的问题（R#1–R#17） | 遇到奇怪现象时先查有没有记过 |
| `docs/plans/` | 某条任务的详细方案 | `/make-plan` 产出，`/exe` 消费 |
| `docs/claude/` | 会话记录（那天为什么这么改） | 回溯历史时 |

## 三条回写规则（活文档）

1. **重要设计决策** —— 尤其与 `docs/PRD.md`「决策记录」现有条目相反或对其修订的，**回写 PRD**，加一条 `Dn` 并注明日期与理由。数据结构变更同时回写 `docs/DATA-MODEL.md`。
2. **阶段顺序变化** —— 改了 Phase 顺序、拆分/合并/删减阶段、调整优先级，**回写 `docs/ROADMAP.md`** 的「变更记录」表。
3. **每次有代码改动的会话** —— 在 `docs/claude/` 追加一条记录（模板见 `docs/claude/README.md`），并刷新 `docs/PROGRESS.md`。

任务做完了在 `docs/TODO.md` 里标掉，但**别重排编号**——ROADMAP 和 PROGRESS 都按编号引用。

## 验证方式：没有测试框架，TypeScript 是安全网

本项目**不做 TDD**（目标是快速上线），`client/` 和 `server/` 都没有测试框架。因此验证靠：

```bash
npm --prefix client run lint     # eslint
npm --prefix client run build    # tsc -b + vite build ← 真正的安全网
npm run dev                      # 前后端一起起，实际点一遍
```

⚠️ **改数据模型字段名之前，先确认 `client/src/types.ts` 已经落地**（TODO #13）。
组件 props 现在大量是 `any`，重命名漏改**不会报错、构建照过**，到运行时才炸。有了类型，`tsc -b` 才能替你把漏网的全列出来。

⚠️ **macOS 文件名大小写不敏感**。静态资源改名后本地看不出问题，Linux 上直接 404 —— TODO #1 就是这么来的。碰资源文件名必须在线上验证。

## 常用命令

```bash
npm run dev          # 前后端一起（concurrently）
npm run dev:server   # 只起后端
npm run dev:client   # 只起前端
npm run seed         # 灌种子数据
```

后端默认 5001（5000 会被 macOS AirPlay 占用）。本地环境变量照 `client/.env.example` 和 `server/.env.example` 复制。

## 分支与提交

- 分支名 `<类型>/<短横线英文描述>`，如 `feat/offerings-ui`、`fix/asset-case`、`docs/prd-and-conventions`。
- **不主动 commit / push**，由用户决定什么时候提交、提交到哪个分支。
- 文档改动和代码改动尽量分开提交。

## 工作流

| Skill | 什么时候用 |
|---|---|
| `/make-plan` | 有个需求想先出方案。**只调研和写文档，绝不碰代码**，产出到 `docs/plans/` |
| `/exe` | 计划已批准，照着落地 |

小改动（一两行、思路明确）不用走计划，直接动手。
