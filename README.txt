IELTS Phrase · 账号与云同步版

本版新增：
1. Supabase 邮箱+密码账号；昵称用于界面显示。
2. 登录后同步已掌握短语、测试历史、错题与错题复习进度。
3. 错题复习不再生成新的测试记录，而是更新原测试记录：已通过 / 待复习 / 全部完成。
4. 测试页新增明显的“← 返回首页”，测试中离开会先警告。
5. 普通历史默认保存 30 天；长期保留和手动删除仍可用。
6. PWA 新版本提示继续保留；离线时核心学习/测试仍可使用，云同步需要联网。

Supabase 首次配置：
- 在 Supabase > SQL Editor 运行 supabase-schema.sql 全部内容。
- Authentication > URL Configuration：Site URL 设为 https://gejiayu202509-maker.github.io/IELTS-Phrase/
- Redirect URLs 同样加入 https://gejiayu202509-maker.github.io/IELTS-Phrase/**
- 测试阶段如不想要求邮件确认，可在 Authentication 的 Email Provider 设置中关闭 Confirm email；正式使用建议配置邮件服务后再开启。

GitHub 更新：
git add .
git commit -m "Add Supabase accounts and linked wrong-answer review"
git push


本次更新：
- 未登录首次进入：全屏选择 登录 / 注册 / 游客模式。
- 游客模式仅本次浏览会话跳过入口；关闭后下次未登录会再次选择。
- 注册确认邮件固定回跳到 GitHub Pages 首页，避免 Supabase 默认地址导致 404。
- 邮箱验证成功后 Supabase 会在首页恢复登录会话，并显示“邮箱验证成功 · 已自动登录”。
- 原右上角账号入口仍保留，游客可随时转为登录/注册。

Supabase Authentication → URL Configuration 请确保：
Site URL: https://gejiayu202509-maker.github.io/IELTS-Phrase/
Redirect URLs 中也包含同一个完整地址。


v9 修复：历史记录删除采用本地 tombstone + 云端确认机制，避免同步竞争把已删除记录重新拉回。


v10: 修复云端历史记录删除后重新出现的问题；删除现在会二次验证 Supabase 中记录确实不存在。


v11: 调整短语默写判定：任何拼写、词形或用词错误都计错；斜杠空格与括号等格式差异不扣分；连字符差异不扣分但会提醒标准写法。


v12: 测试题量新增“自定义”；测试快捷键改为 Enter 提交/下一题，Shift+Enter 可在造句输入框换行。


v12 history hotfix:
- History save now waits for auth restoration before choosing the local account key.
- Signed-in saves use a durable pending queue and cloud/local merge, so refresh cannot silently erase a just-saved record.
- Enter submits; after grading, Enter advances to the next question. Shift+Enter inserts a newline in sentence mode.



v13 · Speaking Scenario Bank
- 首页新增“口语场景训练”入口。
- Expression Bank 共 50 个口语表达；每个表达 30 个场景，共 1500 个。
- 每轮优先随机抽取尚未完成的场景；30 个全部完成后进入随机复练。
- 场景进度保存在当前设备浏览器，并按当前登录用户区分；本版不新增 Supabase 表，因此不需要运行 SQL。
- 首页底部新增“最近更新”入口，后续更新可在此记录最近一次优化。
- 原 v12 写作测试、自定义题量、Enter 快捷键和历史记录保存修复全部保留。

GitHub 更新：
git add .
git commit -m "Add speaking expression and scenario training"
git push


V13.2 Speaking quality fix
- 1500 scenarios audited; Chinese scenario prompts + contextual English references.
- Removed generic one-answer-fits-all reference patterns and visible authoring instructions.
- Dialogue/voice/interview/announcement styles retained where natural.
- Per-expression reset is visible on cards, details, and practice page.
