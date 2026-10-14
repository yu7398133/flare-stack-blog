/**
 * 关于页不接收 props。
 *
 * 曾声明 author/description/social，但主题实现已改为自行从
 * useRouteContext 读取 siteConfig（见 xinghui/pages/about/page.tsx），
 * 路由仍在传这些字段，形成了一条无人接收的死契约（TS2322）。
 * 若将来需要外部注入数据，请同步修改实现与路由后再补回字段。
 */
export type AboutPageProps = Record<string, never>;
