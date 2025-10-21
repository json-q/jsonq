declare module "flexsearch/dist/module/document" {
  import { Document } from "flexsearch";
  export default Document;
}

// Copied from https://github.com/CloudCannon/pagefind/blob/2a0aa90cfb78bb8551645ac9127a1cd49cf54add/pagefind_web_js/types/index.d.ts#L72-L82
/** Options that can be passed to pagefind.search() */
type PagefindSearchOptions = {
  /** If set, this call will load all assets but return before searching. Prefer using pagefind.preload() instead */
  preload?: boolean;
  /** Add more verbose console logging for this search query */
  verbose?: boolean;
  /** The set of filters to execute with this search. Input type is extremely flexible, see the filtering docs for details */
  filters?: object;
  /** The set of sorts to use for this search, instead of relevancy */
  sort?: object;
};

declare namespace globalThis {
  // eslint-disable-next-line no-var
  var pagefind:
    | {
        // https://github.com/CloudCannon/pagefind/blob/2a0aa90cfb78bb8551645ac9127a1cd49cf54add/pagefind_web_js/lib/coupled_search.ts#L600
        debouncedSearch: <T>(
          term: string,
          options?: PagefindSearchOptions,
          debounceTimeoutMs?: number,
        ) => Promise<{
          results: {
            data: () => Promise<T>;
            id: string;
          }[];
        } | null>;
        options: (opts: Record<string, unknown>) => Promise<void>;
      }
    | undefined;
}
