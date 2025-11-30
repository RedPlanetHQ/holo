export interface Tab {
  group: string;
  pages: string[];
}

export interface BaseLayoutContextType {
  chatCollapsed: boolean;
  setChatCollapsed: (value: boolean) => void;
}
