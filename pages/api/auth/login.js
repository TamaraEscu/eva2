import { login } from "../../../controllers/authController";

export default async function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ mensaje: "Método no permitido" });
  }

  return login(req, res);
}
