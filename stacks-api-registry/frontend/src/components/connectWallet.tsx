"use client";

import React, { useEffect, useState } from "react";
import { AppConfig, showConnect, UserSession } from "@stacks/connect";

const appConfig = new AppConfig(["store_write", "publish_data"]);

export const userSession = new UserSession({ appConfig });

function authenticate() {
  showConnect({
    appDetails: {
      name: "Stacks Next.js Starter",
      icon: window.location.origin + "/logo512.png",
    },
    redirectTo: "/",
    onFinish: () => {
      window.location.reload();
    },
    userSession,
  });
}

function disconnect() {
  userSession.signUserOut("/");
}

const ConnectWallet = () => {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (mounted && userSession.isUserSignedIn()) {
    return (
    <div className="rounded-xl  border-slate-200 bg-white p-3 shadow-sm">
  <div className="flex flex-row items-center justify-between gap-6">
    
    {/* Section 1: Connection Status Pill */}
    <div className="flex items-center gap-2 px-2">
      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="text-sm font-semibold tracking-tight text-slate-900 whitespace-nowrap">
        Connected
      </span>
    </div>

    {/* Section 2: Addresses in a Row */}
    <div className="flex flex-row items-center flex-1 gap-4 divide-x divide-slate-100">
     
      {/* Testnet */}
      <div className="flex items-center gap-3 pl-4">
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Testnet</span>
        <code className="text-xs font-mono text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-100">
          {userSession.loadUserData().profile.stxAddress.testnet.slice(0, 6)}...{userSession.loadUserData().profile.stxAddress.testnet.slice(-4)}
        </code>
      </div>
    </div>

    {/* Section 3: Action Button */}
    <button 
      className="inline-flex items-center justify-center rounded-md border border-slate-200 bg-white px-4 h-9 text-xs font-medium text-slate-950 transition-colors hover:bg-slate-100 hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 whitespace-nowrap"
      onClick={disconnect}
    >
      Disconnect
    </button>
  </div>
</div>
    );
  }

  return (
    <button className="Connect" onClick={authenticate}>
      Connect Wallet
    </button>
  );
};

export default ConnectWallet;