function Popup() {
  const openSidePanel = async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (tab?.windowId) {
      await chrome.sidePanel.open({ windowId: tab.windowId });
    }
    window.close();
  };

  return (
    <div className="flex w-72 flex-col items-center bg-bg-primary p-6 text-center">
      <div className="mb-3 text-3xl">🔬</div>
      <h1 className="mb-1 text-lg font-bold text-text-primary">LabLens</h1>
      <p className="mb-5 text-xs text-text-secondary">
        Understand your lab results in plain English
      </p>
      <button
        onClick={openSidePanel}
        className="w-full rounded-xl bg-accent-blue px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
      >
        Open Side Panel
      </button>
    </div>
  );
}

export default Popup;
