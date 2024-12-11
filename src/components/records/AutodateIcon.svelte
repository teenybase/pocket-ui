<script lang="ts">
    import tooltip from "@/actions/tooltip";
    import {type CollectionRecord, collections} from "@/stores/collections";
    import CommonHelper from "@/utils/CommonHelper";

    const detailedDateFormat = "yyyy-MM-dd HH:mm:ss.SSS";

    export let record: Partial<CollectionRecord>;

    let tooltipDates: string[] = [];

    $: collection = record && $collections.find((c) => c.name == record.collectionName);

    $: if (record) {
        refreshTooltipDates();
    }

    function refreshTooltipDates() {
        tooltipDates = [];

        const fields = collection?.fields || [];

        for (let field of fields) {
            if (field.usage != "record_created" && field.usage != "record_updated") {
                continue;
            }

            tooltipDates.push(
                field.name +
                    ": " +
                    CommonHelper.formatToLocalDate(record[field.name] as any, detailedDateFormat) +
                    " Local",
            );
        }
    }
</script>

<i
    class="ri-calendar-event-line txt-disabled"
    use:tooltip={{
        text: tooltipDates.join("\n"),
        position: "left",
    }}
/>
