const https = require('https');
const fs = require('fs');
const path = require('path');

const PRODUCTS_PATH = path.join(__dirname, '../src/lib/cn-catalog/data/products.json');
const EMS_MEDIA_DIR = path.join(__dirname, '../public/cn-media/products/ems');

// Mapping: mfrModel -> EMS slug in /en/urun/
const MODEL_SLUG_MAP = {
  'TS-1XX':              'ts-1xx-temperature-sensor',
  'TS-3XX':              'ts-3xx-temperature-sensor',
  'TS-412 / TS-413':     'ts-412-ts-413-temperature-sensor',
  'TT-391':              'tt-391-temperature-sensor',
  'TT-3XX':              'tt-3xx-temperature-transmitter',
  'TT-4XX':              'tt-4xx-temperature-transmitter',
  'ST-3XX':              'st-3xx-temperature-humidity-transmitter',
  'NT-3XX':              'nt-3xx-humidity-transmitter',
  'ST-4XX':              'st-4xx-temperature-humidity-transmitter',
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
  'BD-355':              'bd-355-differential-pressure-switch',
  'BT-3X1 / BT-3X2':    'bt-3x1-bt-3x2-differential-pressure-transmitter',
  'BT-3X4 / BT-3X5':    'bt-3x4-bt-3x5-differential-pressure-transmitter',
  'BT-4X1 / BT-4X2':    'bt-4x1-bt-4x2-differential-pressure-transmitter',
  'BT-4X4 / BT-4X5':    'bt-4x4-bt-4x5-differential-pressure-transmitter',
  'BS-412 / BS-413':     'bs-412-bs-413-differential-pressure-sensor',
  'BS-414 / BS-415':     'bs-414-bs-415-differential-pressure-sensor',
  'BT-391':              'bt-391-differential-pressure-sensor',
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
  'AE-901':              'ae-901-differential-pressure-filter',
  'HT-2XX':              'ht-2xx-air-velocity-transmitter',
  'SM-310':              'sm-310-ortak-monitoring-system',
  'SM-320':              'sm-320-ortak-monitoring-system',
  'WM-310':              'wm-310-ortak-monitoring-system',
  'WM-320':              'wm-320-ortak-monitoring-system',
  'WM-410':              'wm-410-ortak-monitoring-system',
  'WM-510':              'wm-510-ortak-monitoring-system',
  'MT-010':              'mt-010-wireless-master',
  'MT-016':              'mt-016-wireless-master',
  'KM-390':              'km-390-sensor-kit',
  'MK-261':              'mk-261-modbus-protection-card',
  'TR-4XX':              'tr-4xx-temperature-control-device',
  'NR-4XX':              'nr-4xx-humidity-control-device',
  'SR-4XX':              'sr-4xx-temperature-humidity-control-device',
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
};

function fetchWithRedirects(url, maxRedirects = 5) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/120' }
    }, res => {
      if ((res.statusCode === 301 || res.statusCode === 302) && res.headers.location && maxRedirects > 0) {
        const loc = res.headers.location.startsWith('http') ? res.headers.location : new URL(res.headers.location, url).toString();
        return fetchWithRedirects(loc, maxRedirects - 1).then(resolve).catch(reject);
      }
      let data = '';
      res.on('data', d => data += d);
      res.on('end', () => resolve({ status: res.statusCode, data, finalUrl: url }));
    }).on('error', reject);
  });
}

