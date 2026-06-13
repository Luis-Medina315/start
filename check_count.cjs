const { PrismaClient } = require("@prisma/client");
const p = new PrismaClient();
p.product.count().then((c) => {
  console.log("PRODUCT_COUNT=" + c);
  return p.$disconnect();
});
