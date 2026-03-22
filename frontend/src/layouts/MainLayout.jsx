import { Layout } from "antd";
import Header from "../components/Header/index.jsx";
import Menu from "../components/Menu/index.jsx";
import Footer from "../components/Footer/index.jsx";

const { Content } = Layout;

function MainLayout({ children }) {
  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Header style={{ position: "sticky", top: 0, zIndex: 100 }}/>
      <Menu />
      <Content style={{ padding: "16px" }}>
        {children}
      </Content>
      <Footer />
      
    </Layout>
  );
}

export default MainLayout;