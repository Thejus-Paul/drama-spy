import messaging from "../messaging";
import dramaPage from "./dramaPage";
import homePage from "./homePage";

const router = (url: URL) => {
  messaging.sendMessage("up");

  if (url.pathname.startsWith("/Drama/")) dramaPage();
  else if (url.pathname === "/") homePage();
};

export default { router };
