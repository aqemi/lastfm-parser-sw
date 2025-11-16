export class ImageUrlRewriter implements HTMLRewriterElementContentHandlers {
  private url = '';
  public async element(element: Element): Promise<void> {
    if (!this.url) {
      this.url = element.getAttribute('src') ?? '';
    }
  }

  public getUrl(): string {
    if (!this.url) {
      throw new Error('Url was not parsed!');
    }
    return this.url;
  }
}
