<script lang="ts">
  import { onMount } from 'svelte';
  import { EmojiUtils } from '../../model/chat/emoji/EmojiUtils';
  import { ChatHistoryManager } from '../../model/chat/history/ChatHistoryList';
  import { ClipboardManager } from '../../model/clipboard/ClipboardManager';
  import { GroupedChatService } from '../../service/chat/GroupedChatService';
  import { ChatClipboardService } from '../../service/ChatClipboardService';
  import { ChatNetworkService } from '../../service/ChatNetworkService';
  import { ChatService } from '../../service/ChatService';
  import { EmojiService } from '../../service/EmojiService';
  import { SessionService } from '../../service/SessionService';
  import { SocketService } from '../../service/SocketService';
  import { WindowService } from '../../service/WindowService';
  import { ChatReplyService } from '../../service/ChatReplyService';
  import { get } from 'svelte/store';
  import EmojiSearchResultView from './emoji/EmojiSearchResultView.svelte';

  const clipboardManager = new ClipboardManager();
  const chatHistories = new ChatHistoryManager();
  let imageInput: HTMLInputElement;
  let chatPrompt: HTMLInputElement;
  let message: string = '';
  let isConnected = false;
  let isScrollLock = false;
  let searchView: EmojiSearchResultView;
  let hasEmojiResults = false;
  const emojiSearchQuery = WindowService.emojiSearchQuery;

  $: {
    const match = message.match(/:([^:\s]{2,})$/);
    const excludeString = '대충::';
    const exclude = message.startsWith(excludeString);

    if (match && !exclude) {
      WindowService.setEmojiSearchQuery(match[1]);
    }
  }

  const toggleUserList = () => {
    WindowService.toggleChatInterfaceMenu('user');
  };

  const toggleEmojiAttachView = () => {
    WindowService.toggleChatInterfaceMenu('emoji');
  };

  const clearChats = () => {
    GroupedChatService.updateChats([]);
  };

  ChatNetworkService.isConnected.subscribe((v) => (isConnected = v));

  onMount(() => {
    message = '';
    ChatService.scrollLock.subscribe((v) => (isScrollLock = v));
    ChatService.focusInputEvent.subscribe((e) => e && chatPrompt?.focus());
    EmojiService.appendEmojiChat.subscribe((it) => it && onAppendEmojiChat(it));
  });

  function onImageChange() {
    const elm = imageInput;
    const file = elm?.files?.item(0);
    if (!file) {
      console.warn('image not found');
      return;
    }
    clipboardManager.uploadImageCacheWithFile(file, (imageUri) => {
      WindowService.openModal('upload-image-chat');
      ChatClipboardService.setCurrentImage(imageUri);
      imageInput.value = '';
    });
  }

  function onKeyPress(e: KeyboardEvent) {
    const { key } = e;
    if (key === 'Enter' && message.trim().length !== 0) {
      const privateKey = SessionService.getPrivateKey();
      if (!privateKey) {
        return;
      }

      const replyStagedChat = get(ChatReplyService.stagedChat);
      if (replyStagedChat) {
        SocketService.reply?.execute(privateKey, replyStagedChat.hash, message);
        ChatReplyService.unstageChat();
      } else {
        SocketService.chat?.execute(privateKey, 'chat', message);
        chatHistories.addHistory(message);
      }
      if (EmojiUtils.isEmoji(message)) {
        EmojiService.registerRecent(message);
      }
      message = '';
      WindowService.closeEmojiAttachView();
      ChatService.requestScrollDown(true);
      chatHistories.resetIndex();
    }
  }

  function onKeyDown(e: KeyboardEvent) {
    const { key } = e;
    switch (key) {
      case 'ArrowUp':
        e.preventDefault();
        if ($emojiSearchQuery && hasEmojiResults) {
          searchView?.previous();
        } else {
          message = chatHistories.getPrev();
        }
        return false;
      case 'ArrowDown':
        e.preventDefault();
        if ($emojiSearchQuery && hasEmojiResults) {
          searchView?.next();
        } else {
          message = chatHistories.getNext();
        }
        return false;
      case 'Enter':
        if ($emojiSearchQuery && hasEmojiResults) {
          e.preventDefault();
          searchView?.selectCurrent();
          return false;
        }
        return true;
      case 'Escape':
        if (ChatReplyService.isStaged()) {
          ChatReplyService.unstageChat();
        }
        return false;
      default:
        return true;
    }
  }

  function onScrollDownClick() {
    ChatService.requestScrollDown(true);
  }

  function onAppendEmojiChat(emoji: string) {
    message += emoji;
  }

  function onEmojiSelect(emojiName: string) {
    const lastIndex = message.lastIndexOf(':');
    if (lastIndex !== -1) {
      message = message.substring(0, lastIndex) + `:${emojiName}:`;
    }
    WindowService.closeEmojiSearch();
    chatPrompt?.focus();
  }

  function onToggleBotClick() {
    toggleBotList();
  }

  function onToggleClipClick() {
    WindowService.toggleChatInterfaceMenu('clip');
  }

  function toggleBotList() {
    WindowService.toggleChatInterfaceMenu('bot');
  }
