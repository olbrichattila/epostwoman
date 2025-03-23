import React, { createContext, useState } from "react";

export const DataContext = createContext();

const defaultGlobalState = { servers: {}, requests: {} };

const DataContextProvider = ({ children }) => {
  const [data, setData] = useState(defaultGlobalState);
  const [serverRequests, setServerRequests] = useState(defaultGlobalState);

  const onSetState = (data) => {
    setData(data);
  };

  const onSetData = (key, value) => {
    setData({ ...data, [key]: value });
  };

  const onSetServers = (key, value) => {
    setData({ ...data, servers: { ...data.servers, [key]: value } });
  };

  const onSetRequests = (key, value) => {
    setData({ ...data, requests: { ...data.requests, [key]: value } });
  };

  const onGetState = () => {
    return data;
  };

  const onSetServerRequest = (port, data) => {
    setServerRequests({ ...serverRequests, [port]: data });
  };

  const renameServerTab = (oldName, newName) => {
    const updatedServers = { ...data.servers };

    if (updatedServers[oldName]) {
      updatedServers[newName] = updatedServers[oldName];
      delete updatedServers[oldName];
    }

    setData({
      ...data,
      servers: updatedServers
    });
  }

  const renameRequestTab = (oldName, newName) => {
    const updatedRequests = { ...data.requests };

    if (updatedRequests[oldName]) {
      updatedRequests[newName] = updatedRequests[oldName];
      delete updatedRequests[oldName];
    }

    setData({
      ...data,
      requests: updatedRequests
    });
  }

  return (
    <DataContext.Provider
      value={{
        data,
        serverRequests,
        onSetData,
        onSetServers,
        onSetRequests,
        onGetState,
        onSetState,
        onSetServerRequest,
        renameServerTab,
        renameRequestTab,
      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
