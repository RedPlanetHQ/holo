import type { MDXComponents } from 'mdx/types';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './components/ui/table';

// This file allows you to provide custom React components
// to be used in MDX files. You can import and use any
// React component you want, including inline styles,
// components from other libraries, and more.

interface ComponentProps {
  children: React.ReactNode;
}

export const customComponents = {
  // Allows customizing built-in components, e.g. to add styling.
  h1: (props: ComponentProps) => (
    <h1 className="text-3xl font-bold mt-8 mb-4 first:mt-0" {...props} />
  ),
  h2: (props: ComponentProps) => (
    <h2 className="text-2xl font-semibold mt-6 mb-3" {...props} />
  ),
  h3: (props: ComponentProps) => (
    <h3 className="text-xl font-medium mt-4 mb-2" {...props} />
  ),
  h4: (props: ComponentProps) => (
    <h4 className="text-lg font-medium mt-3 mb-2" {...props} />
  ),
  p: (props: ComponentProps) => (
    <p className="mb-4 leading-relaxed" {...props} />
  ),
  ul: (props: ComponentProps) => (
    <ul
      className="list-disc list-outside pl-8 mb-4 space-y-2"
      style={{ display: 'block' }}
      {...props}
    />
  ),
  ol: (props: ComponentProps) => (
    <ol
      className="list-decimal list-outside pl-8 mb-4 space-y-2"
      style={{ display: 'block' }}
      {...props}
    />
  ),
  li: (props: ComponentProps) => (
    <li
      className="leading-relaxed ml-0"
      style={{ display: 'list-item' }}
      {...props}
    />
  ),
  a: (props: any) => (
    <a
      className="border-none text-primary hover:underline rounded"
      {...props}
    />
  ),
  blockquote: (props: ComponentProps) => (
    <blockquote
      className="border-l-4 border-primary pl-4 italic my-4"
      {...props}
    />
  ),
  code: (props: any) => (
    <code
      className="bg-muted px-1.5 py-0.5 rounded text-sm font-mono"
      {...props}
    />
  ),
  pre: (props: ComponentProps) => (
    <pre className="bg-muted p-4 rounded-lg overflow-x-auto mb-4" {...props} />
  ),
  hr: (props: any) => <hr className="my-8 border-border" {...props} />,
  strong: (props: ComponentProps) => (
    <strong className="font-semibold" {...props} />
  ),
  em: (props: ComponentProps) => <em className="italic" {...props} />,

  table: (props: ComponentProps) => <Table {...props} />,
  thead: (props: ComponentProps) => <TableHeader {...props} />,
  tr: (props: ComponentProps) => <TableRow {...props} />,
  td: (props: ComponentProps) => <TableCell {...props} />,
  th: (props: ComponentProps) => <TableHead {...props} />,
  tbody: (props: ComponentProps) => <TableBody {...props} />,
  Link: (props: any) => (
    <a
      className="border-none text-primary hover:underline rounded"
      {...props}
    />
  ),
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    ...(customComponents as MDXComponents),
    ...components,
  };
}
