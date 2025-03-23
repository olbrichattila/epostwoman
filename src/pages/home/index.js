import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import { FaTrash, FaSave } from "react-icons/fa";
import Button from "../../components/button";
import ServerTab, { initialServerState } from "../../components/serverTab";
import RequestTab, { initialClientRequest } from "../../components/requestTab";
import PageControl from "../../components/pageControl";
import ModalInput from "../../components/modalInput";

import "./index.css";

const initialRenameModalState = {
  index: -1,
  value: "",
  isRequest: true,
};

const Page = () => {
  const [requestTabs, setRequestTabs] = useState([]);
  const [serverTabs, setServerTabs] = useState([]);
  const [renameModalData, setRenameModalData] = useState(
    initialRenameModalState
  );
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const {
    onGetState,
    onSetState,
    onSetServerRequest,
    renameServerTab,
    renameRequestTab,
    onSetRequests,
    onSetServers
  } = useContext(DataContext);

  const saveCollection = (name) => {
    const data = onGetState();
    window.electronAPI.sendMessage("save-collection", name, data);
  };

  const deleteCollection = (name) => {
    window.electronAPI.sendMessage("delete-collection", name);
  };

  const loadCollection = (name) => {
    window.electronAPI.sendMessage("load-collection", name);

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
      setSelectedCollection(name);
      window.electronAPI.removeListener("load-response", handleLoadResponse);
    };

    window.electronAPI.onReceiveMessage("load-response", handleLoadResponse);
  };

  const handleEvent = (data) => {
    onSetServerRequest(data.port, data);
  };

  const onRenameTab = (name) => {
    if (renameModalData.isRequest) {
      const oldTabName = requestTabs[renameModalData.index].props.tabName;

      setRequestTabs([
        ...requestTabs.slice(0, renameModalData.index),
        <RequestTab key={renameModalData.index} tabName={name} />,
        ...requestTabs.slice(renameModalData.index + 1),
      ]);

      setRenameModalData(initialRenameModalState);
      renameRequestTab(oldTabName, name);
      return;
    }

    const oldTabName = serverTabs[renameModalData.index].props.tabName;
    setServerTabs([
      ...serverTabs.slice(0, renameModalData.index),
      <ServerTab key={renameModalData.index} tabName={name} />,
      ...serverTabs.slice(renameModalData.index + 1),
    ]);

    setRenameModalData(initialRenameModalState);
    renameServerTab(oldTabName, name);
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
    if (value === "rename") {
      setRenameModalData({
        index,
        value: tabName,
        isRequest,
      });
    }

    if (value === "close") {
      if (isRequest) {
        onCloseRequestTab(index);
      } else {
        onCloseServerTab(index);
      }
    }
  };

  const onSaveNewCollection = (name) => {
    if (name !== "") {
      window.electronAPI.sendMessage("save-collection", name, {
        servers: {},
        requests: {},
      });
    }
    setShowNewCollectionModal(false);
  };

  useEffect(() => {
    const handleRequestReceived = (response) => handleEvent(response);
    const handleResponse = (response) => setCollections(response);

    window.electronAPI.sendMessage("get-collections");
    window.electronAPI.onReceiveMessage("collection-response", handleResponse);
    window.electronAPI.onReceiveMessage(
      "request-received",
      handleRequestReceived
    );

    return () => {
      window.electronAPI.removeListener(
        "request-received",
        handleRequestReceived
      );

      window.electronAPI.removeListener("collection-response", handleResponse);
    };
  }, []);

  return (
    <div className="page">
      <ModalInput
        title="New collection"
        value=""
        visible={showNewCollectionModal}
        onOk={(name) => onSaveNewCollection(name)}
        onCancel={() => setShowNewCollectionModal(false)}
      />
      <ModalInput
        title="Rename tab"
        value={renameModalData.value}
        visible={renameModalData.index !== -1}
        onOk={(name) => onRenameTab(name)}
        onCancel={() => setRenameModalData(initialRenameModalState)}
      />
      <div className="leftMenu">
        <div className="buttonWrapper">
          <Button
            title="New Collection"
            onClick={() => setShowNewCollectionModal(true)}
          />
        </div>
        <table className="collectionList">
          <thead>
            <tr>
              <th colSpan={3}>Collections</th>
            </tr>
          </thead>
          <tbody>
            {collections &&
              collections.map((collectionName) => (
                <tr
                  key={collectionName}
                  className={
                    collectionName === selectedCollection ? "active" : ""
                  }
                >
                  <td onClick={() => loadCollection(collectionName)}>
                    {collectionName}
                  </td>
                  <td>
                    <span onClick={() => saveCollection(collectionName)}>
                      <FaSave />
                    </span>
                  </td>

                  <td>
                    <span onClick={() => deleteCollection(collectionName)}>
                      <FaTrash />
                    </span>
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
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
            onAddButton={() => {
              const tabName = `Request ${requestTabs.length + 1}`;
              setRequestTabs([
                ...requestTabs,
                <RequestTab key={requestTabs.length} tabName={tabName} />,
              ]);
              onSetRequests(tabName, initialClientRequest);
            }}
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
            onAddButton={() => {
              const tabName = `Server ${serverTabs.length + 1}`;
              setServerTabs([
                ...serverTabs,
                <ServerTab tabName={tabName} />,
              ])
              onSetServers(tabName, initialServerState)
            }
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
