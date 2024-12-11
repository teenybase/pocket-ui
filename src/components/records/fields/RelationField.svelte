<script lang="ts">
    import { onDestroy } from "svelte";
    import tooltip from "@/actions/tooltip";
    import type {CollectionField, CollectionRecord} from "@/stores/collections";
    import Draggable from "@/components/base/Draggable.svelte";
    import Field from "@/components/base/Field.svelte";
    import RecordInfo from "@/components/records/RecordInfo.svelte";
    import RecordsPicker from "@/components/records/RecordsPicker.svelte";
    import {ApiClient, OROperator} from "@/utils/ApiClient";
    import CommonHelper from "@/utils/CommonHelper";
    import FieldLabel from "@/components/records/fields/FieldLabel.svelte";

    const batchSize = 100;

    export let field: CollectionField;
    export let value: any | any[];
    let valueId: string | string[] = '';
    export let readonly = false;
    export let picker: RecordsPicker;

    let fieldRef: Field;
    let list: CollectionRecord[] = [];
    let isLoading = false;
    let loadTimeoutId: ReturnType<typeof setTimeout>;
    let invalidIds: string[] = [];

    $: isMultiple = field.maxSelect??1 > 1;

    $: if (typeof value != "undefined") {
        fieldRef?.changed();
    }
    // $: console.log("RelationField", field.name, value, list);
    $: destColumn = field.foreignKey?.column || "id";

    $: if (needLoad(list, value)) {
        isLoading = true;
        // Move the load function to the end of the execution queue.
        //
        // It helps reducing the layout shifts (the relation field has fixed height skeleton loader)
        // and allows the other form fields to load sooner.
        clearTimeout(loadTimeoutId);
        loadTimeoutId = setTimeout(load, 0);
    }

    function needLoad() {
        if (isLoading) {
            return false;
        }

        const ids = CommonHelper.toArray(value).filter(f=>f!==undefined);

        list = list.filter((item) => ids.includes(item[destColumn]));

        return ids.length !== list.length;
    }

    async function load() {
        const ids = CommonHelper.toArray(value).filter(f=>f!==undefined);

        // reset
        list = [];
        invalidIds = [];

        if (!field.foreignKey?.table || !ids.length) {
            isLoading = false;
            return;
        }

        isLoading = true;

        // let expand = "";
        // const presentableRelFields = $collections
        //     .find((c) => c.name == field.collectionName)
        //     ?.fields?.filter((f) => !f.hidden && f.presentable && f.type == "relation");
        // for (const field of presentableRelFields) {
        //     const expandItem = CommonHelper.getExpandPresentableRelField(field, $collections, 2);
        //     if (expandItem) {
        //         if (expand != "") {
        //             expand += ",";
        //         }
        //         expand += expandItem;
        //     }
        // }

        // batch load all selected records to avoid parser stack overflow errors
        const filterIds = ids.slice();
        const loadPromises = [];
        while (filterIds.length > 0) {
            const filters = [];
            for (const id of filterIds.splice(0, batchSize)) {
                filters.push(`${destColumn}=${JSON.stringify(id)}`);
            }

            loadPromises.push(
                ApiClient.getList(field.foreignKey.table, 0, batchSize, {
                    filter: filters.join(OROperator),
                    fields: ["*"],
                    // expand: expand,
                    requestKey: null,
                }),
            );
        }

        try {
            let loadedItems: CollectionRecord[] = [];
            await Promise.all(loadPromises).then((values) => {
                loadedItems = loadedItems.concat(...values.map((v) => v.items));
            });
            // console.log("load", loadedItems);

            // preserve selected order
            for (const id of ids) {
                const rel = CommonHelper.findByKey(loadedItems, destColumn, id);
                if (rel) {
                    list.push(rel);
                } else {
                    invalidIds.push(id);
                }
            }

            list = list;

            // ensure that any record that was deleted during the request
            // is also removed from the relation value
            listToValue();
        } catch (err: any) {
            ApiClient.error(err);
        }

        isLoading = false;
    }

    function remove(rel: CollectionRecord) {
        CommonHelper.removeByKey(list, "id", rel.id);
        list = list;

        listToValue();
    }

    function listToValue() {
        if (isMultiple) {
            value = list.map((r) => r[destColumn]);
            valueId = list.map((r) => r.id);
        } else {
            value = list[0]?.[destColumn] ?? null;
            valueId = list[0]?.id ?? "";
        }
    }

    onDestroy(() => {
        clearTimeout(loadTimeoutId);
    });
</script>

<Field
    bind:this={fieldRef}
    class="form-field form-field-list {field.notNull ? 'required' : ''}"
    name={field.name}
    let:uniqueId
>
    <FieldLabel {uniqueId} {field}>
        {#if invalidIds.length}
            <i
                class="ri-error-warning-line link-hint m-l-auto flex-order-10"
                use:tooltip={{
                    position: "left",
                    text:
                        "The following relation ids were removed from the list because they are missing or invalid: " +
                        invalidIds.join(", "),
                }}
            />
        {/if}
    </FieldLabel>

    <div class="list">
        <div class="relations-list">
            {#each list as record, i (record.id)}
                <Draggable
                    bind:list
                    group={field.name + "_relation"}
                    index={i}
                    disabled={!isMultiple||readonly}
                    let:dragging
                    let:dragover
                    on:sort={() => {
                        listToValue();
                    }}
                >
                    <div class="list-item" class:dragging class:dragover>
                        <div class="content">
                            <RecordInfo {record} fieldName={field.foreignKey?.column ?? null} otherFields={true}/>
                        </div>
                        <div class="actions">
                            <button
                                type="button"
                                class="btn btn-transparent btn-hint btn-sm btn-circle btn-remove"
                                use:tooltip={"Remove"}
                                disabled={readonly}
                                on:click={() => remove(record)}
                            >
                                <i class="ri-close-line" />
                            </button>
                        </div>
                    </div>
                </Draggable>
            {:else}
                {#if isLoading}
                    {#each CommonHelper.toArray(value).slice(0, 10) as _}
                        <div class="list-item">
                            <div class="skeleton-loader" />
                        </div>
                    {/each}
                {/if}
            {/each}
        </div>

        <div class="list-item list-item-btn">
            <button
                type="button"
                disabled={readonly}
                class="btn btn-transparent btn-sm btn-block"
                on:click={() => picker?.show()}
            >
                <i class="ri-magic-line" />
                <!-- <i class="ri-layout-line" /> -->
                <span class="txt">Open picker</span>
            </button>
        </div>
    </div>
</Field>
{#if !readonly}
<RecordsPicker
    bind:this={picker}
    value={valueId}
    {field}
    on:save={(e) => {
        list = e.detail || [];
        value = isMultiple ? list.map((r) => r[destColumn]) : list[0]?.[destColumn] || null;
        valueId = isMultiple ? list.map((r) => r.id) : list[0]?.id || "";
    }}
/>
{/if}

<style lang="scss">
    .relations-list {
        max-height: 300px;
        overflow: auto; /* fallback */
        overflow: overlay;
    }
</style>
