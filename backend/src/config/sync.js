const sequelize = require("./database");
const config = require("./env");

/**
 * Synchronises the database schema.
 * Run with `npm run db:sync`. Using alter:false in production
 * style code avoids accidental destructive changes.
 */
async function syncDb() {
  try {
    // Models are imported so that associations register before sync.
    require("../models");
    await sequelize.authenticate();
    console.log("[db] Connection established successfully.");
    await sequelize.sync({ alter: false });
    console.log("[db] Database synced successfully.");
    process.exit(0);
  } catch (error) {
    console.error("[db] Unable to sync database:", error);
    process.exit(1);
  }
}

if (require.main === module) {
  syncDb();
}

module.exports = syncDb;
