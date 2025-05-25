import React, { useState, useEffect, useContext } from "react";
import { DataContext } from "../../context";
import { FaTrash, FaSave, FaPen } from "react-icons/fa";
import Button from "../../components/button";
import ServerTab, { initialServerState } from "../../components/serverTab";
import RequestTab, { initialClientRequest } from "../../components/requestTab";
import PageControl from "../../components/pageControl";
import ModalInput from "../../components/modalInput";
import Loader from "../../components/loader";
import "./index.css";

const initialRenameModalState = {
  index: -1,
  value: "",
  isRequest: true,
};

const Page = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [renameModalData, setRenameModalData] = useState(
    initialRenameModalState
  );
  const [showNewCollectionModal, setShowNewCollectionModal] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState("");
  const [collections, setCollections] = useState([]);
  const [renameCollectionId, setRenameCollectionId] = useState(-1);
  const [selectedRequestTabIndex, setSelectedRequestTabIndex] = useState(0);
  const [selectedServerTabIndex, setSelectedServerTabIndex] = useState(0);
  const [requestTabScrollPos, setRequestTabScrollPos] = useState(0);
  const [serverTabScrollPos, setServerTabScrollPos] = useState(0);
  const {
    data,
    onGetState,
    onSetState,
    onSetServerRequest,
    renameServerTab,
    deleteServerTab,
    renameRequestTab,
    deleteRequestTab,
    onSetRequests,
    onSetServers,
  } = useContext(DataContext);

  const saveCollection = (name) => {
    setIsLoading(true);
    const data = onGetState();
    window.electronAPI.sendMessage("save-collection", name, data);
  };

  const deleteCollection = (name) => {
    setIsLoading(true);
    window.electronAPI.sendMessage("delete-collection", name);
  };

  const onRenameCollection = (name) => {
    setIsLoading(true);
    const oldName = collections[renameCollectionId];
    window.electronAPI.sendMessage("rename-collection", oldName, name);
    setRenameCollectionId(-1);
  };

  const loadCollection = (name) => {
    setIsLoading(true);
    window.electronAPI.sendMessage("load-collection", name);

    const handleLoadResponse = (response) => {
      onSetState(response);
      setSelectedCollection(name);
      setSelectedRequestTabIndex(0);
      setSelectedServerTabIndex(0);
      setRequestTabScrollPos(0);
      setServerTabScrollPos(0);
      setIsLoading(false);
      window.electronAPI.removeListener("load-response", handleLoadResponse);
    };

    window.electronAPI.onReceiveMessage("load-response", handleLoadResponse);
  };

  const handleEvent = (data) => {
    onSetServerRequest(data.port, data);
  };

  const onRenameTab = (name) => {
    const oldTabName = renameModalData.value;
    if (renameModalData.isRequest) {
      setRenameModalData(initialRenameModalState);
      renameRequestTab(oldTabName, name);
      return;
    }

    setRenameModalData(initialRenameModalState);
    renameServerTab(oldTabName, name);
  };

  const onCloseRequestTab = (tabIndex) => {
    const tabName = Object.keys(data.requests)[tabIndex];
    deleteRequestTab(tabName);
  };

  const onCloseServerTab = (tabIndex) => {
    const tabName = Object.keys(data.servers)[tabIndex];
    deleteServerTab(tabName);
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
        onCloseRequestTab(tabName);
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
    const handleResponse = (response) => {
      setCollections(response)
      setIsLoading(false);
    };

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
    <>
      {isLoading && <Loader />}
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
        <ModalInput
          title="Rename collection"
          value={collections[renameCollectionId] ?? ""}
          visible={renameCollectionId !== -1}
          onOk={(name) => onRenameCollection(name)}
          onCancel={() => setRenameCollectionId(-1)}
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
                <th colSpan={4}>Collections</th>
              </tr>
            </thead>
            <tbody>
              {collections &&
                collections.map((collectionName, idx) => (
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
                        <FaSave title="save" />
                      </span>
                    </td>

                    <td>
                      <span onClick={() => setRenameCollectionId(idx)}>
                        <FaPen title="rename" />
                      </span>
                    </td>

                    <td>
                      <span onClick={() => deleteCollection(collectionName)}>
                        <FaTrash title="delete" />
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
              scrollPos={requestTabScrollPos}
              onChangeScrollPos={(pos) => setRequestTabScrollPos(pos)}
              tabIndex={selectedRequestTabIndex}
              onPageChange={(index) => setSelectedRequestTabIndex(index)}
              canClose
              canEdit
              onClose={(index) => onCloseRequestTab(index)}
              onMoreEdit={(index, value) =>
                onSetRenameModalData(
                  value,
                  index,
                  Object.keys(data.requests)[index],
                  true
                )
              }
              onAddButton={() => {
                const tabName = `Request ${
                  Object.keys(data.requests).length + 1
                }`;
                onSetRequests(tabName, initialClientRequest);
              }}
            >
              {data &&
                data.requests &&
                Object.keys(data.requests).map((key, idx) => (
                  <RequestTab
                    key={`req_${key}_${idx}`}
                    tabName={key}
                    request={data.requests[key]}
                  />
                ))}
            </PageControl>
            <PageControl
              tabName="Servers"
              scrollPos={serverTabScrollPos}
              onChangeScrollPos={(pos) => setServerTabScrollPos(pos)}
              tabIndex={selectedServerTabIndex}
              onPageChange={(index) => setSelectedServerTabIndex(index)}
              onClose={(index) => onCloseServerTab(index)}
              onMoreEdit={(index, value) =>
                onSetRenameModalData(
                  value,
                  index,
                  Object.keys(data.servers)[index],
                  false
                )
              }
              canClose
              canEdit
              onAddButton={() => {
                const tabName = `Server ${
                  Object.keys(data.servers).length + 1
                }`;
                onSetServers(tabName, initialServerState);
              }}
            >
              {data &&
                data.servers &&
                Object.keys(data.servers).map((key, idx) => (
                  <ServerTab
                    key={`sk_${key}_${idx}`}
                    tabName={key}
                    serverState={data.servers[key]}
                  />
                ))}
            </PageControl>
          </PageControl>
        </div>
      </div>
    </>
  );
};

export default Page;
