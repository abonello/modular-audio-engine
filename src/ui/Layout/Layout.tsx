/*
 * src/ui/Layout/Layout.tsx
 */

import Header from "./Header";
import Banner from "./Banner";
import LeftBlade from "./LeftBlade";
import RightBlade from "./RightBlade";
import Workspace from "./Workspace/Workspace";
import Footer from "./Footer";


export default function Layout() {
  return (
    <div className="appRoot">
      <Header />
      <Banner />
      <div className="mainArea">
        <LeftBlade>
          {/* tools will be injected here later */}
          {""}
        </LeftBlade>

        <Workspace>
          {/* workspace content injected later */}
          {""}
        </Workspace>

        <RightBlade>
          {/* inspector will be injected here later */}
          {""}
        </RightBlade>
      </div>
      <Footer />
    </div>
  );
}
