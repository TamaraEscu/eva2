import sequelize from "../lib/db";
import Proyecto from "../models/Proyecto";
import Usuario from "../models/Usuario";

async function sincronizarModelos() {
  await sequelize.sync();
}

export async function listar(req, res) {
  try {
    await sincronizarModelos();

    const proyectos = await Proyecto.findAll({
      include: { model: Usuario, attributes: ["id", "nombre", "correo"] },
      order: [["id", "DESC"]],
    });

    return res.status(200).json({ proyectos });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al listar proyectos", error: error.message });
  }
}

export async function obtener(req, res) {
  const { id } = req.query;

  try {
    await sincronizarModelos();

    const proyecto = await Proyecto.findByPk(id, {
      include: { model: Usuario, attributes: ["id", "nombre", "correo"] },
    });

    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    return res.status(200).json({ proyecto });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al obtener proyecto", error: error.message });
  }
}

export async function crear(req, res) {
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body || {};
  const created_by = req.headers["x-user-id"];

  if (!nombre || !fecha_inicio || !estado || !responsable || monto === undefined) {
    return res.status(400).json({
      mensaje:
        "Nombre, fecha_inicio, estado, responsable y monto son obligatorios",
    });
  }

  if (!created_by) {
    return res.status(401).json({ mensaje: "No autenticado" });
  }

  try {
    await sincronizarModelos();

    const proyecto = await Proyecto.create({
      nombre,
      fecha_inicio,
      estado,
      responsable,
      monto,
      created_by,
    });

    return res
      .status(201)
      .json({ mensaje: "Proyecto creado correctamente", proyecto });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al crear proyecto", error: error.message });
  }
}

export async function actualizar(req, res) {
  const { id } = req.query;
  const { nombre, fecha_inicio, estado, responsable, monto } = req.body || {};

  try {
    await sincronizarModelos();

    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    await proyecto.update({
      ...(nombre !== undefined && { nombre }),
      ...(fecha_inicio !== undefined && { fecha_inicio }),
      ...(estado !== undefined && { estado }),
      ...(responsable !== undefined && { responsable }),
      ...(monto !== undefined && { monto }),
    });

    return res
      .status(200)
      .json({ mensaje: "Proyecto actualizado correctamente", proyecto });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al actualizar proyecto", error: error.message });
  }
}

export async function eliminar(req, res) {
  const { id } = req.query;

  try {
    await sincronizarModelos();

    const proyecto = await Proyecto.findByPk(id);
    if (!proyecto) {
      return res.status(404).json({ mensaje: "Proyecto no encontrado" });
    }

    await proyecto.destroy();

    return res.status(200).json({ mensaje: "Proyecto eliminado correctamente" });
  } catch (error) {
    return res
      .status(500)
      .json({ mensaje: "Error al eliminar proyecto", error: error.message });
  }
}
