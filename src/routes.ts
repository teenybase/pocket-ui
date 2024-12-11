import PageIndex from "@/components/PageIndex.svelte";
import PageRecords from "@/components/records/PageRecords.svelte";
import PageSuperuserLogin from "@/components/superuser/PageSuperuserLogin.svelte";
import {wrap} from "svelte-spa-router/wrap";
import {superuser} from "@/stores/superuser";
import {get} from "svelte/store";

const routes = {
    "/tables": wrap({
        component: PageRecords,
        conditions: [(_) => !!get(superuser)?.email],
        userData: { showAppSidebar: true },
    }),
    "/login": wrap({
        component: PageSuperuserLogin,
        conditions: [(_) => !get(superuser)?.email],
        userData: { showAppSidebar: false },
    }),

    // catch-all fallback
    "*": wrap({
        component: PageIndex,
        userData: { showAppSidebar: false },
    }),
};

export default routes;
