<script lang="ts">
    import tooltip from "@/actions/tooltip";
    import RecordInfoContent from "@/components/records/RecordInfoContent.svelte";
    import CommonHelper from "@/utils/CommonHelper";
    import {type CollectionRecord} from "@/stores/collections";

    export let record: CollectionRecord;
    export let fieldName: string | null = null;
    export let otherFields = false;
</script>

<div class="record-info">
    <RecordInfoContent {record} {fieldName} {otherFields} />

    <a
        href="#/tables?collection={record.collectionName}&recordId={record.id}"
        target="_blank"
        class="inline-flex link-hint"
        rel="noopener noreferrer"
        use:tooltip={{
            text:
                "Open relation record in new tab:\n" +
                CommonHelper.truncate(
                    JSON.stringify(CommonHelper.truncateObject(record), null, 2),
                    800,
                    true,
                ),
            class: "code",
            position: "left",
        }}
        on:click|stopPropagation
        on:keydown|stopPropagation
    >
        <i class="ri-external-link-line txt-sm"></i>
    </a>
</div>

<style lang="scss">
    .record-info {
        display: inline-flex;
        vertical-align: top;
        align-items: center;
        justify-content: center;
        max-width: 100%;
        min-width: 0;
        gap: 5px;
        padding-left: 1px; // for visual alignment with the new tab icon
    }
</style>
