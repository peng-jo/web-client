<script lang="ts">
  import { createEventDispatcher, tick } from 'svelte';
  import { VegaEmojiHandler } from '../../../model/emoji/VegaEmojiHandler';
  import type { CustomEmoji } from '../../../model/emoji/CustomEmoji';

  export let query = '';
  const dispatch = createEventDispatcher();
  const emojiHandler = new VegaEmojiHandler();

  let filteredEmojis: CustomEmoji[] = [];
  let selectedIndex = 0;
  let itemElements: HTMLElement[] = [];

  $: {
    if (query) {
      emojiHandler.search(query).then((results) => {
        filteredEmojis = results;
        selectedIndex = 0; // 검색어가 바뀌면 선택 인덱스 초기화
        itemElements = [];
      });
    } else {
      filteredEmojis = [];
      itemElements = [];
    }
  }

  $: if (filteredEmojis.length > 0 && selectedIndex !== undefined) {
    scrollSelectedIntoView();
  }

  async function scrollSelectedIntoView() {
    await tick();
    if (itemElements[selectedIndex]) {
      itemElements[selectedIndex].scrollIntoView({ block: 'nearest' });
    }
  }

  function selectEmoji(emoji: CustomEmoji) {
    dispatch('select', emoji.name);
  }

  export function next() {
    if (filteredEmojis.length === 0) return;
    selectedIndex = (selectedIndex + 1) % filteredEmojis.length;
  }

  export function previous() {
    if (filteredEmojis.length === 0) return;
    selectedIndex = (selectedIndex - 1 + filteredEmojis.length) % filteredEmojis.length;
  }

  export function selectCurrent() {
    if (filteredEmojis.length > 0 && filteredEmojis[selectedIndex]) {
      selectEmoji(filteredEmojis[selectedIndex]);
    }
  }
</script>

{#if filteredEmojis.length > 0}
  <div class="emoji-search-result-view">
    <div class="result-list">
      {#each filteredEmojis as emoji, i}
        <div
          bind:this={itemElements[i]}
          class="result-item"
          class:selected={i === selectedIndex}
          on:mouseenter={() => (selectedIndex = i)}
          on:click={() => selectEmoji(emoji)}
        >
          <img src={emoji.thumbnailUrl || emoji.src} alt={emoji.name} class="emoji-preview" />
          <span class="emoji-name">:{emoji.name}:</span>
        </div>
      {/each}
    </div>
  </div>
{/if}

<style lang="scss">
  .emoji-search-result-view {
    position: absolute;
    bottom: 80px; /* 입력창과 스티커 바 위에 위치 */
    left: 10px;
    z-index: 100;
    background-color: var(--primary-background-color);
    border: 1px solid var(--primary-hoverground-color);
    border-radius: 4px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4);
    max-height: 200px;
    overflow-y: auto;
    min-width: 160px;

    /* Scrollbar Styling */
    &::-webkit-scrollbar {
      width: 4px;
    }

    &::-webkit-scrollbar-track {
      background: transparent;
    }

    &::-webkit-scrollbar-thumb {
      background-color: var(--primary-hoverground-color);
      border-radius: 2px;

      &:hover {
        background-color: var(--primary-activeground-color);
      }
    }
  }

  .result-item {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    cursor: pointer;
    color: var(--primary-foreground-color);
    font-size: 14px;

    &.selected {
      background-color: var(--primary-hoverground-color);
      outline: 1px solid var(--primary-activeground-color);
    }

    .emoji-preview {
      width: 24px;
      height: 24px;
      object-fit: contain;
    }

    .emoji-name {
      flex: 1;
    }
  }
</style>
