import { listar, crear } from "../../../controllers/proyectoController";

export default async function handler(req, res) {
  if (req.method === "GET") {
    return listar(req, res);
  }

  if (req.method === "POST") {
    return crear(req, res);
  }

  res.setHeader("Allow", ["GET", "POST"]);
  return res.status(405).json({ mensaje: "Método no permitido" });
}