function getBestImageFromHtml(html) {
  // Extract all wp-content/uploads images, prefer 600x600 or largest available
  const imgs = [...html.matchAll(/https?:\/\/emskontrol\.com\/wp-content\/uploads\/[^\s"'<>]+\.(?:png|jpg|jpeg|webp)/gi)]
    .map(m => m[0])
    .filter(u => !u.includes('logo') && !u.includes('favicon') && !u.includes('footer') && !u.includes('banner') && !u.includes('title-bg'));

  // Prefer full-size (no dimension suffix), fallback to 600x600
  const fullSize = imgs.filter(u => !/-\d+x\d+\./.test(u));
  if (fullSize.length > 0) return fullSize[0];

  const big = imgs.filter(u => u.includes('-600x600'));
  if (big.length > 0) return big[0];

  const medium = imgs.filter(u => u.includes('-400x400') || u.includes('-300x300'));
  if (medium.length > 0) return medium[0];

  return imgs[0] || null;
}

async function downloadBinary(imageUrl, destPath) {
  return new Promise((resolve) => {
    const protocol = imageUrl.startsWith('https') ? https : require('http');
    const file = fs.createWriteStream(destPath);
    protocol.get(imageUrl, { headers: { 'User-Agent': 'Mozilla/5.0' } }, res => {
      if (res.statusCode === 301 || res.statusCode === 302) {
        file.close(); fs.unlinkSync(destPath);
        return downloadBinary(res.headers.location, destPath).then(resolve);
      }
      res.pipe(file);
      file.on('finish', () => { file.close(); resolve(true); });
    }).on('error', () => { try { file.close(); fs.unlinkSync(destPath); } catch(e){} resolve(false); });
  });
}

async function main() {
  const products = JSON.parse(fs.readFileSync(PRODUCTS_PATH, 'utf8'));
  const emsProducts = products.filter(p => p.handle.startsWith('ems-'));

  // Track image URL per slug to reuse for variant products sharing same page
  const slugImageCache = {};

  let downloaded = 0;
  const failed = [];

  for (const product of emsProducts) {
    const model = product.mfrModel;
    const slug = MODEL_SLUG_MAP[model];

    if (!slug) {
      console.warn(`⚠️  No slug mapped for: ${model} (${product.handle})`);
      failed.push({ handle: product.handle, reason: 'No slug mapping' });
      continue;
    }

    let imageUrl = slugImageCache[slug];

    if (!imageUrl) {
      const pageUrl = `https://emskontrol.com/en/urun/${slug}/`;
      try {
        const { status, data } = await fetchWithRedirects(pageUrl);
        if (status !== 200) {
          console.warn(`⚠️  HTTP ${status} for ${pageUrl}`);
          failed.push({ handle: product.handle, reason: `HTTP ${status}` });
          continue;
        }
        imageUrl = getBestImageFromHtml(data);
        if (imageUrl) slugImageCache[slug] = imageUrl;
      } catch (e) {
        console.error(`❌ Fetch error for ${pageUrl}: ${e.message}`);
        failed.push({ handle: product.handle, reason: e.message });
        continue;
      }
    }

    if (!imageUrl) {
      console.warn(`❌ No image found on page for: ${model}`);
      failed.push({ handle: product.handle, reason: 'No image on page' });
      continue;
    }

    const ext = imageUrl.split('.').pop().split('?')[0].toLowerCase();
    const baseName = product.handle.replace('ems-', '');
    const fileName = `${baseName}.${ext}`;
    const destPath = path.join(EMS_MEDIA_DIR, fileName);
    const relativePath = `/cn-media/products/ems/${fileName}`;

    // Remove old SVG placeholder
    ['svg', 'jpg', 'jpeg', 'png', 'webp'].forEach(oldExt => {
      const oldPath = path.join(EMS_MEDIA_DIR, `${baseName}.${oldExt}`);
      if (oldExt !== ext && fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    });

    const success = await downloadBinary(imageUrl, destPath);
    if (success) {
      product.images = [relativePath];
      product.image = relativePath;
      downloaded++;
      console.log(`✅ ${model} → ${fileName}`);
    } else {
      console.error(`❌ Download failed: ${imageUrl}`);
      failed.push({ handle: product.handle, reason: 'Download failed' });
    }

    await new Promise(r => setTimeout(r, 250));
  }

  fs.writeFileSync(PRODUCTS_PATH, JSON.stringify(products, null, 2), 'utf8');

  console.log(`\n📦 Downloaded: ${downloaded} / ${emsProducts.length}`);
  if (failed.length) {
    console.log(`❌ Failed (${failed.length}):`);
    failed.forEach(f => console.log(`   ${f.handle} — ${f.reason}`));
  }
}

main().catch(console.error);
