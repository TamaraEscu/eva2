import { jwtVerify } from "jose";
import sequelize from "../lib/db";
import Usuario from "../models/Usuario";
import styles from "../styles/Auth.module.css";

const secretoJWT = new TextEncoder().encode(process.env.JWT_SECRET);

export async function getServerSideProps({ req }) {
  const token = req.cookies.token;

  if (!token) {
    return { redirect: { destination: "/login", permanent: false } };
  }

  try {
    const { payload } = await jwtVerify(token, secretoJWT);
    await sequelize.sync();
    const usuario = await Usuario.findByPk(payload.id);

    if (!usuario) {
      return { redirect: { destination: "/login", permanent: false } };
    }

    return {
      props: {
        usuario: {
          id: usuario.id,
          nombre: usuario.nombre,
          correo: usuario.correo,
        },
      },
    };
  } catch (error) {
    return { redirect: { destination: "/login", permanent: false } };
  }
}

export default function Dashboard({ usuario }) {
  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Bienvenido, {usuario.nombre}</h1>
        <p>Correo: {usuario.correo}</p>
        <p>Esta página solo es visible si el JWT es válido (protegida por middleware.js).</p>
      </div>
    </div>
  );
}
