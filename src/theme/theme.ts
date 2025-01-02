export class Theme {
  constructor(public themeName: string, private stylesheets: string[], private components: string[]) {}

  getStylesheets(): string[] {
    return this.stylesheets;
  }

  getComponents(): string[] {
    return this.components;
  }
}
