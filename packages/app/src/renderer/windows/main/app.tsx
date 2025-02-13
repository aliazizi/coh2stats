import * as React from "react";
import { useDispatch, useSelector } from "react-redux";
import { actions, selectCache, selectGame, selectSettings } from "../../../redux/slice";
import CurrentGameOverview from "../../features/current-game-overview";
import { events, firebaseInit } from "../../firebase/firebase";
import compareVersions from "compare-versions";
import Link from "antd/lib/typography/Link";
import PlayerCount from "../../features/player-count";
import LoadingOutlined from "@ant-design/icons/LoadingOutlined";
import Spin from "antd/lib/spin";
import Col from "antd/lib/grid/col";
import Row from "antd/lib/grid/row";
import Divider from "antd/lib/divider";
import Title from "antd/lib/typography/Title";
import StatusBar from "../../components/status-bar";
import { useEffect, useState } from "react";
import { Tag } from "antd";
import { DownloadOutlined } from "@ant-design/icons";
import WindowTitlebar from "../../titlebar/window-titlebar";
import WindowTitlebarItem from "../../titlebar/window-titlebar-item";
import { datesAreOnSameDay } from "../../utils/helpers";
import { doc, getDoc, getFirestore } from "firebase/firestore";

// We need to initialize our Firebase
// This has to happen once on the main file of each render process
firebaseInit();

const App = (): JSX.Element => {
  const dispatch = useDispatch();
  const gameData = useSelector(selectGame);
  const settings = useSelector(selectSettings);
  const [upToDate, setUpToDate] = useState(true);
  const [requestState, setRequestState] = useState<"loading" | "idle" | "completed">("idle");
  const applicationCache = useSelector(selectCache);

  // On init of the app
  useEffect(() => {
    events.init(settings.appVersion);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (
      (!applicationCache.mapStats ||
        !datesAreOnSameDay(
          new Date(applicationCache.mapStats.requestDate),
          new Date(Date.now()),
        )) &&
      requestState === "idle"
    ) {
      console.log("Request new mapstats data");
      const monthTimestamp =
        Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1) / 1000;
      //Date.UTC(new Date().getUTCFullYear(), new Date().getUTCMonth() - 1, 1) / 1000;
      setRequestState("loading");
      getDoc(doc(getFirestore(), `stats/month/${monthTimestamp}/`, "mapStats")).then(
        (docSnap) => {
          if (docSnap.exists()) {
            dispatch(
              actions.setMapStatCache({
                requestDate: Date.now(),
                data: docSnap.data(),
              }),
            );
            setRequestState("completed");
          }
        },
      );
    }
  }, [applicationCache, dispatch, requestState]);

  useEffect(() => {
    if (settings.appNewestVersion) {
      setUpToDate(compareVersions(settings.appVersion, settings.appNewestVersion) >= 0);
    }
  }, [settings]);

  let content = (
    <>
      <CurrentGameOverview game={gameData} />
    </>
  );
  // show loader when not in game
  if (gameData.state === "closed" || gameData.state === "menu") {
    content = (
      <>
        <div style={{ textAlign: "center", paddingTop: 10, paddingBottom: 15 }}>
          <Title>
            <Spin indicator={<LoadingOutlined style={{ fontSize: 30 }} spin />} /> Waiting for a
            game
          </Title>
        </div>
        {gameData.found ? (
          <>
            <Divider orientation="left">
              <Title level={3}>Last Game - {gameData.map}</Title>
            </Divider>
            <div>
              <CurrentGameOverview game={gameData} />
            </div>
          </>
        ) : null}
      </>
    );
  }

  const menuItems = (
    <>
      <WindowTitlebarItem onClick={() => window.electron.ipcRenderer.reloadStats()}>
        Refresh
      </WindowTitlebarItem>
      <WindowTitlebarItem onClick={() => window.electron.ipcRenderer.showWindow("settings")}>
        Settings
      </WindowTitlebarItem>
      <WindowTitlebarItem onClick={() => window.electron.ipcRenderer.showWindow("about")}>
        About
      </WindowTitlebarItem>
    </>
  );

  return (
    <WindowTitlebar windowName="main" items={menuItems}>
      <StatusBar
        left={
          upToDate ? undefined : (
            <>
              <Tag icon={<DownloadOutlined />} color="#3b5999">
                <Link
                  style={{ color: "white" }}
                  onClick={() => window.electron.ipcRenderer.showWindow("about")}
                >
                  Update available!
                </Link>
              </Tag>
            </>
          )
        }
        right={<PlayerCount />}
      />
      <Row justify="center" style={{ paddingTop: "10px", paddingBottom: "20px" }}>
        <Col xs={24} md={22} xxl={14}>
          {content}
        </Col>
      </Row>
    </WindowTitlebar>
  );
};

export default App;
