
// USAGE:
// Copy + paste this script into the console of an Amazon order history page
// You will have to scan each page manually

const HEADER = `ORDER_NUMBER,DATE_PLACED,TOTAL,ITEMS_TOTAL,ITEM_NAMES,INVOICE`

let content = HEADER + ''

const querySelectors = {
  orderCard: '.order-card',
}

function addOrder(orderNumber, datePlaced, total, itemTotal, itemNames, invoice) {
  content += `\n${orderNumber},${datePlaced},${total},${itemTotal},${itemNames},${invoice}`
}

function formatDate(dateStr) {
  // Parse the date string into a Date object
  const date = new Date(dateStr);

  // Extract day, month, and year
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Months are zero-based in JavaScript
  const year = date.getFullYear();

  // Format as 'DD-MM-YYYY'
  return `${day}-${month}-${year}`;
}
const waitForElementToExist = (selector, time = 250) => {
  return new Promise(accept => {
    setInterval(() => {
      const element = document.querySelector(selector)
      if (element) {
        accept(element)
      }
    }, time)
  })
}

async function scanCurrentPage() {
  await waitForElementToExist(querySelectors.orderCard)
  const orderCards = document
    .querySelectorAll(
      querySelectors.orderCard
    )

  orderCards.forEach(orderCard => {
    const orderNumber = orderCard.querySelector('.yohtmlc-order-id').innerText
    const datePlaced = orderCard.querySelector('.a-column:nth-child(1) span.a-size-base.a-color-secondary').innerText
    const total = orderCard.querySelector('.a-column:nth-child(2) span.a-size-base.a-color-secondary').innerText
    const invoice = orderCard.querySelector('.order-header .a-link-normal').href

    const items = orderCard.querySelectorAll('.delivery-box .yohtmlc-product-title')

    const itemTotal = items.length
    const itemNames = [ ...items ]
      .map(item => item.innerText?.replaceAll(',','')?.substring(0, 33) + '...')
      .join(',')

    addOrder(
      orderNumber,
      formatDate(datePlaced),
      total.replaceAll('$', ''),
      itemTotal,
      itemNames,
      invoice
    )
  })
}

function goToPage(number) {
  document.querySelector(`.a-pagination li:nth-child(${number}) a`).click()
}

async function main() {
  await scanCurrentPage()
  // Going to another page doesn't work because the page is reloaded
  console.log(content)
}

main()
