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
