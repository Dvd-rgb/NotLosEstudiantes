const db = require("./services/db");

async function testQuery() {
    try {
        const result = await db.query("SELECT NOW()");
        console.log("Database test result:", result);
    } catch (error) {
        console.error("Database connection failed:", error);
    }
}

testQuery();
