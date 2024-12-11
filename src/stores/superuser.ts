import { writable } from "svelte/store";

type Superuser = {id?: string, email?: string};
// logged app superuser
export const superuser = writable<Superuser>({});

export function setSuperuser(model: any) {
    superuser.set(model || {});
}
