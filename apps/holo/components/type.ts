export interface Tab {
  group: string;
  pages: string[];
}

export interface HoloConfigType {
  name: string;
  description: string;
  navigation: Array<Tab>;
  socials: {
    github?: string;
  };
}

export interface BaseLayoutContextType {
  chatCollapsed: boolean;
  setChatCollapsed: (value: boolean) => void;
}