</script>

<!-- svelte-ignore a11y-click-events-have-key-events -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<div class="chat-interface" on:click={(_) => ChatService.setActive(null)}>
  {#if $emojiSearchQuery}
    <EmojiSearchResultView
      bind:this={searchView}
      bind:hasResults={hasEmojiResults}
      query={$emojiSearchQuery}
      on:select={(e) => onEmojiSelect(e.detail)}
    />
  {/if}

  <div class="input-sticker">
    <div class="sticker-section">
      <div on:click={toggleUserList}>
        <i class="fas fa-address-book" />
      </div>
      <div on:click={onToggleBotClick}>
        <i class="fas fa-robot" />
      </div>
      <div on:click={onToggleClipClick}>
        <i class="fas fa-paperclip" />
      </div>
      <div on:click={clearChats}>
        <i class="fas fa-remove-format" />
      </div>
      <div class:hide={!isScrollLock} on:click={onScrollDownClick}>
        <i class="fas fa-arrow-down" />
      </div>
    </div>

    <div class="sticker-section right">
      <div class:hide={isConnected}>
        <i class="fas fa-exclamation-triangle" />
      </div>
      <div on:click={(_) => toggleEmojiAttachView()}>
        <i class="far fa-smile" />
      </div>
      <div on:click={(_) => imageInput.click()}>
        <i class="fas fa-file-image" />
      </div>
    </div>
  </div>
  <input
    bind:this={chatPrompt}
    type="text"
    class="input-box"
    bind:value={message}
    on:keypress={onKeyPress}
    on:keydown={onKeyDown}
  />
  <input
    type="file"
    accept="image/*"
    style="display: none"
    bind:this={imageInput}
    on:change={onImageChange}
  />
</div>

<style lang="scss">
  .chat-interface {
    position: relative;
    width: 100%;
    height: 100%;
    // 좌우측 채팅 부분에 대한 border의 1px 처리로
    margin-left: -1px;
    background-color: var(--primary-background-color);
  }

  // 스티커 & 채팅 클리어 & 채팅 인원 안내
  .input-sticker {
    display: block;
    width: calc(100% - 10px);
    height: 30px;
    background-color: var(--primary-hoverground-color);
    border-top: 1px solid var(--primary-hoverground-color);
    border-bottom: 1px solid var(--primary-hoverground-color);
    padding: 0% 5px;

    div {
      width: auto;
      height: auto;
      display: inline-block;
      color: var(--primary-foreground-color);
      user-select: none;

      i {
        padding: 8px 6px;
        font-size: 14px;
        /* margin: -3px; */
        display: inline-block;
        /* position: relative; */
        overflow: hidden;
      }

      &.hide {
        display: none;
      }

      &:hover {
        color: var(--primary-activeground-color);
      }
    }

    & > .sticker-section {
      display: inline-block;
      &.right {
        float: right;
      }
    }
  }

  .input-box {
    width: calc(100% - 0px);
    height: 47px;
    padding: 10px;
    margin: 0%;

    background: var(--primary-background-color);
    font-size: 16px;
    color: var(--primary-foreground-color);
    border: none;
    outline: none;
  }
</style>
