import axios from "axios";
import { load } from "cheerio";

interface Product {
  pid: string;
  sku: string;
  productName: string;
  fullName: string;
  variant: string;
  stock: number;
  unit: string;
  imageUrl: string | null;
}

interface ProductImage {
  id: string;
  productname?: string;
  imageurl?: string;
}

function clean(text: string) {
  return String(text || "")
    .replace(/\s+/g, " ")
    .trim();
}

function parseName(fullName: string) {
  const lastOpen = fullName.lastIndexOf("(");
  const lastClose = fullName.lastIndexOf(")");

  if (
    lastOpen !== -1 &&
    lastClose === fullName.length - 1 &&
    lastOpen < lastClose
  ) {
    return {
      baseName: clean(fullName.slice(0, lastOpen)),
      variant: clean(fullName.slice(lastOpen + 1, lastClose)),
    };
  }

  return {
    baseName: fullName,
    variant: "",
  };
}

function extractProducts(html: string): Product[] {
  const $ = load(html);
  const products: Product[] = [];

  $(".product-card").each((_: number, card): void => {
    const $card = $(card);
    const imgDiv = $card.find("[class*='prodimg-']").first();
    const className = imgDiv.attr("class") || "";
    const pidMatch = className.match(/prodimg-(\d+)/);

    if (!pidMatch) return;

    const pid = pidMatch[1];
    const fullName = clean($card.find("h3.headline").text());
    const productNameBlocks = $card.find(".body .dropshipgridproductname");
    const sku = clean(productNameBlocks.eq(1).text());
    const badgeText = clean($card.find(".z-badge").text());

    const stockMatch = badgeText.match(/พร้อมขาย:\s*([\d,]+)/);
    const stock = stockMatch ? Number(stockMatch[1].replace(/,/g, "")) : 0;

    const unitMatch = badgeText.match(/พร้อมขาย:\s*[\d,]+\s*(.*)$/);
    const unit = unitMatch ? clean(unitMatch[1]) : "";

    const { baseName, variant } = parseName(fullName);

    products.push({
      pid,
      sku,
      productName: baseName,
      fullName,
      variant,
      stock,
      unit,
      imageUrl: null,
    });
  });

  return products;
}

async function fetchMainPage(
  page: number,
  mid: string,
  cs: string,
  cookie: string,
) {
  const url = `https://share.zortout.com/dp${mid}/Main?mid=${mid}&cid=0&csid=0&page=${page}&cs=${cs}&isBundlesInt=0`;

  const res = await axios.get(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
      Cookie: cookie,
    },
  });

  return res.data;
}

async function fetchQuickSearchPage(
  page: number,
  mid: string,
  cs: string,
  cookie: string,
) {
  const res = await axios.post(
    "https://share.zortout.com/Dropship/doQuickSearchProduct",
    new URLSearchParams({
      categoryid: "0",
      subcategoryid: "0",
      merchantid: mid,
      cs: cs,
      searchtext: "",
      isBundleInt: "0",
      page: String(page),
    }),
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
        Cookie: cookie,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    },
  );

  return res.data;
}

export async function scrapeProducts(
  mid: string,
  cs: string,
  cookie: string,
  maxPage: number = 100,
): Promise<Product[]> {
  const allProducts: Product[] = [];
  let page = 1;

  while (page <= maxPage) {
    let html = await fetchMainPage(page, mid, cs, cookie);
    let products = extractProducts(html);

    if (products.length === 0) {
      html = await fetchQuickSearchPage(page, mid, cs, cookie);
      products = extractProducts(html);
    }

    if (products.length === 0) {
      console.log(`Stop at page ${page}, no products.`);
      break;
    }

    allProducts.push(...products);

    if (products.length < 100) {
      console.log(
        `Stop at page ${page}, last page has ${products.length} products.`,
      );
      break;
    }

    page++;
  }

  return allProducts;
}

async function fetchImages(pids: string[], mid: string, cookie: string) {
  if (pids.length === 0) return [];

  const res = await axios.post(
    "https://share.zortout.com/Home/DisplayListProductImageNoAuthen",
    {
      pid: pids.map(String),
      m: Number(mid),
    },
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:151.0) Gecko/20100101 Firefox/151.0",
        Cookie: cookie,
        "Content-Type": "application/json",
      },
    },
  );

  return res.data.productimages || [];
}

function chunkArray<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}

export async function enrichProductsWithImages(
  products: Product[],
  mid: string,
  cookie: string,
): Promise<Product[]> {
  const pids = products.map((p) => p.pid);
  const chunks = chunkArray(pids, 100);
  const imageMap = new Map<string, ProductImage>();

  for (const chunk of chunks) {
    const images = await fetchImages(chunk, mid, cookie);
    images.forEach((img: ProductImage) => {
      imageMap.set(String(img.id), img);
    });
  }

  return products.map((p) => {
    const img = imageMap.get(String(p.pid));
    return {
      ...p,
      productName: img?.productname || p.productName,
      imageUrl: img?.imageurl || null,
    };
  });
}
