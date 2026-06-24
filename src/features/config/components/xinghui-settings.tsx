import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Field } from "@/features/config/components/site-settings-fields";
import type { SystemConfig } from "@/features/config/config.schema";

export function XinghuiThemeSettings() {
  const {
    register,
    formState: { errors },
  } = useFormContext<SystemConfig>();

  return (
    <>
      <Field
        label="背景图片 URL"
        hint="网站背景随机图地址。支持随机图 API（如 LoliAPI）"
        error={errors.site?.theme?.xinghui?.homeBg?.message}
      >
        <Input
          {...register("site.theme.xinghui.homeBg")}
          placeholder="https://www.loliapi.com/acg/pc/"
        />
      </Field>

      <Field
        label="用户头像 URL"
        hint="用于导航栏、首页个人卡片、侧边栏等所有头像显示位置"
        error={errors.site?.theme?.xinghui?.userAvatar?.message}
      >
        <Input
          {...register("site.theme.xinghui.userAvatar")}
          placeholder="https://example.com/avatar.jpg"
        />
      </Field>

      <Field
        label="关于页 - 自我介绍"
        hint="关于页面显示的详细介绍内容，支持 Markdown。留空则使用站点描述。"
        error={errors.site?.theme?.xinghui?.aboutContent?.message}
        className="sm:col-span-2"
      >
        <Textarea
          {...register("site.theme.xinghui.aboutContent")}
          placeholder="写一段详细的自我介绍，支持 Markdown 格式..."
          rows={8}
        />
      </Field>

      {/* Danmaku settings moved to /admin/danmaku */}

      <Field
        label="站点启动时间"
        hint="用于首页「系统已稳定运行」的起始时间计算，格式：2026-01-01T00:00:00"
        error={errors.site?.theme?.xinghui?.buildDate?.message}
      >
        <Input
          {...register("site.theme.xinghui.buildDate")}
          placeholder="2026-01-01T00:00:00"
        />
      </Field>
    </>
  );
}
