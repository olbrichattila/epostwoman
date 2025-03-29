import React, { createContext, useState } from "react";

export const DataContext = createContext();

const defaultGlobalState = { servers: {}, requests: {} };
const defaultCookieState = [];

const DataContextProvider = ({ children }) => {
  const [data, setData] = useState(defaultGlobalState);
  const [serverRequests, setServerRequests] = useState(defaultGlobalState);
  const [cookies, setCookies] = useState(defaultCookieState);

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
      servers: updatedServers,
    });
  };

  const renameRequestTab = (oldName, newName) => {
    const updatedRequests = { ...data.requests };

    if (updatedRequests[oldName]) {
      updatedRequests[newName] = updatedRequests[oldName];
      delete updatedRequests[oldName];
    }

    setData({
      ...data,
      requests: updatedRequests,
    });
  };

  const deleteRequestTab = (tabName) => {
    const newRequests = data.requests;
    delete newRequests[tabName]

    setData({...data, requests: newRequests})
  }

  const deleteServerTab = (tabName) => {
    const newServers = data.servers;
    delete newServers[tabName]

    setData({...data, servers: newServers})
  }

  const updateCookies = (tabName, headers) => {
    if (!headers) return;

    const cookieHeader =
      headers["set-cookie"] || headers["Set-Cookie"] || headers["SET-COOKIE"];

    if (!cookieHeader) return;

    const newCookies = cookieHeader.reduce((acc, cookieStr) => {
      const [cookiePair] = cookieStr.split(";");
      const [key, value] = cookiePair.split("=");
      return { ...acc, [key.trim()]: value.trim() };
    }, {});

    setCookies({ ...cookies, [tabName]: newCookies });
  };

  const getCookieStrings = (tabName) => {
    const cookieValue = cookies[tabName];
    if (!cookieValue) {
      return null;
    }

    return Object.entries(cookieValue)
      .map(([key, value]) => `${key}=${value}`)
      .join("; ");
  };

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
        deleteServerTab,
        renameRequestTab,
        deleteRequestTab,
        updateCookies,
        getCookieStrings,

      }}
    >
      {children}
    </DataContext.Provider>
  );
};

export default DataContextProvider;
