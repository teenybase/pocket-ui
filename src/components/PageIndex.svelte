<script lang="ts">
    import { replace } from "svelte-spa-router";
    import {ApiClient} from "@/utils/ApiClient";
    import {superuser} from "@/stores/superuser";
    import {get} from "svelte/store";

    handler();

    function handler() {
        if (get(superuser)?.email) {
            replace("/tables");
        } else {
            replace("/login");
            // ApiClient.logout();
        }
    }
</script>
