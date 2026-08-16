import bcrypt from "bcryptjs";
import { SignJWT } from "jose";
import sequelize from "../lib/db";
import Usuario from "../models/Usuario";
import "../models/Proyecto";

const secretoJWT = new TextEncoder().encode(process.env.JWT_SECRET);
const SALT_ROUNDS = 10;

async function sincronizarModelos() {
  await sequelize.sync();
}

export async function registrar(req, res) {
  const { nombre, correo, clave } = req.body || {};

  if (!nombre || !correo || !clave) {
    return res
      .status(400)
      .json({ mensaje: "Nombre, correo y clave son obligatorios" });
  }

  try {
    await sincronizarModelos();

    const usuarioExistente = await Usuario.findOne({ where: { correo } });
    if (usuarioExistente) {
      return res.status(409).json({ mensaje: "El correo ya está registrado" });
    }

    const claveCifrada = await bcrypt.hash(clave, SALT_ROUNDS);

    const nuevoUsuario = await Usuario.create({
      nombre,
      correo,
      clave: claveCifrada,
    });

    return res.status(201).json({
      mensaje: "Usuario registrado correctamente",
      usuario: {
        id: nuevoUsuario.id,
        nombre: nuevoUsuario.nombre,
        correo: nuevoUsuario.correo,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al registrar usuario", error: error.message });
  }
}

export async function login(req, res) {
  const { correo, clave } = req.body || {};

  if (!correo || !clave) {
    return res.status(400).json({ mensaje: "Correo y clave son obligatorios" });
  }

  try {
    await sincronizarModelos();

    const usuario = await Usuario.findOne({ where: { correo } });
    if (!usuario) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const claveValida = await bcrypt.compare(clave, usuario.clave);
    if (!claveValida) {
      return res.status(401).json({ mensaje: "Credenciales inválidas" });
    }

    const token = await new SignJWT({
      id: usuario.id,
      nombre: usuario.nombre,
      correo: usuario.correo,
    })
      .setProtectedHeader({ alg: "HS256" })
      .setIssuedAt()
      .setExpirationTime("2h")
      .sign(secretoJWT);

    res.setHeader(
      "Set-Cookie",
      `token=${token}; HttpOnly; Path=/; Max-Age=7200; SameSite=Strict`
    );

    return res.status(200).json({
      mensaje: "Inicio de sesión exitoso",
      token,
      usuario: {
        id: usuario.id,
        nombre: usuario.nombre,
        correo: usuario.correo,
      },
    });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al iniciar sesión", error: error.message });
  }
}
