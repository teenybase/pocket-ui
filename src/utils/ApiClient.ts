import type {DatabaseSettings} from "teenybase";
import {addErrorToast} from "@/stores/toasts";
import CommonHelper from "@/utils/CommonHelper";
import {setErrors} from "@/stores/errors";
import {replace} from "svelte-spa-router";
import {Collection, CollectionField, type CollectionRecord} from "@/stores/collections";
import Client from "@/client/Client";
import {setSuperuser} from "@/stores/superuser";
import {AuthRecord, BaseAuthStore} from "@/client/stores/BaseAuthStore";
import {ClientResponseError} from "@/client/ClientResponseError";

class ApiClient_ extends Client{
    private settings: DatabaseSettings = {
        appName: "Teeny Ui",
        appUrl: "",
        jwtSecret: "$JWT_SECRET",
        tables: [],
    }
    hideControls = false

    files = {
        getURL: (record: CollectionRecord|null, filename: string, ops: {
            thumb?: string
            token?: string
        })=>{
            if(!record) return ""
            return this.baseURL + '/files/' + record.collectionName + '/' + record.id + '/' + filename + '?token=' + ops.token
        }
    }

    async getSuperuserFileToken(collectionId: string){
        return ""
    }

    logout(){
        this.authStore.clear()
        // return replace("/")
        window.location.href = './logout'
    }

    private _settingsLoading: Promise<DatabaseSettings>|undefined
    // load or refresh
    async loadSettings(){
        if(this._settingsLoading){
            return this._settingsLoading
        }
        this._settingsLoading = this.send('/settings', {
            method: 'GET'
            // headers
        })
        this.settings = await this._settingsLoading
        this._settingsLoading = undefined
        return this.settings
    }

    async getScaffolds(){
        return {}
    }

    async getCollections(): Promise<Collection[]>{
        await this.loadSettings()
        return this.settings.tables.map(t=>{
            return {
                type: t.extensions.find(e=>e.name === 'auth') ? 'auth' : 'base',
                ...t,
                fields: t.fields.map(f=>{
                    return {
                        ...f,
                        collectionName: t.name,
                        maxSelect: 1, // required in RecordsPicker, change when array fields supported
                    } as CollectionField
                })
            }
        })
    }

    async getList(table: string, page: number, perPage: number, options: {
        filter: string,
        sort?: string
        fields: string[]
        requestKey: string|null
    }){
        const res = await this.send(`/table/${table}/select`, {
            method: 'post',
            body: ({
                limit: perPage,
                offset: Math.max(page-1, 0) * perPage,
                select: options.fields,
                where: options.filter,
                sort: options.sort
            }),
            requestKey: options.requestKey
        })
        res.forEach((item: CollectionRecord)=>{
            if(item.password) delete item.password // todo when logged in as admin, it returns noSelect fields in *
            item.collectionName = table
        })
        return {
            page, items: res,
        }
    }

    async createRecord(table: string, data: FormData){
        // todo
        const body = {values: Object.fromEntries(data.entries()), returning: "*"}
        // console.log(body)

        const res = await this.send(`/table/${table}/insert`, {
            method: 'post',
            body,
            requestKey: 'createRecord'
        })
        return res
    }

    async updateRecord(table: string, record: string, data: any){
        const body = {
            setValues: Object.fromEntries(data.entries()),
            returning: "*",
            where: `id = ${JSON.stringify(record)}`
        }
        // console.log(body)

        const res = await this.send(`/table/${table}/update`, {
            method: 'post',
            body,
            requestKey: 'updateRecord'
        })
        return res
    }

    async deleteRecord(table: string, record: string){
        const res = await this.send(`/table/${table}/delete`, {
            method: 'post',
            body: ({
                where: `id = ${JSON.stringify(record)}`
            }),
            requestKey: 'deleteRecord'
        })
        return res
    }

