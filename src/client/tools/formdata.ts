/**
 * Checks if the specified value is a file (aka. File, Blob, RN file object).
 */
export function isFile(val: any): boolean {
    return (
        (typeof Blob !== "undefined" && val instanceof Blob) ||
        (typeof File !== "undefined" && val instanceof File) ||
        // check for React Native file object format
        // (see https://github.com/pocketbase/pocketbase/discussions/2002#discussioncomment-5254168)
        (val !== null &&
            typeof val === "object" &&
            val.uri &&
            ((typeof navigator !== "undefined" && navigator.product === "ReactNative") ||
                (typeof global !== "undefined" && (global as any).HermesInternal)))
    );
}

/**
 * Loosely checks if the specified body is a FormData instance.
 */
export function isFormData(body: any): boolean {
    return (
        body &&
        // we are checking the constructor name because FormData
        // is not available natively in some environments and the
        // polyfill(s) may not be globally accessible
        (body.constructor.name === "FormData" ||
            // fallback to global FormData instance check
            // note: this is needed because the constructor.name could be different in case of
            //       custom global FormData implementation, eg. React Native on Android/iOS
            (typeof FormData !== "undefined" && body instanceof FormData))
    );
}

/**
 * Checks if the submitted body object has at least one Blob/File field value.
 */
export function hasFileField(body: { [key: string]: any }, deep = true): boolean {
    for (const key in body) {
        const values = Array.isArray(body[key]) ? body[key] : [body[key]];
        for (const v of values) {
            if (isFile(v)) {
                return true;
            }
            if(deep && typeof v === "object" && hasFileField(v, deep)) {
                return true;
            }
        }
    }
    return false
}

/**
 * Separate all Blob/File and other field values.
 */
export function removeFileFields(body: { [key: string]: any }, deep = true, path = ''): { [key: string]: any } {
    path = path + (path ? '.' : '')
    const files = []
    const body2: any = {}
    for (const key in body) {
        const values = Array.isArray(body[key]) ? body[key] : [body[key]];
        const hasFiles = !!values.find(f=>isFile(f))
        if(hasFiles) {
            files.push([path + key, values])
        }else {
            for (const v of values) {
                if (typeof v === "object") {
                    const res = removeFileFields(v, deep, path + key)
                    body2[key] = res.body
                    files.push(...res.files)
                } else {
                    body2[key] = v
                }
            }
        }
    }
    return {files, body: body2}
}

/**
 * Converts analyzes the provided body and converts it to FormData
 * in case a plain object with File/Blob values is used.
 */
export function convertToFormDataIfNeeded(body: any): any {
    if (
        typeof FormData === "undefined" ||
        typeof body === "undefined" ||
        typeof body !== "object" ||
        body === null ||
        isFormData(body) ||
        !hasFileField(body)
    ) {
        return body;
    }

    const form = new FormData();

    const {files, body: body2} = removeFileFields(body)
    console.log(body)
    console.log(files)
    console.log(body2)
    form.append("@jsonPayload", JSON.stringify(body2));

    for (const [key, val] of files) {
        // in case of mixed string and file/blob
        const normalizedVal = Array.isArray(val) ? val : [val];
        for (let v of normalizedVal) {
            form.append(key, v);
        }
    }

    console.log([...form.entries()])

    return form;
}
