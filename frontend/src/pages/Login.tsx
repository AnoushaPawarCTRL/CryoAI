import { Link, useNavigate } from "react-router-dom";
import { loginUser } from "../api/auth.ts";
import { SubmitHandler, useForm } from "react-hook-form";
import styles from "./login.module.css";
import { useState } from "react";
import { Loading } from "../components/loading/Loading.tsx";
import iceberg from "../assets/iceberg.png";

interface FormInput {
  email: string;
  password: string;
}

export function Login() {
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormInput>();

  const [submitting, setSubmitting] = useState<boolean>(false);
  const [backendError, setBackendError] = useState<string>("");

  const submitLogin: SubmitHandler<FormInput> = async (data) => {
    setSubmitting(true);
    setBackendError("");

    try {
      const response = await loginUser(data.email, data.password);

      console.log(response);

      navigate("/");
    } catch (err) {
      console.error(err);
      setBackendError("Login failed");
      setSubmitting(false);
    }
  };

  if (submitting) {
    return <Loading />;
  }

  return (
    <main>
      <section className={styles.container}>
        <img src={iceberg} alt="Iceberg logo" className={styles.logo} />
        <h1 className={styles.title}>CryoAI</h1>

        <form onSubmit={handleSubmit(submitLogin)} className={styles.form}>
          <input
            type="text"
            placeholder="Email"
            {...register("email", { required: true })}
          />

          <input
            type="password"
            placeholder="Password"
            {...register("password", { required: true })}
          />

          {!submitting ? (
            <input type="submit" value="Login" />
          ) : (
            <input type="submit" value="Logging in..." disabled />
          )}

          <section className={styles.errors}>
            {errors.email && (
              <span className={styles.error}>Please provide email</span>
            )}
            {errors.password && (
              <span className={styles.error}>Please provide password</span>
            )}
            {backendError && (
              <span className={styles.error}>{backendError}</span>
            )}
          </section>
        </form>

        <section className={styles.options}>
          <Link className={styles.link} to={"/signup"}>
            Don't have an account? Sign up
          </Link>
        </section>
      </section>
    </main>
  );
}