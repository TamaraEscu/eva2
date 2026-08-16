import { obtener, actualizar, eliminar } from "../../../controllers/proyectoController";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return obtener(req, res);
  }

  if (req.method === "PUT") {
    return actualizar(req, res);
  }

  if (req.method === "DELETE") {
    return eliminar(req, res);
  }

  res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
  return res.status(405).json({ mensaje: "Método no permitido" });
}
