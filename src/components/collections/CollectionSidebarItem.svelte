<script lang="ts">
    import tooltip from "@/actions/tooltip";
    import {activeCollection, type Collection} from "@/stores/collections";
    import CommonHelper from "@/utils/CommonHelper";
    import { link } from "svelte-spa-router";

    export let collection: Collection;
    export let pinnedIds: string[];

    $: isPinned = pinnedIds.includes(collection.name);

    function toggleCollectionPin(collection: Collection) {
        if (pinnedIds.includes(collection.name)) {
            CommonHelper.removeByValue(pinnedIds, collection.name);
        } else {
            pinnedIds.push(collection.name);
        }

        pinnedIds = pinnedIds;
    }
</script>

<a
    href="/tables?collection={collection.name}"
    class="sidebar-list-item"
    title={collection.name}
    class:active={$activeCollection?.name === collection.name}
    use:link
>
    <i class={CommonHelper.getCollectionTypeIcon(collection.type||'base')} aria-hidden="true" />

    <span class="txt">{collection.name}</span>

    <!--{#if collection.type == "auth" && collection.oauth2?.enabled && !collection.oauth2.providers?.length}-->
    <!--    <i-->
    <!--        class="ri-alert-line txt-sm link-hint"-->
    <!--        aria-hidden="true"-->
    <!--        use:tooltip={"OAuth2 auth is enabled but the collection doesn't have any registered providers"}-->
    <!--    />-->
    <!--{/if}-->

    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <!-- svelte-ignore a11y-click-events-have-key-events -->
    <span
        class="btn btn-xs btn-circle btn-hint btn-transparent btn-pin-collection m-l-auto"
        aria-label={"Pin collection"}
        aria-hidden="true"
        use:tooltip={{ position: "right", text: (isPinned ? "Unpin" : "Pin") + " collection" }}
        on:click|preventDefault|stopPropagation={() => toggleCollectionPin(collection)}
    >
        {#if isPinned}
            <i class="ri-unpin-line" />
        {:else}
            <i class="ri-pushpin-line m-l-auto" />
        {/if}
    </span>
</a>

<style lang="scss">
    .btn-pin-collection {
        margin: 0 -7px 0 -15px;
        opacity: 0;
        transition: opacity var(--baseAnimationSpeed);
        i {
            font-size: inherit;
        }
    }
    a:hover .btn-pin-collection {
        opacity: 0.4;
        &:hover {
            opacity: 1;
        }
    }
</style>
