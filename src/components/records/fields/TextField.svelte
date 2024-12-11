<script>
    import CommonHelper from "@/utils/CommonHelper";
    import Field from "@/components/base/Field.svelte";
    import AutoExpandTextarea from "@/components/base/AutoExpandTextarea.svelte";
    import FieldLabel from "@/components/records/fields/FieldLabel.svelte";

    export let original;
    export let field;
    export let readonly = false;
    export let value = undefined;

    $: hasAutogenerate = !CommonHelper.isEmpty(field.autogeneratePattern) && !original?.id;

    $: isRequired = field.notNull && !hasAutogenerate;
</script>

<Field class="form-field {isRequired ? 'required' : ''} {readonly ? 'readonly readonly-label' : ''}" name={field.name} let:uniqueId>
    <FieldLabel {uniqueId} {field} />

    <AutoExpandTextarea
        id={uniqueId}
        readonly={readonly}
        required={isRequired}
        placeholder={hasAutogenerate ? "Leave empty to autogenerate..." : ""}
        bind:value
    />
</Field>
