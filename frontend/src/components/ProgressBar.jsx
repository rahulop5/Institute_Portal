import { useEffect } from "react";
import { useNavigation } from "react-router";
import NProgress from "nprogress";
// import "nprogress/nprogress.css";

NProgress.configure({ showSpinner: false });

export default function ProgressBar() {
  const navigation = useNavigation();

  useEffect(() => {
    if (navigation.state === "loading" || navigation.state==="submitting") {
      NProgress.start();
    } else {
      NProgress.done();
    }
  }, [navigation.state]);

  return null;
}
