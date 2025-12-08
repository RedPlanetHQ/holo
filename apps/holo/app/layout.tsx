import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { HoloConfig } from '@/components/config-provider';
import { BaseLayout } from '@/layouts/base-layout';
import { PostHogProvider } from '@/components/posthog-provider';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${GeistMono.variable} ${GeistSans.variable} h-full w-full`}
    >
      <body className="w-full h-full font-sans bg-background">
        <PostHogProvider>
          <HoloConfig>
            <BaseLayout>
              <div className="h-full w-full flex flex-col overflow-hidden">
                <main className="mx-auto w-full overflow-auto flex flex-col">
                  <Nav />
                  <div className="px-8 h-[calc(100vh_-_64px)] overflow-y-auto">
                    {children}
                  </div>
                </main>
              </div>
            </BaseLayout>
          </HoloConfig>
        </PostHogProvider>
      </body>
    </html>
  );
}
