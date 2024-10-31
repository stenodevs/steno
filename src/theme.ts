export class Theme {
  constructor(public themeName: string, private stylesheetPath: string) {}

  getStylesheetPath(): string {
    return this.stylesheetPath;
  }
}
