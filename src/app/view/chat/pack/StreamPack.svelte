<script lang="ts">
  import type { Content } from '../../../model/window/Content';
  import { OptionService } from '../../../service/OptionService';
  import { WindowService } from '../../../service/WindowService';

  export let body: string;
  let isDataSave: boolean;
  $: json = JSON.parse(body);
  $: thumbnail = json.thumbnail;
  $: icon = json.icon;
  $: name = json.nickname;
  $: keyId = json.keyId;
  $: link = json.link;
  $: platform = json.platform;

  OptionService.enableDataSave.subscribe((it) => (isDataSave = it));

  function onClick() {
    WindowService.openContent(getContent());
  }

  function getContent(): Content {
    switch (platform) {
      case 'local':
        return {
          type: 'local-stream',
          src: {
            url: keyId,
            icon,
            title: json.name
          }
        };
      case 'totoro':
        return {
          type: 'totoro-stream',
          src: {
            url: keyId,
            icon,
            title: json.name
          }
        };
      case 'kakaotv':
        return {
          type: 'iframe',
          src: link
        };
      case 'twitch':
        return {
          type: 'twitch-stream',
          src: link
        };
      case 'afreeca':
        return {
          type: 'iframe',
          src: link
        };
      case 'youtube':
        return {
          type: 'iframe',
          src: link
        };
      case 'lck':
        return {
          type: 'hls',
          src: link
        };
      default:
        return {
          type: 'iframe',
          src: link
        };
    }
  }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->
{#if isDataSave}
  <div on:click={onClick}><strong>(대충 {name} 방송)</strong></div>
{:else}
  <div class="stream-live-box" on:click={onClick}>
    <div class="stream-live-img">
      {#if thumbnail}
        <img src={thumbnail} alt="썸네일" on:error={(_) => (thumbnail = '')} />
      {/if}
    </div>
    <div class="stream-live-info">
      <div class="str-user-img">
        <img src={icon} alt="icon" />
      </div>
      <div class="str-user-info">
        <h3>{name}</h3>
        <div class="str-live-info">
          <!-- <img src={platformIcon} alt="{platform} 아이콘" /> -->
          <p>{keyId} / {platform}</p>
        </div>
      </div>
    </div>
  </div>
{/if}

<style lang="scss">
  .stream-live-box {
    width: 100%;
    height: 70px;
    padding: 0px;
    overflow: hidden;
    position: relative;
    border-radius: 3px;
    box-shadow: 1px 1px 1px rgba(0, 0, 0, 0.4);

    .stream-live-img {
      width: 100%;
      height: 180px;
      overflow: hidden;

      img {
        width: 100%;
      }
    }
    .stream-live-info {
      width: calc(100% - 10px);
      height: 50px;
      padding: 10px 5px;
      background-color: var(--primary-hoverground-color);
      position: absolute;
      bottom: 0px;
      left: 0px;

      .str-user-img {
        width: 50px;
        height: 50px;
        border-radius: 50px;
        overflow: hidden;
        float: left;
        border: 1px solid var(--primary-hoverground-color);

        img {
          width: 50px;
          height: 50px;
        }
      }
      .str-user-info {
        width: calc(100% - 60px);
        height: 50px;
        margin-left: 8px;
        float: left;

        * {
          padding: 0%;
          margin: 0%;
          color: var(--primary-foreground-color);
          //text-shadow: 2px 2px 2px rgba(0, 0, 0, 0.4);
        }
        h3 {
          font-size: 18px;
          font-weight: bolder;
          margin-bottom: 5px;
          margin-top: 5px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .str-live-info {
          width: 100%;
          height: 20px;

          * {
            float: left;
          }
          img {
            width: 20px;
            height: 20px;
            background-color: var(--primary-background-color);
            border-radius: 3px;
            overflow: hidden;
          }
          p {
            font-size: 12px;
            padding-top: 3px;
            margin-left: 5px;
          }
        }
      }
    }
  }
</style>
