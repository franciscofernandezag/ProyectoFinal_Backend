import mongoose from 'mongoose';
import { loggerDev , loggerProd } from  "./utils/logger.js";

export function connectDatabase() {
  mongoose
    .connect(process.env.URL_MONGODB_ATLAS)
    .then(() => loggerDev.http("DB is connected"))
    .catch((error) => console.log("Error en MongoDB Atlas:", error));
}
