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
    <h1 className="text-xl font-bold" {...props} />
  ),
  h2: (props: ComponentProps) => <h2 className="text-lg" {...props} />,
  h3: (props: ComponentProps) => <h3 className="text-md" {...props} />,
  a: (props: any) => (
    <a className="border-none text-primary rounded" {...props} />
  ),

  table: (props: ComponentProps) => <Table {...props} />,
  thead: (props: ComponentProps) => <TableHeader {...props} />,
  tr: (props: ComponentProps) => <TableRow {...props} />,
  td: (props: ComponentProps) => <TableCell {...props} />,
  th: (props: ComponentProps) => <TableHead {...props} />,
  tbody: (props: ComponentProps) => <TableBody {...props} />,
};

export function useMDXComponents(components: MDXComponents): MDXComponents {
  return {
    // Allows customizing built-in components, e.g. to add styling.
    ...(customComponents as MDXComponents),
    ...components,
  };
}
