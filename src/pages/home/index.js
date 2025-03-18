import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import Button from "../../components/button";
import ServerTab from "../../components/serverTab";
import RequestTab from "../../components/requestTab";
import PageControl from "../../components/pageControl";
import "./index.css";

const Page = () => {
  const [requestTabs, setRequestTabs] = useState([]);
  const [serverTabs, setServerTabs] = useState([]);
  const { onGetState, onSetState, onSetServerRequest } =
    useContext(DataContext);

  const saveSettings = () => {
    const data = onGetState();
    window.electronAPI.sendMessage("save-state", data);
  };

  const loadSettings = () => {
    window.electronAPI.sendMessage("load-state");

    const handleLoadResponse = (response) => {
      setRequestTabs(
        Object.keys(response.requests).map((key, index) => (
          <RequestTab
            key={index}
            tabName={key}
            request={response.requests[key]}
          />
        ))
      );

      setServerTabs(
        Object.keys(response.servers).map((key, index) => (
          <ServerTab
            key={index}
            tabName={key}
            serverState={response.servers[key]}
          />
        ))
      );

      onSetState(response);
      window.electronAPI.removeListener("load-response", handleLoadResponse);
    };

    window.electronAPI.onReceiveMessage("load-response", handleLoadResponse);
  };

  const handleEvent = (data) => {
    onSetServerRequest(data.port, data);
  };

  useEffect(() => {
    const handleRequestReceived = (data) => handleEvent(data);

    window.electronAPI.onReceiveMessage(
      "request-received",
      handleRequestReceived
    );

    return () => {
      window.electronAPI.removeListener(
        "request-received",
        handleRequestReceived
      );
    };
  }, []);

  return (
    <div className="page">
      <div className="leftMenu">
        <div className="buttonWrapper">
          <Button title="Save tabs" onClick={() => saveSettings()} />
        </div>
        <div className="buttonWrapper">
          <Button title="Load tabs" onClick={() => loadSettings()} />
        </div>
      </div>
      <div className="pages">
        <PageControl>
          <PageControl
            tabName="Requests"
            canClose
            onClose={(index) =>
              setRequestTabs([
                ...requestTabs.slice(0, index),
                ...requestTabs.slice(index + 1),
              ])
            }
            onAddButton={() =>
              setRequestTabs([
                ...requestTabs,
                <RequestTab
                  key={requestTabs.length}
                  tabName={`Request ${requestTabs.length + 1}`}
                />,
              ])
            }
          >
            {requestTabs}
          </PageControl>
          <PageControl
            tabName="Servers"
            onClose={(index) =>
              setServerTabs([
                ...serverTabs.slice(0, index),
                ...serverTabs.slice(index + 1),
              ])
            }
            canClose
            onAddButton={() =>
              setServerTabs([
                ...serverTabs,
                <ServerTab tabName={`Server ${serverTabs.length + 1}`} />,
              ])
            }
          >
            {serverTabs}
          </PageControl>
        </PageControl>
      </div>
    </div>
  );
};

export default Page;
