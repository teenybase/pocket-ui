<script>
    import Field from "@/components/base/Field.svelte";
    import FieldLabel from "@/components/records/fields/FieldLabel.svelte";

    export let field;
    export let readonly = false;
    export let value = undefined;
    export let integer = false;
</script>

<Field class="form-field {field.notNull ? 'required' : ''} {readonly ? 'readonly readonly-label' : ''}" name={field.name} let:uniqueId>
    <FieldLabel {uniqueId} {field} />

    <input
        type="number"
        id={uniqueId}
        readonly={readonly}
        required={field.notNull}
        min={field.min}
        max={field.max}
        step={integer?1:"any"}
        bind:value
    />
</Field>
