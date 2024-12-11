<script>
    import CommonHelper from "@/utils/CommonHelper";
    import OverlayPanel from "@/components/base/OverlayPanel.svelte";

    let panel;
    let url = "";

    $: queryParamsIndex = url.indexOf("?");

    $: filename = url.substring(
        url.lastIndexOf("/") + 1,
        queryParamsIndex > 0 ? queryParamsIndex : undefined
    );

    $: type = CommonHelper.getFileType(filename);

    export function show(newUrl) {
        if (newUrl === "") {
            return;
        }

        url = newUrl;

        panel?.show();
    }

    export function hide() {
        return panel?.hide();
    }
</script>

<OverlayPanel bind:this={panel} class="preview preview-{type}" btnClose={false} popup on:show on:hide>
    <svelte:fragment slot="header">
        <button type="button" class="overlay-close" on:click|preventDefault={hide}>
            <i class="ri-close-line" />
        </button>
    </svelte:fragment>

    {#if panel?.isActive()}
        {#if type === "image"}
            <img src={url} alt="Preview {filename}" style="max-width: 100%; height: auto;"/>
        {:else if type === "video"}
            <video src={url} controls style="max-width: 100%; height: auto;">
                Your browser does not support the video tag.
            </video>
        {:else if type === "audio"}
            <audio src={url} controls style="max-width: 100%; height: auto;">
                Your browser does not support the audio element.
            </audio>
        {:else}
            <object title={filename} data={url} style="width: 100%; height: 100%;">
                Cannot preview the file.
            </object>
        {/if}
    {/if}

    <svelte:fragment slot="footer">
        <a
            href={url}
            title={filename}
            target="_blank"
            rel="noreferrer noopener"
            class="link-hint txt-ellipsis inline-flex"
        >
            {filename}
            <i class="ri-external-link-line" />
        </a>
        <div class="flex-fill" />
        <button type="button" class="btn btn-transparent" on:click={hide}>Close</button>
    </svelte:fragment>
</OverlayPanel>
