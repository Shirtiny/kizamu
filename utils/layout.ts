const once = { remFlexible: false };

function remFlexible(win: Window) {
  if (once.remFlexible || !win) return;
  const { document } = win;
  const docEl = document.documentElement;
  const dpr = win.devicePixelRatio || 1;

  // 720p: 1280*720   unit = 1280/16px = 80
  // 1080p: 1920*1080   unit = 1920/16px = 120
  // 以某个分辨率宽度为基准 通过baseWidth计算remRate 且低于baseWidth时不进行缩放
  const baseWidth = 1920;
  // 以某个fontSize的值为基准
  const baseFontSize = 16;
  // baseWidth减小至1000
  const minWidth = 1000;
  // 对整体基准值进行缩放
  const scale = minWidth / baseWidth;
  const baseRemRate = (baseWidth * scale) / baseFontSize;

  // adjust body font size
  function setBodyFontSize() {
    if (document.body) {
      document.body.style.fontSize = baseFontSize * dpr + "px";
    } else {
      document.addEventListener("DOMContentLoaded", setBodyFontSize);
    }
  }
  setBodyFontSize();

  function setRemUnit() {
    const rem = Math.max(docEl.clientWidth, minWidth) / baseRemRate;
    docEl.style.fontSize = rem + "px";
  }

  setRemUnit();

  // reset rem unit on page resize
  win.addEventListener("resize", setRemUnit);
  win.addEventListener("pageshow", function (e) {
    if (e.persisted) {
      setRemUnit();
    }
  });

  // document.addEventListener("visibilitychange", function logData() {
  //   if (document.visibilityState === "hidden") {
  //     navigator.sendBeacon("/log", analyticsData);
  //   }
  // });

  // detect 0.5px supports
  if (dpr >= 2) {
    const fakeBody = document.createElement("body");
    const testElement = document.createElement("div");
    testElement.style.border = ".5px solid transparent";
    fakeBody.appendChild(testElement);
    docEl.appendChild(fakeBody);
    if (testElement.offsetHeight === 1) {
      docEl.classList.add("hairlines");
    }
    docEl.removeChild(fakeBody);
  }
  once.remFlexible = true;
}

const layout = {
  remFlexible,
};

export default layout;
