export const mockedHttpFetch = (content = "", code = 200, header: string = "text/html") =>
  ({
    fetch: (_url: string) => {
      return new Promise((resolve) => {
        resolve({
          ok: code < 400,
          headers: {
            get: () => header
          },
          text: () => new Promise((resolve) => resolve(content))
        });
      });
    }
  } as any);