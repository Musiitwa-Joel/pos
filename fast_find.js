import { registryPool } from "./packages/server/config/config.js";

async function fastFind() {
    try {
        const [dbs] = await registryPool.query("SHOW DATABASES LIKE 'tred_%'");
        dbs.forEach(db => console.log(db[Object.keys(db)[0]]));
        process.exit(0);
    } catch (err) {
        process.exit(1);
    }
}
fastFind();
