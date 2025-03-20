import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import Button from "../../components/button";
import ServerTab from "../../components/serverTab";
import RequestTab from "../../components/requestTab";
import PageControl from "../../components/pageControl";
import ModalInput from "../../components/modalInput";
import "./index.css";

const Page = () => {
  const [requestTabs, setRequestTabs] = useState([]);
  const [serverTabs, setServerTabs] = useState([]);
  const [renameModalData, setRenameModalData] = useState({
    index: -1,
    value: "",
    isRequest: true,
  });
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

  const onRenameRequestTab = (name) => {
    if (renameModalData.isRequest) {
      setRequestTabs([
        ...requestTabs.slice(0, renameModalData.index),
        <RequestTab key={renameModalData.index} tabName={name} />,
        ...requestTabs.slice(renameModalData.index + 1),
      ]);

      setRenameModalData({ index: -1, value: "", isRequest: false });
      return
    }

    setServerTabs([
        ...serverTabs.slice(0, renameModalData.index),
        <ServerTab key={renameModalData.index} tabName={name} />,
        ...serverTabs.slice(renameModalData.index + 1),
      ]);

    setRenameModalData({ index: -1, value: "", isRequest: true });
  };

  const onCloseRequestTab = (index) => {
    setRequestTabs([
      ...requestTabs.slice(0, index),
      ...requestTabs.slice(index + 1),
    ]);
  };

  const onCloseServerTab = (index) => {
    setServerTabs([
      ...serverTabs.slice(0, index),
      ...serverTabs.slice(index + 1),
    ]);
  };

  const onSetRenameModalData = (value, index, tabName, isRequest) => {
    if (value == "rename") {
      setRenameModalData({
        index,
        value: tabName,
        isRequest,
      });
    }

    if (value == "close") {
      if (isRequest) {
        onCloseRequestTab(index);
      } else {
        onCloseServerTab(index)
      }
    }
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
      <ModalInput
        value={renameModalData.value}
        visible={renameModalData.index !== -1}
        onOk={(name) => onRenameRequestTab(name)}
        onCancel={() =>
          setRenameModalData({ index: -1, value: "", isRequest: true })
        }
      />
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
            canEdit
            onClose={(index) => onCloseRequestTab(index)}
            onMoreEdit={(index, value) =>
              onSetRenameModalData(
                value,
                index,
                requestTabs[index].props.tabName,
                true
              )
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
            onClose={(index) => onCloseServerTab(index)}
            onMoreEdit={(index, value) =>
              onSetRenameModalData(
                value,
                index,
                serverTabs[index].props.tabName,
                false
              )
            }
            canClose
            canEdit
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
