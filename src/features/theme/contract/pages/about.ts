export interface AboutPageProps {
  author: string;
  description: string;
  social?: Array<{ platform: string; url: string }>;
}
