# Pocket UI for teenybase

Forked Superuser UI from [pocketbase](https://github.com/pocketbase/pocketbase) and modified for use in [teenybase](https://teenybase.com/index.html).
> teenybase is in pre-alpha and not suitable for production use yet.

## Usage 

```javascript
// Create a $Database
const db = new $Database(c, undefined, c.env.PRIMARY_DB, c.env.PRIMARY_R2)

// Get the base url
const baseUrl = 'https://cdn.jsdelivr.net/npm/@teenybase/pocket-ui@latest/dist/'

// Add the PocketUIExtension
db.extensions.push(new PocketUIExtension(db, baseUrl))
```

The `PocketUIExtension` handles routes `/api/v1/pocket/*`.

Open the UI in the browser and use `ADMIN_SERVICE_TOKEN` for login as `viewer`/`editor`/`superadmin` role.