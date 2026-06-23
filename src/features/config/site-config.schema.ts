import { z } from "zod";
import type { Messages } from "@/lib/i18n";
import { SOCIAL_PLATFORM_KEYS } from "./utils/social-platforms";

export const SocialLinkSchema = z.object({
  platform: z.enum(SOCIAL_PLATFORM_KEYS),
  url: z.string(),
  icon: z.string().optional(),
  label: z.string().optional(),
});

// ==================== Shared helpers ====================

function createSiteTextSchema(max: number) {
  return z.string().trim().max(max);
}

function createSiteTextFormSchema(max: number, messages: Messages) {
  return z
    .string()
    .trim()
    .max(max, messages.settings_site_validation_too_long({ max }));
}

function createAssetRefSchema() {
  return z.string().refine((value) => value === "" || value.startsWith("/"), {
    message: "Please enter a root-relative path",
  });
}

function createAssetRefFormSchema(messages: Messages) {
  return z.string().refine((value) => value === "" || value.startsWith("/"), {
    message: messages.settings_site_validation_invalid_asset_ref(),
  });
}

function isExternalImageUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function createBackgroundImageRefSchema() {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || value.startsWith("/") || isExternalImageUrl(value),
      {
        message: "Please enter a root-relative path or http(s) URL",
      },
    );
}

function createBackgroundImageRefFormSchema(messages: Messages) {
  return z
    .string()
    .trim()
    .refine(
      (value) =>
        value === "" || value.startsWith("/") || isExternalImageUrl(value),
      {
        message:
          messages.settings_site_validation_invalid_background_image_ref(),
      },
    );
}

function createAssetPathSchema() {
  return z.string().refine((value) => value.startsWith("/"), {
    message: "Please enter a root-relative path",
  });
}

function createOptionalAssetPathSchema() {
  return z.union([createAssetPathSchema(), z.literal("")]);
}

function createOptionalAssetPathFormSchema(messages: Messages) {
  return z.union([
    z.string().refine((value) => value.startsWith("/"), {
      message: messages.settings_site_validation_invalid_asset_path(),
    }),
    z.literal(""),
  ]);
}

// ==================== Xinghui Theme ====================

function createXinghuiThemeSiteConfigSchema() {
  return z.object({
    homeBg: createBackgroundImageRefSchema(),
    avatar: createBackgroundImageRefSchema(),
    userAvatar: createBackgroundImageRefSchema().optional(),
    aboutContent: z.string().optional(),
    musicIds: z
      .array(
        z.union([
          z.string(),
          z.object({ id: z.string(), audioUrl: z.string().optional(), vip: z.boolean().optional() }),
        ]),
      )
      .optional(),
    musicPlaylistIds: z.array(z.string()).optional(),
    musicResolverUrl: z.string().optional(),
    buildDate: z.string().optional(),
    danmakuList: z.array(z.string()).optional(),
    danmakuFontSize: z.number().int().min(10).max(40).optional(),
    danmakuOpacity: z.number().min(0).max(1).optional(),
    clickEffect: z.boolean().optional(),
    fireflyEffect: z.boolean().optional(),
  });
}

function createXinghuiThemeSiteConfigInputSchema() {
  return z.object({
    homeBg: createBackgroundImageRefSchema().optional(),
    avatar: createBackgroundImageRefSchema().optional(),
    userAvatar: createBackgroundImageRefSchema().optional(),
    aboutContent: z.string().optional(),
    musicIds: z
      .array(
        z.union([
          z.string(),
          z.object({ id: z.string(), audioUrl: z.string().optional(), vip: z.boolean().optional() }),
        ]),
      )
      .optional(),
    musicPlaylistIds: z.array(z.string()).optional(),
    musicResolverUrl: z.string().optional(),
    buildDate: z.string().optional(),
    danmakuList: z.array(z.string()).optional(),
    danmakuFontSize: z.number().int().min(10).max(40).optional(),
    danmakuOpacity: z.number().min(0).max(1).optional(),
    clickEffect: z.boolean().optional(),
    fireflyEffect: z.boolean().optional(),
  });
}

function createXinghuiThemeSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    homeBg: createBackgroundImageRefFormSchema(messages).optional(),
    avatar: createBackgroundImageRefFormSchema(messages).optional(),
    userAvatar: createBackgroundImageRefFormSchema(messages).optional(),
    aboutContent: z.string().optional(),
    musicIds: z
      .array(
        z.union([
          z.string(),
          z.object({ id: z.string(), audioUrl: z.string().optional(), vip: z.boolean().optional() }),
        ]),
      )
      .optional(),
    musicPlaylistIds: z.array(z.string()).optional(),
    musicResolverUrl: z.string().optional(),
    buildDate: z.string().optional(),
    danmakuList: z.array(z.string()).optional(),
    danmakuFontSize: z.number().int().min(10).max(40).optional(),
    danmakuOpacity: z.number().min(0).max(1).optional(),
    clickEffect: z.boolean().optional(),
    fireflyEffect: z.boolean().optional(),
  });
}

// ==================== Exports ====================

export const xinghuiThemeSiteConfigSchema = createXinghuiThemeSiteConfigSchema();
export const xinghuiThemeSiteConfigInputSchema =
  createXinghuiThemeSiteConfigInputSchema();

export const FullSiteConfigSchema = z.object({
  title: createSiteTextSchema(120),
  author: createSiteTextSchema(80),
  description: createSiteTextSchema(300),
  social: z.array(SocialLinkSchema),
  icons: z.object({
    faviconSvg: createAssetPathSchema(),
    faviconIco: createAssetPathSchema(),
    favicon96: createAssetPathSchema(),
    appleTouchIcon: createAssetPathSchema(),
    webApp192: createAssetPathSchema(),
    webApp512: createAssetPathSchema(),
  }),
  theme: z.object({
    xinghui: xinghuiThemeSiteConfigSchema,
  }),
});

export function createSiteConfigInputFormSchema(messages: Messages) {
  return z.object({
    title: createSiteTextFormSchema(120, messages).optional(),
    author: createSiteTextFormSchema(80, messages).optional(),
    description: createSiteTextFormSchema(300, messages).optional(),
    social: z.array(SocialLinkSchema).optional(),
    icons: z
      .object({
        faviconSvg: createOptionalAssetPathFormSchema(messages).optional(),
        faviconIco: createOptionalAssetPathFormSchema(messages).optional(),
        favicon96: createOptionalAssetPathFormSchema(messages).optional(),
        appleTouchIcon: createOptionalAssetPathFormSchema(messages).optional(),
        webApp192: createOptionalAssetPathFormSchema(messages).optional(),
        webApp512: createOptionalAssetPathFormSchema(messages).optional(),
      })
      .optional(),
    theme: z
      .object({
        xinghui: createXinghuiThemeSiteConfigInputFormSchema(messages).optional(),
      })
      .optional(),
  });
}

export const SiteConfigInputSchema = z.object({
  title: createSiteTextSchema(120).optional(),
  author: createSiteTextSchema(80).optional(),
  description: createSiteTextSchema(300).optional(),
  social: z.array(SocialLinkSchema).optional(),
  icons: z
    .object({
      faviconSvg: createOptionalAssetPathSchema().optional(),
      faviconIco: createOptionalAssetPathSchema().optional(),
      favicon96: createOptionalAssetPathSchema().optional(),
      appleTouchIcon: createOptionalAssetPathSchema().optional(),
      webApp192: createOptionalAssetPathSchema().optional(),
      webApp512: createOptionalAssetPathSchema().optional(),
    })
    .optional(),
  theme: z
    .object({
      xinghui: xinghuiThemeSiteConfigInputSchema.optional(),
    })
    .optional(),
});

export const SiteConfigSchema = SiteConfigInputSchema;

export type XinghuiThemeSiteConfig = z.infer<typeof xinghuiThemeSiteConfigSchema>;
export type XinghuiThemeSiteConfigInput = z.infer<
  typeof xinghuiThemeSiteConfigInputSchema
>;
export type SiteConfig = z.infer<typeof FullSiteConfigSchema>;
export type SiteConfigInput = z.infer<typeof SiteConfigInputSchema>;
