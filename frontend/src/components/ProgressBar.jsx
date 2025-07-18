import { useEffect } from "react";
import { useNavigation } from "react-router";
import NProgress from "nprogress";

NProgress.configure({
  showSpinner: false,
  trickleSpeed: 200,
  minimum: 0.1,
});

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
