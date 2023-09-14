import { Router } from "express";
import { loggerDev, loggerProd } from  "../utils/logger.js";

const loggerTestRouter = Router();

loggerTestRouter.get("/", (req, res) => {

  loggerDev.fatal("Este es un mensaje de log fatal");
  loggerDev.error("Este es un mensaje de log de error");
  loggerDev.warning("Este es un mensaje de log de advertencia");
  loggerDev.info("Este es un mensaje de log de información");
  loggerDev.http("Este es un mensaje de log HTTP");
  loggerDev.debug("Este es un mensaje de log debug");

;
  
  res.send("Registro de prueba de logs completado.");
});

export default loggerTestRouter;
