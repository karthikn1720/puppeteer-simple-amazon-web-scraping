// load puppeteer
const puppeteer = require('puppeteer');
const ExcelJS = require("exceljs");
const domain = "https://www.amazon.in";

const testFn = async () => {
  try {
    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.readFile("./data.xlsx");
    // create a new browser instance
    const browser = await puppeteer.launch({
      headless: false,
      defaultViewport: null,
    });

    // create a page inside the browser;
    const page = await browser.newPage();

    // navigate to a website and set the viewport
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(domain, {
      timeout: 3000000
    });

    // search and wait the product list
    await page.waitForSelector('#twotabsearchtextbox')
    await page.type('#twotabsearchtextbox', 'phone');
    await page.click('#nav-search-submit-button');
    await page.waitForTimeout(1000)
    // const filterButton = await page.$x('//*[@id="n/1389432031"]/span/a')

    // console.log(filterButton)

    // await page.waitForTimeout(1000)
    // filterButton[0].click()
    // console.log(filter)
    await page.waitForTimeout(1000)

    const dat = await evalFn(page, workbook)

    // close the browser
    // dat?.forEach((product)=> {
    //   worksheet.addRow([product?.name, product?.url, product?.price])
    // })
    // await workbook.xlsx.writeFile("./test2.xlsx");
    await browser.close();
  } catch (error) {
    // display errors
    console.log(error)
  }
};


const evalFn = async (page, workbook) => {
  const worksheet = await workbook.getWorksheet("Sheet1")
  await page.waitForSelector('.s-image');

  // await page.evaluate(async () => {
  //   document.querySelector('div[data-cy="title-recipe"] > h2 > a').click()
  // })

  // await page.waitForTimeout(5000)

  // return;

  const products = await page.evaluate(
    async () => {
      return Array.from(document.querySelectorAll('.s-result-item')).map(link => {
          return {
            name: link.querySelector('div[data-cy="title-recipe"] > h2 > a > span')?.innerHTML,
            url: link.querySelector('div[data-cy="title-recipe"] > h2 > a')?.href,
            price: parseInt(link.querySelector(".a-price-whole")?.textContent.replace(/[,.]/g, '')),
          };
      });
    }
  );

  products?.forEach((product)=> {
    worksheet.addRow([product?.name, product?.url, product?.price])
  })
  await workbook.xlsx.writeFile("./data.xlsx");


  // productsArray = [...productsArray, ...products]


  // console.log(products);

  
  await page.waitForSelector('.s-pagination-next')
  const isNextPageDisabled = await page.evaluate(
    async () => {
      console.log(document.querySelector(".s-pagination-next.s-pagination-disabled"))
    if(document.querySelector(".s-pagination-next.s-pagination-disabled")) {
      return true
      }
      return false
    }
  );
 
  if(isNextPageDisabled) {
    return products
  }
  await page.click('.s-pagination-next')
  // await evalFn(page, productsArray);
  return [...await evalFn(page, workbook), ...products]
}




testFn()
