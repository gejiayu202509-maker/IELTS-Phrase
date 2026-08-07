IELTS Phrase PWA v6 · 账号与云同步版

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
