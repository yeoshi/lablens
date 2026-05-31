import { LabLensLogo } from '../sidepanel/components/icons';

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
      <LabLensLogo className="mb-3 h-10 w-10 rounded-lg" />
      <h1 className="mb-1 text-lg font-semibold text-text-primary">LabLens</h1>
      <p className="body-text mb-5 text-xs">
        Understand your lab results in plain English
      </p>
      <button onClick={openSidePanel} className="btn-primary w-full">
        Open Side Panel
      </button>
    </div>
  );
}

export default Popup;
