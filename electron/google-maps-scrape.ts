import * as cheerio from "cheerio";
import puppeteerExtra from "puppeteer-extra";
import stealthPlugin from "puppeteer-extra-plugin-stealth";

interface Business {
  index: number;
  storeName: string;
  placeId: string;
  address: string;
  category: string;
  phone?: string;
  googleUrl: string;
  bizWebsite?: string;
  stars: number | null;
  numberOfReviews: number | null;
}

export default async function searchGoogleMaps(query: string): Promise<Business[]> {
  try {
    puppeteerExtra.use(stealthPlugin());

    const browser = await puppeteerExtra.launch({
      headless: false,
      executablePath: "", // Ganti dengan path Chrome yang benar jika diperlukan
    });

    const page = await browser.newPage();

    try {
      await page.goto(`https://www.google.com/maps/search/${query.split(" ").join("+")}`);
    } catch (error) {
      console.log("Error saat membuka halaman:", error);
    }

    async function autoScroll(page: any): Promise<void> {
      await page.evaluate(async () => {
        const wrapper: HTMLElement | null = document.querySelector('div[role="feed"]');

        if (!wrapper) return;

        await new Promise<void>((resolve) => {
          let totalHeight = 0;
          let distance = 1000;
          const scrollDelay = 3000;

          const timer = setInterval(async () => {
            const scrollHeightBefore = wrapper.scrollHeight;
            wrapper.scrollBy(0, distance);
            totalHeight += distance;

            if (totalHeight >= scrollHeightBefore) {
              totalHeight = 0;
              await new Promise((res) => setTimeout(res, scrollDelay));

              const scrollHeightAfter = wrapper.scrollHeight;

              if (scrollHeightAfter > scrollHeightBefore) {
                return;
              } else {
                clearInterval(timer);
                resolve();
              }
            }
          }, 700);
        });
      });
    }

    await autoScroll(page);

    const html: string = await page.content();
    const pages: any[] = await browser.pages();
    await Promise.all(pages.map((p) => p.close()));

    await browser.close();
    console.log("Browser ditutup");

    // ✅ FIX: Parsing data dengan cheerio
    const $ = cheerio.load(html);
    const aTags = $("a");
    const parents: cheerio.Cheerio<cheerio.Element>[] = [];


    // ✅ FIX: Tambahkan tipe eksplisit pada parameter `_` dan `el`
    aTags.each((_: number, el: cheerio.Element) => {
      const href = $(el).attr("href");
      if (href && href.includes("/maps/place/")) {
        parents.push($(el).parent());
      }
    });

    console.log("Jumlah hasil ditemukan:", parents.length);

    const businesses: Business[] = [];
    let index = 0;

    parents.forEach((parent) => {
      const url = parent.find("a").attr("href");
      const website = parent.find('a[data-value="Website"]').attr("href");
      const storeName = parent.find("div.fontHeadlineSmall").text();
      const ratingText = parent.find("span.fontBodyMedium > span").attr("aria-label");

      const bodyDiv = parent.find("div.fontBodyMedium").first();
      const children = bodyDiv.children();
      const lastChild = children.last();
      const firstOfLast = lastChild.children().first();
      const lastOfLast = lastChild.children().last();
      index++;

      businesses.push({
        index,
        storeName,
        placeId: url ? `ChI${url.split("?")[0].split("ChI")[1]}` : "",
        address: firstOfLast?.text()?.split("·")[1]?.trim() || "",
        category: firstOfLast?.text()?.split("·")[0]?.trim() || "",
        phone: lastOfLast?.text()?.split("·")[1]?.trim(),
        googleUrl: url || "",
        bizWebsite: website,
        stars: ratingText ? parseFloat(ratingText.split(" ")[0]) : null,
        numberOfReviews: ratingText ? parseInt(ratingText.replace(/\D/g, ""), 10) : null,
      });
    });

    businesses.sort((a, b) => (b.stars || 0) - (a.stars || 0));

    return businesses;
  } catch (error) {
    console.log("Error saat scraping Google Maps:", error);
    return [];
  }
}
