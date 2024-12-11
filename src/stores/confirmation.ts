import { writable } from "svelte/store";

type Confirmation = {
    text: string,
    yesCallback: Function,
    noCallback: Function,
}
// eg.
// {
//   "text":        "Do you really want to delete the selectedItem",
//   "yesCallback": function() {...},
//   "noCallback":  function() {...},
// }
export const confirmation = writable<Partial<Confirmation>>({});

/**
 * @param {String}   text
 * @param {Function} [yesCallback]
 * @param {Function} [noCallback]
 */
export function confirm(text:string, yesCallback:Function, noCallback?:Function) {
    confirmation.set({
        text:        text,
        yesCallback: yesCallback,
        noCallback:  noCallback,
    });
}

export function resetConfirmation() {
    confirmation.set({});
}
