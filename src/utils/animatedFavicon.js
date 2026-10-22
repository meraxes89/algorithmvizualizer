import { readVizColors } from '../theme/vizTokens';
let faviconCanvas = null;
let faviconCtx = null;
let faviconInterval = null;
let currentArray = [1, 2, 3, 4, 5];
let isSorting = false;

const initFavicon = () => {
  if (!faviconCanvas) {
    faviconCanvas = document.createElement('canvas');
    faviconCanvas.width = 32;
    faviconCanvas.height = 32;
    faviconCtx = faviconCanvas.getContext('2d');
  }
};

const setFavicon = (url) => {
  let link = document.querySelector("link[rel~='icon']");
  if (!link) {
    link = document.createElement('link');
    link.rel = 'icon';
    document.head.appendChild(link);
  }
  link.href = url;
};

const drawBars = () => {
  if (!faviconCtx) return;

  faviconCtx.clearRect(0, 0, 32, 32);
  const barWidth = 32 / currentArray.length;
  const maxVal = Math.max(...currentArray);
  
  currentArray.forEach((val, idx) => {
    const height = (val / maxVal) * 28;
    faviconCtx.fillStyle = readVizColors().default;
    faviconCtx.fillRect(idx * barWidth, 32 - height, barWidth - 1, height);
  });
  
  setFavicon(faviconCanvas.toDataURL('image/png'));
};

export const startFaviconAnimation = () => {
  if (isSorting) return;
  initFavicon();
  isSorting = true;
  
  currentArray = [5, 2, 4, 1, 3];
  drawBars();
  
  let step = 0;
  const steps = [
    [2, 5, 4, 1, 3],
    [2, 4, 5, 1, 3],
    [2, 4, 1, 5, 3],
    [2, 4, 1, 3, 5],
    [2, 1, 4, 3, 5],
    [1, 2, 4, 3, 5],
    [1, 2, 3, 4, 5]
  ];
  
  faviconInterval = setInterval(() => {
    if (step < steps.length) {
      currentArray = steps[step];
      drawBars();
      step++;
    } else {
      currentArray = [5, 2, 4, 1, 3]; // restart animation loop
      step = 0;
    }
  }, 300);
};

export const stopFaviconAnimation = () => {
  isSorting = false;
  if (faviconInterval) {
    clearInterval(faviconInterval);
    faviconInterval = null;
  }
  initFavicon();
  currentArray = [1, 2, 3, 4, 5];
  drawBars();
};
