import dramaPage from "./dramaPage";
import homePage from "./homePage";

const router = (url: URL) => {
  if (url.pathname.startsWith("/Drama/")) dramaPage();
  else if (url.pathname === "/") homePage();
};

export default { router };
