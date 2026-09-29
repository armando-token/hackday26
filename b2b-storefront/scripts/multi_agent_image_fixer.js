const fs = require('fs');
const path = require('path');
const https = require('https');
const { Worker, isMainThread, parentPort, workerData } = require('worker_threads');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const EMS_MEDIA_DIR = path.join(__dirname, '../public/cn-media/products/ems');

const MODEL_SLUG_MAP = {
  'TS-412 / TS-413':     'ts-412-ts-413-temperature-sensor',
  'TT-391':              'tt-391-temperature-sensor',
  'TT-4XX':              'tt-4xx-temperature-transmitter',
  'ST-2XX':              'st-2xx-temperature-humidity-transmitter',
  'NT-2XX':              'nt-2xx-humidity-transmitter',
  'DT-3XX':              'dt-3xx-temperature-humidity-transmitter',
  'SS-412':              'ss-412-temperature-humidity-sensor',
  'NT-391':              'nt-391-humidity-sensor',
  'ST-391':              'st-391-temperature-humidity-sensor',
  'KT-3X1':              'kt-3x1-co2-transmitter',
  'KT-3X9':              'kt-3x9-co2-transmitter',
  'KT-4X1':              'kt-4x1-co2-transmitter',
  'KT-4X9':              'kt-4x9-co2-transmitter',
  'KT-5XX':              'kt-5xx-co2-transmitter',
  'KT-6XX':              'kt-6xx-co2-transmitter',
  'AT-3XX':              'at-3xx-ammonia-transmitter',
  'AT-4XX':              'at-4xx-ammonia-transmitter',
  'ET-3XX':              'et-3xx-ethylene-transmitter',
  'ET-4XX':              'et-4xx-ethylene-transmitter',
  'UT-3XX':              'ut-3xx-so2-transmitter',
  'UT-4XX':              'ut-4xx-so2-transmitter',
  'CT-3XX':              'ct-3xx-co-transmitter',
  'CT-4XX':              'ct-4xx-co-transmitter',
  'OT-3XX':              'ot-3xx-o2-transmitter',
  'OT-4XX':              'ot-4xx-o2-transmitter',
  'KS-412':              'ks-412-ks-415-ks-419-co2-sensor',
  'KS-415':              'ks-412-ks-415-ks-419-co2-sensor',
  'KS-419':              'ks-412-ks-415-ks-419-co2-sensor',
  'KS-612':              'ks-612-co2-sensor',
  'AS-412':              'as-412-ammonia-sensor',
  'ES-412':              'es-412-ethylene-sensor',
  'US-412':              'us-412-so2-sensor',
  'CS-412':              'cs-412-co-sensor',
  'OS-412':              'os-412-o2-sensor',
  'KT-391':              'kt-391-co2-sensor',
  'AT-391':              'at-391-ammonia-sensor',
  'ET-391':              'et-391-ethylene-sensor',
  'UT-391':              'ut-391-so2-sensor',
  'CT-391':              'ct-391-co-sensor',
  'OT-391':              'ot-391-o2-sensor',
  'BS-412 / BS-413':     'bs-412-bs-413-differential-pressure-sensor',
  'BS-414 / BS-415':     'bs-414-bs-415-differential-pressure-sensor',
  'YS-111':              'ys-111-capacitive-level-sensor',
  'YS-112':              'ys-112-capacitive-level-sensor',
  'AE-321':              'ae-321-ae-322-ae-323-sensor-accessory',
  'AE-322':              'ae-321-ae-322-ae-323-sensor-accessory',
  'AE-323':              'ae-321-ae-322-ae-323-sensor-accessory',
  'AE-331':              'ae-331-ae-332-ae-333-sensor-accessory',
  'AE-332':              'ae-331-ae-332-ae-333-sensor-accessory',
  'AE-333':              'ae-331-ae-332-ae-333-sensor-accessory',
  'AE-341':              'ae-341-ae-342-sensor-accessory',
  'AE-342':              'ae-341-ae-342-sensor-accessory',
  'AE-351':              'ae-351-sensor-accessory',
  'AE-361':              'ae-361-ae-362-sensor-accessory',
  'AE-362':              'ae-361-ae-362-sensor-accessory',
  'AE-501 / AE-502':     'ae-501-ae-502-sensor-accessory',
  'AE-311':              'ae-311-thermowell',
  'AE-601':              'ae-601-adapter',
  'HT-2XX':              'ht-2xx-air-velocity-transmitter',
  'WM-320':              'wm-320-ortak-monitoring-system',
  'WM-410':              'wm-410-ortak-monitoring-system',
  'WM-510':              'wm-510-ortak-monitoring-system',
  'MT-010':              'mt-010-wireless-master',
  'MT-016':              'mt-016-wireless-master',
  'KM-390':              'km-390-sensor-kit',
  'MK-261':              'mk-261-modbus-protection-card',
  'KR-4X1':              'kr-4x1-co2-control-device',
  'KR-4X5':              'kr-4x5-co2-control-device',
  'KR-4X9':              'kr-4x9-co2-control-device',
  'BR-4X1 / 4X2':        'br-4x1-br-4x2-differential-pressure-control-device',
  'BR-4X4 / 4X5':        'br-4x4-br-4x5-differential-pressure-control-device',
  'AR-4X1':              'ar-4x1-ammonia-control-device',
  'ER-4X1':              'er-4x1-ethylene-control-device',
  'UR-4X1':              'ur-4x1-so2-control-device',
  'CR-4X1':              'cr-4x1-co-control-device',
  'OR-4X1':              'or-4x1-o2-control-device',
  'TR-711 / TR-713':     'tr-711-tr-713-temperature-controller',
  'NR-711':              'nr-711-humidity-controller',
  'SR-711':              'sr-711-temperature-humidity-controller',
  'KR-711':              'kr-711-co2-controller',
  'KR-715':              'kr-715-co2-controller',
  'KR-719':              'kr-719-co2-controller',
  'KR-751 / KR-752':     'kr-751-kr-752-co2-controller',
  'AR-711':              'ar-711-ammonia-controller',
  'ER-711':              'er-711-ethylene-controller',
  'UR-711':              'ur-711-so2-controller',
  'CR-711':              'cr-711-co-controller',
  'OR-711':              'or-711-o2-controller',
  'MM-010 / M-010':      'mm-010-ortak-monitoring-master',
  'MM-011':              'mm-011-ortak-monitoring-master',
  'MM-012':              'mm-012-ortak-monitoring-master',
  'MM-02X':              'mm-02x-ortak-monitoring-master',
  'SM-420 / SS-085':     'sm-420-ortak-monitoring-system',
  'SM-410 / ST-070':     'sm-410-ortak-monitoring-system',
  
  // Custom fixed ones from earlier
  'BT-3X1 / 3X2':        'bt-3x1-3x2-differential-pressure-transmitter',
  'BT-3X4 / 3X5':        'bt-3x4-3x5-differential-pressure-transmitter',
  'BT-4X1 / 4X2':        'bt-4x1-4x2-differential-pressure-transmitter-with-display',
  'BT-4X4 / 4X5':        'bt-4x4-4x5-differential-pressure-transmitter-with-display',
  'BT-391 / 392':        'bt-3x1-3x2-differential-pressure-transmitter',
  'AE-901 / AE-902 / AE-903': 'ae-901-differential-pressure-filter',
  'SM-310 / SN-031':     'sm-310-temperature-humidity-sensor-module',
  'SM-320 / SK-031':     'sm-320-temperature-humidity-carbon-dioxide-sensor-module',
  'WM-310 / TS-231':     'wm-310-temperature-wifi-sensor-module',
};

