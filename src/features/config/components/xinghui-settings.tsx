import { useFormContext } from "react-hook-form";
import { Input } from "@/components/ui/input";
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
        hint="同时用于导航栏头像和首页照片墙横幅"
        error={errors.site?.theme?.xinghui?.userAvatar?.message}
      >
        <Input
          {...register("site.theme.xinghui.userAvatar")}
          placeholder="https://example.com/avatar.jpg"
        />
      </Field>

      <Field
        label="个人卡片头像 URL"
        hint="首页个人资料卡片和侧边栏的头像"
        error={errors.site?.theme?.xinghui?.avatar?.message}
      >
        <Input
          {...register("site.theme.xinghui.avatar")}
          placeholder="https://example.com/avatar.jpg"
        />
      </Field>
    </>
  );
}
