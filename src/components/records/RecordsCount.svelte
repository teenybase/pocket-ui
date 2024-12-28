<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import {ApiClient} from "@/utils/ApiClient";
    import CommonHelper from "@/utils/CommonHelper";
    import {type Collection} from "@/stores/collections";

    const dispatch = createEventDispatcher();

    export let collection: Collection|null = null;
    export let filter: string | -1 = "";
    export let totalCount = 0;

    let classes: string|undefined = undefined;
    export { classes as class }; // export reserved keyword

    let isLoading = false;

    $: if (collection?.name && filter !== -1) {
        reload();
    }

    export async function reload() {
        if (!collection?.name || filter === -1) {
            return;
        }

        isLoading = true;
        totalCount = 0;

        try {
            const fallbackSearchFields = CommonHelper.getAllCollectionIdentifiers(collection);
            const pkField = collection.fields.find(f=>f.primary)?.name ?? 'id'

            const result = await ApiClient.getList(collection.name, 1, 1, {
                filter: CommonHelper.normalizeSearchFilter(filter, fallbackSearchFields),
                fields: [`count(${pkField})=>totalItems`],
                requestKey: "records_count",
            });
            // const result = {totalItems: 100};
            totalCount = result.items[0].totalItems;
            dispatch("count", totalCount);
            isLoading = false;
        } catch (err: any) {
            if (!err?.isAbort) {
                isLoading = false;
                console.warn(err);
            }
        }
    }
</script>

<div class="inline-flex flex-gap-5 records-counter {classes}">
    <span class="txt">Total found:</span>
    <span class="txt">{!isLoading ? totalCount : "..."}</span>
</div>
