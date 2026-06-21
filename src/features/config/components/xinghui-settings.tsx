import { useFormContext } from "react-hook-form";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

export function XinghuiThemeSettings() {
  const form = useFormContext();

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium">Xinghui 主题设置</h3>
        <p className="text-sm text-muted-foreground">
          配置 xinghui 主题的图片和个性化选项
        </p>
      </div>

      <FormField
        control={form.control}
        name="site.theme.xinghui.homeBg"
        render={({ field }) => (
          <FormItem>
            <FormLabel>背景图片 URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://www.loliapi.com/acg/pc/"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              网站背景图片地址。留空使用默认值。支持随机图 API（如 LoliAPI）
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="site.theme.xinghui.userAvatar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>用户头像 URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/avatar.jpg"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              同时用于导航栏头像和首页照片墙横幅
            </FormDescription>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="site.theme.xinghui.avatar"
        render={({ field }) => (
          <FormItem>
            <FormLabel>个人卡片头像 URL</FormLabel>
            <FormControl>
              <Input
                placeholder="https://example.com/avatar.jpg"
                {...field}
                value={field.value ?? ""}
              />
            </FormControl>
            <FormDescription>
              首页个人资料卡片和侧边栏的头像
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
}