    async getOne(table: string, record: string){
        const res = await this.send(`/table/${table}/select`, {
            method: 'post',
            body: ({
                limit: 1,
                select: ['*'],
                where: `id = ${JSON.stringify(record)}`,
            }),
            requestKey: 'getOneRecord'
        })
        if(res[0]) {
            if(res[0].password) delete res[0].password // todo when logged in as admin, it returns noSelect fields in *
            res[0].collectionName = table
        }
        return res?.[0]??null
    }

    /**
     * Generic API error response handler.
     *
     * @param  {Error}   err        The API error itself.
     * @param  {Boolean} notify     Whether to add a toast notification.
     * @param  {String}  defaultMsg Default toast notification message if the error doesn't have one.
     */
    error = (err: Error, notify = true, defaultMsg = "")=> {
        console.error(err)
        if (!err || !(err instanceof Error) || (err as any).isAbort) {
            return;
        }

        const statusCode = ((err as any)?.status << 0) || 400;
        const responseData = (err as any)?.data || {};
        const msg = responseData.message || err.message || defaultMsg;

        // console.log(statusCode, responseData, msg)

        // add toast error notification
        if (notify && msg) {
            addErrorToast(msg);
        }

        // populate form field errors
        if (!CommonHelper.isEmpty(responseData.data)) {
            let data = responseData.data
            if(responseData.issues) { // zod
                // todo we are flattening for now
                data = Object.fromEntries(Object.entries(data as Record<string, any>).map(([k, v])=>{
                    return [k, v._errors ? v._errors.join(', ') : Array.isArray(v) ? v.join(', ') : v?.toString()]
                }));
            }
            setErrors(data);
            // console.log(data)
        }

        // unauthorized
        if (statusCode === 401) {
            this.cancelAllRequests();
            return this.logout();
        }

        // forbidden
        if (statusCode === 403) {
            this.cancelAllRequests();
            return replace("/");
        }
    }

    constructor(baseURL: string, authStore?: BaseAuthStore | null, lang?: string) {
        super(baseURL, authStore, lang);

        // if(!this.authStore.isValid || !get(superuser).id) {
        //     // this.send('/admin-login', {
        //     //     method: 'post',
        //     //     headers: {
        //     //         'Authorization': 'Bearer ' + 'sadaslfhdo'
        //     //     }
        //     // }).then(t => {
        //     //     this.authResponse(t)
        //     // })
        //     const cookie = document.cookie.split(';').find(c=>c.startsWith('teeny-pocket-access-token='))
        //     if(cookie){
        //         const token = decodeURIComponent(cookie.split('=')[1])
        //         const decoded = JSON.parse(atob(token.split('.')[1]))
        //         console.log(decoded, token)
        //         this.authStore.save(token, decoded)
        //     }
        // }
    }

    async login(username: string, password: string) {
        const res = await fetch('./login', {
            method: 'post',
            body: JSON.stringify({username, password}),
            headers: {'Content-Type': 'application/json'}
        }).catch(e=>{
            console.error(e)
            return null
        })
        if(!res) throw new Error('Unable to login, check console')
        if(res.status >= 400){
            throw new ClientResponseError({
                url: res.url,
                status: res.status,
                data: {message: 'Unable to login'},
            })
        }
        this.checkLoginCookie()
        return res
    }

    checkLoginCookie(){
        const superuserCookie = document.cookie.split(';').find(c=>c.startsWith('teeny-pocket-ui-user-data='))
        if(superuserCookie){
            const token = decodeURIComponent(superuserCookie.split('=')[1])
            const decoded = JSON.parse(atob(token))
            setSuperuser(decoded)
        }else {
            // ApiClient.logout()
        }
    }
}

export const ApiClient = new ApiClient_((import.meta as any).env.PB_BACKEND_URL || '/api/v1');

ApiClient.checkLoginCookie()

ApiClient.authStore.onChange((token: string, record: AuthRecord)=>{
    setSuperuser(record)
})

export const OROperator = "|"
export const ANDOperator = "&"