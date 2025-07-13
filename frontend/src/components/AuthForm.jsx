import { Form, useNavigation } from "react-router";
import classes from "./styles/AuthForm.module.css";

export default function AuthForm() {
    const navigation=useNavigation();
    const isSubmitting=navigation.state==="submitting"

  return (
    <div className={classes["login-container"]}>
      <Form className={classes["login-form"]} method="post">
        <h2 className={classes.title}>Login</h2>

        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder="Enter your email"
          required
        />

        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Enter your password"
          required
        />

        <button type="submit" disabled={isSubmitting}>
            { isSubmitting?"Logging In":"Log In" }
        </button>
      </Form>
    </div>
  );
}