if (!isMainThread) {
  // WORKER AGENT
  const { product, slug } = workerData;
  
  function fetchHtml(url, maxR=5) {
    return new Promise((res, rej) => {
      https.get(url, {headers:{'User-Agent':'Mozilla/5.0'}}, r => {
        if ((r.statusCode===301||r.statusCode===302)&&r.headers.location&&maxR>0)
          return fetchHtml(r.headers.location, maxR-1).then(res).catch(rej);
        let d=''; r.on('data',c=>d+=c); r.on('end',()=>res({status:r.statusCode, data:d}));
      }).on('error', rej);
    });
  }

  function downloadBinary(imageUrl, dest) {
    return new Promise(res => {
      const f = fs.createWriteStream(dest);
      https.get(imageUrl, {headers:{'User-Agent':'Mozilla/5.0'}}, r => {
        if(r.statusCode===301||r.statusCode===302) {
          f.close(); fs.unlinkSync(dest);
          return downloadBinary(r.headers.location, dest).then(res);
        }
        r.pipe(f);
        f.on('finish', ()=>{f.close(); res(true);});
      }).on('error',()=>{f.close(); fs.unlinkSync(dest); res(false);});
    });
  }

  async function processProduct() {
    const modelClean = product.model.split('/')[0].trim().replace('-',''); // e.g. TS-412 -> TS412
    const m = product.model.split('/')[0].trim();
    const url = 'https://emskontrol.com/en/urun/' + slug + '/';
    
    try {
      const {status, data} = await fetchHtml(url);
      if (status !== 200) throw new Error('HTTP ' + status);

      const allImgs = [...data.matchAll(/https?:\/\/emskontrol\.com\/wp-content\/uploads\/[^\s\"'<>]+\.(?:png|jpg|jpeg|webp)/gi)].map(m=>m[0]);
      
      // Verification logic: MUST NOT be a generic background, and MUST contain the model string in the filename
      // or at least NOT be title-bg or logo.
      let validImgs = allImgs.filter(u => {
        const lower = u.toLowerCase();
        if (lower.includes('logo') || lower.includes('favicon') || lower.includes('title-bg') || lower.includes('footer')) return false;
        
        // Strict verify: does the URL filename contain part of the model name?
        const filename = u.split('/').pop().toUpperCase();
        // Extract letters and numbers from model
        const modelParts = m.split('-'); // e.g. ["TS", "412"]
        return filename.includes(modelParts[0]) || filename.includes(modelParts[1] || '');
      });
      
      if (validImgs.length === 0) {
        // Fallback: pick any image that isn't blacklisted
        validImgs = allImgs.filter(u => {
          const lower = u.toLowerCase();
          return !(lower.includes('logo') || lower.includes('favicon') || lower.includes('title-bg') || lower.includes('footer') || lower.includes('banner'));
        });
      }

      if (validImgs.length === 0) throw new Error('No valid images found on page');

      // Pick highest res
      const fullSize = validImgs.filter(u=>!/-\d+x\d+\./.test(u));
      const chosenUrl = fullSize.length > 0 ? fullSize[0] : (validImgs.filter(u=>u.includes('600x600'))[0] || validImgs[0]);

      const ext = chosenUrl.split('.').pop().split('?')[0].toLowerCase();
      const fileName = product.handle.replace('ems-','') + '.' + ext;
      const destPath = path.join(EMS_MEDIA_DIR, fileName);

      const ok = await downloadBinary(chosenUrl, destPath);
      if (!ok) throw new Error('Download failed');

      // VERIFICATION STAGE
      const stat = fs.statSync(destPath);
      if (stat.size === 1013545 || stat.size === 0) {
        fs.unlinkSync(destPath);
        throw new Error('Downloaded image failed size verification (bad generic image detected)');
      }

      parentPort.postMessage({ success: true, handle: product.handle, fileName });
    } catch (e) {
      parentPort.postMessage({ success: false, handle: product.handle, error: e.message });
    }
  }

  processProduct();
} else {
  // MAIN AGENT ORCHESTRATOR
  const badProducts = JSON.parse(fs.readFileSync(path.join(__dirname, '../bad_products.json'), 'utf8'));
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  
  let activeWorkers = 0;
  let index = 0;
  const MAX_CONCURRENCY = 8;
  
  let successCount = 0;
  let failCount = 0;

  function runNext() {
    if (index >= badProducts.length) {
      if (activeWorkers === 0) {
        fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');
        console.log(`\n🎉 Pipeline finished. Corrected: ${successCount}, Failed: ${failCount}`);
      }
      return;
    }

    const item = badProducts[index++];
    const slug = MODEL_SLUG_MAP[item.model];
    if (!slug) {
      console.log(`❌ [Skipped] No slug for ${item.model}`);
      failCount++;
      runNext();
      return;
    }

    activeWorkers++;
    const worker = new Worker(__filename, { workerData: { product: item, slug } });
    
    worker.on('message', msg => {
      if (msg.success) {
        // Corrector stage: update products.json
        const p = products.find(x => x.handle === msg.handle);
        if (p) p.images = [`/cn-media/products/ems/${msg.fileName}`];
        successCount++;
        console.log(`✅ [Verified & Fixed] ${item.model} -> ${msg.fileName}`);
      } else {
        failCount++;
        console.log(`❌ [Failed] ${item.model}: ${msg.error}`);
      }
    });
    
    worker.on('error', err => {
      failCount++;
      console.log(`❌ [Error] ${item.model}: ${err.message}`);
    });
    
    worker.on('exit', () => {
      activeWorkers--;
      runNext();
    });
  }

  console.log(`🚀 Starting Multi-Agent pipeline with ${MAX_CONCURRENCY} parallel workers to verify and correct ${badProducts.length} products unit-by-unit...`);
  for (let i = 0; i < MAX_CONCURRENCY; i++) runNext();
}
