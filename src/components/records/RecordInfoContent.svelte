<script lang="ts">
    import RecordFileThumb from "@/components/records/RecordFileThumb.svelte";
    import RecordInfoContent from "@/components/records/RecordInfoContent.svelte";
    import {type CollectionField, type CollectionRecord, collections} from "@/stores/collections";
    import CommonHelper from "@/utils/CommonHelper";

    export let record: CollectionRecord;
    export let fieldName: string | null = null;
    export let otherFields = false;

    let fileDisplayFields: CollectionField[] = [];
    let nonFileDisplayFields: CollectionField[] = [];

    $: collection = $collections?.find((item) => item.name == record?.collectionName);
    $: otherFieldsList = otherFields ? collection?.fields.filter((f) => f.type != "file" && f.type !== "json" && f.type !== "blob" && f.type !== "editor" && f.type !== "date" && f.type !== "select"
        && f.name !== fieldName && !f.hidden
        && record[f.name] !== undefined
        && !nonFileDisplayFields.includes(f)) : [];

    $: if (collection && !fieldName) {
        loadDisplayFields();
    }

    function loadDisplayFields() {
        const fields = collection?.fields || [];

        fileDisplayFields = fields.filter((f) => !f.hidden && f.presentable && f.type == "file");
        nonFileDisplayFields = fields.filter((f) => !f.hidden && f.presentable && f.type != "file");

        // fallback to the first single file field that accept images
        // if no presentable field is available
        if (!fileDisplayFields.length && !nonFileDisplayFields.length) {
            const fallbackFileField = fields.find((f) => {
                return (
                    !f.hidden &&
                    f.type == "file" &&
                    f.maxSelect == 1 &&
                    f.mimeTypes?.find((t) => t.startsWith("image/"))
                );
            });
            if (fallbackFileField) {
                fileDisplayFields.push(fallbackFileField);
            }
        }
    }
</script>

{#if fieldName && record[fieldName] !== undefined}
    {CommonHelper.truncate(CommonHelper.displayValue(record, [fieldName]), 70)}
{:else}

{#each fileDisplayFields as field}
    {@const filenames = CommonHelper.toArray(record[field.name]).slice(0, 5)}
    {#each filenames as filename}
        {#if !CommonHelper.isEmpty(filename)}
            <RecordFileThumb {record} {filename} size="xs" />
        {/if}
    {/each}
{/each}

{#each nonFileDisplayFields as field, i}
    {#if i > 0},{/if}

    {#if field.type === "relation" && record['expand_'+field.name]}
        <RecordInfoContent record={record['expand_'+field.name]} />
    {:else if field.type === "relation" && record[field.name]}
        <RecordInfoContent record={record[field.name]} />
    {:else}
        {CommonHelper.truncate(CommonHelper.displayValue(record, [field.name]), 70)}
    {/if}
{:else}
    {CommonHelper.truncate(CommonHelper.displayValue(record, []), 70)}
{/each}
{/if}

{#if otherFieldsList?.length}
    [
    {CommonHelper.truncate(otherFieldsList.map(field=>CommonHelper.displayValue(record, [field.name])).join(', '), 100)}
    ]
{/if}