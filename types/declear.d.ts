declare module 'flexsearch/dist/module/document' {
  import { Document } from 'flexsearch';
  export default Document;
}

interface R<T = unknown> {
  code: number;
  data?: T;
  message?: string;
  timestamp?: number;
}
