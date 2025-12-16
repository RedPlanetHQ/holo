import { z } from 'zod';

// Zod schema for Navigation group
const NavigationSchema = z.object({
  group: z.string().min(1, 'Group name cannot be empty'),
  pages: z
    .array(z.string().min(1, 'Page name cannot be empty'))
    .min(1, 'At least one page is required'),
});

// Zod schema for Colors
const ColorsSchema = z
  .object({
    primary: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Primary color must be a valid hex color'),
    light: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Light color must be a valid hex color'),
    dark: z
      .string()
      .regex(/^#[0-9A-Fa-f]{6}$/, 'Dark color must be a valid hex color'),
  })
  .optional();

// Zod schema for Navbar Links
const NavbarLinkSchema = z.object({
  label: z.string().min(1, 'Link label cannot be empty'),
  href: z.string().url('Link href must be a valid URL'),
});

// Zod schema for Navbar Primary
const NavbarPrimarySchema = z.object({
  type: z.enum(['github', 'custom'], {
    errorMap: () => ({
      message: 'Primary type must be either "github" or "custom"',
    }),
  }),
  href: z.string().url('Primary href must be a valid URL'),
});

// Zod schema for Navbar
const NavbarSchema = z
  .object({
    links: z.array(NavbarLinkSchema).optional(),
    primary: NavbarPrimarySchema.optional(),
  })
  .optional();

// Zod schema for Footer Socials
const FooterSocialsSchema = z
  .object({
    twitter: z.string().url('Twitter URL must be a valid URL').optional(),
    linkedin: z.string().url('LinkedIn URL must be a valid URL').optional(),
    github: z.string().url('GitHub URL must be a valid URL').optional(),
    discord: z.string().url('Discord URL must be a valid URL').optional(),
    website: z.string().url('Website URL must be a valid URL').optional(),
  })
  .optional();

// Zod schema for Footer
const FooterSchema = z
  .object({
    socials: FooterSocialsSchema,
  })
  .optional();

// Zod schema for Provider
const ProviderSchema = z.object({
  name: z.string().min(1, 'Provider name cannot be empty'),
  model: z.string().min(1, 'Model name cannot be empty'),
  baseUrl: z.string().url('Base URL must be a valid URL'),
});

// Zod schema for Core configuration
const CoreSchema = z.object({
  url: z.string().url('Core URL must be a valid URL'),
  labels: z.array(z.string()).optional(),
});

// Main Zod schema for holo.json
export const HoloConfigSchema = z.object({
  name: z.string().min(1, 'Name is required and cannot be empty'),
  core: CoreSchema,
  colors: ColorsSchema,
  favicon: z.string().optional(),
  navigation: z
    .array(NavigationSchema)
    .min(1, 'At least one navigation group is required'),
  navbar: NavbarSchema,
  footer: FooterSchema,
  providers: ProviderSchema,
});

export type HoloConfig = z.infer<typeof HoloConfigSchema>;
