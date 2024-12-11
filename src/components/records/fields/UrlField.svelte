<script>
    import Field from "@/components/base/Field.svelte";
    import FieldLabel from "@/components/records/fields/FieldLabel.svelte";

    export let field;
    export let readonly = false;
    export let value = undefined;
</script>

<Field class="form-field {field.notNull ? 'required' : ''} {readonly ? 'readonly readonly-label' : ''}" name={field.name} let:uniqueId>
    <FieldLabel {uniqueId} {field} />

    <input type="url" id={uniqueId} readonly={readonly} required={field.notNull} bind:value />
</Field>
