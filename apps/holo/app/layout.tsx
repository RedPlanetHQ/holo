import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

import './globals.css';
import { Nav } from '@/components/nav';
import { Footer } from '@/components/footer';
import { HoloConfig } from '@/components/config-provider';
import { BaseLayout } from '@/layouts/base-layout';

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
        <HoloConfig>
          <BaseLayout>
            <div className="h-full w-full flex flex-col overflow-hidden">
              <main className="mx-auto w-full overflow-auto flex flex-col">
                <Nav />
                <div className="px-8 h-[calc(100vh_-_80px)] overflow-y-auto">
                  {children}

                  <div className="mt-4">
                    <Footer />
                  </div>
                </div>
              </main>
            </div>
          </BaseLayout>
        </HoloConfig>
      </body>
    </html>
  );
}
