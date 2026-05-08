import type { CustomEmoji, CustomEmojiDetail } from './CustomEmoji';

export class VegaEmojiHandler {
  readonly #host = 'https://mycast.xyz:9011/emoji';

  async load(privateKey: string): Promise<CustomEmoji[]> {
    try {
      const url = `${this.#host}/${privateKey}/emojis`;
      const res = await fetch(url);
      const json = await res.json();
      return json as CustomEmoji[];
    } catch {
      return [];
    }
  }

  async loadAll(): Promise<CustomEmojiDetail[]> {
    try {
      const url = `${this.#host}`;
      const res = await fetch(url);
      const json = await res.json();
      return json as CustomEmojiDetail[];
    } catch {
      return [];
    }
  }

  async search(query: string): Promise<CustomEmoji[]> {
    try {
      const url = `${this.#host}/search?q=${encodeURIComponent(query)}`;
      const res = await fetch(url);
      const json = await res.json();
      return json as CustomEmoji[];
    } catch {
      return [];
    }
  }

  async delete(privateKey: string, emojiIdx: number): Promise<boolean> {
    try {
      const url = `${this.#host}/${privateKey}/emoji/${emojiIdx}`;
      const res = await fetch(url, { method: 'DELETE' });
      return res.ok;
    } catch {
      return false;
    }
  }
}
