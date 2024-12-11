<script>
    import Field from "@/components/base/Field.svelte";
    import FieldLabel from "@/components/records/fields/FieldLabel.svelte";

    export let field;
    export let readonly = false;
    export let value = false;
</script>

<Field class="form-field form-field-toggle {field.notNull ? 'required' : ''} {readonly ? 'readonly readonly-label' : ''}" name={field.name} let:uniqueId>
    <input type="checkbox" {readonly} id={uniqueId} bind:checked={value} />
    <FieldLabel {uniqueId} {field} icon={false} />
</Field>
