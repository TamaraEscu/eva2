import { useState } from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import styles from "../styles/Auth.module.css";

export default function Login() {
  const router = useRouter();
  const [correo, setCorreo] = useState("");
  const [clave, setClave] = useState("");
  const [cargando, setCargando] = useState(false);
  const [resultado, setResultado] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    setCargando(true);
    setResultado(null);

    try {
      const respuesta = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ correo, clave }),
      });

      const data = await respuesta.json();

      if (!respuesta.ok) {
        setResultado({ tipo: "error", mensaje: data.mensaje });
        return;
      }

      setResultado({
        tipo: "success",
        mensaje: `${data.mensaje}. Bienvenido, ${data.usuario.nombre}.`,
      });

      router.push("/dashboard");
    } catch (error) {
      setResultado({ tipo: "error", mensaje: "No se pudo conectar con el servidor" });
    } finally {
      setCargando(false);
    }
  }

  return (
    <div className={styles.container}>
      <div className={styles.card}>
        <h1 className={styles.title}>Iniciar Sesión</h1>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.field}>
            <label htmlFor="correo">Correo</label>
            <input
              id="correo"
              type="email"
              value={correo}
              onChange={(e) => setCorreo(e.target.value)}
              required
            />
          </div>

          <div className={styles.field}>
            <label htmlFor="clave">Clave</label>
            <input
              id="clave"
              type="password"
              value={clave}
              onChange={(e) => setClave(e.target.value)}
              required
            />
          </div>

          <button className={styles.button} type="submit" disabled={cargando}>
            {cargando ? "Ingresando..." : "Ingresar"}
          </button>
        </form>

        {resultado && (
          <div className={`${styles.message} ${styles[resultado.tipo]}`}>
            {resultado.mensaje}
          </div>
        )}

        <div className={styles.link}>
          ¿No tienes cuenta? <Link href="/register">Regístrate</Link>
        </div>
      </div>
    </div>
  );
}
