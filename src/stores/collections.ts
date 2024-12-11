import {ApiClient} from "@/utils/ApiClient";
import CommonHelper from "@/utils/CommonHelper";
import { get, writable } from "svelte/store";
import type {TableData, TableFieldData} from "teenybase";

export type Collection = TableData<CollectionField> & {
    system?: boolean,
    type?: 'auth'|'base'|'view'
}

export type CollectionField = TableFieldData & {
    collectionName?: string;

    hidden?: boolean;
    presentable?: boolean;
    protected?: boolean; // for files?

    // for files
    maxSelect?: 1; //(allowMultiple)
    mimeTypes?: string[];
}
export type CollectionRecord = {
    collectionName: string;
    id: string
    [key: string]: string | number | boolean | null | object | undefined;
}

export const collections = writable<Collection[]>([]);
export const activeCollection = writable<Collection|null>(null);
export const isCollectionsLoading = writable(false);
// export const protectedFilesCollectionsCache = writable({});
export const scaffolds = writable({});

let notifyChannel: BroadcastChannel | null = null;

if (typeof BroadcastChannel != "undefined") {
    notifyChannel = new BroadcastChannel("collections");

    notifyChannel.onmessage = () => {
        loadCollections(get(activeCollection)?.name)
    }
}

function notifyOtherTabs() {
    notifyChannel?.postMessage("reload");
}

export function changeActiveCollectionByIdOrName(collectionIdOrName: string) {
    collections.update((list) => {
        const found = list.find((c) => c.name == collectionIdOrName);
        if (found) {
            activeCollection.set(found);
        } else if (list.length) {
            activeCollection.set(list.find((c) => !c.system) || list[0]);
        }

        return list;
    });
}

// add or update collection
export function addCollection(collection: Collection) {
    activeCollection.update((current) => {
        return CommonHelper.isEmpty(current?.name) || current?.name === collection.name ? collection : current;
    });

    collections.update((list) => {
        CommonHelper.pushOrReplaceByKey(list, collection, "name");

        refreshProtectedFilesCollectionsCache();

        notifyOtherTabs();

        return CommonHelper.sortCollections(list);
    });
}

export function removeCollection(collection: Collection) {
    collections.update((list) => {
        CommonHelper.removeByKey(list, "name", collection.name);

        activeCollection.update((current) => {
            if (current?.name === collection.name) {
                return list.find((c) => !c.system) || list[0];
            }
            return current;
        });

        refreshProtectedFilesCollectionsCache();

        notifyOtherTabs();

        return list;
    });
}

// load all collections
export async function loadCollections(activeIdOrName: string|null = null) {
    isCollectionsLoading.set(true);

    try {
        // let items = await ApiClient.collections.getFullList(200, {
        //     "sort": "+name",
        // })
        let items: Collection[] = await ApiClient.getCollections() as any

        items = CommonHelper.sortCollections(items);

        collections.set(items);

        const item = activeIdOrName && items.find((c) => c.name == activeIdOrName);
        if (item) {
            activeCollection.set(item);
        } else if (items.length) {
            activeCollection.set(items.find((c) => !c.system) || items[0]);
        }

        refreshProtectedFilesCollectionsCache();

        scaffolds.set(await ApiClient.getScaffolds());
    } catch (err: any) {
        ApiClient.error(err);
    }

    isCollectionsLoading.set(false);
}

function refreshProtectedFilesCollectionsCache() {
    // protectedFilesCollectionsCache.update((cache) => {
    //     collections.update((current) => {
    //         for (let c of current) {
    //             cache[c.id] = !!c.fields?.find((f) => f.type == "file" && f.protected);
    //         }
    //
    //         return current;
    //     });
    //
    //     return cache;
    // });
}

